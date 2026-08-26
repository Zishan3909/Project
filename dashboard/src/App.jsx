import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import { motion, AnimatePresence } from "framer-motion";
import "leaflet/dist/leaflet.css";
import { fetchActiveAlerts } from "./services/api";
import { generateEfir } from "./utils/efirPdf";
import { ShieldAlert, MapPin, CheckCircle2, Menu, Sparkles, Plus, X } from "lucide-react";
import L from "leaflet";
import terminator from "leaflet-terminator";
import LoadingScreen from "./LoadingScreen";

// Helper to generate the pulsing HTML marker
const getCustomIcon = (severity) => {
  const isCritical = severity === "high" || severity === "CRITICAL";
  const className = isCritical ? "marker-critical" : "marker-warning";
  return L.divIcon({
    className: "pulse-marker-wrapper",
    html: `<div class="${className}"><div class="pulse-ring"></div><div class="pulse-dot"></div></div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
};

// Map Controller for Dynamic Controls and Terminator (Day/Night) Layer
function MapController({ alerts, selectedAlert, viewMode, setViewMode }) {
  const map = useMap();
  
  // Real-time Day/Night Cycle with specific transparent/dark configuration
  useEffect(() => {
    const t = terminator({ fillOpacity: 0.6, color: 'transparent', fillColor: '#000000', stroke: false });
    t.addTo(map);
    const interval = setInterval(() => {
      t.setTime();
    }, 60000); // Update every minute
    return () => {
      clearInterval(interval);
      if (map.hasLayer(t)) {
        map.removeLayer(t);
      }
    };
  }, [map]);

  // FlyTo and FitBounds Logic
  useEffect(() => {
    try {
      if (viewMode === "global") {
        map.flyTo([20, 0], 2, { animate: true, duration: 1.5 });
        setViewMode("idle");
      } else if (viewMode === "india") {
        map.flyTo([22.5, 82.0], 5, { animate: true, duration: 1.5 });
        setViewMode("idle");
      } else if (viewMode === "fit") {
        if (!alerts || alerts.length === 0) {
          map.flyTo([20, 0], 2);
          setViewMode("idle");
          return;
        }
        const validAlerts = alerts.filter(a => a && !isNaN(a.lat) && !isNaN(a.lon) && a.lat !== null && a.lon !== null);
        if (validAlerts.length > 0) {
          const bounds = L.latLngBounds(validAlerts.map(a => [Number(a.lat), Number(a.lon)]));
          map.fitBounds(bounds, { padding: [50, 50], animate: true, duration: 1.5, maxZoom: 14 });
        } else {
          map.flyTo([20, 0], 2);
        }
        setViewMode("idle");
      } else if (viewMode === "selected") {
        if (selectedAlert && !isNaN(selectedAlert.lat) && !isNaN(selectedAlert.lon) && selectedAlert.lat !== null && selectedAlert.lon !== null) {
          map.flyTo([Number(selectedAlert.lat), Number(selectedAlert.lon)], 12, { duration: 1.5 });
        } else {
          map.flyTo([20, 0], 2);
        }
        setViewMode("idle");
      }
    } catch (e) {
      console.error("Leaflet camera crash prevented:", e);
      setViewMode("idle");
    }
  }, [viewMode, selectedAlert, alerts, map, setViewMode]);

  return null;
}

export default function App() {
  const [isBooting, setIsBooting] = useState(true);
  const [isHudOpen, setIsHudOpen] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [viewMode, setViewMode] = useState("global"); 
  const [efirModalAlert, setEfirModalAlert] = useState(null);

  const loadAlerts = async () => {
    const data = await fetchActiveAlerts();
    setAlerts([...data].reverse());
  };

  useEffect(() => {
    loadAlerts();
    const interval = setInterval(loadAlerts, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleCardClick = (alert) => {
    setSelectedAlert(alert);
    setViewMode("selected");
    setIsHudOpen(false); // Collapse HUD when card is clicked
  };

  if (isBooting) {
    return <LoadingScreen onComplete={() => setIsBooting(false)} />;
  }

  return (
    <div className="h-screen w-full relative bg-black text-white font-sans overflow-hidden">
      
      {/* Absolute Leaflet Map Background */}
      <div className="fixed inset-0 z-0">
        {(!isNaN(20) && !isNaN(0)) ? (
          <MapContainer center={[20, 0]} zoom={2} zoomControl={false} className="h-full w-full">
            <TileLayer 
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" 
              maxZoom={19} 
            />
            {alerts.map((alert, idx) => {
              if (!alert || isNaN(alert.lat) || isNaN(alert.lon) || alert.lat === null || alert.lon === null) return null;
              return (
                <Marker 
                  key={alert.alert_id || idx} 
                  position={[Number(alert.lat), Number(alert.lon)]} 
                  icon={getCustomIcon(alert.severity)} 
                />
              );
            })}
            <MapController alerts={alerts} selectedAlert={selectedAlert} viewMode={viewMode} setViewMode={setViewMode} />
          </MapContainer>
        ) : (
          <div className="flex h-full w-full items-center justify-center text-cyan-400 bg-black">Calibrating GPS...</div>
        )}
      </div>

      {/* Persistent Minimal Top HUD */}
      <div className="absolute top-4 left-4 right-4 z-50 flex justify-between pointer-events-none">
        {/* Top Left Nav */}
        <div className="flex gap-4 items-start">
          <button 
            onClick={() => setIsHudOpen(!isHudOpen)} 
            className="liquid-glass pointer-events-auto p-4 rounded-2xl hover:scale-105 active:scale-95 transition-transform flex items-center justify-center"
          >
            {isHudOpen ? <X className="text-white w-6 h-6" /> : <Menu className="text-white w-6 h-6" />}
          </button>
          <div className="liquid-glass pointer-events-auto px-6 py-4 rounded-2xl flex items-center justify-center">
            <span className="font-semibold text-xl tracking-tighter text-white">TourGuard</span>
          </div>
        </div>
        
        {/* Top Right Status */}
        <div className="hidden md:flex gap-4 items-start">
          <div className="liquid-glass pointer-events-auto px-6 py-3 rounded-2xl flex flex-col justify-center">
            <span className="text-[10px] text-white/50 uppercase tracking-widest mb-1 font-semibold">Active</span>
            <span className="text-white font-medium text-lg">1,284</span>
          </div>
          <div className="liquid-glass pointer-events-auto px-6 py-3 rounded-2xl flex flex-col justify-center">
            <span className="text-[10px] text-white/50 uppercase tracking-widest mb-1 font-semibold">Status</span>
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-white animate-pulse"></div>
              <span className="text-white font-medium text-lg">Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* Persistent Minimal Bottom Controls */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 pointer-events-auto flex gap-3 p-2 liquid-glass-strong rounded-full">
        <button onClick={() => setViewMode("fit")} className="liquid-glass px-5 py-2.5 rounded-full text-xs text-white/80 font-medium hover:text-white hover:scale-105 active:scale-95 transition-all">Fit Alerts</button>
        <button onClick={() => setViewMode("india")} className="liquid-glass px-5 py-2.5 rounded-full text-xs text-white/80 font-medium hover:text-white hover:scale-105 active:scale-95 transition-all">India View</button>
        <button onClick={() => setViewMode("global")} className="liquid-glass px-5 py-2.5 rounded-full text-xs text-white/80 font-medium hover:text-white hover:scale-105 active:scale-95 transition-all">Global Reset</button>
      </div>

      {/* Collapsible HUD Panels */}
      <AnimatePresence>
        {isHudOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="absolute inset-0 z-20 pt-28 pb-24 px-6 flex flex-col lg:flex-row justify-between pointer-events-none gap-6"
          >
            
            {/* Left Panel (Command Hero) */}
            <div className="lg:w-[45%] h-full pointer-events-auto liquid-glass-strong rounded-3xl flex flex-col p-10 lg:p-14 relative overflow-hidden">
              <div className="my-auto flex flex-col gap-10">
                <h1 className="text-5xl lg:text-7xl font-medium tracking-tight text-white leading-tight">
                  Global <br/> <span className="font-serif italic text-white/80">incident</span> radar
                </h1>
                <button 
                  onClick={loadAlerts}
                  className="flex items-center gap-4 liquid-glass-strong px-8 py-5 w-max rounded-full hover:scale-105 active:scale-95 transition-transform"
                >
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-white font-medium text-lg">Scan Network</span>
                </button>
              </div>
              
              <div className="mt-auto">
                <div className="text-[10px] text-white/40 uppercase tracking-widest mb-1.5 font-semibold">SYSTEM INTEGRITY</div>
                <p className="text-white/80 text-sm font-medium">Monitoring the grid continuously.</p>
              </div>
            </div>

            {/* Right Panel (Intelligence Feed) */}
            <div className="lg:w-[42%] h-full flex flex-col pointer-events-auto liquid-glass rounded-[2.5rem] p-2 ml-auto overflow-hidden">
              <div className="px-8 py-6 border-b border-white/10 flex justify-between items-center shrink-0">
                <span className="text-sm font-semibold text-white uppercase tracking-wider">Intelligence Feed</span>
                <span className="bg-white/10 px-4 py-1.5 rounded-full text-xs font-medium text-white/80">{alerts.length} active</span>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {alerts.length === 0 ? (
                  <div className="text-center text-white/40 mt-20 flex flex-col items-center">
                    <CheckCircle2 className="w-14 h-14 mb-4 opacity-30" />
                    <p className="text-lg font-medium text-white/60">No active incidents.</p>
                    <p className="text-xs mt-1">Radar link established.</p>
                  </div>
                ) : (
                  alerts.map((alert, idx) => {
                    const isSelected = selectedAlert?.alert_id === alert.alert_id;
                    const borderClass = isSelected ? "border border-white/40 shadow-[0_0_20px_rgba(255,255,255,0.1)] bg-white/5" : "border border-transparent hover:bg-white/5";
                    
                    return (
                      <div 
                        key={alert.alert_id || idx} 
                        onClick={() => handleCardClick(alert)}
                        className={`p-5 rounded-3xl liquid-glass cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] ${borderClass}`}
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                              <ShieldAlert className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-xs font-medium tracking-widest uppercase text-white/80">
                              {alert.severity}
                            </span>
                          </div>
                          <span className="text-[10px] text-white/40 font-mono tracking-wider">
                            {(alert.alert_id || "").split("-")[0]}
                          </span>
                        </div>
                        
                        <p className="text-sm text-white/90 mb-5 font-medium leading-relaxed">
                          {alert.reason}
                        </p>
                        
                        <div className="flex justify-between items-center pt-4 border-t border-white/10">
                          <div className="flex items-center gap-2 text-white/50">
                            <MapPin className="w-3.5 h-3.5" />
                            <span className="text-[11px] font-mono tracking-wide">
                              {alert.lat?.toFixed(4)}°, {alert.lon?.toFixed(4)}°
                            </span>
                          </div>
                          <button 
                            onClick={(e) => { e.stopPropagation(); setEfirModalAlert(alert); }}
                            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>

      {/* Grayscale E-FIR Tactical Modal */}
      {efirModalAlert && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/80 backdrop-blur-md pointer-events-auto">
          <div className="liquid-glass-strong border border-white/20 rounded-[2.5rem] p-10 w-[550px] relative">
            <button 
              onClick={() => setEfirModalAlert(null)}
              className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-transform hover:scale-110"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.4)]">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-white tracking-tight">Incident Report</h2>
                <p className="text-xs text-white/50 font-mono mt-1 tracking-widest uppercase">Ref: {efirModalAlert.alert_id}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-10 text-sm">
              <div className="liquid-glass p-5 rounded-2xl">
                <p className="text-[10px] text-white/40 uppercase tracking-widest font-semibold mb-1.5">Tourist ID</p>
                <p className="font-mono text-white font-medium">{efirModalAlert.tourist_id || "TG-8842"}</p>
              </div>
              <div className="liquid-glass p-5 rounded-2xl">
                <p className="text-[10px] text-white/40 uppercase tracking-widest font-semibold mb-1.5">Severity</p>
                <p className="font-semibold uppercase text-white tracking-wider">{efirModalAlert.severity}</p>
              </div>
              <div className="liquid-glass p-5 rounded-2xl col-span-2">
                <p className="text-[10px] text-white/40 uppercase tracking-widest font-semibold mb-1.5">Coordinates (Lat / Lon)</p>
                <p className="font-mono text-white/80">{efirModalAlert.lat?.toFixed(6)} N, {efirModalAlert.lon?.toFixed(6)} E</p>
              </div>
              <div className="liquid-glass p-5 rounded-2xl col-span-2">
                <p className="text-[10px] text-white/40 uppercase tracking-widest font-semibold mb-1.5">System Analysis</p>
                <p className="text-white font-medium text-lg leading-relaxed">{efirModalAlert.reason}</p>
              </div>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={() => { generateEfir(efirModalAlert); setEfirModalAlert(null); }}
                className="flex-1 bg-white/10 hover:bg-white/20 text-white font-semibold tracking-wider py-4 rounded-full transition-all border border-white/20 hover:scale-[1.02] active:scale-95"
              >
                Download PDF
              </button>
              <button 
                onClick={() => setEfirModalAlert(null)}
                className="flex-1 bg-white hover:bg-gray-200 text-black font-semibold tracking-wider py-4 rounded-full shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all hover:scale-[1.02] active:scale-95"
              >
                Dispatch Unit
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
