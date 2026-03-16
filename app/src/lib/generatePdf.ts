import jsPDF from "jspdf";
import "jspdf-autotable";
import type { ChartDataPayload } from "@/pages/Index";

interface PdfData {
  taskInput: string;
  finalReport: string;
  chartData: ChartDataPayload | null;
  monthLabels: string[];
  currentMonthName: string;
  year: number;
}

// Colors
const PRIMARY = [88, 118, 227] as const;    // hsl(230,80%,65%) approx
const ACCENT = [113, 75, 211] as const;     // hsl(250,70%,55%) approx
const DARK = [14, 17, 23] as const;
const GRAY = [120, 130, 150] as const;
const LIGHT = [230, 233, 240] as const;
const WHITE = [255, 255, 255] as const;
const SUCCESS = [64, 191, 128] as const;
const WARNING = [230, 180, 40] as const;
const DANGER = [210, 70, 70] as const;

function drawGradientRect(doc: jsPDF, x: number, y: number, w: number, h: number, from: readonly number[], to: readonly number[], steps = 40) {
  const stepW = w / steps;
  for (let i = 0; i < steps; i++) {
    const t = i / steps;
    const r = Math.round(from[0] + (to[0] - from[0]) * t);
    const g = Math.round(from[1] + (to[1] - from[1]) * t);
    const b = Math.round(from[2] + (to[2] - from[2]) * t);
    doc.setFillColor(r, g, b);
    doc.rect(x + i * stepW, y, stepW + 0.5, h, "F");
  }
}

function drawMetricCard(doc: jsPDF, x: number, y: number, w: number, label: string, value: string, color: readonly number[]) {
  // Card background
  doc.setFillColor(245, 246, 250);
  doc.roundedRect(x, y, w, 32, 3, 3, "F");

  // Left accent bar
  doc.setFillColor(color[0], color[1], color[2]);
  doc.roundedRect(x, y, 3, 32, 1.5, 1.5, "F");

  // Label
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(GRAY[0], GRAY[1], GRAY[2]);
  doc.text(label.toUpperCase(), x + 10, y + 12);

  // Value
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(DARK[0], DARK[1], DARK[2]);
  doc.text(value, x + 10, y + 26);
}

function drawBarChart(doc: jsPDF, x: number, y: number, w: number, h: number, data: { label: string; value: number; forecast: boolean }[]) {
  if (data.length === 0) return;

  const maxVal = Math.max(...data.map((d) => d.value), 1);
  const barW = (w - (data.length - 1) * 4) / data.length;
  const chartH = h - 18;

  // Grid lines
  doc.setDrawColor(220, 222, 228);
  doc.setLineWidth(0.2);
  for (let i = 0; i <= 4; i++) {
    const gy = y + chartH - (chartH / 4) * i;
    doc.line(x, gy, x + w, gy);
    doc.setFontSize(6);
    doc.setTextColor(GRAY[0], GRAY[1], GRAY[2]);
    doc.text(String(Math.round((maxVal / 4) * i)), x - 2, gy + 1, { align: "right" });
  }

  data.forEach((d, i) => {
    const barH = (d.value / maxVal) * chartH;
    const bx = x + i * (barW + 4);
    const by = y + chartH - barH;

    if (d.forecast) {
      doc.setFillColor(PRIMARY[0], PRIMARY[1], PRIMARY[2]);
      doc.setGState(new (doc as any).GState({ opacity: 0.35 }));
    } else {
      doc.setFillColor(PRIMARY[0], PRIMARY[1], PRIMARY[2]);
      doc.setGState(new (doc as any).GState({ opacity: 1 }));
    }
    doc.roundedRect(bx, by, barW, barH, 2, 2, "F");
    doc.setGState(new (doc as any).GState({ opacity: 1 }));

    // Label
    doc.setFontSize(7);
    doc.setTextColor(GRAY[0], GRAY[1], GRAY[2]);
    doc.text(d.label, bx + barW / 2, y + chartH + 8, { align: "center" });
  });
}

