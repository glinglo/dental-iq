import { Users, TrendingUp, Mail, Calendar, DollarSign, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import type { DashboardKPIs, ConversionPorCanal } from "@shared/schema";

export default function Dashboard() {
  const { data: kpis, isLoading: kpisLoading } = useQuery<DashboardKPIs>({
    queryKey: ["/api/dashboard/kpis"],
  });

  const { data: conversionPorCanal, isLoading: conversionLoading } = useQuery<ConversionPorCanal[]>({
    queryKey: ["/api/dashboard/conversion-canal"],
  });

  const isLoading = kpisLoading || conversionLoading;

  const kpiCards = kpis ? [
    {
      title: "Pacientes Perdidos Detectados",
      value: kpis.pacientesPerdidos,
      icon: Users,
      color: "text-chart-1",
    },
    {
      title: "Pacientes en Campañas",
      value: kpis.pacientesEnCampanas,
      icon: Target,
      color: "text-chart-2",
    },
    {
      title: "Contactos Enviados",
      value: kpis.contactosEnviados,
      icon: Mail,
      color: "text-chart-3",
    },
    {
      title: "Citas Generadas",
      value: kpis.citasGeneradas,
      icon: Calendar,
      color: "text-chart-4",
    },
    {
      title: "Conversión Paciente → Cita",
      value: `${kpis.tasaConversion.toFixed(1)}%`,
      icon: TrendingUp,
      color: "text-chart-5",
    },
    {
      title: "ROI Estimado",
      value: `${kpis.roiEstimado}x`,
      icon: DollarSign,
      color: "text-primary",
    },
  ] : [];

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-semibold text-foreground" data-testid="text-page-title">
            Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Vista general de métricas de reactivación de pacientes
          </p>
        </div>

        {/* KPI Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, index) => (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-4 rounded" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-9 w-20" />
                </CardContent>
              </Card>
            ))
          ) : (
            kpiCards.map((kpi, index) => (
              <Card key={index} data-testid={`card-kpi-${index}`}>
                <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {kpi.title}
                  </CardTitle>
                  <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground" data-testid={`text-kpi-value-${index}`}>
                    {kpi.value}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Conversión por Canal */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Conversión por Canal</CardTitle>
              <p className="text-sm text-muted-foreground">
                Efectividad de cada canal de comunicación
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {conversionLoading ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-12" />
                    </div>
                    <Skeleton className="h-2 w-full" />
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                ))
              ) : (
                conversionPorCanal
                  ?.sort((a, b) => b.conversion - a.conversion)
                  .map((canal, index) => (
                    <div key={index} className="space-y-2" data-testid={`channel-${index}`}>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-foreground">
                          {canal.canal}
                        </span>
                        <span className="text-sm font-bold text-foreground">
                          {canal.conversion}%
                        </span>
                      </div>
                      <Progress value={canal.conversion * 5} className="h-2" />
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{canal.contactos} contactos</span>
                        <span>{canal.citas} citas</span>
                      </div>
                    </div>
                  ))
              )}
            </CardContent>
          </Card>

          {/* Reactivación por Semana */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Tendencia de Reactivación</CardTitle>
              <p className="text-sm text-muted-foreground">
                Citas generadas en las últimas 4 semanas
              </p>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-end justify-between gap-2">
                {[3, 5, 4, 7].map((value, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center gap-2">
                    <div 
                      className="w-full bg-primary rounded-md hover-elevate transition-all"
                      style={{ height: `${value * 12}%` }}
                      data-testid={`bar-week-${index}`}
                    />
                    <div className="text-center">
                      <div className="text-xl font-bold text-foreground">{value}</div>
                      <div className="text-xs text-muted-foreground">
                        Sem {index + 1}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Ranking de Efectividad */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Ranking de Efectividad</CardTitle>
            <p className="text-sm text-muted-foreground">
              Tasa de conversión por canal de comunicación
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {conversionLoading ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <Skeleton key={index} className="h-20 w-full" />
                ))
              ) : (
                conversionPorCanal?.map((canal, index) => (
                  <div 
                    key={index} 
                    className="flex items-center gap-4 p-4 rounded-md border border-border hover-elevate transition-all"
                    data-testid={`ranking-item-${index}`}
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-bold text-primary">#{index + 1}</span>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-foreground">{canal.canal}</div>
                      <div className="text-xs text-muted-foreground">
                        {canal.citas} citas de {canal.contactos} contactos
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-primary">
                      {canal.conversion}%
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Última actualización */}
        <div className="text-center text-xs text-muted-foreground">
          Última actualización: {new Date().toLocaleString('es-ES', { 
            day: '2-digit', 
            month: 'long', 
            year: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </div>
      </div>
    </div>
  );
}
