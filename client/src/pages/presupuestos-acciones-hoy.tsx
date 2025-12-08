import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Send,
  MessageSquare,
  Phone,
  Mail,
  Clock,
  DollarSign,
  Settings,
  List,
  ArrowRight,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { BudgetWithPatient, SecuenciaComunicacion, ReglaComunicacion, PasoComunicacion } from "@shared/schema";
import { ReglasComunicacionDialog } from "@/components/reglas-comunicacion-dialog";

interface AccionHoy {
  budget: BudgetWithPatient;
  secuencia: SecuenciaComunicacion;
  regla: ReglaComunicacion;
  pasoActual: PasoComunicacion;
  pasoNumero: number;
  totalPasos: number;
}

export default function PresupuestosAccionesHoy() {
  const [, setLocation] = useLocation();
  const [configDialogOpen, setConfigDialogOpen] = useState(false);

  const { data: accionesHoy = [], isLoading } = useQuery<AccionHoy[]>({
    queryKey: ["/api/presupuestos/acciones-hoy"],
    refetchInterval: 30000, // Refrescar cada 30 segundos
  });

  const { data: todosPresupuestos = [] } = useQuery<BudgetWithPatient[]>({
    queryKey: ["/api/budgets"],
  });

  const pendingBudgets = todosPresupuestos.filter((b) => b.status === "pending");

  const getCanalIcon = (canal: string) => {
    switch (canal) {
      case "whatsapp":
        return MessageSquare;
      case "sms":
        return Phone;
      case "email":
        return Mail;
      case "llamada":
        return Phone;
      default:
        return Send;
    }
  };

  const getCanalLabel = (canal: string) => {
    switch (canal) {
      case "whatsapp":
        return "WhatsApp";
      case "sms":
        return "SMS";
      case "email":
        return "Email";
      case "llamada":
        return "Llamada";
      default:
        return canal;
    }
  };

  const getCanalColor = (canal: string) => {
    switch (canal) {
      case "whatsapp":
        return "bg-green-500/10 text-green-600 border-green-500/20";
      case "sms":
        return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      case "email":
        return "bg-purple-500/10 text-purple-600 border-purple-500/20";
      case "llamada":
        return "bg-orange-500/10 text-orange-600 border-orange-500/20";
      default:
        return "bg-gray-500/10 text-gray-600 border-gray-500/20";
    }
  };

  const calculateDaysPending = (createdAt: Date | string | null) => {
    if (!createdAt) return 0;
    const created = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - created.getTime());
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-foreground">Presupuestos</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Acciones automáticas del Agente IA para hoy
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConfigDialogOpen(true)}
            >
              <Settings className="w-4 h-4 mr-2" />
              Configurar Reglas
            </Button>
          </div>
        </div>

        <Tabs defaultValue="acciones-hoy" className="w-full">
          <TabsList>
            <TabsTrigger value="acciones-hoy">
              Acciones de Hoy ({accionesHoy.length})
            </TabsTrigger>
            <TabsTrigger value="todos">
              Todos los Presupuestos ({pendingBudgets.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="acciones-hoy" className="space-y-4">
            {isLoading ? (
              <div className="text-center py-12 text-muted-foreground">
                Cargando acciones del día...
              </div>
            ) : accionesHoy.length === 0 ? (
              <Card>
                <CardContent className="pt-12 pb-12">
                  <div className="text-center">
                    <CheckCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">¡Todo al día!</h3>
                    <p className="text-sm text-muted-foreground">
                      No hay acciones programadas para hoy. El agente está trabajando automáticamente en segundo plano.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {accionesHoy.map((accion) => {
                    const CanalIcon = getCanalIcon(accion.pasoActual.canal);
                    const daysPending = calculateDaysPending(accion.budget.createdAt);
                    const proximaAccion = accion.secuencia.proximaAccion
                      ? new Date(accion.secuencia.proximaAccion)
                      : null;

                    return (
                      <Card
                        key={accion.budget.id}
                        className="hover:shadow-lg transition-shadow cursor-pointer"
                        onClick={() => setLocation(`/presupuestos/seguimiento/${accion.budget.id}`)}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-base font-semibold">
                                {accion.budget.patientName}
                              </CardTitle>
                              <p className="text-sm text-muted-foreground mt-1">
                                {Number(accion.budget.amount).toLocaleString("es-ES", {
                                  style: "currency",
                                  currency: "EUR",
                                })}
                              </p>
                            </div>
                            <Badge
                              variant={daysPending > 7 ? "destructive" : "secondary"}
                              className="ml-2"
                            >
                              {daysPending} días
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {/* Acción programada */}
                          <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/50">
                            <div className={`p-2 rounded-lg ${getCanalColor(accion.pasoActual.canal)}`}>
                              <CanalIcon className="w-4 h-4" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium">
                                {getCanalLabel(accion.pasoActual.canal)}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Paso {accion.pasoNumero} de {accion.totalPasos}
                              </p>
                            </div>
                            {proximaAccion && (
                              <div className="text-right">
                                <p className="text-xs font-medium">
                                  {format(proximaAccion, "HH:mm", { locale: es })}
                                </p>
                                <p className="text-xs text-muted-foreground">Hoy</p>
                              </div>
                            )}
                          </div>

                          {/* Progreso de la campaña */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">Progreso campaña</span>
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

                          {/* Botón de acción */}
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={(e) => {
                              e.stopPropagation();
                              setLocation(`/presupuestos/seguimiento/${accion.budget.id}`);
                            }}
                          >
                            Ver Detalle
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {/* Resumen */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total acciones programadas</p>
                        <p className="text-2xl font-bold">{accionesHoy.length}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">El agente ejecutará automáticamente</p>
                        <p className="text-sm font-medium text-green-600">
                          Sin intervención necesaria
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          <TabsContent value="todos">
            <Card>
              <CardHeader>
                <CardTitle>Todos los Presupuestos Pendientes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  Listado completo de presupuestos pendientes
                  <br />
                  <Button
                    variant="link"
                    onClick={() => setLocation("/presupuestos/seguimiento")}
                    className="mt-2"
                  >
                    Ver en página de Seguimiento
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Dialog de configuración */}
        <ReglasComunicacionDialog
          open={configDialogOpen}
          onOpenChange={setConfigDialogOpen}
          tipo="relance_presupuesto"
          titulo="Reglas de Relance de Presupuestos"
        />
      </div>
    </div>
  );
}

