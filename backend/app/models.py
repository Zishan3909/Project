from sqlalchemy import Column, Integer, String, Float, DateTime
from datetime import datetime, timezone
from .database import Base

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    alert_id = Column(String, unique=True, index=True)
    tourist_id = Column(String, index=True)
    severity = Column(String)  
    reason = Column(String)    
    lat = Column(Float)
    lon = Column(Float)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))
