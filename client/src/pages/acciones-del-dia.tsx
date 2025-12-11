import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Bell,
  Mail,
  Send,
  Phone,
  Users,
  Clock,
  Bot,
  User,
  MessageSquare,
  ArrowRight,
  Calendar,
  DollarSign,
  FileText,
  MapPin,
  AtSign,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { Paciente, BudgetWithPatient, TareaLlamada } from "@shared/schema";

interface AccionDelDia {
  tipo: "recordatorio" | "post_visita" | "relance_presupuesto" | "recall_paciente" | "llamada_staff";
  automatica: boolean;
  paciente?: Paciente;
  budget?: BudgetWithPatient;
  cita?: any;
  secuencia?: any;
  pasoActual?: any;
  tarea?: any;
  canal?: string;
  tipoRecordatorio?: string;
  motivo?: string;
  prioridad?: string;
  telefono?: string;
  horaProgramada?: Date | string;
}

export default function AccionesDelDia() {
  const [, setLocation] = useLocation();
  const [filtroTipo, setFiltroTipo] = useState<"todas" | "automaticas" | "manuales">("todas");
  const [modalAbierta, setModalAbierta] = useState(false);
  const [accionSeleccionada, setAccionSeleccionada] = useState<AccionDelDia | null>(null);

  const { data: accionesHoyApi = [], isLoading } = useQuery<AccionDelDia[]>({
    queryKey: ["/api/acciones-del-dia"],
    refetchInterval: 30000, // Refrescar cada 30 segundos
  });

  // Obtener tarea completa si es una llamada manual
  const { data: tareaCompleta } = useQuery<TareaLlamada | null>({
    queryKey: ["/api/tareas", accionSeleccionada?.tarea?.id],
    queryFn: async () => {
      if (!accionSeleccionada?.tarea?.id) return null;
      try {
        const response = await fetch(`/api/tareas/${accionSeleccionada.tarea.id}`);
        if (!response.ok) return null;
        return response.json();
      } catch {
        return null;
      }
    },
    enabled: !!accionSeleccionada?.tarea?.id && modalAbierta,
  });

  // Agregar acciones de ejemplo si no hay datos
  const accionesEjemplo: AccionDelDia[] = [
    {
      tipo: "recordatorio",
      automatica: true,
      paciente: {
        id: "ejemplo-1",
        nombre: "María García",
        telefono: "+34 600 123 456",
        email: "maria@example.com",
      } as Paciente,
      cita: {
        id: "cita-1",
        fechaHora: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      },
      tipoRecordatorio: "24h",
      canal: "whatsapp",
      horaProgramada: new Date(Date.now() + 2 * 60 * 60 * 1000),
    },
    {
      tipo: "post_visita",
      automatica: true,
      paciente: {
        id: "ejemplo-2",
        nombre: "Juan Pérez",
        telefono: "+34 600 234 567",
        email: "juan@example.com",
      } as Paciente,
      pasoActual: { orden: 1, canal: "sms" },
      canal: "sms",
      horaProgramada: new Date(Date.now() + 4 * 60 * 60 * 1000),
    },
    {
      tipo: "relance_presupuesto",
      automatica: true,
      budget: {
        id: "budget-1",
        patientName: "Ana López",
        amount: "850",
      } as BudgetWithPatient,
      pasoActual: { orden: 2, canal: "email" },
      canal: "email",
      horaProgramada: new Date(Date.now() + 6 * 60 * 60 * 1000),
    },
    {
      tipo: "recall_paciente",
      automatica: true,
      paciente: {
        id: "ejemplo-3",
        nombre: "Carlos Ruiz",
        telefono: "+34 600 345 678",
        email: "carlos@example.com",
      } as Paciente,
      pasoActual: { orden: 1, canal: "whatsapp" },
      canal: "whatsapp",
      horaProgramada: new Date(Date.now() + 8 * 60 * 60 * 1000),
    },
    {
      tipo: "llamada_staff",
      automatica: false,
      paciente: {
        id: "ejemplo-4",
        nombre: "Laura Martínez",
        telefono: "+34 600 456 789",
        email: "laura@example.com",
        diagnostico: "Ortodoncia",
        edad: 35,
        ultimaVisita: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      } as Paciente,
      tarea: {
        id: "tarea-ejemplo-1",
        pacienteId: "ejemplo-4",
        pacienteNombre: "Laura Martínez",
        telefono: "+34 600 456 789",
        motivo: "Seguimiento de tratamiento",
        prioridad: "Alta",
      },
      motivo: "Seguimiento de tratamiento",
      prioridad: "Alta",
      telefono: "+34 600 456 789",
      horaProgramada: new Date(Date.now() + 10 * 60 * 60 * 1000),
    },
  ];

  const accionesHoy = accionesHoyApi.length > 0 ? accionesHoyApi : accionesEjemplo;

  const getTipoIcon = (tipo: string): typeof Bell => {
    switch (tipo) {
      case "recordatorio":
        return Bell;
      case "post_visita":
        return Mail;
      case "relance_presupuesto":
        return Send;
      case "recall_paciente":
        return Users;
      case "llamada_staff":
        return Phone;
      default:
        return Clock;
    }
  };

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case "recordatorio":
        return "Recordatorio de Cita";
      case "post_visita":
        return "Mensaje Post-Visita";
      case "relance_presupuesto":
        return "Touchpoint Presupuesto";
      case "recall_paciente":
        return "Touchpoint Paciente Perdido";
      case "llamada_staff":
        return "Llamada Manual";
      default:
        return tipo;
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case "recordatorio":
        return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      case "post_visita":
        return "bg-purple-500/10 text-purple-600 border-purple-500/20";
      case "relance_presupuesto":
        return "bg-green-500/10 text-green-600 border-green-500/20";
      case "recall_paciente":
        return "bg-orange-500/10 text-orange-600 border-orange-500/20";
      case "llamada_staff":
        return "bg-red-500/10 text-red-600 border-red-500/20";
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
      case "llamada":
        return Phone;
      default:
        return Send;
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
      case "llamada":
        return "Llamada";
      default:
        return canal || "N/A";
    }
  };

  const accionesAutomaticas = accionesHoy.filter(a => a.automatica);
  const accionesManuales = accionesHoy.filter(a => !a.automatica);

  // Filtrar acciones según el filtro seleccionado
  const accionesFiltradas = filtroTipo === "automaticas" 
    ? accionesAutomaticas 
    : filtroTipo === "manuales"
    ? accionesManuales
    : accionesHoy;

  // Función para generar guión de llamada
  const generarGuionLlamada = (tarea: TareaLlamada | any): string => {
    const nombre = tarea?.pacienteNombre?.split(" ")[0] || "el paciente";
    return `Buenos días, ¿hablo con ${tarea?.pacienteNombre || "el paciente"}?

Mi nombre es [Tu nombre] y le llamo de la Clínica Dental.

${tarea?.motivo || "Hemos notado que hace tiempo que no nos visita y queríamos contactarle para ofrecerle una cita de revisión. Es importante mantener un control periódico de su salud dental."}

¿Le vendría bien agendar una cita para la próxima semana? Tenemos disponibilidad por las mañanas y por las tardes.

[Si acepta]: Perfecto, le agendo para el [día] a las [hora]. Le enviaremos un recordatorio por SMS.

[Si no puede]: Sin problema, ¿cuándo le vendría mejor? Podemos buscar otra fecha que se adapte a su horario.

[Si no está interesado]: Entiendo. Si en algún momento necesita nuestros servicios, no dude en contactarnos. ¡Que tenga un buen día!`;
  };

  const handleAbrirModal = (accion: AccionDelDia) => {
    if (!accion.automatica) {
      setAccionSeleccionada(accion);
      setModalAbierta(true);
    }
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-semibold text-foreground">Acciones del Día</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Listado de todas las acciones programadas para hoy (automáticas y manuales)
          </p>
        </div>

        {/* Resumen */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Acciones</p>
                  <div className="text-2xl font-bold">{accionesHoy.length}</div>
                </div>
                <Clock className="w-8 h-8 text-primary opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Automáticas (IA)</p>
                  <div className="text-2xl font-bold">{accionesAutomaticas.length}</div>
                </div>
                <Bot className="w-8 h-8 text-green-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Manuales</p>
                  <div className="text-2xl font-bold">{accionesManuales.length}</div>
                </div>
                <User className="w-8 h-8 text-orange-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtro */}
        <Card>
          <CardContent className="pt-6">
            <Tabs value={filtroTipo} onValueChange={(v) => setFiltroTipo(v as "todas" | "automaticas" | "manuales")}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="todas">
                  Todas ({accionesHoy.length})
                </TabsTrigger>
                <TabsTrigger value="automaticas">
                  <Bot className="w-4 h-4 mr-2" />
                  Automáticas ({accionesAutomaticas.length})
                </TabsTrigger>
                <TabsTrigger value="manuales">
                  <User className="w-4 h-4 mr-2" />
                  Manuales ({accionesManuales.length})
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </CardContent>
        </Card>

        {/* Cards de Acciones */}
        <div className="space-y-4">
          {isLoading ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8 text-muted-foreground">
                  Cargando acciones...
                </div>
              </CardContent>
            </Card>
          ) : accionesFiltradas.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8 text-muted-foreground">
                  No hay acciones {filtroTipo === "automaticas" ? "automáticas" : filtroTipo === "manuales" ? "manuales" : ""} programadas para hoy
                </div>
              </CardContent>
            </Card>
          ) : (
            accionesFiltradas.map((accion, index) => {
              const TipoIcon = getTipoIcon(accion.tipo);
              const CanalIcon = accion.canal ? getCanalIcon(accion.canal) : null;
              const horaProgramada = accion.horaProgramada 
                ? format(new Date(accion.horaProgramada), "HH:mm", { locale: es })
                : "-";
              const fechaCompleta = accion.horaProgramada
                ? format(new Date(accion.horaProgramada), "dd/MM/yyyy HH:mm", { locale: es })
                : "-";

              return (
                <Card 
                  key={index} 
                  className={`w-full ${!accion.automatica ? "cursor-pointer hover:bg-muted/50 transition-colors" : ""}`}
                  onClick={() => !accion.automatica && handleAbrirModal(accion)}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4">
                      {/* Lado izquierdo: Tipo y detalles */}
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg border ${getTipoColor(accion.tipo)}`}>
                            <TipoIcon className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="text-lg font-semibold">
                                {getTipoLabel(accion.tipo)}
                              </h3>
                              {accion.automatica ? (
                                <Badge variant="default" className="bg-green-500">
                                  <Bot className="w-3 h-3 mr-1" />
                                  Automática
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="bg-orange-500">
                                  <User className="w-3 h-3 mr-1" />
                                  Manual
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {accion.paciente?.nombre || accion.budget?.patientName || "Sin paciente"}
                            </p>
                          </div>
                        </div>

                        {/* Detalles específicos por tipo */}
                        <div className="pl-11 space-y-2">
                          {accion.tipo === "recordatorio" && accion.cita && (
                            <>
                              <div className="flex items-center gap-2 text-sm">
                                <Calendar className="w-4 h-4 text-muted-foreground" />
                                <span>
                                  Cita programada: {format(new Date(accion.cita.fechaHora), "dd/MM/yyyy 'a las' HH:mm", { locale: es })}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <Bell className="w-4 h-4 text-muted-foreground" />
                                <span>Recordatorio {accion.tipoRecordatorio} antes de la cita</span>
                              </div>
                            </>
                          )}
                          {accion.tipo === "relance_presupuesto" && accion.budget && (
                            <>
                              <div className="flex items-center gap-2 text-sm">
                                <DollarSign className="w-4 h-4 text-muted-foreground" />
                                <span>
                                  Presupuesto: {Number(accion.budget.amount).toLocaleString("es-ES", {
                                    style: "currency",
                                    currency: "EUR",
                                  })}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <Send className="w-4 h-4 text-muted-foreground" />
                                <span>Paso {accion.pasoActual?.orden || "-"} de la secuencia de relance</span>
                              </div>
                            </>
                          )}
                          {accion.tipo === "post_visita" && (
                            <>
                              <div className="flex items-center gap-2 text-sm">
                                <Mail className="w-4 h-4 text-muted-foreground" />
                                <span>Mensaje de seguimiento post-visita</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <Send className="w-4 h-4 text-muted-foreground" />
                                <span>Paso {accion.pasoActual?.orden || "-"} de la secuencia</span>
                              </div>
                            </>
                          )}
                          {accion.tipo === "recall_paciente" && (
                            <>
                              <div className="flex items-center gap-2 text-sm">
                                <Users className="w-4 h-4 text-muted-foreground" />
                                <span>Recuperación de paciente perdido</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <Send className="w-4 h-4 text-muted-foreground" />
                                <span>Paso {accion.pasoActual?.orden || "-"} de la secuencia</span>
                              </div>
                            </>
                          )}
                          {accion.tipo === "llamada_staff" && (
                            <>
                              <div className="flex items-center gap-2 text-sm">
                                <Phone className="w-4 h-4 text-muted-foreground" />
                                <span>{accion.motivo}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <span className="text-muted-foreground">Prioridad:</span>
                                <Badge variant={accion.prioridad === "Alta" ? "destructive" : accion.prioridad === "Media" ? "default" : "secondary"}>
                                  {accion.prioridad}
                                </Badge>
                              </div>
                              {accion.telefono && (
                                <div className="flex items-center gap-2 text-sm">
                                  <Phone className="w-4 h-4 text-muted-foreground" />
                                  <span>{accion.telefono}</span>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>

                      {/* Lado derecho: Canal, Hora y Acción */}
                      <div className="flex flex-col items-end gap-3">
                        {accion.canal && (
                          <div className="flex items-center gap-2">
                            {CanalIcon && <CanalIcon className="w-5 h-5" />}
                            <span className="text-sm font-medium">{getCanalLabel(accion.canal)}</span>
                          </div>
                        )}
                        {accion.telefono && !accion.canal && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-5 h-5" />
                            <span className="text-sm font-medium">{accion.telefono}</span>
                          </div>
                        )}
                        <div className="text-right">
                          <div className="text-xs text-muted-foreground">Hora programada</div>
                          <div className="text-lg font-bold">{horaProgramada}</div>
                          <div className="text-xs text-muted-foreground">{fechaCompleta}</div>
                        </div>
                        {accion.tipo === "relance_presupuesto" && accion.budget ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setLocation(`/presupuestos/seguimiento/${accion.budget!.id}`);
                            }}
                          >
                            Ver Detalle
                            <ArrowRight className="w-4 h-4 ml-1" />
                          </Button>
                        ) : !accion.automatica ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAbrirModal(accion);
                            }}
                          >
                            Ver Detalle
                            <ArrowRight className="w-4 h-4 ml-1" />
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Modal de Detalle para Acciones Manuales */}
        <Dialog open={modalAbierta} onOpenChange={setModalAbierta}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Detalle de Acción Manual</DialogTitle>
              <DialogDescription>
                Información completa sobre la acción que debes realizar
              </DialogDescription>
            </DialogHeader>
            {accionSeleccionada && (
              <div className="space-y-6 py-4">
                {/* Tipo de Acción */}
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg border ${getTipoColor(accionSeleccionada.tipo)}`}>
                    {(() => {
                      const Icon = getTipoIcon(accionSeleccionada.tipo);
                      return React.createElement(Icon, { className: "w-6 h-6" });
                    })()}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{getTipoLabel(accionSeleccionada.tipo)}</h3>
                    <Badge variant="secondary" className="bg-orange-500 mt-1">
                      <User className="w-3 h-3 mr-1" />
                      Acción Manual
                    </Badge>
                  </div>
                </div>

                <Separator />

                {/* Información del Paciente */}
                {accionSeleccionada.paciente && (
                  <div className="space-y-4">
                    <h4 className="font-semibold text-lg">Información del Paciente</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Nombre</p>
                        <p className="font-medium">{accionSeleccionada.paciente.nombre}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Teléfono</p>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          <p className="font-mono">{accionSeleccionada.paciente.telefono}</p>
                        </div>
                      </div>
                      {accionSeleccionada.paciente.email && (
                        <div>
                          <p className="text-sm text-muted-foreground">Email</p>
                          <div className="flex items-center gap-2">
                            <AtSign className="w-4 h-4" />
                            <p>{accionSeleccionada.paciente.email}</p>
                          </div>
                        </div>
                      )}
                      {accionSeleccionada.paciente.whatsapp && (
                        <div>
                          <p className="text-sm text-muted-foreground">WhatsApp</p>
                          <div className="flex items-center gap-2">
                            <MessageSquare className="w-4 h-4" />
                            <p className="font-mono">{accionSeleccionada.paciente.whatsapp}</p>
                          </div>
                        </div>
                      )}
                      {accionSeleccionada.paciente.diagnostico && (
                        <div className="col-span-2">
                          <p className="text-sm text-muted-foreground">Diagnóstico</p>
                          <p>{accionSeleccionada.paciente.diagnostico}</p>
                        </div>
                      )}
                      {accionSeleccionada.paciente.edad && (
                        <div>
                          <p className="text-sm text-muted-foreground">Edad</p>
                          <p>{accionSeleccionada.paciente.edad} años</p>
                        </div>
                      )}
                      {accionSeleccionada.paciente.ultimaVisita && (
                        <div>
                          <p className="text-sm text-muted-foreground">Última Visita</p>
                          <p>{format(new Date(accionSeleccionada.paciente.ultimaVisita), "dd/MM/yyyy", { locale: es })}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Información del Presupuesto */}
                {accionSeleccionada.budget && (
                  <>
                    <Separator />
                    <div className="space-y-4">
                      <h4 className="font-semibold text-lg">Información del Presupuesto</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Paciente</p>
                          <p className="font-medium">{accionSeleccionada.budget.patientName}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Monto</p>
                          <p className="font-semibold text-lg">
                            {Number(accionSeleccionada.budget.amount).toLocaleString("es-ES", {
                              style: "currency",
                              currency: "EUR",
                            })}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Estado</p>
                          <Badge variant={accionSeleccionada.budget.status === "pending" ? "secondary" : accionSeleccionada.budget.status === "accepted" ? "default" : "destructive"}>
                            {accionSeleccionada.budget.status === "pending" ? "Pendiente" : accionSeleccionada.budget.status === "accepted" ? "Aceptado" : "Rechazado"}
                          </Badge>
                        </div>
                        {accionSeleccionada.budget.createdAt && (
                          <div>
                            <p className="text-sm text-muted-foreground">Fecha de Creación</p>
                            <p>{format(new Date(accionSeleccionada.budget.createdAt), "dd/MM/yyyy", { locale: es })}</p>
                          </div>
                        )}
                        {accionSeleccionada.budget.treatmentDetails && (
                          <div className="col-span-2">
                            <p className="text-sm text-muted-foreground">Tratamiento</p>
                            <p>
                              {accionSeleccionada.budget.treatmentDetails && typeof accionSeleccionada.budget.treatmentDetails === 'object' && 'procedures' in accionSeleccionada.budget.treatmentDetails && Array.isArray(accionSeleccionada.budget.treatmentDetails.procedures)
                                ? accionSeleccionada.budget.treatmentDetails.procedures.join(", ")
                                : "N/A"}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {/* Detalles de la Acción */}
                <Separator />
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg">Detalles de la Acción</h4>
                  <div className="space-y-3">
                    {accionSeleccionada.motivo && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Motivo</p>
                        <p className="font-medium">{accionSeleccionada.motivo}</p>
                      </div>
                    )}
                    {accionSeleccionada.prioridad && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Prioridad</p>
                        <Badge variant={accionSeleccionada.prioridad === "Alta" ? "destructive" : accionSeleccionada.prioridad === "Media" ? "default" : "secondary"}>
                          {accionSeleccionada.prioridad}
                        </Badge>
                      </div>
                    )}
                    {accionSeleccionada.horaProgramada && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Hora Programada</p>
                        <p className="font-medium">
                          {format(new Date(accionSeleccionada.horaProgramada), "dd/MM/yyyy 'a las' HH:mm", { locale: es })}
                        </p>
                      </div>
                    )}
                    {accionSeleccionada.telefono && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Teléfono de Contacto</p>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          <p className="font-mono">{accionSeleccionada.telefono}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Guión de Llamada (solo para llamadas) */}
                {accionSeleccionada.tipo === "llamada_staff" && (tareaCompleta || accionSeleccionada.tarea) && (
                  <>
                    <Separator />
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-lg">Guión de Llamada</h4>
                        <FileText className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div className="bg-muted/50 rounded-lg p-4">
                        <pre className="whitespace-pre-wrap text-sm font-sans">
                          {generarGuionLlamada(tareaCompleta || accionSeleccionada.tarea)}
                        </pre>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}


