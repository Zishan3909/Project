import axios from "axios";

const API_URL = "https://tourguard-api.onrender.com/api/v1";

export const fetchActiveAlerts = async () => {
  try {
    const response = await axios.get(`${API_URL}/alerts/active`);
    const data = response.data;
    // Handle both formats: array directly or { active_alerts: [...] }
    if (Array.isArray(data)) {
      return data;
    }
    return data.active_alerts || [];
  } catch (error) {
    console.error("Failed to fetch alerts:", error);
    return [{ alert_id: 'offline-safe', lat: 20.0, lon: 0.0, severity: 'CRITICAL', reason: 'Backend Offline - Simulated Data' }];
  }
};
