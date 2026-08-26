"""
TourGuard AI — Pydantic Request / Response Schemas

Single source of truth for all API data models.
Matches docs/API_CONTRACTS.md exactly.
"""

from __future__ import annotations

from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, Field


# ──────────────────────────────────────────────
# Error envelope (shared across all endpoints)
# ──────────────────────────────────────────────

class ErrorDetail(BaseModel):
    code: str = Field(..., examples=["VALIDATION_ERROR"])
    message: str = Field(..., examples=["Field 'nationality' must be a valid ISO 3166-1 alpha-2 code."])


class ErrorResponse(BaseModel):
    error: ErrorDetail


# ──────────────────────────────────────────────
# POST /api/v1/tourist/register
# ──────────────────────────────────────────────

class TouristRegisterRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=120, examples=["Amelia Thornton"])
    nationality: str = Field(..., min_length=2, max_length=2, examples=["GB"])
    doc_type: Literal["passport", "national_id", "visa"] = Field(..., examples=["passport"])
    doc_id_masked: str = Field(..., min_length=1, examples=["*****6789"])
    itinerary_route: list[str] = Field(..., min_length=1, examples=[["Delhi", "Agra", "Jaipur"]])
    duration_days: int = Field(..., ge=1, le=365, examples=[14])


class TouristRegisterResponse(BaseModel):
    tourist_id: str = Field(..., examples=["c3d1f8a2-7b4e-4e6a-9f1d-2a3b4c5d6e7f"])
    blockchain_hash: str = Field(..., examples=["0xab12cd34ef5678901234567890abcdef1234567890abcdef1234567890abcdef"])
    safety_score: float = Field(..., ge=0.0, le=100.0, examples=[82.5])


# ──────────────────────────────────────────────
# POST /api/v1/telemetry/ping
# ──────────────────────────────────────────────

class TelemetryPingRequest(BaseModel):
    tourist_id: str = Field(..., examples=["c3d1f8a2-7b4e-4e6a-9f1d-2a3b4c5d6e7f"])
    latitude: float = Field(..., ge=-90.0, le=90.0, examples=[28.6139])
    longitude: float = Field(..., ge=-180.0, le=180.0, examples=[77.2090])
    speed_kmh: float = Field(..., ge=0.0, examples=[45.2])
    battery_pct: int = Field(..., ge=0, le=100, examples=[72])
    timestamp: datetime = Field(..., examples=["2026-08-23T14:08:34Z"])


class TelemetryPingResponse(BaseModel):
    anomaly_score: float = Field(..., ge=0.0, le=1.0, examples=[0.15])
    risk_level: Literal["low", "medium", "high", "critical"] = Field(..., examples=["low"])
    alert_triggered: bool = Field(..., examples=[False])


# ──────────────────────────────────────────────
# GET /api/v1/alerts/active
# ──────────────────────────────────────────────

class AlertOut(BaseModel):
    alert_id: str
    tourist_id: str
    latitude: float
    longitude: float
    severity: Literal["low", "medium", "high", "critical"]
    trigger_reason: str
    triggered_at: str  # ISO 8601


class AlertsActiveResponse(BaseModel):
    alerts: list[AlertOut]
    next_cursor: Optional[str] = None


# ──────────────────────────────────────────────
# POST /api/v1/efir/generate
# ──────────────────────────────────────────────

class EFIRGenerateRequest(BaseModel):
    tourist_id: str = Field(..., examples=["c3d1f8a2-7b4e-4e6a-9f1d-2a3b4c5d6e7f"])
    alert_id: str = Field(..., examples=["a1b2c3d4-e5f6-7890-abcd-ef1234567890"])


class EFIRLocation(BaseModel):
    latitude: float
    longitude: float


class EFIROut(BaseModel):
    efir_id: str
    tourist_id: str
    alert_id: str
    incident_summary: str
    severity: Literal["low", "medium", "high", "critical"]
    location: EFIRLocation
    generated_at: str  # ISO 8601
    status: Literal["draft", "submitted", "acknowledged"]


class EFIRGenerateResponse(BaseModel):
    efir: EFIROut
    pdf_base64: str
