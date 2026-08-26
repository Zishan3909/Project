"""
TourGuard AI — e-FIR PDF Generator

Uses ReportLab to produce a formal, single-page Electronic First Information
Report PDF document.
"""

from __future__ import annotations

import io
from datetime import datetime, timezone

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.platypus import (
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)


def generate_efir_pdf(
    efir_id: str,
    tourist_name: str,
    nationality: str,
    tourist_id: str,
    alert_id: str,
    severity: str,
    latitude: float,
    longitude: float,
    trigger_reason: str,
    incident_summary: str,
    generated_at: str,
) -> bytes:
    """
    Build a single-page e-FIR PDF and return raw bytes.

    The caller is responsible for base64-encoding the output.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        leftMargin=2 * cm,
        rightMargin=2 * cm,
        topMargin=2 * cm,
        bottomMargin=2 * cm,
    )

    styles = getSampleStyleSheet()

    # Custom styles
    title_style = ParagraphStyle(
        "EFIRTitle",
        parent=styles["Title"],
        fontSize=18,
        spaceAfter=12,
        textColor=colors.HexColor("#1a237e"),
    )
    subtitle_style = ParagraphStyle(
        "EFIRSubtitle",
        parent=styles["Heading2"],
        fontSize=12,
        spaceAfter=8,
        textColor=colors.HexColor("#424242"),
    )
    body_style = ParagraphStyle(
        "EFIRBody",
        parent=styles["BodyText"],
        fontSize=10,
        leading=14,
        spaceAfter=6,
    )
    footer_style = ParagraphStyle(
        "EFIRFooter",
        parent=styles["Normal"],
        fontSize=8,
        textColor=colors.grey,
        alignment=1,  # center
    )

    # Build story
    story: list = []

    # Header
    story.append(Paragraph("TourGuard AI", title_style))
    story.append(Paragraph("Electronic First Information Report (e-FIR)", subtitle_style))
    story.append(Spacer(1, 0.5 * cm))

    # Details table
    severity_color = {
        "low": colors.HexColor("#4caf50"),
        "medium": colors.HexColor("#ff9800"),
        "high": colors.HexColor("#f44336"),
        "critical": colors.HexColor("#b71c1c"),
    }.get(severity.lower(), colors.black)

    table_data = [
        ["e-FIR ID", efir_id],
        ["Tourist Name", tourist_name],
        ["Nationality", nationality],
        ["Tourist ID", tourist_id],
        ["Alert ID", alert_id],
        ["Severity", severity.upper()],
        ["Location", f"{latitude:.6f}°N, {longitude:.6f}°E"],
        ["Trigger Reason", trigger_reason],
        ["Generated At", generated_at],
    ]

    detail_table = Table(table_data, colWidths=[5 * cm, 11 * cm])
    detail_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (0, -1), colors.HexColor("#e8eaf6")),
                ("TEXTCOLOR", (0, 0), (0, -1), colors.HexColor("#1a237e")),
                ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, -1), 10),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#bdbdbd")),
                ("TOPPADDING", (0, 0), (-1, -1), 4),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
                ("LEFTPADDING", (0, 0), (-1, -1), 6),
                # Highlight severity row
                ("TEXTCOLOR", (1, 5), (1, 5), severity_color),
                ("FONTNAME", (1, 5), (1, 5), "Helvetica-Bold"),
            ]
        )
    )
    story.append(detail_table)
    story.append(Spacer(1, 0.8 * cm))

    # Incident narrative
    story.append(Paragraph("Incident Summary", subtitle_style))
    story.append(Paragraph(incident_summary, body_style))
    story.append(Spacer(1, 1.5 * cm))

    # Footer
    now_str = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")
    story.append(
        Paragraph(
            f"This is a system-generated document by TourGuard AI. "
            f"Generated on {now_str}. Do not alter.",
            footer_style,
        )
    )

    doc.build(story)
    return buffer.getvalue()
