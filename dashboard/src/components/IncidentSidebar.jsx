import React from "react";
import {
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  ChevronRight,
  MapPin,
  Clock,
} from "lucide-react";

const SEVERITY_CONFIG = {
  critical: {
    bg: "bg-red-500/10",
    border: "border-red-500/40",
    pill: "bg-red-500",
    icon: ShieldAlert,
    label: "CRITICAL",
  },
  high: {
    bg: "bg-orange-500/10",
    border: "border-orange-500/30",
    pill: "bg-orange-500",
    icon: ShieldAlert,
    label: "HIGH",
  },
  medium: {
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    pill: "bg-amber-500",
    icon: AlertTriangle,
    label: "MEDIUM",
  },
  low: {
    bg: "bg-green-500/10",
    border: "border-green-500/30",
    pill: "bg-green-500",
    icon: ShieldCheck,
    label: "LOW",
  },
};

const SEVERITY_ORDER = { critical: 0, high: 1, medium: 2, low: 3 };

function timeAgo(isoString) {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  return `${hrs}h ${mins % 60}m ago`;
}

export default function IncidentSidebar({ alerts, onAlertClick }) {
  const sorted = [...alerts].sort((a, b) => {
    const sevDiff =
      (SEVERITY_ORDER[a.severity] ?? 9) - (SEVERITY_ORDER[b.severity] ?? 9);
    if (sevDiff !== 0) return sevDiff;
    return new Date(b.triggered_at) - new Date(a.triggered_at);
  });

  return (
    <aside className="w-[380px] bg-panel-card border-l border-panel-border flex flex-col shrink-0">
      {/* Header */}
      <div className="px-4 py-3 border-b border-panel-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-red-400" />
          <h2 className="text-sm font-bold text-gray-200 uppercase tracking-wider">
            Incident Triage
          </h2>
        </div>
        <span className="bg-red-500/20 text-red-400 text-xs font-bold px-2 py-0.5 rounded-full">
          {alerts.length} Active
        </span>
      </div>

      {/* Alert cards */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2">
        {sorted.length === 0 && (
          <div className="text-center text-gray-500 text-sm py-12">
            <ShieldCheck className="w-10 h-10 mx-auto mb-2 text-green-500/40" />
            No active incidents
          </div>
        )}

        {sorted.map((alert) => {
          const config = SEVERITY_CONFIG[alert.severity] || SEVERITY_CONFIG.low;
          const SevIcon = config.icon;

          return (
            <button
              key={alert.alert_id}
              onClick={() => onAlertClick(alert)}
              className={`w-full text-left ${config.bg} border ${config.border} rounded-lg p-3 
                hover:bg-panel-hover transition-colors group cursor-pointer`}
            >
              {/* Top row: severity pill + time */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`${config.pill} text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1`}
                  >
                    <SevIcon className="w-3 h-3" />
                    {config.label}
                  </span>
                  <span className="text-[10px] text-gray-500 font-mono">
                    {alert.alert_id.slice(0, 13)}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-gray-500">
                  <Clock className="w-3 h-3" />
                  {timeAgo(alert.triggered_at)}
                </div>
              </div>

              {/* Tourist name */}
              <div className="text-sm font-semibold text-gray-200 mb-1">
                {alert.tourist_name || "Unknown Tourist"}
              </div>

              {/* Trigger reason */}
              <p className="text-xs text-gray-400 line-clamp-2 mb-2">
                {alert.trigger_reason}
              </p>

              {/* Bottom row: coords + view button */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-[10px] text-gray-500">
                  <MapPin className="w-3 h-3" />
                  {alert.latitude?.toFixed(4)}°N, {alert.longitude?.toFixed(4)}°E
                </div>
                <span className="text-[10px] text-blue-400 font-medium flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  View Details
                  <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
