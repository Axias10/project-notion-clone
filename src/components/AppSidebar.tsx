import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  ChartLineUp,
  CheckSquare,
  FolderSimple,
  GearSix,
  House,
  MagnifyingGlass,
  Note,
  Target,
  UsersThree,
} from "@phosphor-icons/react";
import { NavLink } from "@/components/NavLink";
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
import { Input } from "@/components/ui/input";

const navigation = [
  { to: "/dashboard", label: "Vue d’ensemble", icon: House },
  { to: "/tasks", label: "Tâches", icon: CheckSquare },
  { to: "/projects", label: "Projets", icon: FolderSimple },
  { to: "/okrs", label: "OKR", icon: Target },
  { to: "/team", label: "Équipe", icon: UsersThree },
  { to: "/notes", label: "Notes", icon: Note },
  { to: "/reports", label: "Rapports", icon: ChartLineUp },
  { to: "/notifications", label: "Notifications", icon: Bell },
];

export function AppSidebar() {
  const { open } = useSidebar();
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter" || !searchQuery.trim()) return;

    const query = searchQuery.toLowerCase().trim();
    if (query.includes("tâche") || query.includes("tache") || query.includes("task")) {
      navigate("/tasks");
    } else if (query.includes("projet") || query.includes("project")) {
      navigate("/projects");
    } else if (query.includes("okr") || query.includes("objectif")) {
      navigate("/okrs");
    } else if (
      query.includes("équipe") ||
      query.includes("equipe") ||
      query.includes("team") ||
      query.includes("membre")
    ) {
      navigate("/team");
    } else if (query.includes("note")) {
      navigate("/notes");
    } else if (query.includes("notif") || query.includes("alerte")) {
      navigate("/notifications");
    } else if (
      query.includes("rapport") ||
      query.includes("report") ||
      query.includes("analytics") ||
      query.includes("stats")
    ) {
      navigate("/reports");
    } else if (query.includes("paramètre") || query.includes("setting")) {
      navigate("/settings");
    } else {
      navigate("/dashboard");
    }
    setSearchQuery("");
  };

  return (
    <Sidebar className="border-r border-sidebar-border/80">
      <SidebarContent className="flex h-full flex-col p-3">
        <div className="mb-7 px-1 pt-1">
          <div className="flex min-h-11 items-center gap-3 px-2">
            <span className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-xl bg-white p-1.5 shadow-sm dark:bg-[#eceee7]">
              <img
                src="/panth-logo.svg"
                alt=""
                className="h-full w-full object-contain"
              />
            </span>
            {open && (
              <span className="min-w-0 leading-tight">
                <span className="block truncate text-sm font-semibold tracking-[-0.02em]">
                  Pantheon
                </span>
                <span className="block truncate text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                  Capital Management
                </span>
              </span>
            )}
          </div>

          {open && (
            <div className="relative mt-5">
              <MagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Accès rapide"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                onKeyDown={handleSearch}
                className="h-9 rounded-xl border-0 bg-muted/55 pl-9 text-xs focus-visible:bg-background focus-visible:ring-1"
              />
              <kbd className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 rounded border bg-background px-1.5 py-0.5 font-mono text-[9px] text-muted-foreground">
                Entrée
              </kbd>
            </div>
          )}
        </div>

        <SidebarGroup className="p-0">
          {open && (
            <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Navigation
            </p>
          )}
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navigation.map(({ to, label, icon: Icon }) => (
                <SidebarMenuItem key={to}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={to}
                      className="group flex items-center gap-3 rounded-xl px-2.5 py-2 text-[13px] text-muted-foreground transition-[background-color,color,transform] duration-200 hover:translate-x-0.5 hover:bg-muted/70 hover:text-foreground"
                      activeClassName="bg-[#e6e9df] font-semibold text-[#20231e] dark:bg-[#282c25] dark:text-[#eef2e5]"
                    >
                      <Icon className="h-[18px] w-[18px] shrink-0" weight="duotone" />
                      {open && <span>{label}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className="mt-auto border-t border-sidebar-border/80 pt-3">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <NavLink
                  to="/settings"
                  className="group flex items-center gap-3 rounded-xl px-2.5 py-2 text-[13px] text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground"
                  activeClassName="bg-[#e6e9df] font-semibold text-[#20231e] dark:bg-[#282c25] dark:text-[#eef2e5]"
                >
                  <GearSix className="h-[18px] w-[18px] shrink-0" weight="duotone" />
                  {open && <span>Paramètres</span>}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
