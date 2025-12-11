import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean, jsonb, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Clinics
export const clinics = pgTable("clinics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  address: text("address"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertClinicSchema = createInsertSchema(clinics).omit({
  id: true,
  createdAt: true,
});

export type InsertClinic = z.infer<typeof insertClinicSchema>;
export type Clinic = typeof clinics.$inferSelect;

// Users
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  role: text("role").notNull().default("recepcion"), // "admin", "recepcion", "dentista"
  clinicId: varchar("clinic_id").references(() => clinics.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Pacientes (updated for LaFraise)
export const pacientes = pgTable("pacientes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clinicId: varchar("clinic_id").references(() => clinics.id),
  nombre: text("nombre").notNull(),
  ultimaVisita: timestamp("ultima_visita").notNull(),
  diagnostico: text("diagnostico").notNull(),
  telefono: text("telefono").notNull(),
  email: text("email").notNull(),
  whatsapp: text("whatsapp"),
  edad: integer("edad").notNull(),
  estado: text("estado").notNull(), // "activo", "perdido", "sin cita"
  prioridad: text("prioridad"), // "Alta", "Media", "Baja"
  tieneCitaFutura: boolean("tiene_cita_futura").default(false),
  mesesSinVisita: integer("meses_sin_visita"),
  enCampana: boolean("en_campana").default(false),
  notes: text("notes"), // Additional notes about patient
});

export const insertPacienteSchema = createInsertSchema(pacientes).omit({
  id: true,
});

export type InsertPaciente = z.infer<typeof insertPacienteSchema>;
export type Paciente = typeof pacientes.$inferSelect;

// Campañas
export const campanas = pgTable("campanas", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  nombre: text("nombre").notNull(),
  canales: text("canales").array().notNull(), // ["SMS", "Email", "Llamadas"]
  cadencia: text("cadencia").notNull(), // "Opción 1", "Opción 2", "Opción 3"
  plantillaSMS: text("plantilla_sms"),
  plantillaEmail: text("plantilla_email"),
  guionLlamada: text("guion_llamada"),
  estado: text("estado").notNull(), // "activa", "pausada", "completada"
  pacientesIncluidos: integer("pacientes_incluidos").default(0),
  contactosEnviados: integer("contactos_enviados").default(0),
  citasGeneradas: integer("citas_generadas").default(0),
  fechaCreacion: timestamp("fecha_creacion").defaultNow(),
});

export const insertCampanaSchema = createInsertSchema(campanas).omit({
  id: true,
  fechaCreacion: true,
});

export type InsertCampana = z.infer<typeof insertCampanaSchema>;
export type Campana = typeof campanas.$inferSelect;

// Tareas de llamadas para staff (Acciones del Día)
export const tareasLlamadas = pgTable("tareas_llamadas", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  pacienteId: varchar("paciente_id").notNull(),
  pacienteNombre: text("paciente_nombre").notNull(),
  telefono: text("telefono").notNull(),
  email: text("email"), // email del paciente para acciones de tipo email
  motivo: text("motivo").notNull(),
  prioridad: text("prioridad").notNull(), // "Alta", "Media", "Baja"
  tipoAccion: text("tipo_accion").notNull().default("llamada"), // "llamada", "email", "carta", "añadir_campana", "añadir_campana_riesgo"
  estado: text("estado").notNull(), // "pendiente", "contactado", "cita_agendada", "no_contactado", "completada"
  aprobado: boolean("aprobado").default(false), // si la tarea ha sido aprobada por supervisor
  fechaProgramada: timestamp("fecha_programada"), // fecha en que se programa la tarea
  fechaCreacion: timestamp("fecha_creacion").defaultNow(),
  fechaContacto: timestamp("fecha_contacto"),
  fechaCompletada: timestamp("fecha_completada"), // fecha de finalización
  notas: text("notas"),
  campanaId: text("campana_id"), // ID de la campaña para acciones de tipo añadir_campana
  cantidadPacientes: integer("cantidad_pacientes"), // Cantidad de pacientes para acciones de campaña
});

export const insertTareaLlamadaSchema = createInsertSchema(tareasLlamadas).omit({
  id: true,
  fechaCreacion: true,
});

export type InsertTareaLlamada = z.infer<typeof insertTareaLlamadaSchema>;
export type TareaLlamada = typeof tareasLlamadas.$inferSelect;

