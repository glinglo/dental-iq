import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { Search, User, Phone, Mail, Clock, Calendar, MessageSquare, Mail as MailIcon, Phone as PhoneIcon, Settings } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { Paciente, Cita } from "@shared/schema";
import { determinarEtapaJourney, generarTouchpointsPendientes, ETAPAS_JOURNEY, type EtapaJourney } from "@shared/customer-journey";
import { CustomerJourneyCanvas } from "@/components/customer-journey-canvas";

interface PacienteConJourney extends Paciente {
  etapas: ReturnType<typeof determinarEtapaJourney>;
  touchpointsPendientes: ReturnType<typeof generarTouchpointsPendientes>;
  proximoTouchpoint?: {
    fecha: Date;
    nombre: string;
    canal: string;
    prioridad: "alta" | "media" | "baja";
    etapa: string;
  };
}

const canalIcons: Record<string, typeof MessageSquare> = {
  whatsapp: MessageSquare,
  sms: PhoneIcon,
  email: MailIcon,
  llamada: PhoneIcon,
};

const canalLabels: Record<string, string> = {
  whatsapp: "WhatsApp",
  sms: "SMS",
  email: "Email",
  llamada: "Llamada",
};

const canalColors: Record<string, string> = {
  whatsapp: "bg-green-500/10 text-green-600 border-green-500/20",
  sms: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  email: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  llamada: "bg-orange-500/10 text-orange-600 border-orange-500/20",
};

