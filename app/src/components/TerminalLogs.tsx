import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Terminal, Minimize2 } from "lucide-react";

interface LogEntry {
  timestamp: string;
  tag: string;
  message: string;
  type: "system" | "data" | "analysis" | "success" | "error";
}

const tagColors: Record<string, string> = {
  system: "text-primary",
  data: "text-warning",
  analysis: "text-accent",
  success: "text-success",
  error: "text-destructive",
};

interface Props {
  logs: LogEntry[];
}

export function TerminalLogs({ logs }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="glass rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/50">
        <div className="flex items-center gap-2">
          <Terminal className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-semibold text-foreground">System Logs</span>
          {logs.length > 0 && (
            <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full font-medium">
              {logs.length}
            </span>
          )}
        </div>
        <div className="flex gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-destructive/60" />
          <div className="h-2.5 w-2.5 rounded-full bg-warning/60" />
          <div className="h-2.5 w-2.5 rounded-full bg-success/60" />
        </div>
      </div>
      <div ref={scrollRef} className="h-44 overflow-y-auto p-3 terminal-font text-[11px] leading-relaxed">
        {logs.length === 0 ? (
          <p className="text-muted-foreground">Awaiting task execution...</p>
        ) : (
          logs.map((log, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
              className="flex gap-2"
            >
              <span className="text-muted-foreground/60 shrink-0">{log.timestamp}</span>
              <span className={`shrink-0 ${tagColors[log.type]}`}>[{log.tag}]</span>
              <span className="text-foreground/80">{log.message}</span>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}

export type { LogEntry };
