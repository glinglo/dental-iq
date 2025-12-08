import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Settings, Search, User, Phone, Mail, MessageSquare, Clock, ChevronDown } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ReglasComunicacionDialog } from "@/components/reglas-comunicacion-dialog";
import type { Paciente, ReglaComunicacion, SecuenciaComunicacion, PasoComunicacion } from "@shared/schema";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface PacienteConCampaña extends Paciente {
  campanaNombre?: string;
  campanaId?: string;
  siguienteAccion?: {
    fecha: Date | null;
    canal: string;
    paso: number;
  };
  secuenciaId?: string;
}

const canalLabels: Record<string, string> = {
  whatsapp: "WhatsApp",
  sms: "SMS",
  email: "Email",
  llamada: "Llamada",
};

const canalIcons: Record<string, typeof MessageSquare> = {
  whatsapp: MessageSquare,
  sms: Phone,
  email: Mail,
  llamada: Phone,
};

const canalColors: Record<string, string> = {
  whatsapp: "bg-green-500/10 text-green-600 border-green-500/20",
  sms: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  email: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  llamada: "bg-orange-500/10 text-orange-600 border-orange-500/20",
};

export default function CampanasRecalls() {
  const [, setLocation] = useLocation();
  const [busqueda, setBusqueda] = useState("");
  const [filtroCampana, setFiltroCampana] = useState<string>("all");
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [campanaSeleccionada, setCampanaSeleccionada] = useState<string | null>(null);
  const [editarDialogOpen, setEditarDialogOpen] = useState(false);

  // Obtener pacientes dormidos
  const { data: pacientes = [] } = useQuery<Paciente[]>({
    queryKey: ["/api/pacientes"],
  });

  // Obtener reglas de comunicación de tipo recall
  const { data: reglas = [] } = useQuery<ReglaComunicacion[]>({
    queryKey: ["/api/reglas-comunicacion"],
  });

  const reglasRecall = reglas.filter(r => r.tipo === "recall_paciente");

  // Obtener secuencias activas de recall
  const { data: secuencias = [] } = useQuery<Array<{ secuencia: SecuenciaComunicacion; regla: ReglaComunicacion | undefined }>>({
    queryKey: ["/api/secuencias-comunicacion", { tipo: "recall_paciente", estado: "activa" }],
    queryFn: async () => {
      const response = await fetch("/api/secuencias-comunicacion?tipo=recall_paciente&estado=activa");
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

  // Filtrar pacientes dormidos (estado "perdido" o sin cita hace más de 6 meses)
  const pacientesDormidos = useMemo(() => {
    const ahora = new Date();
    return pacientes.filter(p => {
      const ultimaVisita = new Date(p.ultimaVisita);
      const mesesSinVisita = (ahora.getTime() - ultimaVisita.getTime()) / (1000 * 60 * 60 * 24 * 30);
      return p.estado === "perdido" || (mesesSinVisita >= 6 && !p.tieneCitaFutura);
    });
  }, [pacientes]);

  // Crear mapa de secuencias por paciente
  const secuenciasPorPaciente = useMemo(() => {
    const mapa = new Map<string, { secuencia: SecuenciaComunicacion; regla: ReglaComunicacion | undefined }>();
    secuencias.forEach(s => {
      mapa.set(s.secuencia.pacienteId, s);
    });
    return mapa;
  }, [secuencias]);

  // Combinar pacientes con información de campaña
  const pacientesConCampaña: PacienteConCampaña[] = useMemo(() => {
    return pacientesDormidos.map(paciente => {
      const secuenciaData = secuenciasPorPaciente.get(paciente.id);
      const regla = secuenciaData?.regla;
      const secuencia = secuenciaData?.secuencia;
      
      let siguienteAccion: PacienteConCampaña["siguienteAccion"] | undefined;
      
      if (secuencia && regla) {
        const pasos = regla.secuencia as PasoComunicacion[];
        const pasoActual = secuencia.pasoActual || 0;
        
        if (pasoActual < pasos.length) {
          const paso = pasos[pasoActual];
          const fechaInicio = secuencia.fechaInicio ? new Date(secuencia.fechaInicio) : new Date();
          const fechaSiguiente = new Date(fechaInicio);
          
          // Calcular fecha del siguiente paso
          let diasAcumulados = 0;
          for (let i = 0; i <= pasoActual; i++) {
            if (i > 0) {
              diasAcumulados += pasos[i - 1].diasDespues;
            }
          }
          fechaSiguiente.setDate(fechaSiguiente.getDate() + diasAcumulados);
          
          siguienteAccion = {
            fecha: fechaSiguiente,
            canal: paso.canal,
            paso: pasoActual + 1,
          };
        }
      }
      
      return {
        ...paciente,
        campanaNombre: regla?.nombre,
        campanaId: regla?.id,
        siguienteAccion,
        secuenciaId: secuencia?.id,
      };
    });
  }, [pacientesDormidos, secuenciasPorPaciente]);

  // Filtrar pacientes
  const pacientesFiltrados = useMemo(() => {
    let filtrados = pacientesConCampaña;
    
    // Filtrar por búsqueda
    if (busqueda.trim()) {
      const busquedaLower = busqueda.toLowerCase();
      filtrados = filtrados.filter(p => 
        p.nombre.toLowerCase().includes(busquedaLower) ||
        p.telefono.includes(busqueda) ||
        (p.email && p.email.toLowerCase().includes(busquedaLower))
      );
    }
    
    // Filtrar por campaña
    if (filtroCampana !== "all") {
      if (filtroCampana === "sin_campana") {
        filtrados = filtrados.filter(p => !p.campanaId);
      } else {
        filtrados = filtrados.filter(p => p.campanaId === filtroCampana);
      }
    }
    
    return filtrados;
  }, [pacientesConCampaña, busqueda, filtroCampana]);

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-foreground">Recuperación</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Gestión de pacientes dormidos y sus campañas de recuperación
            </p>
          </div>
          <div className="flex items-center gap-2">
            {reglasRecall.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="secondary">
                    <Settings className="w-4 h-4 mr-2" />
                    Editar Campaña
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {reglasRecall.map((regla) => (
                    <DropdownMenuItem
                      key={regla.id}
                      onClick={() => {
                        setCampanaSeleccionada(regla.id);
                        setEditarDialogOpen(true);
                      }}
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      {regla.nombre}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            <Button
              onClick={() => {
                setCampanaSeleccionada(null);
                setConfigDialogOpen(true);
              }}
            >
              Nueva Campaña
            </Button>
          </div>
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
              <div className="w-full md:w-[200px]">
                <Select value={filtroCampana} onValueChange={setFiltroCampana}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filtrar por campaña" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las campañas</SelectItem>
                    <SelectItem value="sin_campana">Sin campaña</SelectItem>
                    {reglasRecall.map(regla => (
                      <SelectItem key={regla.id} value={regla.id}>
                        {regla.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {pacientesFiltrados.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No hay pacientes dormidos que coincidan con los filtros
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Paciente</TableHead>
                    <TableHead>Contacto</TableHead>
                    <TableHead>Última Visita</TableHead>
                    <TableHead>Meses Sin Visita</TableHead>
                    <TableHead>Campaña</TableHead>
                    <TableHead>Siguiente Acción</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pacientesFiltrados.map((paciente) => {
                    const ultimaVisita = new Date(paciente.ultimaVisita);
                    const ahora = new Date();
                    const mesesSinVisita = Math.floor(
                      (ahora.getTime() - ultimaVisita.getTime()) / (1000 * 60 * 60 * 24 * 30)
                    );
                    
                    const CanalIcon = paciente.siguienteAccion
                      ? canalIcons[paciente.siguienteAccion.canal] || MessageSquare
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
                          {format(ultimaVisita, "dd/MM/yyyy", { locale: es })}
                        </TableCell>
                        <TableCell>
                          <Badge variant={mesesSinVisita >= 12 ? "destructive" : "secondary"}>
                            {mesesSinVisita} meses
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {paciente.campanaNombre ? (
                            <Badge variant="outline">{paciente.campanaNombre}</Badge>
                          ) : (
                            <Badge variant="secondary">Sin campaña</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {paciente.siguienteAccion ? (
                            <div className="flex items-center gap-2">
                              {CanalIcon && (
                                <div className={`p-1.5 rounded border ${canalColors[paciente.siguienteAccion.canal]}`}>
                                  <CanalIcon className="w-3 h-3" />
                                </div>
                              )}
                              <div>
                                <div className="text-sm font-medium">
                                  {canalLabels[paciente.siguienteAccion.canal]}
                                </div>
                                {paciente.siguienteAccion.fecha && (
                                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {format(paciente.siguienteAccion.fecha, "dd/MM/yyyy", { locale: es })}
                                  </div>
                                )}
                              </div>
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              // TODO: Navegar a detalle del paciente
                            }}
                          >
                            Ver Detalle
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

        {/* Dialog de configuración de reglas - Nueva campaña */}
        {configDialogOpen && (
          <ReglasComunicacionDialog
            tipo="recall_paciente"
            titulo="Nueva Campaña de Recall"
            open={configDialogOpen}
            onOpenChange={(open) => {
              setConfigDialogOpen(open);
              if (!open) setCampanaSeleccionada(null);
            }}
          />
        )}

        {/* Dialog de configuración de reglas - Editar campaña */}
        {editarDialogOpen && campanaSeleccionada && (
          <ReglasComunicacionDialog
            tipo="recall_paciente"
            titulo="Editar Campaña de Recall"
            open={editarDialogOpen}
            onOpenChange={(open) => {
              setEditarDialogOpen(open);
              if (!open) setCampanaSeleccionada(null);
            }}
            reglaId={campanaSeleccionada}
          />
        )}
      </div>
    </div>
  );
}

