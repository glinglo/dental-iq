import { Settings, Building2, Users, Bell, Database } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

export default function Configuracion() {
  const { toast } = useToast();

  const handleGuardarCambios = () => {
    toast({
      title: "Configuración guardada",
      description: "Los cambios se han guardado exitosamente",
    });
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-semibold text-foreground" data-testid="text-page-title">
            Configuración
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Administra la configuración de tu clínica y preferencias del sistema
          </p>
        </div>

        {/* Información de la Clínica */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Información de la Clínica
            </CardTitle>
            <CardDescription>
              Datos generales de tu centro médico
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nombre-clinica">Nombre de la Clínica</Label>
                <Input
                  id="nombre-clinica"
                  defaultValue="Clínica Dental San Martín"
                  data-testid="input-nombre-clinica"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefono-clinica">Teléfono Principal</Label>
                <Input
                  id="telefono-clinica"
                  defaultValue="+34 912 345 678"
                  data-testid="input-telefono-clinica"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email-clinica">Email de Contacto</Label>
              <Input
                id="email-clinica"
                type="email"
                defaultValue="contacto@clinicadental.es"
                data-testid="input-email-clinica"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="direccion-clinica">Dirección</Label>
              <Input
                id="direccion-clinica"
                defaultValue="Calle Mayor, 123, 28013 Madrid"
                data-testid="input-direccion-clinica"
              />
            </div>
          </CardContent>
        </Card>

        {/* Configuración de Notificaciones */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Notificaciones
            </CardTitle>
            <CardDescription>
              Gestiona cómo y cuándo recibes notificaciones
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Notificaciones por Email</Label>
                <p className="text-sm text-muted-foreground">
                  Recibe actualizaciones de campañas por email
                </p>
              </div>
              <Switch defaultChecked data-testid="switch-notif-email" />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Alertas de Nuevas Citas</Label>
                <p className="text-sm text-muted-foreground">
                  Notificación cuando se agenda una nueva cita
                </p>
              </div>
              <Switch defaultChecked data-testid="switch-notif-citas" />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Resumen Semanal</Label>
                <p className="text-sm text-muted-foreground">
                  Recibe un resumen de métricas cada semana
                </p>
              </div>
              <Switch defaultChecked data-testid="switch-notif-resumen" />
            </div>
          </CardContent>
        </Card>

        {/* Usuarios y Permisos */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Users className="w-4 h-4" />
              Usuarios del Sistema
            </CardTitle>
            <CardDescription>
              Administra el acceso de tu equipo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 rounded-md border border-border">
                <div>
                  <div className="text-sm font-medium text-foreground">Dr. Juan Pérez</div>
                  <div className="text-xs text-muted-foreground">Administrador</div>
                </div>
                <Button variant="outline" size="sm">Editar</Button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-md border border-border">
                <div>
                  <div className="text-sm font-medium text-foreground">María González</div>
                  <div className="text-xs text-muted-foreground">Recepcionista</div>
                </div>
                <Button variant="outline" size="sm">Editar</Button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-md border border-border">
                <div>
                  <div className="text-sm font-medium text-foreground">Carlos Ruiz</div>
                  <div className="text-xs text-muted-foreground">Staff Calls</div>
                </div>
                <Button variant="outline" size="sm">Editar</Button>
              </div>
            </div>

            <Button variant="outline" className="w-full">
              <Users className="w-4 h-4 mr-2" />
              Añadir Nuevo Usuario
            </Button>
          </CardContent>
        </Card>

        {/* Configuración Avanzada */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Database className="w-4 h-4" />
              Configuración Avanzada
            </CardTitle>
            <CardDescription>
              Opciones técnicas y de sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Modo de Desarrollo</Label>
                <p className="text-sm text-muted-foreground">
                  Activa opciones avanzadas para desarrolladores
                </p>
              </div>
              <Switch data-testid="switch-modo-dev" />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Backup Automático</Label>
                <p className="text-sm text-muted-foreground">
                  Crear copias de seguridad diarias
                </p>
              </div>
              <Switch defaultChecked data-testid="switch-backup" />
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>Zona Horaria</Label>
              <Input defaultValue="Europe/Madrid" readOnly />
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end gap-4">
          <Button variant="outline">Cancelar</Button>
          <Button onClick={handleGuardarCambios} data-testid="button-guardar-config">
            <Settings className="w-4 h-4 mr-2" />
            Guardar Cambios
          </Button>
        </div>
      </div>
    </div>
  );
}
