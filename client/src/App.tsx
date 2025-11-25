import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

// Pages
import Dashboard from "@/pages/dashboard";
import Importar from "@/pages/importar";
import Segmentacion from "@/pages/segmentacion";
import Campanas from "@/pages/campanas";
import StaffCalls from "@/pages/staff-calls";
import Configuracion from "@/pages/configuracion";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/importar" component={Importar} />
      <Route path="/segmentacion" component={Segmentacion} />
      <Route path="/campanas" component={Campanas} />
      <Route path="/staff-calls" component={StaffCalls} />
      <Route path="/configuracion" component={Configuracion} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SidebarProvider style={style as React.CSSProperties}>
          <div className="flex h-screen w-full">
            <AppSidebar />
            <div className="flex flex-col flex-1">
              <header className="flex items-center justify-between p-4 border-b border-border bg-background">
                <SidebarTrigger data-testid="button-sidebar-toggle" />
                <div className="text-xs text-muted-foreground">
                  Sistema de Reactivación de Pacientes
                </div>
              </header>
              <main className="flex-1 overflow-hidden">
                <Router />
              </main>
            </div>
          </div>
        </SidebarProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
