import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Sparkles, Clock, CheckCircle2, AlertCircle, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ExecutionVisualizer, type AgentStep } from "@/components/ExecutionVisualizer";
import { TerminalLogs, type LogEntry } from "@/components/TerminalLogs";
import { ResultsArea } from "@/components/ResultsArea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

import { Bot, TrendingUp, FileText, BarChart3 } from "lucide-react";

const pipelineSteps: AgentStep[] = [
  { id: "1", name: "Research Agent", description: "Gathering intelligence and context", icon: Bot, status: "pending" },
  {
    id: "2",
    name: "Financial Analyst",
    description: "Analyzing data and projections",
    icon: TrendingUp,
    status: "pending",
  },
  {
    id: "3",
    name: "Report Generator",
    description: "Compiling final executive report",
    icon: FileText,
    status: "pending",
  },
  {
    id: "4",
    name: "Chart Data Extractor",
    description: "Extracting business intelligence and chart data",
    icon: BarChart3,
    status: "pending",
  },
];

export interface TopCompetitor {
  name: string;
  value: number;
}

export interface ChartDataPayload {
  marketScore: number;
  revenueProjected: number;
  riskFactor: string;
  chartData: number[];
  topCompetitors?: TopCompetitor[];
}

const recentTasks = [
  { id: 1, name: "Q3 Market Analysis — SaaS Vertical", status: "completed", time: "2 min ago" },
  { id: 2, name: "Competitor Pricing Intelligence Report", status: "completed", time: "1 hour ago" },
  { id: 3, name: "Regulatory Compliance Check — EU Markets", status: "failed", time: "3 hours ago" },
  { id: 4, name: "Customer Acquisition Cost Optimization", status: "completed", time: "Yesterday" },
];

function parseChartJson(raw: string): ChartDataPayload | null {
  try {
    // Robust: extract JSON from triple-backtick code block even with surrounding text
    const match = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
    const jsonStr = match ? match[1].trim() : raw.trim();
    const parsed = JSON.parse(jsonStr);
    const competitors: TopCompetitor[] = Array.isArray(parsed.topCompetitors)
      ? parsed.topCompetitors.map((c: any) => ({ name: String(c.name || "Unknown"), value: Number(c.value) || 0 }))
      : [];
    return {
      marketScore: Number(parsed.marketScore) || 0,
      revenueProjected: Number(parsed.revenueProjected) || 0,
      riskFactor: parsed.riskFactor || "Unknown",
      chartData: Array.isArray(parsed.chartData) ? parsed.chartData.map(Number) : [],
      topCompetitors: competitors,
    };
  } catch {
    return null;
  }
}

