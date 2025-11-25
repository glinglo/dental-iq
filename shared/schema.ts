import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Pacientes
export const pacientes = pgTable("pacientes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  nombre: text("nombre").notNull(),
  ultimaVisita: timestamp("ultima_visita").notNull(),
  diagnostico: text("diagnostico").notNull(),
  telefono: text("telefono").notNull(),
  email: text("email").notNull(),
  edad: integer("edad").notNull(),
  estado: text("estado").notNull(), // "activo", "perdido", "sin cita"
  prioridad: text("prioridad"), // "Alta", "Media", "Baja"
  tieneCitaFutura: boolean("tiene_cita_futura").default(false),
  mesesSinVisita: integer("meses_sin_visita"),
  enCampana: boolean("en_campana").default(false),
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

// Tareas de llamadas para staff
export const tareasLlamadas = pgTable("tareas_llamadas", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  pacienteId: varchar("paciente_id").notNull(),
  pacienteNombre: text("paciente_nombre").notNull(),
  telefono: text("telefono").notNull(),
  motivo: text("motivo").notNull(),
  prioridad: text("prioridad").notNull(), // "Alta", "Media", "Baja"
  estado: text("estado").notNull(), // "pendiente", "contactado", "cita_agendada", "no_contactado"
  fechaCreacion: timestamp("fecha_creacion").defaultNow(),
  fechaContacto: timestamp("fecha_contacto"),
  notas: text("notas"),
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
