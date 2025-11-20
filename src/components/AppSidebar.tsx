import { useState } from "react";
import { ChevronDown, Plus, FileText, Folder, Search, Settings, Trash2 } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Page {
  id: string;
  title: string;
  icon: string;
}

export function AppSidebar() {
  const { open } = useSidebar();
  const [pages, setPages] = useState<Page[]>([
    { id: "1", title: "Getting Started", icon: "📝" },
    { id: "2", title: "Projects", icon: "📂" },
    { id: "3", title: "Tasks", icon: "✅" },
  ]);
  const [searchQuery, setSearchQuery] = useState("");

  const addNewPage = () => {
    const newPage: Page = {
      id: Date.now().toString(),
      title: "Untitled",
      icon: "📄",
    };
    setPages([...pages, newPage]);
  };

  return (
    <Sidebar className="border-r border-border">
      <SidebarContent className="p-3">
        <div className="mb-4 space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-muted/50 border-0 focus-visible:ring-1"
            />
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center justify-between px-2 text-xs font-medium text-muted-foreground">
            <span>Workspace</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5"
              onClick={addNewPage}
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-0.5">
              {pages.map((page) => (
                <SidebarMenuItem key={page.id}>
                  <SidebarMenuButton asChild className="group">
                    <NavLink
                      to={`/page/${page.id}`}
                      className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-hover transition-colors"
                      activeClassName="bg-muted text-foreground font-medium"
                    >
                      <span>{page.icon}</span>
                      {open && <span className="flex-1 text-sm">{page.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className="mt-auto pt-4 border-t border-border">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <button className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-hover transition-colors w-full">
                  <Settings className="h-4 w-4" />
                  {open && <span className="text-sm">Settings</span>}
                </button>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <button className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-hover transition-colors w-full">
                  <Trash2 className="h-4 w-4" />
                  {open && <span className="text-sm">Trash</span>}
                </button>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
