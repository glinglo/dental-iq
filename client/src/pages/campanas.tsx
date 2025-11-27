import { useState } from "react";
import { Megaphone, Plus, Play, Pause, Mail, MessageSquare, Phone, TrendingUp, Users, CalendarCheck, CheckCircle2, Clock, XCircle, Eye, Trash2, ArrowRight } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import type { Campana } from "@shared/schema";

type PasoSecuencia = {
  id: string;
  canal: string;
  mensaje: string;
};

type SegmentacionConfig = {
  mesesSinVisita: number;
  tratamiento: string;
};

const canalesDisponibles = [
  { id: "SMS", label: "SMS", icon: MessageSquare },
  { id: "WhatsApp", label: "WhatsApp", icon: SiWhatsapp },
  { id: "Email", label: "Email", icon: Mail },
  { id: "Llamadas", label: "Llamadas", icon: Phone },
];

const tratamientosDisponibles = [
  "Cualquier tratamiento",
  "Limpieza bucal",
  "Revisión general",
  "Ortodoncia",
  "Implante dental",
  "Endodoncia",
  "Blanqueamiento",
  "Periodoncia",
  "Tratamiento caries",
  "Prótesis dental",
];

const plantillasDefault: Record<string, string> = {
  SMS: "Hola {nombre}, hace tiempo que no te vemos. ¿Te gustaría agendar una cita? Responde SÍ para confirmar.",
  WhatsApp: "¡Hola {nombre}!\n\nDesde la Clínica Dental queremos recordarte que hace {meses} meses que no nos visitas.\n\n¿Te gustaría agendar una cita de revisión? Responde a este mensaje y te ayudamos.",
  Email: "Estimado/a {nombre},\n\nEsperamos que se encuentre bien. Hemos notado que hace {meses} meses que no nos visita y queremos invitarle a agendar una revisión.\n\nUn saludo,\nClínica Dental",
  Llamadas: "Buenos días, ¿hablo con {nombre}? Le llamamos de la Clínica Dental para ofrecerle una cita de revisión. ¿Le vendría bien la próxima semana?",
};

function generarId() {
  return Math.random().toString(36).substring(2, 9);
}

function generarDetallesCampana(campana: Campana) {
  const totalPacientes = campana.pacientesIncluidos;
  const contactados = campana.contactosEnviados;
  const citasGeneradas = campana.citasGeneradas;
  
  const pendientes = Math.max(0, totalPacientes - contactados);
  const sinRespuesta = Math.floor(contactados * 0.35);
  const respondieron = contactados - sinRespuesta;
  const rechazaron = Math.floor(respondieron * 0.2);
  
  const tasaConversion = totalPacientes > 0 ? ((citasGeneradas / totalPacientes) * 100).toFixed(1) : "0";
  const tasaRespuesta = contactados > 0 ? ((respondieron / contactados) * 100).toFixed(1) : "0";
  
  const resultadosPorCanal = campana.canales.map((canal, index) => {
    const enviados = Math.floor(contactados / campana.canales.length) + (index === 0 ? contactados % campana.canales.length : 0);
    const entregados = Math.floor(enviados * (0.85 + Math.random() * 0.1));
    const abiertos = canal === "Email" ? Math.floor(entregados * (0.4 + Math.random() * 0.2)) : entregados;
    const respondidos = Math.floor(abiertos * (0.15 + Math.random() * 0.15));
    const citas = Math.floor(respondidos * (0.4 + Math.random() * 0.2));
    
    return {
      canal,
      index,
      enviados,
      entregados,
      abiertos: canal === "Email" ? abiertos : null,
      respondidos,
      citas,
      tasaConversion: enviados > 0 ? ((citas / enviados) * 100).toFixed(1) : "0",
    };
  });

  return {
    totalPacientes,
    contactados,
    pendientes,
    citasGeneradas,
    sinRespuesta,
    respondieron,
    rechazaron,
    tasaConversion,
    tasaRespuesta,
    progreso: totalPacientes > 0 ? Math.round((contactados / totalPacientes) * 100) : 0,
    resultadosPorCanal,
  };
}

