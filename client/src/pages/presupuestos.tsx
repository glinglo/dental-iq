import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Search, Filter, Eye, Edit, Send, Upload, Check, ChevronsUpDown } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import type { BudgetWithPatient, Paciente } from "@shared/schema";

type BudgetStatus = "pending" | "accepted" | "rejected";
type BudgetPriority = "high" | "medium" | "low";

interface BudgetFilters {
  status?: BudgetStatus | "all";
  priority?: BudgetPriority | "all";
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

export default function Presupuestos() {
  const { toast } = useToast();
  const [filters, setFilters] = useState<BudgetFilters>({
    status: "all",
    priority: "all",
  });
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Paciente | null>(null);
  const [amount, setAmount] = useState("");
  const [treatmentDetails, setTreatmentDetails] = useState("");
  const [patientSearchOpen, setPatientSearchOpen] = useState(false);

  const { data: budgets = [], isLoading } = useQuery<BudgetWithPatient[]>({
    queryKey: ["/api/budgets"],
  });

  const { data: pacientes = [] } = useQuery<Paciente[]>({
    queryKey: ["/api/pacientes"],
  });

  const createBudgetMutation = useMutation({
    mutationFn: async (data: {
      patientId: string;
      amount: string;
      treatmentDetails: string;
    }) => {
      const response = await apiRequest("POST", "/api/budgets", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/budgets"] });
      toast({
        title: "Presupuesto creado",
        description: "El presupuesto ha sido creado y procesado con IA",
      });
      setCreateDialogOpen(false);
      resetForm();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo crear el presupuesto",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setSelectedPatient(null);
    setAmount("");
    setTreatmentDetails("");
  };

  const handleCreateBudget = () => {
    if (!selectedPatient || !amount || !treatmentDetails) {
      toast({
        title: "Campos requeridos",
        description: "Por favor completa todos los campos",
        variant: "destructive",
      });
      return;
    }

    createBudgetMutation.mutate({
      patientId: selectedPatient.id,
      amount,
      treatmentDetails,
    });
  };

  const filteredBudgets = budgets.filter((budget) => {
    if (filters.status && filters.status !== "all" && budget.status !== filters.status) {
      return false;
    }
    if (filters.priority && filters.priority !== "all" && budget.priority !== filters.priority) {
      return false;
    }
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      if (
        !budget.patientName.toLowerCase().includes(searchLower) &&
        !budget.treatmentDetails?.procedures?.some((p: string) =>
          p.toLowerCase().includes(searchLower)
        )
      ) {
        return false;
      }
    }
    return true;
  });

  const getPriorityColor = (priority?: string | null) => {
    switch (priority) {
      case "high":
        return "destructive";
      case "medium":
        return "default";
      case "low":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "accepted":
        return "default";
      case "rejected":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "accepted":
        return "Aceptado";
      case "rejected":
        return "Rechazado";
      default:
        return "Pendiente";
    }
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-semibold text-foreground">Presupuestos</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Gestión de presupuestos con IA para priorización y seguimiento
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Nuevo Presupuesto
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Crear Presupuesto</DialogTitle>
                  <DialogDescription>
                    Crea un nuevo presupuesto. La IA calculará automáticamente la urgencia y probabilidad de aceptación.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Paciente *</Label>
                    <Popover open={patientSearchOpen} onOpenChange={setPatientSearchOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          className="w-full justify-between font-normal"
                        >
                          {selectedPatient
                            ? selectedPatient.nombre
                            : "Buscar paciente..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0" align="start">
                        <Command>
                          <CommandInput placeholder="Buscar paciente..." />
                          <CommandList>
                            <CommandEmpty>No se encontraron pacientes</CommandEmpty>
                            <CommandGroup className="max-h-64 overflow-y-auto">
                              {pacientes.map((paciente) => (
                                <CommandItem
                                  key={paciente.id}
                                  value={paciente.nombre}
                                  onSelect={() => {
                                    setSelectedPatient(paciente);
                                    setPatientSearchOpen(false);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      selectedPatient?.id === paciente.id
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                  <div className="flex flex-col">
                                    <span>{paciente.nombre}</span>
                                    <span className="text-xs text-muted-foreground">
                                      {paciente.telefono} • {paciente.email}
                                    </span>
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="amount">Monto (€) *</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="treatment">Detalles del Tratamiento *</Label>
                    <Textarea
                      id="treatment"
                      placeholder="Ej: Limpieza dental, empaste, ortodoncia..."
                      value={treatmentDetails}
                      onChange={(e) => setTreatmentDetails(e.target.value)}
                      rows={4}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleCreateBudget}
                    disabled={createBudgetMutation.isPending}
                  >
                    {createBudgetMutation.isPending ? "Creando..." : "Crear Presupuesto"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button variant="outline">
              <Upload className="w-4 h-4 mr-2" />
              Importar desde PMS
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Búsqueda</Label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por paciente o tratamiento..."
                    value={filters.search || ""}
                    onChange={(e) =>
                      setFilters({ ...filters, search: e.target.value })
                    }
                    className="pl-8"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Estado</Label>
                <Select
                  value={filters.status || "all"}
                  onValueChange={(value) =>
                    setFilters({ ...filters, status: value as BudgetStatus | "all" })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="pending">Pendiente</SelectItem>
                    <SelectItem value="accepted">Aceptado</SelectItem>
                    <SelectItem value="rejected">Rechazado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Prioridad</Label>
                <Select
                  value={filters.priority || "all"}
                  onValueChange={(value) =>
                    setFilters({ ...filters, priority: value as BudgetPriority | "all" })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="medium">Media</SelectItem>
                    <SelectItem value="low">Baja</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Rango de fechas</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="date"
                    value={filters.dateFrom || ""}
                    onChange={(e) =>
                      setFilters({ ...filters, dateFrom: e.target.value })
                    }
                  />
                  <Input
                    type="date"
                    value={filters.dateTo || ""}
                    onChange={(e) =>
                      setFilters({ ...filters, dateTo: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Budgets Table */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Presupuestos ({filteredBudgets.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Cargando presupuestos...
              </div>
            ) : filteredBudgets.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No hay presupuestos disponibles
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Paciente</TableHead>
                      <TableHead>Monto</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Prioridad</TableHead>
                      <TableHead>Prob. Aceptación</TableHead>
                      <TableHead>Urgencia</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBudgets.map((budget) => (
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
                          <Badge variant={getStatusColor(budget.status) as any}>
                            {getStatusLabel(budget.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getPriorityColor(budget.priority) as any}>
                            {budget.priority === "high"
                              ? "Alta"
                              : budget.priority === "medium"
                              ? "Media"
                              : "Baja"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-muted rounded-full h-2">
                              <div
                                className="bg-primary h-2 rounded-full"
                                style={{
                                  width: `${budget.acceptanceProb || 0}%`,
                                }}
                              />
                            </div>
                            <span className="text-sm">
                              {budget.acceptanceProb || 0}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-muted rounded-full h-2">
                              <div
                                className="bg-destructive h-2 rounded-full"
                                style={{
                                  width: `${budget.urgencyScore || 0}%`,
                                }}
                              />
                            </div>
                            <span className="text-sm">
                              {budget.urgencyScore || 0}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {budget.createdAt
                            ? format(new Date(budget.createdAt), "dd/MM/yyyy", {
                                locale: es,
                              })
                            : "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="icon">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Send className="w-4 h-4" />
                            </Button>
                          </div>
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

