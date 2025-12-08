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

interface PostVisitaConfig {
  horasDespues: number; // Horas después de la visita
  canal: "sms" | "whatsapp" | "email";
  mensaje: string;
}

interface ConfiguracionPostVisita {
  activo: boolean;
  mensajes: PostVisitaConfig[]; // Array de configuraciones de mensajes post-visita
}

export default function PacientesPostVisita() {
  const { toast } = useToast();
  const [configuracion, setConfiguracion] = useState<ConfiguracionPostVisita>({
    activo: false,
    mensajes: [
      { horasDespues: 24, canal: "whatsapp", mensaje: "" },
      { horasDespues: 168, canal: "email", mensaje: "" }, // 7 días = 168 horas
    ],
  });

  // Obtener configuración de mensajes post-visita automáticos
  const { data: reglaPostVisita } = useQuery({
    queryKey: ["/api/reglas-comunicacion"],
    queryFn: async () => {
      const res = await fetch("/api/reglas-comunicacion");
      if (!res.ok) throw new Error("Error al cargar reglas");
      const reglas = await res.json();
      return reglas.find((r: any) => r.tipo === "post_visita") || null;
    },
  });

  // Cargar configuración desde la regla
  useEffect(() => {
    if (reglaPostVisita) {
      const mensajes: PostVisitaConfig[] = [];

      if (Array.isArray(reglaPostVisita.secuencia)) {
        for (const paso of reglaPostVisita.secuencia) {
          if (typeof paso === "object" && paso !== null) {
            let horasDespues = 24;
            // En post-visita, diasDespues se convierte directamente a horas
            if ("horasDespues" in paso && typeof paso.horasDespues === "number") {
              horasDespues = paso.horasDespues;
            } else if ("diasDespues" in paso) {
              const dias = paso.diasDespues as number;
              horasDespues = dias * 24; // Convertir días a horas
            }

            const canal = (paso.canal as "sms" | "whatsapp" | "email") || "whatsapp";
            const mensaje = (paso.mensaje as string) || "";

            mensajes.push({
              horasDespues,
              canal,
              mensaje,
            });
          }
        }
      }

      setConfiguracion({
        activo: reglaPostVisita.activa || false,
        mensajes:
          mensajes.length > 0
            ? mensajes
            : [
                { horasDespues: 24, canal: "whatsapp", mensaje: "" },
                { horasDespues: 168, canal: "email", mensaje: "" },
              ],
      });
    }
  }, [reglaPostVisita]);

  // Guardar configuración
  const guardarConfiguracionMutation = useMutation({
    mutationFn: async (config: ConfiguracionPostVisita) => {
      // Buscar la regla existente o crear una nueva
      const reglas = await fetch("/api/reglas-comunicacion").then((r) => r.json());
      let reglaExistente = reglas.find((r: any) => r.tipo === "post_visita");

      const secuencia = config.mensajes.map((msg, index) => ({
        orden: index + 1,
        canal: msg.canal,
        diasDespues: Math.floor(msg.horasDespues / 24), // Para compatibilidad
        horasDespues: msg.horasDespues,
        mensaje: msg.mensaje,
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
          nombre: "Mensajes Post-Visita Automáticos",
          tipo: "post_visita",
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
        description: "Los mensajes post-visita automáticos se han configurado correctamente",
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

  const agregarMensaje = () => {
    setConfiguracion({
      ...configuracion,
      mensajes: [
        ...configuracion.mensajes,
        { horasDespues: 24, canal: "whatsapp", mensaje: "" },
      ],
    });
  };

  const eliminarMensaje = (index: number) => {
    setConfiguracion({
      ...configuracion,
      mensajes: configuracion.mensajes.filter((_, i) => i !== index),
    });
  };

  const actualizarMensaje = (
    index: number,
    campo: keyof PostVisitaConfig,
    valor: any
  ) => {
    const nuevosMensajes = [...configuracion.mensajes];
    nuevosMensajes[index] = {
      ...nuevosMensajes[index],
      [campo]: valor,
    };
    setConfiguracion({
      ...configuracion,
      mensajes: nuevosMensajes,
    });
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-semibold text-foreground">Mensajes Post-Visita Automáticos</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Configura los mensajes automáticos que se enviarán después de cada visita para seguimiento y fidelización
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
                    Mensajes post-visita automáticos: {configuracion.activo ? "Activos" : "Inactivos"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {configuracion.activo
                      ? `Se enviarán ${configuracion.mensajes.length} mensaje(s) automáticamente después de cada visita`
                      : "Activa los mensajes post-visita automáticos para configurarlos"}
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

        {/* Configuración de mensajes post-visita - Solo se muestra si está activo */}
        {configuracion.activo && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Configuración de Mensajes Post-Visita
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {configuracion.mensajes.map((mensaje, index) => (
                <div
                  key={index}
                  className="p-4 border rounded-lg space-y-4 bg-card"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">Mensaje {index + 1}</h3>
                    {configuracion.mensajes.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => eliminarMensaje(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Horas después */}
                    <div className="space-y-2">
                      <Label>Horas después de la visita</Label>
                      <Input
                        type="number"
                        value={mensaje.horasDespues}
                        onChange={(e) =>
                          actualizarMensaje(
                            index,
                            "horasDespues",
                            parseInt(e.target.value) || 0
                          )
                        }
                        min="1"
                        placeholder="Ej: 24 (1 día)"
                      />
                      <p className="text-xs text-muted-foreground">
                        Número de horas después de la visita para enviar el mensaje
                      </p>
                    </div>

                    {/* Canal */}
                    <div className="space-y-2">
                      <Label>Canal de envío</Label>
                      <Select
                        value={mensaje.canal}
                        onValueChange={(value) =>
                          actualizarMensaje(
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
                        Canal por el que se enviará este mensaje
                      </p>
                    </div>
                  </div>

                  {/* Mensaje */}
                  <div className="space-y-2">
                    <Label>Mensaje personalizado (opcional)</Label>
                    <Textarea
                      value={mensaje.mensaje}
                      onChange={(e) =>
                        actualizarMensaje(index, "mensaje", e.target.value)
                      }
                      placeholder="Deja vacío para usar el mensaje generado automáticamente por IA. Variables disponibles: {nombre}, {fecha}, {tratamiento}"
                      rows={3}
                    />
                    <p className="text-xs text-muted-foreground">
                      Si está vacío, se generará un mensaje personalizado automáticamente usando IA
                    </p>
                  </div>
                </div>
              ))}

              {/* Agregar nuevo mensaje */}
              <Button
                variant="outline"
                onClick={agregarMensaje}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Agregar Mensaje
              </Button>

              {/* Botón guardar */}
              <div className="flex justify-end pt-4 border-t">
                <Button
                  onClick={() => guardarConfiguracionMutation.mutate(configuracion)}
                  disabled={
                    guardarConfiguracionMutation.isPending ||
                    configuracion.mensajes.length === 0
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