// KPIs Dashboard
export interface DashboardKPIs {
  pacientesPerdidos: number;
  pacientesEnCampanas: number;
  contactosEnviados: number;
  citasGeneradas: number;
  tasaConversion: number; // porcentaje
  roiEstimado: number;
}

// Conversión por canal
export interface ConversionPorCanal {
  canal: string;
  conversion: number; // porcentaje
  contactos: number;
  citas: number;
}

// Filtros de segmentación
export interface FiltrosSegmentacion {
  prioridad?: "Alta" | "Media" | "Baja" | "Todas";
  diagnostico?: string;
  edadMin?: number;
  edadMax?: number;
}

// Conversaciones
export const conversaciones = pgTable("conversaciones", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  pacienteId: varchar("paciente_id").notNull(),
  canal: text("canal").notNull(), // "whatsapp", "sms", "email"
  ultimoMensaje: text("ultimo_mensaje"),
  fechaUltimoMensaje: timestamp("fecha_ultimo_mensaje"),
  noLeidos: integer("no_leidos").default(0),
  estado: text("estado").notNull(), // "activa", "archivada"
});

export const insertConversacionSchema = createInsertSchema(conversaciones).omit({
  id: true,
});

export type InsertConversacion = z.infer<typeof insertConversacionSchema>;
export type Conversacion = typeof conversaciones.$inferSelect;

// Conversación con datos del paciente para mostrar en la lista
export interface ConversacionConPaciente extends Conversacion {
  pacienteNombre: string;
  pacienteTelefono: string;
  pacienteEmail: string;
}

// Budgets (Presupuestos)
export const budgets = pgTable("budgets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  patientId: varchar("patient_id").references(() => pacientes.id).notNull(),
  clinicId: varchar("clinic_id").references(() => clinics.id).notNull(),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  urgencyScore: integer("urgency_score"), // 0-100 AI calculated
  acceptanceProb: integer("acceptance_prob"), // 0-100 AI calculated
  status: text("status").notNull().default("pending"), // "pending", "accepted", "rejected"
  treatmentDetails: jsonb("treatment_details"), // {procedures: [], total: number}
  priority: text("priority"), // "high", "medium", "low" - auto calculated by AI
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertBudgetSchema = createInsertSchema(budgets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  urgencyScore: true,
  acceptanceProb: true,
  priority: true,
});

export type InsertBudget = z.infer<typeof insertBudgetSchema>;
export type Budget = typeof budgets.$inferSelect;

// Budget with patient info for display
export interface BudgetWithPatient extends Budget {
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  patientWhatsapp?: string;
}

// Mensajes (updated for LaFraise - supports budget follow-ups)
export const mensajes = pgTable("mensajes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  conversacionId: varchar("conversacion_id"),
  budgetId: varchar("budget_id").references(() => budgets.id),
  patientId: varchar("patient_id").references(() => pacientes.id),
  type: text("type").notNull(), // "relance", "reminder", "postvisit", "conversation"
  channel: text("channel").notNull(), // "sms", "email", "whatsapp"
  contenido: text("contenido").notNull(),
  direccion: text("direccion").notNull().default("saliente"), // "entrante", "saliente"
  fechaEnvio: timestamp("fecha_envio").notNull(),
  openedAt: timestamp("opened_at"),
  leido: boolean("leido").default(false),
});

export const insertMensajeSchema = createInsertSchema(mensajes).omit({
  id: true,
});

export type InsertMensaje = z.infer<typeof insertMensajeSchema>;
export type Mensaje = typeof mensajes.$inferSelect;

// Citas (Agenda)
export const citas = pgTable("citas", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  pacienteId: varchar("paciente_id").notNull(),
  pacienteNombre: text("paciente_nombre").notNull(),
  telefono: text("telefono").notNull(),
  fechaHora: timestamp("fecha_hora").notNull(),
  duracionMinutos: integer("duracion_minutos").default(30),
  tipo: text("tipo").notNull(), // "revision", "limpieza", "tratamiento", "consulta", "urgencia"
  estado: text("estado").notNull(), // "programada", "confirmada", "completada", "cancelada", "no_asistio"
  notas: text("notas"),
  doctor: text("doctor"),
  sala: text("sala"),
  origen: text("origen"), // "reactivacion", "web", "telefono", "presencial"
});

export const insertCitaSchema = createInsertSchema(citas).omit({
  id: true,
});

export type InsertCita = z.infer<typeof insertCitaSchema>;
export type Cita = typeof citas.$inferSelect;

