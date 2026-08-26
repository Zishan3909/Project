import React from "react";

export default function KpiCard({ icon: Icon, label, value, color, subtext }) {
  const colorMap = {
    blue: "from-blue-500/20 to-blue-600/5 border-blue-500/30 text-blue-400",
    amber: "from-amber-500/20 to-amber-600/5 border-amber-500/30 text-amber-400",
    red: "from-red-500/20 to-red-600/5 border-red-500/30 text-red-400",
    green: "from-green-500/20 to-green-600/5 border-green-500/30 text-green-400",
  };

  const classes = colorMap[color] || colorMap.blue;

  return (
    <div
      className={`bg-gradient-to-br ${classes} border rounded-lg px-4 py-3 flex items-center gap-3 min-w-[180px]`}
    >
      <div className="shrink-0">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <div className="text-2xl font-bold text-gray-100 leading-tight">
          {value}
        </div>
        <div className="text-xs text-gray-400 uppercase tracking-wider">
          {label}
        </div>
        {subtext && (
          <div className="text-[10px] text-gray-500 mt-0.5">{subtext}</div>
        )}
      </div>
    </div>
  );
}
