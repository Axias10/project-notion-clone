import { useState } from "react";
import { Search, Settings, Trash2, Home, CheckSquare, FolderKanban, Target, Users, Bell } from "lucide-react";
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
    <Sidebar className="border-r border-border">
      <SidebarContent className="p-3">
        <div className="mb-6">
          <h2 className="px-2 text-xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            📊 TeamHub
          </h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-primary/50 transition-all"
            />
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink
                    to="/dashboard"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/80 transition-all duration-200 hover:scale-[1.02] group"
                    activeClassName="bg-primary/10 text-primary font-medium shadow-sm"
                  >
                    <Home className="h-5 w-5 group-hover:scale-110 transition-transform" />
                    {open && <span>Dashboard</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink
                    to="/tasks"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/80 transition-all duration-200 hover:scale-[1.02] group"
                    activeClassName="bg-primary/10 text-primary font-medium shadow-sm"
                  >
                    <CheckSquare className="h-5 w-5 group-hover:scale-110 transition-transform" />
                    {open && <span>Tâches</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink
                    to="/projects"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/80 transition-all duration-200 hover:scale-[1.02] group"
                    activeClassName="bg-primary/10 text-primary font-medium shadow-sm"
                  >
                    <FolderKanban className="h-5 w-5 group-hover:scale-110 transition-transform" />
                    {open && <span>Projets</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink
                    to="/okrs"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/80 transition-all duration-200 hover:scale-[1.02] group"
                    activeClassName="bg-primary/10 text-primary font-medium shadow-sm"
                  >
                    <Target className="h-5 w-5 group-hover:scale-110 transition-transform" />
                    {open && <span>OKRs</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink
                    to="/team"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/80 transition-all duration-200 hover:scale-[1.02] group"
                    activeClassName="bg-primary/10 text-primary font-medium shadow-sm"
                  >
                    <Users className="h-5 w-5 group-hover:scale-110 transition-transform" />
                    {open && <span>Équipe</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink
                    to="/notifications"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/80 transition-all duration-200 hover:scale-[1.02] group"
                    activeClassName="bg-primary/10 text-primary font-medium shadow-sm"
                  >
                    <Bell className="h-5 w-5 group-hover:scale-110 transition-transform" />
                    {open && <span>Notifications</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className="mt-auto pt-4 border-t border-border/50">
          <SidebarMenu className="space-y-1">
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <button className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/80 transition-all duration-200 hover:scale-[1.02] w-full group">
                  <Settings className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
                  {open && <span>Paramètres</span>}
                </button>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <button className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/80 transition-all duration-200 hover:scale-[1.02] w-full group text-muted-foreground hover:text-foreground">
                  <Trash2 className="h-5 w-5 group-hover:scale-110 transition-transform" />
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
