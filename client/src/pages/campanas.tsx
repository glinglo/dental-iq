import { useState } from "react";
import { Megaphone, Plus, Play, Pause, Mail, MessageSquare, Phone } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import type { Campana } from "@shared/schema";

export default function Campanas() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [dialogAbierto, setDialogAbierto] = useState(false);
  
  const [nuevaCampana, setNuevaCampana] = useState({
    nombre: "",
    canales: [] as string[],
    cadencia: "",
    plantillaSMS: "Hola {nombre}, hace tiempo que no te vemos en nuestra clínica. ¿Te gustaría agendar una cita? Responde SÍ para confirmar.",
    plantillaEmail: "Estimado/a {nombre},\n\nEsperamos que se encuentre bien. Hemos notado que hace {meses} meses que no nos visita y queremos invitarle a agendar una revisión.\n\nUn saludo,\nClínica Dental",
    guionLlamada: "Buenos días, ¿hablo con {nombre}? Le llamamos de la Clínica Dental para ofrecerle una cita de revisión. ¿Le vendría bien la próxima semana?",
  });

  const { data: campanas = [], isLoading } = useQuery<Campana[]>({
    queryKey: ["/api/campanas"],
  });

  const crearCampanaMutation = useMutation({
    mutationFn: async (campana: any) => {
      return await apiRequest("POST", "/api/campanas", campana);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/campanas"] });
      toast({
        title: "Campaña creada",
        description: `La campaña "${nuevaCampana.nombre}" se ha creado exitosamente`,
      });
      setDialogAbierto(false);
      setNuevaCampana({
        nombre: "",
        canales: [],
        cadencia: "",
        plantillaSMS: "Hola {nombre}, hace tiempo que no te vemos en nuestra clínica. ¿Te gustaría agendar una cita? Responde SÍ para confirmar.",
        plantillaEmail: "Estimado/a {nombre},\n\nEsperamos que se encuentre bien. Hemos notado que hace {meses} meses que no nos visita y queremos invitarle a agendar una revisión.\n\nUn saludo,\nClínica Dental",
        guionLlamada: "Buenos días, ¿hablo con {nombre}? Le llamamos de la Clínica Dental para ofrecerle una cita de revisión. ¿Le vendría bien la próxima semana?",
      });
    },
    onError: () => {
      toast({
        title: "Error al crear campaña",
        description: "No se pudo crear la campaña. Por favor intenta de nuevo.",
        variant: "destructive",
      });
    },
  });

  const handleToggleCanal = (canal: string) => {
    setNuevaCampana(prev => ({
      ...prev,
      canales: prev.canales.includes(canal)
        ? prev.canales.filter(c => c !== canal)
        : [...prev.canales, canal]
    }));
  };

  const handleIniciarCampana = () => {
    if (!nuevaCampana.nombre || nuevaCampana.canales.length === 0 || !nuevaCampana.cadencia) {
      toast({
        title: "Campos incompletos",
        description: "Por favor completa todos los campos requeridos",
        variant: "destructive",
      });
      return;
    }

    crearCampanaMutation.mutate({
      nombre: nuevaCampana.nombre,
      canales: nuevaCampana.canales,
      cadencia: nuevaCampana.cadencia,
      plantillaSMS: nuevaCampana.canales.includes("SMS") ? nuevaCampana.plantillaSMS : null,
      plantillaEmail: nuevaCampana.canales.includes("Email") ? nuevaCampana.plantillaEmail : null,
      guionLlamada: nuevaCampana.canales.includes("Llamadas") ? nuevaCampana.guionLlamada : null,
      estado: "activa",
    });
  };

  const getEstadoBadge = (estado: string) => {
    const variants = {
      activa: { variant: "default" as const, label: "Activa" },
      pausada: { variant: "secondary" as const, label: "Pausada" },
      completada: { variant: "outline" as const, label: "Completada" },
    };
    const config = variants[estado as keyof typeof variants];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getCanalesIcons = (canales: string[]) => {
    return canales.map((canal, index) => {
      const icons = {
        SMS: MessageSquare,
        Email: Mail,
        Llamadas: Phone,
      };
      const Icon = icons[canal as keyof typeof icons];
      return <Icon key={index} className="w-4 h-4" />;
    });
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-semibold text-foreground" data-testid="text-page-title">
              Campañas de Reactivación
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Gestiona tus campañas multicanal
            </p>
          </div>
          
          <Dialog open={dialogAbierto} onOpenChange={setDialogAbierto}>
            <DialogTrigger asChild>
              <Button data-testid="button-nueva-campana">
                <Plus className="w-4 h-4 mr-2" />
                Nueva Campaña
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Crear Nueva Campaña</DialogTitle>
                <DialogDescription>
                  Configura una campaña de reactivación multicanal
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
                {/* Nombre */}
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre de la Campaña</Label>
                  <Input
                    id="nombre"
                    placeholder="Ej: Reactivación Primavera 2024"
                    value={nuevaCampana.nombre}
                    onChange={(e) => setNuevaCampana({ ...nuevaCampana, nombre: e.target.value })}
                    data-testid="input-nombre-campana"
                  />
                </div>

                {/* Canales */}
                <div className="space-y-3">
                  <Label>Canales de Comunicación</Label>
                  <div className="space-y-2">
                    {["SMS", "Email", "Llamadas"].map((canal) => (
                      <div key={canal} className="flex items-center gap-2">
                        <Checkbox
                          id={canal}
                          checked={nuevaCampana.canales.includes(canal)}
                          onCheckedChange={() => handleToggleCanal(canal)}
                          data-testid={`checkbox-canal-${canal.toLowerCase()}`}
                        />
                        <Label htmlFor={canal} className="cursor-pointer">
                          {canal}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Cadencia */}
                <div className="space-y-2">
                  <Label htmlFor="cadencia">Cadencia de Contacto</Label>
                  <Select
                    value={nuevaCampana.cadencia}
                    onValueChange={(value) => setNuevaCampana({ ...nuevaCampana, cadencia: value })}
                  >
                    <SelectTrigger id="cadencia" data-testid="select-cadencia">
                      <SelectValue placeholder="Selecciona una cadencia" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Opción 1: SMS → Email → Llamada">
                        Opción 1: SMS → Email → Llamada
                      </SelectItem>
                      <SelectItem value="Opción 2: SMS → SMS → Llamada">
                        Opción 2: SMS → SMS → Llamada
                      </SelectItem>
                      <SelectItem value="Opción 3: Email → Llamada">
                        Opción 3: Email → Llamada
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Plantilla SMS */}
                {nuevaCampana.canales.includes("SMS") && (
                  <div className="space-y-2">
                    <Label htmlFor="plantillaSMS">Plantilla SMS</Label>
                    <Textarea
                      id="plantillaSMS"
                      placeholder="Mensaje SMS..."
                      value={nuevaCampana.plantillaSMS}
                      onChange={(e) => setNuevaCampana({ ...nuevaCampana, plantillaSMS: e.target.value })}
                      rows={3}
                      data-testid="textarea-plantilla-sms"
                    />
                    <p className="text-xs text-muted-foreground">
                      Variables disponibles: {"{nombre}"}, {"{meses}"}
                    </p>
                  </div>
                )}

                {/* Plantilla Email */}
                {nuevaCampana.canales.includes("Email") && (
                  <div className="space-y-2">
                    <Label htmlFor="plantillaEmail">Plantilla Email</Label>
                    <Textarea
                      id="plantillaEmail"
                      placeholder="Contenido del email..."
                      value={nuevaCampana.plantillaEmail}
                      onChange={(e) => setNuevaCampana({ ...nuevaCampana, plantillaEmail: e.target.value })}
                      rows={6}
                      data-testid="textarea-plantilla-email"
                    />
                  </div>
                )}

                {/* Guion Llamada */}
                {nuevaCampana.canales.includes("Llamadas") && (
                  <div className="space-y-2">
                    <Label htmlFor="guionLlamada">Guion de Llamada</Label>
                    <Textarea
                      id="guionLlamada"
                      placeholder="Guion para las llamadas..."
                      value={nuevaCampana.guionLlamada}
                      onChange={(e) => setNuevaCampana({ ...nuevaCampana, guionLlamada: e.target.value })}
                      rows={4}
                      data-testid="textarea-guion-llamada"
                    />
                  </div>
                )}

                <Button 
                  onClick={handleIniciarCampana}
                  disabled={crearCampanaMutation.isPending}
                  className="w-full"
                  data-testid="button-iniciar-campana"
                >
                  <Play className="w-4 h-4 mr-2" />
                  {crearCampanaMutation.isPending ? "Creando..." : "Iniciar Campaña"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Campaigns List */}
        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <Card key={index}>
                <CardHeader>
                  <Skeleton className="h-6 w-48 mb-2" />
                  <Skeleton className="h-4 w-32" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <div className="grid grid-cols-3 gap-4 pt-4">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : campanas.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {campanas.map((campana, index) => (
              <Card key={campana.id} data-testid={`card-campana-${index}`}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-semibold">
                        {campana.nombre}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        Creada el {format(new Date(campana.fechaCreacion), "d 'de' MMMM, yyyy", { locale: es })}
                      </CardDescription>
                    </div>
                    {getEstadoBadge(campana.estado)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Canales */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm text-muted-foreground">Canales:</span>
                    <div className="flex items-center gap-2">
                      {getCanalesIcons(campana.canales)}
                    </div>
                    <span className="text-sm text-foreground">
                      {campana.canales.join(", ")}
                    </span>
                  </div>

                  {/* Cadencia */}
                  <div>
                    <span className="text-sm text-muted-foreground">Cadencia:</span>
                    <span className="text-sm text-foreground ml-2">{campana.cadencia}</span>
                  </div>

                  {/* Métricas */}
                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
                    <div>
                      <div className="text-xs text-muted-foreground">Pacientes</div>
                      <div className="text-xl font-bold text-foreground">{campana.pacientesIncluidos}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Contactos</div>
                      <div className="text-xl font-bold text-foreground">{campana.contactosEnviados}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Citas</div>
                      <div className="text-xl font-bold text-primary">{campana.citasGeneradas}</div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2 flex-wrap">
                    {campana.estado === "activa" ? (
                      <Button variant="outline" size="sm" className="flex-1">
                        <Pause className="w-4 h-4 mr-2" />
                        Pausar
                      </Button>
                    ) : (
                      <Button variant="outline" size="sm" className="flex-1">
                        <Play className="w-4 h-4 mr-2" />
                        Reanudar
                      </Button>
                    )}
                    <Button variant="outline" size="sm" className="flex-1">
                      Ver Detalles
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Megaphone className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                No hay campañas creadas
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                Crea tu primera campaña para comenzar a reactivar pacientes
              </p>
              <Button onClick={() => setDialogAbierto(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Nueva Campaña
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
