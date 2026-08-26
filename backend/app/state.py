"""
TourGuard AI — In-Memory State Stores

Simple dict-based stores for tourists, alerts, and e-FIRs.
Replace with a real database in production.
"""

from __future__ import annotations

# tourist_id -> full registration record (including KYC, blockchain hash, etc.)
tourists: dict[str, dict] = {}

# alert_id -> alert record (coordinates, severity, trigger_reason, is_active flag)
alerts: dict[str, dict] = {}

# efir_id -> e-FIR record (incident summary, PDF bytes, status)
efirs: dict[str, dict] = {}
