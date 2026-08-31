import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  BrowserRouter,
  Link,
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import {
  Bell,
  CircleNotch,
  List,
  Moon,
  SignOut,
  Sun,
  UserCircle,
} from "@phosphor-icons/react";
import { AppSidebar } from "@/components/AppSidebar";
import { ThemeProvider, useTheme } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AuthProvider } from "@/contexts/AuthContext";
import { useAuth } from "@/contexts/auth";
import { useToast } from "@/hooks/use-toast";
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
import Reports from "./pages/Reports";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import Settings from "./pages/Settings";

const queryClient = new QueryClient();

function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <CircleNotch className="h-4 w-4 animate-spin" />
          Ouverture de votre espace
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

function AppHeader() {
  const { theme, setTheme } = useTheme();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const email = user?.email || "Compte";

  const handleSignOut = async () => {
    const result = await signOut();

    if (result.ok === false) {
      toast({
        title: "Déconnexion impossible",
        description: result.message,
        variant: "destructive",
      });
      return;
    }

    queryClient.clear();
  };

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-border/60 bg-background/90 px-4 backdrop-blur-xl">
      <SidebarTrigger className="rounded-md p-2 transition-colors hover:bg-muted/80">
        <List className="h-5 w-5" />
      </SidebarTrigger>

      <div className="flex items-center gap-1.5">
        <Button asChild variant="ghost" size="icon" className="h-9 w-9 rounded-lg">
          <Link to="/notifications" aria-label="Ouvrir les notifications">
            <Bell className="h-4 w-4" />
          </Link>
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-lg"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label={theme === "dark" ? "Activer le thème clair" : "Activer le thème sombre"}
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="ml-1 h-9 gap-2 rounded-lg px-2 text-sm font-medium"
              aria-label="Ouvrir le menu du compte"
            >
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-primary text-xs font-semibold uppercase text-primary-foreground">
                {email.charAt(0)}
              </span>
              <span className="hidden max-w-44 truncate sm:block">{email}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuLabel className="font-normal">
              <span className="block text-xs text-muted-foreground">Compte connecté</span>
              <span className="mt-1 block truncate font-medium">{email}</span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/settings">
                <UserCircle className="mr-2 h-4 w-4" />
                Paramètres du compte
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => void handleSignOut()}
              className="text-destructive focus:text-destructive"
            >
              <SignOut className="mr-2 h-4 w-4" />
              Se déconnecter
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

function AppLayout() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <AppHeader />
          <main className="flex-1 overflow-auto bg-background">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light" storageKey="pcm-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/auth/reset" element={<ResetPassword />} />

              <Route element={<ProtectedRoute />}>
                <Route element={<AppLayout />}>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/tasks" element={<Tasks />} />
                  <Route path="/projects" element={<Projects />} />
                  <Route path="/okrs" element={<OKRs />} />
                  <Route path="/team" element={<Team />} />
                  <Route path="/notes" element={<Notes />} />
                  <Route path="/notifications" element={<Notifications />} />
                  <Route path="/reports" element={<Reports />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/page/:pageId" element={<Page />} />
                  <Route path="/old-index" element={<Index />} />
                  <Route path="*" element={<NotFound />} />
                </Route>
              </Route>
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
