import { useState } from "react";
import { Phone, CheckCircle2, Calendar, XCircle, FileText, RotateCcw, ChevronDown, ChevronUp, Mail, Send, Inbox, Copy } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { TareaLlamada } from "@shared/schema";

function esMismoDia(fecha1: Date | null | undefined, fecha2: Date): boolean {
  if (!fecha1) return false;
  const d1 = new Date(fecha1);
  return d1.getFullYear() === fecha2.getFullYear() &&
         d1.getMonth() === fecha2.getMonth() &&
         d1.getDate() === fecha2.getDate();
}

type TipoAccion = "llamada" | "email" | "carta";

const tipoAccionConfig: Record<TipoAccion, { 
  icon: typeof Phone; 
  label: string; 
  color: string;
  accionPrimaria: string;
  accionCompletada: string;
}> = {
  llamada: { 
    icon: Phone, 
    label: "Llamada", 
    color: "text-blue-600 bg-blue-50 border-blue-200",
    accionPrimaria: "Llamar",
    accionCompletada: "Llamado"
  },
  email: { 
    icon: Mail, 
    label: "Email", 
    color: "text-purple-600 bg-purple-50 border-purple-200",
    accionPrimaria: "Enviar",
    accionCompletada: "Enviado"
  },
  carta: { 
    icon: Inbox, 
    label: "Carta", 
    color: "text-amber-600 bg-amber-50 border-amber-200",
    accionPrimaria: "Enviar",
    accionCompletada: "Enviada"
  },
};

function generarGuionLlamada(tarea: TareaLlamada): string {
  const nombre = tarea.pacienteNombre.split(" ")[0];
  return `Buenos días, ¿hablo con ${tarea.pacienteNombre}?

Mi nombre es [Tu nombre] y le llamo de la Clínica Dental.

Hemos notado que hace tiempo que no nos visita y queríamos contactarle para ofrecerle una cita de revisión. Es importante mantener un control periódico de su salud dental.

¿Le vendría bien agendar una cita para la próxima semana? Tenemos disponibilidad por las mañanas y por las tardes.

[Si acepta]: Perfecto, le agendo para el [día] a las [hora]. Le enviaremos un recordatorio por SMS.

[Si no puede]: Sin problema, ¿cuándo le vendría mejor? Podemos buscar otra fecha que se adapte a su horario.

[Si no está interesado]: Entiendo. Si en algún momento necesita nuestros servicios, no dude en contactarnos. ¡Que tenga un buen día!`;
}

function generarEmailTemplate(tarea: TareaLlamada): { asunto: string; cuerpo: string } {
  const nombre = tarea.pacienteNombre.split(" ")[0];
  return {
    asunto: `${nombre}, te echamos de menos en la Clínica Dental`,
    cuerpo: `Estimado/a ${tarea.pacienteNombre},

Esperamos que se encuentre bien. Nos ponemos en contacto con usted porque hemos notado que hace tiempo que no nos visita.

En la Clínica Dental nos preocupamos por su salud bucodental, y queremos recordarle la importancia de realizar revisiones periódicas para prevenir problemas futuros.

Por ello, nos gustaría invitarle a agendar una cita de revisión. Contamos con horarios flexibles que se adaptan a sus necesidades.

Para reservar su cita puede:
- Responder a este correo con su disponibilidad
- Llamarnos al teléfono de la clínica
- Reservar online a través de nuestra web

¡Le esperamos!

Atentamente,
El equipo de la Clínica Dental

---
Este mensaje ha sido enviado a ${tarea.email || tarea.telefono}
Si no desea recibir más comunicaciones, responda con "BAJA"`
  };
}

