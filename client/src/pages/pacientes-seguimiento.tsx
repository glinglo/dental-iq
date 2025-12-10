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
import { TrendingUp, DollarSign, AlertCircle, Brain, Clock } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { BudgetWithPatient, DentalIQKPIs } from "@shared/schema";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

export default function PacientesSeguimiento() {
  const { data: kpis, isLoading } = useQuery<DentalIQKPIs>({
    queryKey: ["/api/dashboard/dentaliq-kpis"],
  });

  const { data: budgets = [] } = useQuery<BudgetWithPatient[]>({
    queryKey: ["/api/budgets"],
  });

  const rejectedBudgets = budgets.filter((b) => b.status === "rejected");
  const acceptedBudgets = budgets.filter((b) => b.status === "accepted");

  // Datos demo realistas para análisis
  const analiticasDemo = {
    conversionPorCanal: [
      { canal: "WhatsApp", conversion: 32.5, presupuestos: 15, aceptados: 5 },
      { canal: "SMS", conversion: 24.8, presupuestos: 20, aceptados: 5 },
      { canal: "Email", conversion: 18.2, presupuestos: 22, aceptados: 4 },
      { canal: "Llamada", conversion: 45.0, presupuestos: 8, aceptados: 4 },
    ],
    conversionPorDias: [
      { dias: "0-7", conversion: 35.2, cantidad: 12 },
      { dias: "8-14", conversion: 28.5, cantidad: 15 },
      { dias: "15-21", conversion: 22.1, cantidad: 10 },
      { dias: "22-30", conversion: 18.5, cantidad: 8 },
      { dias: "30+", conversion: 12.3, cantidad: 5 },
    ],
    conversionPorTouchpoints: [
      { touchpoints: 1, conversion: 15.2, cantidad: 20 },
      { touchpoints: 2, conversion: 28.5, cantidad: 18 },
      { touchpoints: 3, conversion: 35.8, cantidad: 12 },
      { touchpoints: 4, conversion: 42.3, cantidad: 8 },
      { touchpoints: "5+", conversion: 48.7, cantidad: 5 },
    ],
  };

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
                    {kpis ? `${kpis.tasaAceptacion.toFixed(1)}%` : "26.0%"}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Meta: {kpis ? `${kpis.tasaAceptacionGoal.toFixed(1)}%` : "46.0%"}
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
                      : "8.000€"}
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
                  <div className="text-2xl font-bold">{kpis?.treatmentsAceptados || 10}</div>
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
                  <div className="text-2xl font-bold">{kpis?.horasAhorradas || 8}h</div>
                  <p className="text-xs text-muted-foreground mt-1">Estimado semanal</p>
                </div>
                <Clock className="w-8 h-8 text-purple-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>
        {/* Conversión por Canal y Touchpoints - Dos columnas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Conversión por Canal */}
          <Card>
            <CardHeader>
              <CardTitle>Conversión por Canal</CardTitle>
              <p className="text-sm text-muted-foreground">
                Tasa de aceptación de presupuestos según el canal utilizado
              </p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analiticasDemo.conversionPorCanal}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="canal" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => `${value}%`} />
                  <Bar dataKey="conversion" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {analiticasDemo.conversionPorCanal.map((item) => (
                  <div key={item.canal} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{item.canal}</Badge>
                      <span>{item.presupuestos} presupuestos</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-muted-foreground">{item.aceptados} aceptados</span>
                      <span className="font-semibold">{item.conversion}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Conversión por Número de Touchpoints */}
          <Card>
            <CardHeader>
              <CardTitle>Conversión por Número de Touchpoints</CardTitle>
              <p className="text-sm text-muted-foreground">
                Tasa de aceptación según el número de contactos realizados
              </p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analiticasDemo.conversionPorTouchpoints}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="touchpoints" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => `${value}%`} />
                  <Bar dataKey="conversion" fill="hsl(var(--chart-3))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Conversión por Días Pendientes y Tasa Transformación Mensual - Dos columnas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Conversión por Días Pendientes */}
          <Card>
            <CardHeader>
              <CardTitle>Conversión por Días Pendientes</CardTitle>
              <p className="text-sm text-muted-foreground">
                Tasa de aceptación según el tiempo que lleva pendiente el presupuesto
              </p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analiticasDemo.conversionPorDias}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="dias" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => `${value}%`} />
                  <Bar dataKey="conversion" fill="hsl(var(--chart-2))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

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
        </div>

        {/* Rechazos por Motivo y Análisis - En una sola caja */}
        <Card>
          <CardHeader>
            <CardTitle>Rechazos por Motivo y Análisis (IA-Clasificados)</CardTitle>
            <p className="text-sm text-muted-foreground">
              Análisis detallado de presupuestos rechazados con clasificación por IA
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Gráfica de Rechazos por Motivo */}
              <div>
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
              </div>

              {/* Análisis de Rechazos */}
              <div>
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
                        {rejectedBudgets.slice(0, 5).map((budget) => (
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
                                ? format(new Date(budget.updatedAt), "dd/MM/yyyy", { locale: es })
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
                                    <div className="space-y-4">
                                      <div>
                                        <p className="text-sm font-medium mb-2">Motivo Principal:</p>
                                        <Badge variant="outline" className="text-base">
                                          {kpis?.rechazosMotivos?.[0]?.motivo || "Precio"}
                                        </Badge>
                                      </div>
                                      <div>
                                        <p className="text-sm font-medium mb-2">Análisis:</p>
                                        <p className="text-sm text-muted-foreground">
                                          El paciente ha rechazado el presupuesto principalmente por motivos relacionados con el precio. 
                                          Se recomienda considerar opciones de financiación o ajustar el presupuesto.
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-sm font-medium mb-2">Recomendaciones:</p>
                                        <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                                          <li>Ofrecer opciones de pago fraccionado</li>
                                          <li>Enviar información sobre beneficios del tratamiento</li>
                                          <li>Programar llamada de seguimiento en 3-5 días</li>
                                        </ul>
                                      </div>
                                    </div>
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
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
