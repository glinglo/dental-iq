import type { Paciente, Campana, TareaLlamada } from "@shared/schema";

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
      nombre: nombreCompleto,
      ultimaVisita,
      diagnostico: diagnosticos[Math.floor(Math.random() * diagnosticos.length)],
      telefono: generarTelefono(),
      email: generarEmail(nombre, apellido1),
      edad,
      estado,
      prioridad,
      tieneCitaFutura,
      mesesSinVisita,
      enCampana,
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

export function generarTareasLlamadasMock(pacientes: Paciente[]): TareaLlamada[] {
  const pacientesPerdidos = pacientes.filter(p => p.estado === "perdido" && p.prioridad);
  const tareas: TareaLlamada[] = [];

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
      fechaCreacion: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
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
