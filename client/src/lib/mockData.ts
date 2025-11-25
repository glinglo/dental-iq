import type { Paciente, Campana, TareaLlamada, DashboardKPIs, ConversionPorCanal } from "@shared/schema";

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

// Generar fecha aleatoria entre hace X meses y hoy
function generarFechaAleatoria(mesesAtras: number): Date {
  const ahora = new Date();
  const fecha = new Date(ahora);
  fecha.setMonth(fecha.getMonth() - mesesAtras);
  // Añadir días aleatorios
  const diasAleatorios = Math.floor(Math.random() * 30);
  fecha.setDate(fecha.getDate() + diasAleatorios);
  return fecha;
}

// Generar teléfono español/latinoamericano
function generarTelefono(): string {
  const prefijos = ["+34 6", "+34 7", "+52 55", "+54 11", "+57 3", "+51 9", "+56 9"];
  const prefijo = prefijos[Math.floor(Math.random() * prefijos.length)];
  const numero = Math.floor(10000000 + Math.random() * 90000000);
  return `${prefijo}${numero.toString().substring(0, 8)}`;
}

// Generar email
function generarEmail(nombre: string, apellido: string): string {
  const dominios = ["gmail.com", "hotmail.com", "yahoo.es", "outlook.com", "icloud.com"];
  const dominio = dominios[Math.floor(Math.random() * dominios.length)];
  const nombreLimpio = nombre.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const apellidoLimpio = apellido.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return `${nombreLimpio}.${apellidoLimpio}@${dominio}`;
}

// Calcular meses sin visita
function calcularMesesSinVisita(ultimaVisita: Date): number {
  const ahora = new Date();
  const diffTime = Math.abs(ahora.getTime() - ultimaVisita.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.floor(diffDays / 30);
}

// Determinar prioridad según meses sin visita
function determinarPrioridad(mesesSinVisita: number): "Alta" | "Media" | "Baja" | undefined {
  if (mesesSinVisita > 12) return "Alta";
  if (mesesSinVisita >= 6) return "Media";
  if (mesesSinVisita >= 3) return "Baja";
  return undefined;
}

// Determinar estado del paciente
function determinarEstado(mesesSinVisita: number, tieneCitaFutura: boolean): "activo" | "perdido" | "sin cita" {
  if (mesesSinVisita > 6 && !tieneCitaFutura) return "perdido";
  if (tieneCitaFutura) return "activo";
  return "sin cita";
}

// Generar 200 pacientes mock
export function generarPacientesMock(): Paciente[] {
  const pacientes: Paciente[] = [];

  for (let i = 0; i < 200; i++) {
    const nombre = nombres[Math.floor(Math.random() * nombres.length)];
    const apellido1 = apellidos[Math.floor(Math.random() * apellidos.length)];
    const apellido2 = apellidos[Math.floor(Math.random() * apellidos.length)];
    const nombreCompleto = `${nombre} ${apellido1} ${apellido2}`;

    // Distribución realista de visitas: 
    // 30% muy reciente (0-3 meses), 40% media (3-9 meses), 30% perdidos (>9 meses)
    let mesesAtras: number;
    const rand = Math.random();
    if (rand < 0.3) {
      mesesAtras = Math.floor(Math.random() * 3); // 0-3 meses
    } else if (rand < 0.7) {
      mesesAtras = 3 + Math.floor(Math.random() * 6); // 3-9 meses
    } else {
      mesesAtras = 9 + Math.floor(Math.random() * 15); // 9-24 meses
    }

    const ultimaVisita = generarFechaAleatoria(mesesAtras);
    const mesesSinVisita = calcularMesesSinVisita(ultimaVisita);
    const tieneCitaFutura = Math.random() < 0.2; // 20% tiene cita futura
    const estado = determinarEstado(mesesSinVisita, tieneCitaFutura);
    const prioridad = estado === "perdido" ? determinarPrioridad(mesesSinVisita) : undefined;
    const edad = 18 + Math.floor(Math.random() * 62); // 18-80 años
    const enCampana = Math.random() < 0.25; // 25% en campaña

    pacientes.push({
      id: `pac-${i + 1}`,
      nombre: nombreCompleto,
      ultimaVisita,
      diagnostico: diagnosticos[Math.floor(Math.random() * diagnosticos.length)],
      telefono: generarTelefono(),
      email: generarEmail(nombre, apellido1),
      edad,
      estado,
      prioridad: prioridad || null,
      tieneCitaFutura,
      mesesSinVisita,
      enCampana,
    });
  }

  return pacientes;
}

// Generar campañas mock
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
      plantillaEmail: "",
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
      plantillaSMS: "",
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

// Generar tareas de llamadas mock
export function generarTareasLlamadasMock(pacientes: Paciente[]): TareaLlamada[] {
  const pacientesPerdidos = pacientes.filter(p => p.estado === "perdido" && p.prioridad);
  const tareas: TareaLlamada[] = [];

  // Seleccionar 20 pacientes aleatorios para tareas de llamadas
  const pacientesSeleccionados = pacientesPerdidos
    .sort(() => Math.random() - 0.5)
    .slice(0, 20);

  pacientesSeleccionados.forEach((paciente, index) => {
    const estados: TareaLlamada["estado"][] = ["pendiente", "contactado", "cita_agendada", "no_contactado"];
    const estado = index < 12 ? "pendiente" : estados[Math.floor(Math.random() * estados.length)];

    tareas.push({
      id: `tarea-${index + 1}`,
      pacienteId: paciente.id,
      pacienteNombre: paciente.nombre,
      telefono: paciente.telefono,
      motivo: `Reactivación - ${paciente.mesesSinVisita} meses sin visita`,
      prioridad: paciente.prioridad!,
      estado,
      fechaCreacion: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Últimos 7 días
      fechaContacto: estado === "contactado" || estado === "cita_agendada" 
        ? new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000) 
        : null,
      notas: estado === "contactado" ? "Paciente interesado, pendiente de confirmar fecha" : null,
    });
  });

  return tareas.sort((a, b) => {
    const prioridadOrden = { "Alta": 0, "Media": 1, "Baja": 2 };
    return prioridadOrden[a.prioridad as keyof typeof prioridadOrden] - 
           prioridadOrden[b.prioridad as keyof typeof prioridadOrden];
  });
}