export default function SaludPreventivaAcompanamiento() {
  const [busqueda, setBusqueda] = useState("");
  const [filtroEtapa, setFiltroEtapa] = useState<string>("all");
  const [filtroPrioridad, setFiltroPrioridad] = useState<string>("all");
  const [showCanvas, setShowCanvas] = useState(false);
  const [etapasJourney, setEtapasJourney] = useState<EtapaJourney[]>(ETAPAS_JOURNEY);

  // Obtener todos los pacientes
  const { data: pacientes = [] } = useQuery<Paciente[]>({
    queryKey: ["/api/pacientes"],
  });

  // Obtener citas para calcular número de visitas
  const { data: citas = [] } = useQuery<Cita[]>({
    queryKey: ["/api/citas"],
  });

  // Combinar pacientes con información del journey
  const pacientesConJourney: PacienteConJourney[] = useMemo(() => {
    return pacientes.map(paciente => {
      // Calcular número de visitas completadas
      const visitasCompletadas = citas.filter(
        c => c.pacienteId === paciente.id && c.estado === "completada"
      ).length;

      // Determinar etapas del journey usando las etapas actualizadas
      const etapas = determinarEtapaJourney({
        edad: paciente.edad,
        ultimaVisita: new Date(paciente.ultimaVisita),
        numeroVisitas: visitasCompletadas,
        tieneCitaFutura: paciente.tieneCitaFutura,
        diagnostico: paciente.diagnostico,
      }, etapasJourney);

      // Generar touchpoints pendientes usando las etapas actualizadas
      const touchpointsPendientes = generarTouchpointsPendientes({
        edad: paciente.edad,
        ultimaVisita: new Date(paciente.ultimaVisita),
        numeroVisitas: visitasCompletadas,
        tieneCitaFutura: paciente.tieneCitaFutura,
        diagnostico: paciente.diagnostico,
      }, undefined, etapasJourney);

      // Obtener el próximo touchpoint
      const proximoTouchpoint = touchpointsPendientes.length > 0
        ? {
            fecha: touchpointsPendientes[0].fechaProgramada,
            nombre: touchpointsPendientes[0].touchpoint.nombre,
            canal: touchpointsPendientes[0].touchpoint.canal,
            prioridad: touchpointsPendientes[0].prioridad,
            etapa: touchpointsPendientes[0].etapa.nombre,
          }
        : undefined;

      return {
        ...paciente,
        etapas,
        touchpointsPendientes,
        proximoTouchpoint,
      };
    });
  }, [pacientes, citas]);

  // Filtrar pacientes
  const pacientesFiltrados = useMemo(() => {
    let filtrados = pacientesConJourney;
    
    // Filtrar por búsqueda
    if (busqueda.trim()) {
      const busquedaLower = busqueda.toLowerCase();
      filtrados = filtrados.filter(p => 
        p.nombre.toLowerCase().includes(busquedaLower) ||
        p.telefono.includes(busqueda) ||
        (p.email && p.email.toLowerCase().includes(busquedaLower))
      );
    }
    
    // Filtrar por etapa
    if (filtroEtapa !== "all") {
      filtrados = filtrados.filter(p => 
        p.etapas.some(e => e.id === filtroEtapa)
      );
    }
    
    // Filtrar por prioridad
    if (filtroPrioridad !== "all") {
      filtrados = filtrados.filter(p => {
        if (!p.proximoTouchpoint) return false;
        return p.proximoTouchpoint.prioridad === filtroPrioridad;
      });
    }
    
    return filtrados;
  }, [pacientesConJourney, busqueda, filtroEtapa, filtroPrioridad]);

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-foreground">Acompañamiento Continuo</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Customer Journey Dental: acompañamiento automático según el estadio y visitas de cada paciente
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCanvas(true)}
          >
            <Settings className="w-4 h-4 mr-2" />
            Configurar Journey
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
                    placeholder="Buscar por nombre, teléfono o email..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                <div className="w-full md:w-[200px]">
                  <Select value={filtroEtapa} onValueChange={setFiltroEtapa}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filtrar por etapa" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas las etapas</SelectItem>
                      {etapasJourney.map(etapa => (
                        <SelectItem key={etapa.id} value={etapa.id}>
                          {etapa.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-full md:w-[200px]">
                  <Select value={filtroPrioridad} onValueChange={setFiltroPrioridad}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filtrar por prioridad" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas las prioridades</SelectItem>
                      <SelectItem value="alta">Alta prioridad</SelectItem>
                      <SelectItem value="media">Media prioridad</SelectItem>
                      <SelectItem value="baja">Baja prioridad</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {pacientesFiltrados.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No hay pacientes que coincidan con los filtros
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Paciente</TableHead>
                      <TableHead>Edad</TableHead>
                      <TableHead>Contacto</TableHead>
                      <TableHead>Última Visita</TableHead>
                      <TableHead>Etapa del Journey</TableHead>
                      <TableHead>Próximo Touchpoint</TableHead>
                      <TableHead>Touchpoints Pendientes</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pacientesFiltrados.map((paciente) => {
                      const CanalIcon = paciente.proximoTouchpoint
                        ? canalIcons[paciente.proximoTouchpoint.canal] || MessageSquare
                        : null;
                      
                      return (
                        <TableRow key={paciente.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-muted-foreground" />
                              <span className="font-medium">{paciente.nombre}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{paciente.edad} años</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              {paciente.telefono && (
                                <div className="flex items-center gap-1 text-sm">
                                  <Phone className="w-3 h-3" />
                                  {paciente.telefono}
                                </div>
                              )}
                              {paciente.email && (
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                  <Mail className="w-3 h-3" />
                                  {paciente.email}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {format(new Date(paciente.ultimaVisita), "dd/MM/yyyy", { locale: es })}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {paciente.etapas.slice(0, 2).map((etapa, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  {etapa.nombre}
                                </Badge>
                              ))}
                              {paciente.etapas.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{paciente.etapas.length - 2}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {paciente.proximoTouchpoint ? (
                              <div className="flex items-center gap-2">
                                {CanalIcon && (
                                  <div className={`p-1.5 rounded border ${
                                    paciente.proximoTouchpoint.prioridad === "alta"
                                      ? "bg-red-500/10 text-red-600 border-red-500/20"
                                      : paciente.proximoTouchpoint.prioridad === "media"
                                      ? "bg-orange-500/10 text-orange-600 border-orange-500/20"
                                      : "bg-blue-500/10 text-blue-600 border-blue-500/20"
                                  }`}>
                                    <CanalIcon className="w-3 h-3" />
                                  </div>
                                )}
                                <div>
                                  <div className="text-sm font-medium">
                                    {paciente.proximoTouchpoint.nombre}
                                  </div>
                                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {format(paciente.proximoTouchpoint.fecha, "dd/MM/yyyy", { locale: es })}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {canalLabels[paciente.proximoTouchpoint.canal]}
                                  </div>
                                </div>
                            </div>
                            ) : (
                              <span className="text-sm text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {paciente.touchpointsPendientes.length} pendientes
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                // TODO: Navegar a detalle del paciente con journey completo
                              }}
                            >
                              Ver Journey
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

        {/* Canvas del Customer Journey */}
        {showCanvas && (
          <CustomerJourneyCanvas
            etapas={etapasJourney}
            onEtapasChange={setEtapasJourney}
            onClose={() => setShowCanvas(false)}
          />
        )}
      </div>
    </div>
  );
}
