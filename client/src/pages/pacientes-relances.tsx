import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Send,
  MessageSquare,
  Phone,
  Mail,
  Settings,
  ArrowRight,
  Search,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { BudgetWithPatient, SecuenciaComunicacion, ReglaComunicacion, PasoComunicacion } from "@shared/schema";
import { ReglasComunicacionDialog } from "@/components/reglas-comunicacion-dialog";

export default function PacientesRelances() {
  const [, setLocation] = useLocation();
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [filtroEstado, setFiltroEstado] = useState<string>("all");
  const [busqueda, setBusqueda] = useState<string>("");

  // Obtener todos los presupuestos
  const { data: todosPresupuestos = [] } = useQuery<BudgetWithPatient[]>({
    queryKey: ["/api/budgets"],
  });

  // Obtener secuencias para el listado completo
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
  });

  const secuenciasPorBudget = new Map(
    secuencias.map(s => [s.secuencia.budgetId, s])
  );

  // Filtrar presupuestos
  const presupuestosFiltrados = useMemo(() => {
    let filtrados = todosPresupuestos;

    // Filtrar por estado
    if (filtroEstado !== "all") {
      filtrados = filtrados.filter(b => {
        if (filtroEstado === "pending") return b.status === "pending";
        if (filtroEstado === "accepted") return b.status === "accepted";
        if (filtroEstado === "rejected") return b.status === "rejected";
        return true;
      });
    }

    // Filtrar por búsqueda
    if (busqueda.trim()) {
      const busquedaLower = busqueda.toLowerCase();
      filtrados = filtrados.filter(b => 
        b.patientName?.toLowerCase().includes(busquedaLower) ||
        b.id.toLowerCase().includes(busquedaLower) ||
        Number(b.amount).toString().includes(busquedaLower)
      );
    }

    return filtrados;
  }, [todosPresupuestos, filtroEstado, busqueda]);

  const getCanalIcon = (canal: string) => {
    switch (canal) {
      case "whatsapp":
        return MessageSquare;
      case "sms":
        return Phone;
      case "email":
        return Mail;
      case "llamada":
        return Phone;
      default:
        return Send;
    }
  };

  const getCanalLabel = (canal: string) => {
    switch (canal) {
      case "whatsapp":
        return "WhatsApp";
      case "sms":
        return "SMS";
      case "email":
        return "Email";
      case "llamada":
        return "Llamada";
      default:
        return canal;
    }
  };

  const getCanalColor = (canal: string) => {
    switch (canal) {
      case "whatsapp":
        return "bg-green-500/10 text-green-600 border-green-500/20";
      case "sms":
        return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      case "email":
        return "bg-purple-500/10 text-purple-600 border-purple-500/20";
      case "llamada":
        return "bg-orange-500/10 text-orange-600 border-orange-500/20";
      default:
        return "bg-gray-500/10 text-gray-600 border-gray-500/20";
    }
  };

  const getSiguienteAccion = (budget: BudgetWithPatient) => {
    // Si el presupuesto está ganado o perdido, mostrar "Fuera de campaña"
    if (budget.status === "accepted" || budget.status === "rejected") {
      return { fecha: null, canal: null, label: "Fuera de campaña" };
    }
    
    const secuenciaData = secuenciasPorBudget.get(budget.id);
    if (!secuenciaData) {
      return { fecha: null, canal: null, label: "Sin campaña activa" };
    }
    
    const pasos = secuenciaData.regla?.secuencia as PasoComunicacion[] || [];
    const pasoActual = secuenciaData.secuencia.pasoActual || 0;
    const proximaAccion = secuenciaData.secuencia.proximaAccion;
    
    if (pasoActual >= pasos.length) {
      return { fecha: null, canal: null, label: "Campaña completada" };
    }
    
    const siguientePaso = pasos[pasoActual];
    if (!siguientePaso) {
      return { fecha: null, canal: null, label: "Sin siguiente paso" };
    }
    
    return {
      fecha: proximaAccion ? new Date(proximaAccion) : null,
      canal: siguientePaso.canal,
      label: getCanalLabel(siguientePaso.canal),
    };
  };

  const getEstadoBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary">En Proceso</Badge>;
      case "accepted":
        return <Badge variant="default" className="bg-green-500">Ganado</Badge>;
      case "rejected":
        return <Badge variant="destructive">Perdido</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-foreground">Seguimiento</h1>
            <p className="text-sm text-muted-foreground mt-1">
              El listado de presupuestos presentados y su estado
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setConfigDialogOpen(true)}
          >
            <Settings className="w-4 h-4 mr-2" />
            Configurar Reglas
          </Button>
        </div>

        {/* Tabla con filtros integrados */}
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              <div className="flex-1 w-full md:w-auto">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Buscar por paciente, presupuesto o monto..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-full md:w-[200px]">
                <Select value={filtroEstado} onValueChange={setFiltroEstado}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filtrar por estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="pending">En Proceso</SelectItem>
                    <SelectItem value="accepted">Ganados</SelectItem>
                    <SelectItem value="rejected">Perdidos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {presupuestosFiltrados.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No hay presupuestos que coincidan con los filtros
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Paciente</TableHead>
                      <TableHead>Presupuesto</TableHead>
                      <TableHead>Monto</TableHead>
                      <TableHead>Siguiente Acción</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {presupuestosFiltrados.map((budget) => {
                      const siguienteAccion = getSiguienteAccion(budget);
                      const CanalIcon = siguienteAccion.canal ? getCanalIcon(siguienteAccion.canal) : null;
                      
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
                            <span className="text-sm text-muted-foreground font-mono">
                              {budget.id}
                            </span>
                          </TableCell>
                          <TableCell>
                            {Number(budget.amount).toLocaleString("es-ES", {
                              style: "currency",
                              currency: "EUR",
                            })}
                          </TableCell>
                          <TableCell>
                            {siguienteAccion.fecha ? (
                              <div className="flex items-center gap-2">
                                {CanalIcon && (
                                  <div className={`p-1.5 rounded border ${getCanalColor(siguienteAccion.canal!)}`}>
                                    <CanalIcon className="w-4 h-4" />
                                  </div>
                                )}
                                <div className="flex flex-col">
                                  <span className="text-sm font-medium">
                                    {siguienteAccion.label}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {format(siguienteAccion.fecha, "dd/MM/yyyy HH:mm", { locale: es })}
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <span className="text-sm text-muted-foreground">
                                {siguienteAccion.label}
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            {getEstadoBadge(budget.status)}
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

        {/* Dialog de configuración */}
        <ReglasComunicacionDialog
          open={configDialogOpen}
          onOpenChange={setConfigDialogOpen}
          tipo="relance_presupuesto"
          titulo="Reglas de Seguimiento de Presupuestos"
        />
      </div>
    </div>
  );
}
