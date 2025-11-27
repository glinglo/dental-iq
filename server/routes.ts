import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCampanaSchema, insertCitaSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // ============= PACIENTES =============
  
  // Obtener todos los pacientes
  app.get("/api/pacientes", async (req, res) => {
    try {
      const pacientes = await storage.getPacientes();
      res.json(pacientes);
    } catch (error) {
      res.status(500).json({ error: "Error al obtener pacientes" });
    }
  });

  // Calcular pacientes perdidos
  app.post("/api/pacientes/calcular-perdidos", async (req, res) => {
    try {
      const resultado = await storage.calcularPacientesPerdidos();
      res.json(resultado);
    } catch (error) {
      res.status(500).json({ error: "Error al calcular pacientes perdidos" });
    }
  });

  // Obtener pacientes perdidos con filtros
  app.post("/api/pacientes/perdidos", async (req, res) => {
    try {
      const filtrosSchema = z.object({
        prioridad: z.enum(["Alta", "Media", "Baja", "Todas"]).optional(),
        diagnostico: z.string().optional(),
        edadMin: z.number().optional(),
        edadMax: z.number().optional(),
      });
      const filtros = filtrosSchema.parse(req.body);
      const pacientes = await storage.getPacientesPerdidos(filtros);
      res.json(pacientes);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Filtros inválidos", details: error.errors });
      } else {
        res.status(500).json({ error: "Error al obtener pacientes perdidos" });
      }
    }
  });

  // Añadir pacientes a campaña
  app.post("/api/pacientes/anadir-a-campana", async (req, res) => {
    try {
      const schema = z.object({
        pacienteIds: z.array(z.string()),
      });
      const { pacienteIds } = schema.parse(req.body);
      await storage.anadirPacientesACampana(pacienteIds);
      res.json({ success: true, count: pacienteIds.length });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Datos inválidos", details: error.errors });
      } else {
        res.status(500).json({ error: "Error al añadir pacientes a campaña" });
      }
    }
  });

  // ============= CAMPAÑAS =============
  
  // Obtener todas las campañas
  app.get("/api/campanas", async (req, res) => {
    try {
      const campanas = await storage.getCampanas();
      res.json(campanas);
    } catch (error) {
      res.status(500).json({ error: "Error al obtener campañas" });
    }
  });

  // Crear una nueva campaña
  app.post("/api/campanas", async (req, res) => {
    try {
      const campanaData = insertCampanaSchema.parse(req.body);
      const campana = await storage.createCampana(campanaData);
      res.status(201).json(campana);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Datos inválidos", details: error.errors });
      } else {
        res.status(500).json({ error: "Error al crear campaña" });
      }
    }
  });

  // Actualizar estado de campaña
  app.patch("/api/campanas/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const schema = z.object({
        estado: z.string(),
      });
      const { estado } = schema.parse(req.body);
      const campana = await storage.updateCampanaEstado(id, estado);
      
      if (!campana) {
        res.status(404).json({ error: "Campaña no encontrada" });
        return;
      }
      
      res.json(campana);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Datos inválidos", details: error.errors });
      } else {
        res.status(500).json({ error: "Error al actualizar campaña" });
      }
    }
  });

  // ============= TAREAS DE LLAMADAS =============
  
  // Obtener todas las tareas
  app.get("/api/tareas", async (req, res) => {
    try {
      const tareas = await storage.getTareas();
      res.json(tareas);
    } catch (error) {
      res.status(500).json({ error: "Error al obtener tareas" });
    }
  });

  // Actualizar estado de tarea
  app.patch("/api/tareas/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const schema = z.object({
        estado: z.string(),
        notas: z.string().optional(),
      });
      const { estado, notas } = schema.parse(req.body);
      const tarea = await storage.updateTareaEstado(id, estado, notas);
      
      if (!tarea) {
        res.status(404).json({ error: "Tarea no encontrada" });
        return;
      }
      
      res.json(tarea);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Datos inválidos", details: error.errors });
      } else {
        res.status(500).json({ error: "Error al actualizar tarea" });
      }
    }
  });

  // ============= DASHBOARD =============
  
  // Obtener KPIs del dashboard
  app.get("/api/dashboard/kpis", async (req, res) => {
    try {
      const kpis = await storage.getDashboardKPIs();
      res.json(kpis);
    } catch (error) {
      res.status(500).json({ error: "Error al obtener KPIs" });
    }
  });

  // Obtener conversión por canal
  app.get("/api/dashboard/conversion-canal", async (req, res) => {
    try {
      const conversion = await storage.getConversionPorCanal();
      res.json(conversion);
    } catch (error) {
      res.status(500).json({ error: "Error al obtener conversión por canal" });
    }
  });

  // ============= CONVERSACIONES =============
  
  // Obtener todas las conversaciones
  app.get("/api/conversaciones", async (req, res) => {
    try {
      const conversaciones = await storage.getConversaciones();
      res.json(conversaciones);
    } catch (error) {
      res.status(500).json({ error: "Error al obtener conversaciones" });
    }
  });

  // Obtener una conversación con sus mensajes
  app.get("/api/conversaciones/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const conversacion = await storage.getConversacion(id);
      
      if (!conversacion) {
        res.status(404).json({ error: "Conversación no encontrada" });
        return;
      }
      
      const mensajes = await storage.getMensajes(id);
      res.json({ conversacion, mensajes });
    } catch (error) {
      res.status(500).json({ error: "Error al obtener conversación" });
    }
  });

  // Enviar un mensaje en una conversación
  app.post("/api/conversaciones/:id/mensajes", async (req, res) => {
    try {
      const { id } = req.params;
      const schema = z.object({
        contenido: z.string().min(1),
      });
      const { contenido } = schema.parse(req.body);
      
      const mensaje = await storage.createMensaje({
        conversacionId: id,
        contenido,
        direccion: "saliente",
        fechaEnvio: new Date(),
        leido: true,
      });
      
      res.status(201).json(mensaje);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Contenido inválido", details: error.errors });
      } else {
        res.status(500).json({ error: "Error al enviar mensaje" });
      }
    }
  });

  // Marcar conversación como leída
  app.patch("/api/conversaciones/:id/leer", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.marcarComoLeido(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Error al marcar como leída" });
    }
  });

  // Obtener conteo de conversaciones sin leer
  app.get("/api/conversaciones/sin-leer/count", async (req, res) => {
    try {
      const count = await storage.getConversacionesSinLeerCount();
      res.json({ count });
    } catch (error) {
      res.status(500).json({ error: "Error al obtener conteo" });
    }
  });

  // ============= CITAS =============
  
  // Obtener todas las citas
  app.get("/api/citas", async (req, res) => {
    try {
      const citas = await storage.getCitas();
      res.json(citas);
    } catch (error) {
      res.status(500).json({ error: "Error al obtener citas" });
    }
  });

  // Obtener citas por semana
  app.get("/api/citas/semana", async (req, res) => {
    try {
      const { inicio, fin } = req.query;
      if (!inicio || !fin) {
        res.status(400).json({ error: "Se requieren las fechas inicio y fin" });
        return;
      }
      const citas = await storage.getCitasPorSemana(new Date(inicio as string), new Date(fin as string));
      res.json(citas);
    } catch (error) {
      res.status(500).json({ error: "Error al obtener citas de la semana" });
    }
  });

  // Obtener una cita por ID
  app.get("/api/citas/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const cita = await storage.getCita(id);
      
      if (!cita) {
        res.status(404).json({ error: "Cita no encontrada" });
        return;
      }
      
      res.json(cita);
    } catch (error) {
      res.status(500).json({ error: "Error al obtener cita" });
    }
  });

  // Crear una nueva cita
  app.post("/api/citas", async (req, res) => {
    try {
      const citaData = insertCitaSchema.parse(req.body);
      const cita = await storage.createCita(citaData);
      res.status(201).json(cita);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Datos inválidos", details: error.errors });
      } else {
        res.status(500).json({ error: "Error al crear cita" });
      }
    }
  });

  // Actualizar estado de cita
  app.patch("/api/citas/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const schema = z.object({
        estado: z.string(),
      });
      const { estado } = schema.parse(req.body);
      const cita = await storage.updateCitaEstado(id, estado);
      
      if (!cita) {
        res.status(404).json({ error: "Cita no encontrada" });
        return;
      }
      
      res.json(cita);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Datos inválidos", details: error.errors });
      } else {
        res.status(500).json({ error: "Error al actualizar cita" });
      }
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
