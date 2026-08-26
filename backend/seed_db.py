"""Seed the tourguard.db with 3 realistic test alerts."""

import uuid
from app.database import SessionLocal
from app import models

def main():
    db = SessionLocal()
    try:
        alerts = [
            models.Alert(
                alert_id=str(uuid.uuid4()),
                tourist_id="TG-8842",
                severity="high",
                reason="SOS Triggered",
                lat=25.578,
                lon=91.893,
            ),
            models.Alert(
                alert_id=str(uuid.uuid4()),
                tourist_id="TG-5510",
                severity="high",
                reason="SOS Triggered",
                lat=25.295,
                lon=91.732,
            ),
            models.Alert(
                alert_id=str(uuid.uuid4()),
                tourist_id="TG-3371",
                severity="medium",
                reason="Route Deviation",
                lat=25.650,
                lon=91.900,
            ),
        ]

        db.add_all(alerts)
        db.commit()
        print("Database seeded successfully!")
    finally:
        db.close()

if __name__ == "__main__":
    main()
