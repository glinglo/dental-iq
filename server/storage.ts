import type { 
  Paciente, 
  InsertPaciente, 
  Campana, 
  InsertCampana,
  TareaLlamada,
  InsertTareaLlamada,
  DashboardKPIs,
  ConversionPorCanal,
  FiltrosSegmentacion,
  Conversacion,
  InsertConversacion,
  ConversacionConPaciente,
  Mensaje,
  InsertMensaje
} from "@shared/schema";
import { randomUUID } from "crypto";
import { generarPacientesMock, generarCampanasMock, generarTareasLlamadasMock, generarConversacionesMock } from "./mockData";

export interface IStorage {
  // Pacientes
  getPacientes(): Promise<Paciente[]>;
  getPaciente(id: string): Promise<Paciente | undefined>;
  getPacientesPerdidos(filtros?: FiltrosSegmentacion): Promise<Paciente[]>;
  calcularPacientesPerdidos(): Promise<{ total: number; pacientes: Paciente[] }>;
  anadirPacientesACampana(pacienteIds: string[]): Promise<void>;
  
  // Campañas
  getCampanas(): Promise<Campana[]>;
  getCampana(id: string): Promise<Campana | undefined>;
  createCampana(campana: InsertCampana): Promise<Campana>;
  updateCampanaEstado(id: string, estado: string): Promise<Campana | undefined>;
  
  // Tareas de llamadas
  getTareas(): Promise<TareaLlamada[]>;
  getTarea(id: string): Promise<TareaLlamada | undefined>;
  updateTareaEstado(id: string, estado: string, notas?: string): Promise<TareaLlamada | undefined>;
  
  // Dashboard
  getDashboardKPIs(): Promise<DashboardKPIs>;
  getConversionPorCanal(): Promise<ConversionPorCanal[]>;
  
  // Conversaciones
  getConversaciones(): Promise<ConversacionConPaciente[]>;
  getConversacion(id: string): Promise<ConversacionConPaciente | undefined>;
  getMensajes(conversacionId: string): Promise<Mensaje[]>;
  createMensaje(mensaje: InsertMensaje): Promise<Mensaje>;
  marcarComoLeido(conversacionId: string): Promise<void>;
  getConversacionesSinLeerCount(): Promise<number>;
}

export class MemStorage implements IStorage {
  private pacientes: Map<string, Paciente>;
  private campanas: Map<string, Campana>;
  private tareas: Map<string, TareaLlamada>;
  private conversaciones: Map<string, Conversacion>;
  private mensajes: Map<string, Mensaje>;

  constructor() {
    this.pacientes = new Map();
    this.campanas = new Map();
    this.tareas = new Map();
    this.conversaciones = new Map();
    this.mensajes = new Map();
    
    // Inicializar con mock data
    this.inicializarMockData();
  }

  private inicializarMockData() {
    // Generar y cargar pacientes
    const pacientes = generarPacientesMock();
    pacientes.forEach((paciente: Paciente) => {
      this.pacientes.set(paciente.id, paciente);
    });
    
    // Generar y cargar campañas
    const campanas = generarCampanasMock();
    campanas.forEach((campana: Campana) => {
      this.campanas.set(campana.id, campana);
    });
    
    // Generar y cargar tareas
    const tareas = generarTareasLlamadasMock(pacientes);
    tareas.forEach((tarea: TareaLlamada) => {
      this.tareas.set(tarea.id, tarea);
    });
    
    // Generar y cargar conversaciones y mensajes
    const { conversaciones, mensajes } = generarConversacionesMock(pacientes);
    conversaciones.forEach((conversacion: Conversacion) => {
      this.conversaciones.set(conversacion.id, conversacion);
    });
    mensajes.forEach((mensaje: Mensaje) => {
      this.mensajes.set(mensaje.id, mensaje);
    });
  }

  // Pacientes
  async getPacientes(): Promise<Paciente[]> {
    return Array.from(this.pacientes.values());
  }

  async getPaciente(id: string): Promise<Paciente | undefined> {
    return this.pacientes.get(id);
  }

