import type { Paciente, Campana, TareaLlamada, Conversacion, Mensaje, Cita } from "@shared/schema";

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
        conversacionId: convId,
        contenido,
        direccion,
        fechaEnvio,
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
  
  // Obtener inicio y fin de la semana actual (lunes a domingo)
  const inicioSemana = new Date(ahora);
  inicioSemana.setDate(ahora.getDate() - ahora.getDay() + 1); // Lunes
  inicioSemana.setHours(0, 0, 0, 0);
  
  const finSemana = new Date(inicioSemana);
  finSemana.setDate(inicioSemana.getDate() + 6); // Domingo
  
  // Horarios de trabajo: 9:00 a 20:00
  const horariosDisponibles = [9, 10, 11, 12, 13, 16, 17, 18, 19];
  
  // Generar citas para esta semana y la próxima
  const pacientesSeleccionados = pacientes
    .sort(() => Math.random() - 0.5)
    .slice(0, 60);
  
  let citaIndex = 0;
  
  for (let semana = 0; semana < 2; semana++) {
    for (let dia = 0; dia < 6; dia++) { // Lunes a sábado
      const fechaDia = new Date(inicioSemana);
      fechaDia.setDate(inicioSemana.getDate() + dia + (semana * 7));
      
      // Generar 4-8 citas por día
      const citasPorDia = 4 + Math.floor(Math.random() * 5);
      const horariosDelDia = [...horariosDisponibles].sort(() => Math.random() - 0.5).slice(0, citasPorDia);
      
      horariosDelDia.forEach(hora => {
        if (citaIndex >= pacientesSeleccionados.length) return;
        
        const paciente = pacientesSeleccionados[citaIndex];
        const fechaHora = new Date(fechaDia);
        fechaHora.setHours(hora, Math.random() < 0.5 ? 0 : 30, 0, 0);
        
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
  
  return citas.sort((a, b) => a.fechaHora.getTime() - b.fechaHora.getTime());
}
