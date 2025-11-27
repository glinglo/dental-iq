import { useState } from "react";
import { useLocation } from "wouter";
import { Megaphone, Plus, Play, Pause, Mail, MessageSquare, Eye, Trash2, Bot, UserRound, Clock } from "lucide-react";
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
  diasEspera: number;
};

type SegmentacionConfig = {
  mesesSinVisita: number;
  tratamiento: string;
};

const canalesDisponibles = [
  { id: "SMS", label: "SMS", icon: MessageSquare, color: "text-blue-500" },
  { id: "WhatsApp", label: "WhatsApp", icon: SiWhatsapp, color: "text-green-500" },
  { id: "Email", label: "Email", icon: Mail, color: "text-orange-500" },
  { id: "AutoLlamadas", label: "Auto-llamadas", icon: Bot, color: "text-purple-500", description: "Llamadas automatizadas con robot" },
  { id: "LlamadasStaff", label: "Llamadas Staff", icon: UserRound, color: "text-rose-500", description: "Llamadas realizadas por personal" },
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

const opcionesEspera = [
  { value: 0, label: "Inmediato" },
  { value: 1, label: "1 día" },
  { value: 2, label: "2 días" },
  { value: 3, label: "3 días" },
  { value: 5, label: "5 días" },
  { value: 7, label: "1 semana" },
  { value: 14, label: "2 semanas" },
  { value: 21, label: "3 semanas" },
  { value: 30, label: "1 mes" },
];

const plantillasDefault: Record<string, string> = {
  SMS: "Hola {nombre}, hace tiempo que no te vemos. ¿Te gustaría agendar una cita? Responde SÍ para confirmar.",
  WhatsApp: "¡Hola {nombre}!\n\nDesde la Clínica Dental queremos recordarte que hace {meses} meses que no nos visitas.\n\n¿Te gustaría agendar una cita de revisión? Responde a este mensaje y te ayudamos.",
  Email: "Estimado/a {nombre},\n\nEsperamos que se encuentre bien. Hemos notado que hace {meses} meses que no nos visita y queremos invitarle a agendar una revisión.\n\nUn saludo,\nClínica Dental",
  AutoLlamadas: "Mensaje automatizado: Buenos días, le llamamos de la Clínica Dental para recordarle que hace tiempo que no nos visita. Pulse 1 para agendar una cita o 2 para hablar con un asistente.",
  LlamadasStaff: "Buenos días, ¿hablo con {nombre}? Le llamamos de la Clínica Dental para ofrecerle una cita de revisión. ¿Le vendría bien la próxima semana?",
};

function generarId() {
  return Math.random().toString(36).substring(2, 9);
}

export default function Campanas() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [dialogAbierto, setDialogAbierto] = useState(false);
  const [tabActiva, setTabActiva] = useState("secuencia");
  
  const [nuevaCampana, setNuevaCampana] = useState({
    nombre: "",
    secuencia: [] as PasoSecuencia[],
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
      diasEspera: 3,
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

  const handleDiasEsperaChange = (pasoId: string, dias: number) => {
    setNuevaCampana(prev => ({
      ...prev,
      secuencia: prev.secuencia.map(p => 
        p.id === pasoId ? { ...p, diasEspera: dias } : p
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
      guionLlamada: nuevaCampana.secuencia.find(p => p.canal === "LlamadasStaff" || p.canal === "AutoLlamadas")?.mensaje || null,
      estado: "activa",
    });
  };

  const handleVerDetalles = (campanaId: string) => {
    setLocation(`/campanas/${campanaId}`);
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

  const getCanalInfo = (canalId: string) => {
    return canalesDisponibles.find(c => c.id === canalId) || canalesDisponibles[0];
  };

  const getCanalIcon = (canal: string) => {
    const info = getCanalInfo(canal);
    return info.icon;
  };

  const formatDiasEspera = (dias: number) => {
    if (dias === 0) return "Inmediato";
    if (dias === 1) return "1 día";
    if (dias === 7) return "1 semana";
    if (dias === 14) return "2 semanas";
    if (dias === 21) return "3 semanas";
    if (dias === 30) return "1 mes";
    return `${dias} días`;
  };

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
                          Haz clic en un canal para agregarlo. Puedes usar el mismo canal varias veces y configurar el tiempo de espera entre cada paso.
                        </p>
                      </div>
                      
                      {/* Botones para agregar canales */}
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {canalesDisponibles.map((canal) => {
                          const Icon = canal.icon;
                          return (
                            <Button
                              key={canal.id}
                              variant="outline"
                              className="h-auto py-3 flex flex-col items-center gap-1"
                              onClick={() => handleAgregarPaso(canal.id)}
                              data-testid={`button-agregar-${canal.id.toLowerCase()}`}
                            >
                              <div className="flex items-center gap-2">
                                <Plus className="w-3 h-3" />
                                <Icon className={`w-4 h-4 ${canal.color}`} />
                                <span className="font-medium">{canal.label}</span>
                              </div>
                              {canal.description && (
                                <span className="text-xs text-muted-foreground font-normal">
                                  {canal.description}
                                </span>
                              )}
                            </Button>
                          );
                        })}
                      </div>

                      {/* Secuencia actual */}
                      {nuevaCampana.secuencia.length > 0 ? (
                        <div className="space-y-3 mt-6">
                          <Label>Secuencia actual ({nuevaCampana.secuencia.length} pasos)</Label>
                          <div className="space-y-3">
                            {nuevaCampana.secuencia.map((paso, index) => {
                              const canal = getCanalInfo(paso.canal);
                              const Icon = canal.icon;
                              const isFirst = index === 0;
                              return (
                                <div key={paso.id} className="space-y-2">
                                  {/* Selector de tiempo de espera (excepto para el primer paso) */}
                                  {!isFirst && (
                                    <div className="flex items-center gap-2 pl-8">
                                      <div className="h-px flex-1 bg-border"></div>
                                      <Select
                                        value={String(paso.diasEspera)}
                                        onValueChange={(value) => handleDiasEsperaChange(paso.id, parseInt(value))}
                                      >
                                        <SelectTrigger className="w-auto h-8 text-xs" data-testid={`select-espera-${index}`}>
                                          <Clock className="w-3 h-3 mr-1 text-muted-foreground" />
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {opcionesEspera.map(opt => (
                                            <SelectItem key={opt.value} value={String(opt.value)}>
                                              {opt.label}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                      <div className="h-px flex-1 bg-border"></div>
                                    </div>
                                  )}
                                  
                                  {/* Paso */}
                                  <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/30 flex-1">
                                      <Badge variant="default" className="w-6 h-6 flex items-center justify-center p-0 text-xs">
                                        {index + 1}
                                      </Badge>
                                      <Icon className={`w-4 h-4 ${canal.color}`} />
                                      <span className="font-medium">{canal.label}</span>
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
                                </div>
                              );
                            })}
                          </div>

                          {/* Vista previa de la secuencia */}
                          <div className="bg-primary/5 rounded-lg p-4 mt-4">
                            <p className="text-sm font-medium text-foreground mb-2">Vista previa:</p>
                            <div className="flex items-center gap-1 flex-wrap">
                              {nuevaCampana.secuencia.map((paso, index) => {
                                const canal = getCanalInfo(paso.canal);
                                const Icon = canal.icon;
                                const isFirst = index === 0;
                                return (
                                  <div key={paso.id} className="flex items-center gap-1">
                                    {!isFirst && (
                                      <span className="text-xs text-muted-foreground px-1">
                                        ({formatDiasEspera(paso.diasEspera)}) →
                                      </span>
                                    )}
                                    <div className="flex items-center gap-1 px-2 py-1 rounded bg-background border border-border">
                                      <Icon className={`w-3 h-3 ${canal.color}`} />
                                      <span className="text-xs font-medium">{canal.label}</span>
                                    </div>
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
                          const canal = getCanalInfo(paso.canal);
                          const Icon = canal.icon;
                          return (
                            <div key={paso.id} className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="w-6 h-6 flex items-center justify-center p-0 text-xs">
                                  {index + 1}
                                </Badge>
                                <Icon className={`w-4 h-4 ${canal.color}`} />
                                <Label>{canal.label}</Label>
                                {index > 0 && (
                                  <span className="text-xs text-muted-foreground">
                                    (espera: {formatDiasEspera(paso.diasEspera)})
                                  </span>
                                )}
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
                    <div className="text-sm space-y-2">
                      <div>
                        <span className="text-muted-foreground">Secuencia:</span>
                        <span className="ml-2 text-foreground">{nuevaCampana.secuencia.map(p => getCanalInfo(p.canal).label).join(" → ")}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Pasos:</span>
                        <span className="ml-2 text-foreground">{nuevaCampana.secuencia.length}</span>
                      </div>
                      {nuevaCampana.secuencia.length > 1 && (
                        <div>
                          <span className="text-muted-foreground">Duración total:</span>
                          <span className="ml-2 text-foreground">
                            {nuevaCampana.secuencia.slice(1).reduce((acc, p) => acc + p.diasEspera, 0)} días
                          </span>
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
                        Creada el {campana.fechaCreacion && format(new Date(campana.fechaCreacion), "d 'de' MMMM, yyyy", { locale: es })}
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
                        const canalInfo = getCanalInfo(canal);
                        const Icon = canalInfo.icon;
                        return (
                          <div key={i} className="flex items-center gap-1">
                            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-muted/50">
                              <Icon className={`w-3 h-3 ${canalInfo.color}`} />
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
                      onClick={() => handleVerDetalles(campana.id)}
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
