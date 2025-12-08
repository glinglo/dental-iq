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
  TrendingUp,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  ArrowRight,
  Brain,
  Activity,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { BudgetWithPatient, LaFraiseKPIs, SecuenciaComunicacion, ReglaComunicacion, PasoComunicacion } from "@shared/schema";

export default function PresupuestosDashboard() {
  const [, setLocation] = useLocation();

  const { data: budgets = [] } = useQuery<BudgetWithPatient[]>({
    queryKey: ["/api/budgets"],
  });

  const { data: kpis } = useQuery<LaFraiseKPIs>({
    queryKey: ["/api/dashboard/lafraise-kpis"],
  });

  // Obtener secuencias activas
  const { data: secuencias = [] } = useQuery<Array<{ secuencia: SecuenciaComunicacion; regla: ReglaComunicacion | undefined }>>({
    queryKey: ["/api/secuencias-comunicacion", { tipo: "relance_presupuesto", estado: "activa" }],
    queryFn: async () => {
      const response = await fetch("/api/secuencias-comunicacion?tipo=relance_presupuesto&estado=activa");
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
    refetchInterval: 10000, // Refrescar cada 10 segundos
  });

  const secuenciasPorBudget = new Map(
    secuencias.map(s => [s.secuencia.budgetId, s])
  );

  const pendingBudgets = budgets.filter((b) => b.status === "pending");
  const acceptedBudgets = budgets.filter((b) => b.status === "accepted");
  const rejectedBudgets = budgets.filter((b) => b.status === "rejected");

  // Calcular métricas del agente
  const presupuestosActivos = pendingBudgets.length;
  const tasaCierre = budgets.length > 0 
    ? ((acceptedBudgets.length + rejectedBudgets.length) / budgets.length) * 100 
    : 0;
  
  // Calcular promedio de días hasta cierre
  const budgetsCerrados = [...acceptedBudgets, ...rejectedBudgets];
  const diasPromedio = budgetsCerrados.length > 0
    ? budgetsCerrados.reduce((acc, budget) => {
        if (!budget.createdAt) return acc;
        const created = new Date(budget.createdAt);
        const closed = budget.updatedAt ? new Date(budget.updatedAt) : new Date();
        const days = Math.floor((closed.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
        return acc + days;
      }, 0) / budgetsCerrados.length
    : 0;

  // Facturación generada
  const facturacionGenerada = acceptedBudgets.reduce((acc, b) => acc + Number(b.amount), 0);

  // Top 5 presupuestos con más actividad (por número de acciones)
  const topPresupuestos = pendingBudgets
    .map(budget => {
      const secuenciaData = secuenciasPorBudget.get(budget.id);
      const pasos = secuenciaData?.regla?.secuencia as PasoComunicacion[] || [];
      const pasoActual = secuenciaData?.secuencia.pasoActual || 0;
      const proximaAccion = secuenciaData?.secuencia.proximaAccion;
      
      return {
        budget,
        pasoActual,
        pasos,
        proximaAccion,
        secuenciaData,
      };
    })
    .sort((a, b) => b.pasoActual - a.pasoActual)
    .slice(0, 5);

  const calculateDaysPending = (createdAt: Date | string | null) => {
    if (!createdAt) return 0;
    const created = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - created.getTime());
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  };

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
          <h1 className="text-3xl font-semibold text-foreground">Dashboard de Presupuestos</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Vista centralizada del Agente de Presupuestos - Trabajando automáticamente para cerrar presupuestos
          </p>
        </div>

        {/* KPIs del Agente */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Presupuestos Activos</p>
                  <div className="text-2xl font-bold">{presupuestosActivos}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    En seguimiento automático
                  </p>
                </div>
                <Activity className="w-8 h-8 text-primary opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Tasa de Cierre</p>
                  <div className="text-2xl font-bold">{tasaCierre.toFixed(1)}%</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {acceptedBudgets.length} aceptados + {rejectedBudgets.length} rechazados
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
                  <p className="text-sm text-muted-foreground">Promedio Días</p>
                  <div className="text-2xl font-bold">{diasPromedio.toFixed(0)}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Hasta cierre (promedio)
                  </p>
                </div>
                <Clock className="w-8 h-8 text-blue-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Facturación Generada</p>
                  <div className="text-2xl font-bold">
                    {facturacionGenerada.toLocaleString("es-ES", {
                      style: "currency",
                      currency: "EUR",
                      maximumFractionDigits: 0,
                    })}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Desde presupuestos aceptados
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-green-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Presupuestos en Seguimiento Activo */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Presupuestos en Seguimiento Activo</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLocation("/presupuestos/seguimiento")}
              >
                Ver Todos
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {topPresupuestos.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No hay presupuestos en seguimiento activo
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Paciente</TableHead>
                      <TableHead>Monto</TableHead>
                      <TableHead>Días Pendiente</TableHead>
                      <TableHead>Estado Campaña</TableHead>
                      <TableHead>Última Acción</TableHead>
                      <TableHead>Próxima Acción</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topPresupuestos.map(({ budget, secuenciaData, pasoActual, pasos, proximaAccion }) => {
                      const estadoCampaña = getEstadoCampaña(secuenciaData);
                      const pasoActualData = pasos[pasoActual];
                      const daysPending = calculateDaysPending(budget.createdAt);
                      
                      return (
                        <TableRow 
                          key={budget.id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => setLocation(`/presupuestos/seguimiento/${budget.id}`)}
                        >
                          <TableCell className="font-medium">
                            {budget.patientName}
                          </TableCell>
                          <TableCell>
                            {Number(budget.amount).toLocaleString("es-ES", {
                              style: "currency",
                              currency: "EUR",
                            })}
                          </TableCell>
                          <TableCell>
                            <Badge variant={daysPending > 7 ? "destructive" : "secondary"}>
                              {daysPending} días
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
                          <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setLocation(`/presupuestos/seguimiento/${budget.id}`)}
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
          <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setLocation("/presupuestos/seguimiento")}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Ver Seguimiento</p>
                  <p className="text-sm text-muted-foreground">Todos los presupuestos pendientes</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setLocation("/presupuestos/seguimiento")}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="font-medium">Análisis y Métricas</p>
                  <p className="text-sm text-muted-foreground">Ver seguimiento completo</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setLocation("/presupuestos/analisis")}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <Brain className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="font-medium">Análisis de Cierres</p>
                  <p className="text-sm text-muted-foreground">Presupuestos cerrados</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

