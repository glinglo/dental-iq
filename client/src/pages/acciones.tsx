import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Send,
  Bell,
  Mail,
  TrendingUp,
  Brain,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  MessageSquare,
  Heart,
  Phone,
  ArrowRight,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useLocation } from "wouter";
import type { AccionConDatos, BudgetWithPatient, SecuenciaComunicacion, ReglaComunicacion, PasoComunicacion } from "@shared/schema";

const tipoLabels: Record<string, string> = {
  relance: "Relance",
  recordatorio: "Recordatorio",
  post_visita: "Post-visita",
  scoring: "Scoring IA",
  analisis: "Análisis",
  preventivo: "Salud Preventiva",
};

const estadoColors: Record<string, string> = {
  pendiente: "secondary",
  ejecutada: "default",
  confirmada: "default",
  rechazada: "destructive",
  error: "destructive",
};

const estadoLabels: Record<string, string> = {
  pendiente: "Pendiente",
  ejecutada: "Ejecutada",
  confirmada: "Confirmada",
  rechazada: "Rechazada",
  error: "Error",
};

const tipoIcons: Record<string, any> = {
  relance: Send,
  recordatorio: Bell,
  post_visita: Mail,
  scoring: Brain,
  analisis: TrendingUp,
  preventivo: Heart,
};

interface AccionHoy {
  budget: BudgetWithPatient;
  secuencia: SecuenciaComunicacion;
  regla: ReglaComunicacion;
  pasoActual: PasoComunicacion;
  pasoNumero: number;
  totalPasos: number;
}

