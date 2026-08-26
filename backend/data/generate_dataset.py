"""
TourGuard AI — Synthetic Telemetry Dataset Generator

Generates 10,000 GPS data points along the Shillong → Cherrapunji tourist
corridor in Northeast India, with 500 injected anomalies.

Usage:
    python data/generate_dataset.py

Output:
    backend/data/tourist_telemetry.csv
"""

from __future__ import annotations

import os
import sys

import numpy as np
import pandas as pd
from shapely.geometry import LineString, Point

# ──────────────────────────────────────────────
# Route definition: Shillong → Cherrapunji
# ──────────────────────────────────────────────

ROUTE_WAYPOINTS = [
    (25.578, 91.893),   # Shillong (Police Bazaar)
    (25.540, 91.870),   # Upper Shillong
    (25.490, 91.850),   # Mawkhar
    (25.400, 91.800),   # Mawsynram Junction
    (25.310, 91.750),   # Sohra viewpoint
    (25.270, 91.732),   # Cherrapunji (Nohkalikai Falls)
]

# Danger zones: cliff edges, restricted areas (lat, lon)
DANGER_ZONES = [
    (25.285, 91.745),   # Nohkalikai cliff edge
    (25.300, 91.738),   # Mawsmai Cave restricted area
    (25.320, 91.760),   # Dainthlen Falls gorge
    (25.275, 91.730),   # Seven Sisters viewpoint edge
]

# Build Shapely LineString for corridor distance calculations
CORRIDOR_LINE = LineString(ROUTE_WAYPOINTS)

# Approximate degrees-to-meters at this latitude (~25°N)
DEG_TO_METERS = 111_320.0  # ~111.32 km per degree


def _corridor_distance_meters(lat: float, lon: float) -> float:
    """Approximate distance in meters from a point to the corridor polyline."""
    point = Point(lat, lon)
    deg_dist = CORRIDOR_LINE.distance(point)
    return deg_dist * DEG_TO_METERS


def _sample_point_on_corridor(rng: np.random.Generator) -> tuple[float, float]:
    """Sample a random point along the corridor line."""
    fraction = rng.uniform(0.0, 1.0)
    point = CORRIDOR_LINE.interpolate(fraction, normalized=True)
    return point.x, point.y  # (lat, lon) since our LineString uses (lat, lon)


def generate_normal_points(n: int, rng: np.random.Generator) -> pd.DataFrame:
    """Generate n normal (non-anomalous) telemetry points."""
    records = []
    for _ in range(n):
        lat, lon = _sample_point_on_corridor(rng)

        # Add Gaussian noise (~50m ≈ 0.0005°)
        lat += rng.normal(0, 0.0005)
        lon += rng.normal(0, 0.0005)

        # Speed: right-skewed, mostly 10–40 km/h, max ~60
        speed = float(np.clip(rng.gamma(shape=3.0, scale=8.0), 0, 60))

        # Time of day: bimodal peaks at 9–11 AM and 2–4 PM
        if rng.random() < 0.5:
            hour = int(np.clip(rng.normal(10, 1.5), 6, 18))
        else:
            hour = int(np.clip(rng.normal(15, 1.5), 6, 18))

        corridor_dist = _corridor_distance_meters(lat, lon)

        records.append({
            "latitude": round(lat, 6),
            "longitude": round(lon, 6),
            "speed_kmh": round(speed, 1),
            "time_of_day": hour,
            "distance_from_corridor": round(corridor_dist, 1),
            "is_anomaly": 0,
        })

    return pd.DataFrame(records)


def generate_speed_anomalies(n: int, rng: np.random.Generator) -> pd.DataFrame:
    """Anomaly type 1: Sudden speed spikes (80–150 km/h)."""
    records = []
    for _ in range(n):
        lat, lon = _sample_point_on_corridor(rng)
        lat += rng.normal(0, 0.0005)
        lon += rng.normal(0, 0.0005)

        speed = float(rng.uniform(80, 150))
        hour = int(rng.integers(0, 24))
        corridor_dist = _corridor_distance_meters(lat, lon)

        records.append({
            "latitude": round(lat, 6),
            "longitude": round(lon, 6),
            "speed_kmh": round(speed, 1),
            "time_of_day": hour,
            "distance_from_corridor": round(corridor_dist, 1),
            "is_anomaly": 1,
        })

    return pd.DataFrame(records)


