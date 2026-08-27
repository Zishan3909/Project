"""
TourGuard AI — ML Anomaly Detector

IsolationForest-based anomaly detection for tourist telemetry data.
Trained on normal trajectory patterns from the Shillong → Cherrapunji corridor.
"""

from __future__ import annotations

import os
import logging
from typing import Literal

import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler

logger = logging.getLogger(__name__)

# ──────────────────────────────────────────────
# Module-level singletons (fitted on startup)
# ──────────────────────────────────────────────

_scaler: StandardScaler | None = None
_model: IsolationForest | None = None
_is_trained: bool = False

FEATURE_COLUMNS = [
    "latitude",
    "longitude",
    "speed_kmh",
    "time_of_day",
    "distance_from_corridor",
]


def train_model(csv_path: str | None = None) -> None:
    """
    Train the IsolationForest on normal telemetry patterns.

    Args:
        csv_path: Path to the CSV dataset. If None, uses the default
                  ``backend/data/tourist_telemetry.csv``.
    """
    global _scaler, _model, _is_trained

    if csv_path is None:
        # Resolve relative to this file's location
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        csv_path = os.path.join(base_dir, "data", "tourist_telemetry.csv")

    logger.info("Loading training data from %s", csv_path)
    df = pd.read_csv(csv_path)

    # Train only on normal (non-anomalous) data
    df_normal = df[df["is_anomaly"] == 0]
    logger.info(
        "Training set: %d normal rows (excluded %d anomalies)",
        len(df_normal),
        len(df) - len(df_normal),
    )

    X_train = df_normal[FEATURE_COLUMNS].values

    # Fit scaler
    _scaler = StandardScaler()
    X_scaled = _scaler.fit_transform(X_train)

    # Fit IsolationForest
    _model = IsolationForest(
        n_estimators=200,
        contamination=0.05,
        random_state=42,
        n_jobs=-1,
    )
    _model.fit(X_scaled)
    _is_trained = True

    logger.info("IsolationForest model trained successfully (n_estimators=200, contamination=0.05)")


def _normalize_score(raw_score: float) -> float:
    """
    Convert IsolationForest's decision_function output (typically in
    [-0.5, 0.5]) to a 0.0–1.0 anomaly score where higher = riskier.

    The decision_function returns negative values for anomalies and
    positive values for normal points.
    """
    # Invert: anomalies have negative scores, we want them high
    inverted = -raw_score

    # Shift and clamp to [0, 1]
    # Typical range is roughly [-0.3, 0.3], map to [0, 1]
    normalized = (inverted + 0.3) / 0.6
    return float(np.clip(normalized, 0.0, 1.0))


def _severity_from_score(
    anomaly_score: float,
    is_anomaly: bool,
) -> Literal["LOW", "MEDIUM", "CRITICAL"]:
    """Map anomaly score to severity level."""
    if not is_anomaly:
        return "LOW"
    if anomaly_score >= 0.7:
        return "CRITICAL"
    if anomaly_score >= 0.4:
        return "MEDIUM"
    return "LOW"


def evaluate_telemetry(
    lat: float,
    lon: float,
    speed: float,
    hour: int,
    corridor_distance: float,
) -> dict:
    """
    Run inference on a single telemetry reading.

    Args:
        lat:               Latitude of the GPS ping.
        lon:               Longitude of the GPS ping.
        speed:             Current speed in km/h.
        hour:              Hour of day (0–23).
        corridor_distance: Distance from the corridor centerline in meters.

    Returns:
        A dict with:
        - ``anomaly_score``: float (0.0–1.0, higher = riskier)
        - ``is_anomaly``: bool
        - ``severity``: ``"LOW"`` | ``"MEDIUM"`` | ``"CRITICAL"``

    Raises:
        RuntimeError: If the model has not been trained yet.
    """
    if not _is_trained or _scaler is None or _model is None:
        raise RuntimeError(
            "Anomaly model is not trained. Call train_model() at startup."
        )

    features = np.array([[lat, lon, speed, hour, corridor_distance]])
    X_scaled = _scaler.transform(features)

    # IsolationForest prediction: 1 = normal, -1 = anomaly
    prediction = _model.predict(X_scaled)[0]
    raw_score = _model.decision_function(X_scaled)[0]

    anomaly_score = _normalize_score(raw_score)
    is_anomaly = prediction == -1
    severity = _severity_from_score(anomaly_score, is_anomaly)

    return {
        "anomaly_score": round(anomaly_score, 4),
        "is_anomaly": is_anomaly,
        "severity": severity,
    }
