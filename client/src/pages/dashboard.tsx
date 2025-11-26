import { useState } from "react";
import { Users, Calendar, DollarSign, CalendarDays, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import type { DashboardKPIs } from "@shared/schema";

type TimeFrame = "7d" | "14d" | "30d" | "trimestre" | "semestre" | "año";

const timeFrameOptions: { value: TimeFrame; label: string }[] = [
  { value: "7d", label: "Últimos 7 días" },
  { value: "14d", label: "Últimos 14 días" },
  { value: "30d", label: "Últimos 30 días" },
  { value: "trimestre", label: "Último trimestre" },
  { value: "semestre", label: "Último semestre" },
  { value: "año", label: "Último año" },
];

const timeFrameMultipliers: Record<TimeFrame, number> = {
  "7d": 0.5,
  "14d": 1,
  "30d": 2,
  "trimestre": 6,
  "semestre": 12,
  "año": 24,
};

export default function Dashboard() {
  const [timeFrame, setTimeFrame] = useState<TimeFrame>("14d");

  const { data: kpis, isLoading } = useQuery<DashboardKPIs>({
    queryKey: ["/api/dashboard/kpis"],
  });

  const multiplier = timeFrameMultipliers[timeFrame];
  
  const pacientesPerdidos = kpis ? Math.round(kpis.pacientesPerdidos * multiplier) : 0;
  const citasGeneradas = kpis ? Math.round(kpis.citasGeneradas * multiplier) : 0;
  const beneficioEstimado = citasGeneradas * 85;

  const forecastData = [
    { mes: "Mes 1", actual: beneficioEstimado, proyectado: Math.round(beneficioEstimado * 1.2) },
    { mes: "Mes 2", actual: null, proyectado: Math.round(beneficioEstimado * 1.5) },
    { mes: "Mes 3", actual: null, proyectado: Math.round(beneficioEstimado * 1.9) },
    { mes: "Mes 4", actual: null, proyectado: Math.round(beneficioEstimado * 2.4) },
    { mes: "Mes 5", actual: null, proyectado: Math.round(beneficioEstimado * 3.0) },
    { mes: "Mes 6", actual: null, proyectado: Math.round(beneficioEstimado * 3.7) },
  ];

  const maxProyectado = Math.max(...forecastData.map(d => d.proyectado));

  const getTimeFrameLabel = () => {
    return timeFrameOptions.find(opt => opt.value === timeFrame)?.label.toLowerCase() || "";
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-5xl mx-auto p-6 space-y-8">
        {/* Header with Time Frame Selector */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-semibold text-foreground" data-testid="text-page-title">
              Dashboard
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Resumen de resultados de reactivación
            </p>
          </div>
          <div className="flex items-center gap-3">
            <CalendarDays className="w-4 h-4 text-muted-foreground" />
            <Select value={timeFrame} onValueChange={(value) => setTimeFrame(value as TimeFrame)}>
              <SelectTrigger className="w-48" data-testid="select-timeframe">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {timeFrameOptions.map((option) => (
                  <SelectItem 
                    key={option.value} 
                    value={option.value}
                    data-testid={`option-${option.value}`}
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* 3 KPIs Principales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pacientes Perdidos */}
          <Card className="relative overflow-visible" data-testid="card-kpi-pacientes">
            <CardContent className="pt-6 pb-6">
              {isLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-12 w-24" />
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="w-5 h-5 text-chart-1" />
                    <span className="text-sm font-medium">Pacientes perdidos</span>
                  </div>
                  <div className="text-5xl font-bold text-foreground" data-testid="text-kpi-pacientes">
                    {pacientesPerdidos}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    detectados en {getTimeFrameLabel()}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Citas Creadas */}
          <Card className="relative overflow-visible" data-testid="card-kpi-citas">
            <CardContent className="pt-6 pb-6">
              {isLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-12 w-24" />
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-5 h-5 text-chart-2" />
                    <span className="text-sm font-medium">Citas creadas</span>
                  </div>
                  <div className="text-5xl font-bold text-foreground" data-testid="text-kpi-citas">
                    {citasGeneradas}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    en {getTimeFrameLabel()}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Beneficio Obtenido */}
          <Card className="relative overflow-visible" data-testid="card-kpi-beneficio">
            <CardContent className="pt-6 pb-6">
              {isLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-12 w-24" />
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <DollarSign className="w-5 h-5 text-chart-3" />
                    <span className="text-sm font-medium">Beneficio obtenido</span>
                  </div>
                  <div className="text-5xl font-bold text-foreground" data-testid="text-kpi-beneficio">
                    {beneficioEstimado.toLocaleString('es-ES')}€
                  </div>
                  <p className="text-xs text-muted-foreground">
                    en {getTimeFrameLabel()}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Forecast Chart */}
        <Card data-testid="card-forecast">
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg font-semibold">Forecast</CardTitle>
            </div>
            <p className="text-sm text-muted-foreground">
              Proyección de beneficios basada en tu rendimiento actual
            </p>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <div className="space-y-6">
                {/* Chart */}
                <div className="h-56 flex items-end justify-between gap-4">
                  {forecastData.map((data, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full flex flex-col items-center gap-1">
                        <span className="text-xs font-medium text-primary">
                          {data.proyectado.toLocaleString('es-ES')}€
                        </span>
                        <div 
                          className={`w-full rounded-md transition-all ${
                            data.actual !== null 
                              ? 'bg-primary' 
                              : 'bg-primary/30 border-2 border-dashed border-primary'
                          }`}
                          style={{ height: `${(data.proyectado / maxProyectado) * 160}px` }}
                          data-testid={`forecast-bar-${index}`}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground font-medium">
                        {data.mes}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Legend */}
                <div className="flex items-center justify-center gap-6 pt-2 border-t border-border">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm bg-primary" />
                    <span className="text-xs text-muted-foreground">Actual</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm bg-primary/30 border border-dashed border-primary" />
                    <span className="text-xs text-muted-foreground">Proyectado</span>
                  </div>
                </div>

                {/* Summary */}
                <div className="bg-muted/50 rounded-lg p-4 text-center">
                  <p className="text-sm text-muted-foreground">
                    En 6 meses podrías alcanzar hasta
                  </p>
                  <p className="text-3xl font-bold text-primary mt-1" data-testid="text-forecast-total">
                    {forecastData[5].proyectado.toLocaleString('es-ES')}€
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    de beneficio mensual con nuestro sistema
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Última actualización */}
        <div className="text-center text-xs text-muted-foreground pt-4">
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