export default function Acciones() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [filtroEstado, setFiltroEstado] = useState<string>("all");
  const [filtroTipo, setFiltroTipo] = useState<string>("all");
  const [accionSeleccionada, setAccionSeleccionada] = useState<AccionConDatos | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Obtener acciones de hoy de presupuestos
  const { data: accionesHoy = [] } = useQuery<AccionHoy[]>({
    queryKey: ["/api/presupuestos/acciones-hoy"],
    refetchInterval: 30000, // Refrescar cada 30 segundos
  });

  const { data: acciones = [], isLoading } = useQuery<AccionConDatos[]>({
    queryKey: ["/api/acciones", { estado: filtroEstado !== "all" ? filtroEstado : undefined, tipo: filtroTipo !== "all" ? filtroTipo : undefined }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filtroEstado !== "all") params.append("estado", filtroEstado);
      if (filtroTipo !== "all") params.append("tipo", filtroTipo);
      params.append("limit", "100");
      
      const response = await fetch(`/api/acciones?${params.toString()}`);
      return response.json();
    },
    refetchInterval: 10000, // Refrescar cada 10 segundos
  });

  const confirmarMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("POST", `/api/acciones/${id}/confirmar`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/acciones"] });
      toast({
        title: "Acción confirmada",
        description: "La acción ha sido confirmada correctamente",
      });
      setDialogOpen(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo confirmar la acción",
        variant: "destructive",
      });
    },
  });

  const rechazarMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("POST", `/api/acciones/${id}/rechazar`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/acciones"] });
      toast({
        title: "Acción rechazada",
        description: "La acción ha sido rechazada",
      });
      setDialogOpen(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo rechazar la acción",
        variant: "destructive",
      });
    },
  });

  const handleVerDetalle = (accion: AccionConDatos) => {
    setAccionSeleccionada(accion);
    setDialogOpen(true);
  };

  const accionesPorEstado = {
    pendiente: acciones.filter(a => a.estado === "pendiente").length,
    ejecutada: acciones.filter(a => a.estado === "ejecutada").length,
    confirmada: acciones.filter(a => a.estado === "confirmada").length,
    rechazada: acciones.filter(a => a.estado === "rechazada").length,
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-semibold text-foreground">Acciones Automatizadas</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Log de actividad y acciones ejecutadas automáticamente por la plataforma
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pendientes</p>
                  <div className="text-2xl font-bold">{accionesPorEstado.pendiente}</div>
                </div>
                <Clock className="w-8 h-8 text-yellow-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Ejecutadas</p>
                  <div className="text-2xl font-bold">{accionesPorEstado.ejecutada}</div>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Confirmadas</p>
                  <div className="text-2xl font-bold">{accionesPorEstado.confirmada}</div>
                </div>
                <CheckCircle className="w-8 h-8 text-blue-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Rechazadas</p>
                  <div className="text-2xl font-bold">{accionesPorEstado.rechazada}</div>
                </div>
                <XCircle className="w-8 h-8 text-red-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Acciones de Hoy */}
        {accionesHoy.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Acciones Programadas para Hoy ({accionesHoy.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {accionesHoy.map((accion) => {
                  const getCanalIcon = (canal: string) => {
                    switch (canal) {
                      case "whatsapp": return MessageSquare;
                      case "sms": return Phone;
                      case "email": return Mail;
                      case "llamada": return Phone;
                      default: return Send;
                    }
                  };
                  const getCanalLabel = (canal: string) => {
                    switch (canal) {
                      case "whatsapp": return "WhatsApp";
                      case "sms": return "SMS";
                      case "email": return "Email";
                      case "llamada": return "Llamada";
                      default: return canal;
                    }
                  };
                  const getCanalColor = (canal: string) => {
                    switch (canal) {
                      case "whatsapp": return "bg-green-500/10 text-green-600 border-green-500/20";
                      case "sms": return "bg-blue-500/10 text-blue-600 border-blue-500/20";
                      case "email": return "bg-purple-500/10 text-purple-600 border-purple-500/20";
                      case "llamada": return "bg-orange-500/10 text-orange-600 border-orange-500/20";
                      default: return "bg-gray-500/10 text-gray-600 border-gray-500/20";
                    }
                  };
                  const calculateDaysPending = (createdAt: Date | string | null) => {
                    if (!createdAt) return 0;
                    const created = typeof createdAt === "string" ? new Date(createdAt) : createdAt;
                    const now = new Date();
                    const diffTime = Math.abs(now.getTime() - created.getTime());
                    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
                  };
                  
                  const CanalIcon = getCanalIcon(accion.pasoActual.canal);
                  const daysPending = calculateDaysPending(accion.budget.createdAt);
                  const proximaAccion = accion.secuencia.proximaAccion
                    ? new Date(accion.secuencia.proximaAccion)
                    : null;

                  return (
                    <Card
                      key={accion.budget.id}
                      className="hover:shadow-md transition-shadow cursor-pointer border"
                      onClick={() => setLocation(`/presupuestos/seguimiento/${accion.budget.id}`)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          {/* Columna 1: Paciente y Monto */}
                          <div className="flex-1 min-w-[200px]">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg border ${getCanalColor(accion.pasoActual.canal)}`}>
                                <CanalIcon className="w-5 h-5" />
                              </div>
                              <div>
                                <p className="font-semibold text-base">
                                  {accion.budget.patientName}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {Number(accion.budget.amount).toLocaleString("es-ES", {
                                    style: "currency",
                                    currency: "EUR",
                                  })}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Columna 2: Canal y Paso */}
                          <div className="flex-1 min-w-[180px]">
                            <div className="flex flex-col gap-1">
                              <p className="text-sm font-medium">
                                {getCanalLabel(accion.pasoActual.canal)}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Paso {accion.pasoNumero} de {accion.totalPasos}
                              </p>
                            </div>
                          </div>

                          {/* Columna 3: Días Pendiente */}
                          <div className="min-w-[120px]">
                            <Badge
                              variant={daysPending > 7 ? "destructive" : "secondary"}
                            >
                              {daysPending} días
                            </Badge>
                          </div>

                          {/* Columna 4: Hora programada */}
                          <div className="min-w-[100px] text-right">
                            {proximaAccion && (
                              <div>
                                <p className="text-sm font-medium">
                                  {format(proximaAccion, "HH:mm", { locale: es })}
                                </p>
                                <p className="text-xs text-muted-foreground">Hoy</p>
                              </div>
                            )}
                          </div>

                          {/* Columna 5: Progreso */}
                          <div className="min-w-[120px]">
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-muted-foreground">Progreso</span>
                                <span className="font-medium">
                                  {Math.round((accion.pasoNumero / accion.totalPasos) * 100)}%
                                </span>
                              </div>
                              <div className="w-full bg-muted rounded-full h-1.5">
                                <div
                                  className="bg-primary h-1.5 rounded-full transition-all"
                                  style={{
                                    width: `${(accion.pasoNumero / accion.totalPasos) * 100}%`,
                                  }}
                                />
                              </div>
                            </div>
                          </div>

                          {/* Columna 6: Acción */}
                          <div className="min-w-[120px] flex justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setLocation(`/presupuestos/seguimiento/${accion.budget.id}`);
                              }}
                            >
                              Ver Detalle
                              <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Filtrar por Estado</label>
                <Select value={filtroEstado} onValueChange={setFiltroEstado}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="pendiente">Pendiente</SelectItem>
                    <SelectItem value="ejecutada">Ejecutada</SelectItem>
                    <SelectItem value="confirmada">Confirmada</SelectItem>
                    <SelectItem value="rechazada">Rechazada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Filtrar por Tipo</label>
                <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="relance">Relances</SelectItem>
                    <SelectItem value="recordatorio">Recordatorios</SelectItem>
                    <SelectItem value="post_visita">Post-visita</SelectItem>
                    <SelectItem value="scoring">Scoring IA</SelectItem>
                    <SelectItem value="analisis">Análisis</SelectItem>
                    <SelectItem value="preventivo">Salud Preventiva</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Acciones Table */}
        <Card>
          <CardHeader>
            <CardTitle>Historial de Acciones ({acciones.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Cargando acciones...
              </div>
            ) : acciones.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No hay acciones disponibles
              </div>
            ) : (
              <ScrollArea className="h-[600px] w-full">
                <div className="space-y-2 pr-4">
                  {acciones.map((accion) => {
                    const TipoIcon = tipoIcons[accion.tipo] || AlertCircle;
                    return (
                      <div
                        key={accion.id}
                        className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                        onClick={() => handleVerDetalle(accion)}
                      >
                        <div className="mt-1">
                          <TipoIcon className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium">{accion.titulo}</h3>
                            <Badge variant={estadoColors[accion.estado] as any}>
                              {estadoLabels[accion.estado]}
                            </Badge>
                            <Badge variant="outline">
                              {tipoLabels[accion.tipo] || accion.tipo}
                            </Badge>
                          </div>
                          {accion.descripcion && (
                            <p className="text-sm text-muted-foreground mb-2">
                              {accion.descripcion}
                            </p>
                          )}
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            {accion.pacienteNombre && (
                              <span>Paciente: {accion.pacienteNombre}</span>
                            )}
                            {accion.budgetMonto && (
                              <span>
                                Presupuesto:{" "}
                                {Number(accion.budgetMonto).toLocaleString("es-ES", {
                                  style: "currency",
                                  currency: "EUR",
                                })}
                              </span>
                            )}
                            {accion.citaFecha && (
                              <span>
                                Cita: {format(new Date(accion.citaFecha), "dd/MM/yyyy HH:mm", { locale: es })}
                              </span>
                            )}
                            {accion.createdAt && (
                              <span>
                                {format(new Date(accion.createdAt), "dd/MM/yyyy HH:mm", { locale: es })}
                              </span>
                            )}
                          </div>
                        </div>
                        {accion.requiereConfirmacion && accion.estado === "ejecutada" && (
                          <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => confirmarMutation.mutate(accion.id)}
                              disabled={confirmarMutation.isPending}
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Confirmar
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => rechazarMutation.mutate(accion.id)}
                              disabled={rechazarMutation.isPending}
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Rechazar
                            </Button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                <ScrollBar orientation="vertical" />
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        {/* Detalle Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{accionSeleccionada?.titulo}</DialogTitle>
              <DialogDescription>
                Detalles de la acción automatizada
              </DialogDescription>
            </DialogHeader>
            {accionSeleccionada && (
              <ScrollArea className="max-h-[500px]">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Tipo</label>
                      <p className="text-sm">{tipoLabels[accionSeleccionada.tipo] || accionSeleccionada.tipo}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Estado</label>
                      <p className="text-sm">
                        <Badge variant={estadoColors[accionSeleccionada.estado] as any}>
                          {estadoLabels[accionSeleccionada.estado]}
                        </Badge>
                      </p>
                    </div>
                    {accionSeleccionada.canal && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Canal</label>
                        <p className="text-sm uppercase">{accionSeleccionada.canal}</p>
                      </div>
                    )}
                    {accionSeleccionada.createdAt && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Fecha Creación</label>
                        <p className="text-sm">
                          {format(new Date(accionSeleccionada.createdAt), "dd/MM/yyyy HH:mm:ss", { locale: es })}
                        </p>
                      </div>
                    )}
                    {accionSeleccionada.ejecutadaAt && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Fecha Ejecución</label>
                        <p className="text-sm">
                          {format(new Date(accionSeleccionada.ejecutadaAt), "dd/MM/yyyy HH:mm:ss", { locale: es })}
                        </p>
                      </div>
                    )}
                  </div>

                  {accionSeleccionada.descripcion && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Descripción</label>
                      <p className="text-sm">{accionSeleccionada.descripcion}</p>
                    </div>
                  )}

                  {accionSeleccionada.mensaje && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Mensaje Generado</label>
                      <div className="mt-2 p-3 bg-muted rounded-md">
                        <p className="text-sm whitespace-pre-wrap">{accionSeleccionada.mensaje}</p>
                      </div>
                    </div>
                  )}

                  {accionSeleccionada.metadata != null && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Metadata</label>
                      <pre className="mt-2 p-3 bg-muted rounded-md text-xs overflow-auto">
                        {JSON.stringify(accionSeleccionada.metadata as any, null, 2)}
                      </pre>
                    </div>
                  )}

                  <Separator />

                  {accionSeleccionada.requiereConfirmacion && accionSeleccionada.estado === "ejecutada" && (
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="outline"
                        onClick={() => rechazarMutation.mutate(accionSeleccionada.id)}
                        disabled={rechazarMutation.isPending}
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Rechazar
                      </Button>
                      <Button
                        onClick={() => confirmarMutation.mutate(accionSeleccionada.id)}
                        disabled={confirmarMutation.isPending}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Confirmar
                      </Button>
                    </div>
                  )}
                </div>
              </ScrollArea>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

