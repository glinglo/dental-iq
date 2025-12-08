import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, Clock, Plus, Trash2, Settings } from "lucide-react";

interface RecordatorioConfig {
  horasAntes: number;
  canal: "sms" | "whatsapp" | "email";
  mensaje: string;
}

interface ConfiguracionRecordatorios {
  activo: boolean;
  recordatorios: RecordatorioConfig[];
}

export default function PacientesRecordatorios() {
  const { toast } = useToast();
  const [configuracion, setConfiguracion] = useState<ConfiguracionRecordatorios>({
    activo: false,
    recordatorios: [
      { horasAntes: 24, canal: "whatsapp", mensaje: "" },
      { horasAntes: 1, canal: "sms", mensaje: "" },
    ],
  });

  // Obtener configuración de recordatorios automáticos
  const { data: reglaRecordatorios } = useQuery({
    queryKey: ["/api/reglas-comunicacion"],
    queryFn: async () => {
      const res = await fetch("/api/reglas-comunicacion");
      if (!res.ok) throw new Error("Error al cargar reglas");
      const reglas = await res.json();
      return reglas.find((r: any) => r.tipo === "recordatorio_cita") || null;
    },
  });

  // Cargar configuración desde la regla
  useEffect(() => {
    if (reglaRecordatorios) {
      const recordatorios: RecordatorioConfig[] = [];

      if (Array.isArray(reglaRecordatorios.secuencia)) {
        for (const paso of reglaRecordatorios.secuencia) {
          if (typeof paso === "object" && paso !== null) {
            let horasAntes = 24;
            if ("horasAntes" in paso && typeof paso.horasAntes === "number") {
              horasAntes = paso.horasAntes;
            } else if ("diasDespues" in paso) {
              const dias = paso.diasDespues as number;
              horasAntes = dias === 1 ? 24 : dias === 0 ? 1 : dias * 24;
            }

            const canal = (paso.canal as "sms" | "whatsapp" | "email") || "whatsapp";
            const mensaje = (paso.mensaje as string) || "";

            recordatorios.push({
              horasAntes,
              canal,
              mensaje,
            });
          }
        }
      }

      setConfiguracion({
        activo: reglaRecordatorios.activa || false,
        recordatorios:
          recordatorios.length > 0
            ? recordatorios
            : [
                { horasAntes: 24, canal: "whatsapp", mensaje: "" },
                { horasAntes: 1, canal: "sms", mensaje: "" },
              ],
      });
    }
  }, [reglaRecordatorios]);

  // Guardar configuración
  const guardarConfiguracionMutation = useMutation({
    mutationFn: async (config: ConfiguracionRecordatorios) => {
      // Buscar la regla existente o crear una nueva
      const reglas = await fetch("/api/reglas-comunicacion").then((r) => r.json());
      let reglaExistente = reglas.find((r: any) => r.tipo === "recordatorio_cita");

      const secuencia = config.recordatorios.map((rec, index) => ({
        orden: index + 1,
        canal: rec.canal,
        diasDespues: rec.horasAntes >= 24 ? Math.floor(rec.horasAntes / 24) : 0, // Para compatibilidad
        horasAntes: rec.horasAntes,
        mensaje: rec.mensaje,
        accion: "enviar",
        requiereConfirmacion: false,
      }));

      if (reglaExistente) {
        // Actualizar regla existente
        const response = await apiRequest(
          "PUT",
          `/api/reglas-comunicacion/${reglaExistente.id}`,
          {
            activa: config.activo,
            secuencia,
          }
        );
        return response.json();
      } else {
        // Crear nueva regla
        const response = await apiRequest("POST", "/api/reglas-comunicacion", {
          nombre: "Recordatorio Cita Automático",
          tipo: "recordatorio_cita",
          activa: config.activo,
          secuencia,
        });
        return response.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reglas-comunicacion"] });
      toast({
        title: "Configuración guardada",
        description: "Los recordatorios automáticos se han configurado correctamente",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo guardar la configuración",
        variant: "destructive",
      });
    },
  });

  const agregarRecordatorio = () => {
    setConfiguracion({
      ...configuracion,
      recordatorios: [
        ...configuracion.recordatorios,
        { horasAntes: 24, canal: "whatsapp", mensaje: "" },
      ],
    });
  };

  const eliminarRecordatorio = (index: number) => {
    setConfiguracion({
      ...configuracion,
      recordatorios: configuracion.recordatorios.filter((_, i) => i !== index),
    });
  };

  const actualizarRecordatorio = (
    index: number,
    campo: keyof RecordatorioConfig,
    valor: any
  ) => {
    const nuevosRecordatorios = [...configuracion.recordatorios];
    nuevosRecordatorios[index] = {
      ...nuevosRecordatorios[index],
      [campo]: valor,
    };
    setConfiguracion({
      ...configuracion,
      recordatorios: nuevosRecordatorios,
    });
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-semibold text-foreground">Recordatorios Automáticos</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Configura los recordatorios automáticos que se enviarán antes de cada cita
          </p>
        </div>

        {/* Estado de automatización */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {configuracion.activo ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                ) : (
                  <Clock className="w-5 h-5 text-muted-foreground" />
                )}
                <div>
                  <p className="font-medium">
                    Recordatorios automáticos: {configuracion.activo ? "Activos" : "Inactivos"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {configuracion.activo
                      ? `Se enviarán ${configuracion.recordatorios.length} recordatorio(s) automáticamente antes de cada cita`
                      : "Los recordatorios automáticos están desactivados"}
                  </p>
                </div>
              </div>
              <Switch
                checked={configuracion.activo}
                onCheckedChange={(checked) =>
                  setConfiguracion({ ...configuracion, activo: checked })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Configuración de recordatorios - Solo se muestra si está activo */}
        {configuracion.activo && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Configuración de Recordatorios
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {configuracion.recordatorios.map((recordatorio, index) => (
                <div
                  key={index}
                  className="p-4 border rounded-lg space-y-4 bg-card"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">Recordatorio {index + 1}</h3>
                    {configuracion.recordatorios.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => eliminarRecordatorio(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Horas antes */}
                    <div className="space-y-2">
                      <Label>Horas antes de la cita</Label>
                      <Input
                        type="number"
                        value={recordatorio.horasAntes}
                        onChange={(e) =>
                          actualizarRecordatorio(
                            index,
                            "horasAntes",
                            parseInt(e.target.value) || 0
                          )
                        }
                        min="1"
                        placeholder="Ej: 24"
                      />
                      <p className="text-xs text-muted-foreground">
                        Número de horas antes de la cita para enviar el recordatorio
                      </p>
                    </div>

                    {/* Canal */}
                    <div className="space-y-2">
                      <Label>Canal de envío</Label>
                      <Select
                        value={recordatorio.canal}
                        onValueChange={(value) =>
                          actualizarRecordatorio(
                            index,
                            "canal",
                            value as "sms" | "whatsapp" | "email"
                          )
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="whatsapp">WhatsApp</SelectItem>
                          <SelectItem value="sms">SMS</SelectItem>
                          <SelectItem value="email">Email</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        Canal por el que se enviará este recordatorio
                      </p>
                    </div>
                  </div>

                  {/* Mensaje */}
                  <div className="space-y-2">
                    <Label>Mensaje personalizado (opcional)</Label>
                    <Textarea
                      value={recordatorio.mensaje}
                      onChange={(e) =>
                        actualizarRecordatorio(index, "mensaje", e.target.value)
                      }
                      placeholder="Deja vacío para usar el mensaje generado automáticamente por IA. Variables disponibles: {nombre}, {fecha}, {hora}, {tipo}"
                      rows={3}
                    />
                    <p className="text-xs text-muted-foreground">
                      Si está vacío, se generará un mensaje personalizado automáticamente usando IA
                    </p>
                  </div>
                </div>
              ))}

              {/* Agregar nuevo recordatorio */}
              <Button
                variant="outline"
                onClick={agregarRecordatorio}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Agregar Recordatorio
              </Button>

              {/* Botón guardar */}
              <div className="flex justify-end pt-4 border-t">
                <Button
                  onClick={() => guardarConfiguracionMutation.mutate(configuracion)}
                  disabled={
                    guardarConfiguracionMutation.isPending ||
                    configuracion.recordatorios.length === 0
                  }
                >
                  {guardarConfiguracionMutation.isPending
                    ? "Guardando..."
                    : "Guardar Configuración"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