// Calcular KPIs del dashboard
export function calcularDashboardKPIs(
  pacientes: Paciente[], 
  campanas: Campana[], 
  tareas: TareaLlamada[]
): DashboardKPIs {
  const pacientesPerdidos = pacientes.filter(p => p.estado === "perdido").length;
  const pacientesEnCampanas = pacientes.filter(p => p.enCampana).length;
  const contactosEnviados = campanas.reduce((sum, c) => sum + c.contactosEnviados, 0);
  const citasGeneradas = campanas.reduce((sum, c) => sum + c.citasGeneradas, 0) + 
                         tareas.filter(t => t.estado === "cita_agendada").length;
  const tasaConversion = contactosEnviados > 0 ? (citasGeneradas / contactosEnviados) * 100 : 0;
  const roiEstimado = 5.4; // Mock ROI

  return {
    pacientesPerdidos,
    pacientesEnCampanas,
    contactosEnviados,
    citasGeneradas,
    tasaConversion,
    roiEstimado,
  };
}

// Generar datos de conversión por canal
export function generarConversionPorCanal(): ConversionPorCanal[] {
  return [
    { canal: "Llamadas del staff", conversion: 14, contactos: 100, citas: 14 },
    { canal: "SMS", conversion: 7, contactos: 150, citas: 11 },
    { canal: "Email", conversion: 7, contactos: 90, citas: 6 },
  ];
}

// Singleton para mantener estado consistente
let pacientesCache: Paciente[] | null = null;
let campanasCache: Campana[] | null = null;
let tareasCache: TareaLlamada[] | null = null;

export function obtenerDatosMock() {
  if (!pacientesCache) {
    pacientesCache = generarPacientesMock();
    campanasCache = generarCampanasMock();
    tareasCache = generarTareasLlamadasMock(pacientesCache);
  }

  return {
    pacientes: pacientesCache,
    campanas: campanasCache,
    tareas: tareasCache,
    kpis: calcularDashboardKPIs(pacientesCache, campanasCache, tareasCache),
    conversionPorCanal: generarConversionPorCanal(),
  };
}

export function resetDatosMock() {
  pacientesCache = null;
  campanasCache = null;
  tareasCache = null;
}
