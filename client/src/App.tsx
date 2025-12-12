import { useState } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useQuery, useMutation } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Settings, User, LogOut, Plus, CalendarPlus, Check, ChevronsUpDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { cn } from "@/lib/utils";
import type { Paciente, InsertCita } from "@shared/schema";

// Pages
import Dashboard from "@/pages/dashboard";
import Pacientes from "@/pages/pacientes";
import Citas from "@/pages/citas";
import Configuracion from "@/pages/configuracion";
import NotFound from "@/pages/not-found";
// DentalIQ pages
import PresupuestosAccionesHoy from "@/pages/presupuestos-acciones-hoy";
import PacientesAccionesHoy from "@/pages/pacientes-acciones-hoy";
import PresupuestosDashboard from "@/pages/presupuestos-dashboard";
import Presupuestos from "@/pages/presupuestos";
import Acciones from "@/pages/acciones";
import PacientesRelances from "@/pages/pacientes-relances";
import CampanasRecalls from "@/pages/campanas-recalls";
import CampanasRecallsEditar from "@/pages/campanas-recalls-editar";
import CampanasAccionesHoy from "@/pages/campanas-acciones-hoy";
import PacientesRecordatorios from "@/pages/pacientes-recordatorios";
import PacientesPostVisita from "@/pages/pacientes-post-visita";
import PresupuestoRelanceDetalle from "@/pages/presupuesto-relance-detalle";
import CampanasDashboard from "@/pages/campanas-dashboard";
import SaludPreventivaAcompanamiento from "@/pages/salud-preventiva-acompanamiento";
import AccionesDelDia from "@/pages/acciones-del-dia";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/acciones-del-dia" component={AccionesDelDia} />
      <Route path="/presupuestos" component={PresupuestosAccionesHoy} />
      <Route path="/presupuestos/seguimiento" component={PacientesRelances} />
      <Route path="/presupuestos/seguimiento/:id" component={PresupuestoRelanceDetalle} />
      <Route path="/acciones" component={Acciones} />
      <Route path="/campañas" component={CampanasAccionesHoy} />
      <Route path="/pacientes" component={Pacientes} />
      <Route path="/campañas/salud-preventiva" component={SaludPreventivaAcompanamiento} />
      <Route path="/campañas/recalls" component={CampanasRecalls} />
      <Route path="/campañas/recalls/editar" component={CampanasRecallsEditar} />
      <Route path="/citas/agenda" component={Citas} />
      <Route path="/citas/recordatorios" component={PacientesRecordatorios} />
      <Route path="/citas/post-visita" component={PacientesPostVisita} />
      <Route path="/configuracion" component={Configuracion} />
      <Route component={NotFound} />
    </Switch>
  );
}