// Recordatorios de citas
export const recordatorios = pgTable("recordatorios", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  nombre: text("nombre").notNull(),
  canal: text("canal").notNull(), // "sms", "whatsapp", "email"
  mensaje: text("mensaje").notNull(),
  horasAntes: integer("horas_antes").notNull(), // tiempo de antelación en horas
  activo: boolean("activo").default(true),
});

export const insertRecordatorioSchema = createInsertSchema(recordatorios).omit({
  id: true,
});

export type InsertRecordatorio = z.infer<typeof insertRecordatorioSchema>;
export type Recordatorio = typeof recordatorios.$inferSelect;

// Analytics (KPIs agregados)
export const analytics = pgTable("analytics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clinicId: varchar("clinic_id").references(() => clinics.id).notNull(),
  fecha: timestamp("fecha").defaultNow(),
  tasaTransformacion: numeric("tasa_transformacion", { precision: 5, scale: 2 }), // percentage
  facturacion: numeric("facturacion", { precision: 10, scale: 2 }),
  rechazosPorMotivo: jsonb("rechazos_por_motivo"), // {precio: number, miedo: number, comprension: number, etc}
  budgetsTotales: integer("budgets_totales").default(0),
  budgetsAceptados: integer("budgets_aceptados").default(0),
  budgetsRechazados: integer("budgets_rechazados").default(0),
  relancesEnviados: integer("relances_enviados").default(0),
});

export const insertAnalyticsSchema = createInsertSchema(analytics).omit({
  id: true,
});

export type InsertAnalytics = z.infer<typeof insertAnalyticsSchema>;
export type Analytics = typeof analytics.$inferSelect;

// DentalIQ Dashboard KPIs
export interface DentalIQKPIs {
  tasaAceptacion: number; // percentage
  tasaAceptacionGoal: number; // +20% goal
  horasAhorradas: number; // estimated hours saved
  treatmentsAceptados: number; // number of accepted treatments
  facturacionGenerada: number; // total revenue from accepted budgets
  tasaTransformacionMensual: Array<{ mes: string; tasa: number }>;
  rechazosMotivos: Array<{ motivo: string; cantidad: number }>;
}

// Acciones Automatizadas (Log de actividad)
export const acciones = pgTable("acciones", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tipo: text("tipo").notNull(), // "relance", "recordatorio", "post_visita", "scoring", "analisis", "preventivo"
  estado: text("estado").notNull().default("pendiente"), // "pendiente", "ejecutada", "confirmada", "rechazada", "error"
  titulo: text("titulo").notNull(),
  descripcion: text("descripcion"),
  pacienteId: varchar("patient_id").references(() => pacientes.id),
  budgetId: varchar("budget_id").references(() => budgets.id),
  citaId: varchar("cita_id").references(() => citas.id),
  canal: text("canal"), // "sms", "email", "whatsapp"
  mensaje: text("mensaje"), // Contenido del mensaje generado
  metadata: jsonb("metadata"), // Datos adicionales
  requiereConfirmacion: boolean("requiere_confirmacion").default(false),
  ejecutadaAt: timestamp("ejecutada_at"),
  confirmadaAt: timestamp("confirmada_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAccionSchema = createInsertSchema(acciones).omit({
  id: true,
  createdAt: true,
});

export type InsertAccion = z.infer<typeof insertAccionSchema>;
export type Accion = typeof acciones.$inferSelect;

// Acción con datos relacionados para mostrar
export interface AccionConDatos extends Accion {
  pacienteNombre?: string;
  budgetMonto?: string;
  citaFecha?: Date;
}

