import { useState } from "react";
import { Megaphone, Plus, Play, Pause, Mail, MessageSquare, Phone, ArrowDown, GripVertical } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
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

type CanalConfig = {
  activo: boolean;
  mensaje: string;
  orden: number;
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
  WhatsApp: "¡Hola {nombre}! 👋\n\nDesde la Clínica Dental queremos recordarte que hace {meses} meses que no nos visitas.\n\n¿Te gustaría agendar una cita de revisión? Responde a este mensaje y te ayudamos.",
  Email: "Estimado/a {nombre},\n\nEsperamos que se encuentre bien. Hemos notado que hace {meses} meses que no nos visita y queremos invitarle a agendar una revisión.\n\nUn saludo,\nClínica Dental",
  Llamadas: "Buenos días, ¿hablo con {nombre}? Le llamamos de la Clínica Dental para ofrecerle una cita de revisión. ¿Le vendría bien la próxima semana?",
};

export default function Campanas() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [dialogAbierto, setDialogAbierto] = useState(false);
  const [tabActiva, setTabActiva] = useState("canales");
  
  const [nuevaCampana, setNuevaCampana] = useState({
    nombre: "",
    canales: {
      SMS: { activo: false, mensaje: plantillasDefault.SMS, orden: 1 },
      WhatsApp: { activo: false, mensaje: plantillasDefault.WhatsApp, orden: 2 },
      Email: { activo: false, mensaje: plantillasDefault.Email, orden: 3 },
      Llamadas: { activo: false, mensaje: plantillasDefault.Llamadas, orden: 4 },
    } as Record<string, CanalConfig>,
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
      canales: {
        SMS: { activo: false, mensaje: plantillasDefault.SMS, orden: 1 },
        WhatsApp: { activo: false, mensaje: plantillasDefault.WhatsApp, orden: 2 },
        Email: { activo: false, mensaje: plantillasDefault.Email, orden: 3 },
        Llamadas: { activo: false, mensaje: plantillasDefault.Llamadas, orden: 4 },
      },
      espacioEntreComunicaciones: "3",
      segmentacion: {
        mesesSinVisita: 12,
        tratamiento: "Cualquier tratamiento",
      },
    });
    setTabActiva("canales");
  };

  const handleToggleCanal = (canalId: string) => {
    setNuevaCampana(prev => ({
      ...prev,
      canales: {
        ...prev.canales,
        [canalId]: {
          ...prev.canales[canalId],
          activo: !prev.canales[canalId].activo,
        },
      },
    }));
  };

  const handleMensajeChange = (canalId: string, mensaje: string) => {
    setNuevaCampana(prev => ({
      ...prev,
      canales: {
        ...prev.canales,
        [canalId]: {
          ...prev.canales[canalId],
          mensaje,
        },
      },
    }));
  };

  const handleOrdenChange = (canalId: string, nuevoOrden: number) => {
    setNuevaCampana(prev => ({
      ...prev,
      canales: {
        ...prev.canales,
        [canalId]: {
          ...prev.canales[canalId],
          orden: nuevoOrden,
        },
      },
    }));
  };

  const getCanalesActivos = () => {
    return Object.entries(nuevaCampana.canales)
      .filter(([_, config]) => config.activo)
      .sort((a, b) => a[1].orden - b[1].orden)
      .map(([id]) => id);
  };

  const handleIniciarCampana = () => {
    const canalesActivos = getCanalesActivos();
    
    if (!nuevaCampana.nombre) {
      toast({
        title: "Nombre requerido",
        description: "Por favor ingresa un nombre para la campaña",
        variant: "destructive",
      });
      return;
    }

    if (canalesActivos.length === 0) {
      toast({
        title: "Canales requeridos",
        description: "Selecciona al menos un canal de comunicación",
        variant: "destructive",
      });
      return;
    }

    const cadencia = canalesActivos.join(" → ");

    crearCampanaMutation.mutate({
      nombre: nuevaCampana.nombre,
      canales: canalesActivos,
      cadencia: cadencia,
      plantillaSMS: nuevaCampana.canales.SMS.activo ? nuevaCampana.canales.SMS.mensaje : null,
      plantillaEmail: nuevaCampana.canales.Email.activo ? nuevaCampana.canales.Email.mensaje : null,
      guionLlamada: nuevaCampana.canales.Llamadas.activo ? nuevaCampana.canales.Llamadas.mensaje : null,
      estado: "activa",
    });
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

  const canalesActivos = getCanalesActivos();

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
                    <TabsTrigger value="canales" data-testid="tab-canales">
                      1. Canales
                    </TabsTrigger>
                    <TabsTrigger value="mensajes" data-testid="tab-mensajes">
                      2. Mensajes
                    </TabsTrigger>
                    <TabsTrigger value="segmentacion" data-testid="tab-segmentacion">
                      3. Segmentación
                    </TabsTrigger>
                  </TabsList>

                  {/* Tab Canales */}
                  <TabsContent value="canales" className="space-y-6 mt-6">
                    <div className="space-y-4">
                      <Label>Selecciona los canales de comunicación</Label>
                      <div className="grid grid-cols-2 gap-4">
                        {canalesDisponibles.map((canal) => {
                          const Icon = canal.icon;
                          const isActivo = nuevaCampana.canales[canal.id].activo;
                          return (
                            <div
                              key={canal.id}
                              onClick={() => handleToggleCanal(canal.id)}
                              className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                                isActivo 
                                  ? 'border-primary bg-primary/5' 
                                  : 'border-border hover-elevate'
                              }`}
                              data-testid={`canal-${canal.id.toLowerCase()}`}
                            >
                              <Checkbox
                                checked={isActivo}
                                onCheckedChange={() => handleToggleCanal(canal.id)}
                              />
                              <Icon className={`w-5 h-5 ${isActivo ? 'text-primary' : 'text-muted-foreground'}`} />
                              <span className={`font-medium ${isActivo ? 'text-foreground' : 'text-muted-foreground'}`}>
                                {canal.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {canalesActivos.length > 0 && (
                      <div className="space-y-4">
                        <Label>Orden de comunicación</Label>
                        <p className="text-sm text-muted-foreground">
                          Define en qué orden se contactará a los pacientes
                        </p>
                        <div className="space-y-2">
                          {canalesActivos.map((canalId, index) => {
                            const canal = canalesDisponibles.find(c => c.id === canalId);
                            if (!canal) return null;
                            const Icon = canal.icon;
                            return (
                              <div key={canalId} className="flex items-center gap-3">
                                <div className="flex items-center gap-2 p-3 rounded-lg border border-border bg-muted/30 flex-1">
                                  <GripVertical className="w-4 h-4 text-muted-foreground" />
                                  <Badge variant="outline" className="w-6 h-6 flex items-center justify-center p-0">
                                    {index + 1}
                                  </Badge>
                                  <Icon className="w-4 h-4 text-primary" />
                                  <span className="font-medium">{canal.label}</span>
                                </div>
                                <Select
                                  value={String(nuevaCampana.canales[canalId].orden)}
                                  onValueChange={(value) => handleOrdenChange(canalId, parseInt(value))}
                                >
                                  <SelectTrigger className="w-24">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {canalesActivos.map((_, i) => (
                                      <SelectItem key={i} value={String(i + 1)}>
                                        Paso {i + 1}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            );
                          })}
                        </div>

                        <div className="space-y-2 pt-4">
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
                      </div>
                    )}

                    {canalesActivos.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        Selecciona al menos un canal para continuar
                      </div>
                    )}
                  </TabsContent>

                  {/* Tab Mensajes */}
                  <TabsContent value="mensajes" className="space-y-6 mt-6">
                    {canalesActivos.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        Primero selecciona los canales en la pestaña anterior
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <p className="text-sm text-muted-foreground">
                          Personaliza el mensaje para cada canal. Variables disponibles: {"{nombre}"}, {"{meses}"}
                        </p>
                        {canalesActivos.map((canalId) => {
                          const canal = canalesDisponibles.find(c => c.id === canalId);
                          if (!canal) return null;
                          const Icon = canal.icon;
                          return (
                            <div key={canalId} className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Icon className="w-4 h-4 text-primary" />
                                <Label>{canal.label}</Label>
                              </div>
                              <Textarea
                                value={nuevaCampana.canales[canalId].mensaje}
                                onChange={(e) => handleMensajeChange(canalId, e.target.value)}
                                rows={canalId === "Email" ? 6 : 4}
                                data-testid={`textarea-${canalId.toLowerCase()}`}
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
                {canalesActivos.length > 0 && (
                  <div className="bg-muted/30 rounded-lg p-4 border border-border space-y-3">
                    <p className="text-sm font-medium text-foreground">Resumen de la campaña:</p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Canales:</span>
                        <span className="ml-2 text-foreground">{canalesActivos.join(" → ")}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Espacio:</span>
                        <span className="ml-2 text-foreground">{nuevaCampana.espacioEntreComunicaciones} días</span>
                      </div>
                    </div>
                  </div>
                )}

                <Button 
                  onClick={handleIniciarCampana}
                  disabled={crearCampanaMutation.isPending || canalesActivos.length === 0}
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
                        Creada el {format(new Date(campana.fechaCreacion), "d 'de' MMMM, yyyy", { locale: es })}
                      </CardDescription>
                    </div>
                    {getEstadoBadge(campana.estado)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Canales */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm text-muted-foreground">Canales:</span>
                    <div className="flex items-center gap-2">
                      {getCanalesIcons(campana.canales)}
                    </div>
                    <span className="text-sm text-foreground">
                      {campana.canales.join(" → ")}
                    </span>
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
                    <Button variant="outline" size="sm" className="flex-1">
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
