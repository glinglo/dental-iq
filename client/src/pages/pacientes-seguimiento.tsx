import { useQuery } from "@tanstack/react-query";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { TrendingUp, DollarSign, AlertCircle, Brain } from "lucide-react";
import type { BudgetWithPatient, LaFraiseKPIs } from "@shared/schema";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

export default function PacientesSeguimiento() {
  const { data: kpis, isLoading } = useQuery<LaFraiseKPIs>({
    queryKey: ["/api/dashboard/lafraise-kpis"],
  });

  const { data: budgets = [] } = useQuery<BudgetWithPatient[]>({
    queryKey: ["/api/budgets"],
  });

  const rejectedBudgets = budgets.filter((b) => b.status === "rejected");
  const acceptedBudgets = budgets.filter((b) => b.status === "accepted");

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-semibold text-foreground">Analíticas</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Dashboard de KPIs y análisis de rechazos con IA
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Tasa Transformación</p>
                  <div className="text-2xl font-bold">
                    {kpis ? `${kpis.tasaAceptacion.toFixed(1)}%` : "-"}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Meta: {kpis ? `${kpis.tasaAceptacionGoal.toFixed(1)}%` : "-"}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-primary opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Facturación Generada</p>
                  <div className="text-2xl font-bold">
                    {kpis
                      ? `${kpis.facturacionGenerada.toLocaleString("es-ES", {
                          style: "currency",
                          currency: "EUR",
                          maximumFractionDigits: 0,
                        })}`
                      : "-"}
                  </div>
                </div>
                <DollarSign className="w-8 h-8 text-green-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Tratamientos Aceptados</p>
                  <div className="text-2xl font-bold">{kpis?.treatmentsAceptados || 0}</div>
                </div>
                <TrendingUp className="w-8 h-8 text-blue-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Horas Ahorradas</p>
                  <div className="text-2xl font-bold">{kpis?.horasAhorradas || 0}h</div>
                  <p className="text-xs text-muted-foreground mt-1">Estimado semanal</p>
                </div>
                <Brain className="w-8 h-8 text-purple-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tasa Transformación Mensual */}
          <Card>
            <CardHeader>
              <CardTitle>Tasa de Transformación Mensual</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  Cargando...
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={kpis?.tasaTransformacionMensual || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mes" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="tasa" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Rechazos por Motivo */}
          <Card>
            <CardHeader>
              <CardTitle>Rechazos por Motivo (IA-Clasificados)</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  Cargando...
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={kpis?.rechazosMotivos || []}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ motivo, cantidad }) => `${motivo}: ${cantidad}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="cantidad"
                    >
                      {(kpis?.rechazosMotivos || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Análisis de Rechazos */}
        <Card>
          <CardHeader>
            <CardTitle>Análisis de Rechazos con IA</CardTitle>
          </CardHeader>
          <CardContent>
            {rejectedBudgets.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No hay presupuestos rechazados para analizar
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Paciente</TableHead>
                      <TableHead>Monto</TableHead>
                      <TableHead>Tratamiento</TableHead>
                      <TableHead>Fecha Rechazo</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rejectedBudgets.slice(0, 10).map((budget) => (
                      <TableRow key={budget.id}>
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
                          {Array.isArray(budget.treatmentDetails?.procedures)
                            ? budget.treatmentDetails.procedures.join(", ")
                            : "N/A"}
                        </TableCell>
                        <TableCell>
                          {budget.updatedAt
                            ? new Date(budget.updatedAt).toLocaleDateString("es-ES")
                            : "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Brain className="w-4 h-4 mr-1" />
                                Analizar Motivo
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Análisis de Rechazo</DialogTitle>
                                <DialogDescription>
                                  Análisis IA del motivo probable de rechazo
                                </DialogDescription>
                              </DialogHeader>
                              <div className="py-4">
                                <p className="text-sm text-muted-foreground">
                                  El análisis de rechazo se generará cuando se implemente la función completa.
                                </p>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

