import { useState, useMemo } from "react";
import { useParams, useLocation } from "wouter";
import { ArrowLeft, Users, CalendarCheck, MessageSquare, Clock, XCircle, Pause, Play, Phone, Mail, Search } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import type { Campana, Paciente } from "@shared/schema";

type EstadoPaciente = "pendiente" | "contactado" | "respondio" | "agendado" | "rechazado" | "sin_respuesta";

type PacienteCampana = Paciente & {
  estadoCampana: EstadoPaciente;
  ultimoContacto: string | null;
  pasoActual: number;
};

const estadoLabels: Record<EstadoPaciente, { label: string; color: string }> = {
  pendiente: { label: "Pendiente", color: "bg-muted text-muted-foreground" },
  contactado: { label: "Contactado", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  respondio: { label: "Respondió", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  agendado: { label: "Agendado", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  rechazado: { label: "Rechazado", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
  sin_respuesta: { label: "Sin respuesta", color: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400" },
};

function generarPacientesCampana(campana: Campana, pacientes: Paciente[]): PacienteCampana[] {
  const pacientesMuestra = pacientes.slice(0, campana.pacientesIncluidos ?? 0);
  
  return pacientesMuestra.map((paciente, index) => {
    let estadoCampana: EstadoPaciente;
    const random = Math.random();
    
    if (index < (campana.citasGeneradas ?? 0)) {
      estadoCampana = "agendado";
    } else if (random < 0.15) {
      estadoCampana = "rechazado";
    } else if (random < 0.35) {
      estadoCampana = "sin_respuesta";
    } else if (random < 0.55) {
      estadoCampana = "respondio";
    } else if (random < 0.75) {
      estadoCampana = "contactado";
    } else {
      estadoCampana = "pendiente";
    }

    const diasAtras = Math.floor(Math.random() * 14);
    const ultimoContacto = estadoCampana !== "pendiente" 
      ? new Date(Date.now() - diasAtras * 24 * 60 * 60 * 1000).toISOString()
      : null;

    return {
      ...paciente,
      estadoCampana,
      ultimoContacto,
      pasoActual: estadoCampana === "pendiente" ? 0 : Math.floor(Math.random() * campana.canales.length) + 1,
    };
  });
}

export default function CampanaDetalle() {
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [filtroEstado, setFiltroEstado] = useState<string>("todos");
  const [busqueda, setBusqueda] = useState("");

  const { data: campanas = [], isLoading: loadingCampanas } = useQuery<Campana[]>({
    queryKey: ["/api/campanas"],
  });

  const { data: pacientes = [], isLoading: loadingPacientes } = useQuery<Paciente[]>({
    queryKey: ["/api/pacientes"],
  });

  const campana = campanas.find(c => c.id === params.id);

  const pacientesCampana = useMemo(() => {
    if (!campana || pacientes.length === 0) return [];
    return generarPacientesCampana(campana, pacientes);
  }, [campana, pacientes]);

  const estadisticas = useMemo(() => {
    const total = pacientesCampana.length;
    const agendados = pacientesCampana.filter(p => p.estadoCampana === "agendado").length;
    const respondieron = pacientesCampana.filter(p => p.estadoCampana === "respondio" || p.estadoCampana === "agendado").length;
    const sinRespuesta = pacientesCampana.filter(p => p.estadoCampana === "sin_respuesta").length;
    const rechazados = pacientesCampana.filter(p => p.estadoCampana === "rechazado").length;
    
    return { total, agendados, respondieron, sinRespuesta, rechazados };
  }, [pacientesCampana]);

  const pacientesFiltrados = useMemo(() => {
    return pacientesCampana.filter(p => {
      const coincideBusqueda = busqueda === "" || 
        p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.email.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.telefono.includes(busqueda);
      
      const coincideEstado = filtroEstado === "todos" || p.estadoCampana === filtroEstado;
      
      return coincideBusqueda && coincideEstado;
    });
  }, [pacientesCampana, busqueda, filtroEstado]);

  const toggleEstadoMutation = useMutation({
    mutationFn: async (nuevoEstado: string) => {
      return await apiRequest("PATCH", `/api/campanas/${params.id}`, { estado: nuevoEstado });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/campanas"] });
      toast({
        title: campana?.estado === "activa" ? "Campaña pausada" : "Campaña reanudada",
        description: campana?.estado === "activa" 
          ? "La campaña ha sido pausada. No se enviarán más comunicaciones."
          : "La campaña se ha reanudado.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo cambiar el estado de la campaña.",
        variant: "destructive",
      });
    },
  });

  const handleToggleEstado = () => {
    const nuevoEstado = campana?.estado === "activa" ? "pausada" : "activa";
    toggleEstadoMutation.mutate(nuevoEstado);
  };

  const getCanalIcon = (canal: string) => {
    switch (canal) {
      case "WhatsApp": return SiWhatsapp;
      case "Email": return Mail;
      case "SMS": return MessageSquare;
      default: return Phone;
    }
  };

  if (loadingCampanas || loadingPacientes) {
    return (
      <div className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto p-6 space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (!campana) {
    return (
      <div className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto p-6">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Campaña no encontrada</p>
            <Button variant="outline" className="mt-4" onClick={() => setLocation("/campanas")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver a campañas
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setLocation("/campanas")}
              data-testid="button-volver"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-semibold text-foreground" data-testid="text-nombre-campana">
                {campana.nombre}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Creada el {campana.fechaCreacion && format(new Date(campana.fechaCreacion), "d 'de' MMMM, yyyy", { locale: es })}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Badge 
              variant={campana.estado === "activa" ? "default" : "secondary"}
              data-testid="badge-estado"
            >
              {campana.estado === "activa" ? "Activa" : campana.estado === "pausada" ? "Pausada" : "Completada"}
            </Badge>
            
            {campana.estado !== "completada" && (
              <Button
                variant={campana.estado === "activa" ? "outline" : "default"}
                onClick={handleToggleEstado}
                disabled={toggleEstadoMutation.isPending}
                data-testid="button-toggle-estado"
              >
                {campana.estado === "activa" ? (
                  <>
                    <Pause className="w-4 h-4 mr-2" />
                    Pausar campaña
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Reanudar campaña
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Secuencia de canales */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">Secuencia:</span>
          {campana.canales.map((canal, index) => {
            const Icon = getCanalIcon(canal);
            return (
              <div key={index} className="flex items-center gap-1">
                <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-muted/50 border border-border">
                  <Badge variant="outline" className="w-5 h-5 flex items-center justify-center p-0 text-xs">
                    {index + 1}
                  </Badge>
                  <Icon className="w-4 h-4" />
                  <span className="text-sm">{canal}</span>
                </div>
                {index < campana.canales.length - 1 && (
                  <span className="text-muted-foreground">→</span>
                )}
              </div>
            );
          })}
        </div>

        {/* KPIs simplificados */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card data-testid="kpi-total">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Users className="w-4 h-4" />
                <span className="text-xs">Total pacientes</span>
              </div>
              <div className="text-2xl font-bold">{estadisticas.total}</div>
            </CardContent>
          </Card>
          
          <Card data-testid="kpi-agendados">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <CalendarCheck className="w-4 h-4 text-green-500" />
                <span className="text-xs">Citas generadas</span>
              </div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{estadisticas.agendados}</div>
            </CardContent>
          </Card>
          
          <Card data-testid="kpi-respondieron">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <MessageSquare className="w-4 h-4 text-amber-500" />
                <span className="text-xs">Respondieron</span>
              </div>
              <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{estadisticas.respondieron}</div>
            </CardContent>
          </Card>
          
          <Card data-testid="kpi-sin-respuesta">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="text-xs">Sin respuesta</span>
              </div>
              <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">{estadisticas.sinRespuesta}</div>
            </CardContent>
          </Card>
          
          <Card data-testid="kpi-rechazados">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <XCircle className="w-4 h-4 text-red-500" />
                <span className="text-xs">Rechazos</span>
              </div>
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">{estadisticas.rechazados}</div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de pacientes */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <CardTitle className="text-lg">Pacientes en la campaña</CardTitle>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Buscar paciente..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className="pl-9 w-64"
                    data-testid="input-busqueda"
                  />
                </div>
                <Select value={filtroEstado} onValueChange={setFiltroEstado}>
                  <SelectTrigger className="w-40" data-testid="select-filtro-estado">
                    <SelectValue placeholder="Filtrar por estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="pendiente">Pendiente</SelectItem>
                    <SelectItem value="contactado">Contactado</SelectItem>
                    <SelectItem value="respondio">Respondió</SelectItem>
                    <SelectItem value="agendado">Agendado</SelectItem>
                    <SelectItem value="sin_respuesta">Sin respuesta</SelectItem>
                    <SelectItem value="rechazado">Rechazado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="border border-border rounded-lg overflow-hidden">
              {/* Header de la tabla */}
              <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-muted/50 border-b border-border text-sm font-medium text-muted-foreground">
                <div className="col-span-3">Paciente</div>
                <div className="col-span-2">Teléfono</div>
                <div className="col-span-3">Email</div>
                <div className="col-span-2">Paso actual</div>
                <div className="col-span-2">Estado</div>
              </div>
              
              {/* Filas */}
              <div className="max-h-96 overflow-y-auto">
                {pacientesFiltrados.length > 0 ? (
                  pacientesFiltrados.map((paciente, index) => {
                    const estadoInfo = estadoLabels[paciente.estadoCampana];
                    return (
                      <div 
                        key={paciente.id} 
                        className="grid grid-cols-12 gap-4 px-4 py-3 border-b border-border last:border-b-0 hover:bg-muted/30 transition-colors"
                        data-testid={`row-paciente-${index}`}
                      >
                        <div className="col-span-3">
                          <p className="font-medium text-foreground truncate">{paciente.nombre}</p>
                          {paciente.ultimoContacto && (
                            <p className="text-xs text-muted-foreground">
                              Último contacto: {format(new Date(paciente.ultimoContacto), "d MMM", { locale: es })}
                            </p>
                          )}
                        </div>
                        <div className="col-span-2 text-sm text-muted-foreground self-center">
                          {paciente.telefono}
                        </div>
                        <div className="col-span-3 text-sm text-muted-foreground self-center truncate">
                          {paciente.email}
                        </div>
                        <div className="col-span-2 self-center">
                          {paciente.pasoActual > 0 ? (
                            <div className="flex items-center gap-1.5">
                              <Badge variant="outline" className="text-xs">
                                Paso {paciente.pasoActual}/{campana.canales.length}
                              </Badge>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">No iniciado</span>
                          )}
                        </div>
                        <div className="col-span-2 self-center">
                          <Badge className={`${estadoInfo.color} border-0`}>
                            {estadoInfo.label}
                          </Badge>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="px-4 py-8 text-center text-muted-foreground">
                    No se encontraron pacientes con los filtros aplicados
                  </div>
                )}
              </div>
            </div>
            
            {/* Contador */}
            <div className="mt-3 text-sm text-muted-foreground">
              Mostrando {pacientesFiltrados.length} de {pacientesCampana.length} pacientes
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
