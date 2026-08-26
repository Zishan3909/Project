from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
import uuid
import random

from . import models
from .database import engine, get_db

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="TourGuard AI Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class LocationData(BaseModel):
    tourist_id: str
    lat: float
    lon: float

@app.post("/api/v1/telemetry/ping")
def receive_telemetry(data: LocationData, db: Session = Depends(get_db)):
    if data.lat > 90.0:  
        new_alert = models.Alert(
            alert_id=str(uuid.uuid4()),
            tourist_id=data.tourist_id,
            severity="medium",
            reason="Route Deviation",
            lat=data.lat,
            lon=data.lon
        )
        db.add(new_alert)
        db.commit()
    return {"status": "success", "message": "Telemetry received"}

@app.post("/api/v1/sos/trigger")
def trigger_sos(data: LocationData, db: Session = Depends(get_db)):
    new_alert = models.Alert(
        alert_id=str(uuid.uuid4()),
        tourist_id=data.tourist_id,
        severity="high",
        reason="SOS Triggered",
        lat=data.lat,
        lon=data.lon
    )
    db.add(new_alert)
    db.commit()
    return {"status": "emergency_logged", "alert_id": new_alert.alert_id}

@app.get("/api/v1/alerts/active")
def get_active_alerts(db: Session = Depends(get_db)):
    alerts = db.query(models.Alert).all()
    return alerts

@app.get("/seed-global")
def seed_global(db: Session = Depends(get_db)):
    # Clear existing alerts
    db.query(models.Alert).delete()
    db.commit()
    
    severities = ["CRITICAL", "HIGH", "MEDIUM"]
    reasons = [
        "Unresponsive biometric feed",
        "Geofence breach detected",
        "SOS Triggered",
        "Sudden altitude drop",
        "Loss of satellite uplink",
        "Unscheduled route deviation",
        "Thermal signature anomaly"
    ]
    
    for _ in range(40):
        new_alert = models.Alert(
            alert_id=f"TG-{str(uuid.uuid4())[:8].upper()}",
            tourist_id=f"USER-{random.randint(1000, 9999)}",
            severity=random.choice(severities),
            reason=random.choice(reasons),
            lat=random.uniform(-50.0, 70.0),
            lon=random.uniform(-130.0, 150.0)
        )
        db.add(new_alert)
        
    db.commit()
    return {"message": "Global data seeded"}