function drawHorizontalBarChart(doc: jsPDF, x: number, y: number, w: number, data: { name: string; value: number }[]) {
  if (data.length === 0) return;
  const maxVal = Math.max(...data.map((d) => d.value), 1);
  const barH = 10;
  const gap = 4;
  const labelW = 50;

  data.forEach((d, i) => {
    const by = y + i * (barH + gap);
    const barW = ((w - labelW) * d.value) / maxVal;

    // Label
    doc.setFontSize(8);
    doc.setTextColor(DARK[0], DARK[1], DARK[2]);
    doc.text(d.name, x, by + 7, { maxWidth: labelW - 4 });

    // Bar background
    doc.setFillColor(235, 237, 242);
    doc.roundedRect(x + labelW, by, w - labelW, barH, 2, 2, "F");

    // Bar fill
    doc.setFillColor(ACCENT[0], ACCENT[1], ACCENT[2]);
    doc.roundedRect(x + labelW, by, barW, barH, 2, 2, "F");

    // Value
    doc.setFontSize(7);
    doc.setTextColor(WHITE[0], WHITE[1], WHITE[2]);
    if (barW > 20) {
      doc.text(String(d.value), x + labelW + barW - 4, by + 7, { align: "right" });
    }
  });
}

function drawGaugeArc(doc: jsPDF, cx: number, cy: number, r: number, value: number) {
  // Background arc
  doc.setDrawColor(220, 222, 228);
  doc.setLineWidth(6);
  const steps = 60;
  for (let i = 0; i < steps; i++) {
    const a1 = Math.PI + (Math.PI * i) / steps;
    const a2 = Math.PI + (Math.PI * (i + 1)) / steps;
    const t = i / steps;
    if (t <= value / 100) {
      doc.setDrawColor(PRIMARY[0], PRIMARY[1], PRIMARY[2]);
    } else {
      doc.setDrawColor(230, 232, 238);
    }
    doc.line(cx + Math.cos(a1) * r, cy + Math.sin(a1) * r, cx + Math.cos(a2) * r, cy + Math.sin(a2) * r);
  }

  // Center value
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(DARK[0], DARK[1], DARK[2]);
  doc.text(`${value}%`, cx, cy + 2, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(GRAY[0], GRAY[1], GRAY[2]);
  doc.text("Market Attractiveness", cx, cy + 10, { align: "center" });
}

function stripMarkdown(md: string): string {
  return md
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/`{1,3}[^`]*`{1,3}/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/^[-*+]\s+/gm, "• ")
    .replace(/^\d+\.\s+/gm, "")
    .replace(/\n{3,}/g, "\n\n");
}

export function generateReport(data: PdfData) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = 210;
  const margin = 16;
  const contentW = pageW - margin * 2;
  let curY = 0;

  // ===== HEADER =====
  drawGradientRect(doc, 0, 0, pageW, 48, [30, 40, 70], [55, 65, 120]);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(WHITE[0], WHITE[1], WHITE[2]);
  doc.text("Airia Ops", margin, 20);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(200, 210, 235);
  doc.text("Executive Intelligence Report", margin, 28);

  doc.setFontSize(8);
  doc.text(`Generated: ${data.currentMonthName} ${data.year}`, margin, 36);

  // Decorative line
  doc.setFillColor(PRIMARY[0], PRIMARY[1], PRIMARY[2]);
  doc.rect(margin, 44, 30, 1.5, "F");

  curY = 56;

  // ===== TASK OVERVIEW =====
  if (data.taskInput) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(GRAY[0], GRAY[1], GRAY[2]);
    doc.text("TASK OVERVIEW", margin, curY);
    curY += 5;

    doc.setFillColor(248, 249, 252);
    doc.roundedRect(margin, curY, contentW, 16, 2, 2, "F");
    doc.setFillColor(PRIMARY[0], PRIMARY[1], PRIMARY[2]);
    doc.roundedRect(margin, curY, 2, 16, 1, 1, "F");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(DARK[0], DARK[1], DARK[2]);
    const taskLines = doc.splitTextToSize(data.taskInput, contentW - 12);
    doc.text(taskLines.slice(0, 2), margin + 8, curY + 7);
    curY += 24;
  }

  // ===== KEY METRICS =====
  if (data.chartData) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(GRAY[0], GRAY[1], GRAY[2]);
    doc.text("KEY METRICS", margin, curY);
    curY += 5;

    const cardW = (contentW - 8) / 3;
    const riskColor = data.chartData.riskFactor === "Low" ? SUCCESS : data.chartData.riskFactor === "High" ? DANGER : WARNING;

    drawMetricCard(doc, margin, curY, cardW, "Market Score", String(data.chartData.marketScore), PRIMARY);
    drawMetricCard(doc, margin + cardW + 4, curY, cardW, "Risk Factor", data.chartData.riskFactor, riskColor);
    drawMetricCard(doc, margin + (cardW + 4) * 2, curY, cardW, "Revenue Proj.", `$${data.chartData.revenueProjected}M`, ACCENT);

    curY += 40;
  }

  // ===== CHARTS ROW =====
  if (data.chartData) {
    // Revenue Trend
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(GRAY[0], GRAY[1], GRAY[2]);
    doc.text("REVENUE TREND", margin, curY);

    // Legend
    doc.setFontSize(6);
    doc.setFillColor(PRIMARY[0], PRIMARY[1], PRIMARY[2]);
    doc.rect(margin + 50, curY - 3, 5, 3, "F");
    doc.setTextColor(GRAY[0], GRAY[1], GRAY[2]);
    doc.text("Historical", margin + 57, curY);
    doc.setFillColor(PRIMARY[0], PRIMARY[1], PRIMARY[2]);
    doc.setGState(new (doc as any).GState({ opacity: 0.35 }));
    doc.rect(margin + 77, curY - 3, 5, 3, "F");
    doc.setGState(new (doc as any).GState({ opacity: 1 }));
    doc.text("Forecast", margin + 84, curY);

    curY += 5;

    const chartAreaW = contentW * 0.6;
    const trendBars = (data.chartData.chartData || []).map((val, i) => ({
      label: data.monthLabels[i] || `M${i + 1}`,
      value: val,
      forecast: i >= 3,
    }));
    drawBarChart(doc, margin + 8, curY, chartAreaW - 8, 55, trendBars);

    // Market Attractiveness gauge
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(GRAY[0], GRAY[1], GRAY[2]);
    const gaugeX = margin + chartAreaW + 10;
    doc.text("MARKET ATTRACTIVENESS", gaugeX, curY - 5);
    drawGaugeArc(doc, gaugeX + (contentW - chartAreaW - 10) / 2, curY + 30, 22, data.chartData.marketScore);

    curY += 62;
  }

  // ===== COMPETITOR BENCHMARKING =====
  if (data.chartData?.topCompetitors?.length) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(GRAY[0], GRAY[1], GRAY[2]);
    doc.text("COMPETITOR BENCHMARKING", margin, curY);
    curY += 6;

    drawHorizontalBarChart(doc, margin, curY, contentW, data.chartData.topCompetitors);
    curY += data.chartData.topCompetitors.length * 14 + 8;
  }

  // ===== DIVIDER =====
  doc.setDrawColor(220, 222, 228);
  doc.setLineWidth(0.3);
  doc.line(margin, curY, margin + contentW, curY);
  curY += 8;

  // ===== FINAL REPORT =====
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(GRAY[0], GRAY[1], GRAY[2]);
  doc.text("ANALYSIS & FINDINGS", margin, curY);
  curY += 6;

  const reportText = stripMarkdown(data.finalReport);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(50, 55, 65);

  const lines = doc.splitTextToSize(reportText, contentW);
  const lineH = 4;
  const pageH = 297;
  const bottomMargin = 20;

  for (const line of lines) {
    if (curY + lineH > pageH - bottomMargin) {
      // Footer on current page
      drawPageFooter(doc, pageW, pageH, data);
      doc.addPage();
      curY = margin;
    }
    doc.text(line, margin, curY);
    curY += lineH;
  }

  // ===== FOOTER =====
  drawPageFooter(doc, pageW, pageH, data);

  doc.save(`airia-ops-report-${data.currentMonthName.toLowerCase()}-${data.year}.pdf`);
}

function drawPageFooter(doc: jsPDF, pageW: number, pageH: number, data: PdfData) {
  doc.setDrawColor(220, 222, 228);
  doc.setLineWidth(0.3);
  doc.line(16, pageH - 14, pageW - 16, pageH - 14);

  doc.setFontSize(6);
  doc.setTextColor(GRAY[0], GRAY[1], GRAY[2]);
  doc.text("Airia Ops — Confidential", 16, pageH - 9);
  doc.text(`${data.currentMonthName} ${data.year}`, pageW - 16, pageH - 9, { align: "right" });
}
