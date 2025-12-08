import { useState, useRef, useCallback, useEffect } from "react";
import { MessageSquare, Mail, Bot, UserRound, Trash2, Clock, GripVertical, Plus, Edit2, X } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

export type TouchpointNode = {
  id: string;
  canal: string;
  x: number;
  y: number;
  mensaje: string;
  diasEspera: number;
};

type CampaignCanvasProps = {
  touchpoints: TouchpointNode[];
  onTouchpointsChange: (touchpoints: TouchpointNode[]) => void;
  canalesDisponibles: Array<{
    id: string;
    label: string;
    icon: any;
    color: string;
    description?: string;
  }>;
  selectedTouchpoint?: string | null;
  onTouchpointSelect?: (id: string | null) => void;
};

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

export function CampaignCanvas({
  touchpoints,
  onTouchpointsChange,
  canalesDisponibles,
  selectedTouchpoint: externalSelectedTouchpoint,
  onTouchpointSelect,
}: CampaignCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [draggedNode, setDraggedNode] = useState<TouchpointNode | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [internalSelectedNode, setInternalSelectedNode] = useState<string | null>(null);
  const [isDraggingFromPalette, setIsDraggingFromPalette] = useState<string | null>(null);
  const [editingNode, setEditingNode] = useState<string | null>(null);
  const [editingText, setEditingText] = useState<string>("");

  // Usar selección externa si está disponible, sino usar interna
  const selectedNode = externalSelectedTouchpoint !== undefined 
    ? externalSelectedTouchpoint 
    : internalSelectedNode;
  
  const handleSelectNode = (id: string | null) => {
    if (onTouchpointSelect) {
      onTouchpointSelect(id);
    } else {
      setInternalSelectedNode(id);
    }
  };

  // Ordenar touchpoints por posición X para determinar el orden de la secuencia
  const sortedTouchpoints = [...touchpoints].sort((a, b) => a.x - b.x);

  const handleMouseDown = useCallback((e: React.MouseEvent, node: TouchpointNode) => {
    if (e.target instanceof HTMLElement && e.target.closest('button, input, textarea, select')) {
      return;
    }
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setDragOffset({
      x: x - node.x,
      y: y - node.y,
    });
    setDraggedNode(node);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!draggedNode || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.max(50, Math.min(rect.width - 200, e.clientX - rect.left - dragOffset.x));
    // Mantener Y cerca de la línea horizontal (200px) con snap
    const rawY = e.clientY - rect.top - dragOffset.y;
    const y = Math.abs(rawY - 200) < 50 ? 200 : Math.max(50, Math.min(rect.height - 250, rawY));

    const updated = touchpoints.map((tp) =>
      tp.id === draggedNode.id ? { ...tp, x, y } : tp
    );
    onTouchpointsChange(updated);
  }, [draggedNode, dragOffset, touchpoints, onTouchpointsChange]);

  const handleMouseUp = useCallback(() => {
    setDraggedNode(null);
    setIsDraggingFromPalette(null);
  }, []);

  useEffect(() => {
    if (draggedNode) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [draggedNode, handleMouseMove, handleMouseUp]);

  const handleCanvasDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!isDraggingFromPalette || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - 100; // Centrar el nodo
    const y = 200; // Posición fija horizontal para mantener orden

    const canal = canalesDisponibles.find((c) => c.id === isDraggingFromPalette);
    if (!canal) return;

    // Calcular posición X basada en el número de touchpoints existentes
    const spacing = 250; // Espacio entre touchpoints
    const startX = 100;
    const newX = touchpoints.length > 0 
      ? Math.max(startX, sortedTouchpoints[sortedTouchpoints.length - 1].x + spacing)
      : startX;

    const nuevoTouchpoint: TouchpointNode = {
      id: `touchpoint-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      canal: canal.id,
      x: Math.max(50, Math.min(rect.width - 200, newX)),
      y: y,
      mensaje: plantillasDefault[canal.id] || "",
      diasEspera: touchpoints.length > 0 ? 3 : 0,
    };

    onTouchpointsChange([...touchpoints, nuevoTouchpoint]);
    setIsDraggingFromPalette(null);
  }, [isDraggingFromPalette, touchpoints, sortedTouchpoints, onTouchpointsChange, canalesDisponibles]);

  const handleCanvasDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDeleteNode = useCallback((id: string) => {
    onTouchpointsChange(touchpoints.filter((tp) => tp.id !== id));
    if (selectedNode === id) {
      setSelectedNode(null);
    }
  }, [touchpoints, onTouchpointsChange, selectedNode]);

  const handleUpdateNode = useCallback((id: string, updates: Partial<TouchpointNode>) => {
    onTouchpointsChange(
      touchpoints.map((tp) => (tp.id === id ? { ...tp, ...updates } : tp))
    );
  }, [touchpoints, onTouchpointsChange]);

  const handlePaletteDragStart = useCallback((canalId: string) => {
    setIsDraggingFromPalette(canalId);
  }, []);


  return (
    <div className="flex gap-4 h-[600px]">
      {/* Paleta de Touchpoints */}
      <div className="w-48 flex-shrink-0 space-y-2">
        <Label className="text-sm font-medium">Touchpoints</Label>
        <div className="space-y-2 overflow-y-auto max-h-[580px]">
          {canalesDisponibles.map((canal) => {
            const Icon = canal.icon;
            return (
              <Card
                key={canal.id}
                className="p-3 cursor-grab active:cursor-grabbing hover:bg-muted/50 transition-colors"
                draggable
                onDragStart={() => handlePaletteDragStart(canal.id)}
              >
                <div className="flex items-center gap-2">
                  <GripVertical className="w-4 h-4 text-muted-foreground" />
                  <Icon className={cn("w-4 h-4", canal.color)} />
                  <span className="text-sm font-medium flex-1">{canal.label}</span>
                </div>
                {canal.description && (
                  <p className="text-xs text-muted-foreground mt-1 ml-6">
                    {canal.description}
                  </p>
                )}
              </Card>
            );
          })}
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 relative">
        <div
          ref={canvasRef}
          className="w-full h-full border-2 border-dashed border-border rounded-lg bg-gradient-to-br from-background to-muted/20 relative overflow-hidden"
          onDrop={handleCanvasDrop}
          onDragOver={handleCanvasDragOver}
        >
          {/* Grid de fondo */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `
                linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px),
                linear-gradient(to bottom, hsl(var(--border)) 1px, transparent 1px)
              `,
              backgroundSize: "20px 20px",
            }}
          />

          {/* Conexiones entre nodos - Líneas horizontales claras */}
          <svg className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
            {sortedTouchpoints.map((node, index) => {
              if (index === sortedTouchpoints.length - 1) return null;
              const nextNode = sortedTouchpoints[index + 1];
              
              // Puntos de conexión desde el borde derecho del nodo actual al izquierdo del siguiente
              const fromX = node.x + 200; // Borde derecho del card (200px de ancho)
              const fromY = node.y + 100; // Centro vertical del card (aprox)
              const toX = nextNode.x; // Borde izquierdo del siguiente card
              const toY = nextNode.y + 100; // Centro vertical
              
              // Línea horizontal simple y clara
              const midX = (fromX + toX) / 2;
              const lineY = Math.max(fromY, toY);
              
              return (
                <g key={`connection-${node.id}-${nextNode.id}`}>
                  {/* Línea horizontal principal */}
                  <line
                    x1={fromX}
                    y1={lineY}
                    x2={toX}
                    y2={lineY}
                    stroke="hsl(var(--primary))"
                    strokeWidth="3"
                    strokeDasharray="8,4"
                    opacity={0.6}
                  />
                  {/* Flecha al final */}
                  <polygon
                    points={`${toX - 8},${lineY - 6} ${toX},${lineY} ${toX - 8},${lineY + 6}`}
                    fill="hsl(var(--primary))"
                    opacity={0.8}
                  />
                  {/* Etiqueta de tiempo de espera */}
                  {nextNode.diasEspera > 0 && (
                    <g>
                      <rect
                        x={midX - 40}
                        y={lineY - 20}
                        width="80"
                        height="20"
                        rx="4"
                        fill="hsl(var(--background))"
                        stroke="hsl(var(--primary))"
                        strokeWidth="1.5"
                        opacity={0.95}
                        className="shadow-md"
                      />
                      <text
                        x={midX}
                        y={lineY - 6}
                        textAnchor="middle"
                        fontSize="10"
                        fill="hsl(var(--primary))"
                        fontWeight="700"
                      >
                        {nextNode.diasEspera === 1 ? "1 día" : nextNode.diasEspera === 7 ? "1 semana" : nextNode.diasEspera === 14 ? "2 semanas" : `${nextNode.diasEspera} días`}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Línea de tiempo horizontal para mostrar el orden */}
          {sortedTouchpoints.length > 0 && (
            <div 
              className="absolute left-0 right-0"
              style={{
                top: "100px",
                height: "2px",
                background: "linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) 100%)",
                opacity: 0.2,
                zIndex: 0,
              }}
            />
          )}

          {/* Nodos de Touchpoints - Organizados horizontalmente */}
          {sortedTouchpoints.map((node, index) => {
            const canal = canalesDisponibles.find((c) => c.id === node.canal);
            if (!canal) return null;

            const Icon = canal.icon;
            const isSelected = selectedNode === node.id;
            const isDragging = draggedNode?.id === node.id;
            const nodeIndex = index;

            // Auto-organizar en línea horizontal si no están muy separados verticalmente
            const displayY = Math.abs(node.y - 200) > 50 ? node.y : 200;
            const displayX = node.x;

            return (
              <div
                key={node.id}
                className={cn(
                  "absolute transition-all",
                  isDragging && "z-50",
                  isSelected && "z-40"
                )}
                style={{
                  left: `${displayX}px`,
                  top: `${displayY}px`,
                  transform: isDragging ? "scale(1.05)" : undefined,
                }}
                onMouseDown={(e) => {
                  if (e.target instanceof HTMLElement && e.target.closest('button, textarea, input')) {
                    return;
                  }
                  handleMouseDown(e, node);
                }}
                onClick={(e) => {
                  if (e.target instanceof HTMLElement && e.target.closest('button, textarea')) {
                    return;
                  }
                  handleSelectNode(node.id);
                }}
              >
                {/* Número de orden grande y visible */}
                <div 
                  className={cn(
                    "absolute -top-8 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-lg transition-all",
                    isSelected 
                      ? "bg-primary text-primary-foreground scale-110" 
                      : "bg-muted text-muted-foreground border-2 border-border"
                  )}
                >
                  {nodeIndex + 1}
                </div>

                <Card className={cn(
                  "w-[200px] shadow-lg hover:shadow-xl transition-all",
                  isSelected && "ring-2 ring-primary ring-offset-2 shadow-xl border-primary",
                  isDragging && "scale-105"
                )}>
                  <div className="p-4 space-y-3 bg-gradient-to-br from-background to-muted/20">
                    {/* Header con canal */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-1">
                        <div className={cn("p-2 rounded-lg", canal.color.replace("text-", "bg-").replace("-500", "-100 dark:bg-").replace("-500", "-900/30"))}>
                          <Icon className={cn("w-5 h-5", canal.color)} />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-semibold text-foreground">{canal.label}</div>
                          {nodeIndex > 0 && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                              <Clock className="w-3 h-3" />
                              <span>
                                {node.diasEspera === 0
                                  ? "Inmediato"
                                  : node.diasEspera === 1
                                  ? "1 día después"
                                  : node.diasEspera === 7
                                  ? "1 semana después"
                                  : `${node.diasEspera} días después`}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteNode(node.id);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    {/* Mensaje - Siempre visible y editable */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-medium text-muted-foreground">Mensaje</Label>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs text-primary hover:text-primary hover:bg-primary/10"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingNode(node.id);
                            setEditingText(node.mensaje);
                          }}
                        >
                          <Edit2 className="w-3 h-3 mr-1" />
                          Editar
                        </Button>
                      </div>
                      
                      {editingNode !== node.id ? (
                        <div 
                          className={cn(
                            "text-sm text-foreground bg-muted/40 rounded-md p-3 min-h-[60px] border border-border cursor-pointer hover:bg-muted/60 transition-colors",
                            !node.mensaje && "text-muted-foreground italic"
                          )}
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingNode(node.id);
                            setEditingText(node.mensaje);
                          }}
                        >
                          {node.mensaje || "Haz clic para agregar mensaje"}
                        </div>
                      ) : (
                        <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
                          <Textarea
                            value={editingText}
                            onChange={(e) => setEditingText(e.target.value)}
                            rows={4}
                            className="text-sm"
                            autoFocus
                            placeholder="Escribe el mensaje aquí..."
                            onKeyDown={(e) => {
                              if (e.key === "Escape") {
                                setEditingNode(null);
                                setEditingText("");
                              }
                              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                                handleUpdateNode(node.id, { mensaje: editingText });
                                setEditingNode(null);
                                setEditingText("");
                              }
                            }}
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="default"
                              className="h-7 text-xs flex-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUpdateNode(node.id, { mensaje: editingText });
                                setEditingNode(null);
                                setEditingText("");
                              }}
                            >
                              Guardar
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingNode(null);
                                setEditingText("");
                              }}
                            >
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </div>
            );
          })}

          {/* Mensaje cuando no hay touchpoints */}
          {touchpoints.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center space-y-4 max-w-md">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/10 rounded-full blur-xl"></div>
                  <Plus className="w-16 h-16 mx-auto text-primary relative z-10 animate-pulse" />
                </div>
                <div className="space-y-2">
                  <p className="text-lg font-semibold text-foreground">
                    Canvas Vacío
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Arrastra touchpoints desde la paleta lateral al canvas para comenzar a diseñar tu campaña
                  </p>
                  <p className="text-xs text-muted-foreground mt-4">
                    💡 Tip: Puedes mover los touchpoints libremente y hacer clic en ellos para configurarlos
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Panel de configuración del nodo seleccionado - Solo se muestra si no hay selección externa */}
      {selectedNode && !onTouchpointSelect && (
        <div className="w-80 flex-shrink-0 border-l border-border pl-4 space-y-4 overflow-y-auto max-h-[580px]">
          <div>
            <Label className="text-sm font-medium">Configurar Touchpoint</Label>
            <p className="text-xs text-muted-foreground mt-1">
              Edita los detalles del touchpoint seleccionado
            </p>
          </div>

          {(() => {
            const node = touchpoints.find((tp) => tp.id === selectedNode);
            if (!node) return null;

            const canal = canalesDisponibles.find((c) => c.id === node.canal);

            return (
              <div className="space-y-4">
                {/* Canal (no editable, solo info) */}
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Canal</Label>
                  <div className="flex items-center gap-2 p-2 rounded bg-muted/50">
                    {canal && (
                      <>
                        <canal.icon className={cn("w-4 h-4", canal.color)} />
                        <span className="text-sm font-medium">{canal.label}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Tiempo de espera (solo si no es el primero) */}
                {sortedTouchpoints.findIndex((tp) => tp.id === node.id) > 0 && (
                  <div className="space-y-2">
                    <Label htmlFor={`espera-${node.id}`}>Tiempo de espera</Label>
                    <Select
                      value={String(node.diasEspera)}
                      onValueChange={(value) =>
                        handleUpdateNode(node.id, { diasEspera: parseInt(value) })
                      }
                    >
                      <SelectTrigger id={`espera-${node.id}`}>
                        <Clock className="w-4 h-4 mr-2 text-muted-foreground" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {opcionesEspera.map((opt) => (
                          <SelectItem key={opt.value} value={String(opt.value)}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Mensaje */}
                <div className="space-y-2">
                  <Label htmlFor={`mensaje-${node.id}`}>Mensaje</Label>
                  <p className="text-xs text-muted-foreground">
                    Variables disponibles: {"{nombre}"}, {"{meses}"}
                  </p>
                  <Textarea
                    id={`mensaje-${node.id}`}
                    value={node.mensaje}
                    onChange={(e) =>
                      handleUpdateNode(node.id, { mensaje: e.target.value })
                    }
                    rows={node.canal === "Email" ? 6 : 4}
                    className="text-sm"
                  />
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}

