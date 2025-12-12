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
  InsertMensaje,
  Cita,
  InsertCita,
  Recordatorio,
  InsertRecordatorio,
  Budget,
  InsertBudget,
  BudgetWithPatient,
  Clinic,
  InsertClinic,
  User,
  InsertUser,
  DentalIQKPIs,
  Accion,
  InsertAccion,
  AccionConDatos,
  TratamientoPreventivo,
  InsertTratamientoPreventivo,
  TratamientoPreventivoConPaciente,
  RecordatorioPreventivoPendiente,
  ReglaFrecuenciaPreventiva,
  ReglaComunicacion,
  InsertReglaComunicacion,
  PasoComunicacion,
  SecuenciaComunicacion,
  InsertSecuenciaComunicacion
} from "@shared/schema";
import { randomUUID } from "crypto";
import { generarPacientesMock, generarCampanasMock, generarTareasLlamadasMock, generarTareasCampanaMock, generarConversacionesMock, generarCitasMock, generarBudgetsMock, generarClinicsMock, generarTratamientosPreventivosMock } from "./mockData";
import { calculateUrgencyScore, calculateAcceptanceProb, calculatePriority } from "./lib/openai";

export interface IStorage {
  // Pacientes
  getPacientes(): Promise<Paciente[]>;
  getPaciente(id: string): Promise<Paciente | undefined>;
  getPacientesPerdidos(filtros?: FiltrosSegmentacion): Promise<Paciente[]>;
  calcularPacientesPerdidos(): Promise<{ total: number; pacientes: Paciente[] }>;
  getPacientesEnRiesgo(): Promise<Paciente[]>; // Pacientes cerca de estar dormidos (4-6 meses)
  getPacientesListosParaCampana(campanaId: string): Promise<Paciente[]>; // Pacientes listos para añadir a una campaña específica
  anadirPacientesACampana(pacienteIds: string[]): Promise<void>;
  
  // Campañas
  getCampanas(): Promise<Campana[]>;
  getCampana(id: string): Promise<Campana | undefined>;
  createCampana(campana: InsertCampana): Promise<Campana>;
  updateCampanaEstado(id: string, estado: string): Promise<Campana | undefined>;
  
  // Tareas de llamadas
  getTareas(): Promise<TareaLlamada[]>;
  getTarea(id: string): Promise<TareaLlamada | undefined>;
  getTareasParaHoy(): Promise<TareaLlamada[]>;
  updateTarea(id: string, updates: {
    estado?: string;
    notas?: string | null;
    aprobado?: boolean;
    fechaProgramada?: string | null;
    fechaContacto?: string | null;
    fechaCompletada?: string | null;
  }): Promise<TareaLlamada | undefined>;
  
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
  
  // Citas
  getCitas(): Promise<Cita[]>;
  getCitasPorSemana(inicio: Date, fin: Date): Promise<Cita[]>;
  getCita(id: string): Promise<Cita | undefined>;
  createCita(cita: InsertCita): Promise<Cita>;
  updateCitaEstado(id: string, estado: string): Promise<Cita | undefined>;
  detectarHuecosLibres(fechaInicio: Date, fechaFin: Date, duracionMinutos?: number): Promise<Array<{ fecha: Date; horaInicio: number; horaFin: number; duracion: number }>>;
  sugerirPacientesParaHueco(fecha: Date, horaInicio: number, horaFin: number, limite?: number): Promise<Array<{ paciente: Paciente; motivo: string; prioridad: number }>>;
  
  // Recordatorios
  getRecordatorios(): Promise<Recordatorio[]>;
  getRecordatorio(id: string): Promise<Recordatorio | undefined>;
  createRecordatorio(recordatorio: InsertRecordatorio): Promise<Recordatorio>;
  updateRecordatorio(id: string, data: Partial<InsertRecordatorio>): Promise<Recordatorio | undefined>;
  deleteRecordatorio(id: string): Promise<boolean>;
  
  // Budgets (DentalIQ)
  getBudgets(): Promise<BudgetWithPatient[]>;
  getBudget(id: string): Promise<BudgetWithPatient | undefined>;
  createBudget(budget: InsertBudget & { treatmentDetails: string }): Promise<Budget>;
  updateBudgetStatus(id: string, status: string): Promise<Budget | undefined>;
  
  // Clinics
  getClinics(): Promise<Clinic[]>;
  createClinic(clinic: InsertClinic): Promise<Clinic>;
  
  // Users
  getUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  
  // DentalIQ KPIs
  getDentalIQKPIs(): Promise<DentalIQKPIs>;
  
  // Acciones Automatizadas
  getAcciones(filtros?: { estado?: string; tipo?: string; limit?: number }): Promise<AccionConDatos[]>;
  createAccion(accion: InsertAccion): Promise<Accion>;
  updateAccionEstado(id: string, estado: string): Promise<Accion | undefined>;
  confirmarAccion(id: string): Promise<Accion | undefined>;
  
  // Tratamientos Preventivos
  getTratamientosPreventivos(filtros?: { pacienteId?: string }): Promise<TratamientoPreventivoConPaciente[]>;
  createTratamientoPreventivo(tratamiento: InsertTratamientoPreventivo): Promise<TratamientoPreventivo>;
  getRecordatoriosPreventivosPendientes(): Promise<RecordatorioPreventivoPendiente[]>;
  
  // Reglas de Comunicación
  getReglasComunicacion(): Promise<ReglaComunicacion[]>;
  getReglaComunicacion(id: string): Promise<ReglaComunicacion | undefined>;
  createReglaComunicacion(regla: InsertReglaComunicacion): Promise<ReglaComunicacion>;
  updateReglaComunicacion(id: string, regla: Partial<InsertReglaComunicacion>): Promise<ReglaComunicacion | undefined>;
  deleteReglaComunicacion(id: string): Promise<boolean>;
  
  // Secuencias de Comunicación
  getSecuenciasComunicacion(filtros?: { tipo?: string; estado?: string }): Promise<SecuenciaComunicacion[]>;
  getSecuenciaComunicacion(id: string): Promise<SecuenciaComunicacion | undefined>;
  createSecuenciaComunicacion(secuencia: InsertSecuenciaComunicacion): Promise<SecuenciaComunicacion>;
  updateSecuenciaComunicacion(id: string, secuencia: Partial<InsertSecuenciaComunicacion>): Promise<SecuenciaComunicacion | undefined>;
  avanzarSecuenciaComunicacion(id: string): Promise<SecuenciaComunicacion | undefined>;
}

export class MemStorage implements IStorage {
  private pacientes: Map<string, Paciente>;
  private campanas: Map<string, Campana>;
  private tareas: Map<string, TareaLlamada>;
  private conversaciones: Map<string, Conversacion>;
  private mensajes: Map<string, Mensaje>;
  private citas: Map<string, Cita>;
  private recordatorios: Map<string, Recordatorio>;
  private budgets: Map<string, Budget>;
  private clinics: Map<string, Clinic>;
  private users: Map<string, User>;
  private acciones: Map<string, Accion>;
  private tratamientosPreventivos: Map<string, TratamientoPreventivo>;
  private reglasComunicacion: Map<string, ReglaComunicacion>;
  private secuenciasComunicacion: Map<string, SecuenciaComunicacion>;

  // Reglas de frecuencia para tratamientos preventivos
  private reglasFrecuencia: ReglaFrecuenciaPreventiva[] = [
    { tipoTratamiento: "limpieza", frecuenciaMeses: 6, nombre: "Limpieza dental" },
    { tipoTratamiento: "revision", frecuenciaMeses: 12, nombre: "Revisión general" },
    { tipoTratamiento: "fluorizacion", frecuenciaMeses: 6, nombre: "Fluorización" },
    { tipoTratamiento: "selladores", frecuenciaMeses: 12, nombre: "Selladores" },
    { tipoTratamiento: "ortodoncia_revision", frecuenciaMeses: 3, nombre: "Revisión ortodoncia" },
  ];

  private initializationPromise: Promise<void> | null = null;

  constructor() {
    this.pacientes = new Map();
    this.campanas = new Map();
    this.tareas = new Map();
    this.conversaciones = new Map();
    this.mensajes = new Map();
    this.citas = new Map();
    this.recordatorios = new Map();
    this.budgets = new Map();
    this.clinics = new Map();
    this.users = new Map();
    this.acciones = new Map();
    this.tratamientosPreventivos = new Map();
    this.reglasComunicacion = new Map();
    this.secuenciasComunicacion = new Map();
    
    // Inicializar con mock data (síncrono)
    this.inicializarMockData();
    
    // Inicializar secuencias y automatizaciones de forma asíncrona
    this.initializationPromise = this.initializeAsync();
  }

  private async initializeAsync(): Promise<void> {
    try {
      // Crear secuencias para presupuestos pendientes existentes
      await this.inicializarSecuenciasParaPresupuestosExistentes();
      
      // Crear secuencias de recall para pacientes dormidos
      await this.inicializarSecuenciasParaPacientesDormidos();
      
      // Iniciar automatizaciones
      this.iniciarAutomatizaciones();
      
      console.log('[Storage] Async initialization completed');
    } catch (error) {
      console.error('[Storage] Error during async initialization:', error);
    }
  }

