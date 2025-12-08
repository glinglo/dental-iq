import { useState } from "react";
import { useLocation } from "wouter";
import { Users, Calendar, DollarSign, CalendarDays, TrendingUp, CheckSquare, AlertTriangle, BarChart3, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar } from "recharts";
import type { DashboardKPIs, ConversionPorCanal, Paciente, DentalIQKPIs } from "@shared/schema";
import { format } from "date-fns";
import { es } from "date-fns/locale";

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
  const [, setLocation] = useLocation();
  const [timeFrame, setTimeFrame] = useState<TimeFrame>("14d");

  const { data: kpis, isLoading } = useQuery<DashboardKPIs>({
    queryKey: ["/api/dashboard/kpis"],
  });

  const { data: dentaliqKPIs, isLoading: loadingDentalIQ } = useQuery<DentalIQKPIs>({
    queryKey: ["/api/dashboard/dentaliq-kpis"],
  });

  const { data: conversionPorCanal = [], isLoading: loadingConversion } = useQuery<ConversionPorCanal[]>({
    queryKey: ["/api/dashboard/conversion-canal"],
  });

  const { data: pacientesEnRiesgo = [], isLoading: loadingRiesgo } = useQuery<Paciente[]>({
    queryKey: ["/api/pacientes/en-riesgo"],
  });

  const multiplier = timeFrameMultipliers[timeFrame];
  
  const pacientesPerdidos = kpis ? Math.round(kpis.pacientesPerdidos * multiplier) : 0;
  const citasGeneradas = kpis ? Math.round(kpis.citasGeneradas * multiplier) : 0;
  const beneficioEstimado = citasGeneradas * 85;

  const forecastData = [
    { mes: "Actual", actual: beneficioEstimado, forecast: beneficioEstimado },
    { mes: "Mes 1", actual: null, forecast: Math.round(beneficioEstimado * 1.2) },
    { mes: "Mes 2", actual: null, forecast: Math.round(beneficioEstimado * 1.5) },
    { mes: "Mes 3", actual: null, forecast: Math.round(beneficioEstimado * 1.9) },
    { mes: "Mes 4", actual: null, forecast: Math.round(beneficioEstimado * 2.4) },
    { mes: "Mes 5", actual: null, forecast: Math.round(beneficioEstimado * 3.0) },
    { mes: "Mes 6", actual: null, forecast: Math.round(beneficioEstimado * 3.7) },
  ];

  const getTimeFrameLabel = () => {
    return timeFrameOptions.find(opt => opt.value === timeFrame)?.label.toLowerCase() || "";
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg shadow-lg p-3">
          <p className="text-sm font-medium text-foreground">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value?.toLocaleString('es-ES')}€
            </p>
          ))}
        </div>
      );
    }
    return null;
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

        {/* 4 KPIs Principales LaFraise */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Tasa Aceptación */}
          <Card className="relative overflow-visible" data-testid="card-kpi-tasa-aceptacion">
            <CardContent className="pt-6 pb-6">
              {loadingDentalIQ ? (
                <div className="space-y-3">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-12 w-24" />
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <TrendingUp className="w-5 h-5 text-chart-1" />
                    <span className="text-sm font-medium">Tasa Aceptación</span>
                  </div>
                  <div className="text-5xl font-bold text-foreground">
                    {dentaliqKPIs ? `${dentaliqKPIs.tasaAceptacion.toFixed(1)}%` : "0.0%"}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Meta: {dentaliqKPIs ? `+${dentaliqKPIs.tasaAceptacionGoal.toFixed(1)}%` : "+20.0%"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Horas Ahorradas */}
          <Card className="relative overflow-visible" data-testid="card-kpi-horas">
            <CardContent className="pt-6 pb-6">
              {loadingDentalIQ ? (
                <div className="space-y-3">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-12 w-24" />
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-5 h-5 text-chart-2" />
                    <span className="text-sm font-medium">Horas Ahorradas</span>
                  </div>
                  <div className="text-5xl font-bold text-foreground">
                    {dentaliqKPIs?.horasAhorradas || 0}h
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Estimado semanal
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tratamientos Aceptados */}
          <Card className="relative overflow-visible" data-testid="card-kpi-tratamientos">
            <CardContent className="pt-6 pb-6">
              {loadingDentalIQ ? (
                <div className="space-y-3">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-12 w-24" />
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CheckSquare className="w-5 h-5 text-chart-3" />
                    <span className="text-sm font-medium">Tratamientos Aceptados</span>
                  </div>
                  <div className="text-5xl font-bold text-foreground">
                    {dentaliqKPIs?.treatmentsAceptados || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Total aceptados
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Facturación Generada */}
          <Card className="relative overflow-visible" data-testid="card-kpi-facturacion">
            <CardContent className="pt-6 pb-6">
              {loadingDentalIQ ? (
                <div className="space-y-3">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-12 w-24" />
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <DollarSign className="w-5 h-5 text-green-500" />
                    <span className="text-sm font-medium">Facturación Generada</span>
                  </div>
                  <div className="text-5xl font-bold text-foreground">
                    {dentaliqKPIs && dentaliqKPIs.facturacionGenerada >= 1000
                      ? `${(dentaliqKPIs.facturacionGenerada / 1000).toFixed(1)}k€`
                      : dentaliqKPIs
                      ? `${Math.round(dentaliqKPIs.facturacionGenerada).toLocaleString('es-ES')}€`
                      : "0€"}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    De presupuestos aceptados
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Grid con nuevas secciones */}
        <div className="grid grid-cols-1 gap-6">
          {/* Ranking de Canales */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                <CardTitle className="text-lg font-semibold">Ranking de Canales</CardTitle>
              </div>
              <p className="text-sm text-muted-foreground">
                Canales con mejor tasa de conversión
              </p>
            </CardHeader>
            <CardContent>
              {loadingConversion ? (
                <Skeleton className="h-64 w-full" />
              ) : conversionPorCanal.length > 0 ? (
                <div className="space-y-4">
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={conversionPorCanal} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis type="number" domain={[0, 20]} tick={{ fontSize: 12 }} className="text-muted-foreground" />
                        <YAxis dataKey="canal" type="category" width={120} tick={{ fontSize: 12 }} className="text-muted-foreground" />
                        <Tooltip 
                          formatter={(value: number) => `${value}%`}
                          labelStyle={{ color: "hsl(var(--foreground))" }}
                        />
                        <Bar dataKey="conversion" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-2 pt-2 border-t">
                    {conversionPorCanal.map((item, index) => (
                      <div key={item.canal} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="w-6 h-6 flex items-center justify-center p-0 text-xs">
                            {index + 1}
                          </Badge>
                          <span className="font-medium">{item.canal}</span>
                        </div>
                        <div className="flex items-center gap-4 text-muted-foreground">
                          <span>{item.contactos} contactos</span>
                          <span className="font-semibold text-foreground">{item.conversion}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No hay datos de conversión disponibles
                </div>
              )}
            </CardContent>
          </Card>

        </div>

        {/* Pacientes en Riesgo */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <CardTitle className="text-lg font-semibold">Pacientes en Riesgo</CardTitle>
              </div>
              <Badge variant="outline" className="text-amber-600 border-amber-600">
                {pacientesEnRiesgo.length} pacientes
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Pacientes que están a punto de entrar en fase "dormidos" (4-6 meses sin visita)
            </p>
          </CardHeader>
          <CardContent>
            {loadingRiesgo ? (
              <Skeleton className="h-48 w-full" />
            ) : pacientesEnRiesgo.length > 0 ? (
              <div className="space-y-4">
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {pacientesEnRiesgo.map((paciente) => (
                    <div 
                      key={paciente.id} 
                      className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground">{paciente.nombre}</p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          <span>{paciente.telefono}</span>
                          <span>•</span>
                          <span>{paciente.diagnostico}</span>
                          <span>•</span>
                          <span className="font-medium text-amber-600">
                            {paciente.mesesSinVisita} meses sin visita
                          </span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          setLocation("/campanas/nueva");
                        }}
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Añadir a campaña
                      </Button>
                    </div>
                  ))}
                </div>
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => setLocation("/pacientes")}
                >
                  Ver todos los pacientes en riesgo
                </Button>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <AlertTriangle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No hay pacientes en riesgo en este momento</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Forecast Line Chart */}
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
              <Skeleton className="h-72 w-full" />
            ) : (
              <div className="space-y-6">
                {/* Summary - above chart */}
                <div className="bg-muted/50 rounded-lg p-4 text-center">
                  <p className="text-sm text-muted-foreground">
                    En 6 meses podrías alcanzar hasta
                  </p>
                  <p className="text-3xl font-bold text-primary mt-1" data-testid="text-forecast-total">
                    {forecastData[6].forecast.toLocaleString('es-ES')}€
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    de beneficio mensual con nuestro sistema
                  </p>
                </div>

                {/* Line Chart */}
                <div className="h-72" data-testid="forecast-chart">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={forecastData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis 
                        dataKey="mes" 
                        tick={{ fontSize: 12 }}
                        className="text-muted-foreground"
                      />
                      <YAxis 
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => `${(value / 1000).toFixed(1)}k€`}
                        className="text-muted-foreground"
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend 
                        wrapperStyle={{ paddingTop: 20 }}
                        formatter={(value) => <span className="text-sm text-muted-foreground">{value}</span>}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="actual" 
                        name="Conseguido"
                        stroke="hsl(var(--chart-2))" 
                        strokeWidth={3}
                        dot={{ fill: "hsl(var(--chart-2))", strokeWidth: 2, r: 6 }}
                        connectNulls={false}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="forecast" 
                        name="Previsión"
                        stroke="hsl(var(--primary))" 
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
