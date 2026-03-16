import { useState } from "react";
import { motion } from "framer-motion";
import { Bot, TrendingUp, FileText, BarChart3, MoreVertical, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";

const agents = [
  {
    name: "Market Research Agent",
    description: "Acts as the primary data acquisition layer. This agent autonomously scans global markets, identifies emerging trends, and conducts deep-dive competitor analysis.",
    icon: Bot,
    status: "active" as const,
    tags: ["Research", "Data Mining", "NLP"],
    mission: "Strategic Intelligence Gathering",
    fullDescription: "Acts as the primary data acquisition layer. This agent autonomously scans global markets, identifies emerging trends, and conducts deep-dive competitor analysis. It synthesizes vast amounts of unstructured web data into actionable market insights.",
    workflow: ["Real-time Web Intelligence", "Trend Identification", "Competitor Benchmarking"],
  },
  {
    name: "Financial Analyst",
    description: "Transforms qualitative market findings into robust financial models. Evaluates ROI, estimates burn rates, and projects potential revenue.",
    icon: TrendingUp,
    status: "active" as const,
    tags: ["Finance", "Modeling", "Statistics"],
    mission: "Fiscal Modeling & Projection",
    fullDescription: "Our specialized quantitative engine. It transforms qualitative market findings into robust financial models. By evaluating ROI, estimating burn rates, and projecting potential revenue, this agent provides the fiscal clarity needed for confident decision-making.",
    workflow: ["Quantitative Analysis", "Risk Assessment", "Financial Forecasting"],
  },
  {
    name: "Report Generator",
    description: "Aggregates complex outputs from research and financial agents, distilling them into high-level executive summaries.",
    icon: FileText,
    status: "active" as const,
    tags: ["Reporting", "Visualization", "NLG"],
    mission: "Executive Synthesis",
    fullDescription: "The master communicator of the pipeline. It aggregates the complex outputs from both research and financial agents, distilling them into a high-level executive summary. Designed for clarity and impact, it ensures that technical data is presented in a human-centric, professional format.",
    workflow: ["Data Aggregation", "Narrative Synthesis", "Professional Document Formatting"],
  },
  {
    name: "Chart Data Extractor",
    description: "Parses final reports to extract precise data points, ensuring dashboard gauges and charts reflect real-time intelligence.",
    icon: BarChart3,
    status: "active" as const,
    tags: ["Parsing", "JSON", "Visualization"],
    mission: "Visual Intelligence Engineering",
    fullDescription: "The bridge between raw analysis and visual clarity. This agent meticulously parses final reports to extract precise data points, ensuring that your dashboard gauges and charts reflect real-time intelligence with mathematical accuracy.",
    workflow: ["Text-to-Data Parsing", "JSON Structure Optimization", "Dynamic Visualization Feed"],
  },
];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

export default function AgentLibrary() {
  const [selectedAgent, setSelectedAgent] = useState<typeof agents[0] | null>(null);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Agent Library</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage and configure your AI agent fleet</p>
      </div>

      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
        {agents.map((agent) => (
          <motion.div
            key={agent.name}
            variants={item}
            className="glass rounded-xl p-5 group hover:glow-border transition-all duration-300 cursor-pointer"
            onClick={() => setSelectedAgent(agent)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl gradient-primary">
                <agent.icon className="h-5 w-5 text-primary-foreground" />
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
                <button
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
                  onClick={(e) => { e.stopPropagation(); }}
                >
                  <MoreVertical className="h-4 w-4" />
                </button>
              </div>
            </div>
            <h3 className="text-sm font-semibold text-foreground mb-1.5">{agent.name}</h3>
            <p className="text-xs text-muted-foreground mb-4 leading-relaxed">{agent.description}</p>
            <div className="flex flex-wrap gap-1.5">
              {agent.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-[10px] bg-secondary/60 text-muted-foreground border-0">
                  {tag}
                </Badge>
              ))}
            </div>
          </motion.div>
        ))}
      </motion.div>

      <Sheet open={!!selectedAgent} onOpenChange={(open) => !open && setSelectedAgent(null)}>
        <SheetContent className="bg-background border-border w-full sm:max-w-lg overflow-y-auto">
          {selectedAgent && (
            <>
              <SheetHeader className="mb-8">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-primary">
                    <selectedAgent.icon className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div>
                    <SheetTitle className="text-foreground text-lg">{selectedAgent.name}</SheetTitle>
                    <SheetDescription className="text-muted-foreground text-xs">Autonomous Pipeline Agent</SheetDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className="bg-success/20 text-success border-success/30 text-[10px]">
                    {selectedAgent.status}
                  </Badge>
                  {selectedAgent.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-[10px]">{tag}</Badge>
                  ))}
                </div>
              </SheetHeader>

              <div className="space-y-8">
                {/* Mission */}
                <div>
                  <h4 className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">Mission</h4>
                  <div className="glass rounded-lg p-4">
                    <p className="text-sm font-semibold text-foreground">{selectedAgent.mission}</p>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h4 className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">What This Agent Does</h4>
                  <div className="glass rounded-lg p-4">
                    <p className="text-sm text-foreground/80 leading-relaxed">{selectedAgent.fullDescription}</p>
                  </div>
                </div>

                {/* Workflow */}
                <div>
                  <h4 className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">Workflow Pipeline</h4>
                  <div className="space-y-0">
                    {selectedAgent.workflow.map((step, i) => (
                      <div key={step} className="flex items-center gap-3">
                        <div className="flex flex-col items-center">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full gradient-primary text-primary-foreground text-xs font-bold">
                            {i + 1}
                          </div>
                          {i < selectedAgent.workflow.length - 1 && (
                            <div className="w-px h-6 bg-border" />
                          )}
                        </div>
                        <div className="glass rounded-lg px-4 py-2.5 flex-1">
                          <span className="text-sm font-medium text-foreground">{step}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
