import { useState } from "react";
import { Users, Filter, Plus } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import type { Paciente, FiltrosSegmentacion } from "@shared/schema";

export default function Segmentacion() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [filtros, setFiltros] = useState<FiltrosSegmentacion>({
    prioridad: "Todas",
  });
  const [seleccionados, setSeleccionados] = useState<Set<string>>(new Set());

  const { data: pacientesPerdidos = [], isLoading } = useQuery<Paciente[]>({
    queryKey: ["/api/pacientes/perdidos", filtros],
    queryFn: async () => {
      return await apiRequest("POST", "/api/pacientes/perdidos", filtros);
    },
  });

  const anadirACampanaMutation = useMutation({
    mutationFn: async (pacienteIds: string[]) => {
      return await apiRequest("POST", "/api/pacientes/anadir-a-campana", { pacienteIds });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pacientes/perdidos"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/kpis"] });
      toast({
        title: "Pacientes añadidos a campaña",
        description: `${seleccionados.size} pacientes seleccionados para la próxima campaña`,
      });
      setSeleccionados(new Set());
    },
    onError: () => {
      toast({
        title: "Error al añadir pacientes",
        description: "No se pudieron añadir los pacientes a la campaña",
        variant: "destructive",
      });
    },
  });

  const diagnosticosUnicos = [...new Set(pacientesPerdidos.map(p => p.diagnostico))].sort();

  const handleToggleSeleccion = (id: string) => {
    const nuevaSeleccion = new Set(seleccionados);
    if (nuevaSeleccion.has(id)) {
      nuevaSeleccion.delete(id);
    } else {
      nuevaSeleccion.add(id);
    }
    setSeleccionados(nuevaSeleccion);
  };

  const handleSeleccionarTodos = () => {
    if (seleccionados.size === pacientesPerdidos.length) {
      setSeleccionados(new Set());
    } else {
      setSeleccionados(new Set(pacientesPerdidos.map(p => p.id)));
    }
  };

  const handleAnadirACampana = () => {
    if (seleccionados.size > 0) {
      anadirACampanaMutation.mutate(Array.from(seleccionados));
    }
  };

  const getPrioridadBadge = (prioridad: string | null) => {
    if (!prioridad) return null;
    const variants = {
      Alta: "destructive" as const,
      Media: "default" as const,
      Baja: "secondary" as const,
    };
    return (
      <Badge variant={variants[prioridad as keyof typeof variants]}>
        {prioridad}
      </Badge>
    );
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-semibold text-foreground" data-testid="text-page-title">
              Segmentación y Scoring
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {isLoading ? "Cargando..." : `${pacientesPerdidos.length} pacientes perdidos detectados`}
            </p>
          </div>
          {seleccionados.size > 0 && (
            <Button 
              onClick={handleAnadirACampana}
              disabled={anadirACampanaMutation.isPending}
              data-testid="button-anadir-campana"
            >
              <Plus className="w-4 h-4 mr-2" />
              {anadirACampanaMutation.isPending 
                ? "Añadiendo..." 
                : `Añadir ${seleccionados.size} a Campaña`
              }
            </Button>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filtros Sidebar */}
          <Card className="lg:w-64 flex-shrink-0">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filtros
              </CardTitle>
              <CardDescription>
                Refina tu búsqueda
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Filtro por Prioridad */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Prioridad</Label>
                <Select 
                  value={filtros.prioridad || "Todas"}
                  onValueChange={(value) => setFiltros({ ...filtros, prioridad: value as any })}
                >
                  <SelectTrigger data-testid="select-prioridad">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Todas">Todas</SelectItem>
                    <SelectItem value="Alta">Alta</SelectItem>
                    <SelectItem value="Media">Media</SelectItem>
                    <SelectItem value="Baja">Baja</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Filtro por Diagnóstico */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Diagnóstico</Label>
                <Select 
                  value={filtros.diagnostico || "todos"}
                  onValueChange={(value) => setFiltros({ 
                    ...filtros, 
                    diagnostico: value === "todos" ? undefined : value 
                  })}
                >
                  <SelectTrigger data-testid="select-diagnostico">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    {diagnosticosUnicos.map(d => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Filtro por Edad */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Rango de Edad</Label>
                <Select 
                  value={
                    !filtros.edadMin && !filtros.edadMax ? "todos" :
                    filtros.edadMin === 18 && filtros.edadMax === 35 ? "18-35" :
                    filtros.edadMin === 36 && filtros.edadMax === 55 ? "36-55" :
                    filtros.edadMin === 56 && filtros.edadMax === 80 ? "56-80" : "todos"
                  }
                  onValueChange={(value) => {
                    if (value === "todos") {
                      setFiltros({ ...filtros, edadMin: undefined, edadMax: undefined });
                    } else if (value === "18-35") {
                      setFiltros({ ...filtros, edadMin: 18, edadMax: 35 });
                    } else if (value === "36-55") {
                      setFiltros({ ...filtros, edadMin: 36, edadMax: 55 });
                    } else if (value === "56-80") {
                      setFiltros({ ...filtros, edadMin: 56, edadMax: 80 });
                    }
                  }}
                >
                  <SelectTrigger data-testid="select-edad">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todas las edades</SelectItem>
                    <SelectItem value="18-35">18-35 años</SelectItem>
                    <SelectItem value="36-55">36-55 años</SelectItem>
                    <SelectItem value="56-80">56-80 años</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Reset Filters */}
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setFiltros({ prioridad: "Todas" })}
                data-testid="button-reset-filtros"
              >
                Limpiar Filtros
              </Button>
            </CardContent>
          </Card>

          {/* Tabla de Pacientes */}
          <Card className="flex-1">
            <CardHeader>
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Pacientes Perdidos
                  </CardTitle>
                  <CardDescription>
                    {isLoading ? "Cargando..." : `${pacientesPerdidos.length} pacientes encontrados`}
                  </CardDescription>
                </div>
                {!isLoading && pacientesPerdidos.length > 0 && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleSeleccionarTodos}
                    data-testid="button-seleccionar-todos"
                  >
                    {seleccionados.size === pacientesPerdidos.length ? "Deseleccionar" : "Seleccionar"} Todos
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b-2 border-border bg-muted/50 sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left w-12"></th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Nombre
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Última Visita
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Edad
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Diagnóstico
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Prioridad
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      Array.from({ length: 10 }).map((_, index) => (
                        <tr key={index} className="border-b border-border">
                          <td className="px-4 py-3"><Skeleton className="h-4 w-4" /></td>
                          <td className="px-4 py-3"><Skeleton className="h-4 w-32" /></td>
                          <td className="px-4 py-3"><Skeleton className="h-4 w-24" /></td>
                          <td className="px-4 py-3"><Skeleton className="h-4 w-16" /></td>
                          <td className="px-4 py-3"><Skeleton className="h-4 w-28" /></td>
                          <td className="px-4 py-3"><Skeleton className="h-6 w-16" /></td>
                        </tr>
                      ))
                    ) : (
                      pacientesPerdidos.map((paciente, index) => (
                        <tr 
                          key={paciente.id}
                          className="border-b border-border hover-elevate transition-all"
                          data-testid={`row-paciente-${index}`}
                        >
                          <td className="px-4 py-3">
                            <Checkbox
                              checked={seleccionados.has(paciente.id)}
                              onCheckedChange={() => handleToggleSeleccion(paciente.id)}
                              data-testid={`checkbox-paciente-${index}`}
                            />
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-foreground">
                            {paciente.nombre}
                          </td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">
                            {formatDistanceToNow(new Date(paciente.ultimaVisita), { 
                              addSuffix: true, 
                              locale: es 
                            })}
                          </td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">
                            {paciente.edad} años
                          </td>
                          <td className="px-4 py-3 text-sm text-foreground">
                            {paciente.diagnostico}
                          </td>
                          <td className="px-4 py-3">
                            {getPrioridadBadge(paciente.prioridad)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