function generarCartaTemplate(tarea: TareaLlamada): string {
  const fecha = new Date().toLocaleDateString("es-ES", { 
    day: "numeric", 
    month: "long", 
    year: "numeric" 
  });
  
  return `CLÍNICA DENTAL
Calle Principal, 123
28001 Madrid
Tel: 900 123 456

${fecha}

${tarea.pacienteNombre}
[Dirección del paciente]

Estimado/a ${tarea.pacienteNombre.split(" ")[0]}:

Nos dirigimos a usted para recordarle que hace tiempo que no nos visita en nuestra clínica. Su salud dental es importante para nosotros, y queremos asegurarnos de que mantiene un adecuado cuidado bucodental.

Las revisiones periódicas son fundamentales para:
• Detectar problemas a tiempo
• Prevenir caries y enfermedades de las encías  
• Mantener una sonrisa sana y bonita

Por ello, le invitamos a solicitar una cita de revisión. Puede contactarnos por teléfono o visitando nuestra clínica.

Como paciente valorado, queremos ofrecerle un 15% de descuento en su próxima visita si agenda antes de fin de mes.

Quedamos a su disposición para cualquier consulta.

Atentamente,


Dr. [Nombre del Doctor]
Director Médico
Clínica Dental`;
}

export default function StaffCalls() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [notas, setNotas] = useState("");
  const [mostrarCompletadas, setMostrarCompletadas] = useState(false);
  const hoy = new Date();

  const { data: tareas = [], isLoading } = useQuery<TareaLlamada[]>({
    queryKey: ["/api/tareas"],
  });

  const updateTareaMutation = useMutation({
    mutationFn: async (data: { id: string; [key: string]: any }) => {
      const { id, ...body } = data;
      return await apiRequest("PATCH", `/api/tareas/${id}`, body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tareas"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/kpis"] });
    },
    onError: () => {
      toast({
        title: "Error al actualizar",
        description: "No se pudo actualizar la tarea",
        variant: "destructive",
      });
    },
  });

  // Tareas pendientes de aprobación (no aprobado + estado pendiente)
  const pendientesAprobacion = tareas.filter(t => 
    !t.aprobado && t.estado === "pendiente"
  );

  // Tareas programadas para hoy (aprobado + estado pendiente)
  const programadasHoy = tareas.filter(t => 
    t.aprobado && 
    t.estado === "pendiente" && 
    (esMismoDia(t.fechaProgramada, hoy) || !t.fechaProgramada)
  );

  // Tareas completadas hoy
  const completadasHoy = tareas.filter(t => 
    ["contactado", "cita_agendada", "no_contactado"].includes(t.estado) &&
    esMismoDia(t.fechaCompletada, hoy)
  );

  // Todas las acciones pendientes (combinadas)
  const accionesPendientes = [...pendientesAprobacion, ...programadasHoy];

  const handleCompletar = (tarea: TareaLlamada) => {
    const tipoConfig = tipoAccionConfig[(tarea.tipoAccion as TipoAccion) || "llamada"];
    updateTareaMutation.mutate(
      { id: tarea.id, aprobado: true, estado: "contactado", fechaProgramada: new Date().toISOString(), fechaCompletada: new Date().toISOString(), fechaContacto: new Date().toISOString() },
      {
        onSuccess: () => {
          toast({
            title: "Acción completada",
            description: `${tipoConfig.label} para ${tarea.pacienteNombre} marcada como completada`,
          });
        },
      }
    );
  };

  const handleMarcarContactado = (tarea: TareaLlamada) => {
    const tipoConfig = tipoAccionConfig[(tarea.tipoAccion as TipoAccion) || "llamada"];
    updateTareaMutation.mutate(
      { id: tarea.id, estado: "contactado", fechaCompletada: new Date().toISOString(), fechaContacto: new Date().toISOString() },
      {
        onSuccess: () => {
          toast({
            title: tipoConfig.accionCompletada,
            description: `Se ha completado la acción para ${tarea.pacienteNombre}`,
          });
        },
      }
    );
  };

  const handleAgendarCita = (tarea: TareaLlamada) => {
    updateTareaMutation.mutate(
      { id: tarea.id, estado: "cita_agendada", fechaCompletada: new Date().toISOString(), fechaContacto: new Date().toISOString() },
      {
        onSuccess: () => {
          toast({
            title: "Cita agendada",
            description: `Cita agendada para ${tarea.pacienteNombre}`,
          });
        },
      }
    );
  };

  const handleNoContactado = (tarea: TareaLlamada) => {
    updateTareaMutation.mutate(
      { id: tarea.id, estado: "no_contactado", fechaCompletada: new Date().toISOString() },
      {
        onSuccess: () => {
          toast({
            title: "Acción fallida",
            description: `No se pudo completar la acción para ${tarea.pacienteNombre}`,
          });
        },
      }
    );
  };

  const handleReabrir = (tarea: TareaLlamada) => {
    updateTareaMutation.mutate(
      { id: tarea.id, estado: "pendiente", fechaCompletada: null, fechaContacto: null },
      {
        onSuccess: () => {
          toast({
            title: "Tarea reabierta",
            description: `La acción para ${tarea.pacienteNombre} ha sido reprogramada`,
          });
        },
      }
    );
  };

  const handleCopiarTexto = (texto: string) => {
    navigator.clipboard.writeText(texto);
    toast({
      title: "Copiado",
      description: "Texto copiado al portapapeles",
    });
  };

  const getPrioridadBadge = (prioridad: string) => {
    const variants = {
      Alta: "destructive" as const,
      Media: "default" as const,
      Baja: "secondary" as const,
    };
    return (
      <Badge variant={variants[prioridad as keyof typeof variants]} className="text-xs">
        {prioridad}
      </Badge>
    );
  };

  const getTipoAccionBadge = (tipoAccion: string | null) => {
    const tipo = (tipoAccion as TipoAccion) || "llamada";
    const config = tipoAccionConfig[tipo];
    const IconComponent = config.icon;
    return (
      <Badge variant="outline" className={`text-xs ${config.color} gap-1`}>
        <IconComponent className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const getResultadoBadge = (estado: string) => {
    const config: Record<string, { className: string; label: string }> = {
      contactado: { className: "text-green-600 border-green-300 bg-green-50", label: "Completado" },
      cita_agendada: { className: "text-emerald-600 border-emerald-300 bg-emerald-50", label: "Cita Agendada" },
      no_contactado: { className: "text-gray-600 border-gray-300 bg-gray-50", label: "Fallido" },
    };
    const c = config[estado] || { className: "", label: estado };
    return <Badge variant="outline" className={`text-xs ${c.className}`}>{c.label}</Badge>;
  };

  const getContactInfo = (tarea: TareaLlamada) => {
    const tipo = (tarea.tipoAccion as TipoAccion) || "llamada";
    if (tipo === "email" && tarea.email) {
      return tarea.email;
    }
    return tarea.telefono;
  };

  const renderDetallesModal = (tarea: TareaLlamada) => {
    const tipoAccion = (tarea.tipoAccion as TipoAccion) || "llamada";
    const tipoConfig = tipoAccionConfig[tipoAccion];

    if (tipoAccion === "llamada") {
      const guion = generarGuionLlamada(tarea);
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            {getTipoAccionBadge(tarea.tipoAccion)}
            {getPrioridadBadge(tarea.prioridad)}
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Paciente:</span>
              <p className="font-medium">{tarea.pacienteNombre}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Teléfono:</span>
              <p className="font-mono">{tarea.telefono}</p>
            </div>
          </div>

          <div className="text-sm">
            <span className="text-muted-foreground">Motivo:</span>
            <p>{tarea.motivo}</p>
          </div>

          <Separator />

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm font-medium">Guion de llamada</Label>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => handleCopiarTexto(guion)}
                data-testid="button-copiar-guion"
              >
                <Copy className="w-3 h-3 mr-1" />
                Copiar
              </Button>
            </div>
            <div className="rounded-md bg-muted p-4 text-sm text-foreground whitespace-pre-wrap max-h-64 overflow-y-auto">
              {guion}
            </div>
          </div>
        </div>
      );
    }

    if (tipoAccion === "email") {
      const emailTemplate = generarEmailTemplate(tarea);
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            {getTipoAccionBadge(tarea.tipoAccion)}
            {getPrioridadBadge(tarea.prioridad)}
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Paciente:</span>
              <p className="font-medium">{tarea.pacienteNombre}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Email:</span>
              <p className="font-mono text-sm">{tarea.email || "No disponible"}</p>
            </div>
          </div>

          <div className="text-sm">
            <span className="text-muted-foreground">Motivo:</span>
            <p>{tarea.motivo}</p>
          </div>

          <Separator />

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm font-medium">Email listo para enviar</Label>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => handleCopiarTexto(`Asunto: ${emailTemplate.asunto}\n\n${emailTemplate.cuerpo}`)}
                data-testid="button-copiar-email"
              >
                <Copy className="w-3 h-3 mr-1" />
                Copiar
              </Button>
            </div>
            <div className="rounded-md bg-muted p-4 text-sm space-y-3 max-h-64 overflow-y-auto">
              <div>
                <span className="text-muted-foreground text-xs">Asunto:</span>
                <p className="font-medium">{emailTemplate.asunto}</p>
              </div>
              <Separator />
              <div className="whitespace-pre-wrap text-foreground">
                {emailTemplate.cuerpo}
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Carta
    const cartaTemplate = generarCartaTemplate(tarea);
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          {getTipoAccionBadge(tarea.tipoAccion)}
          {getPrioridadBadge(tarea.prioridad)}
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Paciente:</span>
            <p className="font-medium">{tarea.pacienteNombre}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Teléfono:</span>
            <p className="font-mono">{tarea.telefono}</p>
          </div>
        </div>

        <div className="text-sm">
          <span className="text-muted-foreground">Motivo:</span>
          <p>{tarea.motivo}</p>
        </div>

        <Separator />

        <div>
          <div className="flex items-center justify-between mb-2">
            <Label className="text-sm font-medium">Carta para imprimir</Label>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => handleCopiarTexto(cartaTemplate)}
              data-testid="button-copiar-carta"
            >
              <Copy className="w-3 h-3 mr-1" />
              Copiar
            </Button>
          </div>
          <div className="rounded-md bg-muted p-4 text-sm text-foreground whitespace-pre-wrap max-h-64 overflow-y-auto font-mono text-xs">
            {cartaTemplate}
          </div>
        </div>
      </div>
    );
  };

  const renderTareaCard = (tarea: TareaLlamada, index: number) => {
    const esPendiente = !tarea.aprobado;
    const tipoAccion = (tarea.tipoAccion as TipoAccion) || "llamada";
    const tipoConfig = tipoAccionConfig[tipoAccion];
    const TipoIcon = tipoConfig.icon;

    return (
      <Card 
        key={tarea.id} 
        className="hover-elevate transition-all"
        data-testid={`card-tarea-${index}`}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            {/* Avatar con icono del tipo */}
            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${tipoConfig.color}`}>
              <TipoIcon className="w-5 h-5" />
            </div>

            {/* Info del paciente */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <p className="font-medium text-foreground">
                  {tarea.pacienteNombre}
                </p>
                {getPrioridadBadge(tarea.prioridad)}
                {getTipoAccionBadge(tarea.tipoAccion)}
              </div>
              <p className="text-sm text-muted-foreground font-mono mb-2">
                {getContactInfo(tarea)}
              </p>
              <p className="text-sm text-muted-foreground line-clamp-1">
                {tarea.motivo}
              </p>
            </div>

            {/* Acciones */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {esPendiente ? (
                <>
                  <Button
                    size="sm"
                    onClick={() => handleCompletar(tarea)}
                    disabled={updateTareaMutation.isPending}
                    data-testid={`button-completar-${index}`}
                  >
                    Marcar como realizada
                  </Button>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="icon" data-testid={`button-detalles-${index}`}>
                        <FileText className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tipoConfig.color}`}>
                            <TipoIcon className="w-5 h-5" />
                          </div>
                          <div>
                            <DialogTitle>Detalles de la Acción</DialogTitle>
                            <DialogDescription>
                              {tipoConfig.label} para {tarea.pacienteNombre}
                            </DialogDescription>
                          </div>
                        </div>
                      </DialogHeader>
                      {renderDetallesModal(tarea)}
                    </DialogContent>
                  </Dialog>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleMarcarContactado(tarea)}
                    disabled={updateTareaMutation.isPending}
                    data-testid={`button-contactado-${index}`}
                  >
                    <Send className="w-3 h-3 mr-1" />
                    {tipoConfig.accionPrimaria}
                  </Button>
                  {tipoAccion === "llamada" && (
                    <Button
                      size="sm"
                      onClick={() => handleAgendarCita(tarea)}
                      disabled={updateTareaMutation.isPending}
                      data-testid={`button-agendar-${index}`}
                    >
                      <Calendar className="w-3 h-3 mr-1" />
                      Agendar
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleNoContactado(tarea)}
                    disabled={updateTareaMutation.isPending}
                    className="text-muted-foreground"
                    data-testid={`button-no-contactado-${index}`}
                  >
                    <XCircle className="w-4 h-4" />
                  </Button>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="icon" data-testid={`button-ver-detalles-${index}`}>
                        <FileText className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tipoConfig.color}`}>
                            <TipoIcon className="w-5 h-5" />
                          </div>
                          <div>
                            <DialogTitle>Detalles de la Acción</DialogTitle>
                            <DialogDescription>
                              {tipoConfig.label} para {tarea.pacienteNombre}
                            </DialogDescription>
                          </div>
                        </div>
                      </DialogHeader>
                      {renderDetallesModal(tarea)}
                      <Separator className="my-4" />
                      <div className="space-y-2">
                        <Label htmlFor="notas">Notas</Label>
                        <Textarea
                          id="notas"
                          placeholder="Añade notas sobre la acción..."
                          value={notas}
                          onChange={(e) => setNotas(e.target.value)}
                          rows={3}
                          data-testid={`textarea-notas-${index}`}
                        />
                      </div>
                    </DialogContent>
                  </Dialog>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderCompletadaCard = (tarea: TareaLlamada, index: number) => {
    const tipoAccion = (tarea.tipoAccion as TipoAccion) || "llamada";
    const tipoConfig = tipoAccionConfig[tipoAccion];
    const TipoIcon = tipoConfig.icon;

    return (
      <Card 
        key={tarea.id} 
        className="hover-elevate transition-all bg-muted/30"
        data-testid={`card-completada-${index}`}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            {/* Avatar con icono del tipo */}
            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${tipoConfig.color}`}>
              <TipoIcon className="w-5 h-5" />
            </div>

            {/* Info del paciente */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <p className="font-medium text-foreground">
                  {tarea.pacienteNombre}
                </p>
                {getPrioridadBadge(tarea.prioridad)}
                {getTipoAccionBadge(tarea.tipoAccion)}
                {getResultadoBadge(tarea.estado)}
              </div>
              <p className="text-sm text-muted-foreground font-mono mb-2">
                {getContactInfo(tarea)}
              </p>
              {tarea.notas && (
                <p className="text-sm text-muted-foreground line-clamp-1">
                  {tarea.notas}
                </p>
              )}
            </div>

            {/* Acción de reabrir */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleReabrir(tarea)}
                disabled={updateTareaMutation.isPending}
                data-testid={`button-reabrir-${index}`}
              >
                <RotateCcw className="w-3 h-3 mr-1" />
                Reabrir
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderSkeletonCard = (index: number) => (
    <Card key={index}>
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <Skeleton className="w-10 h-10 rounded-full" />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-5 w-12" />
              <Skeleton className="h-5 w-16" />
            </div>
            <Skeleton className="h-3 w-24 mb-2" />
            <Skeleton className="h-3 w-48" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-8" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-semibold text-foreground" data-testid="text-page-title">
            Acciones del Día
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {accionesPendientes.length} acciones pendientes
          </p>
        </div>

        {/* Lista de tarjetas pendientes */}
        <div className="space-y-3">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => renderSkeletonCard(i))
          ) : accionesPendientes.length > 0 ? (
            accionesPendientes.map((tarea, index) => renderTareaCard(tarea, index))
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-1">
                  ¡Todo listo!
                </h3>
                <p className="text-sm text-muted-foreground">
                  No hay acciones pendientes para hoy
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sección de completadas (colapsable) */}
        {completadasHoy.length > 0 && (
          <Collapsible 
            open={mostrarCompletadas} 
            onOpenChange={setMostrarCompletadas}
            className="mt-8"
          >
            <CollapsibleTrigger asChild>
              <Button 
                variant="ghost" 
                className="w-full justify-between py-3 text-muted-foreground hover:text-foreground"
                data-testid="button-toggle-completadas"
              >
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  Completadas hoy ({completadasHoy.length})
                </span>
                {mostrarCompletadas ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-3 mt-3">
              {completadasHoy.map((tarea, index) => renderCompletadaCard(tarea, index))}
            </CollapsibleContent>
          </Collapsible>
        )}
      </div>
    </div>
  );
}
