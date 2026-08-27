import React, { useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  Polygon,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";

// ── Corridor Polygon (buffered Shillong → Cherrapunji route) ──
const CORRIDOR_POLYGON = [
  [25.590, 91.880],
  [25.585, 91.910],
  [25.555, 91.885],
  [25.520, 91.875],
  [25.500, 91.865],
  [25.470, 91.855],
  [25.430, 91.825],
  [25.395, 91.810],
  [25.350, 91.780],
  [25.310, 91.760],
  [25.275, 91.745],
  [25.260, 91.720],
  [25.270, 91.715],
  [25.280, 91.725],
  [25.315, 91.740],
  [25.355, 91.765],
  [25.400, 91.785],
  [25.440, 91.810],
  [25.475, 91.835],
  [25.505, 91.842],
  [25.530, 91.855],
  [25.560, 91.870],
  [25.575, 91.878],
];

const MAP_CENTER = [25.42, 91.80];
const MAP_ZOOM = 11;

// Custom div icons (rendered via CSS classes in index.css)
function createIcon(className) {
  return L.divIcon({
    className: "",
    html: `<div class="${className}"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}

const touristIcon = createIcon("tourist-marker");
const anomalyIcon = createIcon("anomaly-marker");

export default function MapPanel({ tourists, alerts, onAlertClick }) {
  const corridorOptions = useMemo(
    () => ({
      color: "#3b82f6",
      weight: 1.5,
      fillColor: "#3b82f6",
      fillOpacity: 0.08,
      dashArray: "6 4",
    }),
    []
  );

  // Set of tourist IDs with active alerts
  const alertedIds = useMemo(
    () => new Set(alerts.map((a) => a.tourist_id)),
    [alerts]
  );

  return (
    <div className="flex-1 relative">
      <MapContainer
        center={MAP_CENTER}
        zoom={MAP_ZOOM}
        className="h-full w-full"
        zoomControl={true}
        attributionControl={true}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          subdomains="abcd"
          maxZoom={19}
        />

        {/* Safe corridor polygon */}
        <Polygon positions={CORRIDOR_POLYGON} pathOptions={corridorOptions} />

        {/* Tourist markers (green) — skip tourists with active alerts */}
        {tourists
          .filter((t) => !alertedIds.has(t.id))
          .map((t) => (
            <Marker
              key={t.id}
              position={[t.lat, t.lon]}
              icon={touristIcon}
            >
              <Popup className="dark-popup">
                <div className="text-xs">
                  <div className="font-bold text-gray-800">{t.name}</div>
                  <div className="text-gray-600">
                    {t.nationality} · {t.speed} km/h · Battery {t.battery}%
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

        {/* Alert markers (red, pulsing) */}
        {alerts.map((a) => (
          <Marker
            key={a.alert_id}
            position={[a.latitude, a.longitude]}
            icon={anomalyIcon}
            eventHandlers={{
              click: () => onAlertClick(a),
            }}
          >
            <Popup>
              <div className="text-xs">
                <div className="font-bold text-red-600">
                  {a.severity.toUpperCase()} ALERT
                </div>
                <div className="text-gray-700">{a.tourist_name}</div>
                <div className="text-gray-500 mt-1 max-w-[200px]">
                  {a.trigger_reason}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Map overlay label */}
      <div className="absolute top-3 left-14 z-[1000] bg-panel-card/80 backdrop-blur border border-panel-border rounded px-3 py-1.5">
        <span className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">
          Shillong — Cherrapunji Corridor · Live
        </span>
      </div>
    </div>
  );
}
