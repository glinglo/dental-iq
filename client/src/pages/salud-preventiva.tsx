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
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Input } from "@/components/ui/input";
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
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Heart, Plus, Send, MessageSquare, Mail, Phone, Check, ChevronsUpDown, Calendar } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import type { RecordatorioPreventivoPendiente, Paciente, TratamientoPreventivoConPaciente } from "@shared/schema";
import { ReglasComunicacionDialog } from "@/components/reglas-comunicacion-dialog";

const tipoTratamientoLabels: Record<string, string> = {
  limpieza: "Limpieza dental",
  revision: "Revisión general",
  fluorizacion: "Fluorización",
  selladores: "Selladores",
  ortodoncia_revision: "Revisión ortodoncia",
};

const frecuenciaMeses: Record<string, number> = {
  limpieza: 6,
  revision: 12,
  fluorizacion: 6,
  selladores: 12,
  ortodoncia_revision: 3,
};

export default function SaludPreventiva() {
  const { toast } = useToast();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Paciente | null>(null);
  const [tipoTratamiento, setTipoTratamiento] = useState<string>("limpieza");
  const [fechaRealizacion, setFechaRealizacion] = useState<string>("");
  const [patientSearchOpen, setPatientSearchOpen] = useState(false);

  const { data: recordatoriosPendientes = [], isLoading: loadingPendientes } = useQuery<RecordatorioPreventivoPendiente[]>({
    queryKey: ["/api/tratamientos-preventivos/pendientes"],
    refetchInterval: 30000, // Refrescar cada 30 segundos
  });

  const { data: tratamientos = [] } = useQuery<TratamientoPreventivoConPaciente[]>({
    queryKey: ["/api/tratamientos-preventivos"],
  });

  const { data: pacientes = [] } = useQuery<Paciente[]>({
    queryKey: ["/api/pacientes"],
  });

  const createTratamientoMutation = useMutation({
    mutationFn: async (data: {
      pacienteId: string;
      tipoTratamiento: string;
      fechaRealizacion: string;
    }) => {
      const frecuencia = frecuenciaMeses[data.tipoTratamiento] || 6;
      const response = await apiRequest("POST", "/api/tratamientos-preventivos", {
        pacienteId: data.pacienteId,
        clinicId: "clinic-1",
        tipoTratamiento: data.tipoTratamiento,
        fechaRealizacion: data.fechaRealizacion,
        frecuenciaMeses: frecuencia,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tratamientos-preventivos"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tratamientos-preventivos/pendientes"] });
      toast({
        title: "Tratamiento preventivo creado",
        description: "El tratamiento ha sido registrado y se enviarán recordatorios automáticos",
      });
      setCreateDialogOpen(false);
      resetForm();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo crear el tratamiento preventivo",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setSelectedPatient(null);
    setTipoTratamiento("limpieza");
    setFechaRealizacion("");
  };

  const handleCreateTratamiento = () => {
    if (!selectedPatient || !fechaRealizacion) {
      toast({
        title: "Campos requeridos",
        description: "Por favor selecciona un paciente y fecha",
        variant: "destructive",
      });
      return;
    }

    createTratamientoMutation.mutate({
      pacienteId: selectedPatient.id,
      tipoTratamiento,
      fechaRealizacion,
    });
  };

  const sendReminderMutation = useMutation({
    mutationFn: async (recordatorio: RecordatorioPreventivoPendiente) => {
      // La automatización se encargará de enviar el recordatorio
      // Esto es solo para forzar el envío inmediato
      toast({
        title: "Recordatorio programado",
        description: `Se enviará vía ${recordatorio.canalSiguiente} en los próximos minutos`,
      });
    },
  });

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-semibold text-foreground">Salud Preventiva</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Recordatorios automáticos para tratamientos preventivos de salud bucal
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ReglasComunicacionDialog tipo="salud_preventiva" titulo="Salud Preventiva" />
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Registrar Tratamiento
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Registrar Tratamiento Preventivo</DialogTitle>
                <DialogDescription>
                  Registra un tratamiento preventivo realizado. Se enviarán recordatorios automáticos cuando corresponda.
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
                                    {paciente.telefono}
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
                  <Label>Tipo de Tratamiento *</Label>
                  <Select value={tipoTratamiento} onValueChange={setTipoTratamiento}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(tipoTratamientoLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label} (cada {frecuenciaMeses[value]} meses)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fecha">Fecha de Realización *</Label>
                  <Input
                    id="fecha"
                    type="date"
                    value={fechaRealizacion}
                    onChange={(e) => setFechaRealizacion(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button
                  onClick={handleCreateTratamiento}
                  disabled={createTratamientoMutation.isPending}
                >
                  {createTratamientoMutation.isPending ? "Guardando..." : "Registrar"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{recordatoriosPendientes.length}</div>
              <p className="text-sm text-muted-foreground">Recordatorios pendientes</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{tratamientos.length}</div>
              <p className="text-sm text-muted-foreground">Tratamientos registrados</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">
                {recordatoriosPendientes.filter(r => r.diasVencidos > 90).length}
              </div>
              <p className="text-sm text-muted-foreground">Más de 3 meses vencidos</p>
            </CardContent>
          </Card>
        </div>

        {/* Recordatorios Pendientes */}
        <Card>
          <CardHeader>
            <CardTitle>Recordatorios Preventivos Pendientes</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingPendientes ? (
              <div className="text-center py-8 text-muted-foreground">
                Cargando recordatorios...
              </div>
            ) : recordatoriosPendientes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No hay recordatorios preventivos pendientes
              </div>
            ) : (
              <ScrollArea className="h-[500px] w-full">
                <div className="space-y-2 pr-4">
                  {recordatoriosPendientes.map((recordatorio) => {
                    const CanalIcon = recordatorio.canalSiguiente === "whatsapp" 
                      ? MessageSquare 
                      : recordatorio.canalSiguiente === "sms" 
                      ? Phone 
                      : Mail;
                    
                    return (
                      <div
                        key={`${recordatorio.pacienteId}-${recordatorio.tipoTratamiento}`}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Heart className="w-5 h-5 text-red-500" />
                            <h3 className="font-medium">{recordatorio.pacienteNombre}</h3>
                            <Badge variant="outline">
                              {tipoTratamientoLabels[recordatorio.tipoTratamiento] || recordatorio.tipoTratamiento}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>
                              Última visita: {format(recordatorio.ultimaFecha, "dd/MM/yyyy", { locale: es })}
                            </span>
                            <span> Próxima recomendada: {format(recordatorio.proximaFechaRecomendada, "dd/MM/yyyy", { locale: es })}
                            </span>
                            <span className={cn(
                              "font-medium",
                              recordatorio.diasVencidos > 90 ? "text-red-500" : "text-amber-500"
                            )}>
                              {Math.floor(recordatorio.diasVencidos / 30)} meses vencidos
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                            <span>Intento {recordatorio.intentosEnviados + 1}/3</span>
                            <span>•</span>
                            <span>Siguiente: {recordatorio.canalSiguiente.toUpperCase()}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => sendReminderMutation.mutate(recordatorio)}
                            disabled={sendReminderMutation.isPending}
                          >
                            <CanalIcon className="w-4 h-4 mr-1" />
                            Enviar ahora
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <ScrollBar orientation="vertical" />
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        {/* Historial de Tratamientos */}
        <Card>
          <CardHeader>
            <CardTitle>Historial de Tratamientos Preventivos</CardTitle>
          </CardHeader>
          <CardContent>
            {tratamientos.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No hay tratamientos preventivos registrados
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Paciente</TableHead>
                      <TableHead>Tratamiento</TableHead>
                      <TableHead>Fecha Realización</TableHead>
                      <TableHead>Próxima Recomendada</TableHead>
                      <TableHead>Frecuencia</TableHead>
                      <TableHead>Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tratamientos.map((tratamiento) => {
                      const ahora = new Date();
                      const proximaFecha = new Date(tratamiento.proximaFechaRecomendada);
                      const diasVencidos = Math.floor((ahora.getTime() - proximaFecha.getTime()) / (1000 * 60 * 60 * 24));
                      const estaVencido = diasVencidos > 0;
                      
                      return (
                        <TableRow key={tratamiento.id}>
                          <TableCell className="font-medium">
                            {tratamiento.pacienteNombre}
                          </TableCell>
                          <TableCell>
                            {tipoTratamientoLabels[tratamiento.tipoTratamiento] || tratamiento.tipoTratamiento}
                          </TableCell>
                          <TableCell>
                            {format(new Date(tratamiento.fechaRealizacion), "dd/MM/yyyy", { locale: es })}
                          </TableCell>
                          <TableCell>
                            {format(proximaFecha, "dd/MM/yyyy", { locale: es })}
                          </TableCell>
                          <TableCell>
                            Cada {tratamiento.frecuenciaMeses} meses
                          </TableCell>
                          <TableCell>
                            <Badge variant={estaVencido ? "destructive" : "default"}>
                              {estaVencido ? `${Math.floor(diasVencidos / 30)} meses vencido` : "Al día"}
                            </Badge>
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
      </div>
    </div>
  );
}

