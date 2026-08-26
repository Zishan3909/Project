import { jsPDF } from "jspdf";

export const generateEfir = (alert) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("STATE POLICE - AUTOMATED TOURIST INCIDENT REPORT", 105, 20, { align: "center" });
  
  // Basic Info
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(`Date/Time generated: ${new Date().toLocaleString()}`, 20, 40);
  doc.text(`Alert ID: ${alert.alert_id}`, 20, 50);
  
  // Tourist Information Section
  doc.setFont("helvetica", "bold");
  doc.text("Tourist Information:", 20, 70);
  doc.setFont("helvetica", "normal");
  doc.text("Name: John Doe", 20, 80);
  doc.text(`Tourist ID: ${alert.tourist_id || "TG-8842"}`, 20, 90);
  
  // Requirement: Exact KYC wording
  doc.setFont("helvetica", "bold");
  doc.text("Primary KYC ID: [Aadhaar / Passport Omitted for Privacy compliance]", 20, 100);
  
  // Incident Details Section
  doc.text("Incident Details:", 20, 120);
  doc.setFont("helvetica", "normal");
  doc.text(`Severity: ${alert.severity}`, 20, 130);
  doc.text(`Trigger Reason: ${alert.trigger_reason}`, 20, 140);
  doc.text(`Coordinates: Lat ${alert.latitude} N, Lon ${alert.longitude} E`, 20, 150);
  
  // Save PDF
  doc.save(`EFIR_${alert.alert_id}.pdf`);
};