const Dashboard = () => {
  const [taskInput, setTaskInput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [steps, setSteps] = useState<AgentStep[]>(pipelineSteps.map((s) => ({ ...s })));
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [finalReport, setFinalReport] = useState("");
  const [chartData, setChartData] = useState<ChartDataPayload | null>(null);
  const [chartLoading, setChartLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const addLog = useCallback((tag: string, message: string, type: LogEntry["type"] = "system") => {
    const now = new Date();
    const timestamp = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}`;
    setLogs((prev) => [...prev, { timestamp, tag, message, type }]);
  }, []);

  const setStepStatus = useCallback((index: number, status: AgentStep["status"]) => {
    setSteps((prev) =>
      prev.map((s, i) => ({
        ...s,
        status: i < index ? "completed" : i === index ? status : s.status,
      })),
    );
  }, []);

  const callStep = useCallback(async (step: string, userInput: string) => {
    const { data, error } = await supabase.functions.invoke("airia-proxy", {
      body: { userInput, step },
    });
    if (error) throw new Error(error.message || "Edge function error");
    if (data?.error) throw new Error(data.error);
    return data.output as string;
  }, []);

  const runPipeline = useCallback(async () => {
    if (!taskInput.trim() || isRunning) return;
    setIsRunning(true);
    setShowResults(false);
    setFinalReport("");
    setChartData(null);
    setChartLoading(false);
    setLogs([]);
    setSteps(pipelineSteps.map((s) => ({ ...s })));

    try {
      const raw = localStorage.getItem("airia-ops-api-usage");
      const usage = raw ? JSON.parse(raw) : { requests: 2847, avgResponse: 1.2, successRate: 99.7 };
      usage.requests += 4;
      usage.avgResponse = Math.max(0.3, +(usage.avgResponse + (Math.random() - 0.5) * 0.2).toFixed(1));
      usage.successRate = Math.min(100, +(usage.successRate + (Math.random() - 0.3) * 0.1).toFixed(1));
      localStorage.setItem("airia-ops-api-usage", JSON.stringify(usage));
    } catch {}

    try {
      // Step 1: Researcher
      addLog("System", "Initializing agent pipeline...", "system");
      setStepStatus(0, "active");
      addLog("System", "Research Agent activated", "system");
      addLog("Data", `Researcher Agent analyzing: "${taskInput.slice(0, 80)}..."`, "data");

      const researchOutput = await callStep("researcher", taskInput);
      setStepStatus(0, "completed");
      addLog("Success", "Research complete — handing off to Analyst", "success");
      addLog("Data", `Research snippet: "${researchOutput.slice(0, 120)}..."`, "data");

      // Step 2: Analyst
      setStepStatus(1, "active");
      addLog("System", "Financial Analyst agent activated", "system");
      addLog("Analysis", "Handing off research data to Financial Analyst...", "analysis");

      const analystOutput = await callStep("analyst", researchOutput);
      setStepStatus(1, "completed");
      addLog("Success", "Analysis complete — generating report", "success");
      addLog("Data", `Analysis snippet: "${analystOutput.slice(0, 120)}..."`, "data");

      // Step 3: Reporter
      setStepStatus(2, "active");
      addLog("System", "Report Generator activated", "system");
      addLog("Analysis", "Generating final executive report...", "analysis");

      const reporterOutput = await callStep("reporter", analystOutput);
      setStepStatus(2, "completed");
      addLog("Success", "✓ Report complete — extracting chart data", "success");

      setFinalReport(reporterOutput);
      setShowResults(true);

      // Step 4: Chart Data Extractor
      setStepStatus(3, "active");
      setChartLoading(true);
      addLog("System", "Chart Data Extractor activated", "system");
      addLog("Analysis", "Extracting business intelligence and chart data...", "analysis");

      const combinedInput = `Research:\n${researchOutput}\n\nAnalysis:\n${analystOutput}\n\nReport:\n${reporterOutput}`;
      const chartRaw = await callStep("chartExtractor", combinedInput);
      setStepStatus(3, "completed");

      const parsed = parseChartJson(chartRaw);
      if (parsed) {
        setChartData(parsed);
        addLog(
          "Success",
          `✓ Chart data extracted — Market Score: ${parsed.marketScore}, Revenue: $${parsed.revenueProjected}M, Risk: ${parsed.riskFactor}`,
          "success",
        );
      } else {
        addLog("Error", "Failed to parse chart data JSON from agent response", "error");
        addLog("Data", `Raw response: "${chartRaw.slice(0, 200)}..."`, "data");
      }
      setChartLoading(false);
      addLog("Success", "✓ Pipeline complete", "success");
    } catch (err: any) {
      addLog("Error", `Pipeline failed: ${err.message}`, "error");
      toast({ title: "Pipeline Error", description: err.message, variant: "destructive" });
      setSteps((prev) => prev.map((s) => (s.status === "active" ? { ...s, status: "pending" as const } : s)));
      setChartLoading(false);
    } finally {
      setIsRunning(false);
    }
  }, [taskInput, isRunning, addLog, setStepStatus, callStep]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Aymer Intelligence</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Scout the web, crunch the numbers, and deliver board-ready insights in real-time.
        </p>
      </div>

      <motion.div
        className={`glass rounded-xl p-5 transition-all duration-500 ${isRunning ? "glow-border" : ""}`}
        layout
      >
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-xs font-semibold text-foreground uppercase tracking-wider">New Task</span>
        </div>
        <Textarea
          value={taskInput}
          onChange={(e) => setTaskInput(e.target.value)}
          placeholder="Describe your analysis task... e.g., 'Analyze the competitive landscape of the B2B SaaS market in North America, focusing on pricing strategies, market share, and growth projections for 2026-2027.'"
          className="min-h-[100px] bg-secondary/30 border-border/50 text-foreground placeholder:text-muted-foreground/50 resize-none focus:ring-primary/30 text-sm"
          disabled={isRunning}
        />
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Pipeline:</span>
            <button className="flex items-center gap-1 glass rounded-lg px-2.5 py-1 text-xs text-foreground hover:bg-secondary/50 transition-colors">
              Full Analysis Suite <ChevronDown className="h-3 w-3 text-muted-foreground" />
            </button>
          </div>
          <Button
            onClick={runPipeline}
            disabled={!taskInput.trim() || isRunning}
            className="gradient-primary text-primary-foreground border-0 font-semibold px-6"
          >
            {isRunning ? (
              <>Executing...</>
            ) : (
              <>
                <Play className="h-4 w-4 mr-1.5" /> Execute
              </>
            )}
          </Button>
        </div>
      </motion.div>

      <AnimatePresence>
        {(isRunning || showResults) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 lg:grid-cols-5 gap-4"
          >
            <div className="lg:col-span-2 glass rounded-xl p-5">
              <h3 className="text-sm font-semibold text-foreground mb-4">Agent Pipeline</h3>
              <ExecutionVisualizer steps={steps} />
            </div>
            <div className="lg:col-span-3">
              <TerminalLogs logs={logs} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showResults && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.3 }}>
            <ResultsArea
              taskInput={taskInput}
              finalReport={finalReport}
              chartData={chartData}
              chartLoading={chartLoading}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="glass rounded-xl p-6 text-center">
        <h2 className="text-lg font-bold text-foreground mb-3">Stop Guessing. Start Dominating. 🚀</h2>
        <p className="text-sm text-foreground leading-relaxed max-w-2xl mx-auto">
          Found a <span className="font-semibold text-primary">"unicorn"</span> business idea or need a deep dive into a
          new market? Don't waste weeks on manual research. Aymer Intelligence does the heavy lifting while you focus on
          the vision.
        </p>
        <p className="text-xs text-muted-foreground mt-3">From raw chaos to Board-ready analytics in 60 seconds.</p>
      </div>
    </div>
  );
};

export default Dashboard;