  // Método para asegurar que la inicialización esté completa
  async ensureInitialized(): Promise<void> {
    try {
      // Verificar que hay datos básicos - SIEMPRE re-inicializar si están vacíos
      if (this.pacientes.size === 0 || this.budgets.size === 0) {
        console.log('[Storage] ensureInitialized: No data found, reinitializing...');
        console.log('[Storage] Current state - pacientes:', this.pacientes.size, 'budgets:', this.budgets.size);
        
        // Limpiar todo primero
        this.pacientes.clear();
        this.budgets.clear();
        this.citas.clear();
        this.campanas.clear();
        this.tareas.clear();
        this.conversaciones.clear();
        this.mensajes.clear();
        this.clinics.clear();
        this.tratamientosPreventivos.clear();
        this.reglasComunicacion.clear();
        this.secuenciasComunicacion.clear();
        
        // Re-inicializar datos mock (síncrono)
        try {
          this.inicializarMockData();
        } catch (error) {
          console.error('[Storage] ERROR in inicializarMockData:', error);
          if (error instanceof Error) {
            console.error('[Storage] Error message:', error.message);
            console.error('[Storage] Error stack:', error.stack);
          }
          // Re-lanzar el error para que se capture arriba
          // Esto es crítico - si no podemos inicializar, debemos saberlo
          throw error;
        }
        
        // Verificar inmediatamente después
        const pacientesCount = this.pacientes.size;
        const budgetsCount = this.budgets.size;
        console.log(`[Storage] After reinitialization - pacientes: ${pacientesCount}, budgets: ${budgetsCount}`);
        
        if (pacientesCount === 0 || budgetsCount === 0) {
          console.error('[Storage] WARNING: Data still empty after reinitialization!');
          console.error('[Storage] Endpoints will return empty arrays instead of crashing');
          // NO lanzar error - permitir que el servidor continúe
          // Los endpoints manejarán el caso de datos vacíos
        }
      }
      
      // Esperar a que la inicialización asíncrona complete (si existe)
      if (this.initializationPromise) {
        try {
          await this.initializationPromise;
        } catch (error) {
          console.error('[Storage] Error in async initialization, but continuing:', error);
          // No fallar si la inicialización asíncrona falla
        }
      }
      
      // Verificación final
      const pacientesCount = this.pacientes.size;
      const budgetsCount = this.budgets.size;
      console.log(`[Storage] ensureInitialized completed - pacientes: ${pacientesCount}, budgets: ${budgetsCount}`);
      
    } catch (error) {
      console.error('[Storage] ERROR in ensureInitialized:', error);
      if (error instanceof Error) {
        console.error('[Storage] Error message:', error.message);
        console.error('[Storage] Error stack:', error.stack);
      }
      // Re-lanzar el error para que las rutas lo capturen y devuelvan un error 500 apropiado
      // Esto es mejor que devolver datos vacíos silenciosamente
      throw error;
    }
  }
  
  
  private inicializarMockData() {
    try {
      console.log('[Storage] Starting mock data initialization...');
      console.log('[Storage] Environment:', process.env.NODE_ENV, 'VERCEL:', process.env.VERCEL);
      
      // Verificar si ya hay datos (en caso de reinicialización)
      const hasData = this.pacientes.size > 0 || this.budgets.size > 0;
      if (hasData) {
        console.log('[Storage] WARNING: Data already exists! Clearing before reinitialization...');
        this.pacientes.clear();
        this.budgets.clear();
        this.citas.clear();
        this.campanas.clear();
        this.tareas.clear();
        this.conversaciones.clear();
        this.mensajes.clear();
        this.clinics.clear();
        this.tratamientosPreventivos.clear();
        this.reglasComunicacion.clear();
        this.secuenciasComunicacion.clear();
      }
    
    // Generar y cargar clínicas primero
    const clinics = generarClinicsMock();
    clinics.forEach((clinic: Clinic) => {
      this.clinics.set(clinic.id, clinic);
    });
    console.log(`[Storage] ✓ Loaded ${clinics.length} clinics`);
    
    // Generar y cargar pacientes
    let pacientes: Paciente[];
    try {
      pacientes = generarPacientesMock();
      if (!pacientes || pacientes.length === 0) {
        throw new Error('generarPacientesMock returned empty array');
      }
      pacientes.forEach((paciente: Paciente) => {
        this.pacientes.set(paciente.id, paciente);
      });
      console.log(`[Storage] ✓ Loaded ${pacientes.length} pacientes`);
    } catch (error) {
      console.error('[Storage] ERROR generating pacientes:', error);
      throw new Error(`Failed to generate pacientes: ${error instanceof Error ? error.message : String(error)}`);
    }
    
    // Generar y cargar budgets (50 budgets)
    let budgets: Budget[];
    try {
      budgets = generarBudgetsMock(pacientes);
      if (!budgets || budgets.length === 0) {
        throw new Error('generarBudgetsMock returned empty array');
      }
      budgets.forEach((budget: Budget) => {
        this.budgets.set(budget.id, budget);
      });
      console.log(`[Storage] ✓ Loaded ${budgets.length} budgets`);
    } catch (error) {
      console.error('[Storage] ERROR generating budgets:', error);
      throw new Error(`Failed to generate budgets: ${error instanceof Error ? error.message : String(error)}`);
    }
    
    // Generar y cargar citas primero (necesario para tratamientos preventivos)
    let citas: Cita[];
    try {
      citas = generarCitasMock(pacientes);
      if (!citas || citas.length === 0) {
        throw new Error('generarCitasMock returned empty array');
      }
      citas.forEach((cita: Cita) => {
        this.citas.set(cita.id, cita);
      });
      console.log(`[Storage] ✓ Loaded ${citas.length} citas`);
    } catch (error) {
      console.error('[Storage] ERROR generating citas:', error);
      throw new Error(`Failed to generate citas: ${error instanceof Error ? error.message : String(error)}`);
    }
    
    // Generar y cargar tratamientos preventivos
    const tratamientosPreventivos = generarTratamientosPreventivosMock(pacientes, citas, budgets);
    tratamientosPreventivos.forEach((tratamiento: TratamientoPreventivo) => {
      this.tratamientosPreventivos.set(tratamiento.id, tratamiento);
    });
    console.log(`[Storage] ✓ Loaded ${tratamientosPreventivos.length} tratamientos preventivos`);
    
    // Generar y cargar campañas
    let campanas: Campana[];
    try {
      campanas = generarCampanasMock();
      if (!campanas || campanas.length === 0) {
        throw new Error('generarCampanasMock returned empty array');
      }
      campanas.forEach((campana: Campana) => {
        this.campanas.set(campana.id, campana);
      });
      console.log(`[Storage] ✓ Loaded ${campanas.length} campanas`);
    } catch (error) {
      console.error('[Storage] ERROR generating campanas:', error);
      throw new Error(`Failed to generate campanas: ${error instanceof Error ? error.message : String(error)}`);
    }
    
    // Generar y cargar tareas
    const tareas = generarTareasLlamadasMock(pacientes);
    const tareasCampana = generarTareasCampanaMock(pacientes, campanas);
    const todasLasTareas = [...tareas, ...tareasCampana];
    todasLasTareas.forEach((tarea: TareaLlamada) => {
      this.tareas.set(tarea.id, tarea);
    });
    console.log(`[Storage] ✓ Loaded ${todasLasTareas.length} tareas (${tareas.length} llamadas + ${tareasCampana.length} campaña)`);
    
    // Generar y cargar conversaciones y mensajes
    const { conversaciones, mensajes } = generarConversacionesMock(pacientes);
    conversaciones.forEach((conversacion: Conversacion) => {
      this.conversaciones.set(conversacion.id, conversacion);
    });
    mensajes.forEach((mensaje: Mensaje) => {
      this.mensajes.set(mensaje.id, mensaje);
    });
    console.log(`[Storage] ✓ Loaded ${conversaciones.length} conversaciones and ${mensajes.length} mensajes`);
    
    // Inicializar recordatorios por defecto
    this.inicializarRecordatoriosDefault();
    console.log(`[Storage] ✓ Initialized recordatorios`);
    
    // Inicializar reglas de comunicación por defecto
    this.inicializarReglasComunicacionDefault();
    console.log(`[Storage] ✓ Initialized reglas de comunicación`);
    
      // Verificación final
      console.log(`[Storage] Mock data initialization completed:`);
      console.log(`[Storage]   - Pacientes: ${this.pacientes.size}`);
      console.log(`[Storage]   - Budgets: ${this.budgets.size}`);
      console.log(`[Storage]   - Citas: ${this.citas.size}`);
      console.log(`[Storage]   - Campañas: ${this.campanas.size}`);
      console.log(`[Storage]   - Tareas: ${this.tareas.size}`);
      console.log(`[Storage]   - Conversaciones: ${this.conversaciones.size}`);
      
      // Verificar que los datos críticos se cargaron
      if (this.pacientes.size === 0) {
        throw new Error('Failed to load pacientes - pacientes.size is 0');
      }
      if (this.budgets.size === 0) {
        throw new Error('Failed to load budgets - budgets.size is 0');
      }
      if (this.citas.size === 0) {
        throw new Error('Failed to load citas - citas.size is 0');
      }
      if (this.campanas.size === 0) {
        throw new Error('Failed to load campanas - campanas.size is 0');
      }
      
      console.log('[Storage] ✓ All critical data loaded successfully');
      
      // Las secuencias se inicializan en initializeAsync() para asegurar que se completen
    } catch (error) {
      console.error('[Storage] CRITICAL ERROR in inicializarMockData:', error);
      if (error instanceof Error) {
        console.error('[Storage] Error message:', error.message);
        console.error('[Storage] Error stack:', error.stack);
      }
      // Re-lanzar el error para que se maneje arriba
      throw error;
    }
  }
  
  // Crear secuencias para presupuestos pendientes que ya existen
  private async inicializarSecuenciasParaPresupuestosExistentes() {
    const budgetsPendientes = Array.from(this.budgets.values())
      .filter(b => b.status === "pending");
    
    const reglasRelance = Array.from(this.reglasComunicacion.values())
      .filter(r => r.tipo === "relance_presupuesto" && r.activa);
    
    if (reglasRelance.length === 0) return;
    const regla = reglasRelance[0];
    const pasos = regla.secuencia as PasoComunicacion[];
    if (pasos.length === 0) return;
    
    const ahora = new Date();
    const hoy = new Date(ahora);
    hoy.setHours(0, 0, 0, 0);
    
    // Crear secuencias para algunos presupuestos con acciones programadas para hoy
    let contadorEjemplos = 0;
    const horasEjemplo = [9, 11, 14, 16, 18]; // Horas del día para distribuir las acciones
    
    for (const budget of budgetsPendientes) {
      // Verificar si ya tiene una secuencia
      const secuenciaExistente = await this.getSecuenciaComunicacionPorBudget(budget.id);
      if (secuenciaExistente) continue;
      
      // Para los primeros 5 presupuestos, crear secuencias con acciones para hoy
      if (contadorEjemplos < 5) {
        const proximaAccion = new Date(hoy);
        proximaAccion.setHours(horasEjemplo[contadorEjemplos], Math.floor(Math.random() * 60), 0, 0);
        
        await this.createSecuenciaComunicacion({
          reglaId: regla.id,
          pacienteId: budget.patientId,
          budgetId: budget.id,
          tipo: "relance_presupuesto",
          estado: "activa",
          pasoActual: 0,
          fechaInicio: new Date(ahora.getTime() - (2 + contadorEjemplos) * 24 * 60 * 60 * 1000), // Hace 2-6 días
          ultimaAccion: null,
          proximaAccion,
          respuestaRecibida: false,
          metadata: {
            reglaNombre: regla.nombre,
            pasosTotales: pasos.length,
          },
        });
        
        contadorEjemplos++;
      } else {
        // Para el resto, crear secuencias normales
        await this.iniciarSecuenciaRelance(budget.id, budget.patientId);
      }
    }
  }
  
  private inicializarRecordatoriosDefault() {
    const recordatoriosDefault: Recordatorio[] = [
      {
        id: randomUUID(),
        nombre: "Recordatorio 24h antes",
        canal: "sms",
        mensaje: "Hola {nombre}, le recordamos que tiene una cita mañana a las {hora} en nuestra clínica. Responda CONFIRMAR para confirmar o llame al {telefono_clinica} para reprogramar.",
        horasAntes: 24,
        activo: true,
      },
      {
        id: randomUUID(),
        nombre: "Recordatorio 2h antes",
        canal: "whatsapp",
        mensaje: "Hola {nombre}, le recordamos que su cita es en 2 horas ({hora}). Le esperamos en nuestra clínica. Si necesita reprogramar, responda a este mensaje.",
        horasAntes: 2,
        activo: true,
      },
    ];
    
    recordatoriosDefault.forEach(r => {
      this.recordatorios.set(r.id, r);
    });
  }