  async getPacientesPerdidos(filtros?: FiltrosSegmentacion): Promise<Paciente[]> {
    let pacientes = Array.from(this.pacientes.values()).filter(p => p.estado === "perdido");
    
    if (!filtros) return pacientes;
    
    // Aplicar filtros
    if (filtros.prioridad && filtros.prioridad !== "Todas") {
      pacientes = pacientes.filter(p => p.prioridad === filtros.prioridad);
    }
    
    if (filtros.diagnostico) {
      pacientes = pacientes.filter(p => p.diagnostico === filtros.diagnostico);
    }
    
    if (filtros.edadMin !== undefined) {
      pacientes = pacientes.filter(p => p.edad >= filtros.edadMin!);
    }
    
    if (filtros.edadMax !== undefined) {
      pacientes = pacientes.filter(p => p.edad <= filtros.edadMax!);
    }
    
    return pacientes;
  }

  async calcularPacientesPerdidos(): Promise<{ total: number; pacientes: Paciente[] }> {
    const ahora = new Date();
    const pacientes = Array.from(this.pacientes.values());
    
    pacientes.forEach(paciente => {
      // Calcular meses sin visita
      const diffTime = Math.abs(ahora.getTime() - paciente.ultimaVisita.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const mesesSinVisita = Math.floor(diffDays / 30);
      paciente.mesesSinVisita = mesesSinVisita;
      
      // Determinar estado
      if (mesesSinVisita > 6 && !paciente.tieneCitaFutura) {
        paciente.estado = "perdido";
        
        // Calcular prioridad
        if (mesesSinVisita > 12) {
          paciente.prioridad = "Alta";
        } else if (mesesSinVisita >= 6) {
          paciente.prioridad = "Media";
        } else {
          paciente.prioridad = "Baja";
        }
      } else if (paciente.tieneCitaFutura) {
        paciente.estado = "activo";
        paciente.prioridad = null;
      } else {
        paciente.estado = "sin cita";
        paciente.prioridad = null;
      }
      
      this.pacientes.set(paciente.id, paciente);
    });
    
    const perdidos = pacientes.filter(p => p.estado === "perdido");
    return { total: perdidos.length, pacientes: perdidos };
  }

  async anadirPacientesACampana(pacienteIds: string[]): Promise<void> {
    pacienteIds.forEach(id => {
      const paciente = this.pacientes.get(id);
      if (paciente) {
        paciente.enCampana = true;
        this.pacientes.set(id, paciente);
      }
    });
  }

  // Campañas
  async getCampanas(): Promise<Campana[]> {
    return Array.from(this.campanas.values()).sort((a, b) => 
      b.fechaCreacion.getTime() - a.fechaCreacion.getTime()
    );
  }

  async getCampana(id: string): Promise<Campana | undefined> {
    return this.campanas.get(id);
  }

  async createCampana(insertCampana: InsertCampana): Promise<Campana> {
    const id = randomUUID();
    const campana: Campana = {
      ...insertCampana,
      id,
      fechaCreacion: new Date(),
      pacientesIncluidos: 0,
      contactosEnviados: 0,
      citasGeneradas: 0,
    };
    this.campanas.set(id, campana);
    return campana;
  }

  async updateCampanaEstado(id: string, estado: string): Promise<Campana | undefined> {
    const campana = this.campanas.get(id);
    if (campana) {
      campana.estado = estado;
      this.campanas.set(id, campana);
    }
    return campana;
  }

  // Tareas de llamadas
  async getTareas(): Promise<TareaLlamada[]> {
    return Array.from(this.tareas.values()).sort((a, b) => {
      const prioridadOrden = { "Alta": 0, "Media": 1, "Baja": 2 };
      const prioA = prioridadOrden[a.prioridad as keyof typeof prioridadOrden];
      const prioB = prioridadOrden[b.prioridad as keyof typeof prioridadOrden];
      return prioA - prioB;
    });
  }

  async getTarea(id: string): Promise<TareaLlamada | undefined> {
    return this.tareas.get(id);
  }

  async updateTareaEstado(id: string, estado: string, notas?: string): Promise<TareaLlamada | undefined> {
    const tarea = this.tareas.get(id);
    if (tarea) {
      tarea.estado = estado;
      if (estado === "contactado" || estado === "cita_agendada") {
        tarea.fechaContacto = new Date();
      }
      if (notas) {
        tarea.notas = notas;
      }
      this.tareas.set(id, tarea);
    }
    return tarea;
  }

  // Dashboard
  async getDashboardKPIs(): Promise<DashboardKPIs> {
    const pacientes = Array.from(this.pacientes.values());
    const campanas = Array.from(this.campanas.values());
    const tareas = Array.from(this.tareas.values());
    
    const pacientesPerdidos = pacientes.filter(p => p.estado === "perdido").length;
    const pacientesEnCampanas = pacientes.filter(p => p.enCampana).length;
    const contactosEnviados = campanas.reduce((sum, c) => sum + (c.contactosEnviados || 0), 0);
    const citasGeneradas = campanas.reduce((sum, c) => sum + (c.citasGeneradas || 0), 0) + 
                           tareas.filter(t => t.estado === "cita_agendada").length;
    const tasaConversion = contactosEnviados > 0 ? (citasGeneradas / contactosEnviados) * 100 : 0;
    const roiEstimado = 5.4;
    
    return {
      pacientesPerdidos,
      pacientesEnCampanas,
      contactosEnviados,
      citasGeneradas,
      tasaConversion,
      roiEstimado,
    };
  }

  async getConversionPorCanal(): Promise<ConversionPorCanal[]> {
    return [
      { canal: "Llamadas del staff", conversion: 14, contactos: 100, citas: 14 },
      { canal: "SMS", conversion: 7, contactos: 150, citas: 11 },
      { canal: "Email", conversion: 7, contactos: 90, citas: 6 },
    ];
  }

  // Conversaciones
  async getConversaciones(): Promise<ConversacionConPaciente[]> {
    const conversaciones = Array.from(this.conversaciones.values());
    return conversaciones
      .map(conv => {
        const paciente = this.pacientes.get(conv.pacienteId);
        if (!paciente) return null;
        return {
          ...conv,
          pacienteNombre: paciente.nombre,
          pacienteTelefono: paciente.telefono,
          pacienteEmail: paciente.email,
        };
      })
      .filter((c): c is ConversacionConPaciente => c !== null)
      .sort((a, b) => {
        const fechaA = a.fechaUltimoMensaje?.getTime() || 0;
        const fechaB = b.fechaUltimoMensaje?.getTime() || 0;
        return fechaB - fechaA;
      });
  }

  async getConversacion(id: string): Promise<ConversacionConPaciente | undefined> {
    const conv = this.conversaciones.get(id);
    if (!conv) return undefined;
    
    const paciente = this.pacientes.get(conv.pacienteId);
    if (!paciente) return undefined;
    
    return {
      ...conv,
      pacienteNombre: paciente.nombre,
      pacienteTelefono: paciente.telefono,
      pacienteEmail: paciente.email,
    };
  }

  async getMensajes(conversacionId: string): Promise<Mensaje[]> {
    return Array.from(this.mensajes.values())
      .filter(m => m.conversacionId === conversacionId)
      .sort((a, b) => a.fechaEnvio.getTime() - b.fechaEnvio.getTime());
  }

  async createMensaje(insertMensaje: InsertMensaje): Promise<Mensaje> {
    const id = randomUUID();
    const mensaje: Mensaje = {
      ...insertMensaje,
      id,
      leido: insertMensaje.direccion === "saliente" ? true : false,
    };
    this.mensajes.set(id, mensaje);
    
    // Actualizar ultimo mensaje de la conversación
    const conv = this.conversaciones.get(insertMensaje.conversacionId);
    if (conv) {
      conv.ultimoMensaje = insertMensaje.contenido;
      conv.fechaUltimoMensaje = insertMensaje.fechaEnvio;
      if (insertMensaje.direccion === "entrante") {
        conv.noLeidos = (conv.noLeidos || 0) + 1;
      }
      this.conversaciones.set(conv.id, conv);
    }
    
    return mensaje;
  }

  async marcarComoLeido(conversacionId: string): Promise<void> {
    const conv = this.conversaciones.get(conversacionId);
    if (conv) {
      conv.noLeidos = 0;
      this.conversaciones.set(conv.id, conv);
    }
    
    // Marcar todos los mensajes como leídos
    const mensajes = Array.from(this.mensajes.values())
      .filter(m => m.conversacionId === conversacionId);
    mensajes.forEach(m => {
      m.leido = true;
      this.mensajes.set(m.id, m);
    });
  }

  async getConversacionesSinLeerCount(): Promise<number> {
    return Array.from(this.conversaciones.values())
      .filter(c => (c.noLeidos || 0) > 0)
      .length;
  }
}

export const storage = new MemStorage();
