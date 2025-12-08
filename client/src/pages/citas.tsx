import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks, addDays, isSameDay, parseISO, isToday, isPast } from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Clock, User, MapPin, Calendar as CalendarIcon, Phone, X, CalendarClock, Sparkles, CheckCircle2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import type { Cita, Paciente } from "@shared/schema";

// Generar slots de 30 minutos internamente para posicionamiento preciso
const generarSlotsInternos = () => {
  const slots: Array<{ hora: number; minutos: number }> = [];
  for (let hora = 8; hora <= 20; hora++) {
    slots.push({ hora, minutos: 0 });
    slots.push({ hora, minutos: 30 });
  }
  return slots;
};

// Solo mostrar horas completas en el visor
const HORARIOS_VISOR = Array.from({ length: 13 }, (_, i) => i + 8); // 8:00 a 20:00
const SLOTS_INTERNOS = generarSlotsInternos();
const DIAS_SEMANA = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

function getEstadoColor(estado: string): string {
  // Unificar colores para todas las citas
  return "bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700 text-blue-800 dark:text-blue-300";
}

function getEstadoBadge(estado: string): { variant: "default" | "secondary" | "destructive" | "outline"; label: string } {
  switch (estado) {
    case "confirmada":
      return { variant: "default", label: "Confirmada" };
    case "programada":
      return { variant: "secondary", label: "Programada" };
    case "completada":
      return { variant: "outline", label: "Completada" };
    case "cancelada":
      return { variant: "destructive", label: "Cancelada" };
    case "no_asistio":
      return { variant: "destructive", label: "No asistió" };
    default:
      return { variant: "outline", label: estado };
  }
}

function getTipoLabel(tipo: string): string {
  const tipos: Record<string, string> = {
    revision: "Revisión",
    limpieza: "Limpieza",
    tratamiento: "Tratamiento",
    consulta: "Consulta",
    urgencia: "Urgencia",
  };
  return tipos[tipo] || tipo;
}

