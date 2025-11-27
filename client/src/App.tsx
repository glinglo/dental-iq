import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Settings, User, LogOut } from "lucide-react";

// Pages
import Dashboard from "@/pages/dashboard";
import Importar from "@/pages/importar";
import Pacientes from "@/pages/pacientes";
import Campanas from "@/pages/campanas";
import CampanaDetalle from "@/pages/campana-detalle";
import StaffCalls from "@/pages/staff-calls";
import Configuracion from "@/pages/configuracion";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/importar" component={Importar} />
      <Route path="/pacientes" component={Pacientes} />
      <Route path="/campanas" component={Campanas} />
      <Route path="/campanas/:id" component={CampanaDetalle} />
      <Route path="/staff-calls" component={StaffCalls} />
      <Route path="/configuracion" component={Configuracion} />
      <Route component={NotFound} />
    </Switch>
  );
}

function UserMenu() {
  const [, setLocation] = useLocation();

  const handleConfiguracion = () => {
    setLocation("/configuracion");
  };

  const handleProfile = () => {
    // Placeholder para My Profile
  };

  const handleLogout = () => {
    // Placeholder para cerrar sesión
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button 
          className="focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-full"
          data-testid="button-user-menu"
        >
          <Avatar className="h-9 w-9 cursor-pointer hover-elevate">
            <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
              AD
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem 
          onClick={handleConfiguracion}
          data-testid="menu-item-configuracion"
          className="cursor-pointer"
        >
          <Settings className="mr-2 h-4 w-4" />
          Configuración
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={handleProfile}
          data-testid="menu-item-profile"
          className="cursor-pointer"
        >
          <User className="mr-2 h-4 w-4" />
          My profile
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={handleLogout}
          data-testid="menu-item-logout"
          className="cursor-pointer text-destructive focus:text-destructive"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Cerrar sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
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
              <header className="flex items-center justify-between gap-4 p-4 border-b border-border bg-background">
                <SidebarTrigger data-testid="button-sidebar-toggle" />
                <UserMenu />
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
