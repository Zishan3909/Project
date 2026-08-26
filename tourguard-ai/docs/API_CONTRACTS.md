# TourGuard AI — API Contracts

> **Single Source of Truth** for all API request/response schemas.
> Version: `1.0.0` | Base URL: `/api/v1`

---

## Table of Contents

1. [POST /api/v1/tourist/register](#1-post-apiv1touristregister)
2. [POST /api/v1/telemetry/ping](#2-post-apiv1telemetryping)
3. [GET /api/v1/alerts/active](#3-get-apiv1alertsactive)
4. [POST /api/v1/efir/generate](#4-post-apiv1efirgenerate)

---

## Conventions

| Item              | Convention                                        |
| ----------------- | ------------------------------------------------- |
| Date/Time         | ISO 8601 UTC (`2026-08-23T14:08:34Z`)             |
| IDs               | UUIDv4                                            |
| Content-Type      | `application/json` (unless noted)                 |
| Auth Header       | `Authorization: Bearer <jwt>`                     |
| Pagination        | Cursor-based where applicable                     |
| Error Envelope    | `{ "error": { "code": string, "message": string } }` |

---

## 1. POST `/api/v1/tourist/register`

Register a new tourist in the system. A blockchain receipt hash and initial safety score are returned.

### Request

| Field             | Type     | Required | Constraints                              | Example                     |
| ----------------- | -------- | -------- | ---------------------------------------- | --------------------------- |
| `name`            | `string` | ✅       | 1–120 characters                         | `"Amelia Thornton"`         |
| `nationality`     | `string` | ✅       | ISO 3166-1 alpha-2 country code          | `"GB"`                      |
| `doc_type`        | `string` | ✅       | Enum: `passport`, `national_id`, `visa`  | `"passport"`                |
| `doc_id_masked`   | `string` | ✅       | Last 4 chars visible, rest masked (`*`)  | `"*****6789"`               |
| `itinerary_route` | `string[]`| ✅      | Array of location/city names, min 1 item | `["Delhi", "Agra", "Jaipur"]` |
| `duration_days`   | `integer`| ✅       | 1–365                                    | `14`                        |

```json
{
  "name": "Amelia Thornton",
  "nationality": "GB",
  "doc_type": "passport",
  "doc_id_masked": "*****6789",
  "itinerary_route": ["Delhi", "Agra", "Jaipur"],
  "duration_days": 14
}
```

### Response — `201 Created`

| Field             | Type     | Description                                   | Example                                      |
| ----------------- | -------- | --------------------------------------------- | -------------------------------------------- |
| `tourist_id`      | `string` | UUIDv4 identifier for the registered tourist  | `"c3d1f8a2-7b4e-4e6a-9f1d-2a3b4c5d6e7f"`   |
| `blockchain_hash` | `string` | SHA-256 hash of the on-chain registration tx  | `"0xab12cd34ef56..."`                        |
| `safety_score`    | `number` | Initial safety score (0.0–100.0)              | `82.5`                                       |

```json
{
  "tourist_id": "c3d1f8a2-7b4e-4e6a-9f1d-2a3b4c5d6e7f",
  "blockchain_hash": "0xab12cd34ef5678901234567890abcdef1234567890abcdef1234567890abcdef",
  "safety_score": 82.5
}
```

### Status Codes

| Code  | Meaning                                       |
| ----- | --------------------------------------------- |
| `201` | Tourist registered successfully               |
| `400` | Validation error (missing/invalid fields)     |
| `409` | Duplicate registration (same doc_id_masked)   |
| `500` | Internal server error                         |

---

## 2. POST `/api/v1/telemetry/ping`

Ingest a real-time telemetry ping from a tourist's device. The system runs anomaly detection and returns a risk assessment.

### Request

| Field         | Type      | Required | Constraints                          | Example                    |
| ------------- | --------- | -------- | ------------------------------------ | -------------------------- |
| `tourist_id`  | `string`  | ✅       | Valid UUIDv4                         | `"c3d1f8a2-7b4e-4e6a-9f1d-2a3b4c5d6e7f"` |
| `latitude`    | `number`  | ✅       | -90.0 to 90.0                        | `28.6139`                  |
| `longitude`   | `number`  | ✅       | -180.0 to 180.0                      | `77.2090`                  |
| `speed_kmh`   | `number`  | ✅       | ≥ 0.0                               | `45.2`                     |
| `battery_pct` | `integer` | ✅       | 0–100                               | `72`                       |
| `timestamp`   | `string`  | ✅       | ISO 8601 UTC                         | `"2026-08-23T14:08:34Z"`  |

```json
{
  "tourist_id": "c3d1f8a2-7b4e-4e6a-9f1d-2a3b4c5d6e7f",
  "latitude": 28.6139,
  "longitude": 77.2090,
  "speed_kmh": 45.2,
  "battery_pct": 72,
  "timestamp": "2026-08-23T14:08:34Z"
}
```

### Response — `200 OK`

| Field             | Type      | Description                                          | Example       |
| ----------------- | --------- | ---------------------------------------------------- | ------------- |
| `anomaly_score`   | `number`  | ML-derived anomaly score (0.0–1.0, higher = riskier) | `0.15`        |
| `risk_level`      | `string`  | Enum: `low`, `medium`, `high`, `critical`            | `"low"`       |
| `alert_triggered` | `boolean` | Whether this ping triggered a safety alert           | `false`       |

```json
{
  "anomaly_score": 0.15,
  "risk_level": "low",
  "alert_triggered": false
}
```

### Status Codes

| Code  | Meaning                                       |
| ----- | --------------------------------------------- |
| `200` | Telemetry processed successfully              |
| `400` | Validation error (missing/invalid fields)     |
| `404` | `tourist_id` not found                        |
| `500` | Internal server error                         |

---

## 3. GET `/api/v1/alerts/active`

Retrieve all currently active safety alerts across the system.

### Request

No request body. Optional query parameters:

| Parameter   | Type     | Required | Default | Description                              |
| ----------- | -------- | -------- | ------- | ---------------------------------------- |
| `severity`  | `string` | ❌       | all     | Filter by: `low`, `medium`, `high`, `critical` |
| `limit`     | `integer`| ❌       | `50`    | Max results per page (1–200)             |
| `cursor`    | `string` | ❌       | —       | Pagination cursor from previous response |

```
GET /api/v1/alerts/active?severity=high&limit=10
```

### Response — `200 OK`

| Field              | Type       | Description                                    | Example                    |
| ------------------ | ---------- | ---------------------------------------------- | -------------------------- |
| `alerts`           | `object[]` | Array of active alert objects                  | *(see below)*              |
| `alerts[].alert_id`| `string`   | UUIDv4 alert identifier                        | `"a1b2c3d4-..."`           |
| `alerts[].tourist_id`| `string` | UUIDv4 of the associated tourist               | `"c3d1f8a2-..."`           |
| `alerts[].latitude`| `number`   | Latitude where the alert was triggered         | `28.6139`                  |
| `alerts[].longitude`| `number`  | Longitude where the alert was triggered        | `77.2090`                  |
| `alerts[].severity`| `string`   | Enum: `low`, `medium`, `high`, `critical`      | `"high"`                   |
| `alerts[].trigger_reason`| `string` | Human-readable reason for the alert        | `"Geofence breach detected"` |
| `alerts[].triggered_at`| `string`| ISO 8601 UTC timestamp                         | `"2026-08-23T14:10:00Z"`  |
| `next_cursor`      | `string \| null` | Cursor for next page, `null` if last page | `"eyJhbGciOi..."`          |

```json
{
  "alerts": [
    {
      "alert_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "tourist_id": "c3d1f8a2-7b4e-4e6a-9f1d-2a3b4c5d6e7f",
      "latitude": 28.6139,
      "longitude": 77.2090,
      "severity": "high",
      "trigger_reason": "Geofence breach detected — tourist left designated safe zone",
      "triggered_at": "2026-08-23T14:10:00Z"
    }
  ],
  "next_cursor": null
}
```

### Status Codes

| Code  | Meaning                                       |
| ----- | --------------------------------------------- |
| `200` | Alerts retrieved successfully                 |
| `400` | Invalid query parameters                      |
| `500` | Internal server error                         |

---

## 4. POST `/api/v1/efir/generate`

Generate a formal electronic First Information Report (e-FIR) for a safety incident. Returns the structured incident JSON and a base64-encoded PDF document.

### Request

| Field        | Type     | Required | Constraints  | Example                                      |
| ------------ | -------- | -------- | ------------ | -------------------------------------------- |
| `tourist_id` | `string` | ✅       | Valid UUIDv4 | `"c3d1f8a2-7b4e-4e6a-9f1d-2a3b4c5d6e7f"`   |
| `alert_id`   | `string` | ✅       | Valid UUIDv4 | `"a1b2c3d4-e5f6-7890-abcd-ef1234567890"`     |

```json
{
  "tourist_id": "c3d1f8a2-7b4e-4e6a-9f1d-2a3b4c5d6e7f",
  "alert_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
}
```

### Response — `201 Created`

| Field                          | Type     | Description                                          | Example                                      |
| ------------------------------ | -------- | ---------------------------------------------------- | -------------------------------------------- |
| `efir.efir_id`                 | `string` | UUIDv4 e-FIR identifier                              | `"f9e8d7c6-..."`                             |
| `efir.tourist_id`              | `string` | Tourist who is the subject of the report             | `"c3d1f8a2-..."`                             |
| `efir.alert_id`                | `string` | Originating alert                                    | `"a1b2c3d4-..."`                             |
| `efir.incident_summary`        | `string` | AI-generated incident narrative                      | `"Tourist breached geofence at..."`          |
| `efir.severity`                | `string` | Enum: `low`, `medium`, `high`, `critical`            | `"high"`                                     |
| `efir.location.latitude`       | `number` | Incident latitude                                    | `28.6139`                                    |
| `efir.location.longitude`      | `number` | Incident longitude                                   | `77.2090`                                    |
| `efir.generated_at`            | `string` | ISO 8601 UTC timestamp                               | `"2026-08-23T14:12:00Z"`                    |
| `efir.status`                  | `string` | Enum: `draft`, `submitted`, `acknowledged`           | `"draft"`                                    |
| `pdf_base64`                   | `string` | Base64-encoded PDF document of the formal e-FIR      | `"JVBERi0xLjQK..."`                         |

```json
{
  "efir": {
    "efir_id": "f9e8d7c6-b5a4-3210-fedc-ba0987654321",
    "tourist_id": "c3d1f8a2-7b4e-4e6a-9f1d-2a3b4c5d6e7f",
    "alert_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "incident_summary": "Tourist breached geofence at 28.6139°N, 77.2090°E. Speed anomaly detected (120 km/h in a 40 km/h zone). Battery at 12%. Automatic alert escalated to local authorities.",
    "severity": "high",
    "location": {
      "latitude": 28.6139,
      "longitude": 77.2090
    },
    "generated_at": "2026-08-23T14:12:00Z",
    "status": "draft"
  },
  "pdf_base64": "JVBERi0xLjQKMSAwIG9iago8PCAvVHlwZSAvQ2F0YWxvZyA..."
}
```

### Status Codes

| Code  | Meaning                                       |
| ----- | --------------------------------------------- |
| `201` | e-FIR generated successfully                  |
| `400` | Validation error (missing/invalid fields)     |
| `404` | `tourist_id` or `alert_id` not found          |
| `500` | Internal server error                         |

---

## Error Envelope (All Endpoints)

All error responses follow this structure:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Field 'nationality' must be a valid ISO 3166-1 alpha-2 code."
  }
}
```

| Error Code             | HTTP Status | Description                          |
| ---------------------- | ----------- | ------------------------------------ |
| `VALIDATION_ERROR`     | `400`       | Request body failed schema validation|
| `NOT_FOUND`            | `404`       | Referenced resource does not exist   |
| `DUPLICATE_ENTRY`      | `409`       | Resource already exists              |
| `INTERNAL_ERROR`       | `500`       | Unexpected server-side failure       |
