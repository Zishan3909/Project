import React from "react";
import { Settings, MapPin, Gauge, Battery, Activity } from "lucide-react";

export default function SimulatorTray({ telemetry, setTelemetry, onPing }) {
  const handleDeviate = () => {
    setTelemetry({ ...telemetry, lat: 25.460, lon: 91.860 }); // Outside corridor
    setTimeout(onPing, 100);
  };

  const handleReturn = () => {
    setTelemetry({ ...telemetry, lat: 25.420, lon: 91.800 }); // Inside corridor
    setTimeout(onPing, 100);
  };

  const handleSpeedChange = (e) => {
    setTelemetry({ ...telemetry, speed: parseInt(e.target.value) });
  };

  const handleBatteryChange = (e) => {
    setTelemetry({ ...telemetry, battery: parseInt(e.target.value) });
  };

  return (
    <div className="fixed top-4 right-4 bg-gray-900 border border-gray-700 text-gray-200 rounded-xl p-5 shadow-2xl w-80 z-[9999] font-sans">
      <div className="flex items-center gap-2 mb-4 border-b border-gray-700 pb-3">
        <Settings className="w-5 h-5 text-indigo-400" />
        <h2 className="text-sm font-bold uppercase tracking-widest text-indigo-100">
          Demo Simulator
        </h2>
      </div>

      <div className="space-y-5">
        {/* Location Spoofing */}
        <div>
          <label className="flex items-center gap-2 text-xs font-semibold text-gray-400 mb-2">
            <MapPin className="w-3.5 h-3.5" /> GPS Location
          </label>
          <div className="flex gap-2">
            <button 
              onClick={handleDeviate}
              className="flex-1 bg-gray-800 hover:bg-red-900/50 border border-gray-700 hover:border-red-700 text-xs py-2 rounded transition-colors"
            >
              Deviate
            </button>
            <button 
              onClick={handleReturn}
              className="flex-1 bg-gray-800 hover:bg-green-900/50 border border-gray-700 hover:border-green-700 text-xs py-2 rounded transition-colors"
            >
              Return Safe
            </button>
          </div>
        </div>

        {/* Speed Spoofing */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="flex items-center gap-2 text-xs font-semibold text-gray-400">
              <Gauge className="w-3.5 h-3.5" /> Speed
            </label>
            <span className="text-xs text-indigo-300">{telemetry.speed} km/h</span>
          </div>
          <input 
            type="range" 
            min="0" max="150" 
            value={telemetry.speed}
            onChange={handleSpeedChange}
            onMouseUp={onPing}
            onTouchEnd={onPing}
            className="w-full accent-indigo-500"
          />
          <div className="flex justify-between text-[10px] text-gray-500 mt-1">
            <span>Stationary</span>
            <span>Speeding</span>
          </div>
        </div>

        {/* Battery Spoofing */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="flex items-center gap-2 text-xs font-semibold text-gray-400">
              <Battery className="w-3.5 h-3.5" /> Battery Level
            </label>
            <span className="text-xs text-indigo-300">{telemetry.battery}%</span>
          </div>
          <input 
            type="range" 
            min="1" max="100" 
            value={telemetry.battery}
            onChange={handleBatteryChange}
            onMouseUp={onPing}
            onTouchEnd={onPing}
            className="w-full accent-indigo-500"
          />
        </div>

        {/* Manual Ping */}
        <button 
          onClick={onPing}
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold py-2.5 rounded shadow-lg transition-colors mt-2"
        >
          <Activity className="w-4 h-4" />
          Send Telemetry Ping
        </button>
      </div>
    </div>
  );
}
