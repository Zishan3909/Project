import React, { useState } from "react";
import { Phone, Shield, Crosshair, X, CheckCircle2 } from "lucide-react";
import { translations } from "../utils/translations";

export default function SosButton({ language }) {
  const [showModal, setShowModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const t = translations[language];

  const handleSosClick = () => {
    setShowModal(true);
    // Simulate backend trigger
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <>
      {/* SOS Button Fixed at Bottom */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-center z-40">
        <button
          onClick={handleSosClick}
          className="bg-red-600 hover:bg-red-700 text-white font-black text-xl tracking-wider rounded-full w-40 h-16 shadow-[0_0_20px_rgba(220,38,38,0.5)] border-4 border-white animate-pulse-fast transition-transform active:scale-95"
        >
          {t.sosButton}
        </button>
      </div>

      {/* Emergency Overlay */}
      {showModal && (
        <div className="absolute inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          
          <div className="relative bg-white rounded-t-3xl p-6 shadow-2xl animate-[slideUp_0.3s_ease-out]">
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 bg-gray-100 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h3 className="text-lg font-bold text-gray-900 mb-4">{t.emergencyContacts}</h3>
            
            <div className="space-y-3">
              <a href="tel:112" className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100 active:bg-gray-100">
                <div className="bg-blue-100 text-blue-600 p-3 rounded-full"><Shield className="w-6 h-6" /></div>
                <div className="flex-1"><div className="font-bold text-gray-900">{t.police}</div><div className="text-sm text-gray-500">112</div></div>
                <Phone className="w-5 h-5 text-gray-400" />
              </a>
              
              <a href="tel:1363" className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100 active:bg-gray-100">
                <div className="bg-green-100 text-green-600 p-3 rounded-full"><Crosshair className="w-6 h-6" /></div>
                <div className="flex-1"><div className="font-bold text-gray-900">{t.touristHelpline}</div><div className="text-sm text-gray-500">1363</div></div>
                <Phone className="w-5 h-5 text-gray-400" />
              </a>
            </div>
          </div>
          
          {/* Toast Notification inside mobile shell */}
          {showToast && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 w-[80%]">
              <CheckCircle2 className="w-6 h-6 text-green-400 shrink-0" />
              <span className="text-sm font-medium">{t.dispatchSent}</span>
            </div>
          )}
        </div>
      )}
    </>
  );
}
