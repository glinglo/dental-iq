import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useRoute } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  ArrowLeft, 
  MessageSquare, 
  Mail, 
  Phone, 
  CheckCircle2, 
  Clock, 
  XCircle,
  User,
  Calendar,
  FileText,
  DollarSign,
  AlertCircle
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { BudgetWithPatient, SecuenciaComunicacion, ReglaComunicacion, PasoComunicacion, AccionConDatos } from "@shared/schema";

const canalLabels: Record<string, string> = {
  whatsapp: "WhatsApp",
  sms: "SMS",
  email: "Email",
  llamada: "Llamada",
};

const canalIcons: Record<string, typeof MessageSquare> = {
  whatsapp: MessageSquare,
  sms: Phone,
  email: Mail,
  llamada: Phone,
};

const canalColors: Record<string, string> = {
  whatsapp: "bg-green-500/10 text-green-600 border-green-500/20",
  sms: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  email: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  llamada: "bg-orange-500/10 text-orange-600 border-orange-500/20",
};

export default function PresupuestoRelanceDetalle() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [, params] = useRoute("/presupuestos/seguimiento/:id");
  
  const budgetId = params?.id;
  
  const { data: budget } = useQuery<BudgetWithPatient>({
    queryKey: ["/api/budgets", budgetId],
    queryFn: async () => {
      if (!budgetId) throw new Error("ID de presupuesto requerido");
      const response = await fetch(`/api/budgets/${budgetId}`);
      if (!response.ok) throw new Error("Presupuesto no encontrado");
      return response.json();
    },
    enabled: !!budgetId,
  });
  
  const { data: secuenciaData } = useQuery<{ secuencia: SecuenciaComunicacion; regla: ReglaComunicacion | undefined }>({
    queryKey: ["/api/budgets", budgetId, "secuencia"],
    queryFn: async () => {
      if (!budgetId) return null;
      const response = await fetch(`/api/budgets/${budgetId}/secuencia`);
      if (!response.ok) return null;
      return response.json();
    },
    enabled: !!budgetId,
  });
  
  const { data: touchpoints = [] } = useQuery<AccionConDatos[]>({
    queryKey: ["/api/budgets", budgetId, "touchpoints"],
    queryFn: async () => {
      if (!budgetId) return [];
      const response = await fetch(`/api/budgets/${budgetId}/touchpoints`);
      if (!response.ok) return [];
      return response.json();
    },
    enabled: !!budgetId,
  });

  // Obtener detalles del paciente
  const { data: paciente } = useQuery({
    queryKey: ["/api/pacientes", budget?.patientId],
    queryFn: async () => {
      if (!budget?.patientId) return null;
      const response = await fetch(`/api/pacientes`);
      if (!response.ok) return null;
      const pacientes = await response.json();
      return pacientes.find((p: any) => p.id === budget.patientId);
    },
    enabled: !!budget?.patientId,
  });
  
  const pasos = secuenciaData?.regla?.secuencia as PasoComunicacion[] || [];
  const pasoActual = secuenciaData?.secuencia.pasoActual || 0;
  const proximaAccion = secuenciaData?.secuencia.proximaAccion;
  
  // Combinar touchpoints ejecutados con pasos pendientes para el timeline
  const timelineItems = useMemo(() => {
    const items: Array<{
      tipo: "ejecutado" | "pendiente";
      paso?: PasoComunicacion;
      touchpoint?: AccionConDatos;
      fecha?: Date;
      orden: number;
    }> = [];
    
    // Agregar touchpoints ejecutados
    touchpoints.forEach((tp) => {
      items.push({
        tipo: "ejecutado",
        touchpoint: tp,
        fecha: tp.ejecutadaAt ? new Date(tp.ejecutadaAt) : tp.createdAt ? new Date(tp.createdAt) : undefined,
        orden: tp.ejecutadaAt ? new Date(tp.ejecutadaAt).getTime() : tp.createdAt ? new Date(tp.createdAt).getTime() : 0,
      });
    });
    
    // Agregar pasos pendientes
    pasos.forEach((paso, index) => {
      if (index >= pasoActual) {
        // Calcular fecha estimada del paso pendiente
        let fechaEstimada: Date | undefined;
        if (index === pasoActual && proximaAccion) {
          fechaEstimada = new Date(proximaAccion);
        } else if (index > pasoActual) {
          // Calcular fecha basada en días después del paso anterior
          const pasoAnterior = pasos[index - 1];
          if (proximaAccion && pasoAnterior) {
            fechaEstimada = new Date(proximaAccion);
            fechaEstimada.setDate(fechaEstimada.getDate() + pasoAnterior.diasDespues);
          }
        }
        
        items.push({
          tipo: "pendiente",
          paso,
          fecha: fechaEstimada,
          orden: fechaEstimada ? fechaEstimada.getTime() : Date.now() + index * 1000000,
        });
      }
    });
    
    // Ordenar por fecha (ejecutados primero, luego pendientes por orden)
    return items.sort((a, b) => {
      if (a.tipo === "ejecutado" && b.tipo === "pendiente") return -1;
      if (a.tipo === "pendiente" && b.tipo === "ejecutado") return 1;
      return a.orden - b.orden;
    });
  }, [touchpoints, pasos, pasoActual, proximaAccion]);
  
  const calculateDaysPending = (createdAt: Date | string | null) => {
    if (!createdAt) return 0;
    const created = typeof createdAt === "string" ? new Date(createdAt) : createdAt;
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - created.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };
  
  const daysPending = budget ? calculateDaysPending(budget.createdAt) : 0;
  
  if (!budgetId || !budget) {
    return (
      <div className="flex-1 overflow-auto flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Cargando presupuesto...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex-1 overflow-auto">
      <div className="flex h-full">
        {/* Sidebar izquierdo - Detalles del paciente y timeline */}
        <div className="w-80 border-r bg-muted/30 flex flex-col">
          <ScrollArea className="flex-1">
            <div className="p-6 space-y-6">
              {/* Header con botón volver */}
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => setLocation("/presupuestos/seguimiento")}>
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <h2 className="font-semibold">Detalles del Presupuesto</h2>
              </div>

              {/* Información del Paciente */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Información del Paciente
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {paciente ? (
                    <>
                      <div>
                        <p className="text-sm text-muted-foreground">Nombre</p>
                        <p className="text-lg font-semibold">{paciente.nombre}</p>
                      </div>
                      <Separator />
                      <div className="grid grid-cols-1 gap-3">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Edad</p>
                          <p className="text-sm font-medium">{paciente.edad} años</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Teléfono</p>
                          <p className="text-sm font-medium">{paciente.telefono}</p>
                        </div>
                        {paciente.email && (
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Email</p>
                            <p className="text-sm font-medium break-all">{paciente.email}</p>
                          </div>
                        )}
                        {paciente.whatsapp && (
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">WhatsApp</p>
                            <p className="text-sm font-medium">{paciente.whatsapp}</p>
                          </div>
                        )}
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Última Visita</p>
                          <p className="text-sm font-medium">
                            {format(new Date(paciente.ultimaVisita), "dd/MM/yyyy", { locale: es })}
                          </p>
                        </div>
                        {paciente.diagnostico && (
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Diagnóstico</p>
                            <p className="text-sm">{paciente.diagnostico}</p>
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground text-sm">
                      Cargando información del paciente...
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Timeline de Touchpoints */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Timeline de Comunicación
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {timelineItems.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      No hay touchpoints registrados
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {timelineItems.map((item, index) => {
                        const CanalIcon = item.tipo === "ejecutado" && item.touchpoint?.canal
                          ? canalIcons[item.touchpoint.canal] || MessageSquare
                          : item.paso
                          ? canalIcons[item.paso.canal] || MessageSquare
                          : MessageSquare;
                        
                        const canal = item.tipo === "ejecutado" && item.touchpoint?.canal
                          ? item.touchpoint.canal
                          : item.paso?.canal || "whatsapp";
                        
                        return (
                          <div key={index} className="relative">
                            {/* Línea conectora */}
                            {index < timelineItems.length - 1 && (
                              <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-border" />
                            )}
                            
                            <div className="flex items-start gap-3">
                              {/* Icono del estado */}
                              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                                item.tipo === "ejecutado"
                                  ? "bg-green-500 text-white"
                                  : "bg-muted text-muted-foreground border-2 border-dashed"
                              }`}>
                                {item.tipo === "ejecutado" ? (
                                  <CheckCircle2 className="w-4 h-4" />
                                ) : (
                                  <Clock className="w-4 h-4" />
                                )}
                              </div>
                              
                              {/* Contenido */}
                              <div className="flex-1 min-w-0 pb-4">
                                <div className="flex items-start justify-between gap-2 mb-1">
                                  <div className="flex items-center gap-2">
                                    <div className={`p-1.5 rounded border ${canalColors[canal]}`}>
                                      <CanalIcon className="w-3 h-3" />
                                    </div>
                                    <span className="text-sm font-medium">
                                      {item.tipo === "ejecutado" && item.touchpoint
                                        ? item.touchpoint.titulo || canalLabels[canal]
                                        : item.paso
                                        ? `Paso ${item.paso.orden}: ${canalLabels[canal]}`
                                        : "Touchpoint"}
                                    </span>
                                  </div>
                                  {item.tipo === "ejecutado" ? (
                                    <Badge variant="default" className="text-xs">Ejecutado</Badge>
                                  ) : (
                                    <Badge variant="outline" className="text-xs">Pendiente</Badge>
                                  )}
                                </div>
                                
                                {item.tipo === "ejecutado" && item.touchpoint && (
                                  <>
                                    {item.fecha && (
                                      <p className="text-xs text-muted-foreground mb-2">
                                        {format(item.fecha, "dd/MM/yyyy HH:mm", { locale: es })}
                                      </p>
                                    )}
                                    {item.touchpoint.mensaje && (
                                      <div className="mt-2 p-2 bg-muted rounded text-xs whitespace-pre-wrap">
                                        {item.touchpoint.mensaje}
                                      </div>
                                    )}
                                  </>
                                )}
                                
                                {item.tipo === "pendiente" && item.paso && (
                                  <>
                                    {item.fecha && (
                                      <p className="text-xs text-muted-foreground mb-1">
                                        Programado para: {format(item.fecha, "dd/MM/yyyy HH:mm", { locale: es })}
                                      </p>
                                    )}
                                    {item.paso.mensaje && (
                                      <div className="mt-2 p-2 bg-muted/50 rounded text-xs whitespace-pre-wrap border border-dashed">
                                        {item.paso.mensaje}
                                      </div>
                                    )}
                                    {!item.paso.mensaje && (
                                      <p className="text-xs text-muted-foreground italic">
                                        Mensaje por definir
                                      </p>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </ScrollArea>
        </div>

        {/* Contenido principal - Detalles del presupuesto */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-4xl mx-auto p-6 space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-semibold text-foreground">{budget.patientName}</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Presupuesto #{budgetId.slice(0, 8)}
              </p>
            </div>
            
            {/* Información del Presupuesto */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Detalles del Presupuesto
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Estadísticas principales */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="w-4 h-4 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Monto</p>
                    </div>
                    <p className="text-2xl font-bold">
                      {Number(budget.amount).toLocaleString("es-ES", {
                        style: "currency",
                        currency: "EUR",
                      })}
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Días Pendiente</p>
                    </div>
                    <p className="text-2xl font-bold">
                      <Badge variant={daysPending > 7 ? "destructive" : "secondary"} className="text-lg px-3 py-1">
                        {daysPending} días
                      </Badge>
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Fecha Creación</p>
                    </div>
                    <p className="text-lg font-semibold">
                      {budget.createdAt
                        ? format(new Date(budget.createdAt), "dd/MM/yyyy", { locale: es })
                        : "-"}
                    </p>
                  </div>
                </div>

                {/* Tratamientos */}
                {budget.treatmentDetails && typeof budget.treatmentDetails === 'object' && 'procedures' in budget.treatmentDetails && Array.isArray((budget.treatmentDetails as any).procedures) ? (
                  <div>
                    <h3 className="text-sm font-semibold mb-3">Tratamientos Incluidos</h3>
                    <div className="flex flex-wrap gap-2">
                      {((budget.treatmentDetails as any).procedures as string[]).map((proc: string, idx: number) => (
                        <Badge key={idx} variant="outline" className="text-sm py-1 px-3">
                          {proc}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ) : null}

                {/* Estado de la Campaña */}
                {secuenciaData && (
                  <div>
                    <h3 className="text-sm font-semibold mb-3">Estado de la Campaña</h3>
                    <div className="space-y-3">
                      {pasos.map((paso, index) => {
                        const estaCompletado = index < pasoActual;
                        const esActual = index === pasoActual;
                        const CanalIcon = canalIcons[paso.canal] || MessageSquare;
                        
                        return (
                          <div
                            key={index}
                            className={`flex items-center gap-3 p-3 border rounded-lg ${
                              esActual ? "bg-primary/5 border-primary" : estaCompletado ? "bg-muted/50" : "bg-background opacity-60"
                            }`}
                          >
                            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                              estaCompletado ? "bg-green-500 text-white" : esActual ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                            }`}>
                              {estaCompletado ? (
                                <CheckCircle2 className="w-4 h-4" />
                              ) : esActual ? (
                                <Clock className="w-4 h-4" />
                              ) : (
                                <span className="text-xs font-medium">{index + 1}</span>
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <CanalIcon className="w-4 h-4" />
                                <span className="font-medium text-sm">
                                  {canalLabels[paso.canal]}
                                </span>
                                {esActual && <Badge variant="default" className="text-xs">En curso</Badge>}
                                {estaCompletado && <Badge variant="secondary" className="text-xs">Completado</Badge>}
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {paso.diasDespues === 0 ? "Inmediatamente" : `Después de ${paso.diasDespues} días`}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Información adicional */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Probabilidad de Aceptación</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{
                            width: `${budget.acceptanceProb || 0}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm font-semibold w-12 text-right">{budget.acceptanceProb || 0}%</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Score de Urgencia</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-muted rounded-full h-2">
                        <div
                          className="bg-orange-500 h-2 rounded-full"
                          style={{
                            width: `${budget.urgencyScore || 0}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm font-semibold w-12 text-right">{budget.urgencyScore || 0}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
