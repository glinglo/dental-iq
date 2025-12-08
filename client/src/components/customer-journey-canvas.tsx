import { useState, useRef, useCallback, useEffect } from "react";
import { MessageSquare, Mail, Phone, Clock, Plus, Edit2, Trash2, X, Save, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { EtapaJourney, TouchpointJourney } from "@shared/customer-journey";

const canalIcons: Record<string, typeof MessageSquare> = {
  whatsapp: MessageSquare,
  sms: Phone,
  email: Mail,
  llamada: Phone,
};

const canalLabels: Record<string, string> = {
  whatsapp: "WhatsApp",
  sms: "SMS",
  email: "Email",
  llamada: "Llamada",
};

const canalColors: Record<string, string> = {
  whatsapp: "bg-green-500",
  sms: "bg-blue-500",
  email: "bg-purple-500",
  llamada: "bg-orange-500",
};

interface CustomerJourneyCanvasProps {
  etapas: EtapaJourney[];
  onEtapasChange: (etapas: EtapaJourney[]) => void;
  onClose: () => void;
}

export function CustomerJourneyCanvas({
  etapas,
  onEtapasChange,
  onClose,
}: CustomerJourneyCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [selectedEtapa, setSelectedEtapa] = useState<string | null>(null);
  const [selectedTouchpoint, setSelectedTouchpoint] = useState<{ etapaId: string; touchpointIndex: number } | null>(null);
  const [editingEtapa, setEditingEtapa] = useState<string | null>(null);
  const [editingTouchpoint, setEditingTouchpoint] = useState<{ etapaId: string; touchpointIndex: number } | null>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [zoom, setZoom] = useState(1);

  // Calcular posiciones de las etapas en la línea temporal
  const etapasConPosicion = etapas.map((etapa, index) => {
    // Calcular posición X basada en el orden y los touchpoints acumulados
    let x = 100 + index * 350; // Espaciado inicial entre etapas
    
    // Calcular ancho basado en los touchpoints
    const maxDias = etapa.touchpoints.length > 0 
      ? Math.max(...etapa.touchpoints.map(t => t.diasDespues), 0)
      : 0;
    const ancho = Math.max(250, maxDias * 3);
    
    return {
      ...etapa,
      x,
      ancho,
      touchpointsConPosicion: etapa.touchpoints.map((touchpoint, tpIndex) => ({
        ...touchpoint,
        x: x + 50 + touchpoint.diasDespues * 3, // Escala: 1 día = 3px, con offset inicial
        y: 150, // Altura fija en la línea temporal
      })),
    };
  });

  const handleAddTouchpoint = (etapaId: string) => {
    const etapaIndex = etapas.findIndex(e => e.id === etapaId);
    if (etapaIndex === -1) return;

    const nuevaEtapa = { ...etapas[etapaIndex] };
    const nuevoTouchpoint: TouchpointJourney = {
      orden: nuevaEtapa.touchpoints.length + 1,
      nombre: "Nuevo Touchpoint",
      descripcion: "",
      tipo: "preventivo",
      canal: "whatsapp",
      diasDespues: nuevaEtapa.touchpoints.length > 0 
        ? nuevaEtapa.touchpoints[nuevaEtapa.touchpoints.length - 1].diasDespues + 7
        : 0,
      mensaje: "Hola {nombre}, mensaje personalizado",
    };

    nuevaEtapa.touchpoints = [...nuevaEtapa.touchpoints, nuevoTouchpoint];
    
    const nuevasEtapas = [...etapas];
    nuevasEtapas[etapaIndex] = nuevaEtapa;
    onEtapasChange(nuevasEtapas);
  };

  const handleDeleteTouchpoint = (etapaId: string, touchpointIndex: number) => {
    const etapaIndex = etapas.findIndex(e => e.id === etapaId);
    if (etapaIndex === -1) return;

    const nuevaEtapa = { ...etapas[etapaIndex] };
    nuevaEtapa.touchpoints = nuevaEtapa.touchpoints.filter((_, i) => i !== touchpointIndex);
    
    const nuevasEtapas = [...etapas];
    nuevasEtapas[etapaIndex] = nuevaEtapa;
    onEtapasChange(nuevasEtapas);
    setSelectedTouchpoint(null);
  };

  const handleUpdateTouchpoint = (etapaId: string, touchpointIndex: number, updates: Partial<TouchpointJourney>) => {
    const etapaIndex = etapas.findIndex(e => e.id === etapaId);
    if (etapaIndex === -1) return;

    const nuevaEtapa = { ...etapas[etapaIndex] };
    nuevaEtapa.touchpoints = nuevaEtapa.touchpoints.map((tp, i) => 
      i === touchpointIndex ? { ...tp, ...updates } : tp
    );
    
    const nuevasEtapas = [...etapas];
    nuevasEtapas[etapaIndex] = nuevaEtapa;
    onEtapasChange(nuevasEtapas);
  };

  const handleUpdateEtapa = (etapaId: string, updates: Partial<EtapaJourney>) => {
    const etapaIndex = etapas.findIndex(e => e.id === etapaId);
    if (etapaIndex === -1) return;

    const nuevasEtapas = [...etapas];
    nuevasEtapas[etapaIndex] = { ...nuevasEtapas[etapaIndex], ...updates };
    onEtapasChange(nuevasEtapas);
  };

  const selectedEtapaData = selectedEtapa ? etapas.find(e => e.id === selectedEtapa) : null;
  const selectedTouchpointData = selectedTouchpoint 
    ? etapas.find(e => e.id === selectedTouchpoint.etapaId)?.touchpoints[selectedTouchpoint.touchpointIndex]
    : null;

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Header */}
      <div className="border-b border-border p-4 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Customer Journey - Editor</h2>
          <p className="text-sm text-muted-foreground">Visualiza y edita las etapas y touchpoints del journey</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}>
            -
          </Button>
          <span className="text-sm w-16 text-center">{Math.round(zoom * 100)}%</span>
          <Button variant="outline" size="sm" onClick={() => setZoom(Math.min(2, zoom + 0.1))}>
            +
          </Button>
          <Button variant="outline" onClick={onClose}>
            <X className="w-4 h-4 mr-2" />
            Cerrar
          </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Canvas principal */}
        <div className="flex-1 overflow-auto bg-white" ref={canvasRef}>
          <div className="relative" style={{ minWidth: "2000px", minHeight: "600px", transform: `scale(${zoom})`, transformOrigin: "top left" }}>
            {/* Línea temporal horizontal */}
            <div className="absolute top-32 left-0 right-0 h-1 bg-primary/30" />
            
            {/* Etiquetas de edad/estadio en la línea */}
            <div className="absolute top-24 left-0 right-0 flex gap-8 px-4">
              <div className="text-xs text-muted-foreground">0-12 años</div>
              <div className="text-xs text-muted-foreground">13-18 años</div>
              <div className="text-xs text-muted-foreground">19-35 años</div>
              <div className="text-xs text-muted-foreground">36-50 años</div>
              <div className="text-xs text-muted-foreground">50+ años</div>
            </div>

            {/* Etapas */}
            {etapasConPosicion.map((etapa) => (
              <div key={etapa.id} className="absolute" style={{ left: etapa.x, top: 100 }}>
                {/* Bloque de etapa */}
                <div
                  className={cn(
                    "w-48 p-3 border-2 rounded-lg cursor-pointer transition-all",
                    selectedEtapa === etapa.id
                      ? "border-primary bg-primary/5"
                      : "border-border bg-background hover:border-primary/50"
                  )}
                  onClick={() => setSelectedEtapa(etapa.id)}
                >
                  <div className="font-semibold text-sm mb-1">{etapa.nombre}</div>
                  <div className="text-xs text-muted-foreground line-clamp-2">{etapa.descripcion}</div>
                  <Badge variant="outline" className="mt-2 text-xs">
                    {etapa.touchpoints.length} touchpoints
                  </Badge>
                </div>

                {/* Touchpoints */}
                {etapa.touchpointsConPosicion.map((touchpoint, tpIndex) => {
                  const CanalIcon = canalIcons[touchpoint.canal] || MessageSquare;
                  const isSelected = selectedTouchpoint?.etapaId === etapa.id && selectedTouchpoint.touchpointIndex === tpIndex;
                  
                  return (
                    <div
                      key={tpIndex}
                      className="absolute cursor-pointer group"
                      style={{ left: touchpoint.x, top: 180 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTouchpoint({ etapaId: etapa.id, touchpointIndex: tpIndex });
                        setSelectedEtapa(etapa.id);
                      }}
                    >
                      {/* Línea vertical desde la línea temporal */}
                      <div className="absolute left-1/2 -top-32 w-0.5 bg-border" style={{ height: "32px" }} />
                      
                      {/* Nodo del touchpoint */}
                      <div
                        className={cn(
                          "w-14 h-14 rounded-full border-2 flex items-center justify-center transition-all shadow-sm",
                          isSelected
                            ? `border-primary ${canalColors[touchpoint.canal]} text-white scale-110`
                            : `border-border bg-white ${canalColors[touchpoint.canal]}/10 hover:border-primary hover:scale-105`
                        )}
                      >
                        <CanalIcon className="w-6 h-6" />
                      </div>
                      
                      {/* Etiqueta de días */}
                      <div className="absolute top-16 left-1/2 transform -translate-x-1/2 text-xs font-medium text-muted-foreground whitespace-nowrap">
                        {touchpoint.diasDespues}d
                      </div>
                      
                      {/* Tooltip con información */}
                      <div className="absolute top-20 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                        <Card className="p-2 shadow-lg min-w-[200px]">
                          <div className="text-xs font-semibold">{touchpoint.nombre}</div>
                          <div className="text-xs text-muted-foreground">{touchpoint.diasDespues} días - {canalLabels[touchpoint.canal]}</div>
                        </Card>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Panel lateral de edición */}
        <div className="w-96 border-l border-border overflow-auto bg-background">
          {selectedTouchpointData && selectedTouchpoint ? (
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Editar Touchpoint</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    handleDeleteTouchpoint(selectedTouchpoint.etapaId, selectedTouchpoint.touchpointIndex);
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-2">
                <Label>Nombre</Label>
                <Input
                  value={selectedTouchpointData.nombre}
                  onChange={(e) =>
                    handleUpdateTouchpoint(selectedTouchpoint.etapaId, selectedTouchpoint.touchpointIndex, {
                      nombre: e.target.value,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Canal</Label>
                <Select
                  value={selectedTouchpointData.canal}
                  onValueChange={(value) =>
                    handleUpdateTouchpoint(selectedTouchpoint.etapaId, selectedTouchpoint.touchpointIndex, {
                      canal: value as any,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(canalLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Días después</Label>
                <Input
                  type="number"
                  value={selectedTouchpointData.diasDespues}
                  onChange={(e) =>
                    handleUpdateTouchpoint(selectedTouchpoint.etapaId, selectedTouchpoint.touchpointIndex, {
                      diasDespues: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select
                  value={selectedTouchpointData.tipo}
                  onValueChange={(value) =>
                    handleUpdateTouchpoint(selectedTouchpoint.etapaId, selectedTouchpoint.touchpointIndex, {
                      tipo: value as any,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="preventivo">Preventivo</SelectItem>
                    <SelectItem value="recordatorio">Recordatorio</SelectItem>
                    <SelectItem value="seguimiento">Seguimiento</SelectItem>
                    <SelectItem value="educativo">Educativo</SelectItem>
                    <SelectItem value="fidelizacion">Fidelización</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Mensaje</Label>
                <Textarea
                  value={selectedTouchpointData.mensaje}
                  onChange={(e) =>
                    handleUpdateTouchpoint(selectedTouchpoint.etapaId, selectedTouchpoint.touchpointIndex, {
                      mensaje: e.target.value,
                    })
                  }
                  rows={6}
                />
              </div>
            </div>
          ) : selectedEtapaData ? (
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Editar Etapa</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddTouchpoint(selectedEtapaData.id)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Touchpoint
                </Button>
              </div>

              <div className="space-y-2">
                <Label>Nombre</Label>
                <Input
                  value={selectedEtapaData.nombre}
                  onChange={(e) =>
                    handleUpdateEtapa(selectedEtapaData.id, { nombre: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Descripción</Label>
                <Textarea
                  value={selectedEtapaData.descripcion}
                  onChange={(e) =>
                    handleUpdateEtapa(selectedEtapaData.id, { descripcion: e.target.value })
                  }
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Criterios</Label>
                <div className="space-y-2 text-sm">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Edad mínima"
                      type="number"
                      value={selectedEtapaData.criterios.edadMin || ""}
                      onChange={(e) =>
                        handleUpdateEtapa(selectedEtapaData.id, {
                          criterios: {
                            ...selectedEtapaData.criterios,
                            edadMin: e.target.value ? parseInt(e.target.value) : undefined,
                          },
                        })
                      }
                    />
                    <Input
                      placeholder="Edad máxima"
                      type="number"
                      value={selectedEtapaData.criterios.edadMax || ""}
                      onChange={(e) =>
                        handleUpdateEtapa(selectedEtapaData.id, {
                          criterios: {
                            ...selectedEtapaData.criterios,
                            edadMax: e.target.value ? parseInt(e.target.value) : undefined,
                          },
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Touchpoints ({selectedEtapaData.touchpoints.length})</Label>
                <div className="space-y-2">
                  {selectedEtapaData.touchpoints.map((touchpoint, index) => {
                    const CanalIcon = canalIcons[touchpoint.canal] || MessageSquare;
                    return (
                      <Card
                        key={index}
                        className="p-3 cursor-pointer hover:bg-muted"
                        onClick={() =>
                          setSelectedTouchpoint({ etapaId: selectedEtapaData.id, touchpointIndex: index })
                        }
                      >
                        <div className="flex items-center gap-2">
                          <div className={`p-1.5 rounded ${canalColors[touchpoint.canal]}/20`}>
                            <CanalIcon className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium">{touchpoint.nombre}</div>
                            <div className="text-xs text-muted-foreground">
                              {touchpoint.diasDespues} días - {canalLabels[touchpoint.canal]}
                            </div>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 text-center text-muted-foreground">
              Selecciona una etapa o touchpoint para editarlo
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

