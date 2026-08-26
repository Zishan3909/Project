import React from "react";
import {
  Shield,
  Users,
  AlertTriangle,
  ShieldAlert,
  Clock,
  Radio,
} from "lucide-react";
import KpiCard from "./KpiCard";

export default function HeaderBar({ alerts, touristCount }) {
  const criticalCount = alerts.filter(
    (a) => a.severity === "critical" || a.severity === "high"
  ).length;
  const cautionCount = alerts.filter(
    (a) => a.severity === "medium"
  ).length;

  return (
    <header className="bg-panel-card border-b border-panel-border px-5 py-3 flex items-center justify-between gap-4 shrink-0">
      {/* Left: Logo + System Health */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Shield className="w-7 h-7 text-blue-400" />
          <div>
            <h1 className="text-base font-bold text-gray-100 leading-tight tracking-wide">
              TOURGUARD AI
            </h1>
            <span className="text-[10px] text-gray-500 uppercase tracking-widest">
              Command Center
            </span>
          </div>
        </div>

        {/* System health dot */}
        <div className="flex items-center gap-1.5 bg-green-500/10 border border-green-500/30 rounded-full px-3 py-1">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          <span className="text-[10px] text-green-400 font-medium uppercase">
            System Online
          </span>
        </div>

        {/* Regional status */}
        <div className="hidden md:flex items-center gap-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full px-3 py-1">
          <Radio className="w-3 h-3 text-blue-400" />
          <span className="text-[10px] text-blue-300 font-medium uppercase tracking-wide">
            NE Corridor: Operational
          </span>
        </div>
      </div>

      {/* Right: KPIs */}
      <div className="flex items-center gap-3">
        <KpiCard
          icon={Users}
          label="Active Tourists"
          value={touristCount}
          color="blue"
        />
        <KpiCard
          icon={AlertTriangle}
          label="Caution Zones"
          value={cautionCount}
          color="amber"
        />
        <KpiCard
          icon={ShieldAlert}
          label="Critical Incidents"
          value={criticalCount}
          color="red"
        />
        <KpiCard
          icon={Clock}
          label="Avg Response"
          value="2.4m"
          color="green"
          subtext="last 24h"
        />
      </div>
    </header>
  );
}
