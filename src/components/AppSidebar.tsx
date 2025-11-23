import { useState } from "react";
import { Search, Settings, Trash2, Home, CheckSquare, FolderKanban, Target, Users, Bell, FileText } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";

export function AppSidebar() {
  const { open } = useSidebar();
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <Sidebar className="border-r border-border/50">
      <SidebarContent className="p-4">
        <div className="mb-8">
          <h2 className="px-3 text-[15px] font-bold mb-5 text-foreground tracking-tight">
            TeamHub
          </h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-[14px] w-[14px] text-muted-foreground" />
            <Input
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-8 text-sm bg-muted/40 border-0 focus-visible:ring-0 focus-visible:bg-muted/60 transition-all rounded-md"
            />
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-0.5">
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink
                    to="/dashboard"
                    className="flex items-center gap-2.5 px-2 py-1.5 rounded-md text-[14px] hover:bg-muted/60 transition-colors group text-muted-foreground hover:text-foreground"
                    activeClassName="bg-muted/80 text-foreground font-medium"
                  >
                    <Home className="h-[18px] w-[18px]" />
                    {open && <span>Dashboard</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink
                    to="/tasks"
                    className="flex items-center gap-2.5 px-2 py-1.5 rounded-md text-[14px] hover:bg-muted/60 transition-colors group text-muted-foreground hover:text-foreground"
                    activeClassName="bg-muted/80 text-foreground font-medium"
                  >
                    <CheckSquare className="h-[18px] w-[18px]" />
                    {open && <span>Tâches</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink
                    to="/projects"
                    className="flex items-center gap-2.5 px-2 py-1.5 rounded-md text-[14px] hover:bg-muted/60 transition-colors group text-muted-foreground hover:text-foreground"
                    activeClassName="bg-muted/80 text-foreground font-medium"
                  >
                    <FolderKanban className="h-[18px] w-[18px]" />
                    {open && <span>Projets</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink
                    to="/okrs"
                    className="flex items-center gap-2.5 px-2 py-1.5 rounded-md text-[14px] hover:bg-muted/60 transition-colors group text-muted-foreground hover:text-foreground"
                    activeClassName="bg-muted/80 text-foreground font-medium"
                  >
                    <Target className="h-[18px] w-[18px]" />
                    {open && <span>OKRs</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink
                    to="/team"
                    className="flex items-center gap-2.5 px-2 py-1.5 rounded-md text-[14px] hover:bg-muted/60 transition-colors group text-muted-foreground hover:text-foreground"
                    activeClassName="bg-muted/80 text-foreground font-medium"
                  >
                    <Users className="h-[18px] w-[18px]" />
                    {open && <span>Équipe</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink
                    to="/notes"
                    className="flex items-center gap-2.5 px-2 py-1.5 rounded-md text-[14px] hover:bg-muted/60 transition-colors group text-muted-foreground hover:text-foreground"
                    activeClassName="bg-muted/80 text-foreground font-medium"
                  >
                    <FileText className="h-[18px] w-[18px]" />
                    {open && <span>Notes</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink
                    to="/notifications"
                    className="flex items-center gap-2.5 px-2 py-1.5 rounded-md text-[14px] hover:bg-muted/60 transition-colors group text-muted-foreground hover:text-foreground"
                    activeClassName="bg-muted/80 text-foreground font-medium"
                  >
                    <Bell className="h-[18px] w-[18px]" />
                    {open && <span>Notifications</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className="mt-auto pt-4 border-t border-border/30">
          <SidebarMenu className="space-y-0.5">
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <button className="flex items-center gap-2.5 px-2 py-1.5 rounded-md text-[14px] hover:bg-muted/60 transition-colors w-full text-muted-foreground hover:text-foreground">
                  <Settings className="h-[18px] w-[18px]" />
                  {open && <span>Paramètres</span>}
                </button>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <button className="flex items-center gap-2.5 px-2 py-1.5 rounded-md text-[14px] hover:bg-muted/60 transition-colors w-full text-muted-foreground hover:text-foreground">
                  <Trash2 className="h-[18px] w-[18px]" />
                  {open && <span>Corbeille</span>}
                </button>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
