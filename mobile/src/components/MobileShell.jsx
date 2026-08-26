import React from "react";

export default function MobileShell({ children }) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 p-4">
      <div className="relative w-full max-w-[400px] h-[800px] max-h-[90vh] bg-white rounded-[3rem] shadow-2xl overflow-hidden border-[12px] border-gray-950 ring-4 ring-gray-800 flex flex-col">
        {/* Dynamic Island / Notch Mock */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-950 rounded-b-2xl z-50"></div>
        {children}
      </div>
    </div>
  );
}
