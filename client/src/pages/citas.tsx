import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks, addDays, isSameDay, parseISO, isToday } from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Clock, User, MapPin, Calendar as CalendarIcon, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Cita } from "@shared/schema";

const HORARIOS = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];
const DIAS_SEMANA = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

function getEstadoColor(estado: string): string {
  switch (estado) {
    case "confirmada":
      return "bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700 text-green-800 dark:text-green-300";
    case "programada":
      return "bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700 text-blue-800 dark:text-blue-300";
    case "completada":
      return "bg-gray-100 dark:bg-gray-800/50 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400";
    case "cancelada":
      return "bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700 text-red-700 dark:text-red-400";
    case "no_asistio":
      return "bg-amber-100 dark:bg-amber-900/30 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400";
    default:
      return "bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300";
  }
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
  const [semanaActual, setSemanaActual] = useState(new Date());
  const [citaSeleccionada, setCitaSeleccionada] = useState<Cita | null>(null);

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

  const citasPorDiaYHora = useMemo(() => {
    const map = new Map<string, Cita[]>();
    citas.forEach((cita) => {
      const fecha = new Date(cita.fechaHora);
      const dia = fecha.getDay() === 0 ? 6 : fecha.getDay() - 1;
      const hora = fecha.getHours();
      const key = `${dia}-${hora}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(cita);
    });
    return map;
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

  return (
    <div className="h-full flex flex-col p-6 overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-semibold" data-testid="text-titulo-citas">Citas</h1>
          <p className="text-muted-foreground mt-1">Agenda semanal de la clínica</p>
        </div>
        
        <div className="flex items-center gap-2">
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

      <Card className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="min-w-[800px]">
            <div className="grid grid-cols-[80px_repeat(6,1fr)] sticky top-0 bg-card z-10 border-b">
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
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : (
              <div>
                {HORARIOS.map((hora) => (
                  <div key={hora} className="grid grid-cols-[80px_repeat(6,1fr)] border-b min-h-16">
                    <div className="p-2 text-sm text-muted-foreground font-medium border-r flex items-start justify-center pt-3">
                      {hora}:00
                    </div>
                    {DIAS_SEMANA.map((_, diaIndex) => {
                      const citasEnSlot = citasPorDiaYHora.get(`${diaIndex}-${hora}`) || [];
                      const esDiaHoy = diasSemana[diaIndex]?.esHoy;
                      return (
                        <div 
                          key={diaIndex} 
                          className={`p-1 border-l min-h-16 ${esDiaHoy ? "bg-primary/5" : ""}`}
                        >
                          {citasEnSlot.map((cita) => (
                            <button
                              key={cita.id}
                              onClick={() => setCitaSeleccionada(cita)}
                              className={`w-full text-left p-2 rounded-md border mb-1 text-xs hover-elevate transition-all cursor-pointer ${getEstadoColor(cita.estado)}`}
                              data-testid={`button-cita-${cita.id}`}
                            >
                              <div className="font-medium truncate">{cita.pacienteNombre}</div>
                              <div className="text-xs opacity-75 truncate">
                                {format(new Date(cita.fechaHora), "HH:mm")} - {getTipoLabel(cita.tipo)}
                              </div>
                            </button>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                ))}
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
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
