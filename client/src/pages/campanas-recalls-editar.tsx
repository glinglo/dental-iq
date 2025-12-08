import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Edit, Settings } from "lucide-react";
import { ReglasComunicacionDialog } from "@/components/reglas-comunicacion-dialog";
import type { ReglaComunicacion } from "@shared/schema";

export default function CampanasRecallsEditar() {
  const [, setLocation] = useLocation();
  const [campanaSeleccionada, setCampanaSeleccionada] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Obtener reglas de comunicación de tipo recall
  const { data: reglas = [], isLoading } = useQuery<ReglaComunicacion[]>({
    queryKey: ["/api/reglas-comunicacion"],
  });

  const reglasRecall = reglas.filter(r => r.tipo === "recall_paciente");

  const handleEditarCampana = (reglaId: string) => {
    setCampanaSeleccionada(reglaId);
    setDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex-1 overflow-auto flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Cargando campañas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation("/campañas/recalls")}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-semibold text-foreground">Editar Campañas de Recall</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Selecciona una campaña para editar su secuencia y criterios
              </p>
            </div>
          </div>
        </div>

        {/* Lista de campañas */}
        <Card>
          <CardHeader>
            <CardTitle>Campañas de Recall ({reglasRecall.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {reglasRecall.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No hay campañas de recall configuradas. Crea una nueva campaña desde la página principal.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Pasos</TableHead>
                    <TableHead>Criterios</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reglasRecall.map((regla) => {
                    const pasos = (regla.secuencia as any[]) || [];
                    const criterios = regla.criterios as any;
                    
                    return (
                      <TableRow key={regla.id}>
                        <TableCell>
                          <div className="font-medium">{regla.nombre}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={regla.activa ? "default" : "secondary"}>
                            {regla.activa ? "Activa" : "Inactiva"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-muted-foreground">
                            {pasos.length} pasos
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-muted-foreground">
                            {criterios?.diagnosticos?.length > 0 ? (
                              <div>
                                {criterios.diagnosticos.length} diagnóstico(s)
                              </div>
                            ) : (
                              <div>Sin criterios específicos</div>
                            )}
                            {criterios?.mesesSinVisitaMin && (
                              <div className="text-xs mt-1">
                                {criterios.mesesSinVisitaMin}-{criterios.mesesSinVisitaMax || "∞"} meses sin visita
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditarCampana(regla.id)}
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Editar
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Dialog de edición */}
        {dialogOpen && campanaSeleccionada && (
          <ReglasComunicacionDialog
            tipo="recall_paciente"
            titulo="Editar Campaña de Recall"
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            reglaId={campanaSeleccionada}
          />
        )}
      </div>
    </div>
  );
}

