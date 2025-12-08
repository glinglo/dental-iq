import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Users,
  Calendar,
  TrendingUp,
  Heart,
  ArrowRight,
  Activity,
  Clock,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { Paciente, SecuenciaComunicacion, ReglaComunicacion, PasoComunicacion } from "@shared/schema";

export default function CampanasDashboard() {
  const [, setLocation] = useLocation();

  const { data: pacientes = [] } = useQuery<Paciente[]>({
    queryKey: ["/api/pacientes"],
  });

  // Obtener pacientes dormidos
  const pacientesDormidos = pacientes.filter(p => p.estado === "perdido");

  // Obtener secuencias activas de recuperación
  const { data: secuencias = [] } = useQuery<Array<{ secuencia: SecuenciaComunicacion; regla: ReglaComunicacion | undefined }>>({
    queryKey: ["/api/secuencias-comunicacion", { tipo: "recuperacion_paciente", estado: "activa" }],
    queryFn: async () => {
      const response = await fetch("/api/secuencias-comunicacion?tipo=recuperacion_paciente&estado=activa");
      const secuenciasData: SecuenciaComunicacion[] = await response.json();
      
      const secuenciasConReglas = await Promise.all(
        secuenciasData.map(async (secuencia) => {
          const reglaResponse = await fetch(`/api/reglas-comunicacion/${secuencia.reglaId}`);
          const regla = reglaResponse.ok ? await reglaResponse.json() : undefined;
          return { secuencia, regla };
        })
      );
      
      return secuenciasConReglas;
    },
    refetchInterval: 10000,
  });

  const secuenciasPorPaciente = new Map(
    secuencias.map(s => [s.secuencia.pacienteId, s])
  );

  // Calcular métricas del agente
  const pacientesEnRecuperacion = pacientesDormidos.filter(p => 
    secuenciasPorPaciente.has(p.id)
  ).length;

  // Pacientes recuperados (tienen cita futura después de estar dormidos)
  const pacientesRecuperados = pacientes.filter(p => 
    p.tieneCitaFutura && p.estado === "activo"
  ).length;

  // Top 5 pacientes con más actividad
  const topPacientes = pacientesDormidos
    .map(paciente => {
      const secuenciaData = secuenciasPorPaciente.get(paciente.id);
      const pasos = secuenciaData?.regla?.secuencia as PasoComunicacion[] || [];
      const pasoActual = secuenciaData?.secuencia.pasoActual || 0;
      const proximaAccion = secuenciaData?.secuencia.proximaAccion;
      
      return {
        paciente,
        pasoActual,
        pasos,
        proximaAccion,
        secuenciaData,
      };
    })
    .sort((a, b) => b.pasoActual - a.pasoActual)
    .slice(0, 5);

  const getEstadoCampaña = (secuenciaData: { secuencia: SecuenciaComunicacion; regla: ReglaComunicacion | undefined } | undefined) => {
    if (!secuenciaData) {
      return { label: "Sin campaña", variant: "secondary" as const };
    }
    const pasos = secuenciaData.regla?.secuencia as PasoComunicacion[] || [];
    const pasoActual = secuenciaData.secuencia.pasoActual || 0;
    const proximaAccion = secuenciaData.secuencia.proximaAccion;
    
    if (pasoActual >= pasos.length) {
      return { label: "Completada", variant: "default" as const };
    }
    if (proximaAccion && new Date(proximaAccion) <= new Date()) {
      return { label: `Paso ${pasoActual + 1}/${pasos.length} - Pendiente`, variant: "destructive" as const };
    }
    return { label: `Paso ${pasoActual + 1}/${pasos.length}`, variant: "default" as const };
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-semibold text-foreground">Dashboard de Campañas</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Vista centralizada del Agente de Seguimiento de Clientes - Recuperando pacientes dormidos automáticamente
          </p>
        </div>

        {/* KPIs del Agente */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pacientes Dormidos</p>
                  <div className="text-2xl font-bold">{pacientesDormidos.length}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Detectados automáticamente
                  </p>
                </div>
                <Users className="w-8 h-8 text-primary opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">En Recuperación</p>
                  <div className="text-2xl font-bold">{pacientesEnRecuperacion}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Campañas activas
                  </p>
                </div>
                <Activity className="w-8 h-8 text-blue-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Recuperados</p>
                  <div className="text-2xl font-bold">{pacientesRecuperados}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Con cita agendada
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Tasa Recuperación</p>
                  <div className="text-2xl font-bold">
                    {pacientesDormidos.length > 0
                      ? ((pacientesRecuperados / pacientesDormidos.length) * 100).toFixed(1)
                      : "0"}%
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Últimos 30 días
                  </p>
                </div>
                <Heart className="w-8 h-8 text-green-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pacientes en Recuperación Activa */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Pacientes en Recuperación Activa</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLocation("/campañas/recuperacion")}
              >
                Ver Todos
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {topPacientes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No hay pacientes en recuperación activa
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Paciente</TableHead>
                      <TableHead>Meses Sin Visita</TableHead>
                      <TableHead>Prioridad</TableHead>
                      <TableHead>Estado Campaña</TableHead>
                      <TableHead>Última Acción</TableHead>
                      <TableHead>Próxima Acción</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topPacientes.map(({ paciente, secuenciaData, pasoActual, pasos, proximaAccion }) => {
                      const estadoCampaña = getEstadoCampaña(secuenciaData);
                      const pasoActualData = pasos[pasoActual];
                      
                      return (
                        <TableRow 
                          key={paciente.id}
                          className="cursor-pointer hover:bg-muted/50"
                        >
                          <TableCell className="font-medium">
                            {paciente.nombre}
                          </TableCell>
                          <TableCell>
                            <Badge variant={paciente.mesesSinVisita && paciente.mesesSinVisita > 12 ? "destructive" : "secondary"}>
                              {paciente.mesesSinVisita || 0} meses
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={
                                paciente.prioridad === "Alta" ? "destructive" :
                                paciente.prioridad === "Media" ? "default" : "secondary"
                              }
                            >
                              {paciente.prioridad || "N/A"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              <Badge variant={estadoCampaña.variant}>
                                {estadoCampaña.label}
                              </Badge>
                              {pasoActualData && (
                                <span className="text-xs text-muted-foreground">
                                  {pasoActualData.canal === "whatsapp" ? "WhatsApp" : 
                                   pasoActualData.canal === "sms" ? "SMS" : 
                                   pasoActualData.canal === "email" ? "Email" : 
                                   pasoActualData.canal === "llamada" ? "Llamada" : pasoActualData.canal}
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {secuenciaData?.secuencia.ultimaAccion ? (
                              <span className="text-sm text-muted-foreground">
                                {format(new Date(secuenciaData.secuencia.ultimaAccion), "dd/MM HH:mm", { locale: es })}
                              </span>
                            ) : (
                              <span className="text-sm text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {proximaAccion ? (
                              <span className="text-sm font-medium">
                                {format(new Date(proximaAccion), "dd/MM HH:mm", { locale: es })}
                              </span>
                            ) : (
                              <span className="text-sm text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setLocation(`/campañas/recuperacion`)}
                            >
                              Ver Detalle
                              <ArrowRight className="w-4 h-4 ml-1" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Acciones Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setLocation("/campañas/recuperacion")}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Heart className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Recuperación de Pacientes</p>
                  <p className="text-sm text-muted-foreground">Pacientes dormidos</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setLocation("/campañas/salud-preventiva")}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="font-medium">Salud Preventiva</p>
                  <p className="text-sm text-muted-foreground">Recordatorios automáticos</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setLocation("/pacientes/recordatorios")}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="font-medium">Recordatorios</p>
                  <p className="text-sm text-muted-foreground">Citas próximas</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