export default function Campanas() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [dialogAbierto, setDialogAbierto] = useState(false);
  const [dialogDetalles, setDialogDetalles] = useState(false);
  const [campanaSeleccionada, setCampanaSeleccionada] = useState<Campana | null>(null);
  const [tabActiva, setTabActiva] = useState("secuencia");
  
  const [nuevaCampana, setNuevaCampana] = useState({
    nombre: "",
    secuencia: [] as PasoSecuencia[],
    espacioEntreComunicaciones: "3",
    segmentacion: {
      mesesSinVisita: 12,
      tratamiento: "Cualquier tratamiento",
    } as SegmentacionConfig,
  });

  const { data: campanas = [], isLoading } = useQuery<Campana[]>({
    queryKey: ["/api/campanas"],
  });

  const crearCampanaMutation = useMutation({
    mutationFn: async (campana: any) => {
      return await apiRequest("POST", "/api/campanas", campana);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/campanas"] });
      toast({
        title: "Campaña creada",
        description: `La campaña "${nuevaCampana.nombre}" se ha creado exitosamente`,
      });
      setDialogAbierto(false);
      resetFormulario();
    },
    onError: () => {
      toast({
        title: "Error al crear campaña",
        description: "No se pudo crear la campaña. Por favor intenta de nuevo.",
        variant: "destructive",
      });
    },
  });

  const resetFormulario = () => {
    setNuevaCampana({
      nombre: "",
      secuencia: [],
      espacioEntreComunicaciones: "3",
      segmentacion: {
        mesesSinVisita: 12,
        tratamiento: "Cualquier tratamiento",
      },
    });
    setTabActiva("secuencia");
  };

  const handleAgregarPaso = (canalId: string) => {
    const nuevoPaso: PasoSecuencia = {
      id: generarId(),
      canal: canalId,
      mensaje: plantillasDefault[canalId],
    };
    setNuevaCampana(prev => ({
      ...prev,
      secuencia: [...prev.secuencia, nuevoPaso],
    }));
  };

  const handleEliminarPaso = (pasoId: string) => {
    setNuevaCampana(prev => ({
      ...prev,
      secuencia: prev.secuencia.filter(p => p.id !== pasoId),
    }));
  };

  const handleMensajeChange = (pasoId: string, mensaje: string) => {
    setNuevaCampana(prev => ({
      ...prev,
      secuencia: prev.secuencia.map(p => 
        p.id === pasoId ? { ...p, mensaje } : p
      ),
    }));
  };

  const handleIniciarCampana = () => {
    if (!nuevaCampana.nombre) {
      toast({
        title: "Nombre requerido",
        description: "Por favor ingresa un nombre para la campaña",
        variant: "destructive",
      });
      return;
    }

    if (nuevaCampana.secuencia.length === 0) {
      toast({
        title: "Secuencia requerida",
        description: "Agrega al menos un paso a la secuencia de comunicación",
        variant: "destructive",
      });
      return;
    }

    const canales = nuevaCampana.secuencia.map(p => p.canal);
    const cadencia = canales.join(" → ");

    crearCampanaMutation.mutate({
      nombre: nuevaCampana.nombre,
      canales: canales,
      cadencia: cadencia,
      plantillaSMS: nuevaCampana.secuencia.find(p => p.canal === "SMS")?.mensaje || null,
      plantillaEmail: nuevaCampana.secuencia.find(p => p.canal === "Email")?.mensaje || null,
      guionLlamada: nuevaCampana.secuencia.find(p => p.canal === "Llamadas")?.mensaje || null,
      estado: "activa",
    });
  };

  const handleVerDetalles = (campana: Campana) => {
    setCampanaSeleccionada(campana);
    setDialogDetalles(true);
  };

  const getEstadoBadge = (estado: string) => {
    const variants = {
      activa: { variant: "default" as const, label: "Activa" },
      pausada: { variant: "secondary" as const, label: "Pausada" },
      completada: { variant: "outline" as const, label: "Completada" },
    };
    const config = variants[estado as keyof typeof variants];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getCanalesIcons = (canales: string[]) => {
    return canales.map((canal, index) => {
      const icons: Record<string, any> = {
        SMS: MessageSquare,
        WhatsApp: SiWhatsapp,
        Email: Mail,
        Llamadas: Phone,
      };
      const Icon = icons[canal];
      return Icon ? <Icon key={index} className="w-4 h-4" /> : null;
    });
  };

  const getCanalIcon = (canal: string) => {
    const icons: Record<string, any> = {
      SMS: MessageSquare,
      WhatsApp: SiWhatsapp,
      Email: Mail,
      Llamadas: Phone,
    };
    return icons[canal] || MessageSquare;
  };

  const detallesCampana = campanaSeleccionada ? generarDetallesCampana(campanaSeleccionada) : null;

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-semibold text-foreground" data-testid="text-page-title">
              Campañas de Reactivación
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Gestiona tus campañas multicanal
            </p>
          </div>
          
          <Dialog open={dialogAbierto} onOpenChange={(open) => {
            setDialogAbierto(open);
            if (!open) resetFormulario();
          }}>
            <DialogTrigger asChild>
              <Button data-testid="button-nueva-campana">
                <Plus className="w-4 h-4 mr-2" />
                Nueva Campaña
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Crear Nueva Campaña</DialogTitle>
                <DialogDescription>
                  Configura una campaña de reactivación multicanal personalizada
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
                {/* Nombre */}
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre de la Campaña</Label>
                  <Input
                    id="nombre"
                    placeholder="Ej: Reactivación Limpieza 2024"
                    value={nuevaCampana.nombre}
                    onChange={(e) => setNuevaCampana({ ...nuevaCampana, nombre: e.target.value })}
                    data-testid="input-nombre-campana"
                  />
                </div>

                <Tabs value={tabActiva} onValueChange={setTabActiva}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="secuencia" data-testid="tab-secuencia">
                      1. Secuencia
                    </TabsTrigger>
                    <TabsTrigger value="mensajes" data-testid="tab-mensajes">
                      2. Mensajes
                    </TabsTrigger>
                    <TabsTrigger value="segmentacion" data-testid="tab-segmentacion">
                      3. Segmentación
                    </TabsTrigger>
                  </TabsList>

                  {/* Tab Secuencia */}
                  <TabsContent value="secuencia" className="space-y-6 mt-6">
                    <div className="space-y-4">
                      <div>
                        <Label>Construye tu secuencia de comunicación</Label>
                        <p className="text-sm text-muted-foreground mt-1">
                          Haz clic en un canal para agregarlo a la secuencia. Puedes usar el mismo canal varias veces.
                        </p>
                      </div>
                      
                      {/* Botones para agregar canales */}
                      <div className="flex flex-wrap gap-2">
                        {canalesDisponibles.map((canal) => {
                          const Icon = canal.icon;
                          return (
                            <Button
                              key={canal.id}
                              variant="outline"
                              onClick={() => handleAgregarPaso(canal.id)}
                              data-testid={`button-agregar-${canal.id.toLowerCase()}`}
                            >
                              <Plus className="w-4 h-4 mr-1" />
                              <Icon className="w-4 h-4 mr-2" />
                              {canal.label}
                            </Button>
                          );
                        })}
                      </div>

                      {/* Secuencia actual */}
                      {nuevaCampana.secuencia.length > 0 ? (
                        <div className="space-y-3 mt-6">
                          <Label>Secuencia actual ({nuevaCampana.secuencia.length} pasos)</Label>
                          <div className="space-y-2">
                            {nuevaCampana.secuencia.map((paso, index) => {
                              const canal = canalesDisponibles.find(c => c.id === paso.canal);
                              if (!canal) return null;
                              const Icon = canal.icon;
                              return (
                                <div key={paso.id} className="flex items-center gap-2">
                                  <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/30 flex-1">
                                    <Badge variant="default" className="w-6 h-6 flex items-center justify-center p-0 text-xs">
                                      {index + 1}
                                    </Badge>
                                    <Icon className="w-4 h-4 text-primary" />
                                    <span className="font-medium">{canal.label}</span>
                                    {index < nuevaCampana.secuencia.length - 1 && (
                                      <ArrowRight className="w-4 h-4 text-muted-foreground ml-auto" />
                                    )}
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleEliminarPaso(paso.id)}
                                    className="text-muted-foreground hover:text-destructive"
                                    data-testid={`button-eliminar-paso-${index}`}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              );
                            })}
                          </div>

                          {/* Vista previa de la secuencia */}
                          <div className="bg-primary/5 rounded-lg p-4 mt-4">
                            <p className="text-sm font-medium text-foreground mb-2">Vista previa:</p>
                            <div className="flex items-center gap-2 flex-wrap">
                              {nuevaCampana.secuencia.map((paso, index) => {
                                const canal = canalesDisponibles.find(c => c.id === paso.canal);
                                if (!canal) return null;
                                const Icon = canal.icon;
                                return (
                                  <div key={paso.id} className="flex items-center gap-1">
                                    <div className="flex items-center gap-1 px-2 py-1 rounded bg-background border border-border">
                                      <Icon className="w-3 h-3 text-primary" />
                                      <span className="text-xs font-medium">{canal.label}</span>
                                    </div>
                                    {index < nuevaCampana.secuencia.length - 1 && (
                                      <span className="text-muted-foreground text-sm">→</span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8 border-2 border-dashed border-border rounded-lg">
                          <MessageSquare className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                          <p className="text-muted-foreground">
                            Haz clic en los botones de arriba para agregar pasos a tu secuencia
                          </p>
                        </div>
                      )}

                      {/* Espacio entre comunicaciones */}
                      {nuevaCampana.secuencia.length > 1 && (
                        <div className="space-y-2 pt-4 border-t border-border">
                          <Label>Espacio entre comunicaciones</Label>
                          <Select
                            value={nuevaCampana.espacioEntreComunicaciones}
                            onValueChange={(value) => setNuevaCampana({ ...nuevaCampana, espacioEntreComunicaciones: value })}
                          >
                            <SelectTrigger data-testid="select-espacio">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">1 día entre cada comunicación</SelectItem>
                              <SelectItem value="2">2 días entre cada comunicación</SelectItem>
                              <SelectItem value="3">3 días entre cada comunicación</SelectItem>
                              <SelectItem value="5">5 días entre cada comunicación</SelectItem>
                              <SelectItem value="7">1 semana entre cada comunicación</SelectItem>
                              <SelectItem value="14">2 semanas entre cada comunicación</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  {/* Tab Mensajes */}
                  <TabsContent value="mensajes" className="space-y-6 mt-6">
                    {nuevaCampana.secuencia.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        Primero agrega pasos a la secuencia en la pestaña anterior
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <p className="text-sm text-muted-foreground">
                          Personaliza el mensaje para cada paso. Variables disponibles: {"{nombre}"}, {"{meses}"}
                        </p>
                        {nuevaCampana.secuencia.map((paso, index) => {
                          const canal = canalesDisponibles.find(c => c.id === paso.canal);
                          if (!canal) return null;
                          const Icon = canal.icon;
                          return (
                            <div key={paso.id} className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="w-6 h-6 flex items-center justify-center p-0 text-xs">
                                  {index + 1}
                                </Badge>
                                <Icon className="w-4 h-4 text-primary" />
                                <Label>{canal.label}</Label>
                              </div>
                              <Textarea
                                value={paso.mensaje}
                                onChange={(e) => handleMensajeChange(paso.id, e.target.value)}
                                rows={paso.canal === "Email" ? 6 : 4}
                                data-testid={`textarea-paso-${index}`}
                              />
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </TabsContent>

                  {/* Tab Segmentación */}
                  <TabsContent value="segmentacion" className="space-y-6 mt-6">
                    <div className="space-y-4">
                      <Label>¿A qué pacientes quieres contactar?</Label>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm text-muted-foreground">Tiempo sin visita</Label>
                          <Select
                            value={String(nuevaCampana.segmentacion.mesesSinVisita)}
                            onValueChange={(value) => setNuevaCampana({
                              ...nuevaCampana,
                              segmentacion: { ...nuevaCampana.segmentacion, mesesSinVisita: parseInt(value) }
                            })}
                          >
                            <SelectTrigger data-testid="select-meses">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="6">Más de 6 meses sin visita</SelectItem>
                              <SelectItem value="9">Más de 9 meses sin visita</SelectItem>
                              <SelectItem value="12">Más de 1 año sin visita</SelectItem>
                              <SelectItem value="18">Más de 18 meses sin visita</SelectItem>
                              <SelectItem value="24">Más de 2 años sin visita</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm text-muted-foreground">Último tratamiento</Label>
                          <Select
                            value={nuevaCampana.segmentacion.tratamiento}
                            onValueChange={(value) => setNuevaCampana({
                              ...nuevaCampana,
                              segmentacion: { ...nuevaCampana.segmentacion, tratamiento: value }
                            })}
                          >
                            <SelectTrigger data-testid="select-tratamiento">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {tratamientosDisponibles.map((tratamiento) => (
                                <SelectItem key={tratamiento} value={tratamiento}>
                                  {tratamiento}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="bg-muted/50 rounded-lg p-4 mt-4">
                        <p className="text-sm font-medium text-foreground">Resumen de segmentación:</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Pacientes que llevan más de {nuevaCampana.segmentacion.mesesSinVisita} meses sin visita
                          {nuevaCampana.segmentacion.tratamiento !== "Cualquier tratamiento" && (
                            <> y su último tratamiento fue: <span className="font-medium text-foreground">{nuevaCampana.segmentacion.tratamiento}</span></>
                          )}
                        </p>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>

                {/* Resumen antes de crear */}
                {nuevaCampana.secuencia.length > 0 && (
                  <div className="bg-muted/30 rounded-lg p-4 border border-border space-y-3">
                    <p className="text-sm font-medium text-foreground">Resumen de la campaña:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Secuencia:</span>
                        <span className="ml-2 text-foreground">{nuevaCampana.secuencia.map(p => p.canal).join(" → ")}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Pasos:</span>
                        <span className="ml-2 text-foreground">{nuevaCampana.secuencia.length}</span>
                      </div>
                      {nuevaCampana.secuencia.length > 1 && (
                        <div>
                          <span className="text-muted-foreground">Espacio:</span>
                          <span className="ml-2 text-foreground">{nuevaCampana.espacioEntreComunicaciones} días entre pasos</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <Button 
                  onClick={handleIniciarCampana}
                  disabled={crearCampanaMutation.isPending || nuevaCampana.secuencia.length === 0}
                  className="w-full"
                  data-testid="button-iniciar-campana"
                >
                  <Play className="w-4 h-4 mr-2" />
                  {crearCampanaMutation.isPending ? "Creando..." : "Iniciar Campaña"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Dialog Ver Detalles */}
        <Dialog open={dialogDetalles} onOpenChange={setDialogDetalles}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            {campanaSeleccionada && detallesCampana && (
              <>
                <DialogHeader>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <DialogTitle className="text-xl">{campanaSeleccionada.nombre}</DialogTitle>
                      <DialogDescription className="mt-1">
                        Creada el {format(new Date(campanaSeleccionada.fechaCreacion), "d 'de' MMMM, yyyy", { locale: es })}
                      </DialogDescription>
                    </div>
                    {getEstadoBadge(campanaSeleccionada.estado)}
                  </div>
                </DialogHeader>

                <div className="space-y-6 py-4">
                  {/* Progreso General */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Progreso de la campaña</span>
                      <span className="text-sm text-muted-foreground">{detallesCampana.progreso}%</span>
                    </div>
                    <Progress value={detallesCampana.progreso} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{detallesCampana.contactados} contactados</span>
                      <span>{detallesCampana.pendientes} pendientes</span>
                    </div>
                  </div>

                  {/* KPIs Principales */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 text-muted-foreground mb-2">
                          <Users className="w-4 h-4" />
                          <span className="text-xs">Pacientes</span>
                        </div>
                        <div className="text-2xl font-bold">{detallesCampana.totalPacientes}</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 text-muted-foreground mb-2">
                          <MessageSquare className="w-4 h-4" />
                          <span className="text-xs">Contactados</span>
                        </div>
                        <div className="text-2xl font-bold">{detallesCampana.contactados}</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 text-muted-foreground mb-2">
                          <CalendarCheck className="w-4 h-4" />
                          <span className="text-xs">Citas</span>
                        </div>
                        <div className="text-2xl font-bold text-primary">{detallesCampana.citasGeneradas}</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 text-muted-foreground mb-2">
                          <TrendingUp className="w-4 h-4" />
                          <span className="text-xs">Conversión</span>
                        </div>
                        <div className="text-2xl font-bold text-chart-1">{detallesCampana.tasaConversion}%</div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Estado de los pacientes */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Estado de los pacientes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <CheckCircle2 className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <div className="text-lg font-semibold">{detallesCampana.citasGeneradas}</div>
                            <div className="text-xs text-muted-foreground">Cita agendada</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-chart-2/10 flex items-center justify-center">
                            <MessageSquare className="w-5 h-5 text-chart-2" />
                          </div>
                          <div>
                            <div className="text-lg font-semibold">{detallesCampana.respondieron}</div>
                            <div className="text-xs text-muted-foreground">Respondieron</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                            <Clock className="w-5 h-5 text-muted-foreground" />
                          </div>
                          <div>
                            <div className="text-lg font-semibold">{detallesCampana.sinRespuesta}</div>
                            <div className="text-xs text-muted-foreground">Sin respuesta</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                            <XCircle className="w-5 h-5 text-destructive" />
                          </div>
                          <div>
                            <div className="text-lg font-semibold">{detallesCampana.rechazaron}</div>
                            <div className="text-xs text-muted-foreground">Rechazaron</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Resultados por Canal */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Resultados por paso</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {detallesCampana.resultadosPorCanal.map((resultado) => {
                          const Icon = getCanalIcon(resultado.canal);
                          return (
                            <div key={resultado.index} className="border border-border rounded-lg p-4">
                              <div className="flex items-center gap-2 mb-3">
                                <Badge variant="outline" className="w-6 h-6 flex items-center justify-center p-0 text-xs">
                                  {resultado.index + 1}
                                </Badge>
                                <Icon className="w-5 h-5 text-primary" />
                                <span className="font-medium">{resultado.canal}</span>
                                <Badge variant="outline" className="ml-auto">
                                  {resultado.tasaConversion}% conversión
                                </Badge>
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                                <div>
                                  <div className="text-muted-foreground text-xs">Enviados</div>
                                  <div className="font-semibold">{resultado.enviados}</div>
                                </div>
                                <div>
                                  <div className="text-muted-foreground text-xs">Entregados</div>
                                  <div className="font-semibold">{resultado.entregados}</div>
                                </div>
                                {resultado.abiertos !== null && (
                                  <div>
                                    <div className="text-muted-foreground text-xs">Abiertos</div>
                                    <div className="font-semibold">{resultado.abiertos}</div>
                                  </div>
                                )}
                                <div>
                                  <div className="text-muted-foreground text-xs">Respondidos</div>
                                  <div className="font-semibold">{resultado.respondidos}</div>
                                </div>
                                <div>
                                  <div className="text-muted-foreground text-xs">Citas</div>
                                  <div className="font-semibold text-primary">{resultado.citas}</div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Secuencia de comunicación */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Secuencia de comunicación</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2 flex-wrap">
                        {campanaSeleccionada.canales.map((canal, index) => {
                          const Icon = getCanalIcon(canal);
                          return (
                            <div key={index} className="flex items-center gap-2">
                              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 border border-border">
                                <Badge variant="outline" className="w-5 h-5 flex items-center justify-center p-0 text-xs">
                                  {index + 1}
                                </Badge>
                                <Icon className="w-4 h-4 text-primary" />
                                <span className="text-sm font-medium">{canal}</span>
                              </div>
                              {index < campanaSeleccionada.canales.length - 1 && (
                                <span className="text-muted-foreground">→</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Campaigns List */}
        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <Card key={index}>
                <CardHeader>
                  <Skeleton className="h-6 w-48 mb-2" />
                  <Skeleton className="h-4 w-32" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <div className="grid grid-cols-3 gap-4 pt-4">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : campanas.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {campanas.map((campana, index) => (
              <Card key={campana.id} data-testid={`card-campana-${index}`}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-semibold">
                        {campana.nombre}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        Creada el {format(new Date(campana.fechaCreacion), "d 'de' MMMM, yyyy", { locale: es })}
                      </CardDescription>
                    </div>
                    {getEstadoBadge(campana.estado)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Canales */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm text-muted-foreground">Secuencia:</span>
                    <div className="flex items-center gap-1">
                      {campana.canales.map((canal, i) => {
                        const Icon = getCanalIcon(canal);
                        return (
                          <div key={i} className="flex items-center gap-1">
                            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-muted/50">
                              <Icon className="w-3 h-3" />
                            </div>
                            {i < campana.canales.length - 1 && (
                              <span className="text-muted-foreground text-xs">→</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {campana.canales.length} pasos
                    </Badge>
                  </div>

                  {/* Métricas */}
                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
                    <div>
                      <div className="text-xs text-muted-foreground">Pacientes</div>
                      <div className="text-xl font-bold text-foreground">{campana.pacientesIncluidos}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Contactos</div>
                      <div className="text-xl font-bold text-foreground">{campana.contactosEnviados}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Citas</div>
                      <div className="text-xl font-bold text-primary">{campana.citasGeneradas}</div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2 flex-wrap">
                    {campana.estado === "activa" ? (
                      <Button variant="outline" size="sm" className="flex-1">
                        <Pause className="w-4 h-4 mr-2" />
                        Pausar
                      </Button>
                    ) : (
                      <Button variant="outline" size="sm" className="flex-1">
                        <Play className="w-4 h-4 mr-2" />
                        Reanudar
                      </Button>
                    )}
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleVerDetalles(campana)}
                      data-testid={`button-ver-detalles-${index}`}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Ver Detalles
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Megaphone className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                No hay campañas creadas
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                Crea tu primera campaña para comenzar a reactivar pacientes
              </p>
              <Button onClick={() => setDialogAbierto(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Nueva Campaña
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
