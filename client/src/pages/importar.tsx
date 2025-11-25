import { useState } from "react";
import { Upload, FileText, AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import type { Paciente } from "@shared/schema";

export default function Importar() {
  const queryClient = useQueryClient();
  const [archivoSubido, setArchivoSubido] = useState(false);
  
  const { data: pacientes = [], isLoading } = useQuery<Paciente[]>({
    queryKey: ["/api/pacientes"],
    enabled: archivoSubido,
  });

  const calcularPerdidosMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/pacientes/calcular-perdidos", {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pacientes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/kpis"] });
    },
  });

  const handleFileUpload = () => {
    setArchivoSubido(true);
  };

  const handleCalcularPerdidos = () => {
    calcularPerdidosMutation.mutate();
  };

  const pacientesPerdidos = pacientes.filter(p => p.estado === "perdido");
  const pacientesActivos = pacientes.filter(p => p.estado === "activo");

  const getEstadoBadge = (estado: Paciente["estado"]) => {
    const variants = {
      activo: { variant: "default" as const, icon: CheckCircle2, label: "Activo" },
      perdido: { variant: "destructive" as const, icon: XCircle, label: "Perdido" },
      "sin cita": { variant: "secondary" as const, icon: AlertCircle, label: "Sin Cita" },
    };
    const config = variants[estado];
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const pacientesCalculados = pacientes.some(p => p.estado === "perdido" || p.estado === "activo");

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-semibold text-foreground" data-testid="text-page-title">
            Importación de Pacientes
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Sube un archivo CSV para visualizar y analizar tus pacientes
          </p>
        </div>

        {/* Upload Zone */}
        <Card>
          <CardContent className="p-12">
            <div className="border-2 border-dashed border-border rounded-lg p-12 text-center hover-elevate transition-all">
              <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                {archivoSubido ? "Archivo cargado correctamente" : "Arrastra un archivo CSV o haz clic para seleccionar"}
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                {archivoSubido 
                  ? "pacientes_clinica_2024.csv (200 registros)" 
                  : "Formatos aceptados: CSV (máximo 10MB)"}
              </p>
              <Button 
                onClick={handleFileUpload}
                disabled={archivoSubido}
                data-testid="button-upload-file"
              >
                <FileText className="w-4 h-4 mr-2" />
                {archivoSubido ? "Archivo Cargado" : "Seleccionar Archivo"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        {archivoSubido && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total de Pacientes
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-9 w-20" />
                ) : (
                  <div className="text-3xl font-bold text-foreground" data-testid="text-total-pacientes">
                    {pacientes.length}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Pacientes Activos
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-9 w-20" />
                ) : (
                  <div className="text-3xl font-bold text-chart-2">
                    {pacientesActivos.length}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Pacientes Perdidos Detectados
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-9 w-20" />
                ) : (
                  <div className="text-3xl font-bold text-destructive" data-testid="text-pacientes-perdidos">
                    {pacientesCalculados ? pacientesPerdidos.length : "—"}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Calculate Button */}
        {archivoSubido && !calcularPerdidosMutation.isSuccess && (
          <Card className="bg-accent/30">
            <CardContent className="p-6 flex items-center justify-between gap-4 flex-wrap">
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  Calcular pacientes perdidos
                </h3>
                <p className="text-sm text-muted-foreground">
                  Detecta automáticamente pacientes con más de 6 meses sin visita y sin cita futura
                </p>
              </div>
              <Button 
                onClick={handleCalcularPerdidos} 
                size="lg" 
                disabled={calcularPerdidosMutation.isPending}
                data-testid="button-calcular-perdidos"
              >
                <AlertCircle className="w-4 h-4 mr-2" />
                {calcularPerdidosMutation.isPending ? "Calculando..." : "Calcular"}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Patients Table */}
        {archivoSubido && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                Listado de Pacientes
              </CardTitle>
              <CardDescription>
                {pacientes.length} pacientes cargados desde el archivo CSV
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b-2 border-border bg-muted/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Nombre
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Última Visita
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Diagnóstico
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Teléfono
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Email
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Estado
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      Array.from({ length: 10 }).map((_, index) => (
                        <tr key={index} className="border-b border-border">
                          <td className="px-4 py-3"><Skeleton className="h-4 w-32" /></td>
                          <td className="px-4 py-3"><Skeleton className="h-4 w-24" /></td>
                          <td className="px-4 py-3"><Skeleton className="h-4 w-28" /></td>
                          <td className="px-4 py-3"><Skeleton className="h-4 w-32" /></td>
                          <td className="px-4 py-3"><Skeleton className="h-4 w-36" /></td>
                          <td className="px-4 py-3"><Skeleton className="h-6 w-20" /></td>
                        </tr>
                      ))
                    ) : (
                      pacientes.slice(0, 50).map((paciente, index) => (
                        <tr 
                          key={paciente.id} 
                          className="border-b border-border hover-elevate transition-all"
                          data-testid={`row-paciente-${index}`}
                        >
                          <td className="px-4 py-3 text-sm font-medium text-foreground">
                            {paciente.nombre}
                          </td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">
                            {formatDistanceToNow(new Date(paciente.ultimaVisita), { 
                              addSuffix: true, 
                              locale: es 
                            })}
                          </td>
                          <td className="px-4 py-3 text-sm text-foreground">
                            {paciente.diagnostico}
                          </td>
                          <td className="px-4 py-3 text-sm text-muted-foreground font-mono">
                            {paciente.telefono}
                          </td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">
                            {paciente.email}
                          </td>
                          <td className="px-4 py-3">
                            {pacientesCalculados ? getEstadoBadge(paciente.estado) : (
                              <Badge variant="secondary">Sin calcular</Badge>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              {pacientes.length > 50 && (
                <div className="p-4 text-center text-sm text-muted-foreground border-t border-border">
                  Mostrando 50 de {pacientes.length} pacientes
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
