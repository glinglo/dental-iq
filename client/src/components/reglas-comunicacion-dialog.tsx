import { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2, Edit, Settings, MessageSquare, Phone, Mail, Clock, ArrowRight, Sparkles, Loader2 } from "lucide-react";
import type { ReglaComunicacion, PasoComunicacion } from "@shared/schema";

const canalLabels: Record<string, string> = {
  whatsapp: "WhatsApp",
  sms: "SMS",
  email: "Email",
  llamada: "Llamada",
};

const canalIcons: Record<string, any> = {
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

const accionLabels: Record<string, string> = {
  enviar: "Enviar mensaje",
  programar_llamada: "Programar llamada",
  escalar: "Escalar a supervisor",
};

// Mensajes de ejemplo por canal
const mensajesEjemplo: Record<string, string> = {
  whatsapp: "Hola {nombre}, 👋\n\nTe recordamos que tienes un presupuesto pendiente de {monto}€ para {tratamiento}.\n\n¿Te gustaría agendar una cita para revisarlo?",
  sms: "Hola {nombre}, tienes un presupuesto pendiente de {monto}€. ¿Quieres agendar cita? Responde SÍ o llámanos al {telefono}",
  email: "Estimado/a {nombre},\n\nLe recordamos que tiene un presupuesto pendiente de {monto}€ para {tratamiento}.\n\nPor favor, contáctenos para agendar su cita.\n\nSaludos cordiales,\nClínica Dental",
  llamada: "Llamada telefónica para recordar el presupuesto pendiente y ofrecer agendar cita",
};

// Mensajes de ejemplo para recall de pacientes
const mensajesEjemploRecall: Record<string, string> = {
  whatsapp: "Hola {nombre}, 👋\n\nHace tiempo que no te vemos por la clínica. ¿Te gustaría agendar una revisión para cuidar tu salud bucal?\n\nEstamos aquí para ayudarte. 😊",
  sms: "Hola {nombre}, hace tiempo que no te vemos. ¿Te gustaría agendar una revisión? Responde SÍ o llámanos.",
  email: "Estimado/a {nombre},\n\nHace tiempo que no nos visita. Le invitamos a agendar una revisión para cuidar su salud bucal.\n\nEstaremos encantados de atenderle.\n\nSaludos cordiales,\nClínica Dental",
  llamada: "Llamada telefónica para invitar al paciente a agendar una revisión y recuperar su relación con la clínica",
};

// Mensajes de ejemplo para salud preventiva
const mensajesEjemploPreventiva: Record<string, string> = {
  whatsapp: "Hola {nombre}, 👋\n\nEs momento de cuidar tu salud bucal. Te recomendamos agendar tu {tratamiento} para mantener una sonrisa perfecta.\n\n¿Te gustaría agendar tu cita? 😊",
  sms: "Hola {nombre}, es momento de tu {tratamiento}. La prevención es clave para una sonrisa saludable. Llámanos para agendar.",
  email: "Estimado/a {nombre},\n\nLe recordamos que es momento de agendar su {tratamiento}. La salud bucal preventiva es fundamental para mantener una sonrisa perfecta.\n\nEstaremos encantados de atenderle.\n\nSaludos cordiales,\nClínica Dental",
  llamada: "Llamada telefónica para recordar al paciente sobre su tratamiento preventivo recomendado y motivar a agendar cita",
};

interface ReglasComunicacionDialogProps {
  tipo: "relance_presupuesto" | "recordatorio_cita" | "post_visita" | "salud_preventiva" | "recall_paciente";
  titulo?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  reglaId?: string; // ID de la regla a editar (opcional)
}

export function ReglasComunicacionDialog({ 
  tipo, 
  titulo,
  open: externalOpen,
  onOpenChange: externalOnOpenChange,
  reglaId
}: ReglasComunicacionDialogProps) {
  const { toast } = useToast();
  const [internalOpen, setInternalOpen] = useState(false);
  const dialogOpen = externalOpen !== undefined ? externalOpen : internalOpen;
  const setDialogOpen = externalOnOpenChange || setInternalOpen;
  
  const defaultTitulo = titulo || `Reglas de ${tipo.replace(/_/g, " ")}`;
  const [editingRegla, setEditingRegla] = useState<ReglaComunicacion | null>(null);
  const [nombre, setNombre] = useState("");
  const [pasos, setPasos] = useState<PasoComunicacion[]>([]);
  const [criterios, setCriterios] = useState<{
    diagnosticos?: string[];
    mesesSinVisitaMin?: number;
    mesesSinVisitaMax?: number;
    requiereInteraccionesPrevias?: boolean;
    edadMin?: number;
    edadMax?: number;
    tienePresupuestosPendientes?: boolean;
    tieneTratamientosIncompletos?: boolean;
  }>({});
  const [stepActual, setStepActual] = useState<1 | 2>(1);
  const [generandoMensaje, setGenerandoMensaje] = useState<Record<number, boolean>>({});

  const { data: reglas = [] } = useQuery<ReglaComunicacion[]>({
    queryKey: ["/api/reglas-comunicacion"],
    refetchInterval: 30000,
  });

  // Si hay reglaId, buscar esa regla específica, sino buscar la activa del tipo
  const reglaActiva = reglaId 
    ? reglas.find(r => r.id === reglaId)
    : reglas.find(r => r.tipo === tipo && r.activa);

  useEffect(() => {
    if (reglaActiva && !editingRegla) {
      setNombre(reglaActiva.nombre);
      setPasos((reglaActiva.secuencia as PasoComunicacion[]) || []);
      setCriterios((reglaActiva.criterios as any) || {});
      setEditingRegla(reglaActiva);
      setStepActual(1);
    } else if (!reglaActiva) {
      // Para relance_presupuesto, establecer nombre por defecto automáticamente
      if (tipo === "relance_presupuesto") {
        setNombre("Regla de Seguimiento de Presupuestos");
      } else {
        setNombre("");
      }
      setPasos([]);
      setCriterios({});
      setEditingRegla(null);
      setStepActual(1);
    }
  }, [reglaActiva, tipo]);

  const updateMutation = useMutation({
    mutationFn: async (data: {
      id: string;
      nombre?: string;
      activa?: boolean;
      secuencia?: PasoComunicacion[];
      criterios?: any;
    }) => {
      const response = await apiRequest("PUT", `/api/reglas-comunicacion/${data.id}`, {
        nombre: data.nombre,
        activa: data.activa,
        secuencia: data.secuencia,
        criterios: data.criterios,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reglas-comunicacion"] });
      toast({
        title: "Regla actualizada",
        description: "La regla ha sido actualizada correctamente",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo actualizar la regla",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    if (reglaActiva) {
      setNombre(reglaActiva.nombre);
      setPasos((reglaActiva.secuencia as PasoComunicacion[]) || []);
      setCriterios((reglaActiva.criterios as any) || {});
      setEditingRegla(reglaActiva);
    } else {
      setNombre("");
      setPasos([]);
      setCriterios({});
      setEditingRegla(null);
    }
    setStepActual(1);
  };

  const handleAddPaso = () => {
    const mensajesDisponibles = tipo === "recall_paciente" 
      ? mensajesEjemploRecall 
      : tipo === "salud_preventiva"
      ? mensajesEjemploPreventiva
      : mensajesEjemplo;
    const nuevoPaso: PasoComunicacion = {
      orden: pasos.length + 1,
      canal: "whatsapp",
      diasDespues: 2,
      accion: "enviar",
      mensaje: mensajesDisponibles["whatsapp"],
      requiereConfirmacion: false,
    };
    setPasos([...pasos, nuevoPaso]);
  };

  const handleRemovePaso = (index: number) => {
    const nuevosPasos = pasos.filter((_, i) => i !== index).map((p, i) => ({
      ...p,
      orden: i + 1,
    }));
    setPasos(nuevosPasos);
  };

  const handleUpdatePaso = (index: number, campo: keyof PasoComunicacion, valor: any) => {
    const nuevosPasos = [...pasos];
    nuevosPasos[index] = { ...nuevosPasos[index], [campo]: valor };
    setPasos(nuevosPasos);
  };

  const handleGenerarMensajeIA = async (index: number) => {
    const paso = pasos[index];
    if (!paso) return;

    setGenerandoMensaje({ ...generandoMensaje, [index]: true });

    try {
      const response = await apiRequest("POST", "/api/ia/generar-mensaje", {
        tipo,
        canal: paso.canal,
        pasoNumero: paso.orden,
        contexto: {
          // Puedes agregar contexto adicional aquí si lo necesitas
        },
      });

      const data = await response.json();
      if (data.mensaje) {
        handleUpdatePaso(index, "mensaje", data.mensaje);
        toast({
          title: "Mensaje generado",
          description: "El mensaje ha sido generado con IA",
        });
      }
    } catch (error) {
      console.error("Error generando mensaje con IA:", error);
      toast({
        title: "Error",
        description: "No se pudo generar el mensaje con IA",
        variant: "destructive",
      });
    } finally {
      setGenerandoMensaje({ ...generandoMensaje, [index]: false });
    }
  };

  const handleSave = () => {
    // Para relance_presupuesto, establecer nombre automáticamente si está vacío
    const nombreFinal = tipo === "relance_presupuesto" && !nombre.trim() 
      ? "Regla de Seguimiento de Presupuestos"
      : nombre.trim();
    
    if (!nombreFinal && tipo !== "relance_presupuesto") {
      toast({
        title: "Nombre requerido",
        description: "Por favor ingresa un nombre para la regla",
        variant: "destructive",
      });
      return;
    }

    if (pasos.length === 0) {
      toast({
        title: "Secuencia requerida",
        description: "Por favor agrega al menos un paso a la secuencia",
        variant: "destructive",
      });
      return;
    }

    if (reglaActiva) {
      updateMutation.mutate({
        id: reglaActiva.id,
        nombre: nombreFinal,
        secuencia: pasos,
        criterios: tipo === "recall_paciente" ? criterios : undefined,
      });
    } else {
      // Crear nueva regla si no existe
      apiRequest("POST", "/api/reglas-comunicacion", {
        nombre: nombreFinal,
        tipo,
        activa: true,
        secuencia: pasos,
        criterios: tipo === "recall_paciente" ? criterios : undefined,
      }).then(() => {
        queryClient.invalidateQueries({ queryKey: ["/api/reglas-comunicacion"] });
        toast({
          title: "Regla creada",
          description: "La regla de comunicación ha sido creada correctamente",
        });
      }).catch(() => {
        toast({
          title: "Error",
          description: "No se pudo crear la regla",
          variant: "destructive",
        });
      });
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={(open) => {
      setDialogOpen(open);
      if (!open) resetForm();
    }}>
      {externalOpen === undefined && (
        <DialogTrigger asChild>
          <Button variant="outline" size="icon" title="Configurar reglas de comunicación">
            <Settings className="w-4 h-4" />
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{defaultTitulo}</DialogTitle>
          <DialogDescription>
            {tipo === "recall_paciente" 
              ? stepActual === 1 
                ? "Configura los criterios de asignación para esta campaña"
                : "Configura la secuencia de comunicación automática. Los touchpoints se ejecutarán en orden según los tiempos configurados."
              : "Configura la secuencia de comunicación automática. Los touchpoints se ejecutarán en orden según los tiempos configurados."}
          </DialogDescription>
        </DialogHeader>

        {/* Stepper - Solo para recall_paciente */}
        {tipo === "recall_paciente" && (
          <div className="flex items-center justify-center py-4 border-b">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold transition-colors ${
                  stepActual === 1 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-primary/10 text-primary"
                }`}>
                  1
                </div>
                <span className={`text-sm font-medium transition-colors ${
                  stepActual === 1 ? "text-foreground" : "text-muted-foreground"
                }`}>
                  Criterios
                </span>
              </div>
              <div className={`w-12 h-0.5 transition-colors ${
                stepActual === 2 ? "bg-primary" : "bg-border"
              }`} />
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold transition-colors ${
                  stepActual === 2 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted text-muted-foreground"
                }`}>
                  2
                </div>
                <span className={`text-sm font-medium transition-colors ${
                  stepActual === 2 ? "text-foreground" : "text-muted-foreground"
                }`}>
                  Secuencia
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-6 py-4">
          {/* Nombre de la regla - oculto para relance_presupuesto */}
          {tipo !== "relance_presupuesto" && (
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre de la Regla *</Label>
              <Input
                id="nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej: Relance presupuesto estándar"
              />
            </div>
          )}

          {/* Paso 1: Criterios de asignación (solo para recall_paciente) */}
          {tipo === "recall_paciente" && stepActual === 1 && (
            <div className="space-y-4">
              <CriteriosCampañaForm 
                criterios={criterios}
                onChange={setCriterios}
              />
            </div>
          )}

          {/* Paso 2: Secuencia visual (para recall_paciente cuando stepActual === 2, o siempre para otros tipos) */}
          {(tipo !== "recall_paciente" || stepActual === 2) && (
            <div className="space-y-4">
              <Label className="text-base font-semibold">Secuencia de Touchpoints</Label>

              {pasos.length === 0 ? (
                <div 
                  className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors"
                  onClick={handleAddPaso}
                >
                  <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="font-medium mb-1">No hay touchpoints configurados</p>
                  <p className="text-sm mb-4">Haz clic aquí o usa el botón para agregar el primer touchpoint</p>
                  <Button type="button" variant="default" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar Primer Touchpoint
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {pasos.map((paso, index) => {
                    const CanalIcon = canalIcons[paso.canal] || MessageSquare;
                    const mensajesDisponibles = tipo === "recall_paciente" 
                      ? mensajesEjemploRecall 
                      : tipo === "salud_preventiva"
                      ? mensajesEjemploPreventiva
                      : mensajesEjemplo;
                    const mensajePorDefecto = mensajesDisponibles[paso.canal] || "Mensaje de ejemplo";
                    const mensajeActual = paso.mensaje || mensajePorDefecto;
                    
                    return (
                      <div key={index} className="relative">
                        {/* Línea conectora (excepto el último) */}
                        {index < pasos.length - 1 && (
                          <div className="absolute left-8 top-16 bottom-0 w-0.5 bg-border -z-10" />
                        )}
                        
                        <Card className="relative">
                          <CardContent className="pt-6">
                            <div className="flex items-start gap-4">
                              {/* Número de paso */}
                              <div className="flex-shrink-0">
                                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
                                  {paso.orden}
                                </div>
                              </div>

                              {/* Contenido del paso */}
                              <div className="flex-1 space-y-4">
                                {/* Header del touchpoint */}
                                <div className="flex items-start justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className={`p-3 rounded-lg border ${canalColors[paso.canal]}`}>
                                      <CanalIcon className="w-5 h-5" />
                                    </div>
                                    <div>
                                      <h3 className="font-semibold text-lg">{canalLabels[paso.canal]}</h3>
                                      <p className="text-sm text-muted-foreground">{accionLabels[paso.accion]}</p>
                                    </div>
                                  </div>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRemovePaso(index)}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>

                                {/* Configuración del paso */}
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label>Canal</Label>
                                    <Select
                                      value={paso.canal}
                                      onValueChange={(value) => {
                                        handleUpdatePaso(index, "canal", value);
                                        // Actualizar mensaje por defecto si no hay mensaje personalizado
                                        if (!paso.mensaje) {
                                          const mensajesDisponibles = tipo === "recall_paciente" 
                      ? mensajesEjemploRecall 
                      : tipo === "salud_preventiva"
                      ? mensajesEjemploPreventiva
                      : mensajesEjemplo;
                                          handleUpdatePaso(index, "mensaje", mensajesDisponibles[value] || "");
                                        }
                                      }}
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
                                    <Label>Días después del paso anterior</Label>
                                    <div className="flex items-center gap-2">
                                      <Input
                                        type="number"
                                        min="0"
                                        value={paso.diasDespues}
                                        onChange={(e) =>
                                          handleUpdatePaso(
                                            index,
                                            "diasDespues",
                                            parseInt(e.target.value) || 0
                                          )
                                        }
                                        className="w-full"
                                      />
                                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                        <Clock className="w-4 h-4" />
                                        <span>días</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Mensaje editable */}
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <Label>Mensaje que se enviará</Label>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleGenerarMensajeIA(index)}
                                      disabled={generandoMensaje[index]}
                                      className="h-7"
                                    >
                                      {generandoMensaje[index] ? (
                                        <>
                                          <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
                                          Generando...
                                        </>
                                      ) : (
                                        <>
                                          <Sparkles className="w-3 h-3 mr-1.5" />
                                          Generar con IA
                                        </>
                                      )}
                                    </Button>
                                  </div>
                                  <div className="relative">
                                    <div className="absolute left-3 top-3 z-10">
                                      <CanalIcon className="w-5 h-5 text-muted-foreground" />
                                    </div>
                                    <Textarea
                                      value={mensajeActual}
                                      onChange={(e) =>
                                        handleUpdatePaso(index, "mensaje", e.target.value)
                                      }
                                      placeholder={mensajePorDefecto}
                                      className="pl-10 min-h-[120px] resize-none"
                                    />
                                  </div>
                                  <p className="text-xs text-muted-foreground">
                                    Puedes usar variables como {"{"}nombre{"}"}, {"{"}monto{"}"}, {"{"}tratamiento{"}"}
                                  </p>
                                </div>

                                {/* Indicador de tiempo */}
                                {index > 0 && paso.diasDespues > 0 && (
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2 border-t">
                                    <Clock className="w-4 h-4" />
                                    <span>
                                      Esperar {paso.diasDespues} {paso.diasDespues === 1 ? "día" : "días"} después del touchpoint anterior
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    );
                  })}
                  
                  {/* Botón para añadir touchpoint al final */}
                  <div className="flex justify-center pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
                      onClick={handleAddPaso}
                      className="w-full border-dashed"
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Agregar Touchpoint
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <div className="flex items-center justify-between w-full">
            <Button variant="outline" onClick={() => {
              setDialogOpen(false);
              resetForm();
            }}>
              Cancelar
            </Button>
            <div className="flex items-center gap-2">
              {tipo === "recall_paciente" && (
                <>
                  {stepActual === 2 && (
                    <Button
                      variant="outline"
                      onClick={() => setStepActual(1)}
                    >
                      Anterior
                    </Button>
                  )}
                  {stepActual === 1 && (
                    <Button
                      onClick={() => {
                        // Para recall_paciente, validar nombre (no aplica a relance_presupuesto)
                        if (!nombre.trim()) {
                          toast({
                            title: "Nombre requerido",
                            description: "Por favor ingresa un nombre para la regla",
                            variant: "destructive",
                          });
                          return;
                        }
                        setStepActual(2);
                      }}
                    >
                      Siguiente
                    </Button>
                  )}
                  {stepActual === 2 && (
                    <Button onClick={handleSave} disabled={updateMutation.isPending}>
                      {updateMutation.isPending ? "Guardando..." : reglaActiva ? "Actualizar Regla" : "Crear Regla"}
                    </Button>
                  )}
                </>
              )}
              {tipo !== "recall_paciente" && (
                <Button onClick={handleSave} disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? "Guardando..." : reglaActiva ? "Actualizar Regla" : "Crear Regla"}
                </Button>
              )}
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Componente para criterios de campaña (solo para recall_paciente)
function CriteriosCampañaForm({ 
  criterios, 
  onChange 
}: { 
  criterios: any; 
  onChange: (criterios: any) => void;
}) {
  const diagnosticosDisponibles = [
    "Limpieza dental",
    "Ortodoncia",
    "Endodoncia",
    "Implante dental",
    "Extracción molar",
    "Blanqueamiento",
    "Periodoncia",
    "Revisión general",
    "Tratamiento caries",
    "Prótesis dental",
    "Gingivitis",
    "Conducto radicular",
    "Corona dental",
    "Puente dental",
    "Ortopedia maxilar"
  ];

  const [diagnosticosSeleccionados, setDiagnosticosSeleccionados] = useState<string[]>(
    criterios?.diagnosticos || []
  );

  useEffect(() => {
    onChange({
      ...criterios,
      diagnosticos: diagnosticosSeleccionados,
    });
  }, [diagnosticosSeleccionados]);

  const toggleDiagnostico = (diagnostico: string) => {
    if (diagnosticosSeleccionados.includes(diagnostico)) {
      setDiagnosticosSeleccionados(diagnosticosSeleccionados.filter(d => d !== diagnostico));
    } else {
      setDiagnosticosSeleccionados([...diagnosticosSeleccionados, diagnostico]);
    }
  };

  return (
    <div className="space-y-4">
      <Label className="text-base font-semibold">Criterios de Asignación</Label>
      
      {/* Diagnósticos */}
      <div className="space-y-2">
        <Label>Diagnósticos específicos (opcional)</Label>
        <div className="flex flex-wrap gap-2">
          {diagnosticosDisponibles.map(diagnostico => (
            <Badge
              key={diagnostico}
              variant={diagnosticosSeleccionados.includes(diagnostico) ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => toggleDiagnostico(diagnostico)}
            >
              {diagnostico}
            </Badge>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          Selecciona los diagnósticos que activan esta campaña. Si no seleccionas ninguno, se aplicará a todos los pacientes dormidos.
        </p>
      </div>

      {/* Meses sin visita */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Meses sin visita (mínimo)</Label>
          <Input
            type="number"
            min="0"
            value={criterios?.mesesSinVisitaMin || ""}
            onChange={(e) => onChange({
              ...criterios,
              mesesSinVisitaMin: e.target.value ? parseInt(e.target.value) : undefined,
            })}
            placeholder="Ej: 6"
          />
        </div>
        <div className="space-y-2">
          <Label>Meses sin visita (máximo)</Label>
          <Input
            type="number"
            min="0"
            value={criterios?.mesesSinVisitaMax || ""}
            onChange={(e) => onChange({
              ...criterios,
              mesesSinVisitaMax: e.target.value ? parseInt(e.target.value) : undefined,
            })}
            placeholder="Ej: 12"
          />
        </div>
      </div>

      {/* Opciones adicionales */}
      <div className="space-y-2">
        <Label>Opciones adicionales</Label>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="requiereInteracciones"
              checked={criterios?.requiereInteraccionesPrevias || false}
              onCheckedChange={(checked) => onChange({
                ...criterios,
                requiereInteraccionesPrevias: checked,
              })}
            />
            <Label htmlFor="requiereInteracciones" className="font-normal cursor-pointer">
              Requiere interacciones previas con el paciente
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="tienePresupuestos"
              checked={criterios?.tienePresupuestosPendientes || false}
              onCheckedChange={(checked) => onChange({
                ...criterios,
                tienePresupuestosPendientes: checked,
              })}
            />
            <Label htmlFor="tienePresupuestos" className="font-normal cursor-pointer">
              Tiene presupuestos pendientes
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="tieneTratamientos"
              checked={criterios?.tieneTratamientosIncompletos || false}
              onCheckedChange={(checked) => onChange({
                ...criterios,
                tieneTratamientosIncompletos: checked,
              })}
            />
            <Label htmlFor="tieneTratamientos" className="font-normal cursor-pointer">
              Tiene tratamientos incompletos
            </Label>
          </div>
        </div>
      </div>
    </div>
  );
}
