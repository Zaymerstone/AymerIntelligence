import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { TrendingUp, BarChart3, Target, Download, Copy, Loader2, FileText, Calendar } from "lucide-react";
import { BarChart, Bar, RadialBarChart, RadialBar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ComposedChart, Line, Area } from "recharts";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import ReactMarkdown from "react-markdown";
import type { ChartDataPayload } from "@/pages/Index";
import { generateReport } from "@/lib/generatePdf";

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function getDynamicMonthLabels(): { labels: string[]; currentMonthName: string; year: number } {
  const now = new Date();
  const currentMonth = now.getMonth(); // 0-indexed
  const labels: string[] = [];
  for (let i = -2; i <= 3; i++) {
    const idx = (currentMonth + i + 12) % 12;
    labels.push(MONTH_NAMES[idx]);
  }
  return { labels, currentMonthName: MONTH_NAMES[currentMonth], year: now.getFullYear() };
}

const container = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

interface ResultsAreaProps {
  taskInput?: string;
  finalReport?: string;
  chartData?: ChartDataPayload | null;
  chartLoading?: boolean;
}

export function ResultsArea({ taskInput = "", finalReport = "", chartData = null, chartLoading = false }: ResultsAreaProps) {
  const [exporting, setExporting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const { labels: monthLabels, currentMonthName, year } = useMemo(() => getDynamicMonthLabels(), []);

  const handleExport = () => {
    setExporting(true);
    toast({ title: "Generating PDF...", description: "Compiling report with charts and findings." });
    setTimeout(() => {
      try {
        generateReport({
          taskInput,
          finalReport,
          chartData,
          monthLabels,
          currentMonthName,
          year,
        });
        toast({ title: "PDF downloaded", description: "Your report has been saved." });
      } catch (e) {
        console.error("PDF generation error:", e);
        toast({ title: "Export failed", description: "Could not generate PDF.", variant: "destructive" });
      } finally {
        setExporting(false);
      }
    }, 500);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(finalReport);
    toast({ title: "Report copied to clipboard" });
  };

  // Revenue trend: first 3 = historical, last 3 = forecast
  const trendData = chartData?.chartData?.length
    ? chartData.chartData.map((val, i) => ({
        month: monthLabels[i] || `M${i + 1}`,
        value: val,
        type: i < 3 ? "history" : "forecast",
      }))
    : [];

  // Competitor benchmarking from topCompetitors
  const competitorData = chartData?.topCompetitors?.length
    ? chartData.topCompetitors.map((c) => ({ name: c.name, value: c.value }))
    : [];

  const radialValue = chartData?.marketScore ?? 0;
  const radialData = [{ name: "Confidence", value: radialValue, fill: "hsl(var(--primary))" }];

  const riskColor = chartData?.riskFactor === "Low" ? "text-success" : chartData?.riskFactor === "High" ? "text-destructive" : "text-yellow-400";

  const metrics = [
    { label: "Market Score", value: chartData ? `${chartData.marketScore}` : "—", icon: TrendingUp },
    { label: "Risk Factor", value: chartData?.riskFactor ?? "—", icon: Target, colorClass: chartData ? riskColor : "" },
    { label: "Revenue Proj.", value: chartData ? `$${chartData.revenueProjected}M` : "—", icon: BarChart3 },
  ];

  return (
    <>
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
        {/* Date sync label */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
          <Calendar className="h-3.5 w-3.5" />
          <span>Data as of {currentMonthName} {year}</span>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {metrics.map((m) => (
            <motion.div key={m.label} variants={item} className="glass rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{m.label}</span>
                <m.icon className="h-4 w-4 text-primary" />
              </div>
              {chartLoading ? (
                <Skeleton className="h-8 w-24 rounded" />
              ) : (
                <p className={`text-2xl font-bold ${(m as any).colorClass || "text-foreground"}`}>{m.value}</p>
              )}
            </motion.div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Revenue Trend with history/forecast split */}
          <motion.div variants={item} className="glass rounded-xl p-5 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-foreground">Revenue Trend</h3>
              <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1"><span className="inline-block w-2.5 h-2.5 rounded-sm bg-primary" /> Historical</span>
                <span className="flex items-center gap-1"><span className="inline-block w-2.5 h-2.5 rounded-sm bg-primary/40 border border-primary/60 border-dashed" /> Forecast</span>
              </div>
            </div>
            {chartLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-4 w-full rounded" />
                <Skeleton className="h-32 w-full rounded" />
              </div>
            ) : trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <ComposedChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,15%,18%)" />
                  <XAxis dataKey="month" tick={{ fill: "hsl(215,15%,55%)", fontSize: 11 }} axisLine={false} />
                  <YAxis tick={{ fill: "hsl(215,15%,55%)", fontSize: 11 }} axisLine={false} />
                  <Tooltip contentStyle={{ background: "hsl(220,18%,10%)", border: "1px solid hsl(220,15%,22%)", borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {trendData.map((entry, i) => (
                      <Cell
                        key={i}
                        fill={entry.type === "history" ? "hsl(230,80%,65%)" : "hsl(230,80%,65%)"}
                        fillOpacity={entry.type === "history" ? 1 : 0.35}
                        stroke={entry.type === "forecast" ? "hsl(230,80%,65%)" : undefined}
                        strokeWidth={entry.type === "forecast" ? 1.5 : 0}
                        strokeDasharray={entry.type === "forecast" ? "4 2" : undefined}
                      />
                    ))}
                  </Bar>
                  <Line type="monotone" dataKey="value" stroke="hsl(230,80%,65%)" strokeWidth={2} dot={{ fill: "hsl(230,80%,65%)", r: 3 }} strokeDasharray="0" />
                </ComposedChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground italic text-center py-12">Awaiting chart data…</p>
            )}
          </motion.div>

          {/* Market Attractiveness Gauge */}
          <motion.div variants={item} className="glass rounded-xl p-5 flex flex-col items-center justify-center">
            <h3 className="text-sm font-semibold mb-2 text-foreground">Market Attractiveness</h3>
            {chartLoading ? (
              <Skeleton className="h-40 w-40 rounded-full" />
            ) : radialValue > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={160}>
                  <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" data={radialData} startAngle={90} endAngle={-270}>
                    <RadialBar background={{ fill: "hsl(220,15%,14%)" }} dataKey="value" cornerRadius={10} />
                  </RadialBarChart>
                </ResponsiveContainer>
                <p className="text-3xl font-bold text-foreground -mt-4">{radialValue}%</p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground italic py-12">—</p>
            )}
          </motion.div>
        </div>

        {/* Competitor Benchmarking */}
        <motion.div variants={item} className="glass rounded-xl p-5">
          <h3 className="text-sm font-semibold mb-4 text-foreground">Competitor Benchmarking</h3>
          {chartLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-4 w-full rounded" />
              <Skeleton className="h-32 w-full rounded" />
            </div>
          ) : competitorData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={competitorData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,15%,18%)" horizontal={false} />
                <XAxis type="number" tick={{ fill: "hsl(215,15%,55%)", fontSize: 11 }} axisLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fill: "hsl(215,15%,55%)", fontSize: 11 }} axisLine={false} width={120} />
                <Tooltip contentStyle={{ background: "hsl(220,18%,10%)", border: "1px solid hsl(220,15%,22%)", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="value" fill="hsl(250,70%,55%)" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground italic text-center py-12">Awaiting competitor data…</p>
          )}
        </motion.div>

        {/* Final Report */}
        <motion.div variants={item} className="glass rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">Final Report</h3>
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" className="text-xs text-muted-foreground hover:text-foreground" onClick={handleCopy}>
                <Copy className="h-3.5 w-3.5 mr-1.5" /> Copy
              </Button>
              <Button size="sm" className="text-xs gradient-primary text-primary-foreground border-0" onClick={handleExport} disabled={exporting}>
                {exporting ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Download className="h-3.5 w-3.5 mr-1.5" />}
                {exporting ? "Generating..." : "Export PDF"}
              </Button>
            </div>
          </div>
          <div className="prose prose-invert max-w-none text-foreground/80 leading-relaxed prose-headings:text-foreground prose-headings:font-semibold prose-h1:text-2xl prose-h1:mb-4 prose-h1:mt-6 prose-h2:text-xl prose-h2:mb-3 prose-h2:mt-5 prose-h3:text-lg prose-h3:mb-2 prose-h3:mt-4 prose-p:mb-3 prose-p:text-sm prose-li:text-sm prose-ul:my-2 prose-ul:space-y-1 prose-ol:my-2 prose-ol:space-y-1 prose-strong:text-foreground prose-strong:font-semibold prose-a:text-primary prose-blockquote:border-l-primary/50 prose-blockquote:text-muted-foreground prose-hr:border-border/50 prose-code:text-primary prose-code:bg-secondary/50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-code:font-mono">
            {finalReport ? (
              <ReactMarkdown>{finalReport}</ReactMarkdown>
            ) : (
              <p className="text-muted-foreground italic">No report generated yet.</p>
            )}
          </div>
        </motion.div>
      </motion.div>

      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="glass border-border/50 max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <FileText className="h-5 w-5 text-primary" />
              Exported Report Preview
            </DialogTitle>
          </DialogHeader>
          <div className="rounded-lg bg-secondary/20 border border-border/30 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-muted-foreground">airia-ops-report.pdf</span>
              <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full font-medium">SAVED TO CLOUD</span>
            </div>
            <div className="border border-border/20 rounded-md bg-background/50 p-5 space-y-3 max-h-64 overflow-y-auto">
              <div className="text-center space-y-1">
                <p className="text-lg font-bold text-foreground">Airia Ops</p>
                <p className="text-xs text-muted-foreground uppercase tracking-widest">Executive Report</p>
                <div className="w-12 h-0.5 bg-primary mx-auto mt-2" />
              </div>
              <div className="prose prose-invert prose-xs max-w-none text-foreground/70 text-[11px] leading-relaxed">
                <ReactMarkdown>{finalReport.slice(0, 500) + (finalReport.length > 500 ? "\n\n..." : "")}</ReactMarkdown>
              </div>
            </div>
            <p className="text-xs text-muted-foreground text-center">Report saved to your dashboard cloud storage</p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
