import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { ShieldAlert, Search, Battery, Gauge, Power, MapPin } from "lucide-react";
import { sendTelemetry, triggerSOS } from "./services/api";
import L from "leaflet";
import axios from "axios";

// Leaflet default icon fix for Vite/React
import iconImg from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: iconImg,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

function RecenterMap({ lat, lon }) {
  const map = useMap();
  useEffect(() => {
    try {
      if (lat != null && lon != null && !isNaN(lat) && !isNaN(lon)) {
        map.setView([Number(lat), Number(lon)], map.getZoom());
      } else {
        map.setView([20, 0], map.getZoom());
      }
    } catch (e) {
      console.error("Leaflet RecenterMap crash prevented", e);
    }
  }, [lat, lon, map]);
  return null;
}

export default function App() {
  const TOURIST_ID = "TG-8842";
  const DEFAULT_STATE = { lat: 20.0, lon: 0.0, speed: 5, battery: 80 };

  const [telemetry, setTelemetry] = useState(DEFAULT_STATE);
  const [riskLevel, setRiskLevel] = useState("LOW");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchStatus, setSearchStatus] = useState("");

  const handlePing = async (currentState) => {
    const payload = {
      tourist_id: TOURIST_ID,
      latitude: currentState.lat,
      longitude: currentState.lon,
      speed_kmh: currentState.speed,
      battery_pct: currentState.battery,
      timestamp: Math.floor(Date.now() / 1000),
    };
    const res = await sendTelemetry(payload);
    if (res) {
      setRiskLevel(res.risk_level);
    }
  };

  useEffect(() => {
    handlePing(telemetry);
    const interval = setInterval(() => {
      handlePing(telemetry);
    }, 5000);
    return () => clearInterval(interval);
  }, [telemetry]);

  const handleSOS = async () => {
    await triggerSOS(TOURIST_ID, telemetry.lat, telemetry.lon);
    alert("SOS Triggered! Emergency dispatch has been notified of your location.");
  };

  const handleSearchLocation = async () => {
    if (!searchQuery.trim()) return;
    setSearchStatus("Searching...");
    try {
      const res = await axios.get(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`
      );
      if (res.data && res.data.length > 0) {
        const result = res.data[0];
        const newLat = parseFloat(result.lat);
        const newLon = parseFloat(result.lon);
        const newState = { ...telemetry, lat: newLat, lon: newLon };
        setTelemetry(newState);
        setSearchStatus(`Found: ${result.display_name.substring(0, 30)}...`);
        handlePing(newState);
      } else {
        setSearchStatus("Location not found.");
      }
    } catch (err) {
      setSearchStatus("Search failed.");
      console.error(err);
    }
  };

  const simulateDeviation = () => {
    const newState = { lat: 25.65, lon: 91.9, speed: 40, battery: 80 };
    setTelemetry(newState);
    handlePing(newState);
  };

  const simulateInactivity = () => {
    const newState = { ...telemetry, speed: 0, battery: 10 };
    setTelemetry(newState);
    handlePing(newState);
  };

  const resetSafe = () => {
    setTelemetry(DEFAULT_STATE);
    setSearchStatus("");
    handlePing(DEFAULT_STATE);
  };

  const isCoordValid = telemetry && telemetry.lat != null && telemetry.lon != null && !isNaN(telemetry.lat) && !isNaN(telemetry.lon);
  const safeLat = isCoordValid ? Number(telemetry.lat) : 20;
  const safeLon = isCoordValid ? Number(telemetry.lon) : 0;

  return (
    <div className="w-full h-screen relative bg-black text-white font-sans overflow-hidden">
      
      {/* Map Background - Satellite */}
      <div className="fixed inset-0 z-0">
        {(safeLat != null && safeLon != null && !isNaN(safeLat) && !isNaN(safeLon)) ? (
          <MapContainer center={[Number(safeLat), Number(safeLon)]} zoom={13} zoomControl={false} className="h-full w-full">
            <TileLayer 
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" 
              maxZoom={19} 
            />
            {isCoordValid && <Marker position={[Number(safeLat), Number(safeLon)]} />}
            {isCoordValid && <RecenterMap lat={safeLat} lon={safeLon} />}
          </MapContainer>
        ) : (
          <div className="flex h-full w-full items-center justify-center text-cyan-400 bg-black">Calibrating GPS...</div>
        )}
      </div>

      {/* Floating Top Bar */}
      <div className="absolute top-4 left-4 right-4 z-50 flex justify-between items-start pointer-events-none">
        <div className="liquid-glass pointer-events-auto px-5 py-3 rounded-2xl">
          <span className="font-semibold text-lg tracking-tighter text-white">TourGuard</span>
        </div>
        <div className="liquid-glass pointer-events-auto px-4 py-2.5 rounded-2xl flex items-center gap-2.5">
          <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
          <span className="text-xs font-medium text-white/80">Live</span>
        </div>
      </div>

      {/* Floating Tourist ID Card */}
      <div className="absolute top-20 left-4 right-4 z-40 pointer-events-none">
        <div className="liquid-glass pointer-events-auto rounded-2xl p-4 flex justify-between items-center">
          <div>
            <div className="text-[10px] text-white/40 font-semibold uppercase tracking-widest mb-1">Tourist ID</div>
            <div className="text-lg font-semibold text-white leading-tight">John Doe</div>
            <div className="text-xs font-mono text-white/60 mt-0.5">ID: {TOURIST_ID}</div>
          </div>
          <div className="text-right">
            <span className="liquid-glass px-3 py-1.5 rounded-full text-[9px] text-white/80 font-semibold uppercase tracking-widest">
              KYC Verified
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Sheet Overlay */}
      <div className="absolute bottom-0 left-0 right-0 z-50 liquid-glass-strong rounded-t-[2rem] p-5 flex flex-col gap-4 pointer-events-auto">
        
        {/* Drag Handle */}
        <div className="w-10 h-1 bg-white/20 rounded-full mx-auto"></div>

        {/* Location Search Input */}
        <div>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearchLocation()}
                placeholder="Search global location..."
                className="w-full bg-white/5 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:bg-white/10 transition-colors"
              />
              <Search className="w-4 h-4 text-white/30 absolute left-3.5 top-3.5" />
            </div>
            <button
              onClick={handleSearchLocation}
              className="liquid-glass text-white text-sm px-5 py-3 rounded-xl flex items-center justify-center font-semibold transition-transform hover:scale-105 active:scale-95 shrink-0"
            >
              Search
            </button>
          </div>
          {searchStatus && (
            <div className="text-[11px] text-white/60 mt-2 ml-1 font-medium">{searchStatus}</div>
          )}
        </div>
        
        {/* State Trackers */}
        <div className="grid grid-cols-2 gap-3 text-[11px] font-medium">
          <div className="liquid-glass p-3.5 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-white/50"><Gauge className="w-3.5 h-3.5"/> Speed</div>
            <span className="font-mono text-white text-xs">{telemetry.speed} km/h</span>
          </div>
          <div className="liquid-glass p-3.5 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-white/50"><Battery className="w-3.5 h-3.5"/> Battery</div>
            <span className="font-mono text-white text-xs">{telemetry.battery}%</span>
          </div>
        </div>

        {/* Coordinates */}
        <div className="flex items-center justify-center gap-2 text-white/40">
          <MapPin className="w-3 h-3" />
          <span className="text-[10px] font-mono tracking-wide">{telemetry.lat.toFixed(4)}°, {telemetry.lon.toFixed(4)}°</span>
        </div>

        {/* Quick Simulator Controls */}
        <div className="flex gap-2">
          <button onClick={simulateDeviation} className="flex-1 liquid-glass text-white/70 text-[10px] uppercase font-semibold py-2.5 rounded-xl transition-transform hover:scale-105 active:scale-95">
            Deviate
          </button>
          <button onClick={simulateInactivity} className="flex-1 liquid-glass text-white/70 text-[10px] uppercase font-semibold py-2.5 rounded-xl transition-transform hover:scale-105 active:scale-95">
            Inactivity
          </button>
          <button onClick={resetSafe} className="flex-1 liquid-glass text-white/70 text-[10px] uppercase font-semibold py-2.5 rounded-xl transition-transform hover:scale-105 active:scale-95">
            Reset
          </button>
        </div>

        {/* SOS Button */}
        <button 
          onClick={handleSOS} 
          className="w-full bg-white hover:bg-gray-200 text-black font-bold text-lg tracking-widest uppercase py-4 rounded-full shadow-[0_0_30px_rgba(255,255,255,0.2)] transition-all active:scale-95 flex items-center justify-center gap-3"
        >
          <Power className="w-5 h-5" />
          Trigger SOS
        </button>

      </div>
    </div>
  );
}
