import { Users, Calendar, DollarSign } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import type { DashboardKPIs } from "@shared/schema";

export default function Dashboard() {
  const { data: kpis, isLoading } = useQuery<DashboardKPIs>({
    queryKey: ["/api/dashboard/kpis"],
  });

  const beneficioEstimado = kpis ? kpis.citasGeneradas * 85 : 0;

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-5xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-semibold text-foreground" data-testid="text-page-title">
            Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Resumen de resultados de reactivación
          </p>
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
                    {kpis?.pacientesPerdidos || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    detectados en tu base de datos
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
                    {kpis?.citasGeneradas || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    gracias a las campañas activas
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
                    estimado de las citas generadas
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Última actualización */}
        <div className="text-center text-xs text-muted-foreground pt-8">
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