export default function Citas() {
  const { toast } = useToast();
  const [semanaActual, setSemanaActual] = useState(new Date());
  const [citaSeleccionada, setCitaSeleccionada] = useState<Cita | null>(null);
  const [showPostponerDialog, setShowPostponerDialog] = useState(false);
  const [showCancelarDialog, setShowCancelarDialog] = useState(false);
  const [nuevaFecha, setNuevaFecha] = useState("");
  const [nuevaHora, setNuevaHora] = useState("");
  const [showRellenarHuecosDialog, setShowRellenarHuecosDialog] = useState(false);
  const [fechaInicioHuecos, setFechaInicioHuecos] = useState<string>(format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd"));
  const [fechaFinHuecos, setFechaFinHuecos] = useState<string>(format(endOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd"));

  const inicioSemana = useMemo(() => {
    const inicio = startOfWeek(semanaActual, { weekStartsOn: 1 });
    inicio.setHours(0, 0, 0, 0);
    return inicio;
  }, [semanaActual]);

  const finSemana = useMemo(() => {
    const fin = endOfWeek(semanaActual, { weekStartsOn: 1 });
    fin.setHours(23, 59, 59, 999);
    return fin;
  }, [semanaActual]);

  const { data: citas = [], isLoading } = useQuery<Cita[]>({
    queryKey: ["/api/citas/semana", inicioSemana.toISOString(), finSemana.toISOString()],
    queryFn: async () => {
      const res = await fetch(`/api/citas/semana?inicio=${inicioSemana.toISOString()}&fin=${finSemana.toISOString()}`);
      if (!res.ok) throw new Error("Error al cargar citas");
      return res.json();
    },
  });

  // Agrupar citas por día y calcular su posición en slots de 30 minutos (internos)
  const citasConPosicion = useMemo(() => {
    return citas.map((cita) => {
      const fecha = new Date(cita.fechaHora);
      const dia = fecha.getDay() === 0 ? 6 : fecha.getDay() - 1;
      const hora = fecha.getHours();
      const minutos = fecha.getMinutes();
      
      // Encontrar el slot interno correcto (redondear hacia abajo al slot de 30 minutos más cercano)
      let slotInicio = 0;
      for (let i = 0; i < SLOTS_INTERNOS.length; i++) {
        const slot = SLOTS_INTERNOS[i];
        if (slot.hora > hora || (slot.hora === hora && slot.minutos > minutos)) {
          slotInicio = Math.max(0, i - 1);
          break;
        }
        if (slot.hora === hora && slot.minutos === minutos) {
          slotInicio = i;
          break;
        }
        slotInicio = i;
      }
      
      // Calcular cuántos slots ocupa la cita (duración en minutos / 30)
      const duracionSlots = Math.max(1, Math.ceil((cita.duracionMinutos || 30) / 30));
      
      return {
        cita,
        dia,
        slotInicio,
        duracionSlots,
      };
    });
  }, [citas]);

  const diasSemana = useMemo(() => {
    return DIAS_SEMANA.map((nombre, index) => {
      const fecha = addDays(inicioSemana, index);
      return {
        nombre,
        fecha,
        esHoy: isToday(fecha),
      };
    });
  }, [inicioSemana]);

  const irSemanaAnterior = () => setSemanaActual(subWeeks(semanaActual, 1));
  const irSemanaSiguiente = () => setSemanaActual(addWeeks(semanaActual, 1));
  const irHoy = () => setSemanaActual(new Date());

  const totalCitasSemana = citas.length;
  const citasConfirmadas = citas.filter(c => c.estado === "confirmada").length;
  const citasProgramadas = citas.filter(c => c.estado === "programada").length;

  // Mutations
  const cancelarCitaMutation = useMutation({
    mutationFn: async (citaId: string) => {
      const response = await apiRequest("PATCH", `/api/citas/${citaId}`, {
        estado: "cancelada",
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/citas"] });
      queryClient.invalidateQueries({ queryKey: ["/api/citas/semana"] });
      toast({
        title: "Cita cancelada",
        description: "La cita ha sido cancelada correctamente",
      });
      setCitaSeleccionada(null);
      setShowCancelarDialog(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo cancelar la cita",
        variant: "destructive",
      });
    },
  });

  const postponerCitaMutation = useMutation({
    mutationFn: async ({ citaId, fechaHora }: { citaId: string; fechaHora: Date }) => {
      const response = await apiRequest("PATCH", `/api/citas/${citaId}`, {
        fechaHora: fechaHora.toISOString(),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/citas"] });
      queryClient.invalidateQueries({ queryKey: ["/api/citas/semana"] });
      toast({
        title: "Cita pospuesta",
        description: "La cita ha sido pospuesta correctamente",
      });
      setCitaSeleccionada(null);
      setShowPostponerDialog(false);
      setNuevaFecha("");
      setNuevaHora("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo posponer la cita",
        variant: "destructive",
      });
    },
  });

  const handlePostponer = () => {
    if (!citaSeleccionada || !nuevaFecha || !nuevaHora) {
      toast({
        title: "Campos requeridos",
        description: "Por favor selecciona una nueva fecha y hora",
        variant: "destructive",
      });
      return;
    }

    const nuevaFechaHora = new Date(`${nuevaFecha}T${nuevaHora}`);
    postponerCitaMutation.mutate({
      citaId: citaSeleccionada.id,
      fechaHora: nuevaFechaHora,
    });
  };

  const handleCancelar = () => {
    if (!citaSeleccionada) return;
    cancelarCitaMutation.mutate(citaSeleccionada.id);
  };

  const handleAbrirPostponer = () => {
    if (!citaSeleccionada) return;
    const fechaActual = new Date(citaSeleccionada.fechaHora);
    setNuevaFecha(format(fechaActual, "yyyy-MM-dd"));
    setNuevaHora(format(fechaActual, "HH:mm"));
    setShowPostponerDialog(true);
  };

  // Query para obtener huecos libres usando las fechas seleccionadas
  const fechaInicioHuecosDate = useMemo(() => {
    if (!fechaInicioHuecos) {
      console.log("fechaInicioHuecos está vacía");
      return null;
    }
    
    if (!fechaInicioHuecos.match(/^\d{4}-\d{2}-\d{2}$/)) {
      console.error("Formato de fecha inicio inválido:", fechaInicioHuecos);
      return null;
    }
    
    try {
      // Crear fecha en formato local para evitar problemas de zona horaria
      const [year, month, day] = fechaInicioHuecos.split('-').map(Number);
      if (isNaN(year) || isNaN(month) || isNaN(day)) {
        console.error("Valores de fecha inicio inválidos:", { year, month, day });
        return null;
      }
      
      // Validar rango de valores
      if (month < 1 || month > 12 || day < 1 || day > 31) {
        console.error("Rango de fecha inicio inválido:", { month, day });
        return null;
      }
      
      const fecha = new Date(year, month - 1, day, 0, 0, 0, 0);
      
      // Validar que la fecha sea válida
      if (isNaN(fecha.getTime())) {
        console.error("Fecha inicio no válida después de crear:", fecha);
        return null;
      }
      
      // Validar que los componentes coincidan (para detectar fechas inválidas como 31 de febrero)
      if (fecha.getFullYear() !== year || fecha.getMonth() !== month - 1 || fecha.getDate() !== day) {
        console.error("Fecha inicio no coincide con componentes:", { fecha, year, month, day });
        return null;
      }
      
      return fecha;
    } catch (error) {
      console.error("Error al parsear fecha inicio:", error, fechaInicioHuecos);
      return null;
    }
  }, [fechaInicioHuecos]);

  const fechaFinHuecosDate = useMemo(() => {
    if (!fechaFinHuecos) {
      console.log("fechaFinHuecos está vacía");
      return null;
    }
    
    if (!fechaFinHuecos.match(/^\d{4}-\d{2}-\d{2}$/)) {
      console.error("Formato de fecha fin inválido:", fechaFinHuecos);
      return null;
    }
    
    try {
      // Crear fecha en formato local para evitar problemas de zona horaria
      const [year, month, day] = fechaFinHuecos.split('-').map(Number);
      if (isNaN(year) || isNaN(month) || isNaN(day)) {
        console.error("Valores de fecha fin inválidos:", { year, month, day });
        return null;
      }
      
      // Validar rango de valores
      if (month < 1 || month > 12 || day < 1 || day > 31) {
        console.error("Rango de fecha fin inválido:", { month, day });
        return null;
      }
      
      const fecha = new Date(year, month - 1, day, 23, 59, 59, 999);
      
      // Validar que la fecha sea válida
      if (isNaN(fecha.getTime())) {
        console.error("Fecha fin no válida después de crear:", fecha);
        return null;
      }
      
      // Validar que los componentes coincidan
      if (fecha.getFullYear() !== year || fecha.getMonth() !== month - 1 || fecha.getDate() !== day) {
        console.error("Fecha fin no coincide con componentes:", { fecha, year, month, day });
        return null;
      }
      
      return fecha;
    } catch (error) {
      console.error("Error al parsear fecha fin:", error, fechaFinHuecos);
      return null;
    }
  }, [fechaFinHuecos]);
  
  // Inicializar fechas cuando se abre el diálogo
  useEffect(() => {
    if (showRellenarHuecosDialog && (!fechaInicioHuecos || !fechaFinHuecos)) {
      const hoy = new Date();
      const inicioSemana = startOfWeek(hoy, { weekStartsOn: 1 });
      const finSemana = endOfWeek(hoy, { weekStartsOn: 1 });
      setFechaInicioHuecos(format(inicioSemana, "yyyy-MM-dd"));
      setFechaFinHuecos(format(finSemana, "yyyy-MM-dd"));
    }
  }, [showRellenarHuecosDialog]);

  // Debug: Log cuando cambian las fechas
  useEffect(() => {
    if (showRellenarHuecosDialog) {
      console.log("Fechas en diálogo:", {
        fechaInicioHuecos,
        fechaFinHuecos,
        fechaInicioHuecosDate,
        fechaFinHuecosDate,
        fechaInicioISO: fechaInicioHuecosDate?.toISOString(),
        fechaFinISO: fechaFinHuecosDate?.toISOString(),
      });
    }
  }, [showRellenarHuecosDialog, fechaInicioHuecos, fechaFinHuecos, fechaInicioHuecosDate, fechaFinHuecosDate]);

  const { data: huecosLibres = [], isLoading: loadingHuecos, error: errorHuecos } = useQuery<Array<{ fecha: string | Date; horaInicio: number; horaFin: number; duracion: number }>>({
    queryKey: ["/api/huecos-libres", fechaInicioHuecosDate?.toISOString(), fechaFinHuecosDate?.toISOString()],
    queryFn: async () => {
      if (!fechaInicioHuecosDate || !fechaFinHuecosDate) {
        console.error("Fechas inválidas:", { fechaInicioHuecosDate, fechaFinHuecosDate, fechaInicioHuecos, fechaFinHuecos });
        throw new Error("Fechas inválidas. Por favor selecciona fechas válidas.");
      }
      
      const inicioISO = fechaInicioHuecosDate.toISOString();
      const finISO = fechaFinHuecosDate.toISOString();
      
      console.log("Buscando huecos libres:", { inicioISO, finISO, fechaInicioHuecos, fechaFinHuecos });
      
      const url = `/api/huecos-libres?inicio=${encodeURIComponent(inicioISO)}&fin=${encodeURIComponent(finISO)}&duracionMinutos=30`;
      console.log("URL:", url);
      
      try {
        const res = await fetch(url, {
          credentials: "include",
        });
        
        if (!res.ok) {
          const errorText = await res.text();
          let errorData;
          try {
            errorData = JSON.parse(errorText);
          } catch {
            errorData = { error: errorText || res.statusText };
          }
          console.error("Error en respuesta:", { status: res.status, statusText: res.statusText, errorData, url });
          throw new Error(errorData.error || errorData.details || `Error al cargar huecos libres (${res.status} ${res.statusText})`);
        }
        
        const data = await res.json();
        console.log("Huecos libres recibidos:", data);
        return Array.isArray(data) ? data : [];
      } catch (error) {
        console.error("Error en fetch:", error);
        if (error instanceof Error) {
          throw error;
        }
        throw new Error(`Error desconocido al cargar huecos libres: ${String(error)}`);
      }
    },
    enabled: showRellenarHuecosDialog && !!fechaInicioHuecosDate && !!fechaFinHuecosDate,
    retry: 1,
  });

  // Query para obtener sugerencias de pacientes por hueco
  const { data: sugerenciasPorHueco = new Map(), isLoading: loadingSugerencias, error: errorSugerencias } = useQuery<Map<string, Array<{ paciente: Paciente; motivo: string; prioridad: number }>>>({
    queryKey: ["/api/citas/sugerir-pacientes", Array.isArray(huecosLibres) ? huecosLibres.map((h: { fecha: string | Date; horaInicio: number; horaFin: number; duracion: number }) => {
      const fechaStr = typeof h.fecha === 'string' ? h.fecha : new Date(h.fecha).toISOString().split('T')[0];
      return `${fechaStr}-${h.horaInicio}-${h.horaFin}`;
    }).join(",") : ""],
    queryFn: async () => {
      const sugerenciasMap = new Map<string, Array<{ paciente: Paciente; motivo: string; prioridad: number }>>();
      
      if (!Array.isArray(huecosLibres) || huecosLibres.length === 0) {
        console.log("No hay huecos libres para obtener sugerencias");
        return sugerenciasMap;
      }
      
      for (const hueco of huecosLibres.slice(0, 10)) { // Limitar a 10 huecos para no sobrecargar
        // Manejar diferentes formatos de fecha
        let fechaHueco: string;
        if (typeof hueco.fecha === 'string') {
          fechaHueco = hueco.fecha.includes("T") ? hueco.fecha.split("T")[0] : hueco.fecha;
        } else {
          fechaHueco = format(new Date(hueco.fecha), "yyyy-MM-dd");
        }
        
        try {
          const url = `/api/citas/sugerir-pacientes?fecha=${fechaHueco}&horaInicio=${hueco.horaInicio}&horaFin=${hueco.horaFin}&limite=2`;
          console.log("Obteniendo sugerencias para:", url);
          const res = await fetch(url);
          if (res.ok) {
            const sugerencias = await res.json();
            console.log(`Sugerencias para ${fechaHueco}:`, sugerencias);
            const huecoKey = `${fechaHueco}-${hueco.horaInicio}-${hueco.horaFin}`;
            sugerenciasMap.set(huecoKey, sugerencias);
          } else {
            const errorData = await res.json().catch(() => ({}));
            console.error(`Error obteniendo sugerencias para hueco ${fechaHueco}:`, errorData);
          }
        } catch (error) {
          console.error(`Error obteniendo sugerencias para hueco ${fechaHueco}:`, error);
        }
      }
      
      return sugerenciasMap;
    },
    enabled: showRellenarHuecosDialog && Array.isArray(huecosLibres) && huecosLibres.length > 0,
  });

  // Mutation para enviar WhatsApp a un paciente individual
  const enviarWhatsAppMutation = useMutation({
    mutationFn: async ({ huecoKey, pacienteId }: { huecoKey: string; pacienteId: string }) => {
      const [fecha, horaInicio, horaFin] = huecoKey.split("-");
      const response = await apiRequest("POST", "/api/citas/contactar-pacientes-hueco", {
        fecha,
        horaInicio: parseInt(horaInicio),
        horaFin: parseInt(horaFin),
        pacienteIds: [pacienteId],
        tipoCita: "revision",
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/acciones"] });
      toast({
        title: "WhatsApp enviado",
        description: "Se ha enviado un WhatsApp al paciente",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo enviar el WhatsApp",
        variant: "destructive",
      });
    },
  });

  const handleEnviarWhatsApp = (huecoKey: string, pacienteId: string) => {
    enviarWhatsAppMutation.mutate({ huecoKey, pacienteId });
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold" data-testid="text-titulo-agenda">Agenda</h1>
            <p className="text-muted-foreground mt-1">Agenda semanal de la clínica</p>
          </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="default" 
            size="sm" 
            onClick={() => {
              // Inicializar fechas antes de abrir el diálogo
              const hoy = new Date();
              const inicioSemana = startOfWeek(hoy, { weekStartsOn: 1 });
              const finSemana = endOfWeek(hoy, { weekStartsOn: 1 });
              setFechaInicioHuecos(format(inicioSemana, "yyyy-MM-dd"));
              setFechaFinHuecos(format(finSemana, "yyyy-MM-dd"));
              setShowRellenarHuecosDialog(true);
            }}
            className="bg-primary"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Rellenar huecos libres
          </Button>
          <Button variant="outline" size="sm" onClick={irHoy} data-testid="button-ir-hoy">
            Hoy
          </Button>
          <div className="flex items-center border rounded-md">
            <Button variant="ghost" size="icon" onClick={irSemanaAnterior} data-testid="button-semana-anterior">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="px-3 text-sm font-medium min-w-48 text-center" data-testid="text-rango-semana">
              {format(inicioSemana, "d MMM", { locale: es })} - {format(finSemana, "d MMM yyyy", { locale: es })}
            </span>
            <Button variant="ghost" size="icon" onClick={irSemanaSiguiente} data-testid="button-semana-siguiente">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-1 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Semana</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-citas">{totalCitasSemana}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-1 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Confirmadas</CardTitle>
            <Badge variant="default" className="text-xs">OK</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400" data-testid="text-citas-confirmadas">{citasConfirmadas}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-1 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pendientes</CardTitle>
            <Badge variant="secondary" className="text-xs">...</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400" data-testid="text-citas-pendientes">{citasProgramadas}</div>
          </CardContent>
        </Card>
        </div>

        <Card className="overflow-hidden">
        <ScrollArea className="h-[800px]">
          <div className="min-w-[900px]">
            <div className="grid grid-cols-[100px_repeat(6,1fr)] sticky top-0 bg-card z-10 border-b">
              <div className="p-3 text-xs font-semibold uppercase text-muted-foreground">Hora</div>
              {diasSemana.map((dia, index) => (
                <div 
                  key={index}
                  className={`p-3 text-center border-l ${dia.esHoy ? "bg-primary/5" : ""}`}
                >
                  <div className="text-xs font-semibold uppercase text-muted-foreground">{dia.nombre}</div>
                  <div className={`text-lg font-semibold mt-1 ${dia.esHoy ? "text-primary" : ""}`}>
                    {format(dia.fecha, "d")}
                  </div>
                </div>
              ))}
            </div>

            {isLoading ? (
              <div className="p-6 space-y-4">
                {[...Array(10)].map((_, i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            ) : (
              <div>
                {HORARIOS_VISOR.map((hora) => {
                  // Cada hora completa ocupa 2 slots internos (2 slots de 30 min = 80px)
                  const slotInicioHora = (hora - 8) * 2; // Índice del primer slot de esta hora
                  
                  return (
                    <div 
                      key={hora} 
                      className="grid grid-cols-[100px_repeat(6,1fr)] border-b min-h-[80px]"
                    >
                      <div className="p-3 text-sm text-muted-foreground font-medium border-r flex items-start justify-center pt-4">
                        {hora.toString().padStart(2, "0")}:00
                      </div>
                      {DIAS_SEMANA.map((_, diaIndex) => {
                        const esDiaHoy = diasSemana[diaIndex]?.esHoy;
                        
                        // Buscar citas que empiecen en cualquier slot de esta hora (2 slots por hora)
                        const citasEnEstaHora = citasConPosicion.filter(
                          (item) => {
                            if (item.dia !== diaIndex) return false;
                            // La cita debe empezar en alguno de los 2 slots de esta hora
                            return item.slotInicio >= slotInicioHora && item.slotInicio < slotInicioHora + 2;
                          }
                        );
                        
                        return (
                          <div 
                            key={diaIndex} 
                            className={`relative border-l overflow-hidden ${esDiaHoy ? "bg-primary/5" : ""}`}
                            style={{ minHeight: "80px" }}
                          >
                            {citasEnEstaHora.map((item) => {
                              const { cita, slotInicio, duracionSlots } = item;
                              const fechaCita = new Date(cita.fechaHora);
                              const esPasada = isPast(fechaCita);
                              const esFuturaSinConfirmar = !esPasada && cita.estado === "programada";
                              
                              // Calcular posición vertical dentro de la hora (cada slot de 30 min = 40px)
                              const offsetDesdeInicioHora = (slotInicio - slotInicioHora) * 40;
                              
                              // Calcular altura en píxeles (cada slot de 30 min = 40px)
                              const alturaPx = duracionSlots * 40;
                              
                              return (
                                <button
                                  key={cita.id}
                                  onClick={() => setCitaSeleccionada(cita)}
                                  disabled={esPasada}
                                  className={`absolute left-0 right-0 text-left p-2.5 rounded-md border text-xs transition-all z-10 ${esPasada ? "grayscale opacity-60 cursor-not-allowed bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400" : `hover-elevate cursor-pointer ${getEstadoColor(cita.estado)}`}`}
                                  style={{
                                    top: `${offsetDesdeInicioHora + 4}px`,
                                    height: `${alturaPx - 8}px`,
                                    minHeight: "48px",
                                    width: "100%",
                                    maxWidth: "100%",
                                  }}
                                  data-testid={`button-cita-${cita.id}`}
                                >
                                  <div className="font-medium truncate flex items-center justify-between gap-2 mb-1">
                                    <span className="text-xs leading-tight truncate">{cita.pacienteNombre}</span>
                                    {esFuturaSinConfirmar && (
                                      <Badge variant="outline" className="text-[10px] px-1.5 py-0.5 h-4 leading-none flex-shrink-0">Sin confirmar</Badge>
                                    )}
                                  </div>
                                  <div className="text-xs opacity-75 truncate leading-tight">
                                    {format(fechaCita, "HH:mm")} - {getTipoLabel(cita.tipo)}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </ScrollArea>
      </Card>

      <Dialog open={!!citaSeleccionada} onOpenChange={() => setCitaSeleccionada(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Detalle de Cita
            </DialogTitle>
          </DialogHeader>
          {citaSeleccionada && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold">{citaSeleccionada.pacienteNombre}</span>
                <Badge {...getEstadoBadge(citaSeleccionada.estado)}>
                  {getEstadoBadge(citaSeleccionada.estado).label}
                </Badge>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  <span>{format(new Date(citaSeleccionada.fechaHora), "EEEE d 'de' MMMM, yyyy", { locale: es })}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {format(new Date(citaSeleccionada.fechaHora), "HH:mm")} 
                    {" "}({citaSeleccionada.duracionMinutos} minutos)
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{citaSeleccionada.doctor || "Sin asignar"}</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{citaSeleccionada.sala || "Sin sala asignada"}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{citaSeleccionada.telefono}</span>
                </div>
              </div>

              <div className="pt-2 border-t">
                <div className="text-sm text-muted-foreground mb-1">Tipo de cita</div>
                <Badge variant="outline">{getTipoLabel(citaSeleccionada.tipo)}</Badge>
              </div>

              {citaSeleccionada.origen && (
                <div className="pt-2 border-t">
                  <div className="text-sm text-muted-foreground mb-1">Origen</div>
                  <span className="text-sm capitalize">{citaSeleccionada.origen}</span>
                </div>
              )}

              {citaSeleccionada.notas && (
                <div className="pt-2 border-t">
                  <div className="text-sm text-muted-foreground mb-1">Notas</div>
                  <p className="text-sm">{citaSeleccionada.notas}</p>
                </div>
              )}

              {/* Acciones */}
              {citaSeleccionada.estado !== "cancelada" && citaSeleccionada.estado !== "completada" && (
                <div className="pt-4 border-t flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handleAbrirPostponer}
                    className="flex-1"
                  >
                    <CalendarClock className="w-4 h-4 mr-2" />
                    Postponer
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => setShowCancelarDialog(true)}
                    className="flex-1"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancelar
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog para postponer cita */}
      <Dialog open={showPostponerDialog} onOpenChange={setShowPostponerDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Postponer Cita</DialogTitle>
            <DialogDescription>
              Selecciona una nueva fecha y hora para la cita de {citaSeleccionada?.pacienteNombre}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nueva-fecha">Nueva Fecha</Label>
                <Input
                  id="nueva-fecha"
                  type="date"
                  value={nuevaFecha}
                  onChange={(e) => setNuevaFecha(e.target.value)}
                  min={format(new Date(), "yyyy-MM-dd")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nueva-hora">Nueva Hora</Label>
                <Input
                  id="nueva-hora"
                  type="time"
                  value={nuevaHora}
                  onChange={(e) => setNuevaHora(e.target.value)}
                />
              </div>
            </div>
            {citaSeleccionada && nuevaFecha && nuevaHora && (
              <div className="text-sm text-muted-foreground">
                <p>Fecha actual: {format(new Date(citaSeleccionada.fechaHora), "dd/MM/yyyy HH:mm", { locale: es })}</p>
                <p>Nueva fecha: {format(new Date(`${nuevaFecha}T${nuevaHora}`), "dd/MM/yyyy HH:mm", { locale: es })}</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPostponerDialog(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handlePostponer}
              disabled={postponerCitaMutation.isPending || !nuevaFecha || !nuevaHora}
            >
              {postponerCitaMutation.isPending ? "Posponiendo..." : "Confirmar Postponer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para cancelar cita */}
      <Dialog open={showCancelarDialog} onOpenChange={setShowCancelarDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancelar Cita</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas cancelar la cita de {citaSeleccionada?.pacienteNombre}?
            </DialogDescription>
          </DialogHeader>
          {citaSeleccionada && (
            <div className="py-4">
              <div className="text-sm space-y-2">
                <p><strong>Paciente:</strong> {citaSeleccionada.pacienteNombre}</p>
                <p><strong>Fecha:</strong> {format(new Date(citaSeleccionada.fechaHora), "dd/MM/yyyy HH:mm", { locale: es })}</p>
                <p><strong>Tipo:</strong> {getTipoLabel(citaSeleccionada.tipo)}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelarDialog(false)}>
              No, mantener cita
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelar}
              disabled={cancelarCitaMutation.isPending}
            >
              {cancelarCitaMutation.isPending ? "Cancelando..." : "Sí, cancelar cita"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para rellenar huecos libres */}
      <Dialog 
        open={showRellenarHuecosDialog} 
        onOpenChange={(open) => {
          setShowRellenarHuecosDialog(open);
          if (open) {
            // Al abrir, inicializar con la semana actual
            const hoy = new Date();
            const inicioSemana = startOfWeek(hoy, { weekStartsOn: 1 });
            const finSemana = endOfWeek(hoy, { weekStartsOn: 1 });
            setFechaInicioHuecos(format(inicioSemana, "yyyy-MM-dd"));
            setFechaFinHuecos(format(finSemana, "yyyy-MM-dd"));
          }
        }}
      >
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Rellenar Huecos Libres
            </DialogTitle>
            <DialogDescription>
              Selecciona el rango de fechas y detecta huecos libres en la agenda para contactar pacientes
            </DialogDescription>
          </DialogHeader>
          
          {/* Selector de fechas */}
          <div className="space-y-4 py-4 border-b">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fecha-inicio-huecos">Fecha Inicio</Label>
                <Input
                  id="fecha-inicio-huecos"
                  type="date"
                  value={fechaInicioHuecos}
                  onChange={(e) => {
                    const nuevaFecha = e.target.value;
                    setFechaInicioHuecos(nuevaFecha);
                    // Si la fecha fin es anterior a la nueva fecha inicio, actualizarla
                    if (fechaFinHuecos && nuevaFecha > fechaFinHuecos) {
                      setFechaFinHuecos(nuevaFecha);
                    }
                  }}
                  min={format(new Date(), "yyyy-MM-dd")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fecha-fin-huecos">Fecha Fin</Label>
                <Input
                  id="fecha-fin-huecos"
                  type="date"
                  value={fechaFinHuecos}
                  onChange={(e) => {
                    const nuevaFecha = e.target.value;
                    // Validar que la fecha fin sea posterior o igual a la fecha inicio
                    if (!fechaInicioHuecos || nuevaFecha >= fechaInicioHuecos) {
                      setFechaFinHuecos(nuevaFecha);
                    } else {
                      toast({
                        title: "Fecha inválida",
                        description: "La fecha fin debe ser posterior o igual a la fecha inicio",
                        variant: "destructive",
                      });
                    }
                  }}
                  min={fechaInicioHuecos || format(new Date(), "yyyy-MM-dd")}
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const hoy = new Date();
                  const inicioSemana = startOfWeek(hoy, { weekStartsOn: 1 });
                  const finSemana = endOfWeek(hoy, { weekStartsOn: 1 });
                  setFechaInicioHuecos(format(inicioSemana, "yyyy-MM-dd"));
                  setFechaFinHuecos(format(finSemana, "yyyy-MM-dd"));
                }}
              >
                Esta semana
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const proximaSemana = addWeeks(new Date(), 1);
                  const inicioSemana = startOfWeek(proximaSemana, { weekStartsOn: 1 });
                  const finSemana = endOfWeek(proximaSemana, { weekStartsOn: 1 });
                  setFechaInicioHuecos(format(inicioSemana, "yyyy-MM-dd"));
                  setFechaFinHuecos(format(finSemana, "yyyy-MM-dd"));
                }}
              >
                Semana que viene
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const hoy = new Date();
                  const finMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
                  setFechaInicioHuecos(format(hoy, "yyyy-MM-dd"));
                  setFechaFinHuecos(format(finMes, "yyyy-MM-dd"));
                }}
              >
                Resto del mes
              </Button>
            </div>
          </div>
          
          <ScrollArea className="max-h-[60vh]">
            {loadingHuecos ? (
              <div className="space-y-4 py-4">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-32 w-full" />
                ))}
              </div>
            ) : !fechaInicioHuecosDate || !fechaFinHuecosDate ? (
              <div className="py-8 text-center text-muted-foreground">
                <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="font-medium">Fechas inválidas</p>
                <p className="text-sm mt-2">Por favor selecciona un rango de fechas válido</p>
              </div>
            ) : errorHuecos ? (
              <div className="py-8 text-center text-destructive">
                <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="font-medium">Error al cargar huecos libres</p>
                <p className="text-sm text-muted-foreground mt-2">
                  {errorHuecos instanceof Error ? errorHuecos.message : "Error desconocido"}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Fechas seleccionadas: {fechaInicioHuecos} - {fechaFinHuecos}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Verifica que las fechas sean correctas y que la fecha de inicio sea anterior a la fecha de fin
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => {
                    const hoy = new Date();
                    const inicioSemana = startOfWeek(hoy, { weekStartsOn: 1 });
                    const finSemana = endOfWeek(hoy, { weekStartsOn: 1 });
                    setFechaInicioHuecos(format(inicioSemana, "yyyy-MM-dd"));
                    setFechaFinHuecos(format(finSemana, "yyyy-MM-dd"));
                  }}
                >
                  Resetear a esta semana
                </Button>
              </div>
            ) : !Array.isArray(huecosLibres) || huecosLibres.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="font-medium">No se encontraron huecos libres</p>
                {fechaInicioHuecos && fechaFinHuecos && (
                  <p className="text-sm mt-2">
                    La agenda está completa para el período del {format(fechaInicioHuecosDate || new Date(fechaInicioHuecos), "d 'de' MMMM", { locale: es })} al {format(fechaFinHuecosDate || new Date(fechaFinHuecos), "d 'de' MMMM", { locale: es })}
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-6 py-4">
                {huecosLibres.slice(0, 10).map((hueco: { fecha: string | Date; horaInicio: number; horaFin: number; duracion: number }, index: number) => {
                  const fechaHueco = typeof hueco.fecha === 'string' ? new Date(hueco.fecha) : hueco.fecha;
                  const huecoKey = `${format(fechaHueco, "yyyy-MM-dd")}-${hueco.horaInicio}-${hueco.horaFin}`;
                  const sugerencias = sugerenciasPorHueco instanceof Map 
                    ? (sugerenciasPorHueco.get(huecoKey) || [])
                    : [];

                  return (
                    <Card key={index} className="p-4">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-lg">
                            {format(fechaHueco, "EEEE d 'de' MMMM", { locale: es })}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {hueco.horaInicio}:00 - {hueco.horaFin}:00 ({Math.floor(hueco.duracion / 60)} horas disponibles)
                          </p>
                        </div>
                        <Badge variant="outline">
                          {sugerencias.length} sugerencias
                        </Badge>
                      </div>

                      {loadingSugerencias ? (
                        <div className="space-y-2">
                          <Skeleton className="h-16 w-full" />
                          <Skeleton className="h-16 w-full" />
                        </div>
                      ) : sugerencias.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No hay pacientes sugeridos para este hueco</p>
                      ) : (
                        <div className="space-y-2">
                          {sugerencias.map((sugerencia: { paciente: Paciente; motivo: string; prioridad: number }) => {
                            const estaEnviando = enviarWhatsAppMutation.isPending && enviarWhatsAppMutation.variables?.pacienteId === sugerencia.paciente.id;
                            
                            return (
                              <div
                                key={sugerencia.paciente.id}
                                className="flex items-center gap-3 p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                              >
                                <div className="flex-1">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <p className="font-medium">{sugerencia.paciente.nombre}</p>
                                      <p className="text-xs text-muted-foreground">{sugerencia.motivo}</p>
                                    </div>
                                    <Badge variant={sugerencia.prioridad > 70 ? "default" : sugerencia.prioridad > 40 ? "secondary" : "outline"}>
                                      Prioridad {sugerencia.prioridad}%
                                    </Badge>
                                  </div>
                                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                      <Phone className="w-3 h-3" />
                                      {sugerencia.paciente.telefono}
                                    </span>
                                    {sugerencia.paciente.whatsapp && (
                                      <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                                        <MessageCircle className="w-3 h-3" />
                                        WhatsApp disponible
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <Button
                                  size="sm"
                                  onClick={() => handleEnviarWhatsApp(huecoKey, sugerencia.paciente.id)}
                                  disabled={estaEnviando || !sugerencia.paciente.whatsapp}
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                  {estaEnviando ? (
                                    <>
                                      <MessageCircle className="w-4 h-4 mr-2 animate-spin" />
                                      Enviando...
                                    </>
                                  ) : (
                                    <>
                                      <MessageCircle className="w-4 h-4 mr-2" />
                                      Enviar WhatsApp
                                    </>
                                  )}
                                </Button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            )}
          </ScrollArea>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRellenarHuecosDialog(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
}
