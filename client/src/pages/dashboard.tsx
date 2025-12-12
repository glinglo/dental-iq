import { useState } from "react";
import { useLocation } from "wouter";
import { Calendar, DollarSign, CalendarDays, TrendingUp, CheckSquare, BarChart3, Clock, Brain } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import type { DashboardKPIs, DentalIQKPIs, BudgetWithPatient } from "@shared/schema";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

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

  const { data: budgets = [] } = useQuery<BudgetWithPatient[]>({
    queryKey: ["/api/budgets"],
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

        {/* Analíticas de Presupuestos */}
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold text-foreground mb-2">Analíticas de Presupuestos</h2>
            <p className="text-sm text-muted-foreground">
              Análisis detallado de conversión y rendimiento de presupuestos
            </p>
          </div>

          {/* Conversión por Canal y Touchpoints - Dos columnas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Conversión por Canal */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  <CardTitle className="text-lg font-semibold">Conversión por Canal</CardTitle>
                </div>
                <p className="text-sm text-muted-foreground">
                  Tasa de aceptación de presupuestos según el canal utilizado
                </p>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-64 w-full" />
                ) : (
                  <>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={[
                          { canal: "WhatsApp", conversion: 32.5, presupuestos: 15, aceptados: 5 },
                          { canal: "SMS", conversion: 24.8, presupuestos: 20, aceptados: 5 },
                          { canal: "Email", conversion: 18.2, presupuestos: 22, aceptados: 4 },
                          { canal: "Llamada", conversion: 45.0, presupuestos: 8, aceptados: 4 },
                        ]}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                          <XAxis dataKey="canal" tick={{ fontSize: 12 }} className="text-muted-foreground" />
                          <YAxis tick={{ fontSize: 12 }} className="text-muted-foreground" />
                          <Tooltip formatter={(value: number) => `${value}%`} />
                          <Bar dataKey="conversion" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-4 space-y-2">
                      {[
                        { canal: "WhatsApp", conversion: 32.5, presupuestos: 15, aceptados: 5 },
                        { canal: "SMS", conversion: 24.8, presupuestos: 20, aceptados: 5 },
                        { canal: "Email", conversion: 18.2, presupuestos: 22, aceptados: 4 },
                        { canal: "Llamada", conversion: 45.0, presupuestos: 8, aceptados: 4 },
                      ].map((item) => (
                        <div key={item.canal} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{item.canal}</Badge>
                            <span className="text-muted-foreground">{item.presupuestos} presupuestos</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-muted-foreground">{item.aceptados} aceptados</span>
                            <span className="font-semibold text-foreground">{item.conversion}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Conversión por Número de Touchpoints */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-chart-3" />
                  <CardTitle className="text-lg font-semibold">Conversión por Touchpoints</CardTitle>
                </div>
                <p className="text-sm text-muted-foreground">
                  Tasa de aceptación según el número de contactos realizados
                </p>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-64 w-full" />
                ) : (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[
                        { touchpoints: 1, conversion: 15.2, cantidad: 20 },
                        { touchpoints: 2, conversion: 28.5, cantidad: 18 },
                        { touchpoints: 3, conversion: 35.8, cantidad: 12 },
                        { touchpoints: 4, conversion: 42.3, cantidad: 8 },
                        { touchpoints: "5+", conversion: 48.7, cantidad: 5 },
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis dataKey="touchpoints" tick={{ fontSize: 12 }} className="text-muted-foreground" />
                        <YAxis tick={{ fontSize: 12 }} className="text-muted-foreground" />
                        <Tooltip formatter={(value: number) => `${value}%`} />
                        <Bar dataKey="conversion" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Conversión por Días Pendientes y Tasa Transformación Mensual - Dos columnas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Conversión por Días Pendientes */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-chart-2" />
                  <CardTitle className="text-lg font-semibold">Conversión por Días Pendientes</CardTitle>
                </div>
                <p className="text-sm text-muted-foreground">
                  Tasa de aceptación según el tiempo que lleva pendiente el presupuesto
                </p>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-64 w-full" />
                ) : (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[
                        { dias: "0-7", conversion: 35.2, cantidad: 12 },
                        { dias: "8-14", conversion: 28.5, cantidad: 15 },
                        { dias: "15-21", conversion: 22.1, cantidad: 10 },
                        { dias: "22-30", conversion: 18.5, cantidad: 8 },
                        { dias: "30+", conversion: 12.3, cantidad: 5 },
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis dataKey="dias" tick={{ fontSize: 12 }} className="text-muted-foreground" />
                        <YAxis tick={{ fontSize: 12 }} className="text-muted-foreground" />
                        <Tooltip formatter={(value: number) => `${value}%`} />
                        <Bar dataKey="conversion" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tasa Transformación Mensual */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <CardTitle className="text-lg font-semibold">Tasa de Transformación Mensual</CardTitle>
                </div>
                <p className="text-sm text-muted-foreground">
                  Evolución de la tasa de aceptación mes a mes
                </p>
              </CardHeader>
              <CardContent>
                {loadingDentalIQ ? (
                  <Skeleton className="h-64 w-full" />
                ) : (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={dentaliqKPIs?.tasaTransformacionMensual || []}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis dataKey="mes" tick={{ fontSize: 12 }} className="text-muted-foreground" />
                        <YAxis tick={{ fontSize: 12 }} className="text-muted-foreground" />
                        <Tooltip />
                        <Bar dataKey="tasa" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Rechazos por Motivo */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-primary" />
                <CardTitle className="text-lg font-semibold">Rechazos por Motivo</CardTitle>
              </div>
              <p className="text-sm text-muted-foreground">
                Análisis de presupuestos rechazados clasificados por IA
              </p>
            </CardHeader>
            <CardContent>
              {loadingDentalIQ ? (
                <Skeleton className="h-64 w-full" />
              ) : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={dentaliqKPIs?.rechazosMotivos || []}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ motivo, cantidad }) => `${motivo}: ${cantidad}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="cantidad"
                      >
                        {(dentaliqKPIs?.rechazosMotivos || []).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

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
