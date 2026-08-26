"""
TourGuard AI — API Endpoints

All four routes as specified in docs/API_CONTRACTS.md:
    POST /api/v1/tourist/register
    POST /api/v1/telemetry/ping
    GET  /api/v1/alerts/active
    POST /api/v1/efir/generate
"""

from __future__ import annotations

import base64
import uuid
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, HTTPException, Query
from shapely.geometry import LineString, Point

from app import state
from app.ml import anomaly_detector
from app.schemas import (
    AlertOut,
    AlertsActiveResponse,
    EFIRGenerateRequest,
    EFIRGenerateResponse,
    EFIRLocation,
    EFIROut,
    ErrorResponse,
    TelemetryPingRequest,
    TelemetryPingResponse,
    TouristRegisterRequest,
    TouristRegisterResponse,
)
from app.services import blockchain_id
from app.services.efir_pdf import generate_efir_pdf

router = APIRouter(prefix="/api/v1")

# ──────────────────────────────────────────────
# Corridor geometry for distance calculations
# ──────────────────────────────────────────────

_ROUTE_WAYPOINTS = [
    (25.578, 91.893),
    (25.540, 91.870),
    (25.490, 91.850),
    (25.400, 91.800),
    (25.310, 91.750),
    (25.270, 91.732),
]
_CORRIDOR_LINE = LineString(_ROUTE_WAYPOINTS)
_DEG_TO_METERS = 111_320.0


def _corridor_distance_meters(lat: float, lon: float) -> float:
    """Approximate distance in meters from a point to the corridor."""
    point = Point(lat, lon)
    deg_dist = _CORRIDOR_LINE.distance(point)
    return deg_dist * _DEG_TO_METERS


def _determine_trigger_reason(speed: float, corridor_dist: float, hour: int) -> str:
    """Build a human-readable trigger reason from anomaly features."""
    reasons: list[str] = []
    if speed > 80:
        reasons.append(f"Speed anomaly detected ({speed:.1f} km/h)")
    if corridor_dist > 300:
        reasons.append(f"Geofence breach — {corridor_dist:.0f}m from designated corridor")
    if speed < 2 and hour in (22, 23, 0, 1, 2, 3, 4):
        reasons.append("Prolonged stop in danger zone during nighttime")
    if not reasons:
        reasons.append("Anomalous telemetry pattern detected by ML model")
    return ". ".join(reasons)


# ──────────────────────────────────────────────
# POST /api/v1/tourist/register
# ──────────────────────────────────────────────

@router.post(
    "/tourist/register",
    response_model=TouristRegisterResponse,
    status_code=201,
    responses={
        400: {"model": ErrorResponse},
        409: {"model": ErrorResponse},
    },
)
async def register_tourist(req: TouristRegisterRequest):
    """Register a new tourist and issue a blockchain identity hash."""

    # Check for duplicate doc_id_masked
    for existing in state.tourists.values():
        if existing.get("doc_id_masked") == req.doc_id_masked:
            raise HTTPException(
                status_code=409,
                detail={
                    "error": {
                        "code": "DUPLICATE_ENTRY",
                        "message": f"Tourist with document '{req.doc_id_masked}' is already registered.",
                    }
                },
            )

    tourist_id = str(uuid.uuid4())

    # Generate blockchain hash (off-chain KYC: name stays in memory only)
    chain_hash = blockchain_id.generate_identity_hash(req.model_dump())

    # Issue digital ID
    digital_id_info = blockchain_id.issue_digital_id(tourist_id, req.duration_days)

    # Initial safety score
    safety_score = 85.0

    # Store tourist record (KYC off-chain, only in memory)
    state.tourists[tourist_id] = {
        "tourist_id": tourist_id,
        "name": req.name,
        "nationality": req.nationality,
        "doc_type": req.doc_type,
        "doc_id_masked": req.doc_id_masked,
        "itinerary_route": req.itinerary_route,
        "duration_days": req.duration_days,
        "blockchain_hash": chain_hash,
        "safety_score": safety_score,
        "digital_id": digital_id_info,
        "registered_at": datetime.now(timezone.utc).isoformat(),
    }

    return TouristRegisterResponse(
        tourist_id=tourist_id,
        blockchain_hash=chain_hash,
        safety_score=safety_score,
    )


# ──────────────────────────────────────────────
# POST /api/v1/telemetry/ping
# ──────────────────────────────────────────────

@router.post(
    "/telemetry/ping",
    response_model=TelemetryPingResponse,
    responses={
        400: {"model": ErrorResponse},
        404: {"model": ErrorResponse},
    },
)
async def telemetry_ping(req: TelemetryPingRequest):
    """Ingest a telemetry ping, run anomaly detection, and return risk assessment."""

    # Verify tourist exists
    if req.tourist_id not in state.tourists:
        raise HTTPException(
            status_code=404,
            detail={
                "error": {
                    "code": "NOT_FOUND",
                    "message": f"Tourist '{req.tourist_id}' not found.",
                }
            },
        )

    # Compute corridor distance
    corridor_dist = _corridor_distance_meters(req.latitude, req.longitude)

    # Run ML inference
    hour = req.timestamp.hour
    ml_result = anomaly_detector.evaluate_telemetry(
        lat=req.latitude,
        lon=req.longitude,
        speed=req.speed_kmh,
        hour=hour,
        corridor_distance=corridor_dist,
    )

    anomaly_score = ml_result["anomaly_score"]
    severity = ml_result["severity"]

    # Map internal severity to API risk_level
    severity_to_risk = {
        "LOW": "low",
        "MEDIUM": "medium",
        "CRITICAL": "critical",
    }
    risk_level = severity_to_risk.get(severity, "low")

    # Auto-create alert if CRITICAL
    alert_triggered = False
    if severity == "CRITICAL":
        alert_triggered = True
        alert_id = str(uuid.uuid4())
        trigger_reason = _determine_trigger_reason(req.speed_kmh, corridor_dist, hour)
        now_iso = datetime.now(timezone.utc).isoformat()

        state.alerts[alert_id] = {
            "alert_id": alert_id,
            "tourist_id": req.tourist_id,
            "latitude": req.latitude,
            "longitude": req.longitude,
            "severity": risk_level,
            "trigger_reason": trigger_reason,
            "triggered_at": now_iso,
            "is_active": True,
        }

    return TelemetryPingResponse(
        anomaly_score=anomaly_score,
        risk_level=risk_level,
        alert_triggered=alert_triggered,
    )


