import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Bell, Mail } from "lucide-react";
import Citas from "./citas";
import PacientesRecordatorios from "./pacientes-recordatorios";
import PacientesPostVisita from "./pacientes-post-visita";

export default function CitasMain() {
  const [location, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("agenda");

  // Sincronizar el tab activo con la URL
  useEffect(() => {
    if (location === "/citas") {
      setActiveTab("agenda");
    } else if (location === "/citas/recordatorios") {
      setActiveTab("recordatorios");
    } else if (location === "/citas/post-visita") {
      setActiveTab("post-visita");
    }
  }, [location]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value === "agenda") {
      setLocation("/citas");
    } else if (value === "recordatorios") {
      setLocation("/citas/recordatorios");
    } else if (value === "post-visita") {
      setLocation("/citas/post-visita");
    }
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-semibold text-foreground">Citas</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gestión de agenda, recordatorios y mensajes post-visita
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList>
            <TabsTrigger value="agenda">
              <Calendar className="w-4 h-4 mr-2" />
              Agenda
            </TabsTrigger>
            <TabsTrigger value="recordatorios">
              <Bell className="w-4 h-4 mr-2" />
              Recordatorios
            </TabsTrigger>
            <TabsTrigger value="post-visita">
              <Mail className="w-4 h-4 mr-2" />
              Mensajes Post-Visita
            </TabsTrigger>
          </TabsList>

          <TabsContent value="agenda" className="mt-6">
            <Citas />
          </TabsContent>

          <TabsContent value="recordatorios" className="mt-6">
            <PacientesRecordatorios />
          </TabsContent>

          <TabsContent value="post-visita" className="mt-6">
            <PacientesPostVisita />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
