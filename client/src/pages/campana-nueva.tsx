import { useState } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, ArrowRight, Play, Save, X, Mail, MessageSquare, Bot, UserRound, Clock, Users, Filter, Sparkles, Layout, Eye } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { CampaignCanvas, type TouchpointNode } from "@/components/campaign-canvas";
import { campaignTemplates, type CampaignTemplate } from "@/lib/campaign-templates";
import { cn } from "@/lib/utils";

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

export default function CampanaNueva() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [nombre, setNombre] = useState("");
  const [touchpoints, setTouchpoints] = useState<TouchpointNode[]>([]);
  const [segmentacion, setSegmentacion] = useState({
    mesesSinVisita: 12,
    tratamiento: "Cualquier tratamiento",
  });
  const [selectedTouchpoint, setSelectedTouchpoint] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [step, setStep] = useState<"select-template" | "edit-campaign">("select-template");
  const [templateDetailOpen, setTemplateDetailOpen] = useState(false);
  const [templateToView, setTemplateToView] = useState<CampaignTemplate | null>(null);

  const crearCampanaMutation = useMutation({
    mutationFn: async (campana: any) => {
      return await apiRequest("POST", "/api/campanas", campana);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/campanas"] });
      toast({
        title: "Campaña creada",
        description: `La campaña "${nombre}" se ha creado exitosamente`,
      });
      setLocation("/campanas");
    },
    onError: () => {
      toast({
        title: "Error al crear campaña",
        description: "No se pudo crear la campaña. Por favor intenta de nuevo.",
        variant: "destructive",
      });
    },
  });

  const handleGuardar = () => {
    if (!nombre.trim()) {
      toast({
        title: "Nombre requerido",
        description: "Por favor ingresa un nombre para la campaña",
        variant: "destructive",
      });
      return;
    }

    if (touchpoints.length === 0) {
      toast({
        title: "Secuencia requerida",
        description: "Agrega al menos un touchpoint al canvas",
        variant: "destructive",
      });
      return;
    }

    const sortedTouchpoints = [...touchpoints].sort((a, b) => a.x - b.x);
    const canales = sortedTouchpoints.map(tp => tp.canal);
    const cadencia = canales.join(" → ");

    crearCampanaMutation.mutate({
      nombre,
      canales,
      cadencia,
      plantillaSMS: sortedTouchpoints.find(tp => tp.canal === "SMS")?.mensaje || null,
      plantillaEmail: sortedTouchpoints.find(tp => tp.canal === "Email")?.mensaje || null,
      guionLlamada: sortedTouchpoints.find(tp => tp.canal === "LlamadasStaff" || tp.canal === "AutoLlamadas")?.mensaje || null,
      estado: "activa",
    });
  };

  const sortedTouchpoints = [...touchpoints].sort((a, b) => a.x - b.x);
  const selectedNode = touchpoints.find(tp => tp.id === selectedTouchpoint);

  const getCanalInfo = (canalId: string) => {
    return canalesDisponibles.find(c => c.id === canalId) || canalesDisponibles[0];
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

  const duracionTotal = sortedTouchpoints.length > 1
    ? sortedTouchpoints.slice(1).reduce((acc, tp) => acc + tp.diasEspera, 0)
    : 0;

  return (
    <div className="fixed inset-0 flex h-screen overflow-hidden bg-background z-50">
      {/* Sidebar de Control - Solo visible en paso de edición */}
      {step === "edit-campaign" && (
        <div className="w-80 border-r border-border bg-background flex flex-col">
          {/* Header del Sidebar */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center gap-2 mb-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setStep("select-template")}
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <h2 className="text-lg font-semibold">Configurar Campaña</h2>
            </div>
          </div>

        <ScrollArea className="flex-1">
          <div className="p-4 space-y-6 pb-24">
            {/* Nombre de la Campaña */}
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre de la Campaña</Label>
              <Input
                id="nombre"
                placeholder="Ej: Reactivación Limpieza 2024"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full"
              />
            </div>

            <Separator />

            {/* Segmentación */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <Label className="text-base font-semibold">Segmentación</Label>
              </div>
              
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Tiempo sin visita</Label>
                  <Select
                    value={String(segmentacion.mesesSinVisita)}
                    onValueChange={(value) =>
                      setSegmentacion({ ...segmentacion, mesesSinVisita: parseInt(value) })
                    }
                  >
                    <SelectTrigger>
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
                    value={segmentacion.tratamiento}
                    onValueChange={(value) =>
                      setSegmentacion({ ...segmentacion, tratamiento: value })
                    }
                  >
                    <SelectTrigger>
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

                <Card className="bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">
                    Pacientes que llevan más de{" "}
                    <span className="font-medium text-foreground">
                      {segmentacion.mesesSinVisita} meses
                    </span>{" "}
                    sin visita
                    {segmentacion.tratamiento !== "Cualquier tratamiento" && (
                      <>
                        {" "}y su último tratamiento fue:{" "}
                        <span className="font-medium text-foreground">
                          {segmentacion.tratamiento}
                        </span>
                      </>
                    )}
                  </p>
                </Card>
              </div>
            </div>

            <Separator />

            {/* Vista Previa de Secuencia */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <Label className="text-base font-semibold">Vista Previa</Label>
              </div>

              {sortedTouchpoints.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    {sortedTouchpoints.map((tp, index) => {
                      const canal = getCanalInfo(tp.canal);
                      const Icon = canal.icon;
                      const isFirst = index === 0;
                      return (
                        <div key={tp.id} className="flex items-center gap-1">
                          {!isFirst && (
                            <span className="text-xs text-muted-foreground px-1">
                              ({formatDiasEspera(tp.diasEspera)})
                            </span>
                          )}
                          <div
                            className={`
                              flex items-center gap-1.5 px-2 py-1 rounded border cursor-pointer transition-colors
                              ${selectedTouchpoint === tp.id
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-background border-border hover:bg-muted"
                              }
                            `}
                            onClick={() => setSelectedTouchpoint(tp.id)}
                          >
                            <Badge variant="outline" className="w-4 h-4 flex items-center justify-center p-0 text-xs border-current">
                              {index + 1}
                            </Badge>
                            <Icon className={`w-3 h-3 ${selectedTouchpoint === tp.id ? "text-primary-foreground" : canal.color}`} />
                            <span className="text-xs font-medium">{canal.label}</span>
                          </div>
                          {index < sortedTouchpoints.length - 1 && (
                            <span className="text-muted-foreground text-xs">→</span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <Card className="p-3">
                      <div className="text-xs text-muted-foreground mb-1">Touchpoints</div>
                      <div className="text-lg font-bold">{sortedTouchpoints.length}</div>
                    </Card>
                    {duracionTotal > 0 && (
                      <Card className="p-3">
                        <div className="text-xs text-muted-foreground mb-1">Duración</div>
                        <div className="text-lg font-bold">{duracionTotal} días</div>
                      </Card>
                    )}
                  </div>
                </div>
              ) : (
                <Card className="p-4 text-center">
                  <p className="text-sm text-muted-foreground">
                    Agrega touchpoints al canvas para ver la secuencia
                  </p>
                </Card>
              )}
            </div>

            <Separator />

            {/* Configuración del Touchpoint Seleccionado */}
            {selectedNode && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-muted-foreground" />
                  <Label className="text-base font-semibold">Configurar Touchpoint</Label>
                </div>

                {(() => {
                  const canal = getCanalInfo(selectedNode.canal);
                  const Icon = canal.icon;
                  const nodeIndex = sortedTouchpoints.findIndex((tp) => tp.id === selectedNode.id);

                  return (
                    <Card className="p-4 space-y-4">
                      <div className="flex items-center gap-2 pb-2 border-b">
                        <Icon className={`w-4 h-4 ${canal.color}`} />
                        <span className="font-medium">{canal.label}</span>
                        <Badge variant="outline" className="ml-auto">
                          Paso {nodeIndex + 1}
                        </Badge>
                      </div>

                      {nodeIndex > 0 && (
                        <div className="space-y-2">
                          <Label>Tiempo de espera</Label>
                          <Select
                            value={String(selectedNode.diasEspera)}
                            onValueChange={(value) => {
                              setTouchpoints(
                                touchpoints.map((tp) =>
                                  tp.id === selectedNode.id
                                    ? { ...tp, diasEspera: parseInt(value) }
                                    : tp
                                )
                              );
                            }}
                          >
                            <SelectTrigger>
                              <Clock className="w-4 h-4 mr-2 text-muted-foreground" />
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="0">Inmediato</SelectItem>
                              <SelectItem value="1">1 día</SelectItem>
                              <SelectItem value="2">2 días</SelectItem>
                              <SelectItem value="3">3 días</SelectItem>
                              <SelectItem value="5">5 días</SelectItem>
                              <SelectItem value="7">1 semana</SelectItem>
                              <SelectItem value="14">2 semanas</SelectItem>
                              <SelectItem value="21">3 semanas</SelectItem>
                              <SelectItem value="30">1 mes</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label>Mensaje</Label>
                        <p className="text-xs text-muted-foreground">
                          Variables: {"{nombre}"}, {"{meses}"}
                        </p>
                        <Textarea
                          value={selectedNode.mensaje}
                          onChange={(e) => {
                            setTouchpoints(
                              touchpoints.map((tp) =>
                                tp.id === selectedNode.id
                                  ? { ...tp, mensaje: e.target.value }
                                  : tp
                              )
                            );
                          }}
                          rows={selectedNode.canal === "Email" ? 6 : 4}
                          className="text-sm"
                        />
                      </div>
                    </Card>
                  );
                })()}
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer del Sidebar con Acciones */}
        <div className="p-4 border-t border-border space-y-2">
          <Button
            onClick={handleGuardar}
            disabled={crearCampanaMutation.isPending || !nombre.trim() || touchpoints.length === 0}
            className="w-full"
            size="lg"
          >
            <Play className="w-4 h-4 mr-2" />
            {crearCampanaMutation.isPending ? "Creando..." : "Crear Campaña"}
          </Button>
          <Button
            variant="outline"
            onClick={() => setLocation("/campanas")}
            className="w-full"
            disabled={crearCampanaMutation.isPending}
          >
            <X className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
        </div>
        </div>
      )}

      {/* Área Principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Paso 1: Selección de Plantilla */}
        {step === "select-template" && (
          <>
            {/* Header */}
            <div className="p-6 border-b border-border bg-background">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-semibold text-foreground">
                    Nueva Campaña
                  </h1>
                  <p className="text-sm text-muted-foreground mt-1">
                    Paso 1 de 2: Elige una plantilla o crea una campaña desde cero
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setLocation("/campanas")}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Selector de Plantillas */}
            <div className="flex-1 p-6 overflow-auto">
              <div className="max-w-5xl mx-auto space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-2">Elige una Plantilla</h2>
                  <p className="text-sm text-muted-foreground">
                    Selecciona una plantilla predefinida o crea tu campaña desde cero
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Opción: Desde Cero */}
                  <Card 
                    className={cn(
                      "cursor-pointer transition-all hover:shadow-lg hover:border-primary",
                      !selectedTemplate && "border-primary ring-2 ring-primary"
                    )}
                    onClick={() => setSelectedTemplate(null)}
                  >
                    <CardContent className="p-6">
                      <div className="flex flex-col items-center text-center space-y-3">
                        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-2xl">
                          ✨
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">Desde Cero</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            Crea tu campaña personalizada desde el inicio
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Plantillas */}
                  {campaignTemplates.map((template) => (
                    <Card
                      key={template.id}
                      className={cn(
                        "cursor-pointer transition-all hover:shadow-lg hover:border-primary",
                        selectedTemplate === template.id && "border-primary ring-2 ring-primary"
                      )}
                      onClick={() => setSelectedTemplate(template.id)}
                    >
                      <CardContent className="p-6">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="text-3xl">{template.icono}</div>
                            <Badge variant="outline" className="text-xs">
                              {template.touchpoints.length} pasos
                            </Badge>
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">{template.nombre}</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              {template.descripcion}
                            </p>
                          </div>
                          <div className="pt-2 border-t space-y-2">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>Tratamiento: <span className="font-medium text-foreground">{template.tratamiento}</span></span>
                              <span>•</span>
                              <span>{template.mesesSinVisita}+ meses</span>
                            </div>
                            <div className="flex items-center gap-1 flex-wrap">
                              {template.touchpoints.map((tp, idx) => {
                                const canal = canalesDisponibles.find(c => c.id === tp.canal);
                                const Icon = canal?.icon || MessageSquare;
                                return (
                                  <div key={tp.id} className="flex items-center gap-1">
                                    <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-muted/50">
                                      <Icon className="w-3 h-3" />
                                      <span className="text-xs">{canal?.label || tp.canal}</span>
                                    </div>
                                    {idx < template.touchpoints.length - 1 && (
                                      <span className="text-xs text-muted-foreground">→</span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                          <div className="flex gap-2 pt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                setTemplateToView(template);
                                setTemplateDetailOpen(true);
                              }}
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              Ver Detalle
                            </Button>
                            <Button
                              size="sm"
                              className="flex-1"
                              variant={selectedTemplate === template.id ? "default" : "outline"}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedTemplate(template.id);
                              }}
                            >
                              {selectedTemplate === template.id ? "Seleccionada" : "Seleccionar"}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                ))}
                </div>

                {/* Botones de Acción */}
                <div className="max-w-5xl mx-auto flex justify-end gap-3 pt-6 border-t mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setLocation("/campanas")}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={() => {
                      if (selectedTemplate) {
                        const template = campaignTemplates.find(t => t.id === selectedTemplate);
                        if (template) {
                          // Generar nuevos IDs para los touchpoints
                          const nuevosTouchpoints = template.touchpoints.map((tp, idx) => ({
                            ...tp,
                            id: `touchpoint-${Date.now()}-${idx}-${Math.random().toString(36).substring(7)}`,
                          }));
                          // Aplicar segmentación de la plantilla
                          setSegmentacion({
                            mesesSinVisita: template.mesesSinVisita,
                            tratamiento: template.tratamiento,
                          });
                          setTouchpoints(nuevosTouchpoints);
                        }
                      } else {
                        setTouchpoints([]);
                      }
                      setStep("edit-campaign");
                    }}
                    disabled={selectedTemplate === null && touchpoints.length === 0}
                  >
                    Continuar al Editor
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Paso 2: Editor de Campaña */}
        {step === "edit-campaign" && (
          <>
            {/* Header del Canvas */}
            <div className="p-6 border-b border-border bg-background">
              <div>
                <h1 className="text-2xl font-semibold text-foreground">
                  {nombre || "Nueva Campaña"}
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Paso 2 de 2: Diseña tu campaña arrastrando touchpoints al canvas y organizándolos visualmente
                </p>
              </div>
            </div>

            {/* Canvas */}
            <div className="flex-1 p-6 overflow-hidden">
              <div className="h-full">
                <CampaignCanvas
                  touchpoints={touchpoints}
                  onTouchpointsChange={(newTouchpoints) => {
                    setTouchpoints(newTouchpoints);
                    // Si se elimina el touchpoint seleccionado, limpiar selección
                    if (selectedTouchpoint && !newTouchpoints.find(tp => tp.id === selectedTouchpoint)) {
                      setSelectedTouchpoint(null);
                    }
                  }}
                  canalesDisponibles={canalesDisponibles}
                  selectedTouchpoint={selectedTouchpoint}
                  onTouchpointSelect={setSelectedTouchpoint}
                />
              </div>
            </div>
          </>
        )}

        {/* Dialog de Detalle de Plantilla */}
        <Dialog open={templateDetailOpen} onOpenChange={setTemplateDetailOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div className="text-4xl">{templateToView?.icono}</div>
                <div>
                  <DialogTitle className="text-2xl">{templateToView?.nombre}</DialogTitle>
                  <DialogDescription className="text-base mt-1">
                    {templateToView?.descripcion}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            {templateToView && (
              <div className="space-y-6 py-4">
                {/* Información de Segmentación */}
                <Card className="bg-muted/30">
                  <CardContent className="p-4">
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <Label className="text-xs text-muted-foreground">Tratamiento</Label>
                        <p className="font-medium mt-1">{templateToView.tratamiento}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Tiempo sin visita</Label>
                        <p className="font-medium mt-1">Más de {templateToView.mesesSinVisita} meses</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Edad</Label>
                        <p className="font-medium mt-1">
                          {templateToView.edadMin && templateToView.edadMax
                            ? `${templateToView.edadMin}-${templateToView.edadMax} años`
                            : "Todas las edades"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Secuencia de Touchpoints */}
                <div className="space-y-4">
                  <div>
                    <Label className="text-lg font-semibold">Secuencia de Touchpoints</Label>
                    <p className="text-sm text-muted-foreground">
                      {templateToView.touchpoints.length} pasos con mensajes predefinidos
                    </p>
                  </div>

                  <div className="space-y-4">
                    {templateToView.touchpoints.map((tp, index) => {
                      const canal = canalesDisponibles.find(c => c.id === tp.canal);
                      const Icon = canal?.icon || MessageSquare;
                      const isFirst = index === 0;

                      return (
                        <div key={tp.id} className="space-y-3">
                          {/* Conexión con tiempo de espera */}
                          {!isFirst && (
                            <div className="flex items-center gap-2 pl-8">
                              <div className="h-px flex-1 bg-border"></div>
                              <Badge variant="outline" className="text-xs">
                                <Clock className="w-3 h-3 mr-1" />
                                {tp.diasEspera === 0
                                  ? "Inmediato"
                                  : tp.diasEspera === 1
                                  ? "1 día después"
                                  : tp.diasEspera === 7
                                  ? "1 semana después"
                                  : `${tp.diasEspera} días después`}
                              </Badge>
                              <div className="h-px flex-1 bg-border"></div>
                            </div>
                          )}

                          {/* Touchpoint */}
                          <Card>
                            <CardContent className="p-4">
                              <div className="flex items-start gap-4">
                                <div className="flex flex-col items-center gap-2">
                                  <Badge variant="default" className="w-8 h-8 flex items-center justify-center p-0 text-sm font-bold">
                                    {index + 1}
                                  </Badge>
                                  <div className={cn("p-2 rounded-lg", canal?.color.replace("text-", "bg-").replace("-500", "-100 dark:bg-").replace("-500", "-900/30"))}>
                                    <Icon className={cn("w-5 h-5", canal?.color)} />
                                  </div>
                                </div>
                                <div className="flex-1 space-y-3">
                                  <div>
                                    <div className="flex items-center gap-2 mb-1">
                                      <h4 className="font-semibold">{canal?.label || tp.canal}</h4>
                                      <Badge variant="outline" className="text-xs">
                                        {canal?.label || tp.canal}
                                      </Badge>
                                    </div>
                                  </div>
                                  <div className="space-y-2">
                                    <Label className="text-xs text-muted-foreground">Mensaje predefinido:</Label>
                                    <div className="bg-muted/50 rounded-md p-3 border border-border">
                                      <p className="text-sm whitespace-pre-wrap">{tp.mensaje}</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Resumen */}
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-foreground">Resumen de la plantilla</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Duración total: {templateToView.touchpoints.slice(1).reduce((acc, tp) => acc + tp.diasEspera, 0)} días
                        </p>
                      </div>
                      <Button
                        onClick={() => {
                          setSelectedTemplate(templateToView.id);
                          // Aplicar segmentación automáticamente
                          setSegmentacion({
                            mesesSinVisita: templateToView.mesesSinVisita,
                            tratamiento: templateToView.tratamiento,
                          });
                          setTemplateDetailOpen(false);
                        }}
                      >
                        Usar esta plantilla
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

