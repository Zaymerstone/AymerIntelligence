import { LayoutDashboard, Bot, GitBranch, Zap } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const items = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Agent Library", url: "/agents", icon: Bot },
  { title: "Workflow Builder", url: "/workflows", icon: GitBranch },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarContent className="glass-strong pt-4">
        {/* Brand */}
        <div className="px-4 pb-6 pt-2">
          {!collapsed ? (
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary">
                <Zap className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                 <h1 className="text-base font-bold tracking-tight text-foreground">
                  Aymer Intelligence
                </h1>
                <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                  Agent Oversight
                </p>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary">
                <Zap className="h-5 w-5 text-primary-foreground" />
              </div>
            </div>
          )}
        </div>

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const isActive = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        end
                        className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                          isActive
                            ? "glass glow-border text-foreground"
                            : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                        }`}
                        activeClassName=""
                      >
                        <item.icon className="h-4.5 w-4.5 shrink-0" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Bottom status */}
        {!collapsed && (
          <div className="mt-auto p-4">
            <div className="glass rounded-lg p-3">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
                <span className="text-xs text-muted-foreground">All systems operational</span>
              </div>
            </div>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
