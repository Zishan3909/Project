import React from "react";
import { QrCode, BadgeCheck } from "lucide-react";
import { translations } from "../utils/translations";
import { MOCK_TOURIST_ID } from "../services/api";

export default function DigitalIdCard({ language }) {
  const t = translations[language];

  return (
    <div className="mx-4 mt-4 bg-gradient-to-br from-blue-600 to-indigo-800 rounded-xl p-4 shadow-lg text-white">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-xs text-blue-200 uppercase font-bold tracking-wider mb-1">
            {t.digitalIdTitle}
          </h2>
          <div className="font-semibold text-lg">Amelia Thornton</div>
          <div className="text-xs text-blue-100 font-mono mt-1">ID: *****6789</div>
        </div>
        <div className="bg-white p-1.5 rounded-lg shadow-sm">
          <QrCode className="w-10 h-10 text-gray-900" />
        </div>
      </div>
      <div className="flex justify-between items-end border-t border-white/20 pt-3">
        <div className="flex items-center gap-1.5 bg-green-500/20 px-2 py-1 rounded-full text-[10px] font-medium border border-green-400/30">
          <BadgeCheck className="w-3.5 h-3.5 text-green-300" />
          <span className="text-green-50">{t.verified}</span>
        </div>
        <div className="text-[10px] text-blue-200">{t.validUntil}</div>
      </div>
    </div>
  );
}
