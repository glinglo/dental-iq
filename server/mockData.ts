import type { Paciente, Campana, TareaLlamada, Conversacion, Mensaje, Cita, Budget, Clinic, TratamientoPreventivo } from "@shared/schema";
import { startOfWeek } from "date-fns";

// Nombres y apellidos españoles/latinoamericanos
const nombres = [
  "Ana", "María", "Carmen", "Isabel", "Dolores", "Pilar", "Teresa", "Rosa", "Lucía", "Elena",
  "José", "Antonio", "Manuel", "Francisco", "Juan", "Pedro", "Jesús", "Ángel", "Miguel", "Carlos",
  "Laura", "Marta", "Paula", "Sara", "Andrea", "Cristina", "Patricia", "Raquel", "Beatriz", "Mónica",
  "Diego", "Javier", "Fernando", "Luis", "Sergio", "Alberto", "Roberto", "Alejandro", "Enrique", "Rafael",
  "Sofía", "Valentina", "Isabella", "Camila", "Victoria", "Daniela", "Gabriela", "Natalia", "Adriana", "Marcela",
  "Santiago", "Sebastián", "Mateo", "Nicolás", "Andrés", "Felipe", "Ricardo", "Eduardo", "Rodrigo", "Gustavo",
  "Carla", "Silvia", "Diana", "Juliana", "Claudia", "Lorena", "Verónica", "Susana", "Alicia", "Gloria",
  "Jorge", "Ramón", "Alfredo", "Tomás", "Víctor", "Ernesto", "Raúl", "Arturo", "Rubén", "Martín",
  "Irene", "Nuria", "Rocío", "Sonia", "Amparo", "Montserrat", "Consuelo", "Encarna", "Remedios", "Inmaculada",
  "Joaquín", "Salvador", "Gregorio", "Lorenzo", "Ignacio", "Emilio", "Pablo", "César", "Óscar", "Daniel"
];

const apellidos = [
  "García", "Rodríguez", "Martínez", "González", "Fernández", "López", "Díaz", "Pérez", "Sánchez", "Romero",
  "Torres", "Ramírez", "Flores", "Rivera", "Gómez", "Morales", "Cruz", "Reyes", "Ortiz", "Gutiérrez",
  "Jiménez", "Ruiz", "Hernández", "Mendoza", "Álvarez", "Castillo", "Moreno", "Vargas", "Ramos", "Castro",
  "Vega", "Medina", "Silva", "Rojas", "Guerrero", "Navarro", "Campos", "Santos", "Aguilar", "Blanco",
  "Muñoz", "Ortega", "Delgado", "Soto", "Vázquez", "Serrano", "Ríos", "Contreras", "Herrera", "Domínguez"
];

const diagnosticos = [
  "Limpieza dental",
  "Ortodoncia",
  "Endodoncia",
  "Implante dental",
  "Extracción molar",
  "Blanqueamiento",
  "Periodoncia",
  "Revisión general",
  "Tratamiento caries",
  "Prótesis dental",
  "Gingivitis",
  "Conducto radicular",
  "Corona dental",
  "Puente dental",
  "Ortopedia maxilar"
];

function generarFechaAleatoria(mesesAtras: number): Date {
  const ahora = new Date();
  const fecha = new Date(ahora);
  fecha.setMonth(fecha.getMonth() - mesesAtras);
  const diasAleatorios = Math.floor(Math.random() * 30);
  fecha.setDate(fecha.getDate() + diasAleatorios);
  return fecha;
}

function generarTelefono(): string {
  const prefijos = ["+34 6", "+34 7", "+52 55", "+54 11", "+57 3", "+51 9", "+56 9"];
  const prefijo = prefijos[Math.floor(Math.random() * prefijos.length)];
  const numero = Math.floor(10000000 + Math.random() * 90000000);
  return `${prefijo}${numero.toString().substring(0, 8)}`;
}

function generarWhatsApp(): string {
  return generarTelefono();
}

function generarEmail(nombre: string, apellido: string): string {
  const dominios = ["gmail.com", "hotmail.com", "yahoo.es", "outlook.com", "icloud.com"];
  const dominio = dominios[Math.floor(Math.random() * dominios.length)];
  const nombreLimpio = nombre.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const apellidoLimpio = apellido.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return `${nombreLimpio}.${apellidoLimpio}@${dominio}`;
}

