import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ThemeProvider } from "@/components/theme-provider";
import Index from "./pages/Index";
import Page from "./pages/Page";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import Tasks from "./pages/Tasks";
import Projects from "./pages/Projects";
import OKRs from "./pages/OKRs";
import Team from "./pages/Team";
import Notifications from "./pages/Notifications";
import Notes from "./pages/Notes";
import { Menu } from "lucide-react";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light" storageKey="teamhub-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
        <SidebarProvider>
          <div className="flex min-h-screen w-full">
            <AppSidebar />
            <div className="flex-1 flex flex-col">
              <header className="h-14 border-b border-border/50 flex items-center px-6 bg-background/95 backdrop-blur-sm sticky top-0 z-10">
                <SidebarTrigger className="mr-4 hover:bg-muted/80 rounded-md p-2 transition-colors">
                  <Menu className="h-5 w-5" />
                </SidebarTrigger>
              </header>
              <main className="flex-1 bg-background">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/tasks" element={<Tasks />} />
                  <Route path="/projects" element={<Projects />} />
                  <Route path="/okrs" element={<OKRs />} />
                  <Route path="/team" element={<Team />} />
                  <Route path="/notes" element={<Notes />} />
                  <Route path="/notifications" element={<Notifications />} />
                  <Route path="/page/:pageId" element={<Page />} />
                  <Route path="/old-index" element={<Index />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
            </div>
          </div>
        </SidebarProvider>
      </BrowserRouter>
    </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
