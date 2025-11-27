import { useState } from "react";
import { Users, Filter, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import type { Paciente, FiltrosSegmentacion, Campana } from "@shared/schema";

const ITEMS_POR_PAGINA = 15;

export default function Segmentacion() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [filtros, setFiltros] = useState<FiltrosSegmentacion>({
    prioridad: "Todas",
  });
  const [seleccionados, setSeleccionados] = useState<Set<string>>(new Set());
  const [paginaActual, setPaginaActual] = useState(1);
  const [dialogCampanaAbierto, setDialogCampanaAbierto] = useState(false);
  const [campanaSeleccionada, setCampanaSeleccionada] = useState<string>("");

  const { data: pacientesPerdidos = [], isLoading } = useQuery<Paciente[]>({
    queryKey: ["/api/pacientes/perdidos", filtros],
    queryFn: async () => {
      const response = await apiRequest("POST", "/api/pacientes/perdidos", filtros);
      return response.json();
    },
  });

  const { data: campanas = [] } = useQuery<Campana[]>({
    queryKey: ["/api/campanas"],
  });

  const campanasActivas = campanas.filter(c => c.estado === "activa");

  const anadirACampanaMutation = useMutation({
    mutationFn: async ({ pacienteIds, campanaId }: { pacienteIds: string[], campanaId: string }) => {
      return await apiRequest("POST", "/api/pacientes/anadir-a-campana", { pacienteIds, campanaId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pacientes/perdidos"] });
      queryClient.invalidateQueries({ queryKey: ["/api/campanas"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/kpis"] });
      const campana = campanas.find(c => c.id === campanaSeleccionada);
      toast({
        title: "Pacientes añadidos",
        description: `${seleccionados.size} pacientes añadidos a "${campana?.nombre || 'la campaña'}"`,
      });
      setSeleccionados(new Set());
      setDialogCampanaAbierto(false);
      setCampanaSeleccionada("");
    },
    onError: () => {
      toast({
        title: "Error al añadir pacientes",
        description: "No se pudieron añadir los pacientes a la campaña",
        variant: "destructive",
      });
    },
  });

  const diagnosticosUnicos = Array.isArray(pacientesPerdidos) 
    ? [...new Set(pacientesPerdidos.map(p => p.diagnostico))].sort() 
    : [];

  const totalPaginas = Math.ceil(pacientesPerdidos.length / ITEMS_POR_PAGINA);
  const pacientesPaginados = pacientesPerdidos.slice(
    (paginaActual - 1) * ITEMS_POR_PAGINA,
    paginaActual * ITEMS_POR_PAGINA
  );

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

  const handleSeleccionarPagina = () => {
    const idsPagina = pacientesPaginados.map(p => p.id);
    const todosSeleccionados = idsPagina.every(id => seleccionados.has(id));
    
    const nuevaSeleccion = new Set(seleccionados);
    if (todosSeleccionados) {
      idsPagina.forEach(id => nuevaSeleccion.delete(id));
    } else {
      idsPagina.forEach(id => nuevaSeleccion.add(id));
    }
    setSeleccionados(nuevaSeleccion);
  };

  const handleAbrirDialogCampana = () => {
    if (seleccionados.size > 0) {
      setDialogCampanaAbierto(true);
    }
  };

  const handleConfirmarAnadirACampana = () => {
    if (seleccionados.size > 0 && campanaSeleccionada) {
      anadirACampanaMutation.mutate({
        pacienteIds: Array.from(seleccionados),
        campanaId: campanaSeleccionada,
      });
    }
  };

  const handleCambiarPagina = (nuevaPagina: number) => {
    setPaginaActual(nuevaPagina);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  const paginaSeleccionadaCompleta = pacientesPaginados.every(p => seleccionados.has(p.id));

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
              onClick={handleAbrirDialogCampana}
              data-testid="button-anadir-campana"
            >
              <Plus className="w-4 h-4 mr-2" />
              Añadir {seleccionados.size} a Campaña
            </Button>
          )}
        </div>

        {/* Dialog Seleccionar Campaña */}
        <Dialog open={dialogCampanaAbierto} onOpenChange={setDialogCampanaAbierto}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Añadir a Campaña</DialogTitle>
              <DialogDescription>
                Selecciona la campaña donde quieres añadir {seleccionados.size} pacientes
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {campanasActivas.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <p>No hay campañas activas</p>
                  <p className="text-sm mt-1">Crea una campaña primero desde la sección Campañas</p>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label>Campaña destino</Label>
                    <Select
                      value={campanaSeleccionada}
                      onValueChange={setCampanaSeleccionada}
                    >
                      <SelectTrigger data-testid="select-campana-destino">
                        <SelectValue placeholder="Selecciona una campaña" />
                      </SelectTrigger>
                      <SelectContent>
                        {campanasActivas.map(campana => (
                          <SelectItem key={campana.id} value={campana.id}>
                            <div className="flex flex-col">
                              <span>{campana.nombre}</span>
                              <span className="text-xs text-muted-foreground">
                                {campana.pacientesIncluidos} pacientes · {campana.canales.join(", ")}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {campanaSeleccionada && (
                    <div className="bg-muted/50 rounded-lg p-4">
                      <p className="text-sm font-medium">Resumen:</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Se añadirán <span className="font-medium text-foreground">{seleccionados.size} pacientes</span> a la campaña seleccionada
                      </p>
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setDialogCampanaAbierto(false)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      className="flex-1"
                      disabled={!campanaSeleccionada || anadirACampanaMutation.isPending}
                      onClick={handleConfirmarAnadirACampana}
                      data-testid="button-confirmar-anadir"
                    >
                      {anadirACampanaMutation.isPending ? "Añadiendo..." : "Confirmar"}
                    </Button>
                  </div>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filtros Sidebar */}
          <Card className="lg:w-64 flex-shrink-0 h-fit lg:sticky lg:top-6">
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
                  onValueChange={(value) => {
                    setFiltros({ ...filtros, prioridad: value as any });
                    setPaginaActual(1);
                  }}
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
                  onValueChange={(value) => {
                    setFiltros({ 
                      ...filtros, 
                      diagnostico: value === "todos" ? undefined : value 
                    });
                    setPaginaActual(1);
                  }}
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
                    setPaginaActual(1);
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
                onClick={() => {
                  setFiltros({ prioridad: "Todas" });
                  setPaginaActual(1);
                }}
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
                    {isLoading ? "Cargando..." : (
                      <>
                        Mostrando {((paginaActual - 1) * ITEMS_POR_PAGINA) + 1}-{Math.min(paginaActual * ITEMS_POR_PAGINA, pacientesPerdidos.length)} de {pacientesPerdidos.length}
                        {seleccionados.size > 0 && (
                          <span className="ml-2 text-primary">· {seleccionados.size} seleccionados</span>
                        )}
                      </>
                    )}
                  </CardDescription>
                </div>
                {!isLoading && pacientesPerdidos.length > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleSeleccionarPagina}
                      data-testid="button-seleccionar-pagina"
                    >
                      {paginaSeleccionadaCompleta ? "Deseleccionar" : "Seleccionar"} Página
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleSeleccionarTodos}
                      data-testid="button-seleccionar-todos"
                    >
                      {seleccionados.size === pacientesPerdidos.length ? "Deseleccionar" : "Seleccionar"} Todos
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b-2 border-border bg-muted/50 sticky top-0 z-10">
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
                      Array.from({ length: ITEMS_POR_PAGINA }).map((_, index) => (
                        <tr key={index} className="border-b border-border">
                          <td className="px-4 py-3"><Skeleton className="h-4 w-4" /></td>
                          <td className="px-4 py-3"><Skeleton className="h-4 w-32" /></td>
                          <td className="px-4 py-3"><Skeleton className="h-4 w-24" /></td>
                          <td className="px-4 py-3"><Skeleton className="h-4 w-16" /></td>
                          <td className="px-4 py-3"><Skeleton className="h-4 w-28" /></td>
                          <td className="px-4 py-3"><Skeleton className="h-6 w-16" /></td>
                        </tr>
                      ))
                    ) : pacientesPaginados.length > 0 ? (
                      pacientesPaginados.map((paciente, index) => (
                        <tr 
                          key={paciente.id}
                          className={`border-b border-border hover-elevate transition-all cursor-pointer ${
                            seleccionados.has(paciente.id) ? 'bg-primary/5' : ''
                          }`}
                          onClick={() => handleToggleSeleccion(paciente.id)}
                          data-testid={`row-paciente-${index}`}
                        >
                          <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
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
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                          No se encontraron pacientes con los filtros seleccionados
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Paginación */}
              {!isLoading && totalPaginas > 1 && (
                <div className="flex items-center justify-between px-4 py-4 border-t border-border">
                  <div className="text-sm text-muted-foreground">
                    Página {paginaActual} de {totalPaginas}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCambiarPagina(paginaActual - 1)}
                      disabled={paginaActual === 1}
                      data-testid="button-pagina-anterior"
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Anterior
                    </Button>
                    
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPaginas) }).map((_, i) => {
                        let pageNum: number;
                        if (totalPaginas <= 5) {
                          pageNum = i + 1;
                        } else if (paginaActual <= 3) {
                          pageNum = i + 1;
                        } else if (paginaActual >= totalPaginas - 2) {
                          pageNum = totalPaginas - 4 + i;
                        } else {
                          pageNum = paginaActual - 2 + i;
                        }
                        
                        return (
                          <Button
                            key={pageNum}
                            variant={paginaActual === pageNum ? "default" : "outline"}
                            size="sm"
                            className="w-9"
                            onClick={() => handleCambiarPagina(pageNum)}
                            data-testid={`button-pagina-${pageNum}`}
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCambiarPagina(paginaActual + 1)}
                      disabled={paginaActual === totalPaginas}
                      data-testid="button-pagina-siguiente"
                    >
                      Siguiente
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
