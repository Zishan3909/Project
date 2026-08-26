import React, { useEffect } from "react";
import { MapContainer, TileLayer, Polygon, Marker, useMap } from "react-leaflet";
import L from "leaflet";

const CORRIDOR_POLYGON = [
  [25.590, 91.880], [25.585, 91.910], [25.555, 91.885], [25.520, 91.875],
  [25.500, 91.865], [25.470, 91.855], [25.430, 91.825], [25.395, 91.810],
  [25.350, 91.780], [25.310, 91.760], [25.275, 91.745], [25.260, 91.720],
  [25.270, 91.715], [25.280, 91.725], [25.315, 91.740], [25.355, 91.765],
  [25.400, 91.785], [25.440, 91.810], [25.475, 91.835], [25.505, 91.842],
  [25.530, 91.855], [25.560, 91.870], [25.575, 91.878],
];

// Helper to center map when location changes
function Recenter({ lat, lon }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lon]);
  }, [lat, lon, map]);
  return null;
}

const userIcon = L.divIcon({
  className: "user-marker",
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

export default function LiveMap({ location }) {
  return (
    <div className="flex-1 mx-4 mt-4 mb-24 rounded-xl overflow-hidden shadow-inner border border-gray-200 relative z-10">
      <MapContainer
        center={[location.lat, location.lon]}
        zoom={12}
        className="h-full w-full"
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        <Polygon 
          positions={CORRIDOR_POLYGON} 
          pathOptions={{ color: "#22c55e", weight: 2, fillColor: "#22c55e", fillOpacity: 0.15 }} 
        />
        <Marker position={[location.lat, location.lon]} icon={userIcon} />
        <Recenter lat={location.lat} lon={location.lon} />
      </MapContainer>
      
      {/* Overlay status pill */}
      <div className="absolute top-2 left-2 z-[1000] bg-white/90 backdrop-blur px-2 py-1 rounded-md shadow-sm border border-gray-100">
        <span className="text-[10px] font-bold text-gray-700 tracking-wide uppercase">Live Tracking</span>
      </div>
    </div>
  );
}