function NuevaCitaModal() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [pacienteOpen, setPacienteOpen] = useState(false);
  const [selectedPaciente, setSelectedPaciente] = useState<Paciente | null>(null);
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  const [tipo, setTipo] = useState("revision");
  const [doctor, setDoctor] = useState("");
  const [sala, setSala] = useState("");
  const [notas, setNotas] = useState("");

  const { data: pacientes = [] } = useQuery<Paciente[]>({
    queryKey: ["/api/pacientes"],
  });

  const createCitaMutation = useMutation({
    mutationFn: async (data: InsertCita) => {
      return await apiRequest("POST", "/api/citas", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/citas"] });
      toast({
        title: "Cita creada",
        description: "La cita ha sido agendada correctamente",
      });
      resetForm();
      setOpen(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo crear la cita",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setSelectedPaciente(null);
    setFecha("");
    setHora("");
    setTipo("revision");
    setDoctor("");
    setSala("");
    setNotas("");
  };

  const handleSubmit = () => {
    if (!selectedPaciente || !fecha || !hora) {
      toast({
        title: "Campos requeridos",
        description: "Por favor selecciona un paciente, fecha y hora",
        variant: "destructive",
      });
      return;
    }

    const fechaHora = new Date(`${fecha}T${hora}`);

    createCitaMutation.mutate({
      pacienteId: selectedPaciente.id,
      pacienteNombre: selectedPaciente.nombre,
      telefono: selectedPaciente.telefono,
      fechaHora: fechaHora,
      duracionMinutos: 30,
      tipo,
      estado: "programada",
      doctor: doctor || null,
      sala: sala || null,
      notas: notas || null,
      origen: "presencial",
    });
  };

  const tiposCita = [
    { value: "revision", label: "Revisión" },
    { value: "limpieza", label: "Limpieza" },
    { value: "tratamiento", label: "Tratamiento" },
    { value: "consulta", label: "Consulta" },
    { value: "urgencia", label: "Urgencia" },
  ];

  const doctores = ["Dr. García", "Dra. Martínez", "Dr. López", "Dra. Rodríguez"];
  const salas = ["Sala 1", "Sala 2", "Sala 3", "Consulta Principal"];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" data-testid="button-nueva-cita">
          <Plus className="w-4 h-4 mr-1" />
          Nueva cita
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <CalendarPlus className="w-5 h-5 text-primary" />
            </div>
            <div>
              <DialogTitle>Nueva cita</DialogTitle>
              <DialogDescription>
                Agenda una cita rápidamente
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Selector de paciente */}
          <div className="space-y-2">
            <Label>Paciente *</Label>
            <Popover open={pacienteOpen} onOpenChange={setPacienteOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={pacienteOpen}
                  className="w-full justify-between font-normal"
                  data-testid="select-paciente"
                >
                  {selectedPaciente
                    ? selectedPaciente.nombre
                    : "Buscar paciente..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <Command>
                  <CommandInput placeholder="Buscar paciente..." />
                  <CommandList>
                    <CommandEmpty>No se encontraron pacientes</CommandEmpty>
                    <CommandGroup className="max-h-64 overflow-y-auto">
                      {pacientes.slice(0, 50).map((paciente) => (
                        <CommandItem
                          key={paciente.id}
                          value={paciente.nombre}
                          onSelect={() => {
                            setSelectedPaciente(paciente);
                            setPacienteOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedPaciente?.id === paciente.id
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          <div className="flex flex-col">
                            <span>{paciente.nombre}</span>
                            <span className="text-xs text-muted-foreground font-mono">
                              {paciente.telefono}
                            </span>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Fecha y hora */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fecha">Fecha *</Label>
              <Input
                id="fecha"
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                data-testid="input-fecha"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hora">Hora *</Label>
              <Input
                id="hora"
                type="time"
                value={hora}
                onChange={(e) => setHora(e.target.value)}
                data-testid="input-hora"
              />
            </div>
          </div>

          {/* Tipo de cita */}
          <div className="space-y-2">
            <Label>Tipo de cita</Label>
            <Select value={tipo} onValueChange={setTipo}>
              <SelectTrigger data-testid="select-tipo">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {tiposCita.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Doctor y Sala */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Doctor</Label>
              <Select value={doctor} onValueChange={setDoctor}>
                <SelectTrigger data-testid="select-doctor">
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  {doctores.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Sala</Label>
              <Select value={sala} onValueChange={setSala}>
                <SelectTrigger data-testid="select-sala">
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  {salas.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Notas */}
          <div className="space-y-2">
            <Label htmlFor="notas">Notas</Label>
            <Textarea
              id="notas"
              placeholder="Notas adicionales..."
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              rows={2}
              data-testid="textarea-notas"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={createCitaMutation.isPending}
            data-testid="button-guardar-cita"
          >
            {createCitaMutation.isPending ? "Guardando..." : "Agendar cita"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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
                <div className="flex items-center gap-3">
                  <NuevaCitaModal />
                  <UserMenu />
                </div>
              </header>
              <main className="flex-1 overflow-auto">
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
