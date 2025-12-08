import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bell,
  Heart,
  Users,
  MessageSquare,
  Phone,
  Mail,
  Calendar,
  Clock,
  Settings,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { Paciente, Cita, RecordatorioPreventivoPendiente } from "@shared/schema";

interface AccionPacienteHoy {
  tipo: "recordatorio" | "preventivo" | "recuperacion";
  paciente: Paciente;
  cita?: Cita;
  tipoRecordatorio?: "24h" | "1h";
  fechaCita?: Date;
  canal?: "whatsapp" | "sms" | "email";
  recordatorio?: RecordatorioPreventivoPendiente;
  mesesSinVisita?: number;
  prioridad?: string;
}

export default function PacientesAccionesHoy() {
  const [, setLocation] = useLocation();
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [tipoConfig, setTipoConfig] = useState<"recordatorio_cita" | "salud_preventiva">("recordatorio_cita");

  const { data: accionesHoy = [], isLoading } = useQuery<AccionPacienteHoy[]>({
    queryKey: ["/api/pacientes/acciones-hoy"],
    refetchInterval: 30000, // Refrescar cada 30 segundos
  });

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case "recordatorio":
        return Bell;
      case "preventivo":
        return Heart;
      case "recuperacion":
        return Users;
      default:
        return Clock;
    }
  };

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case "recordatorio":
        return "Recordatorio de Cita";
      case "preventivo":
        return "Salud Preventiva";
      case "recuperacion":
        return "Recuperación de Paciente";
      default:
        return tipo;
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case "recordatorio":
        return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      case "preventivo":
        return "bg-green-500/10 text-green-600 border-green-500/20";
      case "recuperacion":
        return "bg-orange-500/10 text-orange-600 border-orange-500/20";
      default:
        return "bg-gray-500/10 text-gray-600 border-gray-500/20";
    }
  };

  const getCanalIcon = (canal?: string) => {
    switch (canal) {
      case "whatsapp":
        return MessageSquare;
      case "sms":
        return Phone;
      case "email":
        return Mail;
      default:
        return MessageSquare;
    }
  };

  const getCanalLabel = (canal?: string) => {
    switch (canal) {
      case "whatsapp":
        return "WhatsApp";
      case "sms":
        return "SMS";
      case "email":
        return "Email";
      default:
        return "Mensaje";
    }
  };

  const accionesRecordatorio = accionesHoy.filter(a => a.tipo === "recordatorio");
  const accionesPreventivo = accionesHoy.filter(a => a.tipo === "preventivo");
  const accionesRecuperacion = accionesHoy.filter(a => a.tipo === "recuperacion");

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-foreground">Campañas</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Acciones automáticas del Agente IA para hoy - Seguimiento de pacientes
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setTipoConfig("recordatorio_cita");
                setConfigDialogOpen(true);
              }}
            >
              <Settings className="w-4 h-4 mr-2" />
              Reglas Recordatorios
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setTipoConfig("salud_preventiva");
                setConfigDialogOpen(true);
              }}
            >
              <Settings className="w-4 h-4 mr-2" />
              Reglas Preventiva
            </Button>
          </div>
        </div>

        <Tabs defaultValue="acciones-hoy" className="w-full">
          <TabsList>
            <TabsTrigger value="acciones-hoy">
              Acciones de Hoy ({accionesHoy.length})
            </TabsTrigger>
            <TabsTrigger value="recordatorios">
              Recordatorios ({accionesRecordatorio.length})
            </TabsTrigger>
            <TabsTrigger value="preventiva">
              Salud Preventiva ({accionesPreventivo.length})
            </TabsTrigger>
            <TabsTrigger value="recuperacion">
              Recuperación ({accionesRecuperacion.length})
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
                  {accionesHoy.map((accion, index) => {
                    const TipoIcon = getTipoIcon(accion.tipo);
                    const CanalIcon = accion.canal ? getCanalIcon(accion.canal) : MessageSquare;

                    return (
                      <Card
                        key={`${accion.tipo}-${accion.paciente.id}-${index}`}
                        className="hover:shadow-lg transition-shadow cursor-pointer"
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-base font-semibold">
                                {accion.paciente.nombre}
                              </CardTitle>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className={getTipoColor(accion.tipo)}>
                                  <TipoIcon className="w-3 h-3 mr-1" />
                                  {getTipoLabel(accion.tipo)}
                                </Badge>
                                {accion.prioridad && (
                                  <Badge
                                    variant={
                                      accion.prioridad === "Alta"
                                        ? "destructive"
                                        : accion.prioridad === "Media"
                                        ? "default"
                                        : "secondary"
                                    }
                                  >
                                    {accion.prioridad}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {/* Información específica por tipo */}
                          {accion.tipo === "recordatorio" && accion.cita && (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-sm">
                                <Calendar className="w-4 h-4 text-muted-foreground" />
                                <span>
                                  {accion.fechaCita
                                    ? format(accion.fechaCita, "dd/MM/yyyy 'a las' HH:mm", {
                                        locale: es,
                                      })
                                    : format(new Date(accion.cita.fechaHora), "dd/MM/yyyy 'a las' HH:mm", {
                                        locale: es,
                                      })}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <Badge variant="outline">
                                  {accion.tipoRecordatorio === "24h" ? "24h antes" : "1h antes"}
                                </Badge>
                                {accion.canal && (
                                  <Badge variant="outline" className="ml-auto">
                                    <CanalIcon className="w-3 h-3 mr-1" />
                                    {getCanalLabel(accion.canal)}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}

                          {accion.tipo === "preventivo" && accion.recordatorio && (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-sm">
                                <Heart className="w-4 h-4 text-muted-foreground" />
                                <span className="font-medium">{accion.recordatorio.tipoTratamiento}</span>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Última visita:{" "}
                                {format(accion.recordatorio.ultimaFecha, "dd/MM/yyyy", { locale: es })}
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline">
                                  {Math.floor(accion.recordatorio.diasVencidos / 30)} meses vencidos
                                </Badge>
                                {accion.canal && (
                                  <Badge variant="outline" className="ml-auto">
                                    <CanalIcon className="w-3 h-3 mr-1" />
                                    {getCanalLabel(accion.canal)}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}

                          {accion.tipo === "recuperacion" && (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-sm">
                                <Clock className="w-4 h-4 text-muted-foreground" />
                                <span>{accion.mesesSinVisita || 0} meses sin visita</span>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Necesita iniciar campaña de recuperación
                              </div>
                            </div>
                          )}

                          {/* Botón de acción */}
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => {
                              if (accion.tipo === "recordatorio") {
                                setLocation("/pacientes/recordatorios");
                              } else if (accion.tipo === "preventivo") {
                                setLocation("/campañas/salud-preventiva");
                              } else {
                                setLocation("/campañas/recuperacion");
                              }
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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Recordatorios</p>
                        <p className="text-2xl font-bold">{accionesRecordatorio.length}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Salud Preventiva</p>
                        <p className="text-2xl font-bold">{accionesPreventivo.length}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Recuperación</p>
                        <p className="text-2xl font-bold">{accionesRecuperacion.length}</p>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-sm text-muted-foreground text-center">
                        El agente ejecutará todas estas acciones automáticamente sin intervención necesaria
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          <TabsContent value="recordatorios">
            <Card>
              <CardHeader>
                <CardTitle>Recordatorios de Citas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  Listado completo de recordatorios
                  <br />
                  <Button
                    variant="link"
                    onClick={() => setLocation("/pacientes/recordatorios")}
                    className="mt-2"
                  >
                    Ver en página de Recordatorios
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preventiva">
            <Card>
              <CardHeader>
                <CardTitle>Salud Preventiva</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  Listado completo de salud preventiva
                  <br />
                  <Button
                    variant="link"
                    onClick={() => setLocation("/campañas/salud-preventiva")}
                    className="mt-2"
                  >
                    Ver en página de Salud Preventiva
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recuperacion">
            <Card>
              <CardHeader>
                <CardTitle>Recuperación de Pacientes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  Listado completo de pacientes en recuperación
                  <br />
                  <Button
                    variant="link"
                    onClick={() => setLocation("/campañas/recuperacion")}
                    className="mt-2"
                  >
                    Ver en página de Recuperación
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
          tipo={tipoConfig}
          titulo={tipoConfig === "recordatorio_cita" ? "Recordatorios de Citas" : "Salud Preventiva"}
        />
      </div>
    </div>
  );
}

