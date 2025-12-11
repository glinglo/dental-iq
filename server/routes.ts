import type { Express } from "express";
import { createServer, type Server } from "http";
// Importar storage de forma lazy para evitar problemas en serverless
let _storage: any = null;
async function getStorage() {
  if (!_storage) {
    const module = await import("./storage");
    _storage = module.storage;
  }
  return _storage;
}
import { insertCampanaSchema, insertCitaSchema, insertRecordatorioSchema, type Cita } from "@shared/schema";
import { z } from "zod";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export async function registerRoutes(app: Express): Promise<Server> {
  // ============= PACIENTES =============
  
  // Obtener todos los pacientes
  app.get("/api/pacientes", async (req, res) => {
    try {
      console.log('[API] /api/pacientes called');
      const storage = await getStorage();
      await storage.ensureInitialized();
      const pacientes = await storage.getPacientes();
      console.log('[API] /api/pacientes returning', pacientes.length, 'pacientes');
      res.json(pacientes);
    } catch (error) {
      console.error('[API] Error in /api/pacientes:', error);
      if (error instanceof Error) {
        console.error('[API] Error message:', error.message);
        console.error('[API] Error stack:', error.stack);
      }
      const storage = await getStorage().catch(() => null);
      const pacientesCount = storage ? (await storage.getPacientes().catch(() => [])).length : 0;
      res.status(500).json({ 
        error: "Error al obtener pacientes", 
        details: error instanceof Error ? error.message : String(error),
        pacientesCount
      });
    }
  });

  // Calcular pacientes perdidos
  app.post("/api/pacientes/calcular-perdidos", async (req, res) => {
    try {
      await storage.ensureInitialized();
      const resultado = await storage.calcularPacientesPerdidos();
      res.json(resultado);
    } catch (error) {
      res.status(500).json({ error: "Error al calcular pacientes perdidos" });
    }
  });

  // Obtener pacientes perdidos con filtros
  app.post("/api/pacientes/perdidos", async (req, res) => {
    try {
      await storage.ensureInitialized();
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
      await storage.ensureInitialized();
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
      await storage.ensureInitialized();
      const tareas = await storage.getTareas();
      res.json(tareas);
    } catch (error) {
      res.status(500).json({ error: "Error al obtener tareas" });
    }
  });

  app.get("/api/tareas/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const tareas = await storage.getTareas();
      const tarea = tareas.find(t => t.id === id);
      if (!tarea) {
        return res.status(404).json({ error: "Tarea no encontrada" });
      }
      res.json(tarea);
    } catch (error) {
      res.status(500).json({ error: "Error al obtener tarea" });
    }
  });

  // Obtener tareas programadas para hoy
  app.get("/api/tareas/hoy", async (req, res) => {
    try {
      await storage.ensureInitialized();
      const tareas = await storage.getTareasParaHoy();
      res.json(tareas);
    } catch (error) {
      res.status(500).json({ error: "Error al obtener tareas para hoy" });
    }
  });

  // Actualizar tarea (estado, aprobación, fechas)
  app.patch("/api/tareas/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const schema = z.object({
        estado: z.string().optional(),
        notas: z.string().nullable().optional(),
        aprobado: z.boolean().optional(),
        fechaProgramada: z.string().nullable().optional(),
        fechaContacto: z.string().nullable().optional(),
        fechaCompletada: z.string().nullable().optional(),
      });
      const updates = schema.parse(req.body);
      const tarea = await storage.updateTarea(id, updates);
      
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
      await storage.ensureInitialized();
      const kpis = await storage.getDashboardKPIs();
      res.json(kpis);
    } catch (error) {
      console.error('[API] Error in /api/dashboard/kpis:', error);
      res.status(500).json({ error: "Error al obtener KPIs", details: error instanceof Error ? error.message : String(error) });
    }
  });

  // Obtener conversión por canal
  app.get("/api/dashboard/conversion-canal", async (req, res) => {
    try {
      await storage.ensureInitialized();
      const conversion = await storage.getConversionPorCanal();
      res.json(conversion);
    } catch (error) {
      console.error('[API] Error in /api/dashboard/conversion-canal:', error);
      res.status(500).json({ error: "Error al obtener conversión por canal", details: error instanceof Error ? error.message : String(error) });
    }
  });

  // Obtener pacientes en riesgo (cerca de estar dormidos)
  app.get("/api/pacientes/en-riesgo", async (req, res) => {
    try {
      await storage.ensureInitialized();
      const pacientes = await storage.getPacientesEnRiesgo();
      res.json(pacientes);
    } catch (error) {
      console.error('[API] Error in /api/pacientes/en-riesgo:', error);
      if (error instanceof Error) {
        console.error('[API] Error message:', error.message);
        console.error('[API] Error stack:', error.stack);
      }
      res.status(500).json({ error: "Error al obtener pacientes en riesgo", details: error instanceof Error ? error.message : String(error) });
    }
  });

  // Obtener pacientes listos para añadir a una campaña específica
  app.get("/api/pacientes/listos-campana/:campanaId", async (req, res) => {
    try {
      const { campanaId } = req.params;
      const pacientes = await storage.getPacientesListosParaCampana(campanaId);
      res.json(pacientes);
    } catch (error) {
      res.status(500).json({ error: "Error al obtener pacientes listos para campaña" });
    }
  });

  // ============= CONVERSACIONES =============
  
  // Obtener todas las conversaciones
  app.get("/api/conversaciones", async (req, res) => {
    try {
      await storage.ensureInitialized();
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
        type: "mensaje",
        channel: "whatsapp",
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
      await storage.ensureInitialized();
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
      await storage.ensureInitialized();
      const citas = await storage.getCitas();
      res.json(citas);
    } catch (error) {
      res.status(500).json({ error: "Error al obtener citas" });
    }
  });

  // Obtener citas por semana
  app.get("/api/citas/semana", async (req, res) => {
    try {
      await storage.ensureInitialized();
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

  // Detectar huecos libres en la agenda
  // Usamos /api/huecos-libres en lugar de /api/citas/huecos-libres para evitar conflictos con /api/citas/:id
  app.get("/api/huecos-libres", async (req, res) => {
    try {
      const { inicio, fin, duracionMinutos } = req.query;
      if (!inicio || !fin) {
        res.status(400).json({ error: "Se requieren las fechas inicio y fin" });
        return;
      }
      
      const fechaInicio = new Date(inicio as string);
      const fechaFin = new Date(fin as string);
      
      if (isNaN(fechaInicio.getTime()) || isNaN(fechaFin.getTime())) {
        res.status(400).json({ error: "Fechas inválidas. Formato esperado: ISO 8601" });
        return;
      }
      
      if (fechaInicio > fechaFin) {
        res.status(400).json({ error: "La fecha de inicio debe ser anterior a la fecha de fin" });
        return;
      }
      
      const duracion = duracionMinutos ? parseInt(duracionMinutos as string) : 30;
      const huecos = await storage.detectarHuecosLibres(
        fechaInicio,
        fechaFin,
        duracion
      );
      res.json(huecos);
    } catch (error) {
      console.error("Error detectando huecos libres:", error);
      res.status(500).json({ 
        error: "Error al detectar huecos libres",
        details: error instanceof Error ? error.message : "Error desconocido"
      });
    }
  });

  // Sugerir pacientes para un hueco específico
  app.get("/api/citas/sugerir-pacientes", async (req, res) => {
    try {
      const { fecha, horaInicio, horaFin, limite } = req.query;
      if (!fecha || horaInicio === undefined || horaFin === undefined) {
        res.status(400).json({ error: "Se requieren fecha, horaInicio y horaFin" });
        return;
      }
      const sugerencias = await storage.sugerirPacientesParaHueco(
        new Date(fecha as string),
        parseInt(horaInicio as string),
        parseInt(horaFin as string),
        limite ? parseInt(limite as string) : 5
      );
      res.json(sugerencias);
    } catch (error) {
      console.error("Error sugiriendo pacientes:", error);
      res.status(500).json({ error: "Error al sugerir pacientes" });
    }
  });

  // Contactar pacientes para rellenar huecos
  app.post("/api/citas/contactar-pacientes-hueco", async (req, res) => {
    try {
      const schema = z.object({
        fecha: z.string(),
        horaInicio: z.number(),
        horaFin: z.number(),
        pacienteIds: z.array(z.string()),
        tipoCita: z.string().default("revision"),
      });
      const { fecha, horaInicio, horaFin, pacienteIds, tipoCita } = schema.parse(req.body);

      const resultados = [];
      const { generateMessageIA } = await import("./lib/openai");

      for (const pacienteId of pacienteIds) {
        const paciente = await storage.getPaciente(pacienteId);
        if (!paciente) continue;

        // Generar mensaje personalizado con IA
        const fechaHora = new Date(`${fecha}T${horaInicio.toString().padStart(2, "0")}:00`);
        const fechaFormateada = format(fechaHora, "yyyy-MM-dd", { locale: es });
        const horaFormateada = format(fechaHora, "HH:mm", { locale: es });
        const mensaje = await generateMessageIA({
          tipo: "contacto_hueco_libre",
          canal: paciente.whatsapp ? "whatsapp" : "sms",
          contexto: {
            paciente: {
              nombre: paciente.nombre,
              edad: paciente.edad,
            },
            cita: {
              fecha: fechaFormateada,
              hora: horaFormateada,
              tipo: tipoCita,
            },
            motivo: "Tenemos disponibilidad en este horario y pensamos en ti",
          },
        });

        // Crear acción de contacto
        await storage.createAccion({
          tipo: "contacto_hueco_libre",
          estado: "ejecutada",
          titulo: `Contacto para hueco libre - ${paciente.nombre}`,
          descripcion: `Hueco disponible el ${format(fechaHora, "dd/MM/yyyy HH:mm", { locale: es })}`,
          pacienteId: paciente.id,
          canal: paciente.whatsapp ? "whatsapp" : "sms",
          mensaje: mensaje || null,
          requiereConfirmacion: false,
          ejecutadaAt: new Date(),
          metadata: {
            fechaHueco: fechaHora.toISOString(),
            horaInicio,
            horaFin,
            tipoCita,
          },
        });

        resultados.push({
          pacienteId: paciente.id,
          pacienteNombre: paciente.nombre,
          mensajeEnviado: true,
        });
      }

      res.json({ resultados, total: resultados.length });
    } catch (error) {
      console.error("Error contactando pacientes:", error);
      res.status(500).json({ error: "Error al contactar pacientes" });
    }
  });

  // Obtener una cita por ID (DEBE estar después de todas las rutas específicas)
  app.get("/api/citas/:id", async (req, res) => {
    // Verificar que no sea una ruta específica (esto no debería pasar si las rutas están en orden correcto)
    const rutasEspecificas = ["sugerir-pacientes", "semana", "send-bulk-reminders"];
    if (rutasEspecificas.includes(req.params.id)) {
      console.log(`ADVERTENCIA: Ruta específica "${req.params.id}" capturada por /api/citas/:id`);
      res.status(404).json({ error: "Ruta no encontrada" });
      return;
    }
    
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

  // Actualizar estado de cita
  app.patch("/api/citas/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const schema = z.object({
        estado: z.string().optional(),
        fechaHora: z.string().optional(),
      });
      const data = schema.parse(req.body);
      
      let cita: Cita | undefined;
      
      if (data.estado) {
        cita = await storage.updateCitaEstado(id, data.estado);
      }
      
      if (data.fechaHora) {
        cita = await storage.updateCitaFechaHora(id, new Date(data.fechaHora));
      }
      
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

  // ============= RECORDATORIOS =============
  
  // Obtener todos los recordatorios
  app.get("/api/recordatorios", async (req, res) => {
    try {
      await storage.ensureInitialized();
      const recordatorios = await storage.getRecordatorios();
      res.json(recordatorios);
    } catch (error) {
      res.status(500).json({ error: "Error al obtener recordatorios" });
    }
  });

  // Crear un nuevo recordatorio
  app.post("/api/recordatorios", async (req, res) => {
    try {
      const recordatorioData = insertRecordatorioSchema.parse(req.body);
      const recordatorio = await storage.createRecordatorio(recordatorioData);
      res.status(201).json(recordatorio);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Datos inválidos", details: error.errors });
      } else {
        res.status(500).json({ error: "Error al crear recordatorio" });
      }
    }
  });

  // Actualizar un recordatorio
  app.patch("/api/recordatorios/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const recordatorio = await storage.updateRecordatorio(id, req.body);
      
      if (!recordatorio) {
        res.status(404).json({ error: "Recordatorio no encontrado" });
        return;
      }
      
      res.json(recordatorio);
    } catch (error) {
      res.status(500).json({ error: "Error al actualizar recordatorio" });
    }
  });

  // Eliminar un recordatorio
  app.delete("/api/recordatorios/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteRecordatorio(id);
      
      if (!deleted) {
        res.status(404).json({ error: "Recordatorio no encontrado" });
        return;
      }
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Error al eliminar recordatorio" });
    }
  });

  // ============= BUDGETS (LaFraise) =============
  
  // Obtener todos los presupuestos
  app.get("/api/budgets", async (req, res) => {
    try {
      console.log('[API] /api/budgets called');
      await storage.ensureInitialized();
      const budgets = await storage.getBudgets();
      console.log('[API] /api/budgets returning', budgets.length, 'budgets');
      res.json(budgets);
    } catch (error) {
      console.error('[API] Error in /api/budgets:', error);
      if (error instanceof Error) {
        console.error('[API] Error message:', error.message);
        console.error('[API] Error stack:', error.stack);
      }
      res.status(500).json({ 
        error: "Error al obtener presupuestos",
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Obtener un presupuesto por ID
  app.get("/api/budgets/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const budget = await storage.getBudget(id);
      
      if (!budget) {
        res.status(404).json({ error: "Presupuesto no encontrado" });
        return;
      }
      
      res.json(budget);
    } catch (error) {
      res.status(500).json({ error: "Error al obtener presupuesto" });
    }
  });
  
  // Obtener secuencia de comunicación de un presupuesto
  app.get("/api/budgets/:id/secuencia", async (req, res) => {
    try {
      const { id } = req.params;
      const secuencia = await storage.getSecuenciaComunicacionPorBudget(id);
      if (!secuencia) {
        res.status(404).json({ error: "Secuencia no encontrada" });
        return;
      }
      
      // Obtener la regla asociada para tener los pasos completos
      const regla = await storage.getReglaComunicacion(secuencia.reglaId);
      res.json({
        secuencia,
        regla,
      });
    } catch (error) {
      res.status(500).json({ error: "Error al obtener secuencia" });
    }
  });
  
  // Obtener touchpoints (acciones) de un presupuesto
  app.get("/api/budgets/:id/touchpoints", async (req, res) => {
    try {
      const { id } = req.params;
      const acciones = await storage.getAcciones({ tipo: "relance", limit: 100 });
      const touchpoints = acciones.filter(a => a.budgetId === id);
      res.json(touchpoints);
    } catch (error) {
      res.status(500).json({ error: "Error al obtener touchpoints" });
    }
  });

  // Crear un nuevo presupuesto
  app.post("/api/budgets", async (req, res) => {
    try {
      const schema = z.object({
        patientId: z.string(),
        amount: z.string(),
        treatmentDetails: z.string(),
        clinicId: z.string().optional(),
      });
      const data = schema.parse(req.body);
      
      // Get clinic ID from patient or use default
      const pacientes = await storage.getPacientes();
      const patient = pacientes.find(p => p.id === data.patientId);
      const clinicId = data.clinicId || patient?.clinicId || "default-clinic";
      
      const budget = await storage.createBudget({
        patientId: data.patientId,
        clinicId,
        amount: data.amount,
        treatmentDetails: data.treatmentDetails,
      });
      
      res.status(201).json(budget);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Datos inválidos", details: error.errors });
      } else {
        console.error("Error creating budget:", error);
        res.status(500).json({ error: "Error al crear presupuesto" });
      }
    }
  });

  // Actualizar estado de presupuesto
  app.patch("/api/budgets/:id/status", async (req, res) => {
    try {
      const { id } = req.params;
      const schema = z.object({
        status: z.enum(["pending", "accepted", "rejected"]),
      });
      const { status } = schema.parse(req.body);
      
      const budget = await storage.updateBudgetStatus(id, status);
      
      if (!budget) {
        res.status(404).json({ error: "Presupuesto no encontrado" });
        return;
      }
      
      res.json(budget);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Datos inválidos", details: error.errors });
      } else {
        res.status(500).json({ error: "Error al actualizar presupuesto" });
      }
    }
  });

  // Generar mensaje de relance con IA
  app.post("/api/budgets/:id/generate-relance", async (req, res) => {
    try {
      const { id } = req.params;
      const schema = z.object({
        channel: z.enum(["sms", "email", "whatsapp"]),
      });
      const { channel } = schema.parse(req.body);
      
      const budget = await storage.getBudget(id);
      if (!budget) {
        res.status(404).json({ error: "Presupuesto no encontrado" });
        return;
      }

      const pacientes = await storage.getPacientes();
      const patient = pacientes.find(p => p.id === budget.patientId);
      if (!patient) {
        res.status(404).json({ error: "Paciente no encontrado" });
        return;
      }

      const { generateRelanceMessage } = await import("./lib/openai");
      const daysPending = Math.ceil(
        (new Date().getTime() - new Date(budget.createdAt || new Date()).getTime()) / (1000 * 60 * 60 * 24)
      );

      const message = await generateRelanceMessage(
        {
          nombre: patient.nombre,
          edad: patient.edad,
          historial: patient.diagnostico,
        },
        {
          amount: Number(budget.amount),
          treatmentDetails: budget.treatmentDetails,
        },
        channel,
        daysPending
      );

      res.json({ message });
    } catch (error) {
      console.error("Error generating relance:", error);
      res.status(500).json({ error: "Error al generar relance" });
    }
  });

  // Enviar relance
  app.post("/api/budgets/:id/send-relance", async (req, res) => {
    try {
      const { id } = req.params;
      const schema = z.object({
        message: z.string(),
        channel: z.enum(["sms", "email", "whatsapp"]),
      });
      const { message, channel } = schema.parse(req.body);
      
      const budget = await storage.getBudget(id);
      if (!budget) {
        res.status(404).json({ error: "Presupuesto no encontrado" });
        return;
      }

      // Create message record (simulated sending)
      const mensajes = await storage.getMensajes(""); // Get all messages to find next ID
      const messageId = `msg-${Date.now()}`;
      
      // In a real implementation, you would integrate with Twilio, EmailJS, etc.
      // For now, we'll just return success
      
      res.json({ 
        success: true, 
        messageId,
        sentAt: new Date(),
        channel,
      });
    } catch (error) {
      console.error("Error sending relance:", error);
      res.status(500).json({ error: "Error al enviar relance" });
    }
  });

  // Generar mensaje post-visita
  app.post("/api/budgets/:id/generate-post-visit", async (req, res) => {
    try {
      const { id } = req.params;
      const budget = await storage.getBudget(id);
      if (!budget) {
        res.status(404).json({ error: "Presupuesto no encontrado" });
        return;
      }

      const pacientes = await storage.getPacientes();
      const patient = pacientes.find(p => p.id === budget.patientId);
      if (!patient) {
        res.status(404).json({ error: "Paciente no encontrado" });
        return;
      }

      const { generatePostVisitMessage } = await import("./lib/openai");
      const treatmentDetails = budget.treatmentDetails as any;
      const treatment = Array.isArray(treatmentDetails?.procedures)
        ? treatmentDetails.procedures.join(", ")
        : "tratamiento dental";

      const message = await generatePostVisitMessage(
        {
          nombre: patient.nombre,
          edad: patient.edad,
        },
        treatment
      );

      res.json({ message });
    } catch (error) {
      console.error("Error generating post-visit message:", error);
      res.status(500).json({ error: "Error al generar mensaje post-visita" });
    }
  });

  // Enviar mensaje post-visita
  app.post("/api/budgets/:id/send-post-visit", async (req, res) => {
    try {
      const { id } = req.params;
      const schema = z.object({
        message: z.string(),
      });
      const { message } = schema.parse(req.body);
      
      // Simulated sending
      res.json({ 
        success: true, 
        sentAt: new Date(),
      });
    } catch (error) {
      console.error("Error sending post-visit message:", error);
      res.status(500).json({ error: "Error al enviar mensaje post-visita" });
    }
  });

  // Enviar recordatorio de cita
  app.post("/api/citas/:id/send-reminder", async (req, res) => {
    try {
      const { id } = req.params;
      const schema = z.object({
        channel: z.enum(["sms", "email", "whatsapp"]),
      });
      const { channel } = schema.parse(req.body);
      
      const cita = await storage.getCita(id);
      if (!cita) {
        res.status(404).json({ error: "Cita no encontrada" });
        return;
      }

      const pacientes = await storage.getPacientes();
      const patient = pacientes.find(p => p.id === cita.pacienteId);
      if (!patient) {
        res.status(404).json({ error: "Paciente no encontrado" });
        return;
      }

      const { generateReminderMessage } = await import("./lib/openai");
      const hoursBefore = Math.ceil(
        (new Date(cita.fechaHora).getTime() - new Date().getTime()) / (1000 * 60 * 60)
      );

      const message = await generateReminderMessage(
        {
          nombre: patient.nombre,
          edad: patient.edad,
        },
        new Date(cita.fechaHora),
        cita.tipo,
        hoursBefore
      );

      // Simulated sending
      res.json({ 
        success: true, 
        message,
        sentAt: new Date(),
        channel,
      });
    } catch (error) {
      console.error("Error sending reminder:", error);
      res.status(500).json({ error: "Error al enviar recordatorio" });
    }
  });

  // Enviar recordatorios masivos
  app.post("/api/citas/send-bulk-reminders", async (req, res) => {
    try {
      const schema = z.object({
        date: z.string(),
        channel: z.enum(["sms", "email", "whatsapp"]),
      });
      const { date, channel } = schema.parse(req.body);
      
      const targetDate = new Date(date);
      const citas = await storage.getCitas();
      const citasDelDia = citas.filter(c => {
        const fechaCita = new Date(c.fechaHora);
        return (
          fechaCita.getDate() === targetDate.getDate() &&
          fechaCita.getMonth() === targetDate.getMonth() &&
          fechaCita.getFullYear() === targetDate.getFullYear() &&
          c.estado === "programada"
        );
      });

      // Simulated bulk sending
      res.json({ 
        success: true, 
        count: citasDelDia.length,
        sentAt: new Date(),
      });
    } catch (error) {
      console.error("Error sending bulk reminders:", error);
      res.status(500).json({ error: "Error al enviar recordatorios masivos" });
    }
  });

  // ============= TRATAMIENTOS PREVENTIVOS =============
  
  app.get("/api/tratamientos-preventivos", async (req, res) => {
    try {
      await storage.ensureInitialized();
      const pacienteId = req.query.pacienteId as string | undefined;
      const tratamientos = await storage.getTratamientosPreventivos({ pacienteId });
      res.json(tratamientos);
    } catch (error) {
      res.status(500).json({ error: "Error al obtener tratamientos preventivos" });
    }
  });

  app.post("/api/tratamientos-preventivos", async (req, res) => {
    try {
      const schema = z.object({
        pacienteId: z.string(),
        clinicId: z.string(),
        tipoTratamiento: z.string(),
        fechaRealizacion: z.string(),
        frecuenciaMeses: z.number(),
        citaId: z.string().nullable().optional(),
        budgetId: z.string().nullable().optional(),
        notas: z.string().nullable().optional(),
      });
      const data = schema.parse(req.body);
      
      const fechaRealizacion = new Date(data.fechaRealizacion);
      const proximaFecha = new Date(fechaRealizacion);
      proximaFecha.setMonth(proximaFecha.getMonth() + data.frecuenciaMeses);
      
      const tratamiento = await storage.createTratamientoPreventivo({
        pacienteId: data.pacienteId,
        clinicId: data.clinicId,
        tipoTratamiento: data.tipoTratamiento,
        fechaRealizacion,
        proximaFechaRecomendada: proximaFecha,
        frecuenciaMeses: data.frecuenciaMeses,
        citaId: data.citaId || null,
        budgetId: data.budgetId || null,
        notas: data.notas || null,
      });
      
      res.status(201).json(tratamiento);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Datos inválidos", details: error.errors });
      } else {
        console.error("Error creating tratamiento preventivo:", error);
        res.status(500).json({ error: "Error al crear tratamiento preventivo" });
      }
    }
  });

  app.get("/api/tratamientos-preventivos/pendientes", async (req, res) => {
    try {
      await storage.ensureInitialized();
      const recordatorios = await storage.getRecordatoriosPreventivosPendientes();
      res.json(recordatorios);
    } catch (error) {
      res.status(500).json({ error: "Error al obtener recordatorios preventivos pendientes" });
    }
  });

  // ============= REGLAS DE COMUNICACIÓN =============
  
  app.get("/api/reglas-comunicacion", async (req, res) => {
    try {
      await storage.ensureInitialized();
      const reglas = await storage.getReglasComunicacion();
      res.json(reglas);
    } catch (error) {
      console.error('[API] Error in /api/reglas-comunicacion:', error);
      res.status(500).json({ error: "Error al obtener reglas de comunicación", details: error instanceof Error ? error.message : String(error) });
    }
  });

  app.get("/api/reglas-comunicacion/:id", async (req, res) => {
    try {
      const regla = await storage.getReglaComunicacion(req.params.id);
      if (!regla) {
        res.status(404).json({ error: "Regla no encontrada" });
        return;
      }
      res.json(regla);
    } catch (error) {
      res.status(500).json({ error: "Error al obtener regla" });
    }
  });

  app.post("/api/reglas-comunicacion", async (req, res) => {
    try {
      const schema = z.object({
        nombre: z.string(),
        tipo: z.enum(["relance_presupuesto", "recordatorio_cita", "post_visita", "salud_preventiva", "recall_paciente"]),
        activa: z.boolean().optional(),
        secuencia: z.array(z.object({
          orden: z.number(),
          canal: z.enum(["whatsapp", "sms", "email", "llamada"]),
          diasDespues: z.number(),
          accion: z.enum(["enviar", "programar_llamada", "escalar"]),
          mensaje: z.string().optional(),
          requiereConfirmacion: z.boolean().optional(),
        })),
        criterios: z.any().optional(),
      });
      const data = schema.parse(req.body);
      const regla = await storage.createReglaComunicacion(data);
      res.status(201).json(regla);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Datos inválidos", details: error.errors });
      } else {
        console.error("Error creating regla:", error);
        res.status(500).json({ error: "Error al crear regla" });
      }
    }
  });

  app.put("/api/reglas-comunicacion/:id", async (req, res) => {
    try {
      const schema = z.object({
        nombre: z.string().optional(),
        activa: z.boolean().optional(),
        secuencia: z.array(z.object({
          orden: z.number(),
          canal: z.enum(["whatsapp", "sms", "email", "llamada"]),
          diasDespues: z.number(),
          accion: z.enum(["enviar", "programar_llamada", "escalar"]),
          mensaje: z.string().optional(),
          requiereConfirmacion: z.boolean().optional(),
        })).optional(),
        criterios: z.any().optional(),
      });
      const data = schema.parse(req.body);
      const regla = await storage.updateReglaComunicacion(req.params.id, data);
      if (!regla) {
        res.status(404).json({ error: "Regla no encontrada" });
        return;
      }
      res.json(regla);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Datos inválidos", details: error.errors });
      } else {
        res.status(500).json({ error: "Error al actualizar regla" });
      }
    }
  });

  app.delete("/api/reglas-comunicacion/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteReglaComunicacion(req.params.id);
      if (!deleted) {
        res.status(404).json({ error: "Regla no encontrada" });
        return;
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Error al eliminar regla" });
    }
  });

  // ============= SECUENCIAS DE COMUNICACIÓN =============
  
  app.get("/api/secuencias-comunicacion", async (req, res) => {
    try {
      console.log('[API] /api/secuencias-comunicacion called with tipo:', req.query.tipo, 'estado:', req.query.estado);
      await storage.ensureInitialized();
      const tipo = req.query.tipo as string | undefined;
      const estado = req.query.estado as string | undefined;
      const secuencias = await storage.getSecuenciasComunicacion({ tipo, estado });
      console.log('[API] /api/secuencias-comunicacion returning', secuencias.length, 'secuencias');
      res.json(secuencias);
    } catch (error) {
      console.error('[API] Error in /api/secuencias-comunicacion:', error);
      if (error instanceof Error) {
        console.error('[API] Error message:', error.message);
        console.error('[API] Error stack:', error.stack);
      }
      // Devolver array vacío en lugar de error 500
      res.json([]);
    }
  });

  app.get("/api/secuencias-comunicacion/:id", async (req, res) => {
    try {
      const secuencia = await storage.getSecuenciaComunicacion(req.params.id);
      if (!secuencia) {
        res.status(404).json({ error: "Secuencia no encontrada" });
        return;
      }
      res.json(secuencia);
    } catch (error) {
      res.status(500).json({ error: "Error al obtener secuencia" });
    }
  });

  // ============= ACCIONES AUTOMATIZADAS =============
  
  app.get("/api/acciones", async (req, res) => {
    try {
      await storage.ensureInitialized();
      const estado = req.query.estado as string | undefined;
      const tipo = req.query.tipo as string | undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      
      const acciones = await storage.getAcciones({ estado, tipo, limit });
      res.json(acciones);
    } catch (error) {
      res.status(500).json({ error: "Error al obtener acciones" });
    }
  });

  app.post("/api/acciones/:id/confirmar", async (req, res) => {
    try {
      const { id } = req.params;
      const accion = await storage.confirmarAccion(id);
      
      if (!accion) {
        res.status(404).json({ error: "Acción no encontrada" });
        return;
      }
      
      res.json(accion);
    } catch (error) {
      res.status(500).json({ error: "Error al confirmar acción" });
    }
  });

  app.post("/api/acciones/:id/rechazar", async (req, res) => {
    try {
      const { id } = req.params;
      const accion = await storage.updateAccionEstado(id, "rechazada");
      
      if (!accion) {
        res.status(404).json({ error: "Acción no encontrada" });
        return;
      }
      
      res.json(accion);
    } catch (error) {
      res.status(500).json({ error: "Error al rechazar acción" });
    }
  });

  // ============= DentalIQ KPIs =============
  
  app.get("/api/dashboard/dentaliq-kpis", async (req, res) => {
    try {
      console.log('[API] /api/dashboard/dentaliq-kpis called');
      await storage.ensureInitialized();
      const budgets = await storage.getBudgets();
      console.log('[API] Budgets count:', budgets.length);
      const kpis = await storage.getDentalIQKPIs();
      console.log('[API] KPIs returned:', JSON.stringify(kpis));
      res.json(kpis);
    } catch (error) {
      console.error('[API] Error getting KPIs:', error);
      if (error instanceof Error) {
        console.error('[API] Error stack:', error.stack);
      }
      res.status(500).json({ error: "Error al obtener KPIs", details: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // ============= ACCIONES DEL DÍA =============
  
  // Obtener acciones del día para presupuestos
  app.get("/api/presupuestos/acciones-hoy", async (req, res) => {
    try {
      await storage.ensureInitialized();
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      const mañana = new Date(hoy);
      mañana.setDate(mañana.getDate() + 1);
      
      // Obtener secuencias activas de relance con próxima acción hoy
      const secuencias = await storage.getSecuenciasComunicacion({ 
        tipo: "relance_presupuesto", 
        estado: "activa" 
      });
      
      const accionesHoy = [];
      
      for (const secuencia of secuencias) {
        if (!secuencia.proximaAccion) continue;
        
        const fechaProxima = new Date(secuencia.proximaAccion);
        fechaProxima.setHours(0, 0, 0, 0);
        
        // Si la próxima acción es hoy
        if (fechaProxima.getTime() === hoy.getTime() || fechaProxima.getTime() < hoy.getTime()) {
          const budget = await storage.getBudget(secuencia.budgetId || "");
          if (!budget || budget.status !== "pending") continue;
          
          const regla = await storage.getReglaComunicacion(secuencia.reglaId);
          if (!regla) continue;
          
          const pasos = regla.secuencia as any[];
          const pasoActual = pasos[secuencia.pasoActual || 0];
          
          if (pasoActual) {
            accionesHoy.push({
              budget,
              secuencia,
              regla,
              pasoActual: pasoActual,
              pasoNumero: (secuencia.pasoActual || 0) + 1,
              totalPasos: pasos.length,
            });
          }
        }
      }
      
      res.json(accionesHoy);
    } catch (error) {
      console.error("Error obteniendo acciones del día para presupuestos:", error);
      res.status(500).json({ error: "Error al obtener acciones del día" });
    }
  });

  // Obtener todas las acciones del día (combinadas)
  app.get("/api/acciones-del-dia", async (req, res) => {
    try {
      await storage.ensureInitialized();
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      const mañana = new Date(hoy);
      mañana.setDate(mañana.getDate() + 1);
      const accionesHoy = [];

      // 1. Acciones automáticas de IA - Recordatorios de citas
      const citas = await storage.getCitas();
      const citasRecordatorio = citas.filter(c => {
        if (c.estado !== "programada") return false;
        const fechaCita = new Date(c.fechaHora);
        const horasAntes = (fechaCita.getTime() - hoy.getTime()) / (1000 * 60 * 60);
        return (horasAntes > 23 && horasAntes < 25) || (horasAntes > 0.5 && horasAntes < 1.5);
      });
      
      for (const cita of citasRecordatorio) {
        const paciente = await storage.getPaciente(cita.pacienteId);
        if (!paciente) continue;
        
        const fechaCita = new Date(cita.fechaHora);
        const horasAntes = (fechaCita.getTime() - hoy.getTime()) / (1000 * 60 * 60);
        const tipoRecordatorio = horasAntes > 23 ? "24h" : "1h";
        
        accionesHoy.push({
          tipo: "recordatorio",
          automatica: true,
          paciente,
          cita,
          tipoRecordatorio,
          fechaCita,
          canal: paciente.whatsapp ? "whatsapp" : "sms",
          horaProgramada: fechaCita,
        });
      }

      // 2. Acciones automáticas - Mensajes post-visita
      const secuenciasPostVisita = await storage.getSecuenciasComunicacion({
        tipo: "post_visita",
        estado: "activa"
      });
      for (const secuencia of secuenciasPostVisita) {
        if (!secuencia.proximaAccion) continue;
        const proximaAccion = new Date(secuencia.proximaAccion);
        proximaAccion.setHours(0, 0, 0, 0);
        if (proximaAccion.getTime() >= hoy.getTime() && proximaAccion.getTime() < mañana.getTime()) {
          const paciente = await storage.getPaciente(secuencia.pacienteId!);
          if (!paciente) continue;
          const regla = await storage.getReglaComunicacion(secuencia.reglaId);
          if (!regla) continue;
          const pasos = regla.secuencia as any[];
          const pasoActual = pasos[secuencia.pasoActual || 0];
          if (pasoActual) {
            accionesHoy.push({
              tipo: "post_visita",
              automatica: true,
              paciente,
              secuencia,
              pasoActual,
              canal: pasoActual.canal,
              horaProgramada: new Date(secuencia.proximaAccion!),
            });
          }
        }
      }

      // 3. Acciones automáticas - Touchpoints de presupuestos
      const secuenciasPresupuestos = await storage.getSecuenciasComunicacion({
        tipo: "relance_presupuesto",
        estado: "activa"
      });
      for (const secuencia of secuenciasPresupuestos) {
        if (!secuencia.proximaAccion) continue;
        const proximaAccion = new Date(secuencia.proximaAccion);
        proximaAccion.setHours(0, 0, 0, 0);
        if (proximaAccion.getTime() >= hoy.getTime() && proximaAccion.getTime() < mañana.getTime()) {
          const budget = await storage.getBudget(secuencia.budgetId!);
          if (!budget) continue;
          const regla = await storage.getReglaComunicacion(secuencia.reglaId);
          if (!regla) continue;
          const pasos = regla.secuencia as any[];
          const pasoActual = pasos[secuencia.pasoActual || 0];
          if (pasoActual) {
            accionesHoy.push({
              tipo: "relance_presupuesto",
              automatica: true,
              budget,
              secuencia,
              pasoActual,
              canal: pasoActual.canal,
              horaProgramada: new Date(secuencia.proximaAccion!),
            });
          }
        }
      }

      // 4. Acciones automáticas - Touchpoints a pacientes perdidos (recall)
      const secuenciasRecall = await storage.getSecuenciasComunicacion({
        tipo: "recall_paciente",
        estado: "activa"
      });
      for (const secuencia of secuenciasRecall) {
        if (!secuencia.proximaAccion) continue;
        const proximaAccion = new Date(secuencia.proximaAccion);
        proximaAccion.setHours(0, 0, 0, 0);
        if (proximaAccion.getTime() >= hoy.getTime() && proximaAccion.getTime() < mañana.getTime()) {
          const paciente = await storage.getPaciente(secuencia.pacienteId!);
          if (!paciente) continue;
          const regla = await storage.getReglaComunicacion(secuencia.reglaId);
          if (!regla) continue;
          const pasos = regla.secuencia as any[];
          const pasoActual = pasos[secuencia.pasoActual || 0];
          if (pasoActual) {
            accionesHoy.push({
              tipo: "recall_paciente",
              automatica: true,
              paciente,
              secuencia,
              pasoActual,
              canal: pasoActual.canal,
              horaProgramada: new Date(secuencia.proximaAccion!),
            });
          }
        }
      }

      // 5. Acciones manuales - Llamadas del staff
      const tareasLlamadas = await storage.getTareas();
      const tareasHoy = tareasLlamadas.filter(t => {
        if (t.estado !== "pendiente") return false;
        if (!t.fechaProgramada) return false;
        const fechaProgramada = new Date(t.fechaProgramada);
        fechaProgramada.setHours(0, 0, 0, 0);
        return fechaProgramada.getTime() >= hoy.getTime() && fechaProgramada.getTime() < mañana.getTime();
      });

      for (const tarea of tareasHoy) {
        const paciente = await storage.getPaciente(tarea.pacienteId);
        if (!paciente) continue;
        
        accionesHoy.push({
          tipo: "llamada_staff",
          automatica: false,
          paciente,
          tarea: {
            id: tarea.id,
            pacienteId: tarea.pacienteId,
            pacienteNombre: tarea.pacienteNombre,
            telefono: tarea.telefono,
            email: tarea.email,
            motivo: tarea.motivo,
            prioridad: tarea.prioridad,
            tipoAccion: tarea.tipoAccion,
            estado: tarea.estado,
            fechaProgramada: tarea.fechaProgramada,
            notas: tarea.notas,
          },
          motivo: tarea.motivo,
          prioridad: tarea.prioridad,
          telefono: tarea.telefono,
          horaProgramada: tarea.fechaProgramada ? new Date(tarea.fechaProgramada) : new Date(),
        });
      }

      // Ordenar por hora programada
      accionesHoy.sort((a, b) => {
        const horaA = a.horaProgramada ? new Date(a.horaProgramada).getTime() : 0;
        const horaB = b.horaProgramada ? new Date(b.horaProgramada).getTime() : 0;
        return horaA - horaB;
      });

      res.json(accionesHoy);
    } catch (error) {
      console.error("Error obteniendo acciones del día:", error);
      res.status(500).json({ error: "Error al obtener acciones del día" });
    }
  });

  // Obtener acciones del día para pacientes
  app.get("/api/pacientes/acciones-hoy", async (req, res) => {
    try {
      await storage.ensureInitialized();
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      const accionesHoy = [];
      
      // 1. Recordatorios de citas (citas programadas para hoy o mañana)
      const citas = await storage.getCitas();
      const citasRecordatorio = citas.filter(c => {
        if (c.estado !== "programada") return false;
        const fechaCita = new Date(c.fechaHora);
        const horasAntes = (fechaCita.getTime() - hoy.getTime()) / (1000 * 60 * 60);
        // Recordatorio 24h antes (entre 23 y 25 horas antes) o 1h antes (entre 0.5 y 1.5 horas antes)
        return (horasAntes > 23 && horasAntes < 25) || (horasAntes > 0.5 && horasAntes < 1.5);
      });
      
      for (const cita of citasRecordatorio) {
        const paciente = await storage.getPaciente(cita.pacienteId);
        if (!paciente) continue;
        
        const fechaCita = new Date(cita.fechaHora);
        const horasAntes = (fechaCita.getTime() - hoy.getTime()) / (1000 * 60 * 60);
        const tipoRecordatorio = horasAntes > 23 ? "24h" : "1h";
        
        accionesHoy.push({
          tipo: "recordatorio",
          paciente,
          cita,
          tipoRecordatorio,
          fechaCita,
          canal: paciente.whatsapp ? "whatsapp" : "sms",
        });
      }
      
      // 2. Salud preventiva - recordatorios pendientes
      const recordatoriosPreventivos = await storage.getRecordatoriosPreventivosPendientes();
      for (const recordatorio of recordatoriosPreventivos) {
        const paciente = await storage.getPaciente(recordatorio.pacienteId);
        if (!paciente) continue;
        
        accionesHoy.push({
          tipo: "preventivo",
          paciente,
          recordatorio,
          canal: recordatorio.canalSiguiente,
        });
      }
      
      // 3. Pacientes dormidos que necesitan recuperación
      const pacientesDormidos = await storage.getPacientesPerdidos();
      for (const paciente of pacientesDormidos.slice(0, 10)) { // Limitar a 10 para no sobrecargar
        // Verificar si ya hay una secuencia activa
        const secuencias = await storage.getSecuenciasComunicacion({ 
          tipo: "recuperacion_paciente",
          estado: "activa"
        });
        const tieneSecuenciaActiva = secuencias.some(s => s.pacienteId === paciente.id);
        
        if (!tieneSecuenciaActiva) {
          accionesHoy.push({
            tipo: "recuperacion",
            paciente,
            mesesSinVisita: paciente.mesesSinVisita || 0,
            prioridad: paciente.prioridad || "Media",
          });
        }
      }
      
      res.json(accionesHoy);
    } catch (error) {
      console.error("Error obteniendo acciones del día para pacientes:", error);
      res.status(500).json({ error: "Error al obtener acciones del día" });
    }
  });

  // ============= IA - GENERACIÓN DE MENSAJES =============
  
  // Generar mensaje con IA para reglas de comunicación
  app.post("/api/ia/generar-mensaje", async (req, res) => {
    try {
      const { generateCommunicationRuleMessage } = await import("./lib/openai");
      
      const schema = z.object({
        tipo: z.enum(["relance_presupuesto", "recordatorio_cita", "post_visita", "salud_preventiva", "recall_paciente"]),
        canal: z.enum(["sms", "email", "whatsapp", "llamada"]),
        pasoNumero: z.number().int().positive(),
        contexto: z.object({
          nombrePaciente: z.string().optional(),
          monto: z.number().optional(),
          tratamiento: z.string().optional(),
          diasPendientes: z.number().optional(),
          fechaCita: z.string().optional(),
          tipoTratamiento: z.string().optional(),
        }).optional(),
      });
      
      const { tipo, canal, pasoNumero, contexto } = schema.parse(req.body);
      
      const contextoFormateado = contexto ? {
        ...contexto,
        fechaCita: contexto.fechaCita ? new Date(contexto.fechaCita) : undefined,
      } : undefined;
      
      const mensaje = await generateCommunicationRuleMessage(tipo, canal, pasoNumero, contextoFormateado);
      
      res.json({ mensaje });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Datos inválidos", details: error.errors });
      } else {
        console.error("Error generando mensaje con IA:", error);
        res.status(500).json({ error: "Error al generar mensaje con IA" });
      }
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
