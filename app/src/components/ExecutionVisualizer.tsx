import { motion, AnimatePresence } from "framer-motion";
import { Check, Loader2, Circle, Bot, TrendingUp, Shield, FileText } from "lucide-react";

export interface AgentStep {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  status: "pending" | "active" | "completed";
}

const defaultPipeline: AgentStep[] = [
  { id: "1", name: "Market Research Agent", description: "Gathering competitive intelligence and market trends", icon: Bot, status: "pending" },
  { id: "2", name: "Financial Analyst", description: "Processing financial data and projections", icon: TrendingUp, status: "pending" },
  { id: "3", name: "Compliance Officer", description: "Verifying regulatory compliance and risk factors", icon: Shield, status: "pending" },
  { id: "4", name: "Report Generator", description: "Compiling final analysis and recommendations", icon: FileText, status: "pending" },
];

interface Props {
  steps: AgentStep[];
}

export function ExecutionVisualizer({ steps }: Props) {
  return (
    <div className="space-y-1">
      {steps.map((step, i) => (
        <motion.div
          key={step.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1, duration: 0.4 }}
          className="flex items-start gap-4"
        >
          {/* Connector line + icon */}
          <div className="flex flex-col items-center">
            <motion.div
              className={`relative flex h-10 w-10 items-center justify-center rounded-xl border transition-all duration-500 ${
                step.status === "completed"
                  ? "border-success/50 bg-success/10"
                  : step.status === "active"
                  ? "glow-border glow-pulse bg-primary/10"
                  : "border-border bg-secondary/30"
              }`}
              animate={step.status === "active" ? { scale: [1, 1.05, 1] } : {}}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <AnimatePresence mode="wait">
                {step.status === "completed" ? (
                  <motion.div key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                    <Check className="h-4.5 w-4.5 text-success" />
                  </motion.div>
                ) : step.status === "active" ? (
                  <motion.div key="loader" initial={{ scale: 0 }} animate={{ scale: 1, rotate: 360 }} transition={{ rotate: { duration: 1.5, repeat: Infinity, ease: "linear" } }}>
                    <Loader2 className="h-4.5 w-4.5 text-primary" />
                  </motion.div>
                ) : (
                  <step.icon className="h-4 w-4 text-muted-foreground" />
                )}
              </AnimatePresence>
            </motion.div>
            {i < steps.length - 1 && (
              <div className={`w-px h-8 transition-colors duration-500 ${
                step.status === "completed" ? "bg-success/30" : "bg-border"
              }`} />
            )}
          </div>

          {/* Content */}
          <div className="pt-1.5 pb-4">
            <p className={`text-sm font-semibold transition-colors ${
              step.status === "active" ? "text-foreground glow-text" : step.status === "completed" ? "text-foreground" : "text-muted-foreground"
            }`}>
              {step.name}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">{step.description}</p>
            {step.status === "active" && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 flex items-center gap-1.5"
              >
                <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                <span className="text-[11px] text-primary font-medium">Processing...</span>
              </motion.div>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export { defaultPipeline };
