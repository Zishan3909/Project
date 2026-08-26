"""
TourGuard AI — Mock Blockchain Identity Service

Simulates on-chain identity verification using SHA-256 cryptographic hashes.
Sensitive tourist KYC data is kept off-chain (in-memory only).
"""

from __future__ import annotations

import hashlib
import json
import uuid
from datetime import datetime, timedelta, timezone


def generate_identity_hash(tourist_data: dict) -> str:
    """
    Generate a SHA-256 hash simulating an on-chain identity registration
    transaction.

    Only non-sensitive fields are included in the hash payload to simulate
    off-chain KYC storage. The masked document ID is included — the raw
    document ID is never part of the hash.

    Args:
        tourist_data: Tourist registration payload.

    Returns:
        A ``0x``-prefixed SHA-256 hex digest string.
    """
    # Build a canonical payload — only fields that would go on-chain
    on_chain_payload = {
        "nationality": tourist_data.get("nationality", ""),
        "doc_type": tourist_data.get("doc_type", ""),
        "doc_id_masked": tourist_data.get("doc_id_masked", ""),
        "itinerary_route": tourist_data.get("itinerary_route", []),
        "duration_days": tourist_data.get("duration_days", 0),
        "registration_nonce": uuid.uuid4().hex,  # uniqueness per registration
    }

    # Canonical JSON serialization (sorted keys, no whitespace)
    canonical = json.dumps(on_chain_payload, sort_keys=True, separators=(",", ":"))
    digest = hashlib.sha256(canonical.encode("utf-8")).hexdigest()

    return f"0x{digest}"


def issue_digital_id(tourist_id: str, duration_days: int) -> dict:
    """
    Issue a temporary digital tourist ID with validity timestamps.

    Args:
        tourist_id:    The UUIDv4 identifier of the registered tourist.
        duration_days: How many days the digital ID remains valid.

    Returns:
        A dict with ``digital_id``, ``issued_at``, and ``expires_at``.
    """
    now = datetime.now(timezone.utc)
    short_id = tourist_id.split("-")[0].upper()

    return {
        "digital_id": f"TGID-{short_id}",
        "issued_at": now.isoformat(),
        "expires_at": (now + timedelta(days=duration_days)).isoformat(),
    }
