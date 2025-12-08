import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Send,
  MessageSquare,
  Phone,
  Mail,
  Clock,
  Settings,
  List,
  ArrowRight,
  CheckCircle,
  User,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { Paciente, SecuenciaComunicacion, ReglaComunicacion, PasoComunicacion } from "@shared/schema";
import { ReglasComunicacionDialog } from "@/components/reglas-comunicacion-dialog";

interface AccionRecallHoy {
  paciente: Paciente;
  secuencia: SecuenciaComunicacion;
  regla: ReglaComunicacion;
  pasoActual: PasoComunicacion;
  pasoNumero: number;
  totalPasos: number;
}

export default function CampanasAccionesHoy() {
  const [, setLocation] = useLocation();
  const [configDialogOpen, setConfigDialogOpen] = useState(false);

  // Obtener acciones de recall para hoy
  const { data: accionesHoy = [], isLoading } = useQuery<AccionRecallHoy[]>({
    queryKey: ["/api/campanas/acciones-hoy"],
    queryFn: async () => {
      const response = await fetch("/api/secuencias-comunicacion?tipo=recall_paciente&estado=activa");
      const secuenciasData: SecuenciaComunicacion[] = await response.json();
      
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      const mañana = new Date(hoy);
      mañana.setDate(mañana.getDate() + 1);
      
      // Filtrar secuencias con próxima acción para hoy
      const secuenciasHoy = secuenciasData.filter(s => {
        if (!s.proximaAccion) return false;
        const proximaAccion = new Date(s.proximaAccion);
        proximaAccion.setHours(0, 0, 0, 0);
        return proximaAccion.getTime() >= hoy.getTime() && proximaAccion.getTime() < mañana.getTime();
      });
      
      // Obtener reglas y pacientes
      const accionesConDatos = await Promise.all(
        secuenciasHoy.map(async (secuencia) => {
          const [reglaResponse, pacientesResponse] = await Promise.all([
            fetch(`/api/reglas-comunicacion/${secuencia.reglaId}`),
            fetch("/api/pacientes"),
          ]);
          
          const regla: ReglaComunicacion = reglaResponse.ok ? await reglaResponse.json() : null;
          const pacientes: Paciente[] = pacientesResponse.ok ? await pacientesResponse.json() : [];
          const paciente = pacientes.find(p => p.id === secuencia.pacienteId);
          
          if (!regla || !paciente) return null;
          
          const pasos = regla.secuencia as PasoComunicacion[];
          const pasoActualNum = secuencia.pasoActual || 0;
          const pasoActual = pasos[pasoActualNum];
          
          if (!pasoActual) return null;
          
          return {
            paciente,
            secuencia,
            regla,
            pasoActual,
            pasoNumero: pasoActualNum + 1,
            totalPasos: pasos.length,
          };
        })
      );
      
      return accionesConDatos.filter((a): a is AccionRecallHoy => a !== null);
    },
    refetchInterval: 30000, // Refrescar cada 30 segundos
  });

  const getCanalIcon = (canal: string) => {
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

  const getCanalLabel = (canal: string) => {
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
        return canal;
    }
  };

  const getCanalColor = (canal: string) => {
    switch (canal) {
      case "whatsapp":
        return "bg-green-500/10 text-green-600 border-green-500/20";
      case "sms":
        return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      case "email":
        return "bg-purple-500/10 text-purple-600 border-purple-500/20";
      case "llamada":
        return "bg-orange-500/10 text-orange-600 border-orange-500/20";
      default:
        return "bg-gray-500/10 text-gray-600 border-gray-500/20";
    }
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-foreground">Campañas</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Acciones de recall que el Agente IA ejecutará hoy
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setConfigDialogOpen(true)}
            >
              <Settings className="w-4 h-4 mr-2" />
              Configurar Reglas
            </Button>
          </div>
        </div>

        <Tabs defaultValue="acciones" className="space-y-4">
          <TabsList>
            <TabsTrigger value="acciones">
              Acciones de Hoy ({accionesHoy.length})
            </TabsTrigger>
            <TabsTrigger value="recalls" onClick={() => setLocation("/campañas/recalls")}>
              Todos los Recalls
              <ArrowRight className="w-4 h-4 ml-2" />
            </TabsTrigger>
          </TabsList>

          <TabsContent value="acciones" className="space-y-4">
            {isLoading ? (
              <Card>
                <CardContent className="pt-12 pb-12">
                  <div className="text-center">
                    <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-4 animate-spin" />
                    <p className="text-muted-foreground">Cargando acciones...</p>
                  </div>
                </CardContent>
              </Card>
            ) : accionesHoy.length === 0 ? (
              <Card>
                <CardContent className="pt-12 pb-12">
                  <div className="text-center">
                    <CheckCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">¡Todo al día!</h3>
                    <p className="text-sm text-muted-foreground">
                      No hay acciones de recall programadas para hoy. El agente está trabajando automáticamente en segundo plano.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {accionesHoy.map((accion) => {
                  const CanalIcon = getCanalIcon(accion.pasoActual.canal);
                  const proximaAccion = accion.secuencia.proximaAccion 
                    ? new Date(accion.secuencia.proximaAccion)
                    : null;

                  return (
                    <Card
                      key={accion.secuencia.id}
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => {
                        // TODO: Navegar a detalle del paciente en recall
                      }}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-muted-foreground" />
                            <CardTitle className="text-base">{accion.paciente.nombre}</CardTitle>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {accion.regla.nombre}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center gap-2">
                          <div className={`p-2 rounded-lg border ${getCanalColor(accion.pasoActual.canal)}`}>
                            <CanalIcon className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">
                              {getCanalLabel(accion.pasoActual.canal)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Paso {accion.pasoNumero} de {accion.totalPasos}
                            </p>
                          </div>
                        </div>
                        
                        {proximaAccion && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            <span>
                              {format(proximaAccion, "HH:mm", { locale: es })}
                            </span>
                          </div>
                        )}
                        
                        <div className="pt-2 border-t">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Última visita</span>
                            <span className="font-medium">
                              {format(new Date(accion.paciente.ultimaVisita), "dd/MM/yyyy", { locale: es })}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Dialog de configuración */}
        {configDialogOpen && (
          <ReglasComunicacionDialog
            tipo="recall_paciente"
            titulo="Configurar Reglas de Recall"
            open={configDialogOpen}
            onOpenChange={setConfigDialogOpen}
          />
        )}
      </div>
    </div>
  );
}

