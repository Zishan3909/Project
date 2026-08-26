"""Quick script to inspect all records in the tourguard.db alerts table."""

from app.database import SessionLocal
from app import models

def main():
    db = SessionLocal()
    try:
        alerts = db.query(models.Alert).all()
        if not alerts:
            print("No alerts found in the database.")
            return

        print(f"Found {len(alerts)} alert(s):\n")
        print("-" * 90)
        for a in alerts:
            print(f"  Alert ID  : {a.alert_id}")
            print(f"  Tourist ID: {a.tourist_id}")
            print(f"  Severity  : {a.severity}")
            print(f"  Reason    : {a.reason}")
            print(f"  Lat / Lon : {a.lat}, {a.lon}")
            print(f"  Timestamp : {a.timestamp}")
            print("-" * 90)
    finally:
        db.close()

if __name__ == "__main__":
    main()