// Tratamientos Preventivos Realizados
export const tratamientosPreventivos = pgTable("tratamientos_preventivos", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  pacienteId: varchar("patient_id").references(() => pacientes.id).notNull(),
  clinicId: varchar("clinic_id").references(() => clinics.id).notNull(),
  tipoTratamiento: text("tipo_tratamiento").notNull(), // "limpieza", "revision", "fluorizacion", "selladores", etc.
  fechaRealizacion: timestamp("fecha_realizacion").notNull(),
  proximaFechaRecomendada: timestamp("proxima_fecha_recomendada").notNull(),
  frecuenciaMeses: integer("frecuencia_meses").notNull(), // 6 para limpieza, 12 para revision, etc.
  citaId: varchar("cita_id").references(() => citas.id), // Si está ligado a una cita
  budgetId: varchar("budget_id").references(() => budgets.id), // Si está ligado a un presupuesto
  notas: text("notas"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertTratamientoPreventivoSchema = createInsertSchema(tratamientosPreventivos).omit({
  id: true,
  createdAt: true,
});

export type InsertTratamientoPreventivo = z.infer<typeof insertTratamientoPreventivoSchema>;
export type TratamientoPreventivo = typeof tratamientosPreventivos.$inferSelect;

// Tratamiento preventivo con datos del paciente
export interface TratamientoPreventivoConPaciente extends TratamientoPreventivo {
  pacienteNombre: string;
  pacienteEmail: string;
  pacientePhone: string;
  pacienteWhatsapp?: string;
}

// Reglas de frecuencia para tratamientos preventivos
export interface ReglaFrecuenciaPreventiva {
  tipoTratamiento: string;
  frecuenciaMeses: number;
  nombre: string;
}

// Recordatorio preventivo pendiente
export interface RecordatorioPreventivoPendiente {
  pacienteId: string;
  pacienteNombre: string;
  tipoTratamiento: string;
  ultimaFecha: Date;
  proximaFechaRecomendada: Date;
  diasVencidos: number;
  canalSiguiente: "whatsapp" | "sms" | "email";
  intentosEnviados: number;
}

// Reglas de Comunicación y Negocio
export const reglasComunicacion = pgTable("reglas_comunicacion", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  nombre: text("nombre").notNull(),
  tipo: text("tipo").notNull(), // "relance_presupuesto", "recordatorio_cita", "post_visita", "salud_preventiva", "recall_paciente"
  activa: boolean("activa").default(true),
  secuencia: jsonb("secuencia").notNull(), // Array de pasos: [{canal: "whatsapp", diasDespues: 2, accion: "enviar"}, ...]
  criterios: jsonb("criterios"), // Criterios para asignación: {diagnosticos: [], mesesSinVisitaMin: number, mesesSinVisitaMax: number, interaccionesPrevias: boolean, ...}
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertReglaComunicacionSchema = createInsertSchema(reglasComunicacion).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertReglaComunicacion = z.infer<typeof insertReglaComunicacionSchema>;
export type ReglaComunicacion = typeof reglasComunicacion.$inferSelect;

// Paso en la secuencia de comunicación
export interface PasoComunicacion {
  orden: number;
  canal: "whatsapp" | "sms" | "email" | "llamada";
  diasDespues: number; // Días después del evento anterior o del evento inicial
  accion: "enviar" | "programar_llamada" | "escalar";
  mensaje?: string; // Plantilla de mensaje (opcional, puede usar IA)
  requiereConfirmacion?: boolean;
}

// Criterios para asignación de campañas de recall
export interface CriteriosCampañaRecall {
  diagnosticos?: string[]; // Diagnósticos específicos que activan esta campaña
  mesesSinVisitaMin?: number; // Mínimo de meses sin visita
  mesesSinVisitaMax?: number; // Máximo de meses sin visita
  requiereInteraccionesPrevias?: boolean; // Si requiere que el paciente haya tenido interacciones previas
  edadMin?: number; // Edad mínima del paciente
  edadMax?: number; // Edad máxima del paciente
  tienePresupuestosPendientes?: boolean; // Si debe tener presupuestos pendientes
  tieneTratamientosIncompletos?: boolean; // Si debe tener tratamientos incompletos
}

// Secuencia de comunicación activa para un paciente/presupuesto
export const secuenciasComunicacion = pgTable("secuencias_comunicacion", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  reglaId: varchar("regla_id").references(() => reglasComunicacion.id).notNull(),
  pacienteId: varchar("patient_id").references(() => pacientes.id).notNull(),
  budgetId: varchar("budget_id").references(() => budgets.id),
  citaId: varchar("cita_id").references(() => citas.id),
  tipo: text("tipo").notNull(), // Mismo que regla.tipo
  estado: text("estado").notNull().default("activa"), // "activa", "pausada", "completada", "cancelada"
  pasoActual: integer("paso_actual").default(0),
  fechaInicio: timestamp("fecha_inicio").notNull(),
  ultimaAccion: timestamp("ultima_accion"),
  proximaAccion: timestamp("proxima_accion"),
  respuestaRecibida: boolean("respuesta_recibida").default(false),
  metadata: jsonb("metadata"), // Historial de acciones ejecutadas
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertSecuenciaComunicacionSchema = createInsertSchema(secuenciasComunicacion).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertSecuenciaComunicacion = z.infer<typeof insertSecuenciaComunicacionSchema>;
export type SecuenciaComunicacion = typeof secuenciasComunicacion.$inferSelect;
