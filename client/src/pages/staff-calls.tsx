import { useState } from "react";
import { Phone, CheckCircle2, Calendar, XCircle, FileText } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import type { TareaLlamada } from "@shared/schema";

export default function StaffCalls() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [tareaSeleccionada, setTareaSeleccionada] = useState<TareaLlamada | null>(null);
  const [notas, setNotas] = useState("");

  const { data: tareas = [], isLoading } = useQuery<TareaLlamada[]>({
    queryKey: ["/api/tareas"],
  });

  const updateTareaMutation = useMutation({
    mutationFn: async ({ id, estado, notas }: { id: string; estado: string; notas?: string }) => {
      return await apiRequest("PATCH", `/api/tareas/${id}`, { estado, notas });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tareas"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/kpis"] });
    },
    onError: () => {
      toast({
        title: "Error al actualizar tarea",
        description: "No se pudo actualizar el estado de la tarea",
        variant: "destructive",
      });
    },
  });

  const handleMarcarContactado = (tarea: TareaLlamada) => {
    updateTareaMutation.mutate(
      { id: tarea.id, estado: "contactado" },
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
      { id: tarea.id, estado: "cita_agendada" },
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

  const getEstadoBadge = (estado: TareaLlamada["estado"]) => {
    const variants = {
      pendiente: { variant: "secondary" as const, icon: FileText, label: "Pendiente" },
      contactado: { variant: "default" as const, icon: Phone, label: "Contactado" },
      cita_agendada: { variant: "default" as const, icon: Calendar, label: "Cita Agendada" },
      no_contactado: { variant: "outline" as const, icon: XCircle, label: "No Contactado" },
    };
    const config = variants[estado];
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const getPrioridadBadge = (prioridad: string) => {
    const variants = {
      Alta: "destructive" as const,
      Media: "default" as const,
      Baja: "secondary" as const,
    };
    return (
      <Badge variant={variants[prioridad as keyof typeof variants]}>
        {prioridad}
      </Badge>
    );
  };

  const tareasPendientes = tareas.filter(t => t.estado === "pendiente");
  const tareasCompletadas = tareas.filter(t => t.estado !== "pendiente");

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-semibold text-foreground" data-testid="text-page-title">
            Llamadas del Staff
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isLoading ? "Cargando..." : `${tareasPendientes.length} llamadas pendientes de realizar`}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pendientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-9 w-16" />
              ) : (
                <div className="text-3xl font-bold text-foreground" data-testid="text-pendientes">
                  {tareasPendientes.length}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Contactados
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-9 w-16" />
              ) : (
                <div className="text-3xl font-bold text-chart-2">
                  {tareas.filter(t => t.estado === "contactado").length}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Citas Agendadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-9 w-16" />
              ) : (
                <div className="text-3xl font-bold text-primary">
                  {tareas.filter(t => t.estado === "cita_agendada").length}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                No Contactados
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-9 w-16" />
              ) : (
                <div className="text-3xl font-bold text-muted-foreground">
                  {tareas.filter(t => t.estado === "no_contactado").length}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Tareas Pendientes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Llamadas Pendientes
            </CardTitle>
            <CardDescription>
              Pacientes asignados para contactar, ordenados por prioridad
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b-2 border-border bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Paciente
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Teléfono
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Motivo
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Prioridad
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Estado
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, index) => (
                      <tr key={index} className="border-b border-border">
                        <td className="px-4 py-3"><Skeleton className="h-4 w-32" /></td>
                        <td className="px-4 py-3"><Skeleton className="h-4 w-28" /></td>
                        <td className="px-4 py-3"><Skeleton className="h-4 w-36" /></td>
                        <td className="px-4 py-3"><Skeleton className="h-6 w-16" /></td>
                        <td className="px-4 py-3"><Skeleton className="h-6 w-20" /></td>
                        <td className="px-4 py-3"><Skeleton className="h-8 w-full" /></td>
                      </tr>
                    ))
                  ) : (
                    tareasPendientes.map((tarea, index) => (
                      <tr 
                        key={tarea.id}
                        className="border-b border-border hover-elevate transition-all"
                        data-testid={`row-tarea-${index}`}
                      >
                        <td className="px-4 py-3 text-sm font-medium text-foreground">
                          {tarea.pacienteNombre}
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground font-mono">
                          {tarea.telefono}
                        </td>
                        <td className="px-4 py-3 text-sm text-foreground">
                          {tarea.motivo}
                        </td>
                        <td className="px-4 py-3">
                          {getPrioridadBadge(tarea.prioridad)}
                        </td>
                        <td className="px-4 py-3">
                          {getEstadoBadge(tarea.estado)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-2 flex-wrap">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => setTareaSeleccionada(tarea)}
                                  data-testid={`button-ver-guion-${index}`}
                                >
                                  <FileText className="w-4 h-4 mr-2" />
                                  Guion
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
                                      rows={4}
                                    />
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleMarcarContactado(tarea)}
                              disabled={updateTareaMutation.isPending}
                              data-testid={`button-marcar-contactado-${index}`}
                            >
                              <CheckCircle2 className="w-4 h-4 mr-2" />
                              Contactado
                            </Button>
                            <Button 
                              size="sm"
                              onClick={() => handleAgendarCita(tarea)}
                              disabled={updateTareaMutation.isPending}
                              data-testid={`button-agendar-cita-${index}`}
                            >
                              <Calendar className="w-4 h-4 mr-2" />
                              Agendar
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Historial de Llamadas */}
        {!isLoading && tareasCompletadas.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Historial de Llamadas</CardTitle>
              <CardDescription>
                Llamadas realizadas recientemente
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b-2 border-border bg-muted/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Paciente
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Fecha
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Estado
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Notas
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {tareasCompletadas.slice(0, 10).map((tarea) => (
                      <tr 
                        key={tarea.id}
                        className="border-b border-border hover-elevate transition-all"
                      >
                        <td className="px-4 py-3 text-sm font-medium text-foreground">
                          {tarea.pacienteNombre}
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {tarea.fechaContacto 
                            ? formatDistanceToNow(new Date(tarea.fechaContacto), { addSuffix: true, locale: es })
                            : "—"}
                        </td>
                        <td className="px-4 py-3">
                          {getEstadoBadge(tarea.estado)}
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {tarea.notas || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
