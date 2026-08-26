import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const API_URL = `${API_BASE_URL}/api/v1`;

export const sendTelemetry = async (data) => {
  try {
    const response = await axios.post(`${API_URL}/telemetry/ping`, {
      tourist_id: data.tourist_id,
      lat: data.lat ?? data.latitude,
      lon: data.lon ?? data.longitude,
    });
    return response.data;
  } catch (error) {
    console.error("Failed to send telemetry:", error);
    return { lat: 20.0, lon: 0.0, risk_level: 'LOW', title: 'Backend Offline' };
  }
};

export const triggerSOS = async (tourist_id, lat, lon) => {
  try {
    const response = await axios.post(`${API_URL}/sos/trigger`, {
      tourist_id,
      lat,
      lon,
    });
    return response.data;
  } catch (error) {
    console.error("Failed to trigger SOS:", error);
    return { lat: 20.0, lon: 0.0, title: 'Backend Offline' };
  }
};
