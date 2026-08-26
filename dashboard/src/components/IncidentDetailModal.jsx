import React, { useState, useCallback } from "react";
import {
  X,
  Radio,
  Smartphone,
  FileText,
  MapPin,
  Gauge,
  BatteryLow,
  Route,
  Clock,
  ShieldAlert,
  User,
  Globe,
  Hash,
  CheckCircle,
} from "lucide-react";
import { generateEfirPdf } from "../utils/efirPdf";

const SEVERITY_COLORS = {
  critical: "bg-red-500",
  high: "bg-orange-500",
  medium: "bg-amber-500",
  low: "bg-green-500",
};

function InfoRow({ icon: Icon, label, value, highlight }) {
  return (
    <div className="flex items-start gap-3 py-1.5">
      <Icon className="w-4 h-4 text-gray-500 mt-0.5 shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="text-[10px] text-gray-500 uppercase tracking-wider">
          {label}
        </div>
        <div
          className={`text-sm font-medium ${
            highlight ? "text-red-400" : "text-gray-200"
          }`}
        >
          {value}
        </div>
      </div>
    </div>
  );
}

export default function IncidentDetailModal({ alert, onClose }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, color = "blue") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, color }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  if (!alert) return null;

  const sevLabel = (alert.severity || "unknown").toUpperCase();
  const sevColor = SEVERITY_COLORS[alert.severity] || "bg-gray-500";

  const handleDispatch = () => {
    showToast("Dispatch unit alerted - ETA 8 minutes", "blue");
  };

  const handlePing = () => {
    showToast("Device ping sent to tourist", "amber");
  };

  const handleEfir = () => {
    try {
      const filename = generateEfirPdf(alert);
      showToast(`E-FIR generated: ${filename}`, "green");
    } catch (err) {
      showToast("Failed to generate E-FIR", "red");
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-panel-card border border-panel-border rounded-xl shadow-2xl w-full max-w-xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-panel-border">
          <div className="flex items-center gap-3">
            <span
              className={`${sevColor} text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              {sevLabel}
            </span>
            <span className="text-xs text-gray-500 font-mono">
              {alert.alert_id}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-300 transition-colors p-1 rounded-lg hover:bg-panel-hover"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-4">
          {/* Tourist Profile */}
          <div>
            <h3 className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-2">
              Tourist Profile
            </h3>
            <div className="bg-panel-bg/50 rounded-lg px-4 py-2 space-y-0.5">
              <InfoRow icon={User} label="Name" value={alert.tourist_name || "Unknown"} />
              <InfoRow icon={Globe} label="Nationality" value={alert.nationality || "—"} />
              <InfoRow
                icon={Hash}
                label="Tourist ID"
                value={alert.tourist_id}
              />
            </div>
          </div>

          {/* Last Known Location */}
          <div>
            <h3 className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-2">
              Last Known Location
            </h3>
            <div className="bg-panel-bg/50 rounded-lg px-4 py-2 space-y-0.5">
              <InfoRow
                icon={MapPin}
                label="Coordinates"
                value={`${alert.latitude?.toFixed(6)}°N, ${alert.longitude?.toFixed(6)}°E`}
              />
            </div>
          </div>

          {/* Telemetry Snapshot */}
          <div>
            <h3 className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-2">
              Telemetry Snapshot
            </h3>
            <div className="bg-panel-bg/50 rounded-lg px-4 py-2 grid grid-cols-2 gap-x-4">
              <InfoRow
                icon={Gauge}
                label="Speed"
                value={`${alert.speed_kmh ?? "—"} km/h`}
                highlight={alert.speed_kmh > 80}
              />
              <InfoRow
                icon={Route}
                label="Deviation"
                value={`${alert.deviation_m ?? "—"} m`}
                highlight={alert.deviation_m > 300}
              />
              <InfoRow
                icon={BatteryLow}
                label="Battery"
                value={`${alert.battery_pct ?? "—"}%`}
                highlight={alert.battery_pct < 20}
              />
              <InfoRow
                icon={Clock}
                label="Stationary"
                value={`${alert.duration_stationary_min ?? "—"} min`}
                highlight={alert.duration_stationary_min > 30}
              />
            </div>
          </div>

          {/* AI Trigger Reason */}
          <div>
            <h3 className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-2">
              AI Trigger Reason
            </h3>
            <div className="bg-panel-bg/50 rounded-lg px-4 py-3">
              <p className="text-sm text-gray-300 leading-relaxed">
                {alert.trigger_reason}
              </p>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="px-5 py-4 border-t border-panel-border flex items-center gap-3">
          <button
            onClick={handleDispatch}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 
              text-white text-sm font-medium py-2.5 rounded-lg transition-colors"
          >
            <Radio className="w-4 h-4" />
            Dispatch Unit
          </button>
          <button
            onClick={handlePing}
            className="flex-1 flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 
              text-white text-sm font-medium py-2.5 rounded-lg transition-colors"
          >
            <Smartphone className="w-4 h-4" />
            Ping Device
          </button>
          <button
            onClick={handleEfir}
            className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 
              text-white text-sm font-medium py-2.5 rounded-lg transition-colors"
          >
            <FileText className="w-4 h-4" />
            Generate E-FIR
          </button>
        </div>
      </div>

      {/* Toast notifications */}
      <div className="fixed bottom-6 right-6 z-[3000] space-y-2">
        {toasts.map((toast) => {
          const toastColors = {
            blue: "bg-blue-600",
            amber: "bg-amber-600",
            green: "bg-green-600",
            red: "bg-red-600",
          };
          return (
            <div
              key={toast.id}
              className={`${
                toastColors[toast.color] || toastColors.blue
              } text-white text-sm px-4 py-2.5 rounded-lg shadow-xl flex items-center gap-2
                animate-[slideIn_0.3s_ease-out]`}
            >
              <CheckCircle className="w-4 h-4" />
              {toast.message}
            </div>
          );
        })}
      </div>
    </div>
  );
}
