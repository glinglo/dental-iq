import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { format, formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { MessageCircle, Mail, Smartphone, Search, Send, ArrowLeft } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { ConversacionConPaciente, Mensaje } from "@shared/schema";

const canalConfig = {
  whatsapp: { 
    icon: SiWhatsapp, 
    color: "text-green-600", 
    bgBadge: "bg-green-100 text-green-700",
    label: "WhatsApp" 
  },
  sms: { 
    icon: Smartphone, 
    color: "text-blue-600", 
    bgBadge: "bg-blue-100 text-blue-700",
    label: "SMS" 
  },
  email: { 
    icon: Mail, 
    color: "text-gray-600", 
    bgBadge: "bg-gray-100 text-gray-700",
    label: "Email" 
  },
};

function ConversacionItem({ 
  conversacion, 
  isSelected, 
  onClick 
}: { 
  conversacion: ConversacionConPaciente; 
  isSelected: boolean; 
  onClick: () => void;
}) {
  const canal = canalConfig[conversacion.canal as keyof typeof canalConfig];
  const Icon = canal.icon;
  const initials = conversacion.pacienteNombre
    .split(" ")
    .slice(0, 2)
    .map(n => n[0])
    .join("")
    .toUpperCase();

  return (
    <button
      onClick={onClick}
      className={`w-full p-3 text-left border-b border-border transition-colors hover-elevate ${
        isSelected ? "bg-muted" : ""
      }`}
      data-testid={`conversation-item-${conversacion.id}`}
    >
      <div className="flex items-start gap-3">
        <div className="relative">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary/10 text-primary text-sm">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className={`absolute -bottom-0.5 -right-0.5 p-0.5 rounded-full bg-background`}>
            <Icon className={`w-3 h-3 ${canal.color}`} />
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="font-medium text-sm truncate">
              {conversacion.pacienteNombre}
            </span>
            {(conversacion.noLeidos ?? 0) > 0 && (
              <Badge variant="default" className="h-5 min-w-5 px-1.5 text-xs">
                {conversacion.noLeidos}
              </Badge>
            )}
          </div>
          
          <p className="text-xs text-muted-foreground truncate mt-0.5">
            {conversacion.ultimoMensaje}
          </p>
          
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-muted-foreground">
              {conversacion.fechaUltimoMensaje && 
                formatDistanceToNow(new Date(conversacion.fechaUltimoMensaje), { 
                  addSuffix: true, 
                  locale: es 
                })
              }
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}

function ChatMessage({ mensaje, canal }: { mensaje: Mensaje; canal: string }) {
  const esEntrante = mensaje.direccion === "entrante";
  
  return (
    <div className={`flex ${esEntrante ? "justify-start" : "justify-end"} mb-3`}>
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
          esEntrante 
            ? "bg-muted text-foreground rounded-bl-md" 
            : "bg-primary text-primary-foreground rounded-br-md"
        }`}
      >
        <p className="text-sm whitespace-pre-wrap">{mensaje.contenido}</p>
        <p className={`text-xs mt-1 ${esEntrante ? "text-muted-foreground" : "text-primary-foreground/70"}`}>
          {format(new Date(mensaje.fechaEnvio), "HH:mm", { locale: es })}
        </p>
      </div>
    </div>
  );
}

export default function Conversaciones() {
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [nuevoMensaje, setNuevoMensaje] = useState("");
  const [showMobileChat, setShowMobileChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { data: conversaciones, isLoading: loadingConversaciones } = useQuery<ConversacionConPaciente[]>({
    queryKey: ["/api/conversaciones"],
  });

  const { data: chatData, isLoading: loadingChat } = useQuery<{ 
    conversacion: ConversacionConPaciente; 
    mensajes: Mensaje[] 
  }>({
    queryKey: ["/api/conversaciones", selectedConvId],
    enabled: !!selectedConvId,
  });

  const enviarMensajeMutation = useMutation({
    mutationFn: async (contenido: string) => {
      return apiRequest("POST", `/api/conversaciones/${selectedConvId}/mensajes`, { contenido });
    },
    onSuccess: () => {
      setNuevoMensaje("");
      queryClient.invalidateQueries({ queryKey: ["/api/conversaciones", selectedConvId] });
      queryClient.invalidateQueries({ queryKey: ["/api/conversaciones"] });
    },
  });

  const marcarLeidoMutation = useMutation({
    mutationFn: async (convId: string) => {
      return apiRequest("PATCH", `/api/conversaciones/${convId}/leer`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversaciones"] });
      queryClient.invalidateQueries({ queryKey: ["/api/conversaciones/sin-leer/count"] });
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatData?.mensajes]);

  useEffect(() => {
    if (selectedConvId && chatData?.conversacion.noLeidos && chatData.conversacion.noLeidos > 0) {
      marcarLeidoMutation.mutate(selectedConvId);
    }
  }, [selectedConvId, chatData?.conversacion.noLeidos]);

  const handleSelectConversacion = (convId: string) => {
    setSelectedConvId(convId);
    setShowMobileChat(true);
  };

  const handleEnviarMensaje = () => {
    if (nuevoMensaje.trim() && selectedConvId) {
      enviarMensajeMutation.mutate(nuevoMensaje.trim());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleEnviarMensaje();
    }
  };

  const conversacionesFiltradas = conversaciones?.filter(conv =>
    conv.pacienteNombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.ultimoMensaje?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedConv = chatData?.conversacion;
  const selectedCanal = selectedConv ? canalConfig[selectedConv.canal as keyof typeof canalConfig] : null;

  return (
    <div className="flex h-full overflow-hidden">
      {/* Lista de conversaciones (sidebar) */}
      <div className={`w-full md:w-80 lg:w-96 border-r border-border bg-background flex flex-col ${showMobileChat ? "hidden md:flex" : "flex"}`}>
        {/* Header del sidebar */}
        <div className="p-4 border-b border-border">
          <h1 className="text-xl font-semibold mb-3">Conversaciones</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar conversaciones..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
              data-testid="input-buscar-conversaciones"
            />
          </div>
        </div>

        {/* Lista de conversaciones */}
        <ScrollArea className="flex-1">
          {loadingConversaciones ? (
            <div className="p-4 space-y-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                </div>
              ))}
            </div>
          ) : conversacionesFiltradas && conversacionesFiltradas.length > 0 ? (
            conversacionesFiltradas.map((conv) => (
              <ConversacionItem
                key={conv.id}
                conversacion={conv}
                isSelected={selectedConvId === conv.id}
                onClick={() => handleSelectConversacion(conv.id)}
              />
            ))
          ) : (
            <div className="p-8 text-center">
              <MessageCircle className="w-12 h-12 mx-auto text-muted-foreground/40 mb-3" />
              <p className="text-muted-foreground">No hay conversaciones</p>
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Panel de chat */}
      <div className={`flex-1 flex flex-col bg-muted/30 ${!showMobileChat ? "hidden md:flex" : "flex"}`}>
        {selectedConv && selectedCanal ? (
          <>
            {/* Header del chat */}
            <div className="p-4 border-b border-border bg-background flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setShowMobileChat(false)}
                data-testid="button-volver-lista"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary/10 text-primary">
                  {selectedConv.pacienteNombre.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <h2 className="font-semibold" data-testid="text-nombre-paciente">
                  {selectedConv.pacienteNombre}
                </h2>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Badge variant="secondary" className={`text-xs ${selectedCanal.bgBadge}`}>
                    <selectedCanal.icon className="w-3 h-3 mr-1" />
                    {selectedCanal.label}
                  </Badge>
                  <span>{selectedConv.pacienteTelefono}</span>
                </div>
              </div>
            </div>

            {/* Mensajes */}
            <ScrollArea className="flex-1 p-4">
              {loadingChat ? (
                <div className="space-y-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className={`flex ${i % 2 === 0 ? "justify-start" : "justify-end"}`}>
                      <Skeleton className={`h-16 ${i % 2 === 0 ? "w-48" : "w-56"} rounded-2xl`} />
                    </div>
                  ))}
                </div>
              ) : chatData?.mensajes && chatData.mensajes.length > 0 ? (
                <div>
                  {chatData.mensajes.map((mensaje) => (
                    <ChatMessage 
                      key={mensaje.id} 
                      mensaje={mensaje} 
                      canal={selectedConv.canal} 
                    />
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">No hay mensajes</p>
                </div>
              )}
            </ScrollArea>

            {/* Input de mensaje */}
            <div className="p-4 border-t border-border bg-background">
              <div className="flex items-end gap-2">
                <Input
                  placeholder={`Escribir mensaje por ${selectedCanal.label}...`}
                  value={nuevoMensaje}
                  onChange={(e) => setNuevoMensaje(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className="flex-1"
                  data-testid="input-nuevo-mensaje"
                />
                <Button
                  onClick={handleEnviarMensaje}
                  disabled={!nuevoMensaje.trim() || enviarMensajeMutation.isPending}
                  data-testid="button-enviar-mensaje"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-1">
                Selecciona una conversación
              </h3>
              <p className="text-sm text-muted-foreground">
                Elige una conversación de la lista para ver los mensajes
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
