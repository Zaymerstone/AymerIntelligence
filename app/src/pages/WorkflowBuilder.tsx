import { useCallback } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  addEdge,
  type Node,
  type Edge,
  type Connection,
  Handle,
  Position,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Bot, TrendingUp, FileText, BarChart3 } from "lucide-react";

const iconMap: Record<string, React.ElementType> = {
  Bot, TrendingUp, FileText, BarChart3,
};

function AgentNode({ data }: { data: { label: string; icon: string } }) {
  const Icon = iconMap[data.icon] || Bot;
  return (
    <div className="glass glow-border rounded-xl px-5 py-4 min-w-[180px] cursor-grab active:cursor-grabbing">
      <Handle type="target" position={Position.Left} className="!bg-primary !border-primary/50 !w-2.5 !h-2.5" />
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg gradient-primary flex items-center justify-center shrink-0">
          <Icon className="h-5 w-5 text-primary-foreground" />
        </div>
        <span className="text-sm font-semibold text-foreground whitespace-nowrap">{data.label}</span>
      </div>
      <Handle type="source" position={Position.Right} className="!bg-primary !border-primary/50 !w-2.5 !h-2.5" />
    </div>
  );
}

const nodeTypes = { agent: AgentNode };

const initialNodes: Node[] = [
  { id: "1", type: "agent", position: { x: 50, y: 180 }, data: { label: "Market Research", icon: "Bot" } },
  { id: "2", type: "agent", position: { x: 350, y: 180 }, data: { label: "Financial Analyst", icon: "TrendingUp" } },
  { id: "3", type: "agent", position: { x: 650, y: 180 }, data: { label: "Report Generator", icon: "FileText" } },
  { id: "4", type: "agent", position: { x: 950, y: 180 }, data: { label: "Chart Data Extractor", icon: "BarChart3" } },
];

const initialEdges: Edge[] = [
  { id: "e1-2", source: "1", target: "2", animated: true, style: { stroke: "hsl(230,80%,65%)", strokeWidth: 2 } },
  { id: "e2-3", source: "2", target: "3", animated: true, style: { stroke: "hsl(230,80%,65%)", strokeWidth: 2 } },
  { id: "e3-4", source: "3", target: "4", animated: true, style: { stroke: "hsl(250,70%,55%)", strokeWidth: 2 } },
];

export default function WorkflowBuilder() {
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection) =>
      setEdges((eds) =>
        addEdge({ ...params, animated: true, style: { stroke: "hsl(230,80%,65%)", strokeWidth: 2 } }, eds)
      ),
    [setEdges]
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Workflow Builder</h1>
        <p className="text-sm text-muted-foreground mt-1">Design and configure multi-agent pipelines — drag nodes to rearrange</p>
      </div>

      <div className="glass rounded-xl overflow-hidden" style={{ height: 520 }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          proOptions={{ hideAttribution: true }}
          style={{ background: "transparent" }}
        >
          <Background color="hsl(230,80%,65%)" gap={30} size={1} style={{ opacity: 0.06 }} />
          <Controls
            className="!bg-secondary !border-border !rounded-lg [&>button]:!bg-secondary [&>button]:!border-border [&>button]:!text-foreground [&>button:hover]:!bg-muted"
          />
        </ReactFlow>
      </div>
    </div>
  );
}