  private inicializarReglasComunicacionDefault() {
    // Regla por defecto: Relances de presupuestos
    // WhatsApp 2 días después → Email 2 días sin respuesta → Llamada 2 días después
    const reglaRelances: ReglaComunicacion = {
      id: randomUUID(),
      nombre: "Relance Presupuesto Estándar",
      tipo: "relance_presupuesto",
      activa: true,
      secuencia: [
        {
          orden: 1,
          canal: "whatsapp",
          diasDespues: 2,
          accion: "enviar",
          requiereConfirmacion: false,
        },
        {
          orden: 2,
          canal: "email",
          diasDespues: 2,
          accion: "enviar",
          requiereConfirmacion: false,
        },
        {
          orden: 3,
          canal: "llamada",
          diasDespues: 2,
          accion: "programar_llamada",
          requiereConfirmacion: true,
        },
      ],
      criterios: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.reglasComunicacion.set(reglaRelances.id, reglaRelances);

    // Regla por defecto: Recordatorios de citas
    const reglaRecordatorios: ReglaComunicacion = {
      id: randomUUID(),
      nombre: "Recordatorio Cita Estándar",
      tipo: "recordatorio_cita",
      activa: true,
      secuencia: [
        {
          orden: 1,
          canal: "whatsapp",
          diasDespues: 1, // 24h antes
          accion: "enviar",
          requiereConfirmacion: false,
        },
        {
          orden: 2,
          canal: "sms",
          diasDespues: 0, // 1h antes (se calcula en horas)
          accion: "enviar",
          requiereConfirmacion: false,
        },
      ],
      criterios: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.reglasComunicacion.set(reglaRecordatorios.id, reglaRecordatorios);

    // Regla por defecto: Mensajes post-visita
    const reglaPostVisita: ReglaComunicacion = {
      id: randomUUID(),
      nombre: "Post-Visita Estándar",
      tipo: "post_visita",
      activa: true,
      secuencia: [
        {
          orden: 1,
          canal: "whatsapp",
          diasDespues: 7,
          accion: "enviar",
          requiereConfirmacion: false,
        },
      ],
      criterios: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.reglasComunicacion.set(reglaPostVisita.id, reglaPostVisita);

    // Regla por defecto: Salud preventiva
    const reglaPreventiva: ReglaComunicacion = {
      id: randomUUID(),
      nombre: "Salud Preventiva Estándar",
      tipo: "salud_preventiva",
      activa: true,
      secuencia: [
        {
          orden: 1,
          canal: "whatsapp",
          diasDespues: 0, // Cuando vence la fecha recomendada
          accion: "enviar",
          requiereConfirmacion: false,
        },
        {
          orden: 2,
          canal: "sms",
          diasDespues: 7,
          accion: "enviar",
          requiereConfirmacion: false,
        },
        {
          orden: 3,
          canal: "email",
          diasDespues: 7,
          accion: "enviar",
          requiereConfirmacion: false,
        },
      ],
      criterios: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.reglasComunicacion.set(reglaPreventiva.id, reglaPreventiva);

    // Crear 3 campañas de recall contextuales basadas en antecedentes médicos
    // Similar estructura a presupuestos pero contextual a diagnósticos
    const campañasRecall: ReglaComunicacion[] = [
      {
        id: randomUUID(),
        nombre: "Recall - Salud Periodontal",
        tipo: "recall_paciente",
        activa: true,
        secuencia: [
          {
            orden: 1,
            canal: "whatsapp",
            diasDespues: 0,
            accion: "enviar",
            mensaje: "Hola {nombre}, 👋\n\nRecordamos tu historial de salud periodontal. Es importante mantener controles regulares para prevenir complicaciones.\n\n¿Te gustaría agendar una revisión?",
            requiereConfirmacion: false,
          },
          {
            orden: 2,
            canal: "email",
            diasDespues: 3,
            accion: "enviar",
            mensaje: "Estimado/a {nombre},\n\nBasado en su historial de salud periodontal, le recomendamos una revisión periódica. La prevención es clave para mantener sus encías saludables.\n\nLe invitamos a agendar su cita.\n\nSaludos cordiales,\nClínica Dental",
            requiereConfirmacion: false,
          },
          {
            orden: 3,
            canal: "sms",
            diasDespues: 5,
            accion: "enviar",
            mensaje: "Hola {nombre}, tu revisión periodontal está pendiente. Es importante para tu salud bucal. Responde SÍ para agendar.",
            requiereConfirmacion: false,
          },
          {
            orden: 4,
            canal: "llamada",
            diasDespues: 7,
            accion: "programar_llamada",
            mensaje: "Llamada para recordar importancia de controles periodontales y agendar revisión",
            requiereConfirmacion: true,
          },
        ],
        criterios: { diagnostico: "periodontal" },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: randomUUID(),
        nombre: "Recall - Tratamientos Incompletos",
        tipo: "recall_paciente",
        activa: true,
        secuencia: [
          {
            orden: 1,
            canal: "whatsapp",
            diasDespues: 0,
            accion: "enviar",
            mensaje: "Hola {nombre}, 👋\n\nRecordamos que tenías un tratamiento pendiente relacionado con tu diagnóstico. Es importante completarlo para evitar complicaciones.\n\n¿Te gustaría retomar tu tratamiento?",
            requiereConfirmacion: false,
          },
          {
            orden: 2,
            canal: "email",
            diasDespues: 2,
            accion: "enviar",
            mensaje: "Estimado/a {nombre},\n\nLe recordamos que tiene un tratamiento pendiente. Completarlo es fundamental para su salud bucal y evitar problemas mayores.\n\nEstaremos encantados de continuar con su cuidado.\n\nSaludos cordiales,\nClínica Dental",
            requiereConfirmacion: false,
          },
          {
            orden: 3,
            canal: "sms",
            diasDespues: 4,
            accion: "enviar",
            mensaje: "Hola {nombre}, tu tratamiento está pendiente. Es importante completarlo. Responde SÍ para agendar.",
            requiereConfirmacion: false,
          },
          {
            orden: 4,
            canal: "llamada",
            diasDespues: 5,
            accion: "programar_llamada",
            mensaje: "Llamada urgente para recordar tratamiento incompleto y ofrecer continuar el cuidado",
            requiereConfirmacion: true,
          },
        ],
        criterios: { tratamientoIncompleto: true },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: randomUUID(),
        nombre: "Recall - Prevención y Revisión",
        tipo: "recall_paciente",
        activa: true,
        secuencia: [
          {
            orden: 1,
            canal: "whatsapp",
            diasDespues: 0,
            accion: "enviar",
            mensaje: "Hola {nombre}, 👋\n\nHace tiempo que no te vemos. Una revisión periódica es clave para detectar problemas a tiempo y mantener tu salud bucal.\n\n¿Te gustaría agendar tu revisión?",
            requiereConfirmacion: false,
          },
          {
            orden: 2,
            canal: "sms",
            diasDespues: 5,
            accion: "enviar",
            mensaje: "Hola {nombre}, tu revisión dental está pendiente. La prevención es la mejor medicina. Responde SÍ para agendar.",
            requiereConfirmacion: false,
          },
          {
            orden: 3,
            canal: "email",
            diasDespues: 7,
            accion: "enviar",
            mensaje: "Estimado/a {nombre},\n\nLe recordamos la importancia de las revisiones periódicas. Detectar problemas a tiempo puede ahorrarle tratamientos más complejos.\n\nLe invitamos a agendar su cita de revisión.\n\nSaludos cordiales,\nClínica Dental",
            requiereConfirmacion: false,
          },
          {
            orden: 4,
            canal: "llamada",
            diasDespues: 10,
            accion: "programar_llamada",
            mensaje: "Llamada para invitar a revisión preventiva y recuperar relación con el paciente",
            requiereConfirmacion: true,
          },
        ],
        criterios: { mesesSinVisita: 6 },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    campañasRecall.forEach(regla => {
      this.reglasComunicacion.set(regla.id, regla);
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

  async getPacientesEnRiesgo(): Promise<Paciente[]> {
    const ahora = new Date();
    const pacientes = Array.from(this.pacientes.values());
    
    return pacientes.filter(p => {
      if (p.tieneCitaFutura) return false; // Si tiene cita futura, no está en riesgo
      
      const diffTime = Math.abs(ahora.getTime() - p.ultimaVisita.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const mesesSinVisita = Math.floor(diffDays / 30);
      
      // Pacientes en riesgo: entre 4 y 6 meses sin visita (a punto de estar dormidos)
      return mesesSinVisita >= 4 && mesesSinVisita <= 6;
    });
  }

  async getPacientesListosParaCampana(campanaId: string): Promise<Paciente[]> {
    const campana = await this.getCampana(campanaId);
    if (!campana) return [];

    const pacientes = Array.from(this.pacientes.values());
    const ahora = new Date();
    
    // Filtrar pacientes según la segmentación de la campaña
    // Por ahora, retornamos pacientes perdidos que no están en ninguna campaña
    return pacientes.filter(p => {
      if (p.enCampana) return false; // Ya está en una campaña
      if (p.tieneCitaFutura) return false; // Tiene cita futura
      
      const diffTime = Math.abs(ahora.getTime() - p.ultimaVisita.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const mesesSinVisita = Math.floor(diffDays / 30);
      
      // Pacientes que llevan más de 6 meses sin visita
      return mesesSinVisita >= 6;
    });
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
    return Array.from(this.campanas.values()).sort((a, b) => {
      const fechaA = a.fechaCreacion ? new Date(a.fechaCreacion).getTime() : 0;
      const fechaB = b.fechaCreacion ? new Date(b.fechaCreacion).getTime() : 0;
      return fechaB - fechaA;
    });
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
      plantillaSMS: insertCampana.plantillaSMS || null,
      plantillaEmail: insertCampana.plantillaEmail || null,
      guionLlamada: insertCampana.guionLlamada || null,
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

  async updateTarea(id: string, updates: {
    estado?: string;
    notas?: string | null;
    aprobado?: boolean;
    fechaProgramada?: string | null;
    fechaContacto?: string | null;
    fechaCompletada?: string | null;
  }): Promise<TareaLlamada | undefined> {
    const tarea = this.tareas.get(id);
    if (tarea) {
      if (updates.estado !== undefined) {
        tarea.estado = updates.estado;
      }
      if (updates.notas !== undefined) {
        tarea.notas = updates.notas;
      }
      if (updates.aprobado !== undefined) {
        tarea.aprobado = updates.aprobado;
      }
      if (updates.fechaProgramada !== undefined) {
        tarea.fechaProgramada = updates.fechaProgramada ? new Date(updates.fechaProgramada) : null;
      }
      if (updates.fechaContacto !== undefined) {
        tarea.fechaContacto = updates.fechaContacto ? new Date(updates.fechaContacto) : null;
      }
      if (updates.fechaCompletada !== undefined) {
        tarea.fechaCompletada = updates.fechaCompletada ? new Date(updates.fechaCompletada) : null;
      }
      this.tareas.set(id, tarea);
    }
    return tarea;
  }

  async getTareasParaHoy(): Promise<TareaLlamada[]> {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const mañana = new Date(hoy);
    mañana.setDate(mañana.getDate() + 1);
    
    const tareas = Array.from(this.tareas.values());
    
    return tareas.filter(t => {
      // Tareas aprobadas y programadas para hoy, o sin fecha programada pero aprobadas
      if (!t.aprobado || t.estado !== "pendiente") return false;
      
      if (!t.fechaProgramada) return true; // Sin fecha = para hoy
      
      const fechaProgramada = new Date(t.fechaProgramada);
      fechaProgramada.setHours(0, 0, 0, 0);
      
      return fechaProgramada.getTime() === hoy.getTime();
    });
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
      type: insertMensaje.type || "mensaje",
      channel: insertMensaje.channel || "whatsapp",
      conversacionId: insertMensaje.conversacionId || null,
      patientId: insertMensaje.patientId || null,
      budgetId: insertMensaje.budgetId || null,
      direccion: insertMensaje.direccion || "saliente",
      openedAt: insertMensaje.openedAt || null,
      leido: insertMensaje.direccion === "saliente" ? true : false,
    };
    this.mensajes.set(id, mensaje);
    
    // Actualizar ultimo mensaje de la conversación
    if (insertMensaje.conversacionId) {
      const conv = this.conversaciones.get(insertMensaje.conversacionId);
      if (conv) {
        conv.ultimoMensaje = insertMensaje.contenido;
        conv.fechaUltimoMensaje = insertMensaje.fechaEnvio;
        if (insertMensaje.direccion === "entrante") {
          conv.noLeidos = (conv.noLeidos || 0) + 1;
        }
        this.conversaciones.set(conv.id, conv);
      }
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

  // Citas
  async getCitas(): Promise<Cita[]> {
    return Array.from(this.citas.values()).sort((a, b) => 
      a.fechaHora.getTime() - b.fechaHora.getTime()
    );
  }

  async getCitasPorSemana(inicio: Date, fin: Date): Promise<Cita[]> {
    const todasLasCitas = Array.from(this.citas.values());
    console.log(`[Storage] getCitasPorSemana - Total citas: ${todasLasCitas.length}`);
    console.log(`[Storage] Rango buscado - inicio: ${inicio.toISOString()}, fin: ${fin.toISOString()}`);
    
    if (todasLasCitas.length > 0) {
      const primeraCita = todasLasCitas[0];
      const ultimaCita = todasLasCitas[todasLasCitas.length - 1];
      console.log(`[Storage] Primera cita: ${primeraCita.fechaHora.toISOString()}`);
      console.log(`[Storage] Última cita: ${ultimaCita.fechaHora.toISOString()}`);
    }
    
    const citasFiltradas = todasLasCitas.filter(cita => {
      const fechaCita = cita.fechaHora.getTime();
      const inicioTime = inicio.getTime();
      const finTime = fin.getTime();
      const dentroRango = fechaCita >= inicioTime && fechaCita <= finTime;
      
      // Log todas las citas de semana 0 y 1 para debug
      const fechaCitaDate = new Date(fechaCita);
      const inicioDate = new Date(inicioTime);
      const finDate = new Date(finTime);
      
      // Verificar si la cita está en semana 0 o 1 (basado en el rango buscado)
      if (fechaCita >= inicioTime - (7 * 24 * 60 * 60 * 1000) && fechaCita <= finTime + (7 * 24 * 60 * 60 * 1000)) {
        console.log(`[Storage] Cita ${todasLasCitas.indexOf(cita)}: ${cita.fechaHora.toISOString()} (${fechaCita}) - Rango: ${inicio.toISOString()} (${inicioTime}) a ${fin.toISOString()} (${finTime}) - Dentro: ${dentroRango}`);
      }
      
      return dentroRango;
    });
    
    console.log(`[Storage] Citas en rango: ${citasFiltradas.length}`);
    
    return citasFiltradas.sort((a, b) => a.fechaHora.getTime() - b.fechaHora.getTime());
  }

  async getCita(id: string): Promise<Cita | undefined> {
    return this.citas.get(id);
  }

  async createCita(insertCita: InsertCita): Promise<Cita> {
    const id = randomUUID();
    const cita: Cita = {
      ...insertCita,
      id,
      duracionMinutos: insertCita.duracionMinutos ?? 30,
      notas: insertCita.notas ?? null,
      doctor: insertCita.doctor ?? null,
      sala: insertCita.sala ?? null,
      origen: insertCita.origen ?? null,
    };
    this.citas.set(id, cita);
    return cita;
  }

  async updateCitaEstado(id: string, estado: string): Promise<Cita | undefined> {
    const cita = this.citas.get(id);
    if (cita) {
      cita.estado = estado;
      this.citas.set(id, cita);
    }
    return cita;
  }

  async updateCitaFechaHora(id: string, fechaHora: Date): Promise<Cita | undefined> {
    const cita = this.citas.get(id);
    if (cita) {
      cita.fechaHora = fechaHora;
      this.citas.set(id, cita);
    }
    return cita;
  }

  async detectarHuecosLibres(fechaInicio: Date, fechaFin: Date, duracionMinutos: number = 30): Promise<Array<{ fecha: Date; horaInicio: number; horaFin: number; duracion: number }>> {
    const huecos: Array<{ fecha: Date; horaInicio: number; horaFin: number; duracion: number }> = [];
    const citas = Array.from(this.citas.values())
      .filter(c => {
        const fechaCita = new Date(c.fechaHora);
        return fechaCita >= fechaInicio && fechaCita <= fechaFin && c.estado !== "cancelada";
      });

    // Horarios de trabajo: 9:00 - 19:00
    const HORA_INICIO = 9;
    const HORA_FIN = 19;
    const DURACION_MINIMA = duracionMinutos;

    // Iterar por cada día en el rango
    const fechaActual = new Date(fechaInicio);
    fechaActual.setHours(0, 0, 0, 0);

    while (fechaActual <= fechaFin) {
      // Obtener citas del día
      const citasDelDia = citas.filter(c => {
        const fechaCita = new Date(c.fechaHora);
        return fechaCita.toDateString() === fechaActual.toDateString();
      }).sort((a, b) => new Date(a.fechaHora).getTime() - new Date(b.fechaHora).getTime());

      // Detectar huecos entre citas
      let horaActual = HORA_INICIO;

      for (const cita of citasDelDia) {
        const fechaCita = new Date(cita.fechaHora);
        const horaCita = fechaCita.getHours();
        const minutosCita = fechaCita.getMinutes();
        const duracionCita = cita.duracionMinutos || 30;
        const horaFinCita = horaCita + Math.ceil(duracionCita / 60);

        // Si hay un hueco antes de esta cita
        if (horaActual < horaCita) {
          const duracionHueco = (horaCita - horaActual) * 60;
          if (duracionHueco >= DURACION_MINIMA) {
            huecos.push({
              fecha: new Date(fechaActual),
              horaInicio: horaActual,
              horaFin: horaCita,
              duracion: duracionHueco,
            });
          }
        }

        horaActual = horaFinCita;
      }

      // Verificar si hay un hueco al final del día
      if (horaActual < HORA_FIN) {
        const duracionHueco = (HORA_FIN - horaActual) * 60;
        if (duracionHueco >= DURACION_MINIMA) {
          huecos.push({
            fecha: new Date(fechaActual),
            horaInicio: horaActual,
            horaFin: HORA_FIN,
            duracion: duracionHueco,
          });
        }
      }

      // Avanzar al siguiente día
      fechaActual.setDate(fechaActual.getDate() + 1);
    }

    return huecos;
  }

  async sugerirPacientesParaHueco(fecha: Date, horaInicio: number, horaFin: number, limite: number = 5): Promise<Array<{ paciente: Paciente; motivo: string; prioridad: number }>> {
    const sugerencias: Array<{ paciente: Paciente; motivo: string; prioridad: number }> = [];
    const pacientes = Array.from(this.pacientes.values());
    const ahora = new Date();

    // 1. Pacientes con recordatorios preventivos pendientes
    const recordatoriosPreventivos = await this.getRecordatoriosPreventivosPendientes();
    for (const recordatorio of recordatoriosPreventivos.slice(0, limite * 2)) {
      const paciente = this.pacientes.get(recordatorio.pacienteId);
      if (!paciente || paciente.tieneCitaFutura) continue;

      const diasVencidos = recordatorio.diasVencidos;
      const prioridad = Math.min(100, 50 + diasVencidos * 2); // Más días = más prioridad

      sugerencias.push({
        paciente,
        motivo: `Necesita ${recordatorio.tipoTratamiento} (${Math.floor(diasVencidos / 30)} meses de retraso)`,
        prioridad,
      });
    }

    // 2. Pacientes dormidos sin cita futura
    const pacientesDormidos = await this.getPacientesPerdidos();
    for (const paciente of pacientesDormidos.slice(0, limite * 2)) {
      if (paciente.tieneCitaFutura) continue;

      const mesesSinVisita = paciente.mesesSinVisita || 0;
      const prioridad = Math.min(100, 40 + mesesSinVisita * 5);

      sugerencias.push({
        paciente,
        motivo: `Paciente dormido (${mesesSinVisita} meses sin visita)`,
        prioridad,
      });
    }

    // 3. Pacientes en riesgo (4-6 meses sin visita)
    const pacientesEnRiesgo = await this.getPacientesEnRiesgo();
    for (const paciente of pacientesEnRiesgo.slice(0, limite)) {
      if (paciente.tieneCitaFutura) continue;

      sugerencias.push({
        paciente,
        motivo: "Paciente en riesgo de convertirse en dormido",
        prioridad: 30,
      });
    }

    // Ordenar por prioridad y eliminar duplicados
    const pacientesUnicos = new Map<string, { paciente: Paciente; motivo: string; prioridad: number }>();
    for (const sugerencia of sugerencias) {
      const existente = pacientesUnicos.get(sugerencia.paciente.id);
      if (!existente || sugerencia.prioridad > existente.prioridad) {
        pacientesUnicos.set(sugerencia.paciente.id, sugerencia);
      }
    }

    return Array.from(pacientesUnicos.values())
      .sort((a, b) => b.prioridad - a.prioridad)
      .slice(0, limite);
  }

  // Recordatorios
  async getRecordatorios(): Promise<Recordatorio[]> {
    return Array.from(this.recordatorios.values());
  }

  async getRecordatorio(id: string): Promise<Recordatorio | undefined> {
    return this.recordatorios.get(id);
  }

  async createRecordatorio(insertRecordatorio: InsertRecordatorio): Promise<Recordatorio> {
    const id = randomUUID();
    const recordatorio: Recordatorio = {
      ...insertRecordatorio,
      id,
      activo: insertRecordatorio.activo ?? true,
    };
    this.recordatorios.set(id, recordatorio);
    return recordatorio;
  }

  async updateRecordatorio(id: string, data: Partial<InsertRecordatorio>): Promise<Recordatorio | undefined> {
    const recordatorio = this.recordatorios.get(id);
    if (recordatorio) {
      const updated: Recordatorio = {
        ...recordatorio,
        ...data,
      };
      this.recordatorios.set(id, updated);
      return updated;
    }
    return undefined;
  }

  async deleteRecordatorio(id: string): Promise<boolean> {
    return this.recordatorios.delete(id);
  }

  // Budgets (DentalIQ)
  async getBudgets(): Promise<BudgetWithPatient[]> {
    const budgets = Array.from(this.budgets.values());
    return budgets.map(budget => {
      const patient = this.pacientes.get(budget.patientId);
      if (!patient) {
        throw new Error(`Patient not found for budget ${budget.id}`);
      }
      return {
        ...budget,
        patientName: patient.nombre,
        patientEmail: patient.email,
        patientPhone: patient.telefono,
        patientWhatsapp: patient.whatsapp || undefined,
      };
    }).sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });
  }

  async getBudget(id: string): Promise<BudgetWithPatient | undefined> {
    const budget = this.budgets.get(id);
    if (!budget) return undefined;
    
    const patient = this.pacientes.get(budget.patientId);
    if (!patient) return undefined;
    
    return {
      ...budget,
      patientName: patient.nombre,
      patientEmail: patient.email,
      patientPhone: patient.telefono,
      patientWhatsapp: patient.whatsapp || undefined,
    };
  }

  async createBudget(budgetData: InsertBudget & { treatmentDetails: string }): Promise<Budget> {
    const id = randomUUID();
    const patient = this.pacientes.get(budgetData.patientId);
    if (!patient) {
      throw new Error("Patient not found");
    }

    // Parse treatment details
    let treatmentDetailsJson: any = {};
    try {
      // Try to parse as JSON first
      treatmentDetailsJson = JSON.parse(budgetData.treatmentDetails);
    } catch {
      // If not JSON, create structure from text
      const procedures = budgetData.treatmentDetails
        .split(/[,\n]/)
        .map(p => p.trim())
        .filter(p => p.length > 0);
      treatmentDetailsJson = {
        procedures,
        total: Number(budgetData.amount),
      };
    }

    // Calculate AI scores
    const amountNumber = Number(budgetData.amount);
    const urgencyScore = await calculateUrgencyScore(
      { amount: amountNumber, treatmentDetails: treatmentDetailsJson },
      {
        nombre: patient.nombre,
        edad: patient.edad,
        historial: patient.diagnostico,
        ultimaVisita: patient.ultimaVisita,
        budgetsAnteriores: Array.from(this.budgets.values())
          .filter(b => b.patientId === budgetData.patientId)
          .map(b => ({ amount: Number(b.amount), status: b.status })),
      }
    );

    const acceptanceProb = await calculateAcceptanceProb(
      { amount: amountNumber, treatmentDetails: treatmentDetailsJson },
      {
        nombre: patient.nombre,
        edad: patient.edad,
        historial: patient.diagnostico,
        ultimaVisita: patient.ultimaVisita,
        budgetsAnteriores: Array.from(this.budgets.values())
          .filter(b => b.patientId === budgetData.patientId)
          .map(b => ({ amount: Number(b.amount), status: b.status })),
      }
    );

    const priority = calculatePriority(urgencyScore, acceptanceProb);

    const budget: Budget = {
      ...budgetData,
      id,
      treatmentDetails: treatmentDetailsJson,
      urgencyScore,
      acceptanceProb,
      priority,
      status: budgetData.status || "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.budgets.set(id, budget);
    
    // Crear acción de scoring automático
    await this.createAccion({
      tipo: "scoring",
      estado: "ejecutada",
      titulo: `Scoring IA calculado - ${patient.nombre}`,
      descripcion: `Urgencia: ${urgencyScore}, Aceptación: ${acceptanceProb}%, Prioridad: ${priority}`,
      pacienteId: budget.patientId,
      budgetId: budget.id,
      canal: null,
      mensaje: null,
      requiereConfirmacion: false,
      ejecutadaAt: new Date(),
      metadata: {
        urgencyScore,
        acceptanceProb,
        priority,
      },
    });
    
    // Si el presupuesto está pendiente, crear secuencia de comunicación automática
    if (budget.status === "pending") {
      await this.iniciarSecuenciaRelance(budget.id, budget.patientId);
    }
    
    return budget;
  }

  async updateBudgetStatus(id: string, status: string): Promise<Budget | undefined> {
    const budget = this.budgets.get(id);
    if (budget) {
      budget.status = status as "pending" | "accepted" | "rejected";
      budget.updatedAt = new Date();
      this.budgets.set(id, budget);
    }
    return budget;
  }

  // Clinics
  async getClinics(): Promise<Clinic[]> {
    return Array.from(this.clinics.values());
  }

  async createClinic(clinicData: InsertClinic): Promise<Clinic> {
    const id = randomUUID();
    const clinic: Clinic = {
      ...clinicData,
      id,
      address: clinicData.address || null,
      createdAt: new Date(),
    };
    this.clinics.set(id, clinic);
    return clinic;
  }

  // Users
  async getUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async createUser(userData: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      ...userData,
      id,
      clinicId: userData.clinicId || null,
      role: userData.role || "reception",
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  // DentalIQ KPIs
  async getDentalIQKPIs(): Promise<DentalIQKPIs> {
    const budgets = Array.from(this.budgets.values());
    const total = budgets.length;
    console.log(`[Storage] getDentalIQKPIs called - total budgets: ${total}`);
    console.log(`[Storage] pacientes count: ${this.pacientes.size}`);
    console.log(`[Storage] budgets map size: ${this.budgets.size}`);
    
    // Tasa de aceptación fija del 26%
    const tasaAceptacion = 26.0;
    const tasaAceptacionGoal = tasaAceptacion + 20; // Meta: 46%
    
    // Calcular budgets aceptados basados en la tasa del 26%
    const accepted = Math.round(total * (tasaAceptacion / 100));
    const rejected = Math.round(total * 0.1); // Asumir 10% rechazados
    
    // Facturación generada honesta basada en datos reales:
    // - 10 presupuestos aceptados
    // - Media de 800€ por presupuesto
    // - Total: 10 × 800€ = 8,000€
    const presupuestosObjetivo = 10;
    const mediaPresupuesto = 800; // € por presupuesto
    
    // Si tenemos 10 o más presupuestos aceptados, facturación = 10 × 800€ = 8,000€
    // Si tenemos menos, calculamos proporcionalmente
    const treatmentsAceptados = Math.min(accepted, presupuestosObjetivo);
    const facturacionGenerada = treatmentsAceptados * mediaPresupuesto;

    // Calcular tasa de transformación mensual basada en tasa del 26%
    // Variación mensual alrededor del 26% (±5%)
    const ahora = new Date();
    const mesesNombres = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    const tasaTransformacionMensual: Array<{ mes: string; tasa: number }> = [];
    
    // Calcular para los últimos 6 meses con variación alrededor del 26%
    const variacionesMensuales = [2.5, -1.8, 3.2, -0.5, 1.5, -2.1]; // Variaciones en porcentaje
    
    for (let i = 5; i >= 0; i--) {
      const fechaMes = new Date(ahora.getFullYear(), ahora.getMonth() - i, 1);
      const mesNombre = mesesNombres[fechaMes.getMonth()];
      
      // Calcular tasa mensual con variación alrededor del 26%
      const variacion = variacionesMensuales[5 - i] || 0;
      const tasaMes = Math.max(0, Math.min(100, tasaAceptacion + variacion));
      
      tasaTransformacionMensual.push({
        mes: mesNombre,
        tasa: Math.round(tasaMes * 10) / 10, // Redondear a 1 decimal
      });
    }

    // Calcular rechazos motivos basados en budgets rechazados calculados
    const rechazosMotivos = [
      { motivo: "precio", cantidad: Math.max(1, Math.floor(rejected * 0.5)) },
      { motivo: "miedo", cantidad: Math.max(1, Math.floor(rejected * 0.2)) },
      { motivo: "comprension", cantidad: Math.max(1, Math.floor(rejected * 0.15)) },
      { motivo: "urgencia", cantidad: Math.max(1, Math.floor(rejected * 0.1)) },
      { motivo: "otro", cantidad: Math.max(1, Math.floor(rejected * 0.05)) },
    ];

    // Calcular horas ahorradas basadas en la tasa de aceptación del 26%
    // Mínimo 8 horas semanales ahorradas gracias a la automatización
    const minutosAhorradosPorBudget = 15; // 15 minutos por budget aceptado gracias a automatización
    const minutosAhorrados = accepted * minutosAhorradosPorBudget;
    // Convertir a horas semanales (asumiendo que los budgets se distribuyen en el tiempo)
    const budgetsPorSemana = Math.max(1, Math.round(total / 4)); // Aproximadamente 4 semanas
    const aceptadosPorSemana = Math.round(budgetsPorSemana * (tasaAceptacion / 100));
    const horasAhorradasCalculadas = Math.round((aceptadosPorSemana * minutosAhorradosPorBudget / 60) * 10) / 10;
    // Mínimo 8 horas semanales
    const horasAhorradas = Math.max(8, horasAhorradasCalculadas);

    const result = {
      tasaAceptacion: Math.round(tasaAceptacion * 10) / 10, // Redondear a 1 decimal
      tasaAceptacionGoal: Math.round(tasaAceptacionGoal * 10) / 10,
      horasAhorradas: horasAhorradas || 0,
      treatmentsAceptados: treatmentsAceptados || 0,
      facturacionGenerada: facturacionGenerada || 0,
      tasaTransformacionMensual,
      rechazosMotivos,
    };
    
    console.log(`[KPIs] Resultado final:`, result);
    
    return result;
  }

  // Acciones Automatizadas
  async getAcciones(filtros?: { estado?: string; tipo?: string; limit?: number }): Promise<AccionConDatos[]> {
    let acciones = Array.from(this.acciones.values());
    
    if (filtros?.estado) {
      acciones = acciones.filter(a => a.estado === filtros.estado);
    }
    if (filtros?.tipo) {
      acciones = acciones.filter(a => a.tipo === filtros.tipo);
    }
    
    acciones.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });
    
    if (filtros?.limit) {
      acciones = acciones.slice(0, filtros.limit);
    }
    
    return acciones.map(accion => {
      const result: AccionConDatos = { ...accion };
      
      if (accion.pacienteId) {
        const paciente = this.pacientes.get(accion.pacienteId);
        if (paciente) result.pacienteNombre = paciente.nombre;
      }
      
      if (accion.budgetId) {
        const budget = this.budgets.get(accion.budgetId);
        if (budget) result.budgetMonto = budget.amount;
      }
      
      if (accion.citaId) {
        const cita = this.citas.get(accion.citaId);
        if (cita) result.citaFecha = cita.fechaHora;
      }
      
      return result;
    });
  }

  async createAccion(accionData: InsertAccion): Promise<Accion> {
    const id = randomUUID();
    const accion: Accion = {
      ...accionData,
      id,
      estado: accionData.estado || "pendiente",
      requiereConfirmacion: accionData.requiereConfirmacion ?? false,
      descripcion: accionData.descripcion || null,
      pacienteId: accionData.pacienteId || null,
      budgetId: accionData.budgetId || null,
      citaId: accionData.citaId || null,
      canal: accionData.canal || null,
      mensaje: accionData.mensaje || null,
      metadata: accionData.metadata || null,
      ejecutadaAt: accionData.ejecutadaAt || null,
      confirmadaAt: null,
      createdAt: new Date(),
    };
    this.acciones.set(id, accion);
    return accion;
  }

  async updateAccionEstado(id: string, estado: string): Promise<Accion | undefined> {
    const accion = this.acciones.get(id);
    if (accion) {
      accion.estado = estado as any;
      if (estado === "ejecutada") {
        accion.ejecutadaAt = new Date();
      }
      this.acciones.set(id, accion);
    }
    return accion;
  }

  async confirmarAccion(id: string): Promise<Accion | undefined> {
    const accion = this.acciones.get(id);
    if (accion) {
      accion.estado = "confirmada";
      accion.confirmadaAt = new Date();
      this.acciones.set(id, accion);
    }
    return accion;
  }

  // Sistema de automatizaciones
  private iniciarAutomatizaciones() {
    // En Vercel/serverless, evitar setInterval que puede causar problemas
    // Solo ejecutar una vez al inicio
    if (typeof process !== 'undefined' && process.env.VERCEL) {
      // En Vercel, ejecutar solo una vez
      setTimeout(() => {
        this.ejecutarAutomatizaciones().catch(console.error);
      }, 2000);
    } else {
      // En entorno normal, usar setInterval
      setInterval(() => {
        this.ejecutarAutomatizaciones().catch(console.error);
      }, 60000); // 60 segundos

      // Ejecutar inmediatamente después de un pequeño delay
      setTimeout(() => {
        this.ejecutarAutomatizaciones().catch(console.error);
      }, 2000);
    }
  }

  private async ejecutarAutomatizaciones() {
    try {
      // 1. Relances automáticos para budgets pendientes
      await this.automatizarRelances();
      
      // 2. Recordatorios automáticos de citas
      await this.automatizarRecordatorios();
      
      // 3. Mensajes post-visita automáticos
      await this.automatizarPostVisita();
      
      // 4. Scoring automático para nuevos budgets sin scoring
      await this.automatizarScoring();
      
      // 5. Salud preventiva - recordatorios automáticos
      await this.automatizarSaludPreventiva();
    } catch (error) {
      console.error("Error en automatizaciones:", error);
    }
  }

  private async automatizarRelances() {
    const budgets = Array.from(this.budgets.values())
      .filter(b => b.status === "pending");
    
    const ahora = new Date();
    
    for (const budget of budgets) {
      if (!budget.createdAt) continue;
      
      const fechaCreacion = new Date(budget.createdAt);
      const diasPendientes = Math.floor(
        (ahora.getTime() - fechaCreacion.getTime()) / (1000 * 60 * 60 * 24)
      );
      
      // Enviar relance automático después de 3 días, luego cada 7 días
      const debeEnviar = diasPendientes >= 3 && diasPendientes % 7 === 0;
      
      if (debeEnviar) {
        // Verificar si ya se envió un relance recientemente (últimas 6 horas)
        const accionesRelances = Array.from(this.acciones.values())
          .filter(a => 
            a.budgetId === budget.id && 
            a.tipo === "relance" &&
            a.ejecutadaAt &&
            (ahora.getTime() - new Date(a.ejecutadaAt).getTime()) < 6 * 60 * 60 * 1000
          );
        
        if (accionesRelances.length === 0) {
          const paciente = this.pacientes.get(budget.patientId);
          if (!paciente) continue;
          
          // Determinar canal preferido
          const canal = paciente.whatsapp ? "whatsapp" : "sms";
          
          // Generar mensaje
          const { generateRelanceMessage } = await import("./lib/openai");
          const mensaje = await generateRelanceMessage(
            {
              nombre: paciente.nombre,
              edad: paciente.edad,
              historial: paciente.diagnostico,
            },
            {
              amount: Number(budget.amount),
              treatmentDetails: budget.treatmentDetails,
            },
            canal as "sms" | "email" | "whatsapp",
            diasPendientes
          );
          
          // Crear acción
          await this.createAccion({
            tipo: "relance",
            estado: "ejecutada",
            titulo: `Relance automático - ${paciente.nombre}`,
            descripcion: `Presupuesto pendiente desde hace ${diasPendientes} días`,
            pacienteId: budget.patientId,
            budgetId: budget.id,
            canal: canal || null,
            mensaje: mensaje || null,
            requiereConfirmacion: false,
            ejecutadaAt: new Date(),
            metadata: {
              diasPendientes,
              monto: String(budget.amount),
            },
          });
          
          // Simular envío (en producción aquí se enviaría realmente)
          console.log(`[AUTOMATIZACIÓN] Relance enviado a ${paciente.nombre} vía ${canal}`);
        }
      }
    }
  }

  private async automatizarRecordatorios() {
    // Obtener la regla de recordatorios activa
    const reglasRecordatorios = Array.from(this.reglasComunicacion.values())
      .filter(r => r.tipo === "recordatorio_cita" && r.activa);
    
    if (reglasRecordatorios.length === 0) {
      // Si no hay regla configurada, usar valores por defecto (24h y 1h antes)
      return this.automatizarRecordatoriosConConfiguracion([
        { horasAntes: 24, canal: "whatsapp", mensaje: "" },
        { horasAntes: 1, canal: "sms", mensaje: "" },
      ]);
    }
    
    // Usar la primera regla activa
    const regla = reglasRecordatorios[0];
    const configuraciones: Array<{ horasAntes: number; canal: string; mensaje: string }> = [];
    
    // Extraer las configuraciones desde la secuencia
    if (Array.isArray(regla.secuencia)) {
      for (const paso of regla.secuencia) {
        if (typeof paso === 'object' && paso !== null) {
          let horasAntes = 24;
          if ('horasAntes' in paso && typeof paso.horasAntes === 'number') {
            horasAntes = paso.horasAntes;
          } else if ('diasDespues' in paso) {
            // Compatibilidad con formato antiguo (diasDespues: 1 = 24h, diasDespues: 0 = 1h)
            const dias = paso.diasDespues as number;
            horasAntes = dias === 1 ? 24 : dias === 0 ? 1 : dias * 24;
          }
          
          const canal = ('canal' in paso && typeof paso.canal === 'string') ? paso.canal : "whatsapp";
          const mensaje = ('mensaje' in paso && typeof paso.mensaje === 'string') ? paso.mensaje : "";
          
          configuraciones.push({ horasAntes, canal, mensaje });
        }
      }
    }
    
    // Si no se encontraron configuraciones, usar valores por defecto
    if (configuraciones.length === 0) {
      configuraciones.push(
        { horasAntes: 24, canal: "whatsapp", mensaje: "" },
        { horasAntes: 1, canal: "sms", mensaje: "" }
      );
    }
    
    return this.automatizarRecordatoriosConConfiguracion(configuraciones);
  }

  private async automatizarRecordatoriosConConfiguracion(
    configuraciones: Array<{ horasAntes: number; canal: string; mensaje: string }>
  ) {
    const citas = Array.from(this.citas.values())
      .filter(c => c.estado === "programada");
    
    const ahora = new Date();
    
    for (const cita of citas) {
      const fechaCita = new Date(cita.fechaHora);
      const horasHastaCita = (fechaCita.getTime() - ahora.getTime()) / (1000 * 60 * 60);
      
      // Verificar cada configuración
      for (const config of configuraciones) {
        // Ventana de tiempo: ±0.5 horas alrededor de la hora configurada
        const debeEnviar = horasHastaCita > (config.horasAntes - 0.5) && 
                          horasHastaCita < (config.horasAntes + 0.5);
        
        if (debeEnviar) {
          const tipoRecordatorio = `${config.horasAntes}h`;
          
          // Verificar si ya se envió este tipo de recordatorio
          const accionesRecordatorios = Array.from(this.acciones.values())
            .filter(a => 
              a.citaId === cita.id && 
              a.tipo === "recordatorio" &&
              a.metadata && typeof a.metadata === 'object' && 'tipo' in a.metadata &&
              (a.metadata as any).tipo === tipoRecordatorio
            );
          
          if (accionesRecordatorios.length === 0) {
            const paciente = this.pacientes.get(cita.pacienteId);
            if (!paciente) continue;
            
            // Usar el canal configurado, o el preferido del paciente si no está configurado
            let canal = config.canal || (paciente.whatsapp ? "whatsapp" : "sms");
            
            // Si el canal configurado no está disponible para el paciente, usar el preferido
            if (canal === "whatsapp" && !paciente.whatsapp) {
              canal = "sms";
            }
            
            let mensaje = config.mensaje || "";
            
            // Si no hay mensaje personalizado, generar uno con IA
            if (!mensaje.trim()) {
              const { generateReminderMessage } = await import("./lib/openai");
              mensaje = await generateReminderMessage(
                {
                  nombre: paciente.nombre,
                  edad: paciente.edad,
                },
                fechaCita,
                cita.tipo,
                config.horasAntes
              );
            } else {
              // Reemplazar variables en el mensaje personalizado
              mensaje = mensaje
                .replace(/{nombre}/g, paciente.nombre)
                .replace(/{fecha}/g, fechaCita.toLocaleDateString("es-ES"))
                .replace(/{hora}/g, fechaCita.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }))
                .replace(/{tipo}/g, cita.tipo);
            }
            
            await this.createAccion({
              tipo: "recordatorio",
              estado: "ejecutada",
              titulo: `Recordatorio ${tipoRecordatorio} - ${paciente.nombre}`,
              descripcion: `Cita el ${fechaCita.toLocaleDateString("es-ES")} a las ${fechaCita.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}`,
              pacienteId: cita.pacienteId,
              citaId: cita.id,
              canal: canal || null,
              mensaje: mensaje || null,
              requiereConfirmacion: false,
              ejecutadaAt: new Date(),
              metadata: {
                tipo: tipoRecordatorio,
                horasAntes: config.horasAntes,
                fechaCita: fechaCita.toISOString(),
                mensajePersonalizado: !!config.mensaje,
              },
            });
            
            console.log(`[AUTOMATIZACIÓN] Recordatorio ${tipoRecordatorio} enviado a ${paciente.nombre} vía ${canal}`);
          }
        }
      }
    }
  }

  private async automatizarPostVisita() {
    // Obtener la regla de post-visita activa
    const reglasPostVisita = Array.from(this.reglasComunicacion.values())
      .filter(r => r.tipo === "post_visita" && r.activa);
    
    if (reglasPostVisita.length === 0) {
      // Si no hay regla configurada, usar valores por defecto (7 días después)
      return this.automatizarPostVisitaConConfiguracion([
        { horasDespues: 168, canal: "whatsapp", mensaje: "" }, // 7 días = 168 horas
      ]);
    }
    
    // Usar la primera regla activa
    const regla = reglasPostVisita[0];
    const configuraciones: Array<{ horasDespues: number; canal: string; mensaje: string }> = [];
    
    // Extraer las configuraciones desde la secuencia
    if (Array.isArray(regla.secuencia)) {
      for (const paso of regla.secuencia) {
        if (typeof paso === 'object' && paso !== null) {
          let horasDespues = 168; // 7 días por defecto
          if ('horasDespues' in paso && typeof paso.horasDespues === 'number') {
            horasDespues = paso.horasDespues;
          } else if ('diasDespues' in paso) {
            const dias = paso.diasDespues as number;
            horasDespues = dias * 24;
          }
          
          const canal = ('canal' in paso && typeof paso.canal === 'string') ? paso.canal : "whatsapp";
          const mensaje = ('mensaje' in paso && typeof paso.mensaje === 'string') ? paso.mensaje : "";
          
          configuraciones.push({ horasDespues, canal, mensaje });
        }
      }
    }
    
    // Si no se encontraron configuraciones, usar valores por defecto
    if (configuraciones.length === 0) {
      configuraciones.push({ horasDespues: 168, canal: "whatsapp", mensaje: "" });
    }
    
    return this.automatizarPostVisitaConConfiguracion(configuraciones);
  }

  private async automatizarPostVisitaConConfiguracion(
    configuraciones: Array<{ horasDespues: number; canal: string; mensaje: string }>
  ) {
    const budgets = Array.from(this.budgets.values())
      .filter(b => b.status === "accepted" && b.updatedAt);
    
    const ahora = new Date();
    
    for (const budget of budgets) {
      if (!budget.updatedAt) continue;
      
      const fechaAceptacion = new Date(budget.updatedAt);
      const horasDesdeAceptacion = (ahora.getTime() - fechaAceptacion.getTime()) / (1000 * 60 * 60);
      
      // Verificar cada configuración
      for (const config of configuraciones) {
        // Ventana de tiempo: ±0.5 horas alrededor de la hora configurada
        const debeEnviar = horasDesdeAceptacion > (config.horasDespues - 0.5) && 
                          horasDesdeAceptacion < (config.horasDespues + 0.5);
        
        if (debeEnviar) {
          const tipoMensaje = `${config.horasDespues}h`;
          
          // Verificar si ya se envió este tipo de mensaje
          const accionesPostVisita = Array.from(this.acciones.values())
            .filter(a => 
              a.budgetId === budget.id && 
              a.tipo === "post_visita" &&
              a.metadata && typeof a.metadata === 'object' && 'tipo' in a.metadata &&
              (a.metadata as any).tipo === tipoMensaje
            );
          
          if (accionesPostVisita.length === 0) {
            const paciente = this.pacientes.get(budget.patientId);
            if (!paciente) continue;
            
            // Usar el canal configurado, o el preferido del paciente si no está configurado
            let canal = config.canal || (paciente.whatsapp ? "whatsapp" : "email");
            
            // Si el canal configurado no está disponible para el paciente, usar el preferido
            if (canal === "whatsapp" && !paciente.whatsapp) {
              canal = "email";
            }
            
            const tratamiento = budget.treatmentDetails && 
              typeof budget.treatmentDetails === 'object' && 
              'procedures' in budget.treatmentDetails &&
              Array.isArray((budget.treatmentDetails as any).procedures)
              ? (budget.treatmentDetails as any).procedures.join(", ")
              : "tratamiento dental";
            
            let mensaje = config.mensaje || "";
            
            // Si no hay mensaje personalizado, generar uno con IA
            if (!mensaje.trim()) {
              const { generatePostVisitMessage } = await import("./lib/openai");
              mensaje = await generatePostVisitMessage(
                {
                  nombre: paciente.nombre,
                  edad: paciente.edad,
                },
                tratamiento
              );
            } else {
              // Reemplazar variables en el mensaje personalizado
              mensaje = mensaje
                .replace(/{nombre}/g, paciente.nombre)
                .replace(/{fecha}/g, fechaAceptacion.toLocaleDateString("es-ES"))
                .replace(/{tratamiento}/g, tratamiento);
            }
            
            await this.createAccion({
              tipo: "post_visita",
              estado: "ejecutada",
              titulo: `Mensaje post-visita ${tipoMensaje} - ${paciente.nombre}`,
              descripcion: `Seguimiento después de ${tratamiento}`,
              pacienteId: budget.patientId,
              budgetId: budget.id,
              canal: canal || null,
              mensaje: mensaje || null,
              requiereConfirmacion: false,
              ejecutadaAt: new Date(),
              metadata: {
                tipo: tipoMensaje,
                horasDespues: config.horasDespues,
                tratamiento,
                fechaAceptacion: fechaAceptacion.toISOString(),
                mensajePersonalizado: !!config.mensaje,
              },
            });
            
            console.log(`[AUTOMATIZACIÓN] Mensaje post-visita ${tipoMensaje} enviado a ${paciente.nombre} vía ${canal}`);
          }
        }
      }
    }
  }

  private async automatizarScoring() {
    const budgets = Array.from(this.budgets.values())
      .filter(b => !b.urgencyScore || !b.acceptanceProb);
    
    for (const budget of budgets) {
      const paciente = this.pacientes.get(budget.patientId);
      if (!paciente) continue;
      
      try {
        const amountNumber = Number(budget.amount);
        const urgencyScore = await calculateUrgencyScore(
          { amount: amountNumber, treatmentDetails: budget.treatmentDetails },
          {
            nombre: paciente.nombre,
            edad: paciente.edad,
            historial: paciente.diagnostico,
            ultimaVisita: paciente.ultimaVisita,
            budgetsAnteriores: Array.from(this.budgets.values())
              .filter(b => b.patientId === budget.patientId && b.id !== budget.id)
              .map(b => ({ amount: Number(b.amount), status: b.status })),
          }
        );
        
        const acceptanceProb = await calculateAcceptanceProb(
          { amount: amountNumber, treatmentDetails: budget.treatmentDetails },
          {
            nombre: paciente.nombre,
            edad: paciente.edad,
            historial: paciente.diagnostico,
            ultimaVisita: paciente.ultimaVisita,
            budgetsAnteriores: Array.from(this.budgets.values())
              .filter(b => b.patientId === budget.patientId && b.id !== budget.id)
              .map(b => ({ amount: Number(b.amount), status: b.status })),
          }
        );
        
        const priority = calculatePriority(urgencyScore, acceptanceProb);
        
        budget.urgencyScore = urgencyScore;
        budget.acceptanceProb = acceptanceProb;
        budget.priority = priority;
        budget.updatedAt = new Date();
        this.budgets.set(budget.id, budget);
        
        await this.createAccion({
          tipo: "scoring",
          estado: "ejecutada",
          titulo: `Scoring IA calculado - ${paciente.nombre}`,
          descripcion: `Urgencia: ${urgencyScore}, Aceptación: ${acceptanceProb}%, Prioridad: ${priority}`,
          pacienteId: budget.patientId,
          budgetId: budget.id,
          canal: null,
          mensaje: null,
          requiereConfirmacion: false,
          ejecutadaAt: new Date(),
          metadata: {
            urgencyScore,
            acceptanceProb,
            priority,
          },
        });
        
        console.log(`[AUTOMATIZACIÓN] Scoring calculado para budget ${budget.id}`);
      } catch (error) {
        console.error(`Error calculando scoring para budget ${budget.id}:`, error);
      }
    }
  }

  // Tratamientos Preventivos
  async getTratamientosPreventivos(filtros?: { pacienteId?: string }): Promise<TratamientoPreventivoConPaciente[]> {
    let tratamientos = Array.from(this.tratamientosPreventivos.values());
    
    if (filtros?.pacienteId) {
      tratamientos = tratamientos.filter(t => t.pacienteId === filtros.pacienteId);
    }
    
    return tratamientos.map(tratamiento => {
      const paciente = this.pacientes.get(tratamiento.pacienteId);
      if (!paciente) {
        throw new Error(`Patient not found for tratamiento ${tratamiento.id}`);
      }
      return {
        ...tratamiento,
        pacienteNombre: paciente.nombre,
        pacienteEmail: paciente.email,
        pacientePhone: paciente.telefono,
        pacienteWhatsapp: paciente.whatsapp || undefined,
      };
    }).sort((a, b) => {
      const dateA = a.fechaRealizacion ? new Date(a.fechaRealizacion).getTime() : 0;
      const dateB = b.fechaRealizacion ? new Date(b.fechaRealizacion).getTime() : 0;
      return dateB - dateA;
    });
  }

  async createTratamientoPreventivo(tratamientoData: InsertTratamientoPreventivo): Promise<TratamientoPreventivo> {
    const id = randomUUID();
    const tratamiento: TratamientoPreventivo = {
      ...tratamientoData,
      id,
      notas: tratamientoData.notas || null,
      citaId: tratamientoData.citaId || null,
      budgetId: tratamientoData.budgetId || null,
      createdAt: new Date(),
    };
    this.tratamientosPreventivos.set(id, tratamiento);
    return tratamiento;
  }

  async getRecordatoriosPreventivosPendientes(): Promise<RecordatorioPreventivoPendiente[]> {
    const ahora = new Date();
    const recordatorios: RecordatorioPreventivoPendiente[] = [];
    
    // Obtener todos los tratamientos preventivos
    const tratamientos = Array.from(this.tratamientosPreventivos.values());
    
    for (const tratamiento of tratamientos) {
      if (!tratamiento.proximaFechaRecomendada) continue;
      
      const proximaFecha = new Date(tratamiento.proximaFechaRecomendada);
      const diasVencidos = Math.floor((ahora.getTime() - proximaFecha.getTime()) / (1000 * 60 * 60 * 24));
      
      // Si ya pasó la fecha recomendada
      if (diasVencidos > 0) {
        const paciente = this.pacientes.get(tratamiento.pacienteId);
        if (!paciente) continue;
        
        // Contar intentos de recordatorio ya enviados para este tratamiento
        const accionesPreventivas = Array.from(this.acciones.values())
          .filter(a => 
            a.pacienteId === tratamiento.pacienteId &&
            a.tipo === "preventivo" &&
            a.metadata &&
            typeof a.metadata === 'object' &&
            'tipoTratamiento' in a.metadata &&
            (a.metadata as any).tipoTratamiento === tratamiento.tipoTratamiento
          );
        
        const intentosEnviados = accionesPreventivas.length;
        
        // Determinar canal siguiente según intentos (WhatsApp → SMS → Email)
        let canalSiguiente: "whatsapp" | "sms" | "email" = "whatsapp";
        if (intentosEnviados >= 1) canalSiguiente = "sms";
        if (intentosEnviados >= 2) canalSiguiente = "email";
        
        // Solo incluir si no se han enviado los 3 canales
        if (intentosEnviados < 3) {
          recordatorios.push({
            pacienteId: tratamiento.pacienteId,
            pacienteNombre: paciente.nombre,
            tipoTratamiento: tratamiento.tipoTratamiento,
            ultimaFecha: new Date(tratamiento.fechaRealizacion),
            proximaFechaRecomendada: proximaFecha,
            diasVencidos,
            canalSiguiente,
            intentosEnviados,
          });
        }
      }
    }
    
    return recordatorios.sort((a, b) => b.diasVencidos - a.diasVencidos);
  }

  private async automatizarSaludPreventiva() {
    const recordatoriosPendientes = await this.getRecordatoriosPreventivosPendientes();
    const ahora = new Date();
    
    for (const recordatorio of recordatoriosPendientes) {
      // Verificar si ya se envió un recordatorio preventivo recientemente (últimas 24 horas)
      const accionesRecientes = Array.from(this.acciones.values())
        .filter(a => 
          a.pacienteId === recordatorio.pacienteId &&
          a.tipo === "preventivo" &&
          a.metadata &&
          typeof a.metadata === 'object' &&
          'tipoTratamiento' in a.metadata &&
          (a.metadata as any).tipoTratamiento === recordatorio.tipoTratamiento &&
          a.canal === recordatorio.canalSiguiente &&
          a.ejecutadaAt &&
          (ahora.getTime() - new Date(a.ejecutadaAt).getTime()) < 24 * 60 * 60 * 1000
        );
      
      if (accionesRecientes.length === 0) {
        const paciente = this.pacientes.get(recordatorio.pacienteId);
        if (!paciente) continue;
        
        // Generar mensaje con IA
        const { generatePreventiveHealthMessage } = await import("./lib/openai");
        const mensaje = await generatePreventiveHealthMessage(
          {
            nombre: paciente.nombre,
            edad: paciente.edad,
            historial: paciente.diagnostico,
            ultimaVisita: recordatorio.ultimaFecha,
          },
          recordatorio.tipoTratamiento,
          recordatorio.diasVencidos,
          recordatorio.canalSiguiente,
          recordatorio.intentosEnviados + 1
        );
        
        // Crear acción
        await this.createAccion({
          tipo: "preventivo",
          estado: "ejecutada",
          titulo: `Salud Preventiva - ${recordatorio.tipoTratamiento} - ${paciente.nombre}`,
          descripcion: `Recordatorio para ${recordatorio.tipoTratamiento}. Han pasado ${Math.floor(recordatorio.diasVencidos / 30)} meses desde la última visita.`,
          pacienteId: recordatorio.pacienteId,
          canal: recordatorio.canalSiguiente,
          mensaje: mensaje || null,
          requiereConfirmacion: false,
          ejecutadaAt: new Date(),
          metadata: {
            tipoTratamiento: recordatorio.tipoTratamiento,
            diasVencidos: recordatorio.diasVencidos,
            intento: recordatorio.intentosEnviados + 1,
            ultimaFecha: recordatorio.ultimaFecha.toISOString(),
          },
        });
        
        console.log(`[AUTOMATIZACIÓN] Recordatorio preventivo enviado a ${paciente.nombre} vía ${recordatorio.canalSiguiente} para ${recordatorio.tipoTratamiento}`);
      }
    }
    
    // También detectar tratamientos preventivos desde citas completadas y budgets aceptados
    await this.detectarTratamientosPreventivosDesdeCitas();
    await this.detectarTratamientosPreventivosDesdeBudgets();
  }

  // Detectar tratamientos preventivos desde citas completadas
  private async detectarTratamientosPreventivosDesdeCitas() {
    const citasCompletadas = Array.from(this.citas.values())
      .filter(c => c.estado === "completada");
    
    const tratamientosPreventivos = ["limpieza", "revision", "fluorizacion"];
    
    for (const cita of citasCompletadas) {
      if (!tratamientosPreventivos.includes(cita.tipo)) continue;
      
      // Verificar si ya existe un tratamiento preventivo para esta cita
      const tratamientoExistente = Array.from(this.tratamientosPreventivos.values())
        .find(t => t.citaId === cita.id);
      
      if (!tratamientoExistente) {
        const regla = this.reglasFrecuencia.find(r => r.tipoTratamiento === cita.tipo);
        if (!regla) continue;
        
        const fechaRealizacion = new Date(cita.fechaHora);
        const proximaFecha = new Date(fechaRealizacion);
        proximaFecha.setMonth(proximaFecha.getMonth() + regla.frecuenciaMeses);
        
        await this.createTratamientoPreventivo({
          pacienteId: cita.pacienteId,
          clinicId: "clinic-1", // Default clinic
          tipoTratamiento: cita.tipo,
          fechaRealizacion,
          proximaFechaRecomendada: proximaFecha,
          frecuenciaMeses: regla.frecuenciaMeses,
          citaId: cita.id,
          budgetId: null,
          notas: `Detectado automáticamente desde cita completada`,
        });
        
        console.log(`[AUTOMATIZACIÓN] Tratamiento preventivo creado para ${cita.tipo} de paciente ${cita.pacienteId}`);
      }
    }
  }

  // Detectar tratamientos preventivos desde budgets aceptados
  private async detectarTratamientosPreventivosDesdeBudgets() {
    const budgetsAceptados = Array.from(this.budgets.values())
      .filter(b => b.status === "accepted");
    
    for (const budget of budgetsAceptados) {
      if (!budget.treatmentDetails || typeof budget.treatmentDetails !== 'object') continue;
      
      const procedures = (budget.treatmentDetails as any).procedures || [];
      const procedimientosPreventivos = procedures.filter((p: string) => 
        p.toLowerCase().includes("limpieza") ||
        p.toLowerCase().includes("revisión") ||
        p.toLowerCase().includes("revision") ||
        p.toLowerCase().includes("fluorización") ||
        p.toLowerCase().includes("fluorizacion")
      );
      
      for (const procedimiento of procedimientosPreventivos) {
        let tipoTratamiento = "limpieza";
        if (procedimiento.toLowerCase().includes("revisión") || procedimiento.toLowerCase().includes("revision")) {
          tipoTratamiento = "revision";
        } else if (procedimiento.toLowerCase().includes("fluor")) {
          tipoTratamiento = "fluorizacion";
        }
        
        const regla = this.reglasFrecuencia.find(r => r.tipoTratamiento === tipoTratamiento);
        if (!regla) continue;
        
        // Verificar si ya existe un tratamiento preventivo para este budget
        const tratamientoExistente = Array.from(this.tratamientosPreventivos.values())
          .find(t => t.budgetId === budget.id && t.tipoTratamiento === tipoTratamiento);
        
        if (!tratamientoExistente && budget.updatedAt) {
          const fechaRealizacion = new Date(budget.updatedAt);
          const proximaFecha = new Date(fechaRealizacion);
          proximaFecha.setMonth(proximaFecha.getMonth() + regla.frecuenciaMeses);
          
          await this.createTratamientoPreventivo({
            pacienteId: budget.patientId,
            clinicId: budget.clinicId,
            tipoTratamiento,
            fechaRealizacion,
            proximaFechaRecomendada: proximaFecha,
            frecuenciaMeses: regla.frecuenciaMeses,
            citaId: null,
            budgetId: budget.id,
            notas: `Detectado automáticamente desde presupuesto aceptado`,
          });
          
          console.log(`[AUTOMATIZACIÓN] Tratamiento preventivo creado para ${tipoTratamiento} desde budget ${budget.id}`);
        }
      }
    }
  }

  // ============= REGLAS DE COMUNICACIÓN =============
  
  async getReglasComunicacion(): Promise<ReglaComunicacion[]> {
    return Array.from(this.reglasComunicacion.values())
      .sort((a, b) => {
        const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
        const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
        return dateB - dateA;
      });
  }

  async getReglaComunicacion(id: string): Promise<ReglaComunicacion | undefined> {
    return this.reglasComunicacion.get(id);
  }

  async createReglaComunicacion(reglaData: InsertReglaComunicacion): Promise<ReglaComunicacion> {
    const id = randomUUID();
    const regla: ReglaComunicacion = {
      ...reglaData,
      id,
      activa: reglaData.activa ?? true,
      criterios: reglaData.criterios ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.reglasComunicacion.set(id, regla);
    return regla;
  }

  async updateReglaComunicacion(id: string, reglaData: Partial<InsertReglaComunicacion>): Promise<ReglaComunicacion | undefined> {
    const regla = this.reglasComunicacion.get(id);
    if (!regla) return undefined;
    
    const updated: ReglaComunicacion = {
      ...regla,
      ...reglaData,
      updatedAt: new Date(),
    };
    this.reglasComunicacion.set(id, updated);
    return updated;
  }

  async deleteReglaComunicacion(id: string): Promise<boolean> {
    return this.reglasComunicacion.delete(id);
  }
  
  // Crear secuencias de recall para pacientes dormidos (asignación contextual)
  private async inicializarSecuenciasParaPacientesDormidos() {
    const ahora = new Date();
    const pacientes = Array.from(this.pacientes.values());
    
    // Filtrar pacientes dormidos (estado "perdido" o sin visita hace más de 6 meses)
    const pacientesDormidos = pacientes.filter(p => {
      const ultimaVisita = new Date(p.ultimaVisita);
      const mesesSinVisita = (ahora.getTime() - ultimaVisita.getTime()) / (1000 * 60 * 60 * 24 * 30);
      return p.estado === "perdido" || (mesesSinVisita >= 6 && !p.tieneCitaFutura);
    });
    
    // Obtener todas las reglas de recall activas
    const reglasRecall = Array.from(this.reglasComunicacion.values())
      .filter(r => r.tipo === "recall_paciente" && r.activa);
    
    if (reglasRecall.length === 0) {
      console.log("[AUTOMATIZACIÓN] No hay reglas de recall configuradas");
      return;
    }
    
    // Función para asignar campaña contextual basada en diagnóstico
    const asignarCampañaContextual = (diagnostico: string): ReglaComunicacion | null => {
      const diagnosticoLower = diagnostico.toLowerCase();
      
      // Campaña 1: Salud Periodontal (para pacientes con problemas periodontales)
      if (diagnosticoLower.includes("periodoncia") || 
          diagnosticoLower.includes("gingivitis") ||
          diagnosticoLower.includes("encía")) {
        return reglasRecall.find(r => r.nombre.includes("Periodontal")) || reglasRecall[0];
      }
      
      // Campaña 2: Tratamientos Incompletos (para pacientes con caries, endodoncias, etc.)
      if (diagnosticoLower.includes("caries") ||
          diagnosticoLower.includes("endodoncia") ||
          diagnosticoLower.includes("conducto") ||
          diagnosticoLower.includes("extracción") ||
          diagnosticoLower.includes("tratamiento")) {
        return reglasRecall.find(r => r.nombre.includes("Incompletos")) || reglasRecall[1] || reglasRecall[0];
      }
      
      // Campaña 3: Prevención y Revisión (para el resto: limpieza, revisión general, etc.)
      return reglasRecall.find(r => r.nombre.includes("Prevención")) || reglasRecall[2] || reglasRecall[0];
    };
    
    // Asignar campañas contextuales a todos los pacientes dormidos
    for (const paciente of pacientesDormidos) {
      // Verificar si ya tiene una secuencia activa
      const secuenciasExistentes = await this.getSecuenciasComunicacion({
        tipo: "recall_paciente",
        estado: "activa",
      });
      const tieneSecuenciaActiva = secuenciasExistentes.some(s => s.pacienteId === paciente.id);
      
      if (tieneSecuenciaActiva) continue;
      
      // Seleccionar regla contextual basada en diagnóstico
      const regla = asignarCampañaContextual(paciente.diagnostico);
      if (!regla) continue;
      
      const pasos = regla.secuencia as PasoComunicacion[];
      if (pasos.length === 0) continue;
      
      // Calcular fecha de inicio y próxima acción
      const primerPaso = pasos[0];
      const fechaInicio = new Date(ahora.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000); // Hace 0-30 días
      const proximaAccion = new Date(fechaInicio);
      proximaAccion.setDate(proximaAccion.getDate() + primerPaso.diasDespues);
      
      // Si la próxima acción ya pasó, calcularla desde hoy
      if (proximaAccion < ahora) {
        proximaAccion.setTime(ahora.getTime());
        proximaAccion.setDate(proximaAccion.getDate() + primerPaso.diasDespues);
      }
      
      // Crear secuencia
      const secuenciaData: InsertSecuenciaComunicacion = {
        reglaId: regla.id,
        pacienteId: paciente.id,
        budgetId: null,
        citaId: null,
        tipo: "recall_paciente",
        estado: "activa",
        pasoActual: 0,
        fechaInicio,
        ultimaAccion: null,
        proximaAccion,
        respuestaRecibida: false,
        metadata: {
          reglaNombre: regla.nombre,
          pasosTotales: pasos.length,
          tratamientoContexto: regla.nombre,
          diagnostico: paciente.diagnostico,
        },
      };
      await this.createSecuenciaComunicacion(secuenciaData);
    }
    
    console.log(`[AUTOMATIZACIÓN] Secuencias de recall contextuales creadas para ${pacientesDormidos.length} pacientes dormidos`);
  }

  // Iniciar secuencia de relance para un presupuesto
  private async iniciarSecuenciaRelance(budgetId: string, pacienteId: string): Promise<void> {
    // Buscar regla activa de relance_presupuesto
    const reglasRelance = Array.from(this.reglasComunicacion.values())
      .filter(r => r.tipo === "relance_presupuesto" && r.activa);
    
    if (reglasRelance.length === 0) {
      console.log(`[AUTOMATIZACIÓN] No hay reglas de relance configuradas para budget ${budgetId}`);
      return;
    }
    
    // Usar la primera regla activa (en el futuro se podría seleccionar por prioridad)
    const regla = reglasRelance[0];
    const pasos = regla.secuencia as PasoComunicacion[];
    
    if (pasos.length === 0) {
      console.log(`[AUTOMATIZACIÓN] La regla ${regla.id} no tiene pasos configurados`);
      return;
    }
    
    // Verificar si ya existe una secuencia activa para este presupuesto
    const secuenciaExistente = await this.getSecuenciaComunicacionPorBudget(budgetId);
    if (secuenciaExistente) {
      console.log(`[AUTOMATIZACIÓN] Ya existe una secuencia activa para budget ${budgetId}`);
      return;
    }
    
    // Calcular fecha de inicio y próxima acción
    const ahora = new Date();
    const primerPaso = pasos[0];
    const proximaAccion = new Date(ahora);
    proximaAccion.setDate(proximaAccion.getDate() + primerPaso.diasDespues);
    
    // Crear secuencia
    await this.createSecuenciaComunicacion({
      reglaId: regla.id,
      pacienteId,
      budgetId,
      tipo: "relance_presupuesto",
      estado: "activa",
      pasoActual: 0,
      fechaInicio: ahora,
      ultimaAccion: null,
      proximaAccion,
      respuestaRecibida: false,
      metadata: {
        reglaNombre: regla.nombre,
        pasosTotales: pasos.length,
      },
    });
    
    console.log(`[AUTOMATIZACIÓN] Secuencia de relance iniciada para budget ${budgetId} con regla "${regla.nombre}"`);
  }

  // ============= SECUENCIAS DE COMUNICACIÓN =============
  
  async getSecuenciasComunicacion(filtros?: { tipo?: string; estado?: string; budgetId?: string }): Promise<SecuenciaComunicacion[]> {
    let secuencias = Array.from(this.secuenciasComunicacion.values());
    
    if (filtros?.tipo) {
      secuencias = secuencias.filter(s => s.tipo === filtros.tipo);
    }
    
    if (filtros?.estado) {
      secuencias = secuencias.filter(s => s.estado === filtros.estado);
    }
    
    if (filtros?.budgetId) {
      secuencias = secuencias.filter(s => s.budgetId === filtros.budgetId);
    }
    
    return secuencias.sort((a, b) => {
      const dateA = a.proximaAccion ? new Date(a.proximaAccion).getTime() : 0;
      const dateB = b.proximaAccion ? new Date(b.proximaAccion).getTime() : 0;
      return dateA - dateB;
    });
  }
  
  async getSecuenciaComunicacionPorBudget(budgetId: string): Promise<SecuenciaComunicacion | undefined> {
    const secuencias = Array.from(this.secuenciasComunicacion.values())
      .filter(s => s.budgetId === budgetId && s.tipo === "relance_presupuesto" && s.estado === "activa");
    return secuencias[0]; // Retornar la primera secuencia activa
  }

  async getSecuenciaComunicacion(id: string): Promise<SecuenciaComunicacion | undefined> {
    return this.secuenciasComunicacion.get(id);
  }

  async createSecuenciaComunicacion(secuenciaData: InsertSecuenciaComunicacion): Promise<SecuenciaComunicacion> {
    const id = randomUUID();
    const secuencia: SecuenciaComunicacion = {
      ...secuenciaData,
      id,
      estado: secuenciaData.estado || "activa",
      pasoActual: secuenciaData.pasoActual || 0,
      respuestaRecibida: secuenciaData.respuestaRecibida || false,
      pacienteId: secuenciaData.pacienteId || "",
      budgetId: secuenciaData.budgetId || null,
      citaId: secuenciaData.citaId || null,
      ultimaAccion: secuenciaData.ultimaAccion || null,
      proximaAccion: secuenciaData.proximaAccion || null,
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: secuenciaData.metadata || null,
    };
    this.secuenciasComunicacion.set(id, secuencia);
    return secuencia;
  }

  async updateSecuenciaComunicacion(id: string, secuenciaData: Partial<InsertSecuenciaComunicacion>): Promise<SecuenciaComunicacion | undefined> {
    const secuencia = this.secuenciasComunicacion.get(id);
    if (!secuencia) return undefined;
    
    const updated: SecuenciaComunicacion = {
      ...secuencia,
      ...secuenciaData,
      ultimaAccion: secuenciaData.ultimaAccion !== undefined ? (secuenciaData.ultimaAccion || null) : (secuencia.ultimaAccion || null),
      proximaAccion: secuenciaData.proximaAccion !== undefined ? (secuenciaData.proximaAccion || null) : (secuencia.proximaAccion || null),
      updatedAt: new Date(),
    };
    this.secuenciasComunicacion.set(id, updated);
    return updated;
  }

  async avanzarSecuenciaComunicacion(id: string): Promise<SecuenciaComunicacion | undefined> {
    const secuencia = this.secuenciasComunicacion.get(id);
    if (!secuencia) return undefined;
    
    const regla = this.reglasComunicacion.get(secuencia.reglaId);
    if (!regla) return undefined;
    
    const pasos = regla.secuencia as PasoComunicacion[];
    const pasoActualNum = secuencia.pasoActual || 0;
    const siguientePaso = pasos[pasoActualNum + 1];
    
    if (!siguientePaso) {
      // Secuencia completada
      return await this.updateSecuenciaComunicacion(id, {
        estado: "completada",
        ultimaAccion: new Date(),
      });
    }
    
    const ahora = new Date();
    const proximaAccion = new Date(ahora);
    proximaAccion.setDate(proximaAccion.getDate() + siguientePaso.diasDespues);
    
    return await this.updateSecuenciaComunicacion(id, {
      pasoActual: pasoActualNum + 1,
      ultimaAccion: ahora,
      proximaAccion,
    });
  }
}

// Inicializar storage - esto carga los datos mock inmediatamente
export const storage = new MemStorage();

// Verificar que los datos se cargaron correctamente
(async () => {
  try {
    // Esperar un poco para que la inicialización asíncrona pueda completarse
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const pacientesCount = (await storage.getPacientes()).length;
    const budgetsCount = (await storage.getBudgets()).length;
    const citasCount = (await storage.getCitas()).length;
    const campanasCount = (await storage.getCampanas()).length;
    const tareasCount = (await storage.getTareas()).length;
    
    console.log(`[Storage] Initialization verified:`);
    console.log(`[Storage]   - Pacientes: ${pacientesCount} (expected: 200)`);
    console.log(`[Storage]   - Budgets: ${budgetsCount} (expected: 50)`);
    console.log(`[Storage]   - Citas: ${citasCount} (expected: ~60)`);
    console.log(`[Storage]   - Campañas: ${campanasCount} (expected: 3)`);
    console.log(`[Storage]   - Tareas: ${tareasCount}`);
    
    if (pacientesCount === 0 || budgetsCount === 0) {
      console.error('[Storage] ERROR: Storage appears to be empty!');
      console.error('[Storage] This should not happen - storage should initialize in constructor.');
    }
  } catch (error) {
    console.error('[Storage] Error verifying initialization:', error);
  }
})();
