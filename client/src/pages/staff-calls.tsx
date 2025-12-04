import { useState } from "react";
import { Phone, CheckCircle2, Calendar, XCircle, FileText, ThumbsUp, RotateCcw, User, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
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
  const [mostrarCompletadas, setMostrarCompletadas] = useState(false);
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

  // Tareas pendientes de aprobación (no aprobado + estado pendiente)
  const pendientesAprobacion = tareas.filter(t => 
    !t.aprobado && t.estado === "pendiente"
  );

  // Tareas programadas para hoy (aprobado + estado pendiente)
  const programadasHoy = tareas.filter(t => 
    t.aprobado && 
    t.estado === "pendiente" && 
    (esMismoDia(t.fechaProgramada, hoy) || !t.fechaProgramada)
  );

  // Tareas completadas hoy
  const completadasHoy = tareas.filter(t => 
    ["contactado", "cita_agendada", "no_contactado"].includes(t.estado) &&
    esMismoDia(t.fechaCompletada, hoy)
  );

  // Todas las acciones pendientes (combinadas)
  const accionesPendientes = [...pendientesAprobacion, ...programadasHoy];

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

  const getEstadoLabel = (aprobado: boolean | null) => {
    if (!aprobado) {
      return (
        <Badge variant="outline" className="text-xs text-amber-600 border-amber-300 bg-amber-50">
          Pendiente aprobación
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="text-xs text-blue-600 border-blue-300 bg-blue-50">
        Listo para llamar
      </Badge>
    );
  };

  const getResultadoBadge = (estado: string) => {
    const config: Record<string, { className: string; label: string }> = {
      contactado: { className: "text-green-600 border-green-300 bg-green-50", label: "Contactado" },
      cita_agendada: { className: "text-emerald-600 border-emerald-300 bg-emerald-50", label: "Cita Agendada" },
      no_contactado: { className: "text-gray-600 border-gray-300 bg-gray-50", label: "No Contactado" },
    };
    const c = config[estado] || { className: "", label: estado };
    return <Badge variant="outline" className={`text-xs ${c.className}`}>{c.label}</Badge>;
  };

  const renderTareaCard = (tarea: TareaLlamada, index: number) => {
    const esPendienteAprobacion = !tarea.aprobado;

    return (
      <Card 
        key={tarea.id} 
        className="hover-elevate transition-all"
        data-testid={`card-tarea-${index}`}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 text-muted-foreground" />
            </div>

            {/* Info del paciente */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <p className="font-medium text-foreground">
                  {tarea.pacienteNombre}
                </p>
                {getPrioridadBadge(tarea.prioridad)}
                {getEstadoLabel(tarea.aprobado)}
              </div>
              <p className="text-sm text-muted-foreground font-mono mb-2">
                {tarea.telefono}
              </p>
              <p className="text-sm text-muted-foreground line-clamp-1">
                {tarea.motivo}
              </p>
            </div>

            {/* Acciones */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {esPendienteAprobacion ? (
                <>
                  <Button
                    size="sm"
                    onClick={() => handleAprobar(tarea)}
                    disabled={updateTareaMutation.isPending}
                    data-testid={`button-aprobar-${index}`}
                  >
                    <ThumbsUp className="w-3 h-3 mr-1" />
                    Aprobar
                  </Button>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="icon" data-testid={`button-guion-${index}`}>
                        <FileText className="w-4 h-4" />
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
              ) : (
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
                    size="icon"
                    onClick={() => handleNoContactado(tarea)}
                    disabled={updateTareaMutation.isPending}
                    className="text-muted-foreground"
                    data-testid={`button-no-contactado-${index}`}
                  >
                    <XCircle className="w-4 h-4" />
                  </Button>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="icon" data-testid={`button-guion-programada-${index}`}>
                        <FileText className="w-4 h-4" />
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
                            data-testid={`textarea-notas-${index}`}
                          />
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderCompletadaCard = (tarea: TareaLlamada, index: number) => {
    return (
      <Card 
        key={tarea.id} 
        className="hover-elevate transition-all bg-muted/30"
        data-testid={`card-completada-${index}`}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 text-muted-foreground" />
            </div>

            {/* Info del paciente */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <p className="font-medium text-foreground">
                  {tarea.pacienteNombre}
                </p>
                {getPrioridadBadge(tarea.prioridad)}
                {getResultadoBadge(tarea.estado)}
              </div>
              <p className="text-sm text-muted-foreground font-mono mb-2">
                {tarea.telefono}
              </p>
              {tarea.notas && (
                <p className="text-sm text-muted-foreground line-clamp-1">
                  {tarea.notas}
                </p>
              )}
            </div>

            {/* Acción de reabrir */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleReabrir(tarea)}
                disabled={updateTareaMutation.isPending}
                data-testid={`button-reabrir-${index}`}
              >
                <RotateCcw className="w-3 h-3 mr-1" />
                Reabrir
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderSkeletonCard = (index: number) => (
    <Card key={index}>
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <Skeleton className="w-10 h-10 rounded-full" />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-5 w-12" />
              <Skeleton className="h-5 w-24" />
            </div>
            <Skeleton className="h-3 w-24 mb-2" />
            <Skeleton className="h-3 w-48" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-8" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-semibold text-foreground" data-testid="text-page-title">
            Acciones del Día
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {accionesPendientes.length} acciones pendientes
          </p>
        </div>

        {/* Lista de tarjetas pendientes */}
        <div className="space-y-3">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => renderSkeletonCard(i))
          ) : accionesPendientes.length > 0 ? (
            accionesPendientes.map((tarea, index) => renderTareaCard(tarea, index))
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-1">
                  ¡Todo listo!
                </h3>
                <p className="text-sm text-muted-foreground">
                  No hay acciones pendientes para hoy
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sección de completadas (colapsable) */}
        {completadasHoy.length > 0 && (
          <Collapsible 
            open={mostrarCompletadas} 
            onOpenChange={setMostrarCompletadas}
            className="mt-8"
          >
            <CollapsibleTrigger asChild>
              <Button 
                variant="ghost" 
                className="w-full justify-between py-3 text-muted-foreground hover:text-foreground"
                data-testid="button-toggle-completadas"
              >
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  Completadas hoy ({completadasHoy.length})
                </span>
                {mostrarCompletadas ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-3 mt-3">
              {completadasHoy.map((tarea, index) => renderCompletadaCard(tarea, index))}
            </CollapsibleContent>
          </Collapsible>
        )}
      </div>
    </div>
  );
}