function calcularMesesSinVisita(ultimaVisita: Date): number {
  const ahora = new Date();
  const diffTime = Math.abs(ahora.getTime() - ultimaVisita.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.floor(diffDays / 30);
}

function determinarPrioridad(mesesSinVisita: number): "Alta" | "Media" | "Baja" | null {
  if (mesesSinVisita > 12) return "Alta";
  if (mesesSinVisita >= 6) return "Media";
  if (mesesSinVisita >= 3) return "Baja";
  return null;
}

function determinarEstado(mesesSinVisita: number, tieneCitaFutura: boolean): "activo" | "perdido" | "sin cita" {
  if (mesesSinVisita > 6 && !tieneCitaFutura) return "perdido";
  if (tieneCitaFutura) return "activo";
  return "sin cita";
}

export function generarPacientesMock(): Paciente[] {
  const pacientes: Paciente[] = [];

  for (let i = 0; i < 200; i++) {
    const nombre = nombres[Math.floor(Math.random() * nombres.length)];
    const apellido1 = apellidos[Math.floor(Math.random() * apellidos.length)];
    const apellido2 = apellidos[Math.floor(Math.random() * apellidos.length)];
    const nombreCompleto = `${nombre} ${apellido1} ${apellido2}`;

    let mesesAtras: number;
    const rand = Math.random();
    if (rand < 0.3) {
      mesesAtras = Math.floor(Math.random() * 3);
    } else if (rand < 0.7) {
      mesesAtras = 3 + Math.floor(Math.random() * 6);
    } else {
      mesesAtras = 9 + Math.floor(Math.random() * 15);
    }

    const ultimaVisita = generarFechaAleatoria(mesesAtras);
    const mesesSinVisita = calcularMesesSinVisita(ultimaVisita);
    const tieneCitaFutura = Math.random() < 0.2;
    const estado = determinarEstado(mesesSinVisita, tieneCitaFutura);
    const prioridad = estado === "perdido" ? determinarPrioridad(mesesSinVisita) : null;
    const edad = 18 + Math.floor(Math.random() * 62);
    const enCampana = Math.random() < 0.25;

    pacientes.push({
      id: `pac-${i + 1}`,
      clinicId: "clinic-1", // Default clinic
      nombre: nombreCompleto,
      ultimaVisita,
      diagnostico: diagnosticos[Math.floor(Math.random() * diagnosticos.length)],
      telefono: generarTelefono(),
      email: generarEmail(nombre, apellido1),
      whatsapp: Math.random() < 0.8 ? generarWhatsApp() : null,
      edad,
      estado,
      prioridad,
      tieneCitaFutura,
      mesesSinVisita,
      enCampana,
      notes: Math.random() < 0.3 ? "Paciente con historial de tratamientos previos" : null,
    });
  }

  return pacientes;
}

export function generarCampanasMock(): Campana[] {
  return [
    {
      id: "camp-1",
      nombre: "Reactivación Primavera 2024",
      canales: ["SMS", "Email"],
      cadencia: "Opción 1: SMS → Email → Llamada",
      plantillaSMS: "Hola {nombre}, hace tiempo que no te vemos en nuestra clínica. ¿Te gustaría agendar una cita? Responde SÍ para confirmar.",
      plantillaEmail: "Estimado/a {nombre},\n\nEsperamos que se encuentre bien. Hemos notado que hace {meses} meses que no nos visita...",
      guionLlamada: "Buenos días, ¿hablo con {nombre}? Le llamamos de la Clínica Dental para ofrecerle una cita de revisión...",
      estado: "activa",
      pacientesIncluidos: 42,
      contactosEnviados: 126,
      citasGeneradas: 11,
      fechaCreacion: new Date("2024-03-15"),
    },
    {
      id: "camp-2",
      nombre: "Limpieza Especial Verano",
      canales: ["SMS", "Llamadas"],
      cadencia: "Opción 2: SMS → SMS → Llamada",
      plantillaSMS: "¡Oferta especial de limpieza dental! {nombre}, reserva tu cita ahora.",
      plantillaEmail: null,
      guionLlamada: "Hola {nombre}, tenemos una promoción especial en limpiezas dentales...",
      estado: "activa",
      pacientesIncluidos: 35,
      contactosEnviados: 105,
      citasGeneradas: 8,
      fechaCreacion: new Date("2024-06-01"),
    },
    {
      id: "camp-3",
      nombre: "Seguimiento Ortodoncia",
      canales: ["Email", "Llamadas"],
      cadencia: "Opción 3: Email → Llamada",
      plantillaSMS: null,
      plantillaEmail: "Hola {nombre}, es importante continuar con tu tratamiento de ortodoncia...",
      guionLlamada: "Buenos días {nombre}, le contactamos para hacer seguimiento de su ortodoncia...",
      estado: "pausada",
      pacientesIncluidos: 18,
      contactosEnviados: 54,
      citasGeneradas: 4,
      fechaCreacion: new Date("2024-02-20"),
    },
  ];
}

export function generarTareasCampanaMock(pacientes: Paciente[], campanas: Campana[]): TareaLlamada[] {
  const tareas: TareaLlamada[] = [];
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  // Obtener campañas activas
  const campanasActivas = campanas.filter(c => c.estado === "activa");
  if (campanasActivas.length === 0) return [];

  // Obtener pacientes en riesgo
  const pacientesEnRiesgo = pacientes.filter(p => {
    if (p.tieneCitaFutura || p.enCampana) return false;
    const ahora = new Date();
    const diffTime = Math.abs(ahora.getTime() - p.ultimaVisita.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const mesesSinVisita = Math.floor(diffDays / 30);
    return mesesSinVisita >= 4 && mesesSinVisita <= 6;
  });

  // Obtener pacientes listos para campaña (más de 6 meses sin visita)
  const pacientesListos = pacientes.filter(p => {
    if (p.tieneCitaFutura || p.enCampana) return false;
    const ahora = new Date();
    const diffTime = Math.abs(ahora.getTime() - p.ultimaVisita.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const mesesSinVisita = Math.floor(diffDays / 30);
    return mesesSinVisita >= 6;
  });

  // Crear acción para añadir pacientes en riesgo a una campaña
  if (pacientesEnRiesgo.length > 0 && campanasActivas.length > 0) {
    const campanaSeleccionada = campanasActivas[0];
    tareas.push({
      id: `tarea-campana-riesgo-1`,
      pacienteId: "", // No aplica para acciones de campaña
      pacienteNombre: `${pacientesEnRiesgo.length} pacientes`,
      telefono: "",
      email: null,
      motivo: `Añadir ${pacientesEnRiesgo.length} pacientes en riesgo a campaña "${campanaSeleccionada.nombre}"`,
      prioridad: "Alta",
      tipoAccion: "añadir_campana_riesgo",
      estado: "pendiente",
      aprobado: false,
      fechaProgramada: null,
      fechaCreacion: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      fechaContacto: null,
      fechaCompletada: null,
      notas: null,
      campanaId: campanaSeleccionada.id,
      cantidadPacientes: pacientesEnRiesgo.length,
    });
  }

  // Crear acción para añadir pacientes listos a una campaña
  if (pacientesListos.length > 0 && campanasActivas.length > 0) {
    const campanaSeleccionada = campanasActivas.length > 1 ? campanasActivas[1] : campanasActivas[0];
    tareas.push({
      id: `tarea-campana-lista-1`,
      pacienteId: "",
      pacienteNombre: `${pacientesListos.length} pacientes`,
      telefono: "",
      email: null,
      motivo: `${pacientesListos.length} pacientes listos para añadir a "${campanaSeleccionada.nombre}"`,
      prioridad: "Media",
      tipoAccion: "añadir_campana",
      estado: "pendiente",
      aprobado: false,
      fechaProgramada: null,
      fechaCreacion: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      fechaContacto: null,
      fechaCompletada: null,
      notas: null,
      campanaId: campanaSeleccionada.id,
      cantidadPacientes: pacientesListos.length,
    });
  }

  return tareas;
}

export function generarTareasLlamadasMock(pacientes: Paciente[]): TareaLlamada[] {
  const pacientesPerdidos = pacientes.filter(p => p.estado === "perdido" && p.prioridad);
  const tareas: TareaLlamada[] = [];
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const pacientesSeleccionados = pacientesPerdidos
    .sort(() => Math.random() - 0.5)
    .slice(0, 25);

  // Tipos de acción con sus motivos específicos
  const tiposAccion: ("llamada" | "email" | "carta")[] = ["llamada", "email", "carta"];
  const motivosPorTipo = {
    llamada: [
      "Llamar para agendar cita de revisión",
      "Recordatorio telefónico de seguimiento",
      "Contactar para ofertar limpieza dental",
    ],
    email: [
      "Enviar recordatorio por correo electrónico",
      "Enviar información de promoción especial",
      "Notificar disponibilidad de cita",
    ],
    carta: [
      "Enviar carta de reactivación",
      "Enviar invitación a revisión anual",
      "Enviar folleto con promociones",
    ],
  };

  pacientesSeleccionados.forEach((paciente, index) => {
    // Distribución: 55% llamada, 30% email, 15% carta
    const rand = Math.random();
    const tipoAccion: "llamada" | "email" | "carta" = rand < 0.55 ? "llamada" : rand < 0.85 ? "email" : "carta";
    
    const motivosDelTipo = motivosPorTipo[tipoAccion];
    const motivo = motivosDelTipo[Math.floor(Math.random() * motivosDelTipo.length)];
    
    // Crear distribución para kanban:
    // - 8 pendientes de aprobación (no aprobado, estado pendiente)
    // - 10 programadas para hoy (aprobado, estado pendiente, fechaProgramada hoy)
    // - 7 completadas hoy (estados completados, fechaCompletada hoy)
    let estado: TareaLlamada["estado"] = "pendiente";
    let aprobado = false;
    let fechaProgramada: Date | null = null;
    let fechaCompletada: Date | null = null;
    let fechaContacto: Date | null = null;
    let notas: string | null = null;

    if (index < 8) {
      // Pendientes de aprobación
      aprobado = false;
      estado = "pendiente";
    } else if (index < 18) {
      // Programadas para hoy
      aprobado = true;
      estado = "pendiente";
      fechaProgramada = new Date(hoy);
    } else {
      // Completadas hoy
      aprobado = true;
      const estadosCompletados: TareaLlamada["estado"][] = ["contactado", "cita_agendada", "no_contactado"];
      estado = estadosCompletados[Math.floor(Math.random() * estadosCompletados.length)];
      fechaCompletada = new Date(hoy);
      if (estado === "contactado" || estado === "cita_agendada") {
        fechaContacto = new Date(hoy);
        notas = estado === "cita_agendada" 
          ? "Cita agendada para la próxima semana" 
          : "Paciente contactado, pendiente de confirmar";
      }
    }

    tareas.push({
      id: `tarea-${index + 1}`,
      pacienteId: paciente.id,
      pacienteNombre: paciente.nombre,
      telefono: paciente.telefono,
      email: paciente.email,
      motivo,
      prioridad: paciente.prioridad!,
      tipoAccion,
      estado,
      aprobado,
      fechaProgramada,
      fechaCreacion: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      fechaContacto,
      fechaCompletada,
      notas,
      campanaId: null,
      cantidadPacientes: null,
    });
  });

  return tareas.sort((a, b) => {
    const prioridadOrden = { "Alta": 0, "Media": 1, "Baja": 2 };
    return prioridadOrden[a.prioridad as keyof typeof prioridadOrden] - 
           prioridadOrden[b.prioridad as keyof typeof prioridadOrden];
  });
}

// Mensajes de ejemplo para conversaciones
const mensajesEjemplo = {
  whatsapp: {
    entrantes: [
      "Hola, me gustaría saber si tienen citas disponibles",
      "Buenos días, ¿cuánto cuesta una limpieza dental?",
      "Necesito reagendar mi cita",
      "¿Tienen horario de tarde?",
      "Me duele una muela, ¿pueden atenderme hoy?",
      "Gracias por la información",
      "Perfecto, confirmo la cita",
      "¿Aceptan tarjeta de crédito?",
      "¿Cuánto dura el tratamiento de ortodoncia?",
      "Quisiera información sobre blanqueamiento",
    ],
    salientes: [
      "¡Hola! Claro, tenemos disponibilidad mañana a las 10:00 o 16:00. ¿Cuál le viene mejor?",
      "Buenos días. La limpieza dental tiene un precio de 60€. ¿Le gustaría agendar una cita?",
      "Sin problema. ¿Para qué día le gustaría reprogramar?",
      "Sí, atendemos de lunes a viernes de 9:00 a 20:00",
      "Entendemos su urgencia. Podemos atenderle hoy a las 18:00. ¿Le parece bien?",
      "¡De nada! Estamos para ayudarle",
      "Perfecto, queda confirmada su cita. Le enviaremos un recordatorio",
      "Sí, aceptamos todas las tarjetas y también financiación",
      "El tratamiento de ortodoncia suele durar entre 12 y 24 meses dependiendo del caso",
      "El blanqueamiento dental cuesta 250€ e incluye dos sesiones",
    ],
  },
  sms: {
    entrantes: [
      "OK confirmo",
      "Sí, ahí estaré",
      "Necesito cambiar la hora",
      "¿Pueden llamarme?",
      "Gracias",
    ],
    salientes: [
      "Recordatorio: Tiene cita mañana a las 10:00 en Clínica Dental. Responda OK para confirmar.",
      "Su cita ha sido confirmada para el día 15 a las 16:00. ¡Le esperamos!",
      "Oferta especial: Limpieza dental + revisión por 45€. Reserve al 900 123 456",
      "Le llamaremos en breve. Gracias por contactarnos.",
      "Gracias por su visita. Recuerde su próxima cita en 6 meses.",
    ],
  },
  email: {
    entrantes: [
      "Estimados, solicito información sobre tratamientos de ortodoncia para mi hijo de 14 años.",
      "Buenos días, adjunto mis radiografías para valoración.",
      "Confirmo mi asistencia a la cita del viernes.",
      "Necesito factura de mi última visita.",
      "¿Podrían enviarme los horarios disponibles para la próxima semana?",
    ],
    salientes: [
      "Estimado/a paciente,\n\nGracias por contactarnos. Le informamos que ofrecemos ortodoncia invisible y tradicional para adolescentes. Le adjuntamos nuestro catálogo de tratamientos.\n\nSaludos cordiales,\nClínica Dental",
      "Buenos días,\n\nHemos recibido sus radiografías. Nuestro especialista las revisará y le contactaremos en 24-48h con la valoración.\n\nGracias por confiar en nosotros.",
      "Gracias por confirmar. Le esperamos el viernes a las 11:00.\n\nRecuerde traer su tarjeta de seguro si dispone de uno.",
      "Adjunta encontrará la factura solicitada (Nº 2024-1234).\n\nPara cualquier consulta, no dude en contactarnos.",
      "Buenos días,\n\nLe informamos de nuestra disponibilidad:\n- Lunes: 10:00, 16:00\n- Martes: 09:00, 12:00, 17:00\n- Miércoles: 11:00, 15:00\n\n¿Qué horario le vendría mejor?",
    ],
  },
};

export function generarConversacionesMock(pacientes: Paciente[]): { conversaciones: Conversacion[]; mensajes: Mensaje[] } {
  const conversaciones: Conversacion[] = [];
  const mensajes: Mensaje[] = [];
  
  const canales: ("whatsapp" | "sms" | "email")[] = ["whatsapp", "sms", "email"];
  
  // Seleccionar 40 pacientes aleatorios para tener conversaciones
  const pacientesConConversacion = pacientes
    .sort(() => Math.random() - 0.5)
    .slice(0, 40);
  
  pacientesConConversacion.forEach((paciente, index) => {
    const canal = canales[Math.floor(Math.random() * canales.length)];
    const convId = `conv-${index + 1}`;
    
    // Generar entre 2 y 8 mensajes por conversación
    const numMensajes = 2 + Math.floor(Math.random() * 7);
    const horasAtras = Math.floor(Math.random() * 72); // Hasta 3 días atrás
    
    let ultimoMensaje = "";
    let fechaUltimoMensaje = new Date();
    
    for (let i = 0; i < numMensajes; i++) {
      const esEntrante = i % 2 === 0; // Alternar entrante/saliente
      const direccion = esEntrante ? "entrante" : "saliente";
      const mensajesPool = esEntrante 
        ? mensajesEjemplo[canal].entrantes 
        : mensajesEjemplo[canal].salientes;
      const contenido = mensajesPool[Math.floor(Math.random() * mensajesPool.length)];
      
      const fechaEnvio = new Date();
      fechaEnvio.setHours(fechaEnvio.getHours() - horasAtras + i);
      
      if (i === numMensajes - 1) {
        ultimoMensaje = contenido;
        fechaUltimoMensaje = fechaEnvio;
      }
      
      mensajes.push({
        id: `msg-${convId}-${i + 1}`,
        type: "conversation",
        channel: canal,
        conversacionId: convId,
        patientId: paciente.id,
        budgetId: null,
        contenido,
        direccion,
        fechaEnvio,
        openedAt: null,
        leido: i < numMensajes - 1 || !esEntrante, // El último mensaje entrante puede estar sin leer
      });
    }
    
    // Aproximadamente 50% tienen mensajes no leídos para mostrar variedad
    const noLeidos = Math.random() < 0.5 ? Math.floor(Math.random() * 4) + 1 : 0;
    
    conversaciones.push({
      id: convId,
      pacienteId: paciente.id,
      canal,
      ultimoMensaje,
      fechaUltimoMensaje,
      noLeidos,
      estado: "activa",
    });
  });
  
  return { conversaciones, mensajes };
}

// Tipos y salas para citas
const tiposCita = ["revision", "limpieza", "tratamiento", "consulta", "urgencia"];
const doctores = ["Dr. García", "Dra. Martínez", "Dr. López", "Dra. Fernández"];
const salas = ["Sala 1", "Sala 2", "Sala 3", "Consultorio A", "Consultorio B"];
const origenesCita = ["reactivacion", "web", "telefono", "presencial"];

export function generarCitasMock(pacientes: Paciente[]): Cita[] {
  const citas: Cita[] = [];
  const ahora = new Date();
  
  console.log('[MockData] Generating citas - Current date:', ahora.toISOString());
  
  // Obtener inicio de la semana actual (lunes)
  // Usar date-fns startOfWeek para que coincida exactamente con el frontend
  const inicioSemana = startOfWeek(ahora, { weekStartsOn: 1 });
  // IMPORTANTE: Usar setHours en lugar de UTC para que coincida con el frontend
  // El frontend hace: inicioSemana.setHours(0, 0, 0, 0) que usa hora local
  inicioSemana.setHours(0, 0, 0, 0);
  
  console.log('[MockData] Inicio semana (lunes):', inicioSemana.toISOString(), 'timestamp:', inicioSemana.getTime());
  
  // Generar citas para las últimas 2 semanas, esta semana y las próximas 6 semanas
  // Esto asegura que siempre haya citas visibles independientemente de cuándo se inicialice
  // Aumentado a 6 semanas adelante para cubrir más rango futuro
  const semanasAtras = 2;
  const semanasAdelante = 6;
  
  // Horarios de trabajo: 9:00 a 20:00
  const horariosDisponibles = [9, 10, 11, 12, 13, 16, 17, 18, 19];
  
  // Generar citas para un rango amplio
  const pacientesSeleccionados = pacientes
    .sort(() => Math.random() - 0.5)
    .slice(0, 60);
  
  let citaIndex = 0;
  
  // Generar citas para el rango completo (semanasAtras + semanasAdelante semanas)
  // Incluir TODOS los días de la semana (0-6 = lunes a domingo) para coincidir con date-fns
  // IMPORTANTE: Usar getTime() y sumar milisegundos para mantener la misma zona horaria que el frontend
  // El frontend usa setHours que mantiene la zona horaria local
  console.log('[MockData] Generando citas desde semana', -semanasAtras, 'hasta semana', semanasAdelante);
  
  for (let semana = -semanasAtras; semana <= semanasAdelante; semana++) {
    for (let dia = 0; dia < 7; dia++) { // Lunes a domingo (0-6 días desde el lunes)
      // Calcular fecha usando milisegundos para mantener la misma zona horaria
      const diasOffset = dia + (semana * 7);
      const fechaDia = new Date(inicioSemana.getTime() + (diasOffset * 24 * 60 * 60 * 1000));
      
      // No generar citas los domingos (dia === 6)
      if (dia === 6) continue;
      
      // Generar 4-8 citas por día
      const citasPorDia = 4 + Math.floor(Math.random() * 5);
      const horariosDelDia = [...horariosDisponibles].sort(() => Math.random() - 0.5).slice(0, citasPorDia);
      
      horariosDelDia.forEach(hora => {
        if (citaIndex >= pacientesSeleccionados.length) return;
        
        const paciente = pacientesSeleccionados[citaIndex];
        // Crear fecha usando setHours (hora local) para coincidir con el frontend
        const fechaHora = new Date(fechaDia);
        const minutos = Math.random() < 0.5 ? 0 : 30;
        fechaHora.setHours(hora, minutos, 0, 0);
        
        // Log para debug: verificar citas de la semana actual (semana 0)
        if (semana === 0 && dia === 0 && citaIndex === 0) {
          console.log('[MockData] Primera cita semana actual (semana=0, dia=0):', fechaHora.toISOString(), 'timestamp:', fechaHora.getTime());
          console.log('[MockData] fechaDia base:', fechaDia.toISOString(), 'timestamp:', fechaDia.getTime());
        }
        
        // Log todas las citas de la semana actual para debug
        if (semana === 0) {
          console.log(`[MockData] Cita semana actual - semana=${semana}, dia=${dia}, hora=${hora}:${minutos}, fecha: ${fechaHora.toISOString()}, timestamp: ${fechaHora.getTime()}`);
        }
        
        const tipo = tiposCita[Math.floor(Math.random() * tiposCita.length)];
        const duracion = tipo === "urgencia" ? 45 : tipo === "tratamiento" ? 60 : 30;
        
        // Estado basado en si la cita es pasada o futura
        let estado: "programada" | "confirmada" | "completada" | "cancelada" | "no_asistio";
        if (fechaHora < ahora) {
          const rand = Math.random();
          if (rand < 0.7) estado = "completada";
          else if (rand < 0.85) estado = "no_asistio";
          else estado = "cancelada";
        } else {
          estado = Math.random() < 0.6 ? "confirmada" : "programada";
        }
        
        citas.push({
          id: `cita-${citaIndex + 1}`,
          pacienteId: paciente.id,
          pacienteNombre: paciente.nombre,
          telefono: paciente.telefono,
          fechaHora,
          duracionMinutos: duracion,
          tipo,
          estado,
          notas: Math.random() < 0.3 ? "Paciente con historial de ortodoncia" : null,
          doctor: doctores[Math.floor(Math.random() * doctores.length)],
          sala: salas[Math.floor(Math.random() * salas.length)],
          origen: origenesCita[Math.floor(Math.random() * origenesCita.length)],
        });
        
        citaIndex++;
      });
    }
  }
  
  const citasOrdenadas = citas.sort((a, b) => a.fechaHora.getTime() - b.fechaHora.getTime());
  console.log(`[MockData] Generated ${citasOrdenadas.length} citas`);
  if (citasOrdenadas.length > 0) {
    console.log(`[MockData] Primera cita: ${citasOrdenadas[0].fechaHora.toISOString()}`);
    console.log(`[MockData] Última cita: ${citasOrdenadas[citasOrdenadas.length - 1].fechaHora.toISOString()}`);
  }
  return citasOrdenadas;
}

// Generate clinics
export function generarClinicsMock(): Clinic[] {
  return [
    {
      id: "clinic-1",
      name: "Clínica Dental DentalIQ",
      address: "Calle Principal 123, Madrid, España",
      createdAt: new Date("2024-01-01"),
    },
    {
      id: "clinic-2",
      name: "Dental Care Barcelona",
      address: "Avenida Diagonal 456, Barcelona, España",
      createdAt: new Date("2024-02-15"),
    },
  ];
}

// Generate budgets (presupuestos) - 50 budgets for DentalIQ
export function generarBudgetsMock(pacientes: Paciente[]): Budget[] {
  const budgets: Budget[] = [];
  const tratamientos = [
    { name: "Limpieza dental profesional", amount: [80, 120] },
    { name: "Empaste composite", amount: [60, 100] },
    { name: "Endodoncia", amount: [200, 350] },
    { name: "Implante dental", amount: [800, 1500] },
    { name: "Ortodoncia completa", amount: [2000, 4000] },
    { name: "Blanqueamiento dental", amount: [150, 300] },
    { name: "Periodoncia", amount: [300, 600] },
    { name: "Corona dental", amount: [400, 800] },
    { name: "Puente dental", amount: [600, 1200] },
    { name: "Extracción molar", amount: [80, 150] },
    { name: "Revisión y diagnóstico", amount: [40, 80] },
    { name: "Tratamiento de caries múltiples", amount: [200, 400] },
  ];

  // Select 50 random patients
  const selectedPatients = pacientes
    .sort(() => Math.random() - 0.5)
    .slice(0, 50);

  selectedPatients.forEach((patient, index) => {
    const tratamiento = tratamientos[Math.floor(Math.random() * tratamientos.length)];
    const amount = (
      tratamiento.amount[0] +
      Math.random() * (tratamiento.amount[1] - tratamiento.amount[0])
    ).toFixed(2);

    const procedures = [
      tratamiento.name,
      ...(Math.random() < 0.3 ? ["Radiografía panorámica"] : []),
      ...(Math.random() < 0.2 ? ["Consulta inicial"] : []),
    ];

    const treatmentDetails = {
      procedures,
      total: Number(amount),
    };

    // Calculate mock urgency score (0-100)
    let urgencyScore = 50;
    if (tratamiento.name.toLowerCase().includes("dolor") || 
        tratamiento.name.toLowerCase().includes("urgencia") ||
        tratamiento.name.toLowerCase().includes("extracción")) {
      urgencyScore = 70 + Math.floor(Math.random() * 30);
    } else if (tratamiento.name.toLowerCase().includes("limpieza") ||
               tratamiento.name.toLowerCase().includes("revisión")) {
      urgencyScore = 30 + Math.floor(Math.random() * 20);
    } else {
      urgencyScore = 40 + Math.floor(Math.random() * 40);
    }

    // Calculate mock acceptance probability (0-100)
    let acceptanceProb = 60;
    const amountNum = Number(amount);
    if (amountNum < 100) {
      acceptanceProb = 70 + Math.floor(Math.random() * 25);
    } else if (amountNum < 500) {
      acceptanceProb = 50 + Math.floor(Math.random() * 30);
    } else {
      acceptanceProb = 30 + Math.floor(Math.random() * 40);
    }

    // Adjust based on patient age
    if (patient.edad > 65) {
      urgencyScore = Math.min(100, urgencyScore + 10);
    }

    const priority = calculatePriority(urgencyScore, acceptanceProb);

    // Status distribution: 70% pending, 20% accepted, 10% rejected
    const statusRand = Math.random();
    let status: "pending" | "accepted" | "rejected" = "pending";
    if (statusRand < 0.2) {
      status = "accepted";
    } else if (statusRand < 0.3) {
      status = "rejected";
    }

    const createdAt = generarFechaAleatoria(Math.floor(Math.random() * 6));
    const updatedAt = new Date(createdAt.getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000);

    budgets.push({
      id: `budget-${index + 1}`,
      patientId: patient.id,
      clinicId: patient.clinicId || "clinic-1",
      amount,
      urgencyScore,
      acceptanceProb,
      status,
      treatmentDetails,
      priority,
      createdAt,
      updatedAt,
    });
  });

  return budgets.sort((a, b) => {
    const timeA = a.createdAt?.getTime() || 0;
    const timeB = b.createdAt?.getTime() || 0;
    return timeB - timeA;
  });
}

function calculatePriority(urgencyScore: number, acceptanceProb: number): "high" | "medium" | "low" {
  const combinedScore = (urgencyScore * 0.6) + (acceptanceProb * 0.4);
  if (combinedScore >= 75) return "high";
  if (combinedScore >= 50) return "medium";
  return "low";
}

// Generate preventive treatments from completed appointments and accepted budgets
export function generarTratamientosPreventivosMock(
  pacientes: Paciente[],
  citas: Cita[],
  budgets: Budget[]
): TratamientoPreventivo[] {
  const tratamientos: TratamientoPreventivo[] = [];
  
  // Crear tratamientos preventivos desde citas completadas
  const citasPreventivas = citas.filter(c => 
    c.estado === "completada" && 
    (c.tipo === "limpieza" || c.tipo === "revision")
  );
  
  citasPreventivas.slice(0, 30).forEach((cita, index) => {
    const frecuenciaMeses = cita.tipo === "limpieza" ? 6 : 12;
    const fechaRealizacion = new Date(cita.fechaHora);
    const proximaFecha = new Date(fechaRealizacion);
    proximaFecha.setMonth(proximaFecha.getMonth() + frecuenciaMeses);
    
    // Hacer que algunos estén vencidos (para mostrar recordatorios)
    if (index < 10) {
      proximaFecha.setMonth(proximaFecha.getMonth() - 2); // Vencidos hace 2 meses
    }
    
    tratamientos.push({
      id: `tratamiento-${index + 1}`,
      pacienteId: cita.pacienteId,
      clinicId: "clinic-1",
      tipoTratamiento: cita.tipo,
      fechaRealizacion,
      proximaFechaRecomendada: proximaFecha,
      frecuenciaMeses,
      citaId: cita.id,
      budgetId: null,
      notas: "Detectado automáticamente",
      createdAt: fechaRealizacion,
    });
  });
  
  return tratamientos;
}
