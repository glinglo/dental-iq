import { useState } from "react";
import { Phone, CheckCircle2, Calendar, XCircle, FileText, Clock, ThumbsUp, RotateCcw, User, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { TareaLlamada } from "@shared/schema";

function esMismoDia(fecha1: Date | null | undefined, fecha2: Date): boolean {
  if (!fecha1) return false;
  const d1 = new Date(fecha1);
  return d1.getFullYear() === fecha2.getFullYear() &&
         d1.getMonth() === fecha2.getMonth() &&
         d1.getDate() === fecha2.getDate();
}

export default function StaffCalls() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [notas, setNotas] = useState("");
  const hoy = new Date();

  const { data: tareas = [], isLoading } = useQuery<TareaLlamada[]>({
    queryKey: ["/api/tareas"],
  });

  const updateTareaMutation = useMutation({
    mutationFn: async (data: { id: string; [key: string]: any }) => {
      const { id, ...body } = data;
      return await apiRequest("PATCH", `/api/tareas/${id}`, body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tareas"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/kpis"] });
    },
    onError: () => {
      toast({
        title: "Error al actualizar",
        description: "No se pudo actualizar la tarea",
        variant: "destructive",
      });
    },
  });

  // Columna 1: Pendiente de Aprobación (no aprobado + estado pendiente)
  const pendientesAprobacion = tareas.filter(t => 
    !t.aprobado && t.estado === "pendiente"
  );

  // Columna 2: Programadas para Hoy (aprobado + estado pendiente + fechaProgramada es hoy o null)
  const programadasHoy = tareas.filter(t => 
    t.aprobado && 
    t.estado === "pendiente" && 
    (esMismoDia(t.fechaProgramada, hoy) || !t.fechaProgramada)
  );

  // Columna 3: Completadas Hoy (estados completados + fechaCompletada es hoy)
  const completadasHoy = tareas.filter(t => 
    ["contactado", "cita_agendada", "no_contactado"].includes(t.estado) &&
    esMismoDia(t.fechaCompletada, hoy)
  );

  const handleAprobar = (tarea: TareaLlamada) => {
    updateTareaMutation.mutate(
      { id: tarea.id, aprobado: true, fechaProgramada: new Date().toISOString() },
      {
        onSuccess: () => {
          toast({
            title: "Tarea aprobada",
            description: `La llamada a ${tarea.pacienteNombre} ha sido programada para hoy`,
          });
        },
      }
    );
  };

  const handleMarcarContactado = (tarea: TareaLlamada) => {
    updateTareaMutation.mutate(
      { id: tarea.id, estado: "contactado", fechaCompletada: new Date().toISOString(), fechaContacto: new Date().toISOString() },
      {
        onSuccess: () => {
          toast({
            title: "Paciente contactado",
            description: `Se ha marcado a ${tarea.pacienteNombre} como contactado`,
          });
        },
      }
    );
  };

  const handleAgendarCita = (tarea: TareaLlamada) => {
    updateTareaMutation.mutate(
      { id: tarea.id, estado: "cita_agendada", fechaCompletada: new Date().toISOString(), fechaContacto: new Date().toISOString() },
      {
        onSuccess: () => {
          toast({
            title: "Cita agendada",
            description: `Cita agendada para ${tarea.pacienteNombre}`,
          });
        },
      }
    );
  };

  const handleNoContactado = (tarea: TareaLlamada) => {
    updateTareaMutation.mutate(
      { id: tarea.id, estado: "no_contactado", fechaCompletada: new Date().toISOString() },
      {
        onSuccess: () => {
          toast({
            title: "Sin contacto",
            description: `${tarea.pacienteNombre} marcado como no contactado`,
          });
        },
      }
    );
  };

  const handleReabrir = (tarea: TareaLlamada) => {
    updateTareaMutation.mutate(
      { id: tarea.id, estado: "pendiente", fechaCompletada: null, fechaContacto: null },
      {
        onSuccess: () => {
          toast({
            title: "Tarea reabierta",
            description: `La llamada a ${tarea.pacienteNombre} ha sido reprogramada`,
          });
        },
      }
    );
  };

  const getPrioridadBadge = (prioridad: string) => {
    const variants = {
      Alta: "destructive" as const,
      Media: "default" as const,
      Baja: "secondary" as const,
    };
    return (
      <Badge variant={variants[prioridad as keyof typeof variants]} className="text-xs">
        {prioridad}
      </Badge>
    );
  };

  const getEstadoBadge = (estado: string) => {
    const config: Record<string, { variant: "default" | "secondary" | "outline" | "destructive"; label: string }> = {
      contactado: { variant: "default", label: "Contactado" },
      cita_agendada: { variant: "default", label: "Cita Agendada" },
      no_contactado: { variant: "secondary", label: "No Contactado" },
    };
    const c = config[estado] || { variant: "outline" as const, label: estado };
    return <Badge variant={c.variant} className="text-xs">{c.label}</Badge>;
  };

  const renderTareaCard = (tarea: TareaLlamada, columna: "pendiente" | "programada" | "completada", index: number) => {
    return (
      <Card 
        key={tarea.id} 
        className="mb-3 hover-elevate transition-all"
        data-testid={`card-tarea-${columna}-${index}`}
      >
        <CardContent className="p-4 space-y-3">
          {/* Header con nombre y prioridad */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <p className="font-medium text-foreground text-sm truncate">
                  {tarea.pacienteNombre}
                </p>
                <p className="text-xs text-muted-foreground font-mono">
                  {tarea.telefono}
                </p>
              </div>
            </div>
            {getPrioridadBadge(tarea.prioridad)}
          </div>

          {/* Motivo */}
          <p className="text-xs text-muted-foreground line-clamp-2">
            {tarea.motivo}
          </p>

          {/* Estado (solo para completadas) */}
          {columna === "completada" && (
            <div className="flex items-center gap-2">
              {getEstadoBadge(tarea.estado)}
              {tarea.notas && (
                <span className="text-xs text-muted-foreground truncate flex-1">
                  {tarea.notas}
                </span>
              )}
            </div>
          )}

          {/* Acciones contextuales */}
          <div className="flex gap-2 flex-wrap pt-1">
            {columna === "pendiente" && (
              <>
                <Button
                  size="sm"
                  onClick={() => handleAprobar(tarea)}
                  disabled={updateTareaMutation.isPending}
                  className="flex-1"
                  data-testid={`button-aprobar-${index}`}
                >
                  <ThumbsUp className="w-3 h-3 mr-1" />
                  Aprobar
                </Button>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" data-testid={`button-guion-pendiente-${index}`}>
                      <FileText className="w-3 h-3" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Guion de Llamada</DialogTitle>
                      <DialogDescription>
                        Guion sugerido para llamar a {tarea.pacienteNombre}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="rounded-md bg-muted p-4 text-sm text-foreground">
                      Buenos días, ¿hablo con {tarea.pacienteNombre}? Le llamamos de la Clínica Dental. 
                      Hemos notado que hace tiempo que no nos visita y queremos ofrecerle una cita de revisión. 
                      ¿Le vendría bien la próxima semana?
                    </div>
                  </DialogContent>
                </Dialog>
              </>
            )}

            {columna === "programada" && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleMarcarContactado(tarea)}
                  disabled={updateTareaMutation.isPending}
                  data-testid={`button-contactado-${index}`}
                >
                  <Phone className="w-3 h-3 mr-1" />
                  Contactado
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleAgendarCita(tarea)}
                  disabled={updateTareaMutation.isPending}
                  data-testid={`button-agendar-${index}`}
                >
                  <Calendar className="w-3 h-3 mr-1" />
                  Agendar
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleNoContactado(tarea)}
                  disabled={updateTareaMutation.isPending}
                  className="text-muted-foreground"
                  data-testid={`button-no-contactado-${index}`}
                >
                  <XCircle className="w-3 h-3" />
                </Button>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm" data-testid={`button-guion-programada-${index}`}>
                      <FileText className="w-3 h-3" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Guion de Llamada</DialogTitle>
                      <DialogDescription>
                        Guion sugerido para llamar a {tarea.pacienteNombre}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="rounded-md bg-muted p-4 text-sm text-foreground">
                        Buenos días, ¿hablo con {tarea.pacienteNombre}? Le llamamos de la Clínica Dental. 
                        Hemos notado que hace tiempo que no nos visita y queremos ofrecerle una cita de revisión. 
                        ¿Le vendría bien la próxima semana?
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="notas">Notas de la llamada</Label>
                        <Textarea
                          id="notas"
                          placeholder="Añade notas sobre la conversación..."
                          value={notas}
                          onChange={(e) => setNotas(e.target.value)}
                          rows={3}
                        />
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </>
            )}

            {columna === "completada" && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleReabrir(tarea)}
                  disabled={updateTareaMutation.isPending}
                  className="flex-1"
                  data-testid={`button-reabrir-${index}`}
                >
                  <RotateCcw className="w-3 h-3 mr-1" />
                  Reabrir
                </Button>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm" data-testid={`button-ver-notas-${index}`}>
                      <FileText className="w-3 h-3" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Detalles de la Llamada</DialogTitle>
                      <DialogDescription>
                        Información sobre la llamada a {tarea.pacienteNombre}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Estado:</span>
                          <div className="mt-1">{getEstadoBadge(tarea.estado)}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Prioridad:</span>
                          <div className="mt-1">{getPrioridadBadge(tarea.prioridad)}</div>
                        </div>
                      </div>
                      {tarea.notas && (
                        <div>
                          <span className="text-sm text-muted-foreground">Notas:</span>
                          <p className="mt-1 text-sm text-foreground bg-muted p-3 rounded-md">
                            {tarea.notas}
                          </p>
                        </div>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderColumnaSkeleton = () => (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Skeleton className="w-8 h-8 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-4 w-32 mb-1" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-5 w-12" />
            </div>
            <Skeleton className="h-3 w-full" />
            <div className="flex gap-2">
              <Skeleton className="h-8 flex-1" />
              <Skeleton className="h-8 w-8" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-6 pb-4">
        <h1 className="text-3xl font-semibold text-foreground" data-testid="text-page-title">
          Acciones del Día
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Gestiona las tareas de contacto con pacientes
        </p>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-hidden px-6 pb-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
          {/* Columna 1: Pendiente de Aprobación */}
          <div className="flex flex-col min-h-0">
            <Card className="flex flex-col h-full">
              <CardHeader className="pb-3 flex-shrink-0">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-500" />
                    Pendiente de Aprobación
                  </CardTitle>
                  <Badge variant="secondary" className="text-xs" data-testid="badge-pendientes-count">
                    {pendientesAprobacion.length}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-hidden p-3 pt-0">
                <ScrollArea className="h-full pr-2">
                  {isLoading ? (
                    renderColumnaSkeleton()
                  ) : pendientesAprobacion.length > 0 ? (
                    pendientesAprobacion.map((tarea, index) => 
                      renderTareaCard(tarea, "pendiente", index)
                    )
                  ) : (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      No hay tareas pendientes de aprobación
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Columna 2: Programadas para Hoy */}
          <div className="flex flex-col min-h-0">
            <Card className="flex flex-col h-full">
              <CardHeader className="pb-3 flex-shrink-0">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Phone className="w-4 h-4 text-blue-500" />
                    Programadas para Hoy
                  </CardTitle>
                  <Badge variant="secondary" className="text-xs" data-testid="badge-programadas-count">
                    {programadasHoy.length}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-hidden p-3 pt-0">
                <ScrollArea className="h-full pr-2">
                  {isLoading ? (
                    renderColumnaSkeleton()
                  ) : programadasHoy.length > 0 ? (
                    programadasHoy.map((tarea, index) => 
                      renderTareaCard(tarea, "programada", index)
                    )
                  ) : (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      No hay llamadas programadas para hoy
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Columna 3: Completadas Hoy */}
          <div className="flex flex-col min-h-0">
            <Card className="flex flex-col h-full">
              <CardHeader className="pb-3 flex-shrink-0">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    Completadas Hoy
                  </CardTitle>
                  <Badge variant="secondary" className="text-xs" data-testid="badge-completadas-count">
                    {completadasHoy.length}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-hidden p-3 pt-0">
                <ScrollArea className="h-full pr-2">
                  {isLoading ? (
                    renderColumnaSkeleton()
                  ) : completadasHoy.length > 0 ? (
                    completadasHoy.map((tarea, index) => 
                      renderTareaCard(tarea, "completada", index)
                    )
                  ) : (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      Aún no hay tareas completadas hoy
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