# ──────────────────────────────────────────────
# GET /api/v1/alerts/active
# ──────────────────────────────────────────────

@router.get(
    "/alerts/active",
    response_model=AlertsActiveResponse,
    responses={
        400: {"model": ErrorResponse},
    },
)
async def get_active_alerts(
    severity: Optional[str] = Query(None, description="Filter: low, medium, high, critical"),
    limit: int = Query(50, ge=1, le=200, description="Max results per page"),
    cursor: Optional[str] = Query(None, description="Pagination cursor"),
):
    """Retrieve all currently active safety alerts."""

    # Validate severity if provided
    valid_severities = {"low", "medium", "high", "critical"}
    if severity is not None and severity not in valid_severities:
        raise HTTPException(
            status_code=400,
            detail={
                "error": {
                    "code": "VALIDATION_ERROR",
                    "message": f"severity must be one of: {', '.join(sorted(valid_severities))}",
                }
            },
        )

    # Filter active alerts
    active = [a for a in state.alerts.values() if a.get("is_active", True)]

    # Filter by severity
    if severity is not None:
        active = [a for a in active if a.get("severity") == severity]

    # Sort by triggered_at descending
    active.sort(key=lambda a: a.get("triggered_at", ""), reverse=True)

    # Cursor-based pagination (cursor = index offset encoded as string)
    start_idx = 0
    if cursor is not None:
        try:
            start_idx = int(cursor)
        except ValueError:
            start_idx = 0

    page = active[start_idx : start_idx + limit]
    next_cursor = None
    if start_idx + limit < len(active):
        next_cursor = str(start_idx + limit)

    alert_items = [
        AlertOut(
            alert_id=a["alert_id"],
            tourist_id=a["tourist_id"],
            latitude=a["latitude"],
            longitude=a["longitude"],
            severity=a["severity"],
            trigger_reason=a["trigger_reason"],
            triggered_at=a["triggered_at"],
        )
        for a in page
    ]

    return AlertsActiveResponse(alerts=alert_items, next_cursor=next_cursor)


# ──────────────────────────────────────────────
# POST /api/v1/efir/generate
# ──────────────────────────────────────────────

@router.post(
    "/efir/generate",
    response_model=EFIRGenerateResponse,
    status_code=201,
    responses={
        400: {"model": ErrorResponse},
        404: {"model": ErrorResponse},
    },
)
async def generate_efir(req: EFIRGenerateRequest):
    """Generate an electronic First Information Report for a safety incident."""

    # Validate tourist exists
    tourist = state.tourists.get(req.tourist_id)
    if tourist is None:
        raise HTTPException(
            status_code=404,
            detail={
                "error": {
                    "code": "NOT_FOUND",
                    "message": f"Tourist '{req.tourist_id}' not found.",
                }
            },
        )

    # Validate alert exists
    alert = state.alerts.get(req.alert_id)
    if alert is None:
        raise HTTPException(
            status_code=404,
            detail={
                "error": {
                    "code": "NOT_FOUND",
                    "message": f"Alert '{req.alert_id}' not found.",
                }
            },
        )

    efir_id = str(uuid.uuid4())
    now_iso = datetime.now(timezone.utc).isoformat()

    # Build incident narrative
    incident_summary = (
        f"Tourist {tourist['name']} (nationality: {tourist['nationality']}) "
        f"triggered a safety alert at coordinates "
        f"{alert['latitude']:.4f}°N, {alert['longitude']:.4f}°E. "
        f"Trigger reason: {alert['trigger_reason']}. "
        f"Alert severity: {alert['severity']}. "
        f"Automatic e-FIR generated and escalated for review."
    )

    severity = alert["severity"]
    lat = alert["latitude"]
    lon = alert["longitude"]

    # Generate PDF
    pdf_bytes = generate_efir_pdf(
        efir_id=efir_id,
        tourist_name=tourist["name"],
        nationality=tourist["nationality"],
        tourist_id=req.tourist_id,
        alert_id=req.alert_id,
        severity=severity,
        latitude=lat,
        longitude=lon,
        trigger_reason=alert["trigger_reason"],
        incident_summary=incident_summary,
        generated_at=now_iso,
    )
    pdf_b64 = base64.b64encode(pdf_bytes).decode("utf-8")

    # Store e-FIR
    efir_record = {
        "efir_id": efir_id,
        "tourist_id": req.tourist_id,
        "alert_id": req.alert_id,
        "incident_summary": incident_summary,
        "severity": severity,
        "location": {"latitude": lat, "longitude": lon},
        "generated_at": now_iso,
        "status": "draft",
    }
    state.efirs[efir_id] = efir_record

    return EFIRGenerateResponse(
        efir=EFIROut(
            efir_id=efir_id,
            tourist_id=req.tourist_id,
            alert_id=req.alert_id,
            incident_summary=incident_summary,
            severity=severity,
            location=EFIRLocation(latitude=lat, longitude=lon),
            generated_at=now_iso,
            status="draft",
        ),
        pdf_base64=pdf_b64,
    )