def generate_offcorridor_anomalies(n: int, rng: np.random.Generator) -> pd.DataFrame:
    """Anomaly type 2: Off-corridor treks (300–2000m from route)."""
    records = []
    for _ in range(n):
        lat, lon = _sample_point_on_corridor(rng)

        # Push the point 300–2000m away from corridor
        offset_deg = rng.uniform(300, 2000) / DEG_TO_METERS
        angle = rng.uniform(0, 2 * np.pi)
        lat += offset_deg * np.cos(angle)
        lon += offset_deg * np.sin(angle)

        speed = float(rng.uniform(2, 30))
        hour = int(rng.integers(0, 24))
        corridor_dist = _corridor_distance_meters(lat, lon)

        records.append({
            "latitude": round(lat, 6),
            "longitude": round(lon, 6),
            "speed_kmh": round(speed, 1),
            "time_of_day": hour,
            "distance_from_corridor": round(max(corridor_dist, 300), 1),
            "is_anomaly": 1,
        })

    return pd.DataFrame(records)


def generate_dangerzone_anomalies(n: int, rng: np.random.Generator) -> pd.DataFrame:
    """Anomaly type 3: Prolonged stops in danger zones at night."""
    records = []
    for _ in range(n):
        # Pick a random danger zone
        dz_lat, dz_lon = DANGER_ZONES[rng.integers(0, len(DANGER_ZONES))]

        # Small jitter around the danger zone
        lat = dz_lat + rng.normal(0, 0.001)
        lon = dz_lon + rng.normal(0, 0.001)

        # Very low speed (stopped / barely moving)
        speed = float(rng.uniform(0, 2))

        # Night hours: 22–04
        hour = int(rng.choice([22, 23, 0, 1, 2, 3, 4]))
        corridor_dist = _corridor_distance_meters(lat, lon)

        records.append({
            "latitude": round(lat, 6),
            "longitude": round(lon, 6),
            "speed_kmh": round(speed, 1),
            "time_of_day": hour,
            "distance_from_corridor": round(corridor_dist, 1),
            "is_anomaly": 1,
        })

    return pd.DataFrame(records)


def main() -> None:
    """Generate the full dataset and write to CSV."""
    rng = np.random.default_rng(seed=42)

    print("Generating synthetic telemetry dataset...")
    print(f"  Route: {len(ROUTE_WAYPOINTS)} waypoints (Shillong -> Cherrapunji)")

    # Normal points
    n_normal = 9_500
    df_normal = generate_normal_points(n_normal, rng)
    print(f"  Normal points:  {len(df_normal):,}")

    # Anomalies (total = 500)
    n_speed = 170
    n_offcorridor = 170
    n_dangerzone = 160

    df_speed = generate_speed_anomalies(n_speed, rng)
    df_offcorridor = generate_offcorridor_anomalies(n_offcorridor, rng)
    df_dangerzone = generate_dangerzone_anomalies(n_dangerzone, rng)

    total_anomalies = len(df_speed) + len(df_offcorridor) + len(df_dangerzone)
    print(f"  Anomalies:      {total_anomalies:,}")
    print(f"    Speed spikes:       {len(df_speed)}")
    print(f"    Off-corridor:       {len(df_offcorridor)}")
    print(f"    Danger-zone stops:  {len(df_dangerzone)}")

    # Combine and shuffle
    df = pd.concat([df_normal, df_speed, df_offcorridor, df_dangerzone], ignore_index=True)
    df = df.sample(frac=1.0, random_state=42).reset_index(drop=True)

    # Write output
    output_dir = os.path.dirname(os.path.abspath(__file__))
    output_path = os.path.join(output_dir, "tourist_telemetry.csv")
    df.to_csv(output_path, index=False)

    print(f"\n[OK] Dataset saved to: {output_path}")
    print(f"   Total rows: {len(df):,}  |  Anomalies: {df['is_anomaly'].sum():,}")

    # Quick stats
    print("\nDataset summary:")
    print(f"  Lat range:  {df['latitude'].min():.4f} – {df['latitude'].max():.4f}")
    print(f"  Lon range:  {df['longitude'].min():.4f} – {df['longitude'].max():.4f}")
    print(f"  Speed:      {df['speed_kmh'].min():.1f} – {df['speed_kmh'].max():.1f} km/h")
    print(f"  Corridor:   {df['distance_from_corridor'].min():.0f} – {df['distance_from_corridor'].max():.0f} m")


if __name__ == "__main__":
    main()
