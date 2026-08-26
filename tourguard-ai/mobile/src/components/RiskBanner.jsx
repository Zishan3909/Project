import React from "react";
import { AlertCircle, ShieldCheck, AlertTriangle } from "lucide-react";
import { translations } from "../utils/translations";

export default function RiskBanner({ riskLevel, language }) {
  const t = translations[language];

  let config = {
    bg: "bg-green-500",
    text: t.safeZone,
    icon: ShieldCheck,
    animation: ""
  };

  if (riskLevel === "medium") {
    config = {
      bg: "bg-yellow-500",
      text: t.cautionZone,
      icon: AlertTriangle,
      animation: ""
    };
  } else if (riskLevel === "high" || riskLevel === "critical") {
    config = {
      bg: "bg-red-600",
      text: t.warningZone,
      icon: AlertCircle,
      animation: "animate-pulse"
    };
  }

  const Icon = config.icon;

  return (
    <div className={`pt-8 pb-3 px-4 text-white flex items-center justify-center gap-2 shadow-md transition-colors duration-500 ${config.bg} ${config.animation} z-40 relative`}>
      <Icon className="w-5 h-5" />
      <span className="font-semibold text-sm tracking-wide">{config.text}</span>
    </div>
  );
}
