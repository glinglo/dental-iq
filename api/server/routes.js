var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/mockData.ts
function generarFechaAleatoria(mesesAtras) {
  const ahora = /* @__PURE__ */ new Date();
  const fecha = new Date(ahora);
  fecha.setMonth(fecha.getMonth() - mesesAtras);
  const diasAleatorios = Math.floor(Math.random() * 30);
  fecha.setDate(fecha.getDate() + diasAleatorios);
  return fecha;
}
function generarTelefono() {
  const prefijos = ["+34 6", "+34 7", "+52 55", "+54 11", "+57 3", "+51 9", "+56 9"];
  const prefijo = prefijos[Math.floor(Math.random() * prefijos.length)];
  const numero = Math.floor(1e7 + Math.random() * 9e7);
  return `${prefijo}${numero.toString().substring(0, 8)}`;
}
function generarWhatsApp() {
  return generarTelefono();
}
function generarEmail(nombre, apellido) {
  const dominios = ["gmail.com", "hotmail.com", "yahoo.es", "outlook.com", "icloud.com"];
  const dominio = dominios[Math.floor(Math.random() * dominios.length)];
  const nombreLimpio = nombre.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const apellidoLimpio = apellido.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return `${nombreLimpio}.${apellidoLimpio}@${dominio}`;
}
function calcularMesesSinVisita(ultimaVisita) {
  const ahora = /* @__PURE__ */ new Date();
  const diffTime = Math.abs(ahora.getTime() - ultimaVisita.getTime());
  const diffDays = Math.ceil(diffTime / (1e3 * 60 * 60 * 24));
  return Math.floor(diffDays / 30);
}
function determinarPrioridad(mesesSinVisita) {
  if (mesesSinVisita > 12) return "Alta";
  if (mesesSinVisita >= 6) return "Media";
  if (mesesSinVisita >= 3) return "Baja";
  return null;
}
function determinarEstado(mesesSinVisita, tieneCitaFutura) {
  if (mesesSinVisita > 6 && !tieneCitaFutura) return "perdido";
  if (tieneCitaFutura) return "activo";
  return "sin cita";
}
function generarPacientesMock() {
  const pacientes2 = [];
  for (let i = 0; i < 200; i++) {
    const nombre = nombres[Math.floor(Math.random() * nombres.length)];
    const apellido1 = apellidos[Math.floor(Math.random() * apellidos.length)];
    const apellido2 = apellidos[Math.floor(Math.random() * apellidos.length)];
    const nombreCompleto = `${nombre} ${apellido1} ${apellido2}`;
    let mesesAtras;
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
    pacientes2.push({
      id: `pac-${i + 1}`,
      clinicId: "clinic-1",
      // Default clinic
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
      notes: Math.random() < 0.3 ? "Paciente con historial de tratamientos previos" : null
    });
  }
  return pacientes2;
}
function generarCampanasMock() {
  return [
    {
      id: "camp-1",
      nombre: "Reactivaci\xF3n Primavera 2024",
      canales: ["SMS", "Email"],
      cadencia: "Opci\xF3n 1: SMS \u2192 Email \u2192 Llamada",
      plantillaSMS: "Hola {nombre}, hace tiempo que no te vemos en nuestra cl\xEDnica. \xBFTe gustar\xEDa agendar una cita? Responde S\xCD para confirmar.",
      plantillaEmail: "Estimado/a {nombre},\n\nEsperamos que se encuentre bien. Hemos notado que hace {meses} meses que no nos visita...",
      guionLlamada: "Buenos d\xEDas, \xBFhablo con {nombre}? Le llamamos de la Cl\xEDnica Dental para ofrecerle una cita de revisi\xF3n...",
      estado: "activa",
      pacientesIncluidos: 42,
      contactosEnviados: 126,
      citasGeneradas: 11,
      fechaCreacion: /* @__PURE__ */ new Date("2024-03-15")
    },
    {
      id: "camp-2",
      nombre: "Limpieza Especial Verano",
      canales: ["SMS", "Llamadas"],
      cadencia: "Opci\xF3n 2: SMS \u2192 SMS \u2192 Llamada",
      plantillaSMS: "\xA1Oferta especial de limpieza dental! {nombre}, reserva tu cita ahora.",
      plantillaEmail: null,
      guionLlamada: "Hola {nombre}, tenemos una promoci\xF3n especial en limpiezas dentales...",
      estado: "activa",
      pacientesIncluidos: 35,
      contactosEnviados: 105,
      citasGeneradas: 8,
      fechaCreacion: /* @__PURE__ */ new Date("2024-06-01")
    },
    {
      id: "camp-3",
      nombre: "Seguimiento Ortodoncia",
      canales: ["Email", "Llamadas"],
      cadencia: "Opci\xF3n 3: Email \u2192 Llamada",
      plantillaSMS: null,
      plantillaEmail: "Hola {nombre}, es importante continuar con tu tratamiento de ortodoncia...",
      guionLlamada: "Buenos d\xEDas {nombre}, le contactamos para hacer seguimiento de su ortodoncia...",
      estado: "pausada",
      pacientesIncluidos: 18,
      contactosEnviados: 54,
      citasGeneradas: 4,
      fechaCreacion: /* @__PURE__ */ new Date("2024-02-20")
    }
  ];
}
function generarTareasCampanaMock(pacientes2, campanas2) {
  const tareas = [];
  const hoy = /* @__PURE__ */ new Date();
  hoy.setHours(0, 0, 0, 0);
  const campanasActivas = campanas2.filter((c) => c.estado === "activa");
  if (campanasActivas.length === 0) return [];
  const pacientesEnRiesgo = pacientes2.filter((p) => {
    if (p.tieneCitaFutura || p.enCampana) return false;
    const ahora = /* @__PURE__ */ new Date();
    const diffTime = Math.abs(ahora.getTime() - p.ultimaVisita.getTime());
    const diffDays = Math.ceil(diffTime / (1e3 * 60 * 60 * 24));
    const mesesSinVisita = Math.floor(diffDays / 30);
    return mesesSinVisita >= 4 && mesesSinVisita <= 6;
  });
  const pacientesListos = pacientes2.filter((p) => {
    if (p.tieneCitaFutura || p.enCampana) return false;
    const ahora = /* @__PURE__ */ new Date();
    const diffTime = Math.abs(ahora.getTime() - p.ultimaVisita.getTime());
    const diffDays = Math.ceil(diffTime / (1e3 * 60 * 60 * 24));
    const mesesSinVisita = Math.floor(diffDays / 30);
    return mesesSinVisita >= 6;
  });
  if (pacientesEnRiesgo.length > 0 && campanasActivas.length > 0) {
    const campanaSeleccionada = campanasActivas[0];
    tareas.push({
      id: `tarea-campana-riesgo-1`,
      pacienteId: "",
      // No aplica para acciones de campaña
      pacienteNombre: `${pacientesEnRiesgo.length} pacientes`,
      telefono: "",
      email: null,
      motivo: `A\xF1adir ${pacientesEnRiesgo.length} pacientes en riesgo a campa\xF1a "${campanaSeleccionada.nombre}"`,
      prioridad: "Alta",
      tipoAccion: "a\xF1adir_campana_riesgo",
      estado: "pendiente",
      aprobado: false,
      fechaProgramada: null,
      fechaCreacion: new Date(Date.now() - 2 * 24 * 60 * 60 * 1e3),
      fechaContacto: null,
      fechaCompletada: null,
      notas: null,
      campanaId: campanaSeleccionada.id,
      cantidadPacientes: pacientesEnRiesgo.length
    });
  }
  if (pacientesListos.length > 0 && campanasActivas.length > 0) {
    const campanaSeleccionada = campanasActivas.length > 1 ? campanasActivas[1] : campanasActivas[0];
    tareas.push({
      id: `tarea-campana-lista-1`,
      pacienteId: "",
      pacienteNombre: `${pacientesListos.length} pacientes`,
      telefono: "",
      email: null,
      motivo: `${pacientesListos.length} pacientes listos para a\xF1adir a "${campanaSeleccionada.nombre}"`,
      prioridad: "Media",
      tipoAccion: "a\xF1adir_campana",
      estado: "pendiente",
      aprobado: false,
      fechaProgramada: null,
      fechaCreacion: new Date(Date.now() - 1 * 24 * 60 * 60 * 1e3),
      fechaContacto: null,
      fechaCompletada: null,
      notas: null,
      campanaId: campanaSeleccionada.id,
      cantidadPacientes: pacientesListos.length
    });
  }
  return tareas;
}
function generarTareasLlamadasMock(pacientes2) {
  const pacientesPerdidos = pacientes2.filter((p) => p.estado === "perdido" && p.prioridad);
  const tareas = [];
  const hoy = /* @__PURE__ */ new Date();
  hoy.setHours(0, 0, 0, 0);
  const pacientesSeleccionados = pacientesPerdidos.sort(() => Math.random() - 0.5).slice(0, 25);
  const tiposAccion = ["llamada", "email", "carta"];
  const motivosPorTipo = {
    llamada: [
      "Llamar para agendar cita de revisi\xF3n",
      "Recordatorio telef\xF3nico de seguimiento",
      "Contactar para ofertar limpieza dental"
    ],
    email: [
      "Enviar recordatorio por correo electr\xF3nico",
      "Enviar informaci\xF3n de promoci\xF3n especial",
      "Notificar disponibilidad de cita"
    ],
    carta: [
      "Enviar carta de reactivaci\xF3n",
      "Enviar invitaci\xF3n a revisi\xF3n anual",
      "Enviar folleto con promociones"
    ]
  };
  pacientesSeleccionados.forEach((paciente, index) => {
    const rand = Math.random();
    const tipoAccion = rand < 0.55 ? "llamada" : rand < 0.85 ? "email" : "carta";
    const motivosDelTipo = motivosPorTipo[tipoAccion];
    const motivo = motivosDelTipo[Math.floor(Math.random() * motivosDelTipo.length)];
    let estado = "pendiente";
    let aprobado = false;
    let fechaProgramada = null;
    let fechaCompletada = null;
    let fechaContacto = null;
    let notas = null;
    if (index < 8) {
      aprobado = false;
      estado = "pendiente";
    } else if (index < 18) {
      aprobado = true;
      estado = "pendiente";
      fechaProgramada = new Date(hoy);
    } else {
      aprobado = true;
      const estadosCompletados = ["contactado", "cita_agendada", "no_contactado"];
      estado = estadosCompletados[Math.floor(Math.random() * estadosCompletados.length)];
      fechaCompletada = new Date(hoy);
      if (estado === "contactado" || estado === "cita_agendada") {
        fechaContacto = new Date(hoy);
        notas = estado === "cita_agendada" ? "Cita agendada para la pr\xF3xima semana" : "Paciente contactado, pendiente de confirmar";
      }
    }
    tareas.push({
      id: `tarea-${index + 1}`,
      pacienteId: paciente.id,
      pacienteNombre: paciente.nombre,
      telefono: paciente.telefono,
      email: paciente.email,
      motivo,
      prioridad: paciente.prioridad,
      tipoAccion,
      estado,
      aprobado,
      fechaProgramada,
      fechaCreacion: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1e3),
      fechaContacto,
      fechaCompletada,
      notas,
      campanaId: null,
      cantidadPacientes: null
    });
  });
  return tareas.sort((a, b) => {
    const prioridadOrden = { "Alta": 0, "Media": 1, "Baja": 2 };
    return prioridadOrden[a.prioridad] - prioridadOrden[b.prioridad];
  });
}
function generarConversacionesMock(pacientes2) {
  const conversaciones2 = [];
  const mensajes2 = [];
  const canales = ["whatsapp", "sms", "email"];
  const pacientesConConversacion = pacientes2.sort(() => Math.random() - 0.5).slice(0, 40);
  pacientesConConversacion.forEach((paciente, index) => {
    const canal = canales[Math.floor(Math.random() * canales.length)];
    const convId = `conv-${index + 1}`;
    const numMensajes = 2 + Math.floor(Math.random() * 7);
    const horasAtras = Math.floor(Math.random() * 72);
    let ultimoMensaje = "";
    let fechaUltimoMensaje = /* @__PURE__ */ new Date();
    for (let i = 0; i < numMensajes; i++) {
      const esEntrante = i % 2 === 0;
      const direccion = esEntrante ? "entrante" : "saliente";
      const mensajesPool = esEntrante ? mensajesEjemplo[canal].entrantes : mensajesEjemplo[canal].salientes;
      const contenido = mensajesPool[Math.floor(Math.random() * mensajesPool.length)];
      const fechaEnvio = /* @__PURE__ */ new Date();
      fechaEnvio.setHours(fechaEnvio.getHours() - horasAtras + i);
      if (i === numMensajes - 1) {
        ultimoMensaje = contenido;
        fechaUltimoMensaje = fechaEnvio;
      }
      mensajes2.push({
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
        leido: i < numMensajes - 1 || !esEntrante
        // El último mensaje entrante puede estar sin leer
      });
    }
    const noLeidos = Math.random() < 0.5 ? Math.floor(Math.random() * 4) + 1 : 0;
    conversaciones2.push({
      id: convId,
      pacienteId: paciente.id,
      canal,
      ultimoMensaje,
      fechaUltimoMensaje,
      noLeidos,
      estado: "activa"
    });
  });
  return { conversaciones: conversaciones2, mensajes: mensajes2 };
}
function generarCitasMock(pacientes2) {
  const citas2 = [];
  const ahora = /* @__PURE__ */ new Date();
  console.log("[MockData] Generating citas - Current date:", ahora.toISOString());
  const inicioSemana = new Date(ahora);
  const diaSemana = ahora.getDay();
  const diasHastaLunes = diaSemana === 0 ? -6 : 1 - diaSemana;
  inicioSemana.setDate(ahora.getDate() + diasHastaLunes);
  inicioSemana.setHours(0, 0, 0, 0);
  console.log("[MockData] Inicio semana (lunes):", inicioSemana.toISOString());
  const semanasAtras = 2;
  const semanasAdelante = 4;
  const horariosDisponibles = [9, 10, 11, 12, 13, 16, 17, 18, 19];
  const pacientesSeleccionados = pacientes2.sort(() => Math.random() - 0.5).slice(0, 60);
  let citaIndex = 0;
  for (let semana = -semanasAtras; semana <= semanasAdelante; semana++) {
    for (let dia = 0; dia < 7; dia++) {
      const fechaDia = new Date(inicioSemana);
      fechaDia.setDate(inicioSemana.getDate() + dia + semana * 7);
      if (dia === 6) continue;
      const citasPorDia = 4 + Math.floor(Math.random() * 5);
      const horariosDelDia = [...horariosDisponibles].sort(() => Math.random() - 0.5).slice(0, citasPorDia);
      horariosDelDia.forEach((hora) => {
        if (citaIndex >= pacientesSeleccionados.length) return;
        const paciente = pacientesSeleccionados[citaIndex];
        const fechaHora = new Date(fechaDia);
        fechaHora.setHours(hora, Math.random() < 0.5 ? 0 : 30, 0, 0);
        const tipo = tiposCita[Math.floor(Math.random() * tiposCita.length)];
        const duracion = tipo === "urgencia" ? 45 : tipo === "tratamiento" ? 60 : 30;
        let estado;
        if (fechaHora < ahora) {
          const rand = Math.random();
          if (rand < 0.7) estado = "completada";
          else if (rand < 0.85) estado = "no_asistio";
          else estado = "cancelada";
        } else {
          estado = Math.random() < 0.6 ? "confirmada" : "programada";
        }
        citas2.push({
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
          origen: origenesCita[Math.floor(Math.random() * origenesCita.length)]
        });
        citaIndex++;
      });
    }
  }
  const citasOrdenadas = citas2.sort((a, b) => a.fechaHora.getTime() - b.fechaHora.getTime());
  console.log(`[MockData] Generated ${citasOrdenadas.length} citas`);
  if (citasOrdenadas.length > 0) {
    console.log(`[MockData] Primera cita: ${citasOrdenadas[0].fechaHora.toISOString()}`);
    console.log(`[MockData] \xDAltima cita: ${citasOrdenadas[citasOrdenadas.length - 1].fechaHora.toISOString()}`);
  }
  return citasOrdenadas;
}
function generarClinicsMock() {
  return [
    {
      id: "clinic-1",
      name: "Cl\xEDnica Dental DentalIQ",
      address: "Calle Principal 123, Madrid, Espa\xF1a",
      createdAt: /* @__PURE__ */ new Date("2024-01-01")
    },
    {
      id: "clinic-2",
      name: "Dental Care Barcelona",
      address: "Avenida Diagonal 456, Barcelona, Espa\xF1a",
      createdAt: /* @__PURE__ */ new Date("2024-02-15")
    }
  ];
}
function generarBudgetsMock(pacientes2) {
  const budgets2 = [];
  const tratamientos = [
    { name: "Limpieza dental profesional", amount: [80, 120] },
    { name: "Empaste composite", amount: [60, 100] },
    { name: "Endodoncia", amount: [200, 350] },
    { name: "Implante dental", amount: [800, 1500] },
    { name: "Ortodoncia completa", amount: [2e3, 4e3] },
    { name: "Blanqueamiento dental", amount: [150, 300] },
    { name: "Periodoncia", amount: [300, 600] },
    { name: "Corona dental", amount: [400, 800] },
    { name: "Puente dental", amount: [600, 1200] },
    { name: "Extracci\xF3n molar", amount: [80, 150] },
    { name: "Revisi\xF3n y diagn\xF3stico", amount: [40, 80] },
    { name: "Tratamiento de caries m\xFAltiples", amount: [200, 400] }
  ];
  const selectedPatients = pacientes2.sort(() => Math.random() - 0.5).slice(0, 50);
  selectedPatients.forEach((patient, index) => {
    const tratamiento = tratamientos[Math.floor(Math.random() * tratamientos.length)];
    const amount = (tratamiento.amount[0] + Math.random() * (tratamiento.amount[1] - tratamiento.amount[0])).toFixed(2);
    const procedures = [
      tratamiento.name,
      ...Math.random() < 0.3 ? ["Radiograf\xEDa panor\xE1mica"] : [],
      ...Math.random() < 0.2 ? ["Consulta inicial"] : []
    ];
    const treatmentDetails = {
      procedures,
      total: Number(amount)
    };
    let urgencyScore = 50;
    if (tratamiento.name.toLowerCase().includes("dolor") || tratamiento.name.toLowerCase().includes("urgencia") || tratamiento.name.toLowerCase().includes("extracci\xF3n")) {
      urgencyScore = 70 + Math.floor(Math.random() * 30);
    } else if (tratamiento.name.toLowerCase().includes("limpieza") || tratamiento.name.toLowerCase().includes("revisi\xF3n")) {
      urgencyScore = 30 + Math.floor(Math.random() * 20);
    } else {
      urgencyScore = 40 + Math.floor(Math.random() * 40);
    }
    let acceptanceProb = 60;
    const amountNum = Number(amount);
    if (amountNum < 100) {
      acceptanceProb = 70 + Math.floor(Math.random() * 25);
    } else if (amountNum < 500) {
      acceptanceProb = 50 + Math.floor(Math.random() * 30);
    } else {
      acceptanceProb = 30 + Math.floor(Math.random() * 40);
    }
    if (patient.edad > 65) {
      urgencyScore = Math.min(100, urgencyScore + 10);
    }
    const priority = calculatePriority(urgencyScore, acceptanceProb);
    const statusRand = Math.random();
    let status = "pending";
    if (statusRand < 0.2) {
      status = "accepted";
    } else if (statusRand < 0.3) {
      status = "rejected";
    }
    const createdAt = generarFechaAleatoria(Math.floor(Math.random() * 6));
    const updatedAt = new Date(createdAt.getTime() + Math.random() * 30 * 24 * 60 * 60 * 1e3);
    budgets2.push({
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
      updatedAt
    });
  });
  return budgets2.sort((a, b) => {
    const timeA = a.createdAt?.getTime() || 0;
    const timeB = b.createdAt?.getTime() || 0;
    return timeB - timeA;
  });
}
function calculatePriority(urgencyScore, acceptanceProb) {
  const combinedScore = urgencyScore * 0.6 + acceptanceProb * 0.4;
  if (combinedScore >= 75) return "high";
  if (combinedScore >= 50) return "medium";
  return "low";
}
function generarTratamientosPreventivosMock(pacientes2, citas2, budgets2) {
  const tratamientos = [];
  const citasPreventivas = citas2.filter(
    (c) => c.estado === "completada" && (c.tipo === "limpieza" || c.tipo === "revision")
  );
  citasPreventivas.slice(0, 30).forEach((cita, index) => {
    const frecuenciaMeses = cita.tipo === "limpieza" ? 6 : 12;
    const fechaRealizacion = new Date(cita.fechaHora);
    const proximaFecha = new Date(fechaRealizacion);
    proximaFecha.setMonth(proximaFecha.getMonth() + frecuenciaMeses);
    if (index < 10) {
      proximaFecha.setMonth(proximaFecha.getMonth() - 2);
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
      notas: "Detectado autom\xE1ticamente",
      createdAt: fechaRealizacion
    });
  });
  return tratamientos;
}
var nombres, apellidos, diagnosticos, mensajesEjemplo, tiposCita, doctores, salas, origenesCita;
var init_mockData = __esm({
  "server/mockData.ts"() {
    "use strict";
    nombres = [
      "Ana",
      "Mar\xEDa",
      "Carmen",
      "Isabel",
      "Dolores",
      "Pilar",
      "Teresa",
      "Rosa",
      "Luc\xEDa",
      "Elena",
      "Jos\xE9",
      "Antonio",
      "Manuel",
      "Francisco",
      "Juan",
      "Pedro",
      "Jes\xFAs",
      "\xC1ngel",
      "Miguel",
      "Carlos",
      "Laura",
      "Marta",
      "Paula",
      "Sara",
      "Andrea",
      "Cristina",
      "Patricia",
      "Raquel",
      "Beatriz",
      "M\xF3nica",
      "Diego",
      "Javier",
      "Fernando",
      "Luis",
      "Sergio",
      "Alberto",
      "Roberto",
      "Alejandro",
      "Enrique",
      "Rafael",
      "Sof\xEDa",
      "Valentina",
      "Isabella",
      "Camila",
      "Victoria",
      "Daniela",
      "Gabriela",
      "Natalia",
      "Adriana",
      "Marcela",
      "Santiago",
      "Sebasti\xE1n",
      "Mateo",
      "Nicol\xE1s",
      "Andr\xE9s",
      "Felipe",
      "Ricardo",
      "Eduardo",
      "Rodrigo",
      "Gustavo",
      "Carla",
      "Silvia",
      "Diana",
      "Juliana",
      "Claudia",
      "Lorena",
      "Ver\xF3nica",
      "Susana",
      "Alicia",
      "Gloria",
      "Jorge",
      "Ram\xF3n",
      "Alfredo",
      "Tom\xE1s",
      "V\xEDctor",
      "Ernesto",
      "Ra\xFAl",
      "Arturo",
      "Rub\xE9n",
      "Mart\xEDn",
      "Irene",
      "Nuria",
      "Roc\xEDo",
      "Sonia",
      "Amparo",
      "Montserrat",
      "Consuelo",
      "Encarna",
      "Remedios",
      "Inmaculada",
      "Joaqu\xEDn",
      "Salvador",
      "Gregorio",
      "Lorenzo",
      "Ignacio",
      "Emilio",
      "Pablo",
      "C\xE9sar",
      "\xD3scar",
      "Daniel"
    ];
    apellidos = [
      "Garc\xEDa",
      "Rodr\xEDguez",
      "Mart\xEDnez",
      "Gonz\xE1lez",
      "Fern\xE1ndez",
      "L\xF3pez",
      "D\xEDaz",
      "P\xE9rez",
      "S\xE1nchez",
      "Romero",
      "Torres",
      "Ram\xEDrez",
      "Flores",
      "Rivera",
      "G\xF3mez",
      "Morales",
      "Cruz",
      "Reyes",
      "Ortiz",
      "Guti\xE9rrez",
      "Jim\xE9nez",
      "Ruiz",
      "Hern\xE1ndez",
      "Mendoza",
      "\xC1lvarez",
      "Castillo",
      "Moreno",
      "Vargas",
      "Ramos",
      "Castro",
      "Vega",
      "Medina",
      "Silva",
      "Rojas",
      "Guerrero",
      "Navarro",
      "Campos",
      "Santos",
      "Aguilar",
      "Blanco",
      "Mu\xF1oz",
      "Ortega",
      "Delgado",
      "Soto",
      "V\xE1zquez",
      "Serrano",
      "R\xEDos",
      "Contreras",
      "Herrera",
      "Dom\xEDnguez"
    ];
    diagnosticos = [
      "Limpieza dental",
      "Ortodoncia",
      "Endodoncia",
      "Implante dental",
      "Extracci\xF3n molar",
      "Blanqueamiento",
      "Periodoncia",
      "Revisi\xF3n general",
      "Tratamiento caries",
      "Pr\xF3tesis dental",
      "Gingivitis",
      "Conducto radicular",
      "Corona dental",
      "Puente dental",
      "Ortopedia maxilar"
    ];
    mensajesEjemplo = {
      whatsapp: {
        entrantes: [
          "Hola, me gustar\xEDa saber si tienen citas disponibles",
          "Buenos d\xEDas, \xBFcu\xE1nto cuesta una limpieza dental?",
          "Necesito reagendar mi cita",
          "\xBFTienen horario de tarde?",
          "Me duele una muela, \xBFpueden atenderme hoy?",
          "Gracias por la informaci\xF3n",
          "Perfecto, confirmo la cita",
          "\xBFAceptan tarjeta de cr\xE9dito?",
          "\xBFCu\xE1nto dura el tratamiento de ortodoncia?",
          "Quisiera informaci\xF3n sobre blanqueamiento"
        ],
        salientes: [
          "\xA1Hola! Claro, tenemos disponibilidad ma\xF1ana a las 10:00 o 16:00. \xBFCu\xE1l le viene mejor?",
          "Buenos d\xEDas. La limpieza dental tiene un precio de 60\u20AC. \xBFLe gustar\xEDa agendar una cita?",
          "Sin problema. \xBFPara qu\xE9 d\xEDa le gustar\xEDa reprogramar?",
          "S\xED, atendemos de lunes a viernes de 9:00 a 20:00",
          "Entendemos su urgencia. Podemos atenderle hoy a las 18:00. \xBFLe parece bien?",
          "\xA1De nada! Estamos para ayudarle",
          "Perfecto, queda confirmada su cita. Le enviaremos un recordatorio",
          "S\xED, aceptamos todas las tarjetas y tambi\xE9n financiaci\xF3n",
          "El tratamiento de ortodoncia suele durar entre 12 y 24 meses dependiendo del caso",
          "El blanqueamiento dental cuesta 250\u20AC e incluye dos sesiones"
        ]
      },
      sms: {
        entrantes: [
          "OK confirmo",
          "S\xED, ah\xED estar\xE9",
          "Necesito cambiar la hora",
          "\xBFPueden llamarme?",
          "Gracias"
        ],
        salientes: [
          "Recordatorio: Tiene cita ma\xF1ana a las 10:00 en Cl\xEDnica Dental. Responda OK para confirmar.",
          "Su cita ha sido confirmada para el d\xEDa 15 a las 16:00. \xA1Le esperamos!",
          "Oferta especial: Limpieza dental + revisi\xF3n por 45\u20AC. Reserve al 900 123 456",
          "Le llamaremos en breve. Gracias por contactarnos.",
          "Gracias por su visita. Recuerde su pr\xF3xima cita en 6 meses."
        ]
      },
      email: {
        entrantes: [
          "Estimados, solicito informaci\xF3n sobre tratamientos de ortodoncia para mi hijo de 14 a\xF1os.",
          "Buenos d\xEDas, adjunto mis radiograf\xEDas para valoraci\xF3n.",
          "Confirmo mi asistencia a la cita del viernes.",
          "Necesito factura de mi \xFAltima visita.",
          "\xBFPodr\xEDan enviarme los horarios disponibles para la pr\xF3xima semana?"
        ],
        salientes: [
          "Estimado/a paciente,\n\nGracias por contactarnos. Le informamos que ofrecemos ortodoncia invisible y tradicional para adolescentes. Le adjuntamos nuestro cat\xE1logo de tratamientos.\n\nSaludos cordiales,\nCl\xEDnica Dental",
          "Buenos d\xEDas,\n\nHemos recibido sus radiograf\xEDas. Nuestro especialista las revisar\xE1 y le contactaremos en 24-48h con la valoraci\xF3n.\n\nGracias por confiar en nosotros.",
          "Gracias por confirmar. Le esperamos el viernes a las 11:00.\n\nRecuerde traer su tarjeta de seguro si dispone de uno.",
          "Adjunta encontrar\xE1 la factura solicitada (N\xBA 2024-1234).\n\nPara cualquier consulta, no dude en contactarnos.",
          "Buenos d\xEDas,\n\nLe informamos de nuestra disponibilidad:\n- Lunes: 10:00, 16:00\n- Martes: 09:00, 12:00, 17:00\n- Mi\xE9rcoles: 11:00, 15:00\n\n\xBFQu\xE9 horario le vendr\xEDa mejor?"
        ]
      }
    };
    tiposCita = ["revision", "limpieza", "tratamiento", "consulta", "urgencia"];
    doctores = ["Dr. Garc\xEDa", "Dra. Mart\xEDnez", "Dr. L\xF3pez", "Dra. Fern\xE1ndez"];
    salas = ["Sala 1", "Sala 2", "Sala 3", "Consultorio A", "Consultorio B"];
    origenesCita = ["reactivacion", "web", "telefono", "presencial"];
  }
});

// node_modules/openai/internal/tslib.mjs
function __classPrivateFieldSet(receiver, state, value, kind, f) {
  if (kind === "m")
    throw new TypeError("Private method is not writable");
  if (kind === "a" && !f)
    throw new TypeError("Private accessor was defined without a setter");
  if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver))
    throw new TypeError("Cannot write private member to an object whose class did not declare it");
  return kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value), value;
}
function __classPrivateFieldGet(receiver, state, kind, f) {
  if (kind === "a" && !f)
    throw new TypeError("Private accessor was defined without a getter");
  if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver))
    throw new TypeError("Cannot read private member from an object whose class did not declare it");
  return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
}
var init_tslib = __esm({
  "node_modules/openai/internal/tslib.mjs"() {
  }
});

// node_modules/openai/internal/utils/uuid.mjs
var uuid4;
var init_uuid = __esm({
  "node_modules/openai/internal/utils/uuid.mjs"() {
    uuid4 = function() {
      const { crypto: crypto2 } = globalThis;
      if (crypto2?.randomUUID) {
        uuid4 = crypto2.randomUUID.bind(crypto2);
        return crypto2.randomUUID();
      }
      const u8 = new Uint8Array(1);
      const randomByte = crypto2 ? () => crypto2.getRandomValues(u8)[0] : () => Math.random() * 255 & 255;
      return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) => (+c ^ randomByte() & 15 >> +c / 4).toString(16));
    };
  }
});

// node_modules/openai/internal/errors.mjs
function isAbortError(err) {
  return typeof err === "object" && err !== null && // Spec-compliant fetch implementations
  ("name" in err && err.name === "AbortError" || // Expo fetch
  "message" in err && String(err.message).includes("FetchRequestCanceledException"));
}
var castToError;
var init_errors = __esm({
  "node_modules/openai/internal/errors.mjs"() {
    castToError = (err) => {
      if (err instanceof Error)
        return err;
      if (typeof err === "object" && err !== null) {
        try {
          if (Object.prototype.toString.call(err) === "[object Error]") {
            const error = new Error(err.message, err.cause ? { cause: err.cause } : {});
            if (err.stack)
              error.stack = err.stack;
            if (err.cause && !error.cause)
              error.cause = err.cause;
            if (err.name)
              error.name = err.name;
            return error;
          }
        } catch {
        }
        try {
          return new Error(JSON.stringify(err));
        } catch {
        }
      }
      return new Error(err);
    };
  }
});

// node_modules/openai/core/error.mjs
var OpenAIError, APIError, APIUserAbortError, APIConnectionError, APIConnectionTimeoutError, BadRequestError, AuthenticationError, PermissionDeniedError, NotFoundError, ConflictError, UnprocessableEntityError, RateLimitError, InternalServerError, LengthFinishReasonError, ContentFilterFinishReasonError, InvalidWebhookSignatureError;
var init_error = __esm({
  "node_modules/openai/core/error.mjs"() {
    init_errors();
    OpenAIError = class extends Error {
    };
    APIError = class _APIError extends OpenAIError {
      constructor(status, error, message2, headers) {
        super(`${_APIError.makeMessage(status, error, message2)}`);
        this.status = status;
        this.headers = headers;
        this.requestID = headers?.get("x-request-id");
        this.error = error;
        const data = error;
        this.code = data?.["code"];
        this.param = data?.["param"];
        this.type = data?.["type"];
      }
      static makeMessage(status, error, message2) {
        const msg = error?.message ? typeof error.message === "string" ? error.message : JSON.stringify(error.message) : error ? JSON.stringify(error) : message2;
        if (status && msg) {
          return `${status} ${msg}`;
        }
        if (status) {
          return `${status} status code (no body)`;
        }
        if (msg) {
          return msg;
        }
        return "(no status code or body)";
      }
      static generate(status, errorResponse, message2, headers) {
        if (!status || !headers) {
          return new APIConnectionError({ message: message2, cause: castToError(errorResponse) });
        }
        const error = errorResponse?.["error"];
        if (status === 400) {
          return new BadRequestError(status, error, message2, headers);
        }
        if (status === 401) {
          return new AuthenticationError(status, error, message2, headers);
        }
        if (status === 403) {
          return new PermissionDeniedError(status, error, message2, headers);
        }
        if (status === 404) {
          return new NotFoundError(status, error, message2, headers);
        }
        if (status === 409) {
          return new ConflictError(status, error, message2, headers);
        }
        if (status === 422) {
          return new UnprocessableEntityError(status, error, message2, headers);
        }
        if (status === 429) {
          return new RateLimitError(status, error, message2, headers);
        }
        if (status >= 500) {
          return new InternalServerError(status, error, message2, headers);
        }
        return new _APIError(status, error, message2, headers);
      }
    };
    APIUserAbortError = class extends APIError {
      constructor({ message: message2 } = {}) {
        super(void 0, void 0, message2 || "Request was aborted.", void 0);
      }
    };
    APIConnectionError = class extends APIError {
      constructor({ message: message2, cause }) {
        super(void 0, void 0, message2 || "Connection error.", void 0);
        if (cause)
          this.cause = cause;
      }
    };
    APIConnectionTimeoutError = class extends APIConnectionError {
      constructor({ message: message2 } = {}) {
        super({ message: message2 ?? "Request timed out." });
      }
    };
    BadRequestError = class extends APIError {
    };
    AuthenticationError = class extends APIError {
    };
    PermissionDeniedError = class extends APIError {
    };
    NotFoundError = class extends APIError {
    };
    ConflictError = class extends APIError {
    };
    UnprocessableEntityError = class extends APIError {
    };
    RateLimitError = class extends APIError {
    };
    InternalServerError = class extends APIError {
    };
    LengthFinishReasonError = class extends OpenAIError {
      constructor() {
        super(`Could not parse response content as the length limit was reached`);
      }
    };
    ContentFilterFinishReasonError = class extends OpenAIError {
      constructor() {
        super(`Could not parse response content as the request was rejected by the content filter`);
      }
    };
    InvalidWebhookSignatureError = class extends Error {
      constructor(message2) {
        super(message2);
      }
    };
  }
});

// node_modules/openai/internal/utils/values.mjs
function maybeObj(x) {
  if (typeof x !== "object") {
    return {};
  }
  return x ?? {};
}
function isEmptyObj(obj) {
  if (!obj)
    return true;
  for (const _k in obj)
    return false;
  return true;
}
function hasOwn(obj, key) {
  return Object.prototype.hasOwnProperty.call(obj, key);
}
function isObj(obj) {
  return obj != null && typeof obj === "object" && !Array.isArray(obj);
}
var startsWithSchemeRegexp, isAbsoluteURL, isArray, isReadonlyArray, validatePositiveInteger, safeJSON;
var init_values = __esm({
  "node_modules/openai/internal/utils/values.mjs"() {
    init_error();
    startsWithSchemeRegexp = /^[a-z][a-z0-9+.-]*:/i;
    isAbsoluteURL = (url) => {
      return startsWithSchemeRegexp.test(url);
    };
    isArray = (val) => (isArray = Array.isArray, isArray(val));
    isReadonlyArray = isArray;
    validatePositiveInteger = (name, n) => {
      if (typeof n !== "number" || !Number.isInteger(n)) {
        throw new OpenAIError(`${name} must be an integer`);
      }
      if (n < 0) {
        throw new OpenAIError(`${name} must be a positive integer`);
      }
      return n;
    };
    safeJSON = (text2) => {
      try {
        return JSON.parse(text2);
      } catch (err) {
        return void 0;
      }
    };
  }
});

// node_modules/openai/internal/utils/sleep.mjs
var sleep;
var init_sleep = __esm({
  "node_modules/openai/internal/utils/sleep.mjs"() {
    sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  }
});

// node_modules/openai/version.mjs
var VERSION;
var init_version = __esm({
  "node_modules/openai/version.mjs"() {
    VERSION = "6.10.0";
  }
});

// node_modules/openai/internal/detect-platform.mjs
function getDetectedPlatform() {
  if (typeof Deno !== "undefined" && Deno.build != null) {
    return "deno";
  }
  if (typeof EdgeRuntime !== "undefined") {
    return "edge";
  }
  if (Object.prototype.toString.call(typeof globalThis.process !== "undefined" ? globalThis.process : 0) === "[object process]") {
    return "node";
  }
  return "unknown";
}
function getBrowserInfo() {
  if (typeof navigator === "undefined" || !navigator) {
    return null;
  }
  const browserPatterns = [
    { key: "edge", pattern: /Edge(?:\W+(\d+)\.(\d+)(?:\.(\d+))?)?/ },
    { key: "ie", pattern: /MSIE(?:\W+(\d+)\.(\d+)(?:\.(\d+))?)?/ },
    { key: "ie", pattern: /Trident(?:.*rv\:(\d+)\.(\d+)(?:\.(\d+))?)?/ },
    { key: "chrome", pattern: /Chrome(?:\W+(\d+)\.(\d+)(?:\.(\d+))?)?/ },
    { key: "firefox", pattern: /Firefox(?:\W+(\d+)\.(\d+)(?:\.(\d+))?)?/ },
    { key: "safari", pattern: /(?:Version\W+(\d+)\.(\d+)(?:\.(\d+))?)?(?:\W+Mobile\S*)?\W+Safari/ }
  ];
  for (const { key, pattern } of browserPatterns) {
    const match3 = pattern.exec(navigator.userAgent);
    if (match3) {
      const major = match3[1] || 0;
      const minor = match3[2] || 0;
      const patch = match3[3] || 0;
      return { browser: key, version: `${major}.${minor}.${patch}` };
    }
  }
  return null;
}
var isRunningInBrowser, getPlatformProperties, normalizeArch, normalizePlatform, _platformHeaders, getPlatformHeaders;
var init_detect_platform = __esm({
  "node_modules/openai/internal/detect-platform.mjs"() {
    init_version();
    isRunningInBrowser = () => {
      return (
        // @ts-ignore
        typeof window !== "undefined" && // @ts-ignore
        typeof window.document !== "undefined" && // @ts-ignore
        typeof navigator !== "undefined"
      );
    };
    getPlatformProperties = () => {
      const detectedPlatform = getDetectedPlatform();
      if (detectedPlatform === "deno") {
        return {
          "X-Stainless-Lang": "js",
          "X-Stainless-Package-Version": VERSION,
          "X-Stainless-OS": normalizePlatform(Deno.build.os),
          "X-Stainless-Arch": normalizeArch(Deno.build.arch),
          "X-Stainless-Runtime": "deno",
          "X-Stainless-Runtime-Version": typeof Deno.version === "string" ? Deno.version : Deno.version?.deno ?? "unknown"
        };
      }
      if (typeof EdgeRuntime !== "undefined") {
        return {
          "X-Stainless-Lang": "js",
          "X-Stainless-Package-Version": VERSION,
          "X-Stainless-OS": "Unknown",
          "X-Stainless-Arch": `other:${EdgeRuntime}`,
          "X-Stainless-Runtime": "edge",
          "X-Stainless-Runtime-Version": globalThis.process.version
        };
      }
      if (detectedPlatform === "node") {
        return {
          "X-Stainless-Lang": "js",
          "X-Stainless-Package-Version": VERSION,
          "X-Stainless-OS": normalizePlatform(globalThis.process.platform ?? "unknown"),
          "X-Stainless-Arch": normalizeArch(globalThis.process.arch ?? "unknown"),
          "X-Stainless-Runtime": "node",
          "X-Stainless-Runtime-Version": globalThis.process.version ?? "unknown"
        };
      }
      const browserInfo = getBrowserInfo();
      if (browserInfo) {
        return {
          "X-Stainless-Lang": "js",
          "X-Stainless-Package-Version": VERSION,
          "X-Stainless-OS": "Unknown",
          "X-Stainless-Arch": "unknown",
          "X-Stainless-Runtime": `browser:${browserInfo.browser}`,
          "X-Stainless-Runtime-Version": browserInfo.version
        };
      }
      return {
        "X-Stainless-Lang": "js",
        "X-Stainless-Package-Version": VERSION,
        "X-Stainless-OS": "Unknown",
        "X-Stainless-Arch": "unknown",
        "X-Stainless-Runtime": "unknown",
        "X-Stainless-Runtime-Version": "unknown"
      };
    };
    normalizeArch = (arch) => {
      if (arch === "x32")
        return "x32";
      if (arch === "x86_64" || arch === "x64")
        return "x64";
      if (arch === "arm")
        return "arm";
      if (arch === "aarch64" || arch === "arm64")
        return "arm64";
      if (arch)
        return `other:${arch}`;
      return "unknown";
    };
    normalizePlatform = (platform) => {
      platform = platform.toLowerCase();
      if (platform.includes("ios"))
        return "iOS";
      if (platform === "android")
        return "Android";
      if (platform === "darwin")
        return "MacOS";
      if (platform === "win32")
        return "Windows";
      if (platform === "freebsd")
        return "FreeBSD";
      if (platform === "openbsd")
        return "OpenBSD";
      if (platform === "linux")
        return "Linux";
      if (platform)
        return `Other:${platform}`;
      return "Unknown";
    };
    getPlatformHeaders = () => {
      return _platformHeaders ?? (_platformHeaders = getPlatformProperties());
    };
  }
});

// node_modules/openai/internal/shims.mjs
function getDefaultFetch() {
  if (typeof fetch !== "undefined") {
    return fetch;
  }
  throw new Error("`fetch` is not defined as a global; Either pass `fetch` to the client, `new OpenAI({ fetch })` or polyfill the global, `globalThis.fetch = fetch`");
}
function makeReadableStream(...args) {
  const ReadableStream = globalThis.ReadableStream;
  if (typeof ReadableStream === "undefined") {
    throw new Error("`ReadableStream` is not defined as a global; You will need to polyfill it, `globalThis.ReadableStream = ReadableStream`");
  }
  return new ReadableStream(...args);
}
function ReadableStreamFrom(iterable) {
  let iter = Symbol.asyncIterator in iterable ? iterable[Symbol.asyncIterator]() : iterable[Symbol.iterator]();
  return makeReadableStream({
    start() {
    },
    async pull(controller) {
      const { done, value } = await iter.next();
      if (done) {
        controller.close();
      } else {
        controller.enqueue(value);
      }
    },
    async cancel() {
      await iter.return?.();
    }
  });
}
function ReadableStreamToAsyncIterable(stream) {
  if (stream[Symbol.asyncIterator])
    return stream;
  const reader = stream.getReader();
  return {
    async next() {
      try {
        const result = await reader.read();
        if (result?.done)
          reader.releaseLock();
        return result;
      } catch (e) {
        reader.releaseLock();
        throw e;
      }
    },
    async return() {
      const cancelPromise = reader.cancel();
      reader.releaseLock();
      await cancelPromise;
      return { done: true, value: void 0 };
    },
    [Symbol.asyncIterator]() {
      return this;
    }
  };
}
async function CancelReadableStream(stream) {
  if (stream === null || typeof stream !== "object")
    return;
  if (stream[Symbol.asyncIterator]) {
    await stream[Symbol.asyncIterator]().return?.();
    return;
  }
  const reader = stream.getReader();
  const cancelPromise = reader.cancel();
  reader.releaseLock();
  await cancelPromise;
}
var init_shims = __esm({
  "node_modules/openai/internal/shims.mjs"() {
  }
});

// node_modules/openai/internal/request-options.mjs
var FallbackEncoder;
var init_request_options = __esm({
  "node_modules/openai/internal/request-options.mjs"() {
    FallbackEncoder = ({ headers, body }) => {
      return {
        bodyHeaders: {
          "content-type": "application/json"
        },
        body: JSON.stringify(body)
      };
    };
  }
});

// node_modules/openai/internal/qs/formats.mjs
var default_format, default_formatter, formatters2, RFC1738;
var init_formats = __esm({
  "node_modules/openai/internal/qs/formats.mjs"() {
    default_format = "RFC3986";
    default_formatter = (v) => String(v);
    formatters2 = {
      RFC1738: (v) => String(v).replace(/%20/g, "+"),
      RFC3986: default_formatter
    };
    RFC1738 = "RFC1738";
  }
});

// node_modules/openai/internal/qs/utils.mjs
function is_buffer(obj) {
  if (!obj || typeof obj !== "object") {
    return false;
  }
  return !!(obj.constructor && obj.constructor.isBuffer && obj.constructor.isBuffer(obj));
}
function maybe_map(val, fn) {
  if (isArray(val)) {
    const mapped = [];
    for (let i = 0; i < val.length; i += 1) {
      mapped.push(fn(val[i]));
    }
    return mapped;
  }
  return fn(val);
}
var has, hex_table, limit, encode;
var init_utils = __esm({
  "node_modules/openai/internal/qs/utils.mjs"() {
    init_formats();
    init_values();
    has = (obj, key) => (has = Object.hasOwn ?? Function.prototype.call.bind(Object.prototype.hasOwnProperty), has(obj, key));
    hex_table = /* @__PURE__ */ (() => {
      const array = [];
      for (let i = 0; i < 256; ++i) {
        array.push("%" + ((i < 16 ? "0" : "") + i.toString(16)).toUpperCase());
      }
      return array;
    })();
    limit = 1024;
    encode = (str2, _defaultEncoder, charset, _kind, format2) => {
      if (str2.length === 0) {
        return str2;
      }
      let string = str2;
      if (typeof str2 === "symbol") {
        string = Symbol.prototype.toString.call(str2);
      } else if (typeof str2 !== "string") {
        string = String(str2);
      }
      if (charset === "iso-8859-1") {
        return escape(string).replace(/%u[0-9a-f]{4}/gi, function($0) {
          return "%26%23" + parseInt($0.slice(2), 16) + "%3B";
        });
      }
      let out = "";
      for (let j = 0; j < string.length; j += limit) {
        const segment = string.length >= limit ? string.slice(j, j + limit) : string;
        const arr = [];
        for (let i = 0; i < segment.length; ++i) {
          let c = segment.charCodeAt(i);
          if (c === 45 || // -
          c === 46 || // .
          c === 95 || // _
          c === 126 || // ~
          c >= 48 && c <= 57 || // 0-9
          c >= 65 && c <= 90 || // a-z
          c >= 97 && c <= 122 || // A-Z
          format2 === RFC1738 && (c === 40 || c === 41)) {
            arr[arr.length] = segment.charAt(i);
            continue;
          }
          if (c < 128) {
            arr[arr.length] = hex_table[c];
            continue;
          }
          if (c < 2048) {
            arr[arr.length] = hex_table[192 | c >> 6] + hex_table[128 | c & 63];
            continue;
          }
          if (c < 55296 || c >= 57344) {
            arr[arr.length] = hex_table[224 | c >> 12] + hex_table[128 | c >> 6 & 63] + hex_table[128 | c & 63];
            continue;
          }
          i += 1;
          c = 65536 + ((c & 1023) << 10 | segment.charCodeAt(i) & 1023);
          arr[arr.length] = hex_table[240 | c >> 18] + hex_table[128 | c >> 12 & 63] + hex_table[128 | c >> 6 & 63] + hex_table[128 | c & 63];
        }
        out += arr.join("");
      }
      return out;
    };
  }
});

// node_modules/openai/internal/qs/stringify.mjs
function is_non_nullish_primitive(v) {
  return typeof v === "string" || typeof v === "number" || typeof v === "boolean" || typeof v === "symbol" || typeof v === "bigint";
}
function inner_stringify(object, prefix, generateArrayPrefix, commaRoundTrip, allowEmptyArrays, strictNullHandling, skipNulls, encodeDotInKeys, encoder, filter, sort, allowDots, serializeDate, format2, formatter, encodeValuesOnly, charset, sideChannel) {
  let obj = object;
  let tmp_sc = sideChannel;
  let step = 0;
  let find_flag = false;
  while ((tmp_sc = tmp_sc.get(sentinel)) !== void 0 && !find_flag) {
    const pos = tmp_sc.get(object);
    step += 1;
    if (typeof pos !== "undefined") {
      if (pos === step) {
        throw new RangeError("Cyclic object value");
      } else {
        find_flag = true;
      }
    }
    if (typeof tmp_sc.get(sentinel) === "undefined") {
      step = 0;
    }
  }
  if (typeof filter === "function") {
    obj = filter(prefix, obj);
  } else if (obj instanceof Date) {
    obj = serializeDate?.(obj);
  } else if (generateArrayPrefix === "comma" && isArray(obj)) {
    obj = maybe_map(obj, function(value) {
      if (value instanceof Date) {
        return serializeDate?.(value);
      }
      return value;
    });
  }
  if (obj === null) {
    if (strictNullHandling) {
      return encoder && !encodeValuesOnly ? (
        // @ts-expect-error
        encoder(prefix, defaults.encoder, charset, "key", format2)
      ) : prefix;
    }
    obj = "";
  }
  if (is_non_nullish_primitive(obj) || is_buffer(obj)) {
    if (encoder) {
      const key_value = encodeValuesOnly ? prefix : encoder(prefix, defaults.encoder, charset, "key", format2);
      return [
        formatter?.(key_value) + "=" + // @ts-expect-error
        formatter?.(encoder(obj, defaults.encoder, charset, "value", format2))
      ];
    }
    return [formatter?.(prefix) + "=" + formatter?.(String(obj))];
  }
  const values = [];
  if (typeof obj === "undefined") {
    return values;
  }
  let obj_keys;
  if (generateArrayPrefix === "comma" && isArray(obj)) {
    if (encodeValuesOnly && encoder) {
      obj = maybe_map(obj, encoder);
    }
    obj_keys = [{ value: obj.length > 0 ? obj.join(",") || null : void 0 }];
  } else if (isArray(filter)) {
    obj_keys = filter;
  } else {
    const keys = Object.keys(obj);
    obj_keys = sort ? keys.sort(sort) : keys;
  }
  const encoded_prefix = encodeDotInKeys ? String(prefix).replace(/\./g, "%2E") : String(prefix);
  const adjusted_prefix = commaRoundTrip && isArray(obj) && obj.length === 1 ? encoded_prefix + "[]" : encoded_prefix;
  if (allowEmptyArrays && isArray(obj) && obj.length === 0) {
    return adjusted_prefix + "[]";
  }
  for (let j = 0; j < obj_keys.length; ++j) {
    const key = obj_keys[j];
    const value = (
      // @ts-ignore
      typeof key === "object" && typeof key.value !== "undefined" ? key.value : obj[key]
    );
    if (skipNulls && value === null) {
      continue;
    }
    const encoded_key = allowDots && encodeDotInKeys ? key.replace(/\./g, "%2E") : key;
    const key_prefix = isArray(obj) ? typeof generateArrayPrefix === "function" ? generateArrayPrefix(adjusted_prefix, encoded_key) : adjusted_prefix : adjusted_prefix + (allowDots ? "." + encoded_key : "[" + encoded_key + "]");
    sideChannel.set(object, step);
    const valueSideChannel = /* @__PURE__ */ new WeakMap();
    valueSideChannel.set(sentinel, sideChannel);
    push_to_array(values, inner_stringify(
      value,
      key_prefix,
      generateArrayPrefix,
      commaRoundTrip,
      allowEmptyArrays,
      strictNullHandling,
      skipNulls,
      encodeDotInKeys,
      // @ts-ignore
      generateArrayPrefix === "comma" && encodeValuesOnly && isArray(obj) ? null : encoder,
      filter,
      sort,
      allowDots,
      serializeDate,
      format2,
      formatter,
      encodeValuesOnly,
      charset,
      valueSideChannel
    ));
  }
  return values;
}
function normalize_stringify_options(opts = defaults) {
  if (typeof opts.allowEmptyArrays !== "undefined" && typeof opts.allowEmptyArrays !== "boolean") {
    throw new TypeError("`allowEmptyArrays` option can only be `true` or `false`, when provided");
  }
  if (typeof opts.encodeDotInKeys !== "undefined" && typeof opts.encodeDotInKeys !== "boolean") {
    throw new TypeError("`encodeDotInKeys` option can only be `true` or `false`, when provided");
  }
  if (opts.encoder !== null && typeof opts.encoder !== "undefined" && typeof opts.encoder !== "function") {
    throw new TypeError("Encoder has to be a function.");
  }
  const charset = opts.charset || defaults.charset;
  if (typeof opts.charset !== "undefined" && opts.charset !== "utf-8" && opts.charset !== "iso-8859-1") {
    throw new TypeError("The charset option must be either utf-8, iso-8859-1, or undefined");
  }
  let format2 = default_format;
  if (typeof opts.format !== "undefined") {
    if (!has(formatters2, opts.format)) {
      throw new TypeError("Unknown format option provided.");
    }
    format2 = opts.format;
  }
  const formatter = formatters2[format2];
  let filter = defaults.filter;
  if (typeof opts.filter === "function" || isArray(opts.filter)) {
    filter = opts.filter;
  }
  let arrayFormat;
  if (opts.arrayFormat && opts.arrayFormat in array_prefix_generators) {
    arrayFormat = opts.arrayFormat;
  } else if ("indices" in opts) {
    arrayFormat = opts.indices ? "indices" : "repeat";
  } else {
    arrayFormat = defaults.arrayFormat;
  }
  if ("commaRoundTrip" in opts && typeof opts.commaRoundTrip !== "boolean") {
    throw new TypeError("`commaRoundTrip` must be a boolean, or absent");
  }
  const allowDots = typeof opts.allowDots === "undefined" ? !!opts.encodeDotInKeys === true ? true : defaults.allowDots : !!opts.allowDots;
  return {
    addQueryPrefix: typeof opts.addQueryPrefix === "boolean" ? opts.addQueryPrefix : defaults.addQueryPrefix,
    // @ts-ignore
    allowDots,
    allowEmptyArrays: typeof opts.allowEmptyArrays === "boolean" ? !!opts.allowEmptyArrays : defaults.allowEmptyArrays,
    arrayFormat,
    charset,
    charsetSentinel: typeof opts.charsetSentinel === "boolean" ? opts.charsetSentinel : defaults.charsetSentinel,
    commaRoundTrip: !!opts.commaRoundTrip,
    delimiter: typeof opts.delimiter === "undefined" ? defaults.delimiter : opts.delimiter,
    encode: typeof opts.encode === "boolean" ? opts.encode : defaults.encode,
    encodeDotInKeys: typeof opts.encodeDotInKeys === "boolean" ? opts.encodeDotInKeys : defaults.encodeDotInKeys,
    encoder: typeof opts.encoder === "function" ? opts.encoder : defaults.encoder,
    encodeValuesOnly: typeof opts.encodeValuesOnly === "boolean" ? opts.encodeValuesOnly : defaults.encodeValuesOnly,
    filter,
    format: format2,
    formatter,
    serializeDate: typeof opts.serializeDate === "function" ? opts.serializeDate : defaults.serializeDate,
    skipNulls: typeof opts.skipNulls === "boolean" ? opts.skipNulls : defaults.skipNulls,
    // @ts-ignore
    sort: typeof opts.sort === "function" ? opts.sort : null,
    strictNullHandling: typeof opts.strictNullHandling === "boolean" ? opts.strictNullHandling : defaults.strictNullHandling
  };
}
function stringify(object, opts = {}) {
  let obj = object;
  const options = normalize_stringify_options(opts);
  let obj_keys;
  let filter;
  if (typeof options.filter === "function") {
    filter = options.filter;
    obj = filter("", obj);
  } else if (isArray(options.filter)) {
    filter = options.filter;
    obj_keys = filter;
  }
  const keys = [];
  if (typeof obj !== "object" || obj === null) {
    return "";
  }
  const generateArrayPrefix = array_prefix_generators[options.arrayFormat];
  const commaRoundTrip = generateArrayPrefix === "comma" && options.commaRoundTrip;
  if (!obj_keys) {
    obj_keys = Object.keys(obj);
  }
  if (options.sort) {
    obj_keys.sort(options.sort);
  }
  const sideChannel = /* @__PURE__ */ new WeakMap();
  for (let i = 0; i < obj_keys.length; ++i) {
    const key = obj_keys[i];
    if (options.skipNulls && obj[key] === null) {
      continue;
    }
    push_to_array(keys, inner_stringify(
      obj[key],
      key,
      // @ts-expect-error
      generateArrayPrefix,
      commaRoundTrip,
      options.allowEmptyArrays,
      options.strictNullHandling,
      options.skipNulls,
      options.encodeDotInKeys,
      options.encode ? options.encoder : null,
      options.filter,
      options.sort,
      options.allowDots,
      options.serializeDate,
      options.format,
      options.formatter,
      options.encodeValuesOnly,
      options.charset,
      sideChannel
    ));
  }
  const joined = keys.join(options.delimiter);
  let prefix = options.addQueryPrefix === true ? "?" : "";
  if (options.charsetSentinel) {
    if (options.charset === "iso-8859-1") {
      prefix += "utf8=%26%2310003%3B&";
    } else {
      prefix += "utf8=%E2%9C%93&";
    }
  }
  return joined.length > 0 ? prefix + joined : "";
}
var array_prefix_generators, push_to_array, toISOString, defaults, sentinel;
var init_stringify = __esm({
  "node_modules/openai/internal/qs/stringify.mjs"() {
    init_utils();
    init_formats();
    init_values();
    array_prefix_generators = {
      brackets(prefix) {
        return String(prefix) + "[]";
      },
      comma: "comma",
      indices(prefix, key) {
        return String(prefix) + "[" + key + "]";
      },
      repeat(prefix) {
        return String(prefix);
      }
    };
    push_to_array = function(arr, value_or_array) {
      Array.prototype.push.apply(arr, isArray(value_or_array) ? value_or_array : [value_or_array]);
    };
    defaults = {
      addQueryPrefix: false,
      allowDots: false,
      allowEmptyArrays: false,
      arrayFormat: "indices",
      charset: "utf-8",
      charsetSentinel: false,
      delimiter: "&",
      encode: true,
      encodeDotInKeys: false,
      encoder: encode,
      encodeValuesOnly: false,
      format: default_format,
      formatter: default_formatter,
      /** @deprecated */
      indices: false,
      serializeDate(date2) {
        return (toISOString ?? (toISOString = Function.prototype.call.bind(Date.prototype.toISOString)))(date2);
      },
      skipNulls: false,
      strictNullHandling: false
    };
    sentinel = {};
  }
});

// node_modules/openai/internal/qs/index.mjs
var init_qs = __esm({
  "node_modules/openai/internal/qs/index.mjs"() {
    init_formats();
    init_stringify();
  }
});

// node_modules/openai/internal/utils/bytes.mjs
function concatBytes(buffers) {
  let length = 0;
  for (const buffer of buffers) {
    length += buffer.length;
  }
  const output = new Uint8Array(length);
  let index = 0;
  for (const buffer of buffers) {
    output.set(buffer, index);
    index += buffer.length;
  }
  return output;
}
function encodeUTF8(str2) {
  let encoder;
  return (encodeUTF8_ ?? (encoder = new globalThis.TextEncoder(), encodeUTF8_ = encoder.encode.bind(encoder)))(str2);
}
function decodeUTF8(bytes) {
  let decoder;
  return (decodeUTF8_ ?? (decoder = new globalThis.TextDecoder(), decodeUTF8_ = decoder.decode.bind(decoder)))(bytes);
}
var encodeUTF8_, decodeUTF8_;
var init_bytes = __esm({
  "node_modules/openai/internal/utils/bytes.mjs"() {
  }
});

// node_modules/openai/internal/decoders/line.mjs
function findNewlineIndex(buffer, startIndex) {
  const newline = 10;
  const carriage = 13;
  for (let i = startIndex ?? 0; i < buffer.length; i++) {
    if (buffer[i] === newline) {
      return { preceding: i, index: i + 1, carriage: false };
    }
    if (buffer[i] === carriage) {
      return { preceding: i, index: i + 1, carriage: true };
    }
  }
  return null;
}
function findDoubleNewlineIndex(buffer) {
  const newline = 10;
  const carriage = 13;
  for (let i = 0; i < buffer.length - 1; i++) {
    if (buffer[i] === newline && buffer[i + 1] === newline) {
      return i + 2;
    }
    if (buffer[i] === carriage && buffer[i + 1] === carriage) {
      return i + 2;
    }
    if (buffer[i] === carriage && buffer[i + 1] === newline && i + 3 < buffer.length && buffer[i + 2] === carriage && buffer[i + 3] === newline) {
      return i + 4;
    }
  }
  return -1;
}
var _LineDecoder_buffer, _LineDecoder_carriageReturnIndex, LineDecoder;
var init_line = __esm({
  "node_modules/openai/internal/decoders/line.mjs"() {
    init_tslib();
    init_bytes();
    LineDecoder = class {
      constructor() {
        _LineDecoder_buffer.set(this, void 0);
        _LineDecoder_carriageReturnIndex.set(this, void 0);
        __classPrivateFieldSet(this, _LineDecoder_buffer, new Uint8Array(), "f");
        __classPrivateFieldSet(this, _LineDecoder_carriageReturnIndex, null, "f");
      }
      decode(chunk) {
        if (chunk == null) {
          return [];
        }
        const binaryChunk = chunk instanceof ArrayBuffer ? new Uint8Array(chunk) : typeof chunk === "string" ? encodeUTF8(chunk) : chunk;
        __classPrivateFieldSet(this, _LineDecoder_buffer, concatBytes([__classPrivateFieldGet(this, _LineDecoder_buffer, "f"), binaryChunk]), "f");
        const lines = [];
        let patternIndex;
        while ((patternIndex = findNewlineIndex(__classPrivateFieldGet(this, _LineDecoder_buffer, "f"), __classPrivateFieldGet(this, _LineDecoder_carriageReturnIndex, "f"))) != null) {
          if (patternIndex.carriage && __classPrivateFieldGet(this, _LineDecoder_carriageReturnIndex, "f") == null) {
            __classPrivateFieldSet(this, _LineDecoder_carriageReturnIndex, patternIndex.index, "f");
            continue;
          }
          if (__classPrivateFieldGet(this, _LineDecoder_carriageReturnIndex, "f") != null && (patternIndex.index !== __classPrivateFieldGet(this, _LineDecoder_carriageReturnIndex, "f") + 1 || patternIndex.carriage)) {
            lines.push(decodeUTF8(__classPrivateFieldGet(this, _LineDecoder_buffer, "f").subarray(0, __classPrivateFieldGet(this, _LineDecoder_carriageReturnIndex, "f") - 1)));
            __classPrivateFieldSet(this, _LineDecoder_buffer, __classPrivateFieldGet(this, _LineDecoder_buffer, "f").subarray(__classPrivateFieldGet(this, _LineDecoder_carriageReturnIndex, "f")), "f");
            __classPrivateFieldSet(this, _LineDecoder_carriageReturnIndex, null, "f");
            continue;
          }
          const endIndex = __classPrivateFieldGet(this, _LineDecoder_carriageReturnIndex, "f") !== null ? patternIndex.preceding - 1 : patternIndex.preceding;
          const line2 = decodeUTF8(__classPrivateFieldGet(this, _LineDecoder_buffer, "f").subarray(0, endIndex));
          lines.push(line2);
          __classPrivateFieldSet(this, _LineDecoder_buffer, __classPrivateFieldGet(this, _LineDecoder_buffer, "f").subarray(patternIndex.index), "f");
          __classPrivateFieldSet(this, _LineDecoder_carriageReturnIndex, null, "f");
        }
        return lines;
      }
      flush() {
        if (!__classPrivateFieldGet(this, _LineDecoder_buffer, "f").length) {
          return [];
        }
        return this.decode("\n");
      }
    };
    _LineDecoder_buffer = /* @__PURE__ */ new WeakMap(), _LineDecoder_carriageReturnIndex = /* @__PURE__ */ new WeakMap();
    LineDecoder.NEWLINE_CHARS = /* @__PURE__ */ new Set(["\n", "\r"]);
    LineDecoder.NEWLINE_REGEXP = /\r\n|[\n\r]/g;
  }
});

// node_modules/openai/internal/utils/log.mjs
function noop() {
}
function makeLogFn(fnLevel, logger, logLevel) {
  if (!logger || levelNumbers[fnLevel] > levelNumbers[logLevel]) {
    return noop;
  } else {
    return logger[fnLevel].bind(logger);
  }
}
function loggerFor(client) {
  const logger = client.logger;
  const logLevel = client.logLevel ?? "off";
  if (!logger) {
    return noopLogger;
  }
  const cachedLogger = cachedLoggers.get(logger);
  if (cachedLogger && cachedLogger[0] === logLevel) {
    return cachedLogger[1];
  }
  const levelLogger = {
    error: makeLogFn("error", logger, logLevel),
    warn: makeLogFn("warn", logger, logLevel),
    info: makeLogFn("info", logger, logLevel),
    debug: makeLogFn("debug", logger, logLevel)
  };
  cachedLoggers.set(logger, [logLevel, levelLogger]);
  return levelLogger;
}
var levelNumbers, parseLogLevel, noopLogger, cachedLoggers, formatRequestDetails;
var init_log = __esm({
  "node_modules/openai/internal/utils/log.mjs"() {
    init_values();
    levelNumbers = {
      off: 0,
      error: 200,
      warn: 300,
      info: 400,
      debug: 500
    };
    parseLogLevel = (maybeLevel, sourceName, client) => {
      if (!maybeLevel) {
        return void 0;
      }
      if (hasOwn(levelNumbers, maybeLevel)) {
        return maybeLevel;
      }
      loggerFor(client).warn(`${sourceName} was set to ${JSON.stringify(maybeLevel)}, expected one of ${JSON.stringify(Object.keys(levelNumbers))}`);
      return void 0;
    };
    noopLogger = {
      error: noop,
      warn: noop,
      info: noop,
      debug: noop
    };
    cachedLoggers = /* @__PURE__ */ new WeakMap();
    formatRequestDetails = (details) => {
      if (details.options) {
        details.options = { ...details.options };
        delete details.options["headers"];
      }
      if (details.headers) {
        details.headers = Object.fromEntries((details.headers instanceof Headers ? [...details.headers] : Object.entries(details.headers)).map(([name, value]) => [
          name,
          name.toLowerCase() === "authorization" || name.toLowerCase() === "cookie" || name.toLowerCase() === "set-cookie" ? "***" : value
        ]));
      }
      if ("retryOfRequestLogID" in details) {
        if (details.retryOfRequestLogID) {
          details.retryOf = details.retryOfRequestLogID;
        }
        delete details.retryOfRequestLogID;
      }
      return details;
    };
  }
});

// node_modules/openai/core/streaming.mjs
async function* _iterSSEMessages(response, controller) {
  if (!response.body) {
    controller.abort();
    if (typeof globalThis.navigator !== "undefined" && globalThis.navigator.product === "ReactNative") {
      throw new OpenAIError(`The default react-native fetch implementation does not support streaming. Please use expo/fetch: https://docs.expo.dev/versions/latest/sdk/expo/#expofetch-api`);
    }
    throw new OpenAIError(`Attempted to iterate over a response with no body`);
  }
  const sseDecoder = new SSEDecoder();
  const lineDecoder = new LineDecoder();
  const iter = ReadableStreamToAsyncIterable(response.body);
  for await (const sseChunk of iterSSEChunks(iter)) {
    for (const line2 of lineDecoder.decode(sseChunk)) {
      const sse = sseDecoder.decode(line2);
      if (sse)
        yield sse;
    }
  }
  for (const line2 of lineDecoder.flush()) {
    const sse = sseDecoder.decode(line2);
    if (sse)
      yield sse;
  }
}
async function* iterSSEChunks(iterator) {
  let data = new Uint8Array();
  for await (const chunk of iterator) {
    if (chunk == null) {
      continue;
    }
    const binaryChunk = chunk instanceof ArrayBuffer ? new Uint8Array(chunk) : typeof chunk === "string" ? encodeUTF8(chunk) : chunk;
    let newData = new Uint8Array(data.length + binaryChunk.length);
    newData.set(data);
    newData.set(binaryChunk, data.length);
    data = newData;
    let patternIndex;
    while ((patternIndex = findDoubleNewlineIndex(data)) !== -1) {
      yield data.slice(0, patternIndex);
      data = data.slice(patternIndex);
    }
  }
  if (data.length > 0) {
    yield data;
  }
}
function partition(str2, delimiter) {
  const index = str2.indexOf(delimiter);
  if (index !== -1) {
    return [str2.substring(0, index), delimiter, str2.substring(index + delimiter.length)];
  }
  return [str2, "", ""];
}
var _Stream_client, Stream, SSEDecoder;
var init_streaming = __esm({
  "node_modules/openai/core/streaming.mjs"() {
    init_tslib();
    init_error();
    init_shims();
    init_line();
    init_shims();
    init_errors();
    init_bytes();
    init_log();
    init_error();
    Stream = class _Stream {
      constructor(iterator, controller, client) {
        this.iterator = iterator;
        _Stream_client.set(this, void 0);
        this.controller = controller;
        __classPrivateFieldSet(this, _Stream_client, client, "f");
      }
      static fromSSEResponse(response, controller, client) {
        let consumed = false;
        const logger = client ? loggerFor(client) : console;
        async function* iterator() {
          if (consumed) {
            throw new OpenAIError("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
          }
          consumed = true;
          let done = false;
          try {
            for await (const sse of _iterSSEMessages(response, controller)) {
              if (done)
                continue;
              if (sse.data.startsWith("[DONE]")) {
                done = true;
                continue;
              }
              if (sse.event === null || !sse.event.startsWith("thread.")) {
                let data;
                try {
                  data = JSON.parse(sse.data);
                } catch (e) {
                  logger.error(`Could not parse message into JSON:`, sse.data);
                  logger.error(`From chunk:`, sse.raw);
                  throw e;
                }
                if (data && data.error) {
                  throw new APIError(void 0, data.error, void 0, response.headers);
                }
                yield data;
              } else {
                let data;
                try {
                  data = JSON.parse(sse.data);
                } catch (e) {
                  console.error(`Could not parse message into JSON:`, sse.data);
                  console.error(`From chunk:`, sse.raw);
                  throw e;
                }
                if (sse.event == "error") {
                  throw new APIError(void 0, data.error, data.message, void 0);
                }
                yield { event: sse.event, data };
              }
            }
            done = true;
          } catch (e) {
            if (isAbortError(e))
              return;
            throw e;
          } finally {
            if (!done)
              controller.abort();
          }
        }
        return new _Stream(iterator, controller, client);
      }
      /**
       * Generates a Stream from a newline-separated ReadableStream
       * where each item is a JSON value.
       */
      static fromReadableStream(readableStream, controller, client) {
        let consumed = false;
        async function* iterLines() {
          const lineDecoder = new LineDecoder();
          const iter = ReadableStreamToAsyncIterable(readableStream);
          for await (const chunk of iter) {
            for (const line2 of lineDecoder.decode(chunk)) {
              yield line2;
            }
          }
          for (const line2 of lineDecoder.flush()) {
            yield line2;
          }
        }
        async function* iterator() {
          if (consumed) {
            throw new OpenAIError("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
          }
          consumed = true;
          let done = false;
          try {
            for await (const line2 of iterLines()) {
              if (done)
                continue;
              if (line2)
                yield JSON.parse(line2);
            }
            done = true;
          } catch (e) {
            if (isAbortError(e))
              return;
            throw e;
          } finally {
            if (!done)
              controller.abort();
          }
        }
        return new _Stream(iterator, controller, client);
      }
      [(_Stream_client = /* @__PURE__ */ new WeakMap(), Symbol.asyncIterator)]() {
        return this.iterator();
      }
      /**
       * Splits the stream into two streams which can be
       * independently read from at different speeds.
       */
      tee() {
        const left = [];
        const right = [];
        const iterator = this.iterator();
        const teeIterator = (queue) => {
          return {
            next: () => {
              if (queue.length === 0) {
                const result = iterator.next();
                left.push(result);
                right.push(result);
              }
              return queue.shift();
            }
          };
        };
        return [
          new _Stream(() => teeIterator(left), this.controller, __classPrivateFieldGet(this, _Stream_client, "f")),
          new _Stream(() => teeIterator(right), this.controller, __classPrivateFieldGet(this, _Stream_client, "f"))
        ];
      }
      /**
       * Converts this stream to a newline-separated ReadableStream of
       * JSON stringified values in the stream
       * which can be turned back into a Stream with `Stream.fromReadableStream()`.
       */
      toReadableStream() {
        const self = this;
        let iter;
        return makeReadableStream({
          async start() {
            iter = self[Symbol.asyncIterator]();
          },
          async pull(ctrl) {
            try {
              const { value, done } = await iter.next();
              if (done)
                return ctrl.close();
              const bytes = encodeUTF8(JSON.stringify(value) + "\n");
              ctrl.enqueue(bytes);
            } catch (err) {
              ctrl.error(err);
            }
          },
          async cancel() {
            await iter.return?.();
          }
        });
      }
    };
    SSEDecoder = class {
      constructor() {
        this.event = null;
        this.data = [];
        this.chunks = [];
      }
      decode(line2) {
        if (line2.endsWith("\r")) {
          line2 = line2.substring(0, line2.length - 1);
        }
        if (!line2) {
          if (!this.event && !this.data.length)
            return null;
          const sse = {
            event: this.event,
            data: this.data.join("\n"),
            raw: this.chunks
          };
          this.event = null;
          this.data = [];
          this.chunks = [];
          return sse;
        }
        this.chunks.push(line2);
        if (line2.startsWith(":")) {
          return null;
        }
        let [fieldname, _, value] = partition(line2, ":");
        if (value.startsWith(" ")) {
          value = value.substring(1);
        }
        if (fieldname === "event") {
          this.event = value;
        } else if (fieldname === "data") {
          this.data.push(value);
        }
        return null;
      }
    };
  }
});

// node_modules/openai/internal/parse.mjs
async function defaultParseResponse(client, props) {
  const { response, requestLogID, retryOfRequestLogID, startTime } = props;
  const body = await (async () => {
    if (props.options.stream) {
      loggerFor(client).debug("response", response.status, response.url, response.headers, response.body);
      if (props.options.__streamClass) {
        return props.options.__streamClass.fromSSEResponse(response, props.controller, client);
      }
      return Stream.fromSSEResponse(response, props.controller, client);
    }
    if (response.status === 204) {
      return null;
    }
    if (props.options.__binaryResponse) {
      return response;
    }
    const contentType = response.headers.get("content-type");
    const mediaType = contentType?.split(";")[0]?.trim();
    const isJSON = mediaType?.includes("application/json") || mediaType?.endsWith("+json");
    if (isJSON) {
      const json2 = await response.json();
      return addRequestID(json2, response);
    }
    const text2 = await response.text();
    return text2;
  })();
  loggerFor(client).debug(`[${requestLogID}] response parsed`, formatRequestDetails({
    retryOfRequestLogID,
    url: response.url,
    status: response.status,
    body,
    durationMs: Date.now() - startTime
  }));
  return body;
}
function addRequestID(value, response) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return value;
  }
  return Object.defineProperty(value, "_request_id", {
    value: response.headers.get("x-request-id"),
    enumerable: false
  });
}
var init_parse = __esm({
  "node_modules/openai/internal/parse.mjs"() {
    init_streaming();
    init_log();
  }
});

// node_modules/openai/core/api-promise.mjs
var _APIPromise_client, APIPromise;
var init_api_promise = __esm({
  "node_modules/openai/core/api-promise.mjs"() {
    init_tslib();
    init_parse();
    APIPromise = class _APIPromise extends Promise {
      constructor(client, responsePromise, parseResponse2 = defaultParseResponse) {
        super((resolve) => {
          resolve(null);
        });
        this.responsePromise = responsePromise;
        this.parseResponse = parseResponse2;
        _APIPromise_client.set(this, void 0);
        __classPrivateFieldSet(this, _APIPromise_client, client, "f");
      }
      _thenUnwrap(transform) {
        return new _APIPromise(__classPrivateFieldGet(this, _APIPromise_client, "f"), this.responsePromise, async (client, props) => addRequestID(transform(await this.parseResponse(client, props), props), props.response));
      }
      /**
       * Gets the raw `Response` instance instead of parsing the response
       * data.
       *
       * If you want to parse the response body but still get the `Response`
       * instance, you can use {@link withResponse()}.
       *
       * 👋 Getting the wrong TypeScript type for `Response`?
       * Try setting `"moduleResolution": "NodeNext"` or add `"lib": ["DOM"]`
       * to your `tsconfig.json`.
       */
      asResponse() {
        return this.responsePromise.then((p) => p.response);
      }
      /**
       * Gets the parsed response data, the raw `Response` instance and the ID of the request,
       * returned via the X-Request-ID header which is useful for debugging requests and reporting
       * issues to OpenAI.
       *
       * If you just want to get the raw `Response` instance without parsing it,
       * you can use {@link asResponse()}.
       *
       * 👋 Getting the wrong TypeScript type for `Response`?
       * Try setting `"moduleResolution": "NodeNext"` or add `"lib": ["DOM"]`
       * to your `tsconfig.json`.
       */
      async withResponse() {
        const [data, response] = await Promise.all([this.parse(), this.asResponse()]);
        return { data, response, request_id: response.headers.get("x-request-id") };
      }
      parse() {
        if (!this.parsedPromise) {
          this.parsedPromise = this.responsePromise.then((data) => this.parseResponse(__classPrivateFieldGet(this, _APIPromise_client, "f"), data));
        }
        return this.parsedPromise;
      }
      then(onfulfilled, onrejected) {
        return this.parse().then(onfulfilled, onrejected);
      }
      catch(onrejected) {
        return this.parse().catch(onrejected);
      }
      finally(onfinally) {
        return this.parse().finally(onfinally);
      }
    };
    _APIPromise_client = /* @__PURE__ */ new WeakMap();
  }
});

// node_modules/openai/core/pagination.mjs
var _AbstractPage_client, AbstractPage, PagePromise, Page, CursorPage, ConversationCursorPage;
var init_pagination = __esm({
  "node_modules/openai/core/pagination.mjs"() {
    init_tslib();
    init_error();
    init_parse();
    init_api_promise();
    init_values();
    AbstractPage = class {
      constructor(client, response, body, options) {
        _AbstractPage_client.set(this, void 0);
        __classPrivateFieldSet(this, _AbstractPage_client, client, "f");
        this.options = options;
        this.response = response;
        this.body = body;
      }
      hasNextPage() {
        const items = this.getPaginatedItems();
        if (!items.length)
          return false;
        return this.nextPageRequestOptions() != null;
      }
      async getNextPage() {
        const nextOptions = this.nextPageRequestOptions();
        if (!nextOptions) {
          throw new OpenAIError("No next page expected; please check `.hasNextPage()` before calling `.getNextPage()`.");
        }
        return await __classPrivateFieldGet(this, _AbstractPage_client, "f").requestAPIList(this.constructor, nextOptions);
      }
      async *iterPages() {
        let page = this;
        yield page;
        while (page.hasNextPage()) {
          page = await page.getNextPage();
          yield page;
        }
      }
      async *[(_AbstractPage_client = /* @__PURE__ */ new WeakMap(), Symbol.asyncIterator)]() {
        for await (const page of this.iterPages()) {
          for (const item of page.getPaginatedItems()) {
            yield item;
          }
        }
      }
    };
    PagePromise = class extends APIPromise {
      constructor(client, request, Page2) {
        super(client, request, async (client2, props) => new Page2(client2, props.response, await defaultParseResponse(client2, props), props.options));
      }
      /**
       * Allow auto-paginating iteration on an unawaited list call, eg:
       *
       *    for await (const item of client.items.list()) {
       *      console.log(item)
       *    }
       */
      async *[Symbol.asyncIterator]() {
        const page = await this;
        for await (const item of page) {
          yield item;
        }
      }
    };
    Page = class extends AbstractPage {
      constructor(client, response, body, options) {
        super(client, response, body, options);
        this.data = body.data || [];
        this.object = body.object;
      }
      getPaginatedItems() {
        return this.data ?? [];
      }
      nextPageRequestOptions() {
        return null;
      }
    };
    CursorPage = class extends AbstractPage {
      constructor(client, response, body, options) {
        super(client, response, body, options);
        this.data = body.data || [];
        this.has_more = body.has_more || false;
      }
      getPaginatedItems() {
        return this.data ?? [];
      }
      hasNextPage() {
        if (this.has_more === false) {
          return false;
        }
        return super.hasNextPage();
      }
      nextPageRequestOptions() {
        const data = this.getPaginatedItems();
        const id = data[data.length - 1]?.id;
        if (!id) {
          return null;
        }
        return {
          ...this.options,
          query: {
            ...maybeObj(this.options.query),
            after: id
          }
        };
      }
    };
    ConversationCursorPage = class extends AbstractPage {
      constructor(client, response, body, options) {
        super(client, response, body, options);
        this.data = body.data || [];
        this.has_more = body.has_more || false;
        this.last_id = body.last_id || "";
      }
      getPaginatedItems() {
        return this.data ?? [];
      }
      hasNextPage() {
        if (this.has_more === false) {
          return false;
        }
        return super.hasNextPage();
      }
      nextPageRequestOptions() {
        const cursor = this.last_id;
        if (!cursor) {
          return null;
        }
        return {
          ...this.options,
          query: {
            ...maybeObj(this.options.query),
            after: cursor
          }
        };
      }
    };
  }
});

// node_modules/openai/internal/uploads.mjs
function makeFile(fileBits, fileName, options) {
  checkFileSupport();
  return new File(fileBits, fileName ?? "unknown_file", options);
}
function getName(value) {
  return (typeof value === "object" && value !== null && ("name" in value && value.name && String(value.name) || "url" in value && value.url && String(value.url) || "filename" in value && value.filename && String(value.filename) || "path" in value && value.path && String(value.path)) || "").split(/[\\/]/).pop() || void 0;
}
function supportsFormData(fetchObject) {
  const fetch2 = typeof fetchObject === "function" ? fetchObject : fetchObject.fetch;
  const cached = supportsFormDataMap.get(fetch2);
  if (cached)
    return cached;
  const promise = (async () => {
    try {
      const FetchResponse = "Response" in fetch2 ? fetch2.Response : (await fetch2("data:,")).constructor;
      const data = new FormData();
      if (data.toString() === await new FetchResponse(data).text()) {
        return false;
      }
      return true;
    } catch {
      return true;
    }
  })();
  supportsFormDataMap.set(fetch2, promise);
  return promise;
}
var checkFileSupport, isAsyncIterable, maybeMultipartFormRequestOptions, multipartFormRequestOptions, supportsFormDataMap, createForm, isNamedBlob, isUploadable, hasUploadableValue, addFormValue;
var init_uploads = __esm({
  "node_modules/openai/internal/uploads.mjs"() {
    init_shims();
    checkFileSupport = () => {
      if (typeof File === "undefined") {
        const { process: process2 } = globalThis;
        const isOldNode = typeof process2?.versions?.node === "string" && parseInt(process2.versions.node.split(".")) < 20;
        throw new Error("`File` is not defined as a global, which is required for file uploads." + (isOldNode ? " Update to Node 20 LTS or newer, or set `globalThis.File` to `import('node:buffer').File`." : ""));
      }
    };
    isAsyncIterable = (value) => value != null && typeof value === "object" && typeof value[Symbol.asyncIterator] === "function";
    maybeMultipartFormRequestOptions = async (opts, fetch2) => {
      if (!hasUploadableValue(opts.body))
        return opts;
      return { ...opts, body: await createForm(opts.body, fetch2) };
    };
    multipartFormRequestOptions = async (opts, fetch2) => {
      return { ...opts, body: await createForm(opts.body, fetch2) };
    };
    supportsFormDataMap = /* @__PURE__ */ new WeakMap();
    createForm = async (body, fetch2) => {
      if (!await supportsFormData(fetch2)) {
        throw new TypeError("The provided fetch function does not support file uploads with the current global FormData class.");
      }
      const form = new FormData();
      await Promise.all(Object.entries(body || {}).map(([key, value]) => addFormValue(form, key, value)));
      return form;
    };
    isNamedBlob = (value) => value instanceof Blob && "name" in value;
    isUploadable = (value) => typeof value === "object" && value !== null && (value instanceof Response || isAsyncIterable(value) || isNamedBlob(value));
    hasUploadableValue = (value) => {
      if (isUploadable(value))
        return true;
      if (Array.isArray(value))
        return value.some(hasUploadableValue);
      if (value && typeof value === "object") {
        for (const k in value) {
          if (hasUploadableValue(value[k]))
            return true;
        }
      }
      return false;
    };
    addFormValue = async (form, key, value) => {
      if (value === void 0)
        return;
      if (value == null) {
        throw new TypeError(`Received null for "${key}"; to pass null in FormData, you must use the string 'null'`);
      }
      if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
        form.append(key, String(value));
      } else if (value instanceof Response) {
        form.append(key, makeFile([await value.blob()], getName(value)));
      } else if (isAsyncIterable(value)) {
        form.append(key, makeFile([await new Response(ReadableStreamFrom(value)).blob()], getName(value)));
      } else if (isNamedBlob(value)) {
        form.append(key, value, getName(value));
      } else if (Array.isArray(value)) {
        await Promise.all(value.map((entry) => addFormValue(form, key + "[]", entry)));
      } else if (typeof value === "object") {
        await Promise.all(Object.entries(value).map(([name, prop]) => addFormValue(form, `${key}[${name}]`, prop)));
      } else {
        throw new TypeError(`Invalid value given to form, expected a string, number, boolean, object, Array, File or Blob but got ${value} instead`);
      }
    };
  }
});

// node_modules/openai/internal/to-file.mjs
async function toFile(value, name, options) {
  checkFileSupport();
  value = await value;
  if (isFileLike(value)) {
    if (value instanceof File) {
      return value;
    }
    return makeFile([await value.arrayBuffer()], value.name);
  }
  if (isResponseLike(value)) {
    const blob = await value.blob();
    name || (name = new URL(value.url).pathname.split(/[\\/]/).pop());
    return makeFile(await getBytes(blob), name, options);
  }
  const parts = await getBytes(value);
  name || (name = getName(value));
  if (!options?.type) {
    const type = parts.find((part) => typeof part === "object" && "type" in part && part.type);
    if (typeof type === "string") {
      options = { ...options, type };
    }
  }
  return makeFile(parts, name, options);
}
async function getBytes(value) {
  let parts = [];
  if (typeof value === "string" || ArrayBuffer.isView(value) || // includes Uint8Array, Buffer, etc.
  value instanceof ArrayBuffer) {
    parts.push(value);
  } else if (isBlobLike(value)) {
    parts.push(value instanceof Blob ? value : await value.arrayBuffer());
  } else if (isAsyncIterable(value)) {
    for await (const chunk of value) {
      parts.push(...await getBytes(chunk));
    }
  } else {
    const constructor = value?.constructor?.name;
    throw new Error(`Unexpected data type: ${typeof value}${constructor ? `; constructor: ${constructor}` : ""}${propsForError(value)}`);
  }
  return parts;
}
function propsForError(value) {
  if (typeof value !== "object" || value === null)
    return "";
  const props = Object.getOwnPropertyNames(value);
  return `; props: [${props.map((p) => `"${p}"`).join(", ")}]`;
}
var isBlobLike, isFileLike, isResponseLike;
var init_to_file = __esm({
  "node_modules/openai/internal/to-file.mjs"() {
    init_uploads();
    init_uploads();
    isBlobLike = (value) => value != null && typeof value === "object" && typeof value.size === "number" && typeof value.type === "string" && typeof value.text === "function" && typeof value.slice === "function" && typeof value.arrayBuffer === "function";
    isFileLike = (value) => value != null && typeof value === "object" && typeof value.name === "string" && typeof value.lastModified === "number" && isBlobLike(value);
    isResponseLike = (value) => value != null && typeof value === "object" && typeof value.url === "string" && typeof value.blob === "function";
  }
});

// node_modules/openai/core/uploads.mjs
var init_uploads2 = __esm({
  "node_modules/openai/core/uploads.mjs"() {
    init_to_file();
  }
});

// node_modules/openai/core/resource.mjs
var APIResource;
var init_resource = __esm({
  "node_modules/openai/core/resource.mjs"() {
    APIResource = class {
      constructor(client) {
        this._client = client;
      }
    };
  }
});

// node_modules/openai/internal/utils/path.mjs
function encodeURIPath(str2) {
  return str2.replace(/[^A-Za-z0-9\-._~!$&'()*+,;=:@]+/g, encodeURIComponent);
}
var EMPTY, createPathTagFunction, path;
var init_path = __esm({
  "node_modules/openai/internal/utils/path.mjs"() {
    init_error();
    EMPTY = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.create(null));
    createPathTagFunction = (pathEncoder = encodeURIPath) => function path2(statics, ...params) {
      if (statics.length === 1)
        return statics[0];
      let postPath = false;
      const invalidSegments = [];
      const path3 = statics.reduce((previousValue, currentValue, index) => {
        if (/[?#]/.test(currentValue)) {
          postPath = true;
        }
        const value = params[index];
        let encoded = (postPath ? encodeURIComponent : pathEncoder)("" + value);
        if (index !== params.length && (value == null || typeof value === "object" && // handle values from other realms
        value.toString === Object.getPrototypeOf(Object.getPrototypeOf(value.hasOwnProperty ?? EMPTY) ?? EMPTY)?.toString)) {
          encoded = value + "";
          invalidSegments.push({
            start: previousValue.length + currentValue.length,
            length: encoded.length,
            error: `Value of type ${Object.prototype.toString.call(value).slice(8, -1)} is not a valid path parameter`
          });
        }
        return previousValue + currentValue + (index === params.length ? "" : encoded);
      }, "");
      const pathOnly = path3.split(/[?#]/, 1)[0];
      const invalidSegmentPattern = /(?<=^|\/)(?:\.|%2e){1,2}(?=\/|$)/gi;
      let match3;
      while ((match3 = invalidSegmentPattern.exec(pathOnly)) !== null) {
        invalidSegments.push({
          start: match3.index,
          length: match3[0].length,
          error: `Value "${match3[0]}" can't be safely passed as a path parameter`
        });
      }
      invalidSegments.sort((a, b) => a.start - b.start);
      if (invalidSegments.length > 0) {
        let lastEnd = 0;
        const underline = invalidSegments.reduce((acc, segment) => {
          const spaces = " ".repeat(segment.start - lastEnd);
          const arrows = "^".repeat(segment.length);
          lastEnd = segment.start + segment.length;
          return acc + spaces + arrows;
        }, "");
        throw new OpenAIError(`Path parameters result in path with invalid segments:
${invalidSegments.map((e) => e.error).join("\n")}
${path3}
${underline}`);
      }
      return path3;
    };
    path = /* @__PURE__ */ createPathTagFunction(encodeURIPath);
  }
});

// node_modules/openai/resources/chat/completions/messages.mjs
var Messages;
var init_messages = __esm({
  "node_modules/openai/resources/chat/completions/messages.mjs"() {
    init_resource();
    init_pagination();
    init_path();
    Messages = class extends APIResource {
      /**
       * Get the messages in a stored chat completion. Only Chat Completions that have
       * been created with the `store` parameter set to `true` will be returned.
       *
       * @example
       * ```ts
       * // Automatically fetches more pages as needed.
       * for await (const chatCompletionStoreMessage of client.chat.completions.messages.list(
       *   'completion_id',
       * )) {
       *   // ...
       * }
       * ```
       */
      list(completionID, query = {}, options) {
        return this._client.getAPIList(path`/chat/completions/${completionID}/messages`, CursorPage, { query, ...options });
      }
    };
  }
});

// node_modules/openai/error.mjs
var init_error2 = __esm({
  "node_modules/openai/error.mjs"() {
    init_error();
  }
});

// node_modules/openai/lib/parser.mjs
function isChatCompletionFunctionTool(tool) {
  return tool !== void 0 && "function" in tool && tool.function !== void 0;
}
function isAutoParsableResponseFormat(response_format) {
  return response_format?.["$brand"] === "auto-parseable-response-format";
}
function isAutoParsableTool(tool) {
  return tool?.["$brand"] === "auto-parseable-tool";
}
function maybeParseChatCompletion(completion, params) {
  if (!params || !hasAutoParseableInput(params)) {
    return {
      ...completion,
      choices: completion.choices.map((choice) => {
        assertToolCallsAreChatCompletionFunctionToolCalls(choice.message.tool_calls);
        return {
          ...choice,
          message: {
            ...choice.message,
            parsed: null,
            ...choice.message.tool_calls ? {
              tool_calls: choice.message.tool_calls
            } : void 0
          }
        };
      })
    };
  }
  return parseChatCompletion(completion, params);
}
function parseChatCompletion(completion, params) {
  const choices = completion.choices.map((choice) => {
    if (choice.finish_reason === "length") {
      throw new LengthFinishReasonError();
    }
    if (choice.finish_reason === "content_filter") {
      throw new ContentFilterFinishReasonError();
    }
    assertToolCallsAreChatCompletionFunctionToolCalls(choice.message.tool_calls);
    return {
      ...choice,
      message: {
        ...choice.message,
        ...choice.message.tool_calls ? {
          tool_calls: choice.message.tool_calls?.map((toolCall) => parseToolCall(params, toolCall)) ?? void 0
        } : void 0,
        parsed: choice.message.content && !choice.message.refusal ? parseResponseFormat(params, choice.message.content) : null
      }
    };
  });
  return { ...completion, choices };
}
function parseResponseFormat(params, content) {
  if (params.response_format?.type !== "json_schema") {
    return null;
  }
  if (params.response_format?.type === "json_schema") {
    if ("$parseRaw" in params.response_format) {
      const response_format = params.response_format;
      return response_format.$parseRaw(content);
    }
    return JSON.parse(content);
  }
  return null;
}
function parseToolCall(params, toolCall) {
  const inputTool = params.tools?.find((inputTool2) => isChatCompletionFunctionTool(inputTool2) && inputTool2.function?.name === toolCall.function.name);
  return {
    ...toolCall,
    function: {
      ...toolCall.function,
      parsed_arguments: isAutoParsableTool(inputTool) ? inputTool.$parseRaw(toolCall.function.arguments) : inputTool?.function.strict ? JSON.parse(toolCall.function.arguments) : null
    }
  };
}
function shouldParseToolCall(params, toolCall) {
  if (!params || !("tools" in params) || !params.tools) {
    return false;
  }
  const inputTool = params.tools?.find((inputTool2) => isChatCompletionFunctionTool(inputTool2) && inputTool2.function?.name === toolCall.function.name);
  return isChatCompletionFunctionTool(inputTool) && (isAutoParsableTool(inputTool) || inputTool?.function.strict || false);
}
function hasAutoParseableInput(params) {
  if (isAutoParsableResponseFormat(params.response_format)) {
    return true;
  }
  return params.tools?.some((t) => isAutoParsableTool(t) || t.type === "function" && t.function.strict === true) ?? false;
}
function assertToolCallsAreChatCompletionFunctionToolCalls(toolCalls) {
  for (const toolCall of toolCalls || []) {
    if (toolCall.type !== "function") {
      throw new OpenAIError(`Currently only \`function\` tool calls are supported; Received \`${toolCall.type}\``);
    }
  }
}
function validateInputTools(tools) {
  for (const tool of tools ?? []) {
    if (tool.type !== "function") {
      throw new OpenAIError(`Currently only \`function\` tool types support auto-parsing; Received \`${tool.type}\``);
    }
    if (tool.function.strict !== true) {
      throw new OpenAIError(`The \`${tool.function.name}\` tool is not marked with \`strict: true\`. Only strict function tools can be auto-parsed`);
    }
  }
}
var init_parser = __esm({
  "node_modules/openai/lib/parser.mjs"() {
    init_error2();
  }
});

// node_modules/openai/lib/chatCompletionUtils.mjs
var isAssistantMessage, isToolMessage;
var init_chatCompletionUtils = __esm({
  "node_modules/openai/lib/chatCompletionUtils.mjs"() {
    isAssistantMessage = (message2) => {
      return message2?.role === "assistant";
    };
    isToolMessage = (message2) => {
      return message2?.role === "tool";
    };
  }
});

// node_modules/openai/lib/EventStream.mjs
var _EventStream_instances, _EventStream_connectedPromise, _EventStream_resolveConnectedPromise, _EventStream_rejectConnectedPromise, _EventStream_endPromise, _EventStream_resolveEndPromise, _EventStream_rejectEndPromise, _EventStream_listeners, _EventStream_ended, _EventStream_errored, _EventStream_aborted, _EventStream_catchingPromiseCreated, _EventStream_handleError, EventStream;
var init_EventStream = __esm({
  "node_modules/openai/lib/EventStream.mjs"() {
    init_tslib();
    init_error2();
    EventStream = class {
      constructor() {
        _EventStream_instances.add(this);
        this.controller = new AbortController();
        _EventStream_connectedPromise.set(this, void 0);
        _EventStream_resolveConnectedPromise.set(this, () => {
        });
        _EventStream_rejectConnectedPromise.set(this, () => {
        });
        _EventStream_endPromise.set(this, void 0);
        _EventStream_resolveEndPromise.set(this, () => {
        });
        _EventStream_rejectEndPromise.set(this, () => {
        });
        _EventStream_listeners.set(this, {});
        _EventStream_ended.set(this, false);
        _EventStream_errored.set(this, false);
        _EventStream_aborted.set(this, false);
        _EventStream_catchingPromiseCreated.set(this, false);
        __classPrivateFieldSet(this, _EventStream_connectedPromise, new Promise((resolve, reject) => {
          __classPrivateFieldSet(this, _EventStream_resolveConnectedPromise, resolve, "f");
          __classPrivateFieldSet(this, _EventStream_rejectConnectedPromise, reject, "f");
        }), "f");
        __classPrivateFieldSet(this, _EventStream_endPromise, new Promise((resolve, reject) => {
          __classPrivateFieldSet(this, _EventStream_resolveEndPromise, resolve, "f");
          __classPrivateFieldSet(this, _EventStream_rejectEndPromise, reject, "f");
        }), "f");
        __classPrivateFieldGet(this, _EventStream_connectedPromise, "f").catch(() => {
        });
        __classPrivateFieldGet(this, _EventStream_endPromise, "f").catch(() => {
        });
      }
      _run(executor) {
        setTimeout(() => {
          executor().then(() => {
            this._emitFinal();
            this._emit("end");
          }, __classPrivateFieldGet(this, _EventStream_instances, "m", _EventStream_handleError).bind(this));
        }, 0);
      }
      _connected() {
        if (this.ended)
          return;
        __classPrivateFieldGet(this, _EventStream_resolveConnectedPromise, "f").call(this);
        this._emit("connect");
      }
      get ended() {
        return __classPrivateFieldGet(this, _EventStream_ended, "f");
      }
      get errored() {
        return __classPrivateFieldGet(this, _EventStream_errored, "f");
      }
      get aborted() {
        return __classPrivateFieldGet(this, _EventStream_aborted, "f");
      }
      abort() {
        this.controller.abort();
      }
      /**
       * Adds the listener function to the end of the listeners array for the event.
       * No checks are made to see if the listener has already been added. Multiple calls passing
       * the same combination of event and listener will result in the listener being added, and
       * called, multiple times.
       * @returns this ChatCompletionStream, so that calls can be chained
       */
      on(event, listener) {
        const listeners = __classPrivateFieldGet(this, _EventStream_listeners, "f")[event] || (__classPrivateFieldGet(this, _EventStream_listeners, "f")[event] = []);
        listeners.push({ listener });
        return this;
      }
      /**
       * Removes the specified listener from the listener array for the event.
       * off() will remove, at most, one instance of a listener from the listener array. If any single
       * listener has been added multiple times to the listener array for the specified event, then
       * off() must be called multiple times to remove each instance.
       * @returns this ChatCompletionStream, so that calls can be chained
       */
      off(event, listener) {
        const listeners = __classPrivateFieldGet(this, _EventStream_listeners, "f")[event];
        if (!listeners)
          return this;
        const index = listeners.findIndex((l) => l.listener === listener);
        if (index >= 0)
          listeners.splice(index, 1);
        return this;
      }
      /**
       * Adds a one-time listener function for the event. The next time the event is triggered,
       * this listener is removed and then invoked.
       * @returns this ChatCompletionStream, so that calls can be chained
       */
      once(event, listener) {
        const listeners = __classPrivateFieldGet(this, _EventStream_listeners, "f")[event] || (__classPrivateFieldGet(this, _EventStream_listeners, "f")[event] = []);
        listeners.push({ listener, once: true });
        return this;
      }
      /**
       * This is similar to `.once()`, but returns a Promise that resolves the next time
       * the event is triggered, instead of calling a listener callback.
       * @returns a Promise that resolves the next time given event is triggered,
       * or rejects if an error is emitted.  (If you request the 'error' event,
       * returns a promise that resolves with the error).
       *
       * Example:
       *
       *   const message = await stream.emitted('message') // rejects if the stream errors
       */
      emitted(event) {
        return new Promise((resolve, reject) => {
          __classPrivateFieldSet(this, _EventStream_catchingPromiseCreated, true, "f");
          if (event !== "error")
            this.once("error", reject);
          this.once(event, resolve);
        });
      }
      async done() {
        __classPrivateFieldSet(this, _EventStream_catchingPromiseCreated, true, "f");
        await __classPrivateFieldGet(this, _EventStream_endPromise, "f");
      }
      _emit(event, ...args) {
        if (__classPrivateFieldGet(this, _EventStream_ended, "f")) {
          return;
        }
        if (event === "end") {
          __classPrivateFieldSet(this, _EventStream_ended, true, "f");
          __classPrivateFieldGet(this, _EventStream_resolveEndPromise, "f").call(this);
        }
        const listeners = __classPrivateFieldGet(this, _EventStream_listeners, "f")[event];
        if (listeners) {
          __classPrivateFieldGet(this, _EventStream_listeners, "f")[event] = listeners.filter((l) => !l.once);
          listeners.forEach(({ listener }) => listener(...args));
        }
        if (event === "abort") {
          const error = args[0];
          if (!__classPrivateFieldGet(this, _EventStream_catchingPromiseCreated, "f") && !listeners?.length) {
            Promise.reject(error);
          }
          __classPrivateFieldGet(this, _EventStream_rejectConnectedPromise, "f").call(this, error);
          __classPrivateFieldGet(this, _EventStream_rejectEndPromise, "f").call(this, error);
          this._emit("end");
          return;
        }
        if (event === "error") {
          const error = args[0];
          if (!__classPrivateFieldGet(this, _EventStream_catchingPromiseCreated, "f") && !listeners?.length) {
            Promise.reject(error);
          }
          __classPrivateFieldGet(this, _EventStream_rejectConnectedPromise, "f").call(this, error);
          __classPrivateFieldGet(this, _EventStream_rejectEndPromise, "f").call(this, error);
          this._emit("end");
        }
      }
      _emitFinal() {
      }
    };
    _EventStream_connectedPromise = /* @__PURE__ */ new WeakMap(), _EventStream_resolveConnectedPromise = /* @__PURE__ */ new WeakMap(), _EventStream_rejectConnectedPromise = /* @__PURE__ */ new WeakMap(), _EventStream_endPromise = /* @__PURE__ */ new WeakMap(), _EventStream_resolveEndPromise = /* @__PURE__ */ new WeakMap(), _EventStream_rejectEndPromise = /* @__PURE__ */ new WeakMap(), _EventStream_listeners = /* @__PURE__ */ new WeakMap(), _EventStream_ended = /* @__PURE__ */ new WeakMap(), _EventStream_errored = /* @__PURE__ */ new WeakMap(), _EventStream_aborted = /* @__PURE__ */ new WeakMap(), _EventStream_catchingPromiseCreated = /* @__PURE__ */ new WeakMap(), _EventStream_instances = /* @__PURE__ */ new WeakSet(), _EventStream_handleError = function _EventStream_handleError2(error) {
      __classPrivateFieldSet(this, _EventStream_errored, true, "f");
      if (error instanceof Error && error.name === "AbortError") {
        error = new APIUserAbortError();
      }
      if (error instanceof APIUserAbortError) {
        __classPrivateFieldSet(this, _EventStream_aborted, true, "f");
        return this._emit("abort", error);
      }
      if (error instanceof OpenAIError) {
        return this._emit("error", error);
      }
      if (error instanceof Error) {
        const openAIError = new OpenAIError(error.message);
        openAIError.cause = error;
        return this._emit("error", openAIError);
      }
      return this._emit("error", new OpenAIError(String(error)));
    };
  }
});

// node_modules/openai/lib/RunnableFunction.mjs
function isRunnableFunctionWithParse(fn) {
  return typeof fn.parse === "function";
}
var init_RunnableFunction = __esm({
  "node_modules/openai/lib/RunnableFunction.mjs"() {
  }
});

// node_modules/openai/lib/AbstractChatCompletionRunner.mjs
var _AbstractChatCompletionRunner_instances, _AbstractChatCompletionRunner_getFinalContent, _AbstractChatCompletionRunner_getFinalMessage, _AbstractChatCompletionRunner_getFinalFunctionToolCall, _AbstractChatCompletionRunner_getFinalFunctionToolCallResult, _AbstractChatCompletionRunner_calculateTotalUsage, _AbstractChatCompletionRunner_validateParams, _AbstractChatCompletionRunner_stringifyFunctionCallResult, DEFAULT_MAX_CHAT_COMPLETIONS, AbstractChatCompletionRunner;
var init_AbstractChatCompletionRunner = __esm({
  "node_modules/openai/lib/AbstractChatCompletionRunner.mjs"() {
    init_tslib();
    init_error2();
    init_parser();
    init_chatCompletionUtils();
    init_EventStream();
    init_RunnableFunction();
    DEFAULT_MAX_CHAT_COMPLETIONS = 10;
    AbstractChatCompletionRunner = class extends EventStream {
      constructor() {
        super(...arguments);
        _AbstractChatCompletionRunner_instances.add(this);
        this._chatCompletions = [];
        this.messages = [];
      }
      _addChatCompletion(chatCompletion) {
        this._chatCompletions.push(chatCompletion);
        this._emit("chatCompletion", chatCompletion);
        const message2 = chatCompletion.choices[0]?.message;
        if (message2)
          this._addMessage(message2);
        return chatCompletion;
      }
      _addMessage(message2, emit = true) {
        if (!("content" in message2))
          message2.content = null;
        this.messages.push(message2);
        if (emit) {
          this._emit("message", message2);
          if (isToolMessage(message2) && message2.content) {
            this._emit("functionToolCallResult", message2.content);
          } else if (isAssistantMessage(message2) && message2.tool_calls) {
            for (const tool_call of message2.tool_calls) {
              if (tool_call.type === "function") {
                this._emit("functionToolCall", tool_call.function);
              }
            }
          }
        }
      }
      /**
       * @returns a promise that resolves with the final ChatCompletion, or rejects
       * if an error occurred or the stream ended prematurely without producing a ChatCompletion.
       */
      async finalChatCompletion() {
        await this.done();
        const completion = this._chatCompletions[this._chatCompletions.length - 1];
        if (!completion)
          throw new OpenAIError("stream ended without producing a ChatCompletion");
        return completion;
      }
      /**
       * @returns a promise that resolves with the content of the final ChatCompletionMessage, or rejects
       * if an error occurred or the stream ended prematurely without producing a ChatCompletionMessage.
       */
      async finalContent() {
        await this.done();
        return __classPrivateFieldGet(this, _AbstractChatCompletionRunner_instances, "m", _AbstractChatCompletionRunner_getFinalContent).call(this);
      }
      /**
       * @returns a promise that resolves with the the final assistant ChatCompletionMessage response,
       * or rejects if an error occurred or the stream ended prematurely without producing a ChatCompletionMessage.
       */
      async finalMessage() {
        await this.done();
        return __classPrivateFieldGet(this, _AbstractChatCompletionRunner_instances, "m", _AbstractChatCompletionRunner_getFinalMessage).call(this);
      }
      /**
       * @returns a promise that resolves with the content of the final FunctionCall, or rejects
       * if an error occurred or the stream ended prematurely without producing a ChatCompletionMessage.
       */
      async finalFunctionToolCall() {
        await this.done();
        return __classPrivateFieldGet(this, _AbstractChatCompletionRunner_instances, "m", _AbstractChatCompletionRunner_getFinalFunctionToolCall).call(this);
      }
      async finalFunctionToolCallResult() {
        await this.done();
        return __classPrivateFieldGet(this, _AbstractChatCompletionRunner_instances, "m", _AbstractChatCompletionRunner_getFinalFunctionToolCallResult).call(this);
      }
      async totalUsage() {
        await this.done();
        return __classPrivateFieldGet(this, _AbstractChatCompletionRunner_instances, "m", _AbstractChatCompletionRunner_calculateTotalUsage).call(this);
      }
      allChatCompletions() {
        return [...this._chatCompletions];
      }
      _emitFinal() {
        const completion = this._chatCompletions[this._chatCompletions.length - 1];
        if (completion)
          this._emit("finalChatCompletion", completion);
        const finalMessage = __classPrivateFieldGet(this, _AbstractChatCompletionRunner_instances, "m", _AbstractChatCompletionRunner_getFinalMessage).call(this);
        if (finalMessage)
          this._emit("finalMessage", finalMessage);
        const finalContent = __classPrivateFieldGet(this, _AbstractChatCompletionRunner_instances, "m", _AbstractChatCompletionRunner_getFinalContent).call(this);
        if (finalContent)
          this._emit("finalContent", finalContent);
        const finalFunctionCall = __classPrivateFieldGet(this, _AbstractChatCompletionRunner_instances, "m", _AbstractChatCompletionRunner_getFinalFunctionToolCall).call(this);
        if (finalFunctionCall)
          this._emit("finalFunctionToolCall", finalFunctionCall);
        const finalFunctionCallResult = __classPrivateFieldGet(this, _AbstractChatCompletionRunner_instances, "m", _AbstractChatCompletionRunner_getFinalFunctionToolCallResult).call(this);
        if (finalFunctionCallResult != null)
          this._emit("finalFunctionToolCallResult", finalFunctionCallResult);
        if (this._chatCompletions.some((c) => c.usage)) {
          this._emit("totalUsage", __classPrivateFieldGet(this, _AbstractChatCompletionRunner_instances, "m", _AbstractChatCompletionRunner_calculateTotalUsage).call(this));
        }
      }
      async _createChatCompletion(client, params, options) {
        const signal = options?.signal;
        if (signal) {
          if (signal.aborted)
            this.controller.abort();
          signal.addEventListener("abort", () => this.controller.abort());
        }
        __classPrivateFieldGet(this, _AbstractChatCompletionRunner_instances, "m", _AbstractChatCompletionRunner_validateParams).call(this, params);
        const chatCompletion = await client.chat.completions.create({ ...params, stream: false }, { ...options, signal: this.controller.signal });
        this._connected();
        return this._addChatCompletion(parseChatCompletion(chatCompletion, params));
      }
      async _runChatCompletion(client, params, options) {
        for (const message2 of params.messages) {
          this._addMessage(message2, false);
        }
        return await this._createChatCompletion(client, params, options);
      }
      async _runTools(client, params, options) {
        const role = "tool";
        const { tool_choice = "auto", stream, ...restParams } = params;
        const singleFunctionToCall = typeof tool_choice !== "string" && tool_choice.type === "function" && tool_choice?.function?.name;
        const { maxChatCompletions = DEFAULT_MAX_CHAT_COMPLETIONS } = options || {};
        const inputTools = params.tools.map((tool) => {
          if (isAutoParsableTool(tool)) {
            if (!tool.$callback) {
              throw new OpenAIError("Tool given to `.runTools()` that does not have an associated function");
            }
            return {
              type: "function",
              function: {
                function: tool.$callback,
                name: tool.function.name,
                description: tool.function.description || "",
                parameters: tool.function.parameters,
                parse: tool.$parseRaw,
                strict: true
              }
            };
          }
          return tool;
        });
        const functionsByName = {};
        for (const f of inputTools) {
          if (f.type === "function") {
            functionsByName[f.function.name || f.function.function.name] = f.function;
          }
        }
        const tools = "tools" in params ? inputTools.map((t) => t.type === "function" ? {
          type: "function",
          function: {
            name: t.function.name || t.function.function.name,
            parameters: t.function.parameters,
            description: t.function.description,
            strict: t.function.strict
          }
        } : t) : void 0;
        for (const message2 of params.messages) {
          this._addMessage(message2, false);
        }
        for (let i = 0; i < maxChatCompletions; ++i) {
          const chatCompletion = await this._createChatCompletion(client, {
            ...restParams,
            tool_choice,
            tools,
            messages: [...this.messages]
          }, options);
          const message2 = chatCompletion.choices[0]?.message;
          if (!message2) {
            throw new OpenAIError(`missing message in ChatCompletion response`);
          }
          if (!message2.tool_calls?.length) {
            return;
          }
          for (const tool_call of message2.tool_calls) {
            if (tool_call.type !== "function")
              continue;
            const tool_call_id = tool_call.id;
            const { name, arguments: args } = tool_call.function;
            const fn = functionsByName[name];
            if (!fn) {
              const content2 = `Invalid tool_call: ${JSON.stringify(name)}. Available options are: ${Object.keys(functionsByName).map((name2) => JSON.stringify(name2)).join(", ")}. Please try again`;
              this._addMessage({ role, tool_call_id, content: content2 });
              continue;
            } else if (singleFunctionToCall && singleFunctionToCall !== name) {
              const content2 = `Invalid tool_call: ${JSON.stringify(name)}. ${JSON.stringify(singleFunctionToCall)} requested. Please try again`;
              this._addMessage({ role, tool_call_id, content: content2 });
              continue;
            }
            let parsed;
            try {
              parsed = isRunnableFunctionWithParse(fn) ? await fn.parse(args) : args;
            } catch (error) {
              const content2 = error instanceof Error ? error.message : String(error);
              this._addMessage({ role, tool_call_id, content: content2 });
              continue;
            }
            const rawContent = await fn.function(parsed, this);
            const content = __classPrivateFieldGet(this, _AbstractChatCompletionRunner_instances, "m", _AbstractChatCompletionRunner_stringifyFunctionCallResult).call(this, rawContent);
            this._addMessage({ role, tool_call_id, content });
            if (singleFunctionToCall) {
              return;
            }
          }
        }
        return;
      }
    };
    _AbstractChatCompletionRunner_instances = /* @__PURE__ */ new WeakSet(), _AbstractChatCompletionRunner_getFinalContent = function _AbstractChatCompletionRunner_getFinalContent2() {
      return __classPrivateFieldGet(this, _AbstractChatCompletionRunner_instances, "m", _AbstractChatCompletionRunner_getFinalMessage).call(this).content ?? null;
    }, _AbstractChatCompletionRunner_getFinalMessage = function _AbstractChatCompletionRunner_getFinalMessage2() {
      let i = this.messages.length;
      while (i-- > 0) {
        const message2 = this.messages[i];
        if (isAssistantMessage(message2)) {
          const ret = {
            ...message2,
            content: message2.content ?? null,
            refusal: message2.refusal ?? null
          };
          return ret;
        }
      }
      throw new OpenAIError("stream ended without producing a ChatCompletionMessage with role=assistant");
    }, _AbstractChatCompletionRunner_getFinalFunctionToolCall = function _AbstractChatCompletionRunner_getFinalFunctionToolCall2() {
      for (let i = this.messages.length - 1; i >= 0; i--) {
        const message2 = this.messages[i];
        if (isAssistantMessage(message2) && message2?.tool_calls?.length) {
          return message2.tool_calls.filter((x) => x.type === "function").at(-1)?.function;
        }
      }
      return;
    }, _AbstractChatCompletionRunner_getFinalFunctionToolCallResult = function _AbstractChatCompletionRunner_getFinalFunctionToolCallResult2() {
      for (let i = this.messages.length - 1; i >= 0; i--) {
        const message2 = this.messages[i];
        if (isToolMessage(message2) && message2.content != null && typeof message2.content === "string" && this.messages.some((x) => x.role === "assistant" && x.tool_calls?.some((y) => y.type === "function" && y.id === message2.tool_call_id))) {
          return message2.content;
        }
      }
      return;
    }, _AbstractChatCompletionRunner_calculateTotalUsage = function _AbstractChatCompletionRunner_calculateTotalUsage2() {
      const total = {
        completion_tokens: 0,
        prompt_tokens: 0,
        total_tokens: 0
      };
      for (const { usage } of this._chatCompletions) {
        if (usage) {
          total.completion_tokens += usage.completion_tokens;
          total.prompt_tokens += usage.prompt_tokens;
          total.total_tokens += usage.total_tokens;
        }
      }
      return total;
    }, _AbstractChatCompletionRunner_validateParams = function _AbstractChatCompletionRunner_validateParams2(params) {
      if (params.n != null && params.n > 1) {
        throw new OpenAIError("ChatCompletion convenience helpers only support n=1 at this time. To use n>1, please use chat.completions.create() directly.");
      }
    }, _AbstractChatCompletionRunner_stringifyFunctionCallResult = function _AbstractChatCompletionRunner_stringifyFunctionCallResult2(rawContent) {
      return typeof rawContent === "string" ? rawContent : rawContent === void 0 ? "undefined" : JSON.stringify(rawContent);
    };
  }
});

// node_modules/openai/lib/ChatCompletionRunner.mjs
var ChatCompletionRunner;
var init_ChatCompletionRunner = __esm({
  "node_modules/openai/lib/ChatCompletionRunner.mjs"() {
    init_AbstractChatCompletionRunner();
    init_chatCompletionUtils();
    ChatCompletionRunner = class _ChatCompletionRunner extends AbstractChatCompletionRunner {
      static runTools(client, params, options) {
        const runner = new _ChatCompletionRunner();
        const opts = {
          ...options,
          headers: { ...options?.headers, "X-Stainless-Helper-Method": "runTools" }
        };
        runner._run(() => runner._runTools(client, params, opts));
        return runner;
      }
      _addMessage(message2, emit = true) {
        super._addMessage(message2, emit);
        if (isAssistantMessage(message2) && message2.content) {
          this._emit("content", message2.content);
        }
      }
    };
  }
});

// node_modules/openai/_vendor/partial-json-parser/parser.mjs
function parseJSON(jsonString, allowPartial = Allow.ALL) {
  if (typeof jsonString !== "string") {
    throw new TypeError(`expecting str, got ${typeof jsonString}`);
  }
  if (!jsonString.trim()) {
    throw new Error(`${jsonString} is empty`);
  }
  return _parseJSON(jsonString.trim(), allowPartial);
}
var STR, NUM, ARR, OBJ, NULL, BOOL, NAN, INFINITY, MINUS_INFINITY, INF, SPECIAL, ATOM, COLLECTION, ALL, Allow, PartialJSON, MalformedJSON, _parseJSON, partialParse;
var init_parser2 = __esm({
  "node_modules/openai/_vendor/partial-json-parser/parser.mjs"() {
    STR = 1;
    NUM = 2;
    ARR = 4;
    OBJ = 8;
    NULL = 16;
    BOOL = 32;
    NAN = 64;
    INFINITY = 128;
    MINUS_INFINITY = 256;
    INF = INFINITY | MINUS_INFINITY;
    SPECIAL = NULL | BOOL | INF | NAN;
    ATOM = STR | NUM | SPECIAL;
    COLLECTION = ARR | OBJ;
    ALL = ATOM | COLLECTION;
    Allow = {
      STR,
      NUM,
      ARR,
      OBJ,
      NULL,
      BOOL,
      NAN,
      INFINITY,
      MINUS_INFINITY,
      INF,
      SPECIAL,
      ATOM,
      COLLECTION,
      ALL
    };
    PartialJSON = class extends Error {
    };
    MalformedJSON = class extends Error {
    };
    _parseJSON = (jsonString, allow) => {
      const length = jsonString.length;
      let index = 0;
      const markPartialJSON = (msg) => {
        throw new PartialJSON(`${msg} at position ${index}`);
      };
      const throwMalformedError = (msg) => {
        throw new MalformedJSON(`${msg} at position ${index}`);
      };
      const parseAny = () => {
        skipBlank();
        if (index >= length)
          markPartialJSON("Unexpected end of input");
        if (jsonString[index] === '"')
          return parseStr();
        if (jsonString[index] === "{")
          return parseObj();
        if (jsonString[index] === "[")
          return parseArr();
        if (jsonString.substring(index, index + 4) === "null" || Allow.NULL & allow && length - index < 4 && "null".startsWith(jsonString.substring(index))) {
          index += 4;
          return null;
        }
        if (jsonString.substring(index, index + 4) === "true" || Allow.BOOL & allow && length - index < 4 && "true".startsWith(jsonString.substring(index))) {
          index += 4;
          return true;
        }
        if (jsonString.substring(index, index + 5) === "false" || Allow.BOOL & allow && length - index < 5 && "false".startsWith(jsonString.substring(index))) {
          index += 5;
          return false;
        }
        if (jsonString.substring(index, index + 8) === "Infinity" || Allow.INFINITY & allow && length - index < 8 && "Infinity".startsWith(jsonString.substring(index))) {
          index += 8;
          return Infinity;
        }
        if (jsonString.substring(index, index + 9) === "-Infinity" || Allow.MINUS_INFINITY & allow && 1 < length - index && length - index < 9 && "-Infinity".startsWith(jsonString.substring(index))) {
          index += 9;
          return -Infinity;
        }
        if (jsonString.substring(index, index + 3) === "NaN" || Allow.NAN & allow && length - index < 3 && "NaN".startsWith(jsonString.substring(index))) {
          index += 3;
          return NaN;
        }
        return parseNum();
      };
      const parseStr = () => {
        const start = index;
        let escape2 = false;
        index++;
        while (index < length && (jsonString[index] !== '"' || escape2 && jsonString[index - 1] === "\\")) {
          escape2 = jsonString[index] === "\\" ? !escape2 : false;
          index++;
        }
        if (jsonString.charAt(index) == '"') {
          try {
            return JSON.parse(jsonString.substring(start, ++index - Number(escape2)));
          } catch (e) {
            throwMalformedError(String(e));
          }
        } else if (Allow.STR & allow) {
          try {
            return JSON.parse(jsonString.substring(start, index - Number(escape2)) + '"');
          } catch (e) {
            return JSON.parse(jsonString.substring(start, jsonString.lastIndexOf("\\")) + '"');
          }
        }
        markPartialJSON("Unterminated string literal");
      };
      const parseObj = () => {
        index++;
        skipBlank();
        const obj = {};
        try {
          while (jsonString[index] !== "}") {
            skipBlank();
            if (index >= length && Allow.OBJ & allow)
              return obj;
            const key = parseStr();
            skipBlank();
            index++;
            try {
              const value = parseAny();
              Object.defineProperty(obj, key, { value, writable: true, enumerable: true, configurable: true });
            } catch (e) {
              if (Allow.OBJ & allow)
                return obj;
              else
                throw e;
            }
            skipBlank();
            if (jsonString[index] === ",")
              index++;
          }
        } catch (e) {
          if (Allow.OBJ & allow)
            return obj;
          else
            markPartialJSON("Expected '}' at end of object");
        }
        index++;
        return obj;
      };
      const parseArr = () => {
        index++;
        const arr = [];
        try {
          while (jsonString[index] !== "]") {
            arr.push(parseAny());
            skipBlank();
            if (jsonString[index] === ",") {
              index++;
            }
          }
        } catch (e) {
          if (Allow.ARR & allow) {
            return arr;
          }
          markPartialJSON("Expected ']' at end of array");
        }
        index++;
        return arr;
      };
      const parseNum = () => {
        if (index === 0) {
          if (jsonString === "-" && Allow.NUM & allow)
            markPartialJSON("Not sure what '-' is");
          try {
            return JSON.parse(jsonString);
          } catch (e) {
            if (Allow.NUM & allow) {
              try {
                if ("." === jsonString[jsonString.length - 1])
                  return JSON.parse(jsonString.substring(0, jsonString.lastIndexOf(".")));
                return JSON.parse(jsonString.substring(0, jsonString.lastIndexOf("e")));
              } catch (e2) {
              }
            }
            throwMalformedError(String(e));
          }
        }
        const start = index;
        if (jsonString[index] === "-")
          index++;
        while (jsonString[index] && !",]}".includes(jsonString[index]))
          index++;
        if (index == length && !(Allow.NUM & allow))
          markPartialJSON("Unterminated number literal");
        try {
          return JSON.parse(jsonString.substring(start, index));
        } catch (e) {
          if (jsonString.substring(start, index) === "-" && Allow.NUM & allow)
            markPartialJSON("Not sure what '-' is");
          try {
            return JSON.parse(jsonString.substring(start, jsonString.lastIndexOf("e")));
          } catch (e2) {
            throwMalformedError(String(e2));
          }
        }
      };
      const skipBlank = () => {
        while (index < length && " \n\r	".includes(jsonString[index])) {
          index++;
        }
      };
      return parseAny();
    };
    partialParse = (input) => parseJSON(input, Allow.ALL ^ Allow.NUM);
  }
});

// node_modules/openai/streaming.mjs
var init_streaming2 = __esm({
  "node_modules/openai/streaming.mjs"() {
    init_streaming();
  }
});

// node_modules/openai/lib/ChatCompletionStream.mjs
function finalizeChatCompletion(snapshot, params) {
  const { id, choices, created, model, system_fingerprint, ...rest } = snapshot;
  const completion = {
    ...rest,
    id,
    choices: choices.map(({ message: message2, finish_reason, index, logprobs, ...choiceRest }) => {
      if (!finish_reason) {
        throw new OpenAIError(`missing finish_reason for choice ${index}`);
      }
      const { content = null, function_call, tool_calls, ...messageRest } = message2;
      const role = message2.role;
      if (!role) {
        throw new OpenAIError(`missing role for choice ${index}`);
      }
      if (function_call) {
        const { arguments: args, name } = function_call;
        if (args == null) {
          throw new OpenAIError(`missing function_call.arguments for choice ${index}`);
        }
        if (!name) {
          throw new OpenAIError(`missing function_call.name for choice ${index}`);
        }
        return {
          ...choiceRest,
          message: {
            content,
            function_call: { arguments: args, name },
            role,
            refusal: message2.refusal ?? null
          },
          finish_reason,
          index,
          logprobs
        };
      }
      if (tool_calls) {
        return {
          ...choiceRest,
          index,
          finish_reason,
          logprobs,
          message: {
            ...messageRest,
            role,
            content,
            refusal: message2.refusal ?? null,
            tool_calls: tool_calls.map((tool_call, i) => {
              const { function: fn, type, id: id2, ...toolRest } = tool_call;
              const { arguments: args, name, ...fnRest } = fn || {};
              if (id2 == null) {
                throw new OpenAIError(`missing choices[${index}].tool_calls[${i}].id
${str(snapshot)}`);
              }
              if (type == null) {
                throw new OpenAIError(`missing choices[${index}].tool_calls[${i}].type
${str(snapshot)}`);
              }
              if (name == null) {
                throw new OpenAIError(`missing choices[${index}].tool_calls[${i}].function.name
${str(snapshot)}`);
              }
              if (args == null) {
                throw new OpenAIError(`missing choices[${index}].tool_calls[${i}].function.arguments
${str(snapshot)}`);
              }
              return { ...toolRest, id: id2, type, function: { ...fnRest, name, arguments: args } };
            })
          }
        };
      }
      return {
        ...choiceRest,
        message: { ...messageRest, content, role, refusal: message2.refusal ?? null },
        finish_reason,
        index,
        logprobs
      };
    }),
    created,
    model,
    object: "chat.completion",
    ...system_fingerprint ? { system_fingerprint } : {}
  };
  return maybeParseChatCompletion(completion, params);
}
function str(x) {
  return JSON.stringify(x);
}
function assertIsEmpty(obj) {
  return;
}
function assertNever(_x) {
}
var _ChatCompletionStream_instances, _ChatCompletionStream_params, _ChatCompletionStream_choiceEventStates, _ChatCompletionStream_currentChatCompletionSnapshot, _ChatCompletionStream_beginRequest, _ChatCompletionStream_getChoiceEventState, _ChatCompletionStream_addChunk, _ChatCompletionStream_emitToolCallDoneEvent, _ChatCompletionStream_emitContentDoneEvents, _ChatCompletionStream_endRequest, _ChatCompletionStream_getAutoParseableResponseFormat, _ChatCompletionStream_accumulateChatCompletion, ChatCompletionStream;
var init_ChatCompletionStream = __esm({
  "node_modules/openai/lib/ChatCompletionStream.mjs"() {
    init_tslib();
    init_parser2();
    init_error2();
    init_parser();
    init_streaming2();
    init_AbstractChatCompletionRunner();
    ChatCompletionStream = class _ChatCompletionStream extends AbstractChatCompletionRunner {
      constructor(params) {
        super();
        _ChatCompletionStream_instances.add(this);
        _ChatCompletionStream_params.set(this, void 0);
        _ChatCompletionStream_choiceEventStates.set(this, void 0);
        _ChatCompletionStream_currentChatCompletionSnapshot.set(this, void 0);
        __classPrivateFieldSet(this, _ChatCompletionStream_params, params, "f");
        __classPrivateFieldSet(this, _ChatCompletionStream_choiceEventStates, [], "f");
      }
      get currentChatCompletionSnapshot() {
        return __classPrivateFieldGet(this, _ChatCompletionStream_currentChatCompletionSnapshot, "f");
      }
      /**
       * Intended for use on the frontend, consuming a stream produced with
       * `.toReadableStream()` on the backend.
       *
       * Note that messages sent to the model do not appear in `.on('message')`
       * in this context.
       */
      static fromReadableStream(stream) {
        const runner = new _ChatCompletionStream(null);
        runner._run(() => runner._fromReadableStream(stream));
        return runner;
      }
      static createChatCompletion(client, params, options) {
        const runner = new _ChatCompletionStream(params);
        runner._run(() => runner._runChatCompletion(client, { ...params, stream: true }, { ...options, headers: { ...options?.headers, "X-Stainless-Helper-Method": "stream" } }));
        return runner;
      }
      async _createChatCompletion(client, params, options) {
        super._createChatCompletion;
        const signal = options?.signal;
        if (signal) {
          if (signal.aborted)
            this.controller.abort();
          signal.addEventListener("abort", () => this.controller.abort());
        }
        __classPrivateFieldGet(this, _ChatCompletionStream_instances, "m", _ChatCompletionStream_beginRequest).call(this);
        const stream = await client.chat.completions.create({ ...params, stream: true }, { ...options, signal: this.controller.signal });
        this._connected();
        for await (const chunk of stream) {
          __classPrivateFieldGet(this, _ChatCompletionStream_instances, "m", _ChatCompletionStream_addChunk).call(this, chunk);
        }
        if (stream.controller.signal?.aborted) {
          throw new APIUserAbortError();
        }
        return this._addChatCompletion(__classPrivateFieldGet(this, _ChatCompletionStream_instances, "m", _ChatCompletionStream_endRequest).call(this));
      }
      async _fromReadableStream(readableStream, options) {
        const signal = options?.signal;
        if (signal) {
          if (signal.aborted)
            this.controller.abort();
          signal.addEventListener("abort", () => this.controller.abort());
        }
        __classPrivateFieldGet(this, _ChatCompletionStream_instances, "m", _ChatCompletionStream_beginRequest).call(this);
        this._connected();
        const stream = Stream.fromReadableStream(readableStream, this.controller);
        let chatId;
        for await (const chunk of stream) {
          if (chatId && chatId !== chunk.id) {
            this._addChatCompletion(__classPrivateFieldGet(this, _ChatCompletionStream_instances, "m", _ChatCompletionStream_endRequest).call(this));
          }
          __classPrivateFieldGet(this, _ChatCompletionStream_instances, "m", _ChatCompletionStream_addChunk).call(this, chunk);
          chatId = chunk.id;
        }
        if (stream.controller.signal?.aborted) {
          throw new APIUserAbortError();
        }
        return this._addChatCompletion(__classPrivateFieldGet(this, _ChatCompletionStream_instances, "m", _ChatCompletionStream_endRequest).call(this));
      }
      [(_ChatCompletionStream_params = /* @__PURE__ */ new WeakMap(), _ChatCompletionStream_choiceEventStates = /* @__PURE__ */ new WeakMap(), _ChatCompletionStream_currentChatCompletionSnapshot = /* @__PURE__ */ new WeakMap(), _ChatCompletionStream_instances = /* @__PURE__ */ new WeakSet(), _ChatCompletionStream_beginRequest = function _ChatCompletionStream_beginRequest2() {
        if (this.ended)
          return;
        __classPrivateFieldSet(this, _ChatCompletionStream_currentChatCompletionSnapshot, void 0, "f");
      }, _ChatCompletionStream_getChoiceEventState = function _ChatCompletionStream_getChoiceEventState2(choice) {
        let state = __classPrivateFieldGet(this, _ChatCompletionStream_choiceEventStates, "f")[choice.index];
        if (state) {
          return state;
        }
        state = {
          content_done: false,
          refusal_done: false,
          logprobs_content_done: false,
          logprobs_refusal_done: false,
          done_tool_calls: /* @__PURE__ */ new Set(),
          current_tool_call_index: null
        };
        __classPrivateFieldGet(this, _ChatCompletionStream_choiceEventStates, "f")[choice.index] = state;
        return state;
      }, _ChatCompletionStream_addChunk = function _ChatCompletionStream_addChunk2(chunk) {
        if (this.ended)
          return;
        const completion = __classPrivateFieldGet(this, _ChatCompletionStream_instances, "m", _ChatCompletionStream_accumulateChatCompletion).call(this, chunk);
        this._emit("chunk", chunk, completion);
        for (const choice of chunk.choices) {
          const choiceSnapshot = completion.choices[choice.index];
          if (choice.delta.content != null && choiceSnapshot.message?.role === "assistant" && choiceSnapshot.message?.content) {
            this._emit("content", choice.delta.content, choiceSnapshot.message.content);
            this._emit("content.delta", {
              delta: choice.delta.content,
              snapshot: choiceSnapshot.message.content,
              parsed: choiceSnapshot.message.parsed
            });
          }
          if (choice.delta.refusal != null && choiceSnapshot.message?.role === "assistant" && choiceSnapshot.message?.refusal) {
            this._emit("refusal.delta", {
              delta: choice.delta.refusal,
              snapshot: choiceSnapshot.message.refusal
            });
          }
          if (choice.logprobs?.content != null && choiceSnapshot.message?.role === "assistant") {
            this._emit("logprobs.content.delta", {
              content: choice.logprobs?.content,
              snapshot: choiceSnapshot.logprobs?.content ?? []
            });
          }
          if (choice.logprobs?.refusal != null && choiceSnapshot.message?.role === "assistant") {
            this._emit("logprobs.refusal.delta", {
              refusal: choice.logprobs?.refusal,
              snapshot: choiceSnapshot.logprobs?.refusal ?? []
            });
          }
          const state = __classPrivateFieldGet(this, _ChatCompletionStream_instances, "m", _ChatCompletionStream_getChoiceEventState).call(this, choiceSnapshot);
          if (choiceSnapshot.finish_reason) {
            __classPrivateFieldGet(this, _ChatCompletionStream_instances, "m", _ChatCompletionStream_emitContentDoneEvents).call(this, choiceSnapshot);
            if (state.current_tool_call_index != null) {
              __classPrivateFieldGet(this, _ChatCompletionStream_instances, "m", _ChatCompletionStream_emitToolCallDoneEvent).call(this, choiceSnapshot, state.current_tool_call_index);
            }
          }
          for (const toolCall of choice.delta.tool_calls ?? []) {
            if (state.current_tool_call_index !== toolCall.index) {
              __classPrivateFieldGet(this, _ChatCompletionStream_instances, "m", _ChatCompletionStream_emitContentDoneEvents).call(this, choiceSnapshot);
              if (state.current_tool_call_index != null) {
                __classPrivateFieldGet(this, _ChatCompletionStream_instances, "m", _ChatCompletionStream_emitToolCallDoneEvent).call(this, choiceSnapshot, state.current_tool_call_index);
              }
            }
            state.current_tool_call_index = toolCall.index;
          }
          for (const toolCallDelta of choice.delta.tool_calls ?? []) {
            const toolCallSnapshot = choiceSnapshot.message.tool_calls?.[toolCallDelta.index];
            if (!toolCallSnapshot?.type) {
              continue;
            }
            if (toolCallSnapshot?.type === "function") {
              this._emit("tool_calls.function.arguments.delta", {
                name: toolCallSnapshot.function?.name,
                index: toolCallDelta.index,
                arguments: toolCallSnapshot.function.arguments,
                parsed_arguments: toolCallSnapshot.function.parsed_arguments,
                arguments_delta: toolCallDelta.function?.arguments ?? ""
              });
            } else {
              assertNever(toolCallSnapshot?.type);
            }
          }
        }
      }, _ChatCompletionStream_emitToolCallDoneEvent = function _ChatCompletionStream_emitToolCallDoneEvent2(choiceSnapshot, toolCallIndex) {
        const state = __classPrivateFieldGet(this, _ChatCompletionStream_instances, "m", _ChatCompletionStream_getChoiceEventState).call(this, choiceSnapshot);
        if (state.done_tool_calls.has(toolCallIndex)) {
          return;
        }
        const toolCallSnapshot = choiceSnapshot.message.tool_calls?.[toolCallIndex];
        if (!toolCallSnapshot) {
          throw new Error("no tool call snapshot");
        }
        if (!toolCallSnapshot.type) {
          throw new Error("tool call snapshot missing `type`");
        }
        if (toolCallSnapshot.type === "function") {
          const inputTool = __classPrivateFieldGet(this, _ChatCompletionStream_params, "f")?.tools?.find((tool) => isChatCompletionFunctionTool(tool) && tool.function.name === toolCallSnapshot.function.name);
          this._emit("tool_calls.function.arguments.done", {
            name: toolCallSnapshot.function.name,
            index: toolCallIndex,
            arguments: toolCallSnapshot.function.arguments,
            parsed_arguments: isAutoParsableTool(inputTool) ? inputTool.$parseRaw(toolCallSnapshot.function.arguments) : inputTool?.function.strict ? JSON.parse(toolCallSnapshot.function.arguments) : null
          });
        } else {
          assertNever(toolCallSnapshot.type);
        }
      }, _ChatCompletionStream_emitContentDoneEvents = function _ChatCompletionStream_emitContentDoneEvents2(choiceSnapshot) {
        const state = __classPrivateFieldGet(this, _ChatCompletionStream_instances, "m", _ChatCompletionStream_getChoiceEventState).call(this, choiceSnapshot);
        if (choiceSnapshot.message.content && !state.content_done) {
          state.content_done = true;
          const responseFormat = __classPrivateFieldGet(this, _ChatCompletionStream_instances, "m", _ChatCompletionStream_getAutoParseableResponseFormat).call(this);
          this._emit("content.done", {
            content: choiceSnapshot.message.content,
            parsed: responseFormat ? responseFormat.$parseRaw(choiceSnapshot.message.content) : null
          });
        }
        if (choiceSnapshot.message.refusal && !state.refusal_done) {
          state.refusal_done = true;
          this._emit("refusal.done", { refusal: choiceSnapshot.message.refusal });
        }
        if (choiceSnapshot.logprobs?.content && !state.logprobs_content_done) {
          state.logprobs_content_done = true;
          this._emit("logprobs.content.done", { content: choiceSnapshot.logprobs.content });
        }
        if (choiceSnapshot.logprobs?.refusal && !state.logprobs_refusal_done) {
          state.logprobs_refusal_done = true;
          this._emit("logprobs.refusal.done", { refusal: choiceSnapshot.logprobs.refusal });
        }
      }, _ChatCompletionStream_endRequest = function _ChatCompletionStream_endRequest2() {
        if (this.ended) {
          throw new OpenAIError(`stream has ended, this shouldn't happen`);
        }
        const snapshot = __classPrivateFieldGet(this, _ChatCompletionStream_currentChatCompletionSnapshot, "f");
        if (!snapshot) {
          throw new OpenAIError(`request ended without sending any chunks`);
        }
        __classPrivateFieldSet(this, _ChatCompletionStream_currentChatCompletionSnapshot, void 0, "f");
        __classPrivateFieldSet(this, _ChatCompletionStream_choiceEventStates, [], "f");
        return finalizeChatCompletion(snapshot, __classPrivateFieldGet(this, _ChatCompletionStream_params, "f"));
      }, _ChatCompletionStream_getAutoParseableResponseFormat = function _ChatCompletionStream_getAutoParseableResponseFormat2() {
        const responseFormat = __classPrivateFieldGet(this, _ChatCompletionStream_params, "f")?.response_format;
        if (isAutoParsableResponseFormat(responseFormat)) {
          return responseFormat;
        }
        return null;
      }, _ChatCompletionStream_accumulateChatCompletion = function _ChatCompletionStream_accumulateChatCompletion2(chunk) {
        var _a3, _b, _c, _d;
        let snapshot = __classPrivateFieldGet(this, _ChatCompletionStream_currentChatCompletionSnapshot, "f");
        const { choices, ...rest } = chunk;
        if (!snapshot) {
          snapshot = __classPrivateFieldSet(this, _ChatCompletionStream_currentChatCompletionSnapshot, {
            ...rest,
            choices: []
          }, "f");
        } else {
          Object.assign(snapshot, rest);
        }
        for (const { delta, finish_reason, index, logprobs = null, ...other } of chunk.choices) {
          let choice = snapshot.choices[index];
          if (!choice) {
            choice = snapshot.choices[index] = { finish_reason, index, message: {}, logprobs, ...other };
          }
          if (logprobs) {
            if (!choice.logprobs) {
              choice.logprobs = Object.assign({}, logprobs);
            } else {
              const { content: content2, refusal: refusal2, ...rest3 } = logprobs;
              assertIsEmpty(rest3);
              Object.assign(choice.logprobs, rest3);
              if (content2) {
                (_a3 = choice.logprobs).content ?? (_a3.content = []);
                choice.logprobs.content.push(...content2);
              }
              if (refusal2) {
                (_b = choice.logprobs).refusal ?? (_b.refusal = []);
                choice.logprobs.refusal.push(...refusal2);
              }
            }
          }
          if (finish_reason) {
            choice.finish_reason = finish_reason;
            if (__classPrivateFieldGet(this, _ChatCompletionStream_params, "f") && hasAutoParseableInput(__classPrivateFieldGet(this, _ChatCompletionStream_params, "f"))) {
              if (finish_reason === "length") {
                throw new LengthFinishReasonError();
              }
              if (finish_reason === "content_filter") {
                throw new ContentFilterFinishReasonError();
              }
            }
          }
          Object.assign(choice, other);
          if (!delta)
            continue;
          const { content, refusal, function_call, role, tool_calls, ...rest2 } = delta;
          assertIsEmpty(rest2);
          Object.assign(choice.message, rest2);
          if (refusal) {
            choice.message.refusal = (choice.message.refusal || "") + refusal;
          }
          if (role)
            choice.message.role = role;
          if (function_call) {
            if (!choice.message.function_call) {
              choice.message.function_call = function_call;
            } else {
              if (function_call.name)
                choice.message.function_call.name = function_call.name;
              if (function_call.arguments) {
                (_c = choice.message.function_call).arguments ?? (_c.arguments = "");
                choice.message.function_call.arguments += function_call.arguments;
              }
            }
          }
          if (content) {
            choice.message.content = (choice.message.content || "") + content;
            if (!choice.message.refusal && __classPrivateFieldGet(this, _ChatCompletionStream_instances, "m", _ChatCompletionStream_getAutoParseableResponseFormat).call(this)) {
              choice.message.parsed = partialParse(choice.message.content);
            }
          }
          if (tool_calls) {
            if (!choice.message.tool_calls)
              choice.message.tool_calls = [];
            for (const { index: index2, id, type, function: fn, ...rest3 } of tool_calls) {
              const tool_call = (_d = choice.message.tool_calls)[index2] ?? (_d[index2] = {});
              Object.assign(tool_call, rest3);
              if (id)
                tool_call.id = id;
              if (type)
                tool_call.type = type;
              if (fn)
                tool_call.function ?? (tool_call.function = { name: fn.name ?? "", arguments: "" });
              if (fn?.name)
                tool_call.function.name = fn.name;
              if (fn?.arguments) {
                tool_call.function.arguments += fn.arguments;
                if (shouldParseToolCall(__classPrivateFieldGet(this, _ChatCompletionStream_params, "f"), tool_call)) {
                  tool_call.function.parsed_arguments = partialParse(tool_call.function.arguments);
                }
              }
            }
          }
        }
        return snapshot;
      }, Symbol.asyncIterator)]() {
        const pushQueue = [];
        const readQueue = [];
        let done = false;
        this.on("chunk", (chunk) => {
          const reader = readQueue.shift();
          if (reader) {
            reader.resolve(chunk);
          } else {
            pushQueue.push(chunk);
          }
        });
        this.on("end", () => {
          done = true;
          for (const reader of readQueue) {
            reader.resolve(void 0);
          }
          readQueue.length = 0;
        });
        this.on("abort", (err) => {
          done = true;
          for (const reader of readQueue) {
            reader.reject(err);
          }
          readQueue.length = 0;
        });
        this.on("error", (err) => {
          done = true;
          for (const reader of readQueue) {
            reader.reject(err);
          }
          readQueue.length = 0;
        });
        return {
          next: async () => {
            if (!pushQueue.length) {
              if (done) {
                return { value: void 0, done: true };
              }
              return new Promise((resolve, reject) => readQueue.push({ resolve, reject })).then((chunk2) => chunk2 ? { value: chunk2, done: false } : { value: void 0, done: true });
            }
            const chunk = pushQueue.shift();
            return { value: chunk, done: false };
          },
          return: async () => {
            this.abort();
            return { value: void 0, done: true };
          }
        };
      }
      toReadableStream() {
        const stream = new Stream(this[Symbol.asyncIterator].bind(this), this.controller);
        return stream.toReadableStream();
      }
    };
  }
});

// node_modules/openai/lib/ChatCompletionStreamingRunner.mjs
var ChatCompletionStreamingRunner;
var init_ChatCompletionStreamingRunner = __esm({
  "node_modules/openai/lib/ChatCompletionStreamingRunner.mjs"() {
    init_ChatCompletionStream();
    ChatCompletionStreamingRunner = class _ChatCompletionStreamingRunner extends ChatCompletionStream {
      static fromReadableStream(stream) {
        const runner = new _ChatCompletionStreamingRunner(null);
        runner._run(() => runner._fromReadableStream(stream));
        return runner;
      }
      static runTools(client, params, options) {
        const runner = new _ChatCompletionStreamingRunner(
          // @ts-expect-error TODO these types are incompatible
          params
        );
        const opts = {
          ...options,
          headers: { ...options?.headers, "X-Stainless-Helper-Method": "runTools" }
        };
        runner._run(() => runner._runTools(client, params, opts));
        return runner;
      }
    };
  }
});

// node_modules/openai/resources/chat/completions/completions.mjs
var Completions;
var init_completions = __esm({
  "node_modules/openai/resources/chat/completions/completions.mjs"() {
    init_resource();
    init_messages();
    init_messages();
    init_pagination();
    init_path();
    init_ChatCompletionRunner();
    init_ChatCompletionStreamingRunner();
    init_ChatCompletionStream();
    init_parser();
    init_ChatCompletionStreamingRunner();
    init_RunnableFunction();
    init_ChatCompletionStream();
    init_ChatCompletionRunner();
    Completions = class extends APIResource {
      constructor() {
        super(...arguments);
        this.messages = new Messages(this._client);
      }
      create(body, options) {
        return this._client.post("/chat/completions", { body, ...options, stream: body.stream ?? false });
      }
      /**
       * Get a stored chat completion. Only Chat Completions that have been created with
       * the `store` parameter set to `true` will be returned.
       *
       * @example
       * ```ts
       * const chatCompletion =
       *   await client.chat.completions.retrieve('completion_id');
       * ```
       */
      retrieve(completionID, options) {
        return this._client.get(path`/chat/completions/${completionID}`, options);
      }
      /**
       * Modify a stored chat completion. Only Chat Completions that have been created
       * with the `store` parameter set to `true` can be modified. Currently, the only
       * supported modification is to update the `metadata` field.
       *
       * @example
       * ```ts
       * const chatCompletion = await client.chat.completions.update(
       *   'completion_id',
       *   { metadata: { foo: 'string' } },
       * );
       * ```
       */
      update(completionID, body, options) {
        return this._client.post(path`/chat/completions/${completionID}`, { body, ...options });
      }
      /**
       * List stored Chat Completions. Only Chat Completions that have been stored with
       * the `store` parameter set to `true` will be returned.
       *
       * @example
       * ```ts
       * // Automatically fetches more pages as needed.
       * for await (const chatCompletion of client.chat.completions.list()) {
       *   // ...
       * }
       * ```
       */
      list(query = {}, options) {
        return this._client.getAPIList("/chat/completions", CursorPage, { query, ...options });
      }
      /**
       * Delete a stored chat completion. Only Chat Completions that have been created
       * with the `store` parameter set to `true` can be deleted.
       *
       * @example
       * ```ts
       * const chatCompletionDeleted =
       *   await client.chat.completions.delete('completion_id');
       * ```
       */
      delete(completionID, options) {
        return this._client.delete(path`/chat/completions/${completionID}`, options);
      }
      parse(body, options) {
        validateInputTools(body.tools);
        return this._client.chat.completions.create(body, {
          ...options,
          headers: {
            ...options?.headers,
            "X-Stainless-Helper-Method": "chat.completions.parse"
          }
        })._thenUnwrap((completion) => parseChatCompletion(completion, body));
      }
      runTools(body, options) {
        if (body.stream) {
          return ChatCompletionStreamingRunner.runTools(this._client, body, options);
        }
        return ChatCompletionRunner.runTools(this._client, body, options);
      }
      /**
       * Creates a chat completion stream
       */
      stream(body, options) {
        return ChatCompletionStream.createChatCompletion(this._client, body, options);
      }
    };
    Completions.Messages = Messages;
  }
});

// node_modules/openai/resources/chat/chat.mjs
var Chat;
var init_chat = __esm({
  "node_modules/openai/resources/chat/chat.mjs"() {
    init_resource();
    init_completions();
    init_completions();
    Chat = class extends APIResource {
      constructor() {
        super(...arguments);
        this.completions = new Completions(this._client);
      }
    };
    Chat.Completions = Completions;
  }
});

// node_modules/openai/resources/chat/completions/index.mjs
var init_completions2 = __esm({
  "node_modules/openai/resources/chat/completions/index.mjs"() {
    init_completions();
    init_completions();
    init_messages();
  }
});

// node_modules/openai/resources/chat/index.mjs
var init_chat2 = __esm({
  "node_modules/openai/resources/chat/index.mjs"() {
    init_chat();
    init_completions2();
  }
});

// node_modules/openai/resources/shared.mjs
var init_shared = __esm({
  "node_modules/openai/resources/shared.mjs"() {
  }
});

// node_modules/openai/internal/headers.mjs
function* iterateHeaders(headers) {
  if (!headers)
    return;
  if (brand_privateNullableHeaders in headers) {
    const { values, nulls } = headers;
    yield* values.entries();
    for (const name of nulls) {
      yield [name, null];
    }
    return;
  }
  let shouldClear = false;
  let iter;
  if (headers instanceof Headers) {
    iter = headers.entries();
  } else if (isReadonlyArray(headers)) {
    iter = headers;
  } else {
    shouldClear = true;
    iter = Object.entries(headers ?? {});
  }
  for (let row of iter) {
    const name = row[0];
    if (typeof name !== "string")
      throw new TypeError("expected header name to be a string");
    const values = isReadonlyArray(row[1]) ? row[1] : [row[1]];
    let didClear = false;
    for (const value of values) {
      if (value === void 0)
        continue;
      if (shouldClear && !didClear) {
        didClear = true;
        yield [name, null];
      }
      yield [name, value];
    }
  }
}
var brand_privateNullableHeaders, buildHeaders;
var init_headers = __esm({
  "node_modules/openai/internal/headers.mjs"() {
    init_values();
    brand_privateNullableHeaders = /* @__PURE__ */ Symbol("brand.privateNullableHeaders");
    buildHeaders = (newHeaders) => {
      const targetHeaders = new Headers();
      const nullHeaders = /* @__PURE__ */ new Set();
      for (const headers of newHeaders) {
        const seenHeaders = /* @__PURE__ */ new Set();
        for (const [name, value] of iterateHeaders(headers)) {
          const lowerName = name.toLowerCase();
          if (!seenHeaders.has(lowerName)) {
            targetHeaders.delete(name);
            seenHeaders.add(lowerName);
          }
          if (value === null) {
            targetHeaders.delete(name);
            nullHeaders.add(lowerName);
          } else {
            targetHeaders.append(name, value);
            nullHeaders.delete(lowerName);
          }
        }
      }
      return { [brand_privateNullableHeaders]: true, values: targetHeaders, nulls: nullHeaders };
    };
  }
});

// node_modules/openai/resources/audio/speech.mjs
var Speech;
var init_speech = __esm({
  "node_modules/openai/resources/audio/speech.mjs"() {
    init_resource();
    init_headers();
    Speech = class extends APIResource {
      /**
       * Generates audio from the input text.
       *
       * @example
       * ```ts
       * const speech = await client.audio.speech.create({
       *   input: 'input',
       *   model: 'string',
       *   voice: 'ash',
       * });
       *
       * const content = await speech.blob();
       * console.log(content);
       * ```
       */
      create(body, options) {
        return this._client.post("/audio/speech", {
          body,
          ...options,
          headers: buildHeaders([{ Accept: "application/octet-stream" }, options?.headers]),
          __binaryResponse: true
        });
      }
    };
  }
});

// node_modules/openai/resources/audio/transcriptions.mjs
var Transcriptions;
var init_transcriptions = __esm({
  "node_modules/openai/resources/audio/transcriptions.mjs"() {
    init_resource();
    init_uploads();
    Transcriptions = class extends APIResource {
      create(body, options) {
        return this._client.post("/audio/transcriptions", multipartFormRequestOptions({
          body,
          ...options,
          stream: body.stream ?? false,
          __metadata: { model: body.model }
        }, this._client));
      }
    };
  }
});

// node_modules/openai/resources/audio/translations.mjs
var Translations;
var init_translations = __esm({
  "node_modules/openai/resources/audio/translations.mjs"() {
    init_resource();
    init_uploads();
    Translations = class extends APIResource {
      create(body, options) {
        return this._client.post("/audio/translations", multipartFormRequestOptions({ body, ...options, __metadata: { model: body.model } }, this._client));
      }
    };
  }
});

// node_modules/openai/resources/audio/audio.mjs
var Audio;
var init_audio = __esm({
  "node_modules/openai/resources/audio/audio.mjs"() {
    init_resource();
    init_speech();
    init_speech();
    init_transcriptions();
    init_transcriptions();
    init_translations();
    init_translations();
    Audio = class extends APIResource {
      constructor() {
        super(...arguments);
        this.transcriptions = new Transcriptions(this._client);
        this.translations = new Translations(this._client);
        this.speech = new Speech(this._client);
      }
    };
    Audio.Transcriptions = Transcriptions;
    Audio.Translations = Translations;
    Audio.Speech = Speech;
  }
});

// node_modules/openai/resources/batches.mjs
var Batches;
var init_batches = __esm({
  "node_modules/openai/resources/batches.mjs"() {
    init_resource();
    init_pagination();
    init_path();
    Batches = class extends APIResource {
      /**
       * Creates and executes a batch from an uploaded file of requests
       */
      create(body, options) {
        return this._client.post("/batches", { body, ...options });
      }
      /**
       * Retrieves a batch.
       */
      retrieve(batchID, options) {
        return this._client.get(path`/batches/${batchID}`, options);
      }
      /**
       * List your organization's batches.
       */
      list(query = {}, options) {
        return this._client.getAPIList("/batches", CursorPage, { query, ...options });
      }
      /**
       * Cancels an in-progress batch. The batch will be in status `cancelling` for up to
       * 10 minutes, before changing to `cancelled`, where it will have partial results
       * (if any) available in the output file.
       */
      cancel(batchID, options) {
        return this._client.post(path`/batches/${batchID}/cancel`, options);
      }
    };
  }
});

// node_modules/openai/resources/beta/assistants.mjs
var Assistants;
var init_assistants = __esm({
  "node_modules/openai/resources/beta/assistants.mjs"() {
    init_resource();
    init_pagination();
    init_headers();
    init_path();
    Assistants = class extends APIResource {
      /**
       * Create an assistant with a model and instructions.
       *
       * @example
       * ```ts
       * const assistant = await client.beta.assistants.create({
       *   model: 'gpt-4o',
       * });
       * ```
       */
      create(body, options) {
        return this._client.post("/assistants", {
          body,
          ...options,
          headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options?.headers])
        });
      }
      /**
       * Retrieves an assistant.
       *
       * @example
       * ```ts
       * const assistant = await client.beta.assistants.retrieve(
       *   'assistant_id',
       * );
       * ```
       */
      retrieve(assistantID, options) {
        return this._client.get(path`/assistants/${assistantID}`, {
          ...options,
          headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options?.headers])
        });
      }
      /**
       * Modifies an assistant.
       *
       * @example
       * ```ts
       * const assistant = await client.beta.assistants.update(
       *   'assistant_id',
       * );
       * ```
       */
      update(assistantID, body, options) {
        return this._client.post(path`/assistants/${assistantID}`, {
          body,
          ...options,
          headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options?.headers])
        });
      }
      /**
       * Returns a list of assistants.
       *
       * @example
       * ```ts
       * // Automatically fetches more pages as needed.
       * for await (const assistant of client.beta.assistants.list()) {
       *   // ...
       * }
       * ```
       */
      list(query = {}, options) {
        return this._client.getAPIList("/assistants", CursorPage, {
          query,
          ...options,
          headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options?.headers])
        });
      }
      /**
       * Delete an assistant.
       *
       * @example
       * ```ts
       * const assistantDeleted =
       *   await client.beta.assistants.delete('assistant_id');
       * ```
       */
      delete(assistantID, options) {
        return this._client.delete(path`/assistants/${assistantID}`, {
          ...options,
          headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options?.headers])
        });
      }
    };
  }
});

// node_modules/openai/resources/beta/realtime/sessions.mjs
var Sessions;
var init_sessions = __esm({
  "node_modules/openai/resources/beta/realtime/sessions.mjs"() {
    init_resource();
    init_headers();
    Sessions = class extends APIResource {
      /**
       * Create an ephemeral API token for use in client-side applications with the
       * Realtime API. Can be configured with the same session parameters as the
       * `session.update` client event.
       *
       * It responds with a session object, plus a `client_secret` key which contains a
       * usable ephemeral API token that can be used to authenticate browser clients for
       * the Realtime API.
       *
       * @example
       * ```ts
       * const session =
       *   await client.beta.realtime.sessions.create();
       * ```
       */
      create(body, options) {
        return this._client.post("/realtime/sessions", {
          body,
          ...options,
          headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options?.headers])
        });
      }
    };
  }
});

// node_modules/openai/resources/beta/realtime/transcription-sessions.mjs
var TranscriptionSessions;
var init_transcription_sessions = __esm({
  "node_modules/openai/resources/beta/realtime/transcription-sessions.mjs"() {
    init_resource();
    init_headers();
    TranscriptionSessions = class extends APIResource {
      /**
       * Create an ephemeral API token for use in client-side applications with the
       * Realtime API specifically for realtime transcriptions. Can be configured with
       * the same session parameters as the `transcription_session.update` client event.
       *
       * It responds with a session object, plus a `client_secret` key which contains a
       * usable ephemeral API token that can be used to authenticate browser clients for
       * the Realtime API.
       *
       * @example
       * ```ts
       * const transcriptionSession =
       *   await client.beta.realtime.transcriptionSessions.create();
       * ```
       */
      create(body, options) {
        return this._client.post("/realtime/transcription_sessions", {
          body,
          ...options,
          headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options?.headers])
        });
      }
    };
  }
});

// node_modules/openai/resources/beta/realtime/realtime.mjs
var Realtime;
var init_realtime = __esm({
  "node_modules/openai/resources/beta/realtime/realtime.mjs"() {
    init_resource();
    init_sessions();
    init_sessions();
    init_transcription_sessions();
    init_transcription_sessions();
    Realtime = class extends APIResource {
      constructor() {
        super(...arguments);
        this.sessions = new Sessions(this._client);
        this.transcriptionSessions = new TranscriptionSessions(this._client);
      }
    };
    Realtime.Sessions = Sessions;
    Realtime.TranscriptionSessions = TranscriptionSessions;
  }
});

// node_modules/openai/resources/beta/chatkit/sessions.mjs
var Sessions2;
var init_sessions2 = __esm({
  "node_modules/openai/resources/beta/chatkit/sessions.mjs"() {
    init_resource();
    init_headers();
    init_path();
    Sessions2 = class extends APIResource {
      /**
       * Create a ChatKit session
       *
       * @example
       * ```ts
       * const chatSession =
       *   await client.beta.chatkit.sessions.create({
       *     user: 'x',
       *     workflow: { id: 'id' },
       *   });
       * ```
       */
      create(body, options) {
        return this._client.post("/chatkit/sessions", {
          body,
          ...options,
          headers: buildHeaders([{ "OpenAI-Beta": "chatkit_beta=v1" }, options?.headers])
        });
      }
      /**
       * Cancel a ChatKit session
       *
       * @example
       * ```ts
       * const chatSession =
       *   await client.beta.chatkit.sessions.cancel('cksess_123');
       * ```
       */
      cancel(sessionID, options) {
        return this._client.post(path`/chatkit/sessions/${sessionID}/cancel`, {
          ...options,
          headers: buildHeaders([{ "OpenAI-Beta": "chatkit_beta=v1" }, options?.headers])
        });
      }
    };
  }
});

// node_modules/openai/resources/beta/chatkit/threads.mjs
var Threads;
var init_threads = __esm({
  "node_modules/openai/resources/beta/chatkit/threads.mjs"() {
    init_resource();
    init_pagination();
    init_headers();
    init_path();
    Threads = class extends APIResource {
      /**
       * Retrieve a ChatKit thread
       *
       * @example
       * ```ts
       * const chatkitThread =
       *   await client.beta.chatkit.threads.retrieve('cthr_123');
       * ```
       */
      retrieve(threadID, options) {
        return this._client.get(path`/chatkit/threads/${threadID}`, {
          ...options,
          headers: buildHeaders([{ "OpenAI-Beta": "chatkit_beta=v1" }, options?.headers])
        });
      }
      /**
       * List ChatKit threads
       *
       * @example
       * ```ts
       * // Automatically fetches more pages as needed.
       * for await (const chatkitThread of client.beta.chatkit.threads.list()) {
       *   // ...
       * }
       * ```
       */
      list(query = {}, options) {
        return this._client.getAPIList("/chatkit/threads", ConversationCursorPage, {
          query,
          ...options,
          headers: buildHeaders([{ "OpenAI-Beta": "chatkit_beta=v1" }, options?.headers])
        });
      }
      /**
       * Delete a ChatKit thread
       *
       * @example
       * ```ts
       * const thread = await client.beta.chatkit.threads.delete(
       *   'cthr_123',
       * );
       * ```
       */
      delete(threadID, options) {
        return this._client.delete(path`/chatkit/threads/${threadID}`, {
          ...options,
          headers: buildHeaders([{ "OpenAI-Beta": "chatkit_beta=v1" }, options?.headers])
        });
      }
      /**
       * List ChatKit thread items
       *
       * @example
       * ```ts
       * // Automatically fetches more pages as needed.
       * for await (const thread of client.beta.chatkit.threads.listItems(
       *   'cthr_123',
       * )) {
       *   // ...
       * }
       * ```
       */
      listItems(threadID, query = {}, options) {
        return this._client.getAPIList(path`/chatkit/threads/${threadID}/items`, ConversationCursorPage, { query, ...options, headers: buildHeaders([{ "OpenAI-Beta": "chatkit_beta=v1" }, options?.headers]) });
      }
    };
  }
});

// node_modules/openai/resources/beta/chatkit/chatkit.mjs
var ChatKit;
var init_chatkit = __esm({
  "node_modules/openai/resources/beta/chatkit/chatkit.mjs"() {
    init_resource();
    init_sessions2();
    init_sessions2();
    init_threads();
    init_threads();
    ChatKit = class extends APIResource {
      constructor() {
        super(...arguments);
        this.sessions = new Sessions2(this._client);
        this.threads = new Threads(this._client);
      }
    };
    ChatKit.Sessions = Sessions2;
    ChatKit.Threads = Threads;
  }
});

// node_modules/openai/resources/beta/threads/messages.mjs
var Messages2;
var init_messages2 = __esm({
  "node_modules/openai/resources/beta/threads/messages.mjs"() {
    init_resource();
    init_pagination();
    init_headers();
    init_path();
    Messages2 = class extends APIResource {
      /**
       * Create a message.
       *
       * @deprecated The Assistants API is deprecated in favor of the Responses API
       */
      create(threadID, body, options) {
        return this._client.post(path`/threads/${threadID}/messages`, {
          body,
          ...options,
          headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options?.headers])
        });
      }
      /**
       * Retrieve a message.
       *
       * @deprecated The Assistants API is deprecated in favor of the Responses API
       */
      retrieve(messageID, params, options) {
        const { thread_id } = params;
        return this._client.get(path`/threads/${thread_id}/messages/${messageID}`, {
          ...options,
          headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options?.headers])
        });
      }
      /**
       * Modifies a message.
       *
       * @deprecated The Assistants API is deprecated in favor of the Responses API
       */
      update(messageID, params, options) {
        const { thread_id, ...body } = params;
        return this._client.post(path`/threads/${thread_id}/messages/${messageID}`, {
          body,
          ...options,
          headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options?.headers])
        });
      }
      /**
       * Returns a list of messages for a given thread.
       *
       * @deprecated The Assistants API is deprecated in favor of the Responses API
       */
      list(threadID, query = {}, options) {
        return this._client.getAPIList(path`/threads/${threadID}/messages`, CursorPage, {
          query,
          ...options,
          headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options?.headers])
        });
      }
      /**
       * Deletes a message.
       *
       * @deprecated The Assistants API is deprecated in favor of the Responses API
       */
      delete(messageID, params, options) {
        const { thread_id } = params;
        return this._client.delete(path`/threads/${thread_id}/messages/${messageID}`, {
          ...options,
          headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options?.headers])
        });
      }
    };
  }
});

// node_modules/openai/resources/beta/threads/runs/steps.mjs
var Steps;
var init_steps = __esm({
  "node_modules/openai/resources/beta/threads/runs/steps.mjs"() {
    init_resource();
    init_pagination();
    init_headers();
    init_path();
    Steps = class extends APIResource {
      /**
       * Retrieves a run step.
       *
       * @deprecated The Assistants API is deprecated in favor of the Responses API
       */
      retrieve(stepID, params, options) {
        const { thread_id, run_id, ...query } = params;
        return this._client.get(path`/threads/${thread_id}/runs/${run_id}/steps/${stepID}`, {
          query,
          ...options,
          headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options?.headers])
        });
      }
      /**
       * Returns a list of run steps belonging to a run.
       *
       * @deprecated The Assistants API is deprecated in favor of the Responses API
       */
      list(runID, params, options) {
        const { thread_id, ...query } = params;
        return this._client.getAPIList(path`/threads/${thread_id}/runs/${runID}/steps`, CursorPage, {
          query,
          ...options,
          headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options?.headers])
        });
      }
    };
  }
});

// node_modules/openai/internal/utils/base64.mjs
var toFloat32Array;
var init_base64 = __esm({
  "node_modules/openai/internal/utils/base64.mjs"() {
    init_error();
    init_bytes();
    toFloat32Array = (base64Str) => {
      if (typeof Buffer !== "undefined") {
        const buf = Buffer.from(base64Str, "base64");
        return Array.from(new Float32Array(buf.buffer, buf.byteOffset, buf.length / Float32Array.BYTES_PER_ELEMENT));
      } else {
        const binaryStr = atob(base64Str);
        const len = binaryStr.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryStr.charCodeAt(i);
        }
        return Array.from(new Float32Array(bytes.buffer));
      }
    };
  }
});

// node_modules/openai/internal/utils/env.mjs
var readEnv;
var init_env = __esm({
  "node_modules/openai/internal/utils/env.mjs"() {
    readEnv = (env) => {
      if (typeof globalThis.process !== "undefined") {
        return globalThis.process.env?.[env]?.trim() ?? void 0;
      }
      if (typeof globalThis.Deno !== "undefined") {
        return globalThis.Deno.env?.get?.(env)?.trim();
      }
      return void 0;
    };
  }
});

// node_modules/openai/internal/utils.mjs
var init_utils2 = __esm({
  "node_modules/openai/internal/utils.mjs"() {
    init_values();
    init_base64();
    init_env();
    init_log();
    init_uuid();
    init_sleep();
  }
});

// node_modules/openai/lib/AssistantStream.mjs
function assertNever2(_x) {
}
var _AssistantStream_instances, _a, _AssistantStream_events, _AssistantStream_runStepSnapshots, _AssistantStream_messageSnapshots, _AssistantStream_messageSnapshot, _AssistantStream_finalRun, _AssistantStream_currentContentIndex, _AssistantStream_currentContent, _AssistantStream_currentToolCallIndex, _AssistantStream_currentToolCall, _AssistantStream_currentEvent, _AssistantStream_currentRunSnapshot, _AssistantStream_currentRunStepSnapshot, _AssistantStream_addEvent, _AssistantStream_endRequest, _AssistantStream_handleMessage, _AssistantStream_handleRunStep, _AssistantStream_handleEvent, _AssistantStream_accumulateRunStep, _AssistantStream_accumulateMessage, _AssistantStream_accumulateContent, _AssistantStream_handleRun, AssistantStream;
var init_AssistantStream = __esm({
  "node_modules/openai/lib/AssistantStream.mjs"() {
    init_tslib();
    init_streaming2();
    init_error2();
    init_EventStream();
    init_utils2();
    AssistantStream = class extends EventStream {
      constructor() {
        super(...arguments);
        _AssistantStream_instances.add(this);
        _AssistantStream_events.set(this, []);
        _AssistantStream_runStepSnapshots.set(this, {});
        _AssistantStream_messageSnapshots.set(this, {});
        _AssistantStream_messageSnapshot.set(this, void 0);
        _AssistantStream_finalRun.set(this, void 0);
        _AssistantStream_currentContentIndex.set(this, void 0);
        _AssistantStream_currentContent.set(this, void 0);
        _AssistantStream_currentToolCallIndex.set(this, void 0);
        _AssistantStream_currentToolCall.set(this, void 0);
        _AssistantStream_currentEvent.set(this, void 0);
        _AssistantStream_currentRunSnapshot.set(this, void 0);
        _AssistantStream_currentRunStepSnapshot.set(this, void 0);
      }
      [(_AssistantStream_events = /* @__PURE__ */ new WeakMap(), _AssistantStream_runStepSnapshots = /* @__PURE__ */ new WeakMap(), _AssistantStream_messageSnapshots = /* @__PURE__ */ new WeakMap(), _AssistantStream_messageSnapshot = /* @__PURE__ */ new WeakMap(), _AssistantStream_finalRun = /* @__PURE__ */ new WeakMap(), _AssistantStream_currentContentIndex = /* @__PURE__ */ new WeakMap(), _AssistantStream_currentContent = /* @__PURE__ */ new WeakMap(), _AssistantStream_currentToolCallIndex = /* @__PURE__ */ new WeakMap(), _AssistantStream_currentToolCall = /* @__PURE__ */ new WeakMap(), _AssistantStream_currentEvent = /* @__PURE__ */ new WeakMap(), _AssistantStream_currentRunSnapshot = /* @__PURE__ */ new WeakMap(), _AssistantStream_currentRunStepSnapshot = /* @__PURE__ */ new WeakMap(), _AssistantStream_instances = /* @__PURE__ */ new WeakSet(), Symbol.asyncIterator)]() {
        const pushQueue = [];
        const readQueue = [];
        let done = false;
        this.on("event", (event) => {
          const reader = readQueue.shift();
          if (reader) {
            reader.resolve(event);
          } else {
            pushQueue.push(event);
          }
        });
        this.on("end", () => {
          done = true;
          for (const reader of readQueue) {
            reader.resolve(void 0);
          }
          readQueue.length = 0;
        });
        this.on("abort", (err) => {
          done = true;
          for (const reader of readQueue) {
            reader.reject(err);
          }
          readQueue.length = 0;
        });
        this.on("error", (err) => {
          done = true;
          for (const reader of readQueue) {
            reader.reject(err);
          }
          readQueue.length = 0;
        });
        return {
          next: async () => {
            if (!pushQueue.length) {
              if (done) {
                return { value: void 0, done: true };
              }
              return new Promise((resolve, reject) => readQueue.push({ resolve, reject })).then((chunk2) => chunk2 ? { value: chunk2, done: false } : { value: void 0, done: true });
            }
            const chunk = pushQueue.shift();
            return { value: chunk, done: false };
          },
          return: async () => {
            this.abort();
            return { value: void 0, done: true };
          }
        };
      }
      static fromReadableStream(stream) {
        const runner = new _a();
        runner._run(() => runner._fromReadableStream(stream));
        return runner;
      }
      async _fromReadableStream(readableStream, options) {
        const signal = options?.signal;
        if (signal) {
          if (signal.aborted)
            this.controller.abort();
          signal.addEventListener("abort", () => this.controller.abort());
        }
        this._connected();
        const stream = Stream.fromReadableStream(readableStream, this.controller);
        for await (const event of stream) {
          __classPrivateFieldGet(this, _AssistantStream_instances, "m", _AssistantStream_addEvent).call(this, event);
        }
        if (stream.controller.signal?.aborted) {
          throw new APIUserAbortError();
        }
        return this._addRun(__classPrivateFieldGet(this, _AssistantStream_instances, "m", _AssistantStream_endRequest).call(this));
      }
      toReadableStream() {
        const stream = new Stream(this[Symbol.asyncIterator].bind(this), this.controller);
        return stream.toReadableStream();
      }
      static createToolAssistantStream(runId, runs, params, options) {
        const runner = new _a();
        runner._run(() => runner._runToolAssistantStream(runId, runs, params, {
          ...options,
          headers: { ...options?.headers, "X-Stainless-Helper-Method": "stream" }
        }));
        return runner;
      }
      async _createToolAssistantStream(run, runId, params, options) {
        const signal = options?.signal;
        if (signal) {
          if (signal.aborted)
            this.controller.abort();
          signal.addEventListener("abort", () => this.controller.abort());
        }
        const body = { ...params, stream: true };
        const stream = await run.submitToolOutputs(runId, body, {
          ...options,
          signal: this.controller.signal
        });
        this._connected();
        for await (const event of stream) {
          __classPrivateFieldGet(this, _AssistantStream_instances, "m", _AssistantStream_addEvent).call(this, event);
        }
        if (stream.controller.signal?.aborted) {
          throw new APIUserAbortError();
        }
        return this._addRun(__classPrivateFieldGet(this, _AssistantStream_instances, "m", _AssistantStream_endRequest).call(this));
      }
      static createThreadAssistantStream(params, thread, options) {
        const runner = new _a();
        runner._run(() => runner._threadAssistantStream(params, thread, {
          ...options,
          headers: { ...options?.headers, "X-Stainless-Helper-Method": "stream" }
        }));
        return runner;
      }
      static createAssistantStream(threadId, runs, params, options) {
        const runner = new _a();
        runner._run(() => runner._runAssistantStream(threadId, runs, params, {
          ...options,
          headers: { ...options?.headers, "X-Stainless-Helper-Method": "stream" }
        }));
        return runner;
      }
      currentEvent() {
        return __classPrivateFieldGet(this, _AssistantStream_currentEvent, "f");
      }
      currentRun() {
        return __classPrivateFieldGet(this, _AssistantStream_currentRunSnapshot, "f");
      }
      currentMessageSnapshot() {
        return __classPrivateFieldGet(this, _AssistantStream_messageSnapshot, "f");
      }
      currentRunStepSnapshot() {
        return __classPrivateFieldGet(this, _AssistantStream_currentRunStepSnapshot, "f");
      }
      async finalRunSteps() {
        await this.done();
        return Object.values(__classPrivateFieldGet(this, _AssistantStream_runStepSnapshots, "f"));
      }
      async finalMessages() {
        await this.done();
        return Object.values(__classPrivateFieldGet(this, _AssistantStream_messageSnapshots, "f"));
      }
      async finalRun() {
        await this.done();
        if (!__classPrivateFieldGet(this, _AssistantStream_finalRun, "f"))
          throw Error("Final run was not received.");
        return __classPrivateFieldGet(this, _AssistantStream_finalRun, "f");
      }
      async _createThreadAssistantStream(thread, params, options) {
        const signal = options?.signal;
        if (signal) {
          if (signal.aborted)
            this.controller.abort();
          signal.addEventListener("abort", () => this.controller.abort());
        }
        const body = { ...params, stream: true };
        const stream = await thread.createAndRun(body, { ...options, signal: this.controller.signal });
        this._connected();
        for await (const event of stream) {
          __classPrivateFieldGet(this, _AssistantStream_instances, "m", _AssistantStream_addEvent).call(this, event);
        }
        if (stream.controller.signal?.aborted) {
          throw new APIUserAbortError();
        }
        return this._addRun(__classPrivateFieldGet(this, _AssistantStream_instances, "m", _AssistantStream_endRequest).call(this));
      }
      async _createAssistantStream(run, threadId, params, options) {
        const signal = options?.signal;
        if (signal) {
          if (signal.aborted)
            this.controller.abort();
          signal.addEventListener("abort", () => this.controller.abort());
        }
        const body = { ...params, stream: true };
        const stream = await run.create(threadId, body, { ...options, signal: this.controller.signal });
        this._connected();
        for await (const event of stream) {
          __classPrivateFieldGet(this, _AssistantStream_instances, "m", _AssistantStream_addEvent).call(this, event);
        }
        if (stream.controller.signal?.aborted) {
          throw new APIUserAbortError();
        }
        return this._addRun(__classPrivateFieldGet(this, _AssistantStream_instances, "m", _AssistantStream_endRequest).call(this));
      }
      static accumulateDelta(acc, delta) {
        for (const [key, deltaValue] of Object.entries(delta)) {
          if (!acc.hasOwnProperty(key)) {
            acc[key] = deltaValue;
            continue;
          }
          let accValue = acc[key];
          if (accValue === null || accValue === void 0) {
            acc[key] = deltaValue;
            continue;
          }
          if (key === "index" || key === "type") {
            acc[key] = deltaValue;
            continue;
          }
          if (typeof accValue === "string" && typeof deltaValue === "string") {
            accValue += deltaValue;
          } else if (typeof accValue === "number" && typeof deltaValue === "number") {
            accValue += deltaValue;
          } else if (isObj(accValue) && isObj(deltaValue)) {
            accValue = this.accumulateDelta(accValue, deltaValue);
          } else if (Array.isArray(accValue) && Array.isArray(deltaValue)) {
            if (accValue.every((x) => typeof x === "string" || typeof x === "number")) {
              accValue.push(...deltaValue);
              continue;
            }
            for (const deltaEntry of deltaValue) {
              if (!isObj(deltaEntry)) {
                throw new Error(`Expected array delta entry to be an object but got: ${deltaEntry}`);
              }
              const index = deltaEntry["index"];
              if (index == null) {
                console.error(deltaEntry);
                throw new Error("Expected array delta entry to have an `index` property");
              }
              if (typeof index !== "number") {
                throw new Error(`Expected array delta entry \`index\` property to be a number but got ${index}`);
              }
              const accEntry = accValue[index];
              if (accEntry == null) {
                accValue.push(deltaEntry);
              } else {
                accValue[index] = this.accumulateDelta(accEntry, deltaEntry);
              }
            }
            continue;
          } else {
            throw Error(`Unhandled record type: ${key}, deltaValue: ${deltaValue}, accValue: ${accValue}`);
          }
          acc[key] = accValue;
        }
        return acc;
      }
      _addRun(run) {
        return run;
      }
      async _threadAssistantStream(params, thread, options) {
        return await this._createThreadAssistantStream(thread, params, options);
      }
      async _runAssistantStream(threadId, runs, params, options) {
        return await this._createAssistantStream(runs, threadId, params, options);
      }
      async _runToolAssistantStream(runId, runs, params, options) {
        return await this._createToolAssistantStream(runs, runId, params, options);
      }
    };
    _a = AssistantStream, _AssistantStream_addEvent = function _AssistantStream_addEvent2(event) {
      if (this.ended)
        return;
      __classPrivateFieldSet(this, _AssistantStream_currentEvent, event, "f");
      __classPrivateFieldGet(this, _AssistantStream_instances, "m", _AssistantStream_handleEvent).call(this, event);
      switch (event.event) {
        case "thread.created":
          break;
        case "thread.run.created":
        case "thread.run.queued":
        case "thread.run.in_progress":
        case "thread.run.requires_action":
        case "thread.run.completed":
        case "thread.run.incomplete":
        case "thread.run.failed":
        case "thread.run.cancelling":
        case "thread.run.cancelled":
        case "thread.run.expired":
          __classPrivateFieldGet(this, _AssistantStream_instances, "m", _AssistantStream_handleRun).call(this, event);
          break;
        case "thread.run.step.created":
        case "thread.run.step.in_progress":
        case "thread.run.step.delta":
        case "thread.run.step.completed":
        case "thread.run.step.failed":
        case "thread.run.step.cancelled":
        case "thread.run.step.expired":
          __classPrivateFieldGet(this, _AssistantStream_instances, "m", _AssistantStream_handleRunStep).call(this, event);
          break;
        case "thread.message.created":
        case "thread.message.in_progress":
        case "thread.message.delta":
        case "thread.message.completed":
        case "thread.message.incomplete":
          __classPrivateFieldGet(this, _AssistantStream_instances, "m", _AssistantStream_handleMessage).call(this, event);
          break;
        case "error":
          throw new Error("Encountered an error event in event processing - errors should be processed earlier");
        default:
          assertNever2(event);
      }
    }, _AssistantStream_endRequest = function _AssistantStream_endRequest2() {
      if (this.ended) {
        throw new OpenAIError(`stream has ended, this shouldn't happen`);
      }
      if (!__classPrivateFieldGet(this, _AssistantStream_finalRun, "f"))
        throw Error("Final run has not been received");
      return __classPrivateFieldGet(this, _AssistantStream_finalRun, "f");
    }, _AssistantStream_handleMessage = function _AssistantStream_handleMessage2(event) {
      const [accumulatedMessage, newContent] = __classPrivateFieldGet(this, _AssistantStream_instances, "m", _AssistantStream_accumulateMessage).call(this, event, __classPrivateFieldGet(this, _AssistantStream_messageSnapshot, "f"));
      __classPrivateFieldSet(this, _AssistantStream_messageSnapshot, accumulatedMessage, "f");
      __classPrivateFieldGet(this, _AssistantStream_messageSnapshots, "f")[accumulatedMessage.id] = accumulatedMessage;
      for (const content of newContent) {
        const snapshotContent = accumulatedMessage.content[content.index];
        if (snapshotContent?.type == "text") {
          this._emit("textCreated", snapshotContent.text);
        }
      }
      switch (event.event) {
        case "thread.message.created":
          this._emit("messageCreated", event.data);
          break;
        case "thread.message.in_progress":
          break;
        case "thread.message.delta":
          this._emit("messageDelta", event.data.delta, accumulatedMessage);
          if (event.data.delta.content) {
            for (const content of event.data.delta.content) {
              if (content.type == "text" && content.text) {
                let textDelta = content.text;
                let snapshot = accumulatedMessage.content[content.index];
                if (snapshot && snapshot.type == "text") {
                  this._emit("textDelta", textDelta, snapshot.text);
                } else {
                  throw Error("The snapshot associated with this text delta is not text or missing");
                }
              }
              if (content.index != __classPrivateFieldGet(this, _AssistantStream_currentContentIndex, "f")) {
                if (__classPrivateFieldGet(this, _AssistantStream_currentContent, "f")) {
                  switch (__classPrivateFieldGet(this, _AssistantStream_currentContent, "f").type) {
                    case "text":
                      this._emit("textDone", __classPrivateFieldGet(this, _AssistantStream_currentContent, "f").text, __classPrivateFieldGet(this, _AssistantStream_messageSnapshot, "f"));
                      break;
                    case "image_file":
                      this._emit("imageFileDone", __classPrivateFieldGet(this, _AssistantStream_currentContent, "f").image_file, __classPrivateFieldGet(this, _AssistantStream_messageSnapshot, "f"));
                      break;
                  }
                }
                __classPrivateFieldSet(this, _AssistantStream_currentContentIndex, content.index, "f");
              }
              __classPrivateFieldSet(this, _AssistantStream_currentContent, accumulatedMessage.content[content.index], "f");
            }
          }
          break;
        case "thread.message.completed":
        case "thread.message.incomplete":
          if (__classPrivateFieldGet(this, _AssistantStream_currentContentIndex, "f") !== void 0) {
            const currentContent = event.data.content[__classPrivateFieldGet(this, _AssistantStream_currentContentIndex, "f")];
            if (currentContent) {
              switch (currentContent.type) {
                case "image_file":
                  this._emit("imageFileDone", currentContent.image_file, __classPrivateFieldGet(this, _AssistantStream_messageSnapshot, "f"));
                  break;
                case "text":
                  this._emit("textDone", currentContent.text, __classPrivateFieldGet(this, _AssistantStream_messageSnapshot, "f"));
                  break;
              }
            }
          }
          if (__classPrivateFieldGet(this, _AssistantStream_messageSnapshot, "f")) {
            this._emit("messageDone", event.data);
          }
          __classPrivateFieldSet(this, _AssistantStream_messageSnapshot, void 0, "f");
      }
    }, _AssistantStream_handleRunStep = function _AssistantStream_handleRunStep2(event) {
      const accumulatedRunStep = __classPrivateFieldGet(this, _AssistantStream_instances, "m", _AssistantStream_accumulateRunStep).call(this, event);
      __classPrivateFieldSet(this, _AssistantStream_currentRunStepSnapshot, accumulatedRunStep, "f");
      switch (event.event) {
        case "thread.run.step.created":
          this._emit("runStepCreated", event.data);
          break;
        case "thread.run.step.delta":
          const delta = event.data.delta;
          if (delta.step_details && delta.step_details.type == "tool_calls" && delta.step_details.tool_calls && accumulatedRunStep.step_details.type == "tool_calls") {
            for (const toolCall of delta.step_details.tool_calls) {
              if (toolCall.index == __classPrivateFieldGet(this, _AssistantStream_currentToolCallIndex, "f")) {
                this._emit("toolCallDelta", toolCall, accumulatedRunStep.step_details.tool_calls[toolCall.index]);
              } else {
                if (__classPrivateFieldGet(this, _AssistantStream_currentToolCall, "f")) {
                  this._emit("toolCallDone", __classPrivateFieldGet(this, _AssistantStream_currentToolCall, "f"));
                }
                __classPrivateFieldSet(this, _AssistantStream_currentToolCallIndex, toolCall.index, "f");
                __classPrivateFieldSet(this, _AssistantStream_currentToolCall, accumulatedRunStep.step_details.tool_calls[toolCall.index], "f");
                if (__classPrivateFieldGet(this, _AssistantStream_currentToolCall, "f"))
                  this._emit("toolCallCreated", __classPrivateFieldGet(this, _AssistantStream_currentToolCall, "f"));
              }
            }
          }
          this._emit("runStepDelta", event.data.delta, accumulatedRunStep);
          break;
        case "thread.run.step.completed":
        case "thread.run.step.failed":
        case "thread.run.step.cancelled":
        case "thread.run.step.expired":
          __classPrivateFieldSet(this, _AssistantStream_currentRunStepSnapshot, void 0, "f");
          const details = event.data.step_details;
          if (details.type == "tool_calls") {
            if (__classPrivateFieldGet(this, _AssistantStream_currentToolCall, "f")) {
              this._emit("toolCallDone", __classPrivateFieldGet(this, _AssistantStream_currentToolCall, "f"));
              __classPrivateFieldSet(this, _AssistantStream_currentToolCall, void 0, "f");
            }
          }
          this._emit("runStepDone", event.data, accumulatedRunStep);
          break;
        case "thread.run.step.in_progress":
          break;
      }
    }, _AssistantStream_handleEvent = function _AssistantStream_handleEvent2(event) {
      __classPrivateFieldGet(this, _AssistantStream_events, "f").push(event);
      this._emit("event", event);
    }, _AssistantStream_accumulateRunStep = function _AssistantStream_accumulateRunStep2(event) {
      switch (event.event) {
        case "thread.run.step.created":
          __classPrivateFieldGet(this, _AssistantStream_runStepSnapshots, "f")[event.data.id] = event.data;
          return event.data;
        case "thread.run.step.delta":
          let snapshot = __classPrivateFieldGet(this, _AssistantStream_runStepSnapshots, "f")[event.data.id];
          if (!snapshot) {
            throw Error("Received a RunStepDelta before creation of a snapshot");
          }
          let data = event.data;
          if (data.delta) {
            const accumulated = _a.accumulateDelta(snapshot, data.delta);
            __classPrivateFieldGet(this, _AssistantStream_runStepSnapshots, "f")[event.data.id] = accumulated;
          }
          return __classPrivateFieldGet(this, _AssistantStream_runStepSnapshots, "f")[event.data.id];
        case "thread.run.step.completed":
        case "thread.run.step.failed":
        case "thread.run.step.cancelled":
        case "thread.run.step.expired":
        case "thread.run.step.in_progress":
          __classPrivateFieldGet(this, _AssistantStream_runStepSnapshots, "f")[event.data.id] = event.data;
          break;
      }
      if (__classPrivateFieldGet(this, _AssistantStream_runStepSnapshots, "f")[event.data.id])
        return __classPrivateFieldGet(this, _AssistantStream_runStepSnapshots, "f")[event.data.id];
      throw new Error("No snapshot available");
    }, _AssistantStream_accumulateMessage = function _AssistantStream_accumulateMessage2(event, snapshot) {
      let newContent = [];
      switch (event.event) {
        case "thread.message.created":
          return [event.data, newContent];
        case "thread.message.delta":
          if (!snapshot) {
            throw Error("Received a delta with no existing snapshot (there should be one from message creation)");
          }
          let data = event.data;
          if (data.delta.content) {
            for (const contentElement of data.delta.content) {
              if (contentElement.index in snapshot.content) {
                let currentContent = snapshot.content[contentElement.index];
                snapshot.content[contentElement.index] = __classPrivateFieldGet(this, _AssistantStream_instances, "m", _AssistantStream_accumulateContent).call(this, contentElement, currentContent);
              } else {
                snapshot.content[contentElement.index] = contentElement;
                newContent.push(contentElement);
              }
            }
          }
          return [snapshot, newContent];
        case "thread.message.in_progress":
        case "thread.message.completed":
        case "thread.message.incomplete":
          if (snapshot) {
            return [snapshot, newContent];
          } else {
            throw Error("Received thread message event with no existing snapshot");
          }
      }
      throw Error("Tried to accumulate a non-message event");
    }, _AssistantStream_accumulateContent = function _AssistantStream_accumulateContent2(contentElement, currentContent) {
      return _a.accumulateDelta(currentContent, contentElement);
    }, _AssistantStream_handleRun = function _AssistantStream_handleRun2(event) {
      __classPrivateFieldSet(this, _AssistantStream_currentRunSnapshot, event.data, "f");
      switch (event.event) {
        case "thread.run.created":
          break;
        case "thread.run.queued":
          break;
        case "thread.run.in_progress":
          break;
        case "thread.run.requires_action":
        case "thread.run.cancelled":
        case "thread.run.failed":
        case "thread.run.completed":
        case "thread.run.expired":
        case "thread.run.incomplete":
          __classPrivateFieldSet(this, _AssistantStream_finalRun, event.data, "f");
          if (__classPrivateFieldGet(this, _AssistantStream_currentToolCall, "f")) {
            this._emit("toolCallDone", __classPrivateFieldGet(this, _AssistantStream_currentToolCall, "f"));
            __classPrivateFieldSet(this, _AssistantStream_currentToolCall, void 0, "f");
          }
          break;
        case "thread.run.cancelling":
          break;
      }
    };
  }
});

// node_modules/openai/resources/beta/threads/runs/runs.mjs
var Runs;
var init_runs = __esm({
  "node_modules/openai/resources/beta/threads/runs/runs.mjs"() {
    init_resource();
    init_steps();
    init_steps();
    init_pagination();
    init_headers();
    init_AssistantStream();
    init_sleep();
    init_path();
    Runs = class extends APIResource {
      constructor() {
        super(...arguments);
        this.steps = new Steps(this._client);
      }
      create(threadID, params, options) {
        const { include, ...body } = params;
        return this._client.post(path`/threads/${threadID}/runs`, {
          query: { include },
          body,
          ...options,
          headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options?.headers]),
          stream: params.stream ?? false
        });
      }
      /**
       * Retrieves a run.
       *
       * @deprecated The Assistants API is deprecated in favor of the Responses API
       */
      retrieve(runID, params, options) {
        const { thread_id } = params;
        return this._client.get(path`/threads/${thread_id}/runs/${runID}`, {
          ...options,
          headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options?.headers])
        });
      }
      /**
       * Modifies a run.
       *
       * @deprecated The Assistants API is deprecated in favor of the Responses API
       */
      update(runID, params, options) {
        const { thread_id, ...body } = params;
        return this._client.post(path`/threads/${thread_id}/runs/${runID}`, {
          body,
          ...options,
          headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options?.headers])
        });
      }
      /**
       * Returns a list of runs belonging to a thread.
       *
       * @deprecated The Assistants API is deprecated in favor of the Responses API
       */
      list(threadID, query = {}, options) {
        return this._client.getAPIList(path`/threads/${threadID}/runs`, CursorPage, {
          query,
          ...options,
          headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options?.headers])
        });
      }
      /**
       * Cancels a run that is `in_progress`.
       *
       * @deprecated The Assistants API is deprecated in favor of the Responses API
       */
      cancel(runID, params, options) {
        const { thread_id } = params;
        return this._client.post(path`/threads/${thread_id}/runs/${runID}/cancel`, {
          ...options,
          headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options?.headers])
        });
      }
      /**
       * A helper to create a run an poll for a terminal state. More information on Run
       * lifecycles can be found here:
       * https://platform.openai.com/docs/assistants/how-it-works/runs-and-run-steps
       */
      async createAndPoll(threadId, body, options) {
        const run = await this.create(threadId, body, options);
        return await this.poll(run.id, { thread_id: threadId }, options);
      }
      /**
       * Create a Run stream
       *
       * @deprecated use `stream` instead
       */
      createAndStream(threadId, body, options) {
        return AssistantStream.createAssistantStream(threadId, this._client.beta.threads.runs, body, options);
      }
      /**
       * A helper to poll a run status until it reaches a terminal state. More
       * information on Run lifecycles can be found here:
       * https://platform.openai.com/docs/assistants/how-it-works/runs-and-run-steps
       */
      async poll(runId, params, options) {
        const headers = buildHeaders([
          options?.headers,
          {
            "X-Stainless-Poll-Helper": "true",
            "X-Stainless-Custom-Poll-Interval": options?.pollIntervalMs?.toString() ?? void 0
          }
        ]);
        while (true) {
          const { data: run, response } = await this.retrieve(runId, params, {
            ...options,
            headers: { ...options?.headers, ...headers }
          }).withResponse();
          switch (run.status) {
            //If we are in any sort of intermediate state we poll
            case "queued":
            case "in_progress":
            case "cancelling":
              let sleepInterval = 5e3;
              if (options?.pollIntervalMs) {
                sleepInterval = options.pollIntervalMs;
              } else {
                const headerInterval = response.headers.get("openai-poll-after-ms");
                if (headerInterval) {
                  const headerIntervalMs = parseInt(headerInterval);
                  if (!isNaN(headerIntervalMs)) {
                    sleepInterval = headerIntervalMs;
                  }
                }
              }
              await sleep(sleepInterval);
              break;
            //We return the run in any terminal state.
            case "requires_action":
            case "incomplete":
            case "cancelled":
            case "completed":
            case "failed":
            case "expired":
              return run;
          }
        }
      }
      /**
       * Create a Run stream
       */
      stream(threadId, body, options) {
        return AssistantStream.createAssistantStream(threadId, this._client.beta.threads.runs, body, options);
      }
      submitToolOutputs(runID, params, options) {
        const { thread_id, ...body } = params;
        return this._client.post(path`/threads/${thread_id}/runs/${runID}/submit_tool_outputs`, {
          body,
          ...options,
          headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options?.headers]),
          stream: params.stream ?? false
        });
      }
      /**
       * A helper to submit a tool output to a run and poll for a terminal run state.
       * More information on Run lifecycles can be found here:
       * https://platform.openai.com/docs/assistants/how-it-works/runs-and-run-steps
       */
      async submitToolOutputsAndPoll(runId, params, options) {
        const run = await this.submitToolOutputs(runId, params, options);
        return await this.poll(run.id, params, options);
      }
      /**
       * Submit the tool outputs from a previous run and stream the run to a terminal
       * state. More information on Run lifecycles can be found here:
       * https://platform.openai.com/docs/assistants/how-it-works/runs-and-run-steps
       */
      submitToolOutputsStream(runId, params, options) {
        return AssistantStream.createToolAssistantStream(runId, this._client.beta.threads.runs, params, options);
      }
    };
    Runs.Steps = Steps;
  }
});

// node_modules/openai/resources/beta/threads/threads.mjs
var Threads2;
var init_threads2 = __esm({
  "node_modules/openai/resources/beta/threads/threads.mjs"() {
    init_resource();
    init_messages2();
    init_messages2();
    init_runs();
    init_runs();
    init_headers();
    init_AssistantStream();
    init_path();
    Threads2 = class extends APIResource {
      constructor() {
        super(...arguments);
        this.runs = new Runs(this._client);
        this.messages = new Messages2(this._client);
      }
      /**
       * Create a thread.
       *
       * @deprecated The Assistants API is deprecated in favor of the Responses API
       */
      create(body = {}, options) {
        return this._client.post("/threads", {
          body,
          ...options,
          headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options?.headers])
        });
      }
      /**
       * Retrieves a thread.
       *
       * @deprecated The Assistants API is deprecated in favor of the Responses API
       */
      retrieve(threadID, options) {
        return this._client.get(path`/threads/${threadID}`, {
          ...options,
          headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options?.headers])
        });
      }
      /**
       * Modifies a thread.
       *
       * @deprecated The Assistants API is deprecated in favor of the Responses API
       */
      update(threadID, body, options) {
        return this._client.post(path`/threads/${threadID}`, {
          body,
          ...options,
          headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options?.headers])
        });
      }
      /**
       * Delete a thread.
       *
       * @deprecated The Assistants API is deprecated in favor of the Responses API
       */
      delete(threadID, options) {
        return this._client.delete(path`/threads/${threadID}`, {
          ...options,
          headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options?.headers])
        });
      }
      createAndRun(body, options) {
        return this._client.post("/threads/runs", {
          body,
          ...options,
          headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options?.headers]),
          stream: body.stream ?? false
        });
      }
      /**
       * A helper to create a thread, start a run and then poll for a terminal state.
       * More information on Run lifecycles can be found here:
       * https://platform.openai.com/docs/assistants/how-it-works/runs-and-run-steps
       */
      async createAndRunPoll(body, options) {
        const run = await this.createAndRun(body, options);
        return await this.runs.poll(run.id, { thread_id: run.thread_id }, options);
      }
      /**
       * Create a thread and stream the run back
       */
      createAndRunStream(body, options) {
        return AssistantStream.createThreadAssistantStream(body, this._client.beta.threads, options);
      }
    };
    Threads2.Runs = Runs;
    Threads2.Messages = Messages2;
  }
});

// node_modules/openai/resources/beta/beta.mjs
var Beta;
var init_beta = __esm({
  "node_modules/openai/resources/beta/beta.mjs"() {
    init_resource();
    init_assistants();
    init_assistants();
    init_realtime();
    init_realtime();
    init_chatkit();
    init_chatkit();
    init_threads2();
    init_threads2();
    Beta = class extends APIResource {
      constructor() {
        super(...arguments);
        this.realtime = new Realtime(this._client);
        this.chatkit = new ChatKit(this._client);
        this.assistants = new Assistants(this._client);
        this.threads = new Threads2(this._client);
      }
    };
    Beta.Realtime = Realtime;
    Beta.ChatKit = ChatKit;
    Beta.Assistants = Assistants;
    Beta.Threads = Threads2;
  }
});

// node_modules/openai/resources/completions.mjs
var Completions2;
var init_completions3 = __esm({
  "node_modules/openai/resources/completions.mjs"() {
    init_resource();
    Completions2 = class extends APIResource {
      create(body, options) {
        return this._client.post("/completions", { body, ...options, stream: body.stream ?? false });
      }
    };
  }
});

// node_modules/openai/resources/containers/files/content.mjs
var Content;
var init_content = __esm({
  "node_modules/openai/resources/containers/files/content.mjs"() {
    init_resource();
    init_headers();
    init_path();
    Content = class extends APIResource {
      /**
       * Retrieve Container File Content
       */
      retrieve(fileID, params, options) {
        const { container_id } = params;
        return this._client.get(path`/containers/${container_id}/files/${fileID}/content`, {
          ...options,
          headers: buildHeaders([{ Accept: "application/binary" }, options?.headers]),
          __binaryResponse: true
        });
      }
    };
  }
});

// node_modules/openai/resources/containers/files/files.mjs
var Files;
var init_files = __esm({
  "node_modules/openai/resources/containers/files/files.mjs"() {
    init_resource();
    init_content();
    init_content();
    init_pagination();
    init_headers();
    init_uploads();
    init_path();
    Files = class extends APIResource {
      constructor() {
        super(...arguments);
        this.content = new Content(this._client);
      }
      /**
       * Create a Container File
       *
       * You can send either a multipart/form-data request with the raw file content, or
       * a JSON request with a file ID.
       */
      create(containerID, body, options) {
        return this._client.post(path`/containers/${containerID}/files`, multipartFormRequestOptions({ body, ...options }, this._client));
      }
      /**
       * Retrieve Container File
       */
      retrieve(fileID, params, options) {
        const { container_id } = params;
        return this._client.get(path`/containers/${container_id}/files/${fileID}`, options);
      }
      /**
       * List Container files
       */
      list(containerID, query = {}, options) {
        return this._client.getAPIList(path`/containers/${containerID}/files`, CursorPage, {
          query,
          ...options
        });
      }
      /**
       * Delete Container File
       */
      delete(fileID, params, options) {
        const { container_id } = params;
        return this._client.delete(path`/containers/${container_id}/files/${fileID}`, {
          ...options,
          headers: buildHeaders([{ Accept: "*/*" }, options?.headers])
        });
      }
    };
    Files.Content = Content;
  }
});

// node_modules/openai/resources/containers/containers.mjs
var Containers;
var init_containers = __esm({
  "node_modules/openai/resources/containers/containers.mjs"() {
    init_resource();
    init_files();
    init_files();
    init_pagination();
    init_headers();
    init_path();
    Containers = class extends APIResource {
      constructor() {
        super(...arguments);
        this.files = new Files(this._client);
      }
      /**
       * Create Container
       */
      create(body, options) {
        return this._client.post("/containers", { body, ...options });
      }
      /**
       * Retrieve Container
       */
      retrieve(containerID, options) {
        return this._client.get(path`/containers/${containerID}`, options);
      }
      /**
       * List Containers
       */
      list(query = {}, options) {
        return this._client.getAPIList("/containers", CursorPage, { query, ...options });
      }
      /**
       * Delete Container
       */
      delete(containerID, options) {
        return this._client.delete(path`/containers/${containerID}`, {
          ...options,
          headers: buildHeaders([{ Accept: "*/*" }, options?.headers])
        });
      }
    };
    Containers.Files = Files;
  }
});

// node_modules/openai/resources/conversations/items.mjs
var Items;
var init_items = __esm({
  "node_modules/openai/resources/conversations/items.mjs"() {
    init_resource();
    init_pagination();
    init_path();
    Items = class extends APIResource {
      /**
       * Create items in a conversation with the given ID.
       */
      create(conversationID, params, options) {
        const { include, ...body } = params;
        return this._client.post(path`/conversations/${conversationID}/items`, {
          query: { include },
          body,
          ...options
        });
      }
      /**
       * Get a single item from a conversation with the given IDs.
       */
      retrieve(itemID, params, options) {
        const { conversation_id, ...query } = params;
        return this._client.get(path`/conversations/${conversation_id}/items/${itemID}`, { query, ...options });
      }
      /**
       * List all items for a conversation with the given ID.
       */
      list(conversationID, query = {}, options) {
        return this._client.getAPIList(path`/conversations/${conversationID}/items`, ConversationCursorPage, { query, ...options });
      }
      /**
       * Delete an item from a conversation with the given IDs.
       */
      delete(itemID, params, options) {
        const { conversation_id } = params;
        return this._client.delete(path`/conversations/${conversation_id}/items/${itemID}`, options);
      }
    };
  }
});

// node_modules/openai/resources/conversations/conversations.mjs
var Conversations;
var init_conversations = __esm({
  "node_modules/openai/resources/conversations/conversations.mjs"() {
    init_resource();
    init_items();
    init_items();
    init_path();
    Conversations = class extends APIResource {
      constructor() {
        super(...arguments);
        this.items = new Items(this._client);
      }
      /**
       * Create a conversation.
       */
      create(body = {}, options) {
        return this._client.post("/conversations", { body, ...options });
      }
      /**
       * Get a conversation
       */
      retrieve(conversationID, options) {
        return this._client.get(path`/conversations/${conversationID}`, options);
      }
      /**
       * Update a conversation
       */
      update(conversationID, body, options) {
        return this._client.post(path`/conversations/${conversationID}`, { body, ...options });
      }
      /**
       * Delete a conversation. Items in the conversation will not be deleted.
       */
      delete(conversationID, options) {
        return this._client.delete(path`/conversations/${conversationID}`, options);
      }
    };
    Conversations.Items = Items;
  }
});

// node_modules/openai/resources/embeddings.mjs
var Embeddings;
var init_embeddings = __esm({
  "node_modules/openai/resources/embeddings.mjs"() {
    init_resource();
    init_utils2();
    Embeddings = class extends APIResource {
      /**
       * Creates an embedding vector representing the input text.
       *
       * @example
       * ```ts
       * const createEmbeddingResponse =
       *   await client.embeddings.create({
       *     input: 'The quick brown fox jumped over the lazy dog',
       *     model: 'text-embedding-3-small',
       *   });
       * ```
       */
      create(body, options) {
        const hasUserProvidedEncodingFormat = !!body.encoding_format;
        let encoding_format = hasUserProvidedEncodingFormat ? body.encoding_format : "base64";
        if (hasUserProvidedEncodingFormat) {
          loggerFor(this._client).debug("embeddings/user defined encoding_format:", body.encoding_format);
        }
        const response = this._client.post("/embeddings", {
          body: {
            ...body,
            encoding_format
          },
          ...options
        });
        if (hasUserProvidedEncodingFormat) {
          return response;
        }
        loggerFor(this._client).debug("embeddings/decoding base64 embeddings from base64");
        return response._thenUnwrap((response2) => {
          if (response2 && response2.data) {
            response2.data.forEach((embeddingBase64Obj) => {
              const embeddingBase64Str = embeddingBase64Obj.embedding;
              embeddingBase64Obj.embedding = toFloat32Array(embeddingBase64Str);
            });
          }
          return response2;
        });
      }
    };
  }
});

// node_modules/openai/resources/evals/runs/output-items.mjs
var OutputItems;
var init_output_items = __esm({
  "node_modules/openai/resources/evals/runs/output-items.mjs"() {
    init_resource();
    init_pagination();
    init_path();
    OutputItems = class extends APIResource {
      /**
       * Get an evaluation run output item by ID.
       */
      retrieve(outputItemID, params, options) {
        const { eval_id, run_id } = params;
        return this._client.get(path`/evals/${eval_id}/runs/${run_id}/output_items/${outputItemID}`, options);
      }
      /**
       * Get a list of output items for an evaluation run.
       */
      list(runID, params, options) {
        const { eval_id, ...query } = params;
        return this._client.getAPIList(path`/evals/${eval_id}/runs/${runID}/output_items`, CursorPage, { query, ...options });
      }
    };
  }
});

// node_modules/openai/resources/evals/runs/runs.mjs
var Runs2;
var init_runs2 = __esm({
  "node_modules/openai/resources/evals/runs/runs.mjs"() {
    init_resource();
    init_output_items();
    init_output_items();
    init_pagination();
    init_path();
    Runs2 = class extends APIResource {
      constructor() {
        super(...arguments);
        this.outputItems = new OutputItems(this._client);
      }
      /**
       * Kicks off a new run for a given evaluation, specifying the data source, and what
       * model configuration to use to test. The datasource will be validated against the
       * schema specified in the config of the evaluation.
       */
      create(evalID, body, options) {
        return this._client.post(path`/evals/${evalID}/runs`, { body, ...options });
      }
      /**
       * Get an evaluation run by ID.
       */
      retrieve(runID, params, options) {
        const { eval_id } = params;
        return this._client.get(path`/evals/${eval_id}/runs/${runID}`, options);
      }
      /**
       * Get a list of runs for an evaluation.
       */
      list(evalID, query = {}, options) {
        return this._client.getAPIList(path`/evals/${evalID}/runs`, CursorPage, {
          query,
          ...options
        });
      }
      /**
       * Delete an eval run.
       */
      delete(runID, params, options) {
        const { eval_id } = params;
        return this._client.delete(path`/evals/${eval_id}/runs/${runID}`, options);
      }
      /**
       * Cancel an ongoing evaluation run.
       */
      cancel(runID, params, options) {
        const { eval_id } = params;
        return this._client.post(path`/evals/${eval_id}/runs/${runID}`, options);
      }
    };
    Runs2.OutputItems = OutputItems;
  }
});

// node_modules/openai/resources/evals/evals.mjs
var Evals;
var init_evals = __esm({
  "node_modules/openai/resources/evals/evals.mjs"() {
    init_resource();
    init_runs2();
    init_runs2();
    init_pagination();
    init_path();
    Evals = class extends APIResource {
      constructor() {
        super(...arguments);
        this.runs = new Runs2(this._client);
      }
      /**
       * Create the structure of an evaluation that can be used to test a model's
       * performance. An evaluation is a set of testing criteria and the config for a
       * data source, which dictates the schema of the data used in the evaluation. After
       * creating an evaluation, you can run it on different models and model parameters.
       * We support several types of graders and datasources. For more information, see
       * the [Evals guide](https://platform.openai.com/docs/guides/evals).
       */
      create(body, options) {
        return this._client.post("/evals", { body, ...options });
      }
      /**
       * Get an evaluation by ID.
       */
      retrieve(evalID, options) {
        return this._client.get(path`/evals/${evalID}`, options);
      }
      /**
       * Update certain properties of an evaluation.
       */
      update(evalID, body, options) {
        return this._client.post(path`/evals/${evalID}`, { body, ...options });
      }
      /**
       * List evaluations for a project.
       */
      list(query = {}, options) {
        return this._client.getAPIList("/evals", CursorPage, { query, ...options });
      }
      /**
       * Delete an evaluation.
       */
      delete(evalID, options) {
        return this._client.delete(path`/evals/${evalID}`, options);
      }
    };
    Evals.Runs = Runs2;
  }
});

// node_modules/openai/resources/files.mjs
var Files2;
var init_files2 = __esm({
  "node_modules/openai/resources/files.mjs"() {
    init_resource();
    init_pagination();
    init_headers();
    init_sleep();
    init_error2();
    init_uploads();
    init_path();
    Files2 = class extends APIResource {
      /**
       * Upload a file that can be used across various endpoints. Individual files can be
       * up to 512 MB, and the size of all files uploaded by one organization can be up
       * to 1 TB.
       *
       * - The Assistants API supports files up to 2 million tokens and of specific file
       *   types. See the
       *   [Assistants Tools guide](https://platform.openai.com/docs/assistants/tools)
       *   for details.
       * - The Fine-tuning API only supports `.jsonl` files. The input also has certain
       *   required formats for fine-tuning
       *   [chat](https://platform.openai.com/docs/api-reference/fine-tuning/chat-input)
       *   or
       *   [completions](https://platform.openai.com/docs/api-reference/fine-tuning/completions-input)
       *   models.
       * - The Batch API only supports `.jsonl` files up to 200 MB in size. The input
       *   also has a specific required
       *   [format](https://platform.openai.com/docs/api-reference/batch/request-input).
       *
       * Please [contact us](https://help.openai.com/) if you need to increase these
       * storage limits.
       */
      create(body, options) {
        return this._client.post("/files", multipartFormRequestOptions({ body, ...options }, this._client));
      }
      /**
       * Returns information about a specific file.
       */
      retrieve(fileID, options) {
        return this._client.get(path`/files/${fileID}`, options);
      }
      /**
       * Returns a list of files.
       */
      list(query = {}, options) {
        return this._client.getAPIList("/files", CursorPage, { query, ...options });
      }
      /**
       * Delete a file and remove it from all vector stores.
       */
      delete(fileID, options) {
        return this._client.delete(path`/files/${fileID}`, options);
      }
      /**
       * Returns the contents of the specified file.
       */
      content(fileID, options) {
        return this._client.get(path`/files/${fileID}/content`, {
          ...options,
          headers: buildHeaders([{ Accept: "application/binary" }, options?.headers]),
          __binaryResponse: true
        });
      }
      /**
       * Waits for the given file to be processed, default timeout is 30 mins.
       */
      async waitForProcessing(id, { pollInterval = 5e3, maxWait = 30 * 60 * 1e3 } = {}) {
        const TERMINAL_STATES = /* @__PURE__ */ new Set(["processed", "error", "deleted"]);
        const start = Date.now();
        let file = await this.retrieve(id);
        while (!file.status || !TERMINAL_STATES.has(file.status)) {
          await sleep(pollInterval);
          file = await this.retrieve(id);
          if (Date.now() - start > maxWait) {
            throw new APIConnectionTimeoutError({
              message: `Giving up on waiting for file ${id} to finish processing after ${maxWait} milliseconds.`
            });
          }
        }
        return file;
      }
    };
  }
});

// node_modules/openai/resources/fine-tuning/methods.mjs
var Methods;
var init_methods = __esm({
  "node_modules/openai/resources/fine-tuning/methods.mjs"() {
    init_resource();
    Methods = class extends APIResource {
    };
  }
});

// node_modules/openai/resources/fine-tuning/alpha/graders.mjs
var Graders;
var init_graders = __esm({
  "node_modules/openai/resources/fine-tuning/alpha/graders.mjs"() {
    init_resource();
    Graders = class extends APIResource {
      /**
       * Run a grader.
       *
       * @example
       * ```ts
       * const response = await client.fineTuning.alpha.graders.run({
       *   grader: {
       *     input: 'input',
       *     name: 'name',
       *     operation: 'eq',
       *     reference: 'reference',
       *     type: 'string_check',
       *   },
       *   model_sample: 'model_sample',
       * });
       * ```
       */
      run(body, options) {
        return this._client.post("/fine_tuning/alpha/graders/run", { body, ...options });
      }
      /**
       * Validate a grader.
       *
       * @example
       * ```ts
       * const response =
       *   await client.fineTuning.alpha.graders.validate({
       *     grader: {
       *       input: 'input',
       *       name: 'name',
       *       operation: 'eq',
       *       reference: 'reference',
       *       type: 'string_check',
       *     },
       *   });
       * ```
       */
      validate(body, options) {
        return this._client.post("/fine_tuning/alpha/graders/validate", { body, ...options });
      }
    };
  }
});

// node_modules/openai/resources/fine-tuning/alpha/alpha.mjs
var Alpha;
var init_alpha = __esm({
  "node_modules/openai/resources/fine-tuning/alpha/alpha.mjs"() {
    init_resource();
    init_graders();
    init_graders();
    Alpha = class extends APIResource {
      constructor() {
        super(...arguments);
        this.graders = new Graders(this._client);
      }
    };
    Alpha.Graders = Graders;
  }
});

// node_modules/openai/resources/fine-tuning/checkpoints/permissions.mjs
var Permissions;
var init_permissions = __esm({
  "node_modules/openai/resources/fine-tuning/checkpoints/permissions.mjs"() {
    init_resource();
    init_pagination();
    init_path();
    Permissions = class extends APIResource {
      /**
       * **NOTE:** Calling this endpoint requires an [admin API key](../admin-api-keys).
       *
       * This enables organization owners to share fine-tuned models with other projects
       * in their organization.
       *
       * @example
       * ```ts
       * // Automatically fetches more pages as needed.
       * for await (const permissionCreateResponse of client.fineTuning.checkpoints.permissions.create(
       *   'ft:gpt-4o-mini-2024-07-18:org:weather:B7R9VjQd',
       *   { project_ids: ['string'] },
       * )) {
       *   // ...
       * }
       * ```
       */
      create(fineTunedModelCheckpoint, body, options) {
        return this._client.getAPIList(path`/fine_tuning/checkpoints/${fineTunedModelCheckpoint}/permissions`, Page, { body, method: "post", ...options });
      }
      /**
       * **NOTE:** This endpoint requires an [admin API key](../admin-api-keys).
       *
       * Organization owners can use this endpoint to view all permissions for a
       * fine-tuned model checkpoint.
       *
       * @example
       * ```ts
       * const permission =
       *   await client.fineTuning.checkpoints.permissions.retrieve(
       *     'ft-AF1WoRqd3aJAHsqc9NY7iL8F',
       *   );
       * ```
       */
      retrieve(fineTunedModelCheckpoint, query = {}, options) {
        return this._client.get(path`/fine_tuning/checkpoints/${fineTunedModelCheckpoint}/permissions`, {
          query,
          ...options
        });
      }
      /**
       * **NOTE:** This endpoint requires an [admin API key](../admin-api-keys).
       *
       * Organization owners can use this endpoint to delete a permission for a
       * fine-tuned model checkpoint.
       *
       * @example
       * ```ts
       * const permission =
       *   await client.fineTuning.checkpoints.permissions.delete(
       *     'cp_zc4Q7MP6XxulcVzj4MZdwsAB',
       *     {
       *       fine_tuned_model_checkpoint:
       *         'ft:gpt-4o-mini-2024-07-18:org:weather:B7R9VjQd',
       *     },
       *   );
       * ```
       */
      delete(permissionID, params, options) {
        const { fine_tuned_model_checkpoint } = params;
        return this._client.delete(path`/fine_tuning/checkpoints/${fine_tuned_model_checkpoint}/permissions/${permissionID}`, options);
      }
    };
  }
});

// node_modules/openai/resources/fine-tuning/checkpoints/checkpoints.mjs
var Checkpoints;
var init_checkpoints = __esm({
  "node_modules/openai/resources/fine-tuning/checkpoints/checkpoints.mjs"() {
    init_resource();
    init_permissions();
    init_permissions();
    Checkpoints = class extends APIResource {
      constructor() {
        super(...arguments);
        this.permissions = new Permissions(this._client);
      }
    };
    Checkpoints.Permissions = Permissions;
  }
});

// node_modules/openai/resources/fine-tuning/jobs/checkpoints.mjs
var Checkpoints2;
var init_checkpoints2 = __esm({
  "node_modules/openai/resources/fine-tuning/jobs/checkpoints.mjs"() {
    init_resource();
    init_pagination();
    init_path();
    Checkpoints2 = class extends APIResource {
      /**
       * List checkpoints for a fine-tuning job.
       *
       * @example
       * ```ts
       * // Automatically fetches more pages as needed.
       * for await (const fineTuningJobCheckpoint of client.fineTuning.jobs.checkpoints.list(
       *   'ft-AF1WoRqd3aJAHsqc9NY7iL8F',
       * )) {
       *   // ...
       * }
       * ```
       */
      list(fineTuningJobID, query = {}, options) {
        return this._client.getAPIList(path`/fine_tuning/jobs/${fineTuningJobID}/checkpoints`, CursorPage, { query, ...options });
      }
    };
  }
});

// node_modules/openai/resources/fine-tuning/jobs/jobs.mjs
var Jobs;
var init_jobs = __esm({
  "node_modules/openai/resources/fine-tuning/jobs/jobs.mjs"() {
    init_resource();
    init_checkpoints2();
    init_checkpoints2();
    init_pagination();
    init_path();
    Jobs = class extends APIResource {
      constructor() {
        super(...arguments);
        this.checkpoints = new Checkpoints2(this._client);
      }
      /**
       * Creates a fine-tuning job which begins the process of creating a new model from
       * a given dataset.
       *
       * Response includes details of the enqueued job including job status and the name
       * of the fine-tuned models once complete.
       *
       * [Learn more about fine-tuning](https://platform.openai.com/docs/guides/model-optimization)
       *
       * @example
       * ```ts
       * const fineTuningJob = await client.fineTuning.jobs.create({
       *   model: 'gpt-4o-mini',
       *   training_file: 'file-abc123',
       * });
       * ```
       */
      create(body, options) {
        return this._client.post("/fine_tuning/jobs", { body, ...options });
      }
      /**
       * Get info about a fine-tuning job.
       *
       * [Learn more about fine-tuning](https://platform.openai.com/docs/guides/model-optimization)
       *
       * @example
       * ```ts
       * const fineTuningJob = await client.fineTuning.jobs.retrieve(
       *   'ft-AF1WoRqd3aJAHsqc9NY7iL8F',
       * );
       * ```
       */
      retrieve(fineTuningJobID, options) {
        return this._client.get(path`/fine_tuning/jobs/${fineTuningJobID}`, options);
      }
      /**
       * List your organization's fine-tuning jobs
       *
       * @example
       * ```ts
       * // Automatically fetches more pages as needed.
       * for await (const fineTuningJob of client.fineTuning.jobs.list()) {
       *   // ...
       * }
       * ```
       */
      list(query = {}, options) {
        return this._client.getAPIList("/fine_tuning/jobs", CursorPage, { query, ...options });
      }
      /**
       * Immediately cancel a fine-tune job.
       *
       * @example
       * ```ts
       * const fineTuningJob = await client.fineTuning.jobs.cancel(
       *   'ft-AF1WoRqd3aJAHsqc9NY7iL8F',
       * );
       * ```
       */
      cancel(fineTuningJobID, options) {
        return this._client.post(path`/fine_tuning/jobs/${fineTuningJobID}/cancel`, options);
      }
      /**
       * Get status updates for a fine-tuning job.
       *
       * @example
       * ```ts
       * // Automatically fetches more pages as needed.
       * for await (const fineTuningJobEvent of client.fineTuning.jobs.listEvents(
       *   'ft-AF1WoRqd3aJAHsqc9NY7iL8F',
       * )) {
       *   // ...
       * }
       * ```
       */
      listEvents(fineTuningJobID, query = {}, options) {
        return this._client.getAPIList(path`/fine_tuning/jobs/${fineTuningJobID}/events`, CursorPage, { query, ...options });
      }
      /**
       * Pause a fine-tune job.
       *
       * @example
       * ```ts
       * const fineTuningJob = await client.fineTuning.jobs.pause(
       *   'ft-AF1WoRqd3aJAHsqc9NY7iL8F',
       * );
       * ```
       */
      pause(fineTuningJobID, options) {
        return this._client.post(path`/fine_tuning/jobs/${fineTuningJobID}/pause`, options);
      }
      /**
       * Resume a fine-tune job.
       *
       * @example
       * ```ts
       * const fineTuningJob = await client.fineTuning.jobs.resume(
       *   'ft-AF1WoRqd3aJAHsqc9NY7iL8F',
       * );
       * ```
       */
      resume(fineTuningJobID, options) {
        return this._client.post(path`/fine_tuning/jobs/${fineTuningJobID}/resume`, options);
      }
    };
    Jobs.Checkpoints = Checkpoints2;
  }
});

// node_modules/openai/resources/fine-tuning/fine-tuning.mjs
var FineTuning;
var init_fine_tuning = __esm({
  "node_modules/openai/resources/fine-tuning/fine-tuning.mjs"() {
    init_resource();
    init_methods();
    init_methods();
    init_alpha();
    init_alpha();
    init_checkpoints();
    init_checkpoints();
    init_jobs();
    init_jobs();
    FineTuning = class extends APIResource {
      constructor() {
        super(...arguments);
        this.methods = new Methods(this._client);
        this.jobs = new Jobs(this._client);
        this.checkpoints = new Checkpoints(this._client);
        this.alpha = new Alpha(this._client);
      }
    };
    FineTuning.Methods = Methods;
    FineTuning.Jobs = Jobs;
    FineTuning.Checkpoints = Checkpoints;
    FineTuning.Alpha = Alpha;
  }
});

// node_modules/openai/resources/graders/grader-models.mjs
var GraderModels;
var init_grader_models = __esm({
  "node_modules/openai/resources/graders/grader-models.mjs"() {
    init_resource();
    GraderModels = class extends APIResource {
    };
  }
});

// node_modules/openai/resources/graders/graders.mjs
var Graders2;
var init_graders2 = __esm({
  "node_modules/openai/resources/graders/graders.mjs"() {
    init_resource();
    init_grader_models();
    init_grader_models();
    Graders2 = class extends APIResource {
      constructor() {
        super(...arguments);
        this.graderModels = new GraderModels(this._client);
      }
    };
    Graders2.GraderModels = GraderModels;
  }
});

// node_modules/openai/resources/images.mjs
var Images;
var init_images = __esm({
  "node_modules/openai/resources/images.mjs"() {
    init_resource();
    init_uploads();
    Images = class extends APIResource {
      /**
       * Creates a variation of a given image. This endpoint only supports `dall-e-2`.
       *
       * @example
       * ```ts
       * const imagesResponse = await client.images.createVariation({
       *   image: fs.createReadStream('otter.png'),
       * });
       * ```
       */
      createVariation(body, options) {
        return this._client.post("/images/variations", multipartFormRequestOptions({ body, ...options }, this._client));
      }
      edit(body, options) {
        return this._client.post("/images/edits", multipartFormRequestOptions({ body, ...options, stream: body.stream ?? false }, this._client));
      }
      generate(body, options) {
        return this._client.post("/images/generations", { body, ...options, stream: body.stream ?? false });
      }
    };
  }
});

// node_modules/openai/resources/models.mjs
var Models;
var init_models = __esm({
  "node_modules/openai/resources/models.mjs"() {
    init_resource();
    init_pagination();
    init_path();
    Models = class extends APIResource {
      /**
       * Retrieves a model instance, providing basic information about the model such as
       * the owner and permissioning.
       */
      retrieve(model, options) {
        return this._client.get(path`/models/${model}`, options);
      }
      /**
       * Lists the currently available models, and provides basic information about each
       * one such as the owner and availability.
       */
      list(options) {
        return this._client.getAPIList("/models", Page, options);
      }
      /**
       * Delete a fine-tuned model. You must have the Owner role in your organization to
       * delete a model.
       */
      delete(model, options) {
        return this._client.delete(path`/models/${model}`, options);
      }
    };
  }
});

// node_modules/openai/resources/moderations.mjs
var Moderations;
var init_moderations = __esm({
  "node_modules/openai/resources/moderations.mjs"() {
    init_resource();
    Moderations = class extends APIResource {
      /**
       * Classifies if text and/or image inputs are potentially harmful. Learn more in
       * the [moderation guide](https://platform.openai.com/docs/guides/moderation).
       */
      create(body, options) {
        return this._client.post("/moderations", { body, ...options });
      }
    };
  }
});

// node_modules/openai/resources/realtime/calls.mjs
var Calls;
var init_calls = __esm({
  "node_modules/openai/resources/realtime/calls.mjs"() {
    init_resource();
    init_headers();
    init_path();
    Calls = class extends APIResource {
      /**
       * Accept an incoming SIP call and configure the realtime session that will handle
       * it.
       *
       * @example
       * ```ts
       * await client.realtime.calls.accept('call_id', {
       *   type: 'realtime',
       * });
       * ```
       */
      accept(callID, body, options) {
        return this._client.post(path`/realtime/calls/${callID}/accept`, {
          body,
          ...options,
          headers: buildHeaders([{ Accept: "*/*" }, options?.headers])
        });
      }
      /**
       * End an active Realtime API call, whether it was initiated over SIP or WebRTC.
       *
       * @example
       * ```ts
       * await client.realtime.calls.hangup('call_id');
       * ```
       */
      hangup(callID, options) {
        return this._client.post(path`/realtime/calls/${callID}/hangup`, {
          ...options,
          headers: buildHeaders([{ Accept: "*/*" }, options?.headers])
        });
      }
      /**
       * Transfer an active SIP call to a new destination using the SIP REFER verb.
       *
       * @example
       * ```ts
       * await client.realtime.calls.refer('call_id', {
       *   target_uri: 'tel:+14155550123',
       * });
       * ```
       */
      refer(callID, body, options) {
        return this._client.post(path`/realtime/calls/${callID}/refer`, {
          body,
          ...options,
          headers: buildHeaders([{ Accept: "*/*" }, options?.headers])
        });
      }
      /**
       * Decline an incoming SIP call by returning a SIP status code to the caller.
       *
       * @example
       * ```ts
       * await client.realtime.calls.reject('call_id');
       * ```
       */
      reject(callID, body = {}, options) {
        return this._client.post(path`/realtime/calls/${callID}/reject`, {
          body,
          ...options,
          headers: buildHeaders([{ Accept: "*/*" }, options?.headers])
        });
      }
    };
  }
});

// node_modules/openai/resources/realtime/client-secrets.mjs
var ClientSecrets;
var init_client_secrets = __esm({
  "node_modules/openai/resources/realtime/client-secrets.mjs"() {
    init_resource();
    ClientSecrets = class extends APIResource {
      /**
       * Create a Realtime client secret with an associated session configuration.
       *
       * @example
       * ```ts
       * const clientSecret =
       *   await client.realtime.clientSecrets.create();
       * ```
       */
      create(body, options) {
        return this._client.post("/realtime/client_secrets", { body, ...options });
      }
    };
  }
});

// node_modules/openai/resources/realtime/realtime.mjs
var Realtime2;
var init_realtime2 = __esm({
  "node_modules/openai/resources/realtime/realtime.mjs"() {
    init_resource();
    init_calls();
    init_calls();
    init_client_secrets();
    init_client_secrets();
    Realtime2 = class extends APIResource {
      constructor() {
        super(...arguments);
        this.clientSecrets = new ClientSecrets(this._client);
        this.calls = new Calls(this._client);
      }
    };
    Realtime2.ClientSecrets = ClientSecrets;
    Realtime2.Calls = Calls;
  }
});

// node_modules/openai/lib/ResponsesParser.mjs
function maybeParseResponse(response, params) {
  if (!params || !hasAutoParseableInput2(params)) {
    return {
      ...response,
      output_parsed: null,
      output: response.output.map((item) => {
        if (item.type === "function_call") {
          return {
            ...item,
            parsed_arguments: null
          };
        }
        if (item.type === "message") {
          return {
            ...item,
            content: item.content.map((content) => ({
              ...content,
              parsed: null
            }))
          };
        } else {
          return item;
        }
      })
    };
  }
  return parseResponse(response, params);
}
function parseResponse(response, params) {
  const output = response.output.map((item) => {
    if (item.type === "function_call") {
      return {
        ...item,
        parsed_arguments: parseToolCall2(params, item)
      };
    }
    if (item.type === "message") {
      const content = item.content.map((content2) => {
        if (content2.type === "output_text") {
          return {
            ...content2,
            parsed: parseTextFormat(params, content2.text)
          };
        }
        return content2;
      });
      return {
        ...item,
        content
      };
    }
    return item;
  });
  const parsed = Object.assign({}, response, { output });
  if (!Object.getOwnPropertyDescriptor(response, "output_text")) {
    addOutputText(parsed);
  }
  Object.defineProperty(parsed, "output_parsed", {
    enumerable: true,
    get() {
      for (const output2 of parsed.output) {
        if (output2.type !== "message") {
          continue;
        }
        for (const content of output2.content) {
          if (content.type === "output_text" && content.parsed !== null) {
            return content.parsed;
          }
        }
      }
      return null;
    }
  });
  return parsed;
}
function parseTextFormat(params, content) {
  if (params.text?.format?.type !== "json_schema") {
    return null;
  }
  if ("$parseRaw" in params.text?.format) {
    const text_format = params.text?.format;
    return text_format.$parseRaw(content);
  }
  return JSON.parse(content);
}
function hasAutoParseableInput2(params) {
  if (isAutoParsableResponseFormat(params.text?.format)) {
    return true;
  }
  return false;
}
function isAutoParsableTool2(tool) {
  return tool?.["$brand"] === "auto-parseable-tool";
}
function getInputToolByName(input_tools, name) {
  return input_tools.find((tool) => tool.type === "function" && tool.name === name);
}
function parseToolCall2(params, toolCall) {
  const inputTool = getInputToolByName(params.tools ?? [], toolCall.name);
  return {
    ...toolCall,
    ...toolCall,
    parsed_arguments: isAutoParsableTool2(inputTool) ? inputTool.$parseRaw(toolCall.arguments) : inputTool?.strict ? JSON.parse(toolCall.arguments) : null
  };
}
function addOutputText(rsp) {
  const texts = [];
  for (const output of rsp.output) {
    if (output.type !== "message") {
      continue;
    }
    for (const content of output.content) {
      if (content.type === "output_text") {
        texts.push(content.text);
      }
    }
  }
  rsp.output_text = texts.join("");
}
var init_ResponsesParser = __esm({
  "node_modules/openai/lib/ResponsesParser.mjs"() {
    init_error2();
    init_parser();
  }
});

// node_modules/openai/lib/responses/ResponseStream.mjs
function finalizeResponse(snapshot, params) {
  return maybeParseResponse(snapshot, params);
}
var _ResponseStream_instances, _ResponseStream_params, _ResponseStream_currentResponseSnapshot, _ResponseStream_finalResponse, _ResponseStream_beginRequest, _ResponseStream_addEvent, _ResponseStream_endRequest, _ResponseStream_accumulateResponse, ResponseStream;
var init_ResponseStream = __esm({
  "node_modules/openai/lib/responses/ResponseStream.mjs"() {
    init_tslib();
    init_error2();
    init_EventStream();
    init_ResponsesParser();
    ResponseStream = class _ResponseStream extends EventStream {
      constructor(params) {
        super();
        _ResponseStream_instances.add(this);
        _ResponseStream_params.set(this, void 0);
        _ResponseStream_currentResponseSnapshot.set(this, void 0);
        _ResponseStream_finalResponse.set(this, void 0);
        __classPrivateFieldSet(this, _ResponseStream_params, params, "f");
      }
      static createResponse(client, params, options) {
        const runner = new _ResponseStream(params);
        runner._run(() => runner._createOrRetrieveResponse(client, params, {
          ...options,
          headers: { ...options?.headers, "X-Stainless-Helper-Method": "stream" }
        }));
        return runner;
      }
      async _createOrRetrieveResponse(client, params, options) {
        const signal = options?.signal;
        if (signal) {
          if (signal.aborted)
            this.controller.abort();
          signal.addEventListener("abort", () => this.controller.abort());
        }
        __classPrivateFieldGet(this, _ResponseStream_instances, "m", _ResponseStream_beginRequest).call(this);
        let stream;
        let starting_after = null;
        if ("response_id" in params) {
          stream = await client.responses.retrieve(params.response_id, { stream: true }, { ...options, signal: this.controller.signal, stream: true });
          starting_after = params.starting_after ?? null;
        } else {
          stream = await client.responses.create({ ...params, stream: true }, { ...options, signal: this.controller.signal });
        }
        this._connected();
        for await (const event of stream) {
          __classPrivateFieldGet(this, _ResponseStream_instances, "m", _ResponseStream_addEvent).call(this, event, starting_after);
        }
        if (stream.controller.signal?.aborted) {
          throw new APIUserAbortError();
        }
        return __classPrivateFieldGet(this, _ResponseStream_instances, "m", _ResponseStream_endRequest).call(this);
      }
      [(_ResponseStream_params = /* @__PURE__ */ new WeakMap(), _ResponseStream_currentResponseSnapshot = /* @__PURE__ */ new WeakMap(), _ResponseStream_finalResponse = /* @__PURE__ */ new WeakMap(), _ResponseStream_instances = /* @__PURE__ */ new WeakSet(), _ResponseStream_beginRequest = function _ResponseStream_beginRequest2() {
        if (this.ended)
          return;
        __classPrivateFieldSet(this, _ResponseStream_currentResponseSnapshot, void 0, "f");
      }, _ResponseStream_addEvent = function _ResponseStream_addEvent2(event, starting_after) {
        if (this.ended)
          return;
        const maybeEmit = (name, event2) => {
          if (starting_after == null || event2.sequence_number > starting_after) {
            this._emit(name, event2);
          }
        };
        const response = __classPrivateFieldGet(this, _ResponseStream_instances, "m", _ResponseStream_accumulateResponse).call(this, event);
        maybeEmit("event", event);
        switch (event.type) {
          case "response.output_text.delta": {
            const output = response.output[event.output_index];
            if (!output) {
              throw new OpenAIError(`missing output at index ${event.output_index}`);
            }
            if (output.type === "message") {
              const content = output.content[event.content_index];
              if (!content) {
                throw new OpenAIError(`missing content at index ${event.content_index}`);
              }
              if (content.type !== "output_text") {
                throw new OpenAIError(`expected content to be 'output_text', got ${content.type}`);
              }
              maybeEmit("response.output_text.delta", {
                ...event,
                snapshot: content.text
              });
            }
            break;
          }
          case "response.function_call_arguments.delta": {
            const output = response.output[event.output_index];
            if (!output) {
              throw new OpenAIError(`missing output at index ${event.output_index}`);
            }
            if (output.type === "function_call") {
              maybeEmit("response.function_call_arguments.delta", {
                ...event,
                snapshot: output.arguments
              });
            }
            break;
          }
          default:
            maybeEmit(event.type, event);
            break;
        }
      }, _ResponseStream_endRequest = function _ResponseStream_endRequest2() {
        if (this.ended) {
          throw new OpenAIError(`stream has ended, this shouldn't happen`);
        }
        const snapshot = __classPrivateFieldGet(this, _ResponseStream_currentResponseSnapshot, "f");
        if (!snapshot) {
          throw new OpenAIError(`request ended without sending any events`);
        }
        __classPrivateFieldSet(this, _ResponseStream_currentResponseSnapshot, void 0, "f");
        const parsedResponse = finalizeResponse(snapshot, __classPrivateFieldGet(this, _ResponseStream_params, "f"));
        __classPrivateFieldSet(this, _ResponseStream_finalResponse, parsedResponse, "f");
        return parsedResponse;
      }, _ResponseStream_accumulateResponse = function _ResponseStream_accumulateResponse2(event) {
        let snapshot = __classPrivateFieldGet(this, _ResponseStream_currentResponseSnapshot, "f");
        if (!snapshot) {
          if (event.type !== "response.created") {
            throw new OpenAIError(`When snapshot hasn't been set yet, expected 'response.created' event, got ${event.type}`);
          }
          snapshot = __classPrivateFieldSet(this, _ResponseStream_currentResponseSnapshot, event.response, "f");
          return snapshot;
        }
        switch (event.type) {
          case "response.output_item.added": {
            snapshot.output.push(event.item);
            break;
          }
          case "response.content_part.added": {
            const output = snapshot.output[event.output_index];
            if (!output) {
              throw new OpenAIError(`missing output at index ${event.output_index}`);
            }
            const type = output.type;
            const part = event.part;
            if (type === "message" && part.type !== "reasoning_text") {
              output.content.push(part);
            } else if (type === "reasoning" && part.type === "reasoning_text") {
              if (!output.content) {
                output.content = [];
              }
              output.content.push(part);
            }
            break;
          }
          case "response.output_text.delta": {
            const output = snapshot.output[event.output_index];
            if (!output) {
              throw new OpenAIError(`missing output at index ${event.output_index}`);
            }
            if (output.type === "message") {
              const content = output.content[event.content_index];
              if (!content) {
                throw new OpenAIError(`missing content at index ${event.content_index}`);
              }
              if (content.type !== "output_text") {
                throw new OpenAIError(`expected content to be 'output_text', got ${content.type}`);
              }
              content.text += event.delta;
            }
            break;
          }
          case "response.function_call_arguments.delta": {
            const output = snapshot.output[event.output_index];
            if (!output) {
              throw new OpenAIError(`missing output at index ${event.output_index}`);
            }
            if (output.type === "function_call") {
              output.arguments += event.delta;
            }
            break;
          }
          case "response.reasoning_text.delta": {
            const output = snapshot.output[event.output_index];
            if (!output) {
              throw new OpenAIError(`missing output at index ${event.output_index}`);
            }
            if (output.type === "reasoning") {
              const content = output.content?.[event.content_index];
              if (!content) {
                throw new OpenAIError(`missing content at index ${event.content_index}`);
              }
              if (content.type !== "reasoning_text") {
                throw new OpenAIError(`expected content to be 'reasoning_text', got ${content.type}`);
              }
              content.text += event.delta;
            }
            break;
          }
          case "response.completed": {
            __classPrivateFieldSet(this, _ResponseStream_currentResponseSnapshot, event.response, "f");
            break;
          }
        }
        return snapshot;
      }, Symbol.asyncIterator)]() {
        const pushQueue = [];
        const readQueue = [];
        let done = false;
        this.on("event", (event) => {
          const reader = readQueue.shift();
          if (reader) {
            reader.resolve(event);
          } else {
            pushQueue.push(event);
          }
        });
        this.on("end", () => {
          done = true;
          for (const reader of readQueue) {
            reader.resolve(void 0);
          }
          readQueue.length = 0;
        });
        this.on("abort", (err) => {
          done = true;
          for (const reader of readQueue) {
            reader.reject(err);
          }
          readQueue.length = 0;
        });
        this.on("error", (err) => {
          done = true;
          for (const reader of readQueue) {
            reader.reject(err);
          }
          readQueue.length = 0;
        });
        return {
          next: async () => {
            if (!pushQueue.length) {
              if (done) {
                return { value: void 0, done: true };
              }
              return new Promise((resolve, reject) => readQueue.push({ resolve, reject })).then((event2) => event2 ? { value: event2, done: false } : { value: void 0, done: true });
            }
            const event = pushQueue.shift();
            return { value: event, done: false };
          },
          return: async () => {
            this.abort();
            return { value: void 0, done: true };
          }
        };
      }
      /**
       * @returns a promise that resolves with the final Response, or rejects
       * if an error occurred or the stream ended prematurely without producing a REsponse.
       */
      async finalResponse() {
        await this.done();
        const response = __classPrivateFieldGet(this, _ResponseStream_finalResponse, "f");
        if (!response)
          throw new OpenAIError("stream ended without producing a ChatCompletion");
        return response;
      }
    };
  }
});

// node_modules/openai/resources/responses/input-items.mjs
var InputItems;
var init_input_items = __esm({
  "node_modules/openai/resources/responses/input-items.mjs"() {
    init_resource();
    init_pagination();
    init_path();
    InputItems = class extends APIResource {
      /**
       * Returns a list of input items for a given response.
       *
       * @example
       * ```ts
       * // Automatically fetches more pages as needed.
       * for await (const responseItem of client.responses.inputItems.list(
       *   'response_id',
       * )) {
       *   // ...
       * }
       * ```
       */
      list(responseID, query = {}, options) {
        return this._client.getAPIList(path`/responses/${responseID}/input_items`, CursorPage, { query, ...options });
      }
    };
  }
});

// node_modules/openai/resources/responses/input-tokens.mjs
var InputTokens;
var init_input_tokens = __esm({
  "node_modules/openai/resources/responses/input-tokens.mjs"() {
    init_resource();
    InputTokens = class extends APIResource {
      /**
       * Get input token counts
       *
       * @example
       * ```ts
       * const response = await client.responses.inputTokens.count();
       * ```
       */
      count(body = {}, options) {
        return this._client.post("/responses/input_tokens", { body, ...options });
      }
    };
  }
});

// node_modules/openai/resources/responses/responses.mjs
var Responses;
var init_responses = __esm({
  "node_modules/openai/resources/responses/responses.mjs"() {
    init_ResponsesParser();
    init_ResponseStream();
    init_resource();
    init_input_items();
    init_input_items();
    init_input_tokens();
    init_input_tokens();
    init_headers();
    init_path();
    Responses = class extends APIResource {
      constructor() {
        super(...arguments);
        this.inputItems = new InputItems(this._client);
        this.inputTokens = new InputTokens(this._client);
      }
      create(body, options) {
        return this._client.post("/responses", { body, ...options, stream: body.stream ?? false })._thenUnwrap((rsp) => {
          if ("object" in rsp && rsp.object === "response") {
            addOutputText(rsp);
          }
          return rsp;
        });
      }
      retrieve(responseID, query = {}, options) {
        return this._client.get(path`/responses/${responseID}`, {
          query,
          ...options,
          stream: query?.stream ?? false
        })._thenUnwrap((rsp) => {
          if ("object" in rsp && rsp.object === "response") {
            addOutputText(rsp);
          }
          return rsp;
        });
      }
      /**
       * Deletes a model response with the given ID.
       *
       * @example
       * ```ts
       * await client.responses.delete(
       *   'resp_677efb5139a88190b512bc3fef8e535d',
       * );
       * ```
       */
      delete(responseID, options) {
        return this._client.delete(path`/responses/${responseID}`, {
          ...options,
          headers: buildHeaders([{ Accept: "*/*" }, options?.headers])
        });
      }
      parse(body, options) {
        return this._client.responses.create(body, options)._thenUnwrap((response) => parseResponse(response, body));
      }
      /**
       * Creates a model response stream
       */
      stream(body, options) {
        return ResponseStream.createResponse(this._client, body, options);
      }
      /**
       * Cancels a model response with the given ID. Only responses created with the
       * `background` parameter set to `true` can be cancelled.
       * [Learn more](https://platform.openai.com/docs/guides/background).
       *
       * @example
       * ```ts
       * const response = await client.responses.cancel(
       *   'resp_677efb5139a88190b512bc3fef8e535d',
       * );
       * ```
       */
      cancel(responseID, options) {
        return this._client.post(path`/responses/${responseID}/cancel`, options);
      }
      /**
       * Compact conversation
       *
       * @example
       * ```ts
       * const compactedResponse = await client.responses.compact();
       * ```
       */
      compact(body = {}, options) {
        return this._client.post("/responses/compact", { body, ...options });
      }
    };
    Responses.InputItems = InputItems;
    Responses.InputTokens = InputTokens;
  }
});

// node_modules/openai/resources/uploads/parts.mjs
var Parts;
var init_parts = __esm({
  "node_modules/openai/resources/uploads/parts.mjs"() {
    init_resource();
    init_uploads();
    init_path();
    Parts = class extends APIResource {
      /**
       * Adds a
       * [Part](https://platform.openai.com/docs/api-reference/uploads/part-object) to an
       * [Upload](https://platform.openai.com/docs/api-reference/uploads/object) object.
       * A Part represents a chunk of bytes from the file you are trying to upload.
       *
       * Each Part can be at most 64 MB, and you can add Parts until you hit the Upload
       * maximum of 8 GB.
       *
       * It is possible to add multiple Parts in parallel. You can decide the intended
       * order of the Parts when you
       * [complete the Upload](https://platform.openai.com/docs/api-reference/uploads/complete).
       */
      create(uploadID, body, options) {
        return this._client.post(path`/uploads/${uploadID}/parts`, multipartFormRequestOptions({ body, ...options }, this._client));
      }
    };
  }
});

// node_modules/openai/resources/uploads/uploads.mjs
var Uploads;
var init_uploads3 = __esm({
  "node_modules/openai/resources/uploads/uploads.mjs"() {
    init_resource();
    init_parts();
    init_parts();
    init_path();
    Uploads = class extends APIResource {
      constructor() {
        super(...arguments);
        this.parts = new Parts(this._client);
      }
      /**
       * Creates an intermediate
       * [Upload](https://platform.openai.com/docs/api-reference/uploads/object) object
       * that you can add
       * [Parts](https://platform.openai.com/docs/api-reference/uploads/part-object) to.
       * Currently, an Upload can accept at most 8 GB in total and expires after an hour
       * after you create it.
       *
       * Once you complete the Upload, we will create a
       * [File](https://platform.openai.com/docs/api-reference/files/object) object that
       * contains all the parts you uploaded. This File is usable in the rest of our
       * platform as a regular File object.
       *
       * For certain `purpose` values, the correct `mime_type` must be specified. Please
       * refer to documentation for the
       * [supported MIME types for your use case](https://platform.openai.com/docs/assistants/tools/file-search#supported-files).
       *
       * For guidance on the proper filename extensions for each purpose, please follow
       * the documentation on
       * [creating a File](https://platform.openai.com/docs/api-reference/files/create).
       */
      create(body, options) {
        return this._client.post("/uploads", { body, ...options });
      }
      /**
       * Cancels the Upload. No Parts may be added after an Upload is cancelled.
       */
      cancel(uploadID, options) {
        return this._client.post(path`/uploads/${uploadID}/cancel`, options);
      }
      /**
       * Completes the
       * [Upload](https://platform.openai.com/docs/api-reference/uploads/object).
       *
       * Within the returned Upload object, there is a nested
       * [File](https://platform.openai.com/docs/api-reference/files/object) object that
       * is ready to use in the rest of the platform.
       *
       * You can specify the order of the Parts by passing in an ordered list of the Part
       * IDs.
       *
       * The number of bytes uploaded upon completion must match the number of bytes
       * initially specified when creating the Upload object. No Parts may be added after
       * an Upload is completed.
       */
      complete(uploadID, body, options) {
        return this._client.post(path`/uploads/${uploadID}/complete`, { body, ...options });
      }
    };
    Uploads.Parts = Parts;
  }
});

// node_modules/openai/lib/Util.mjs
var allSettledWithThrow;
var init_Util = __esm({
  "node_modules/openai/lib/Util.mjs"() {
    allSettledWithThrow = async (promises) => {
      const results = await Promise.allSettled(promises);
      const rejected = results.filter((result) => result.status === "rejected");
      if (rejected.length) {
        for (const result of rejected) {
          console.error(result.reason);
        }
        throw new Error(`${rejected.length} promise(s) failed - see the above errors`);
      }
      const values = [];
      for (const result of results) {
        if (result.status === "fulfilled") {
          values.push(result.value);
        }
      }
      return values;
    };
  }
});

// node_modules/openai/resources/vector-stores/file-batches.mjs
var FileBatches;
var init_file_batches = __esm({
  "node_modules/openai/resources/vector-stores/file-batches.mjs"() {
    init_resource();
    init_pagination();
    init_headers();
    init_sleep();
    init_Util();
    init_path();
    FileBatches = class extends APIResource {
      /**
       * Create a vector store file batch.
       */
      create(vectorStoreID, body, options) {
        return this._client.post(path`/vector_stores/${vectorStoreID}/file_batches`, {
          body,
          ...options,
          headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options?.headers])
        });
      }
      /**
       * Retrieves a vector store file batch.
       */
      retrieve(batchID, params, options) {
        const { vector_store_id } = params;
        return this._client.get(path`/vector_stores/${vector_store_id}/file_batches/${batchID}`, {
          ...options,
          headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options?.headers])
        });
      }
      /**
       * Cancel a vector store file batch. This attempts to cancel the processing of
       * files in this batch as soon as possible.
       */
      cancel(batchID, params, options) {
        const { vector_store_id } = params;
        return this._client.post(path`/vector_stores/${vector_store_id}/file_batches/${batchID}/cancel`, {
          ...options,
          headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options?.headers])
        });
      }
      /**
       * Create a vector store batch and poll until all files have been processed.
       */
      async createAndPoll(vectorStoreId, body, options) {
        const batch = await this.create(vectorStoreId, body);
        return await this.poll(vectorStoreId, batch.id, options);
      }
      /**
       * Returns a list of vector store files in a batch.
       */
      listFiles(batchID, params, options) {
        const { vector_store_id, ...query } = params;
        return this._client.getAPIList(path`/vector_stores/${vector_store_id}/file_batches/${batchID}/files`, CursorPage, { query, ...options, headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options?.headers]) });
      }
      /**
       * Wait for the given file batch to be processed.
       *
       * Note: this will return even if one of the files failed to process, you need to
       * check batch.file_counts.failed_count to handle this case.
       */
      async poll(vectorStoreID, batchID, options) {
        const headers = buildHeaders([
          options?.headers,
          {
            "X-Stainless-Poll-Helper": "true",
            "X-Stainless-Custom-Poll-Interval": options?.pollIntervalMs?.toString() ?? void 0
          }
        ]);
        while (true) {
          const { data: batch, response } = await this.retrieve(batchID, { vector_store_id: vectorStoreID }, {
            ...options,
            headers
          }).withResponse();
          switch (batch.status) {
            case "in_progress":
              let sleepInterval = 5e3;
              if (options?.pollIntervalMs) {
                sleepInterval = options.pollIntervalMs;
              } else {
                const headerInterval = response.headers.get("openai-poll-after-ms");
                if (headerInterval) {
                  const headerIntervalMs = parseInt(headerInterval);
                  if (!isNaN(headerIntervalMs)) {
                    sleepInterval = headerIntervalMs;
                  }
                }
              }
              await sleep(sleepInterval);
              break;
            case "failed":
            case "cancelled":
            case "completed":
              return batch;
          }
        }
      }
      /**
       * Uploads the given files concurrently and then creates a vector store file batch.
       *
       * The concurrency limit is configurable using the `maxConcurrency` parameter.
       */
      async uploadAndPoll(vectorStoreId, { files, fileIds = [] }, options) {
        if (files == null || files.length == 0) {
          throw new Error(`No \`files\` provided to process. If you've already uploaded files you should use \`.createAndPoll()\` instead`);
        }
        const configuredConcurrency = options?.maxConcurrency ?? 5;
        const concurrencyLimit = Math.min(configuredConcurrency, files.length);
        const client = this._client;
        const fileIterator = files.values();
        const allFileIds = [...fileIds];
        async function processFiles(iterator) {
          for (let item of iterator) {
            const fileObj = await client.files.create({ file: item, purpose: "assistants" }, options);
            allFileIds.push(fileObj.id);
          }
        }
        const workers = Array(concurrencyLimit).fill(fileIterator).map(processFiles);
        await allSettledWithThrow(workers);
        return await this.createAndPoll(vectorStoreId, {
          file_ids: allFileIds
        });
      }
    };
  }
});

// node_modules/openai/resources/vector-stores/files.mjs
var Files3;
var init_files3 = __esm({
  "node_modules/openai/resources/vector-stores/files.mjs"() {
    init_resource();
    init_pagination();
    init_headers();
    init_utils2();
    init_path();
    Files3 = class extends APIResource {
      /**
       * Create a vector store file by attaching a
       * [File](https://platform.openai.com/docs/api-reference/files) to a
       * [vector store](https://platform.openai.com/docs/api-reference/vector-stores/object).
       */
      create(vectorStoreID, body, options) {
        return this._client.post(path`/vector_stores/${vectorStoreID}/files`, {
          body,
          ...options,
          headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options?.headers])
        });
      }
      /**
       * Retrieves a vector store file.
       */
      retrieve(fileID, params, options) {
        const { vector_store_id } = params;
        return this._client.get(path`/vector_stores/${vector_store_id}/files/${fileID}`, {
          ...options,
          headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options?.headers])
        });
      }
      /**
       * Update attributes on a vector store file.
       */
      update(fileID, params, options) {
        const { vector_store_id, ...body } = params;
        return this._client.post(path`/vector_stores/${vector_store_id}/files/${fileID}`, {
          body,
          ...options,
          headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options?.headers])
        });
      }
      /**
       * Returns a list of vector store files.
       */
      list(vectorStoreID, query = {}, options) {
        return this._client.getAPIList(path`/vector_stores/${vectorStoreID}/files`, CursorPage, {
          query,
          ...options,
          headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options?.headers])
        });
      }
      /**
       * Delete a vector store file. This will remove the file from the vector store but
       * the file itself will not be deleted. To delete the file, use the
       * [delete file](https://platform.openai.com/docs/api-reference/files/delete)
       * endpoint.
       */
      delete(fileID, params, options) {
        const { vector_store_id } = params;
        return this._client.delete(path`/vector_stores/${vector_store_id}/files/${fileID}`, {
          ...options,
          headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options?.headers])
        });
      }
      /**
       * Attach a file to the given vector store and wait for it to be processed.
       */
      async createAndPoll(vectorStoreId, body, options) {
        const file = await this.create(vectorStoreId, body, options);
        return await this.poll(vectorStoreId, file.id, options);
      }
      /**
       * Wait for the vector store file to finish processing.
       *
       * Note: this will return even if the file failed to process, you need to check
       * file.last_error and file.status to handle these cases
       */
      async poll(vectorStoreID, fileID, options) {
        const headers = buildHeaders([
          options?.headers,
          {
            "X-Stainless-Poll-Helper": "true",
            "X-Stainless-Custom-Poll-Interval": options?.pollIntervalMs?.toString() ?? void 0
          }
        ]);
        while (true) {
          const fileResponse = await this.retrieve(fileID, {
            vector_store_id: vectorStoreID
          }, { ...options, headers }).withResponse();
          const file = fileResponse.data;
          switch (file.status) {
            case "in_progress":
              let sleepInterval = 5e3;
              if (options?.pollIntervalMs) {
                sleepInterval = options.pollIntervalMs;
              } else {
                const headerInterval = fileResponse.response.headers.get("openai-poll-after-ms");
                if (headerInterval) {
                  const headerIntervalMs = parseInt(headerInterval);
                  if (!isNaN(headerIntervalMs)) {
                    sleepInterval = headerIntervalMs;
                  }
                }
              }
              await sleep(sleepInterval);
              break;
            case "failed":
            case "completed":
              return file;
          }
        }
      }
      /**
       * Upload a file to the `files` API and then attach it to the given vector store.
       *
       * Note the file will be asynchronously processed (you can use the alternative
       * polling helper method to wait for processing to complete).
       */
      async upload(vectorStoreId, file, options) {
        const fileInfo = await this._client.files.create({ file, purpose: "assistants" }, options);
        return this.create(vectorStoreId, { file_id: fileInfo.id }, options);
      }
      /**
       * Add a file to a vector store and poll until processing is complete.
       */
      async uploadAndPoll(vectorStoreId, file, options) {
        const fileInfo = await this.upload(vectorStoreId, file, options);
        return await this.poll(vectorStoreId, fileInfo.id, options);
      }
      /**
       * Retrieve the parsed contents of a vector store file.
       */
      content(fileID, params, options) {
        const { vector_store_id } = params;
        return this._client.getAPIList(path`/vector_stores/${vector_store_id}/files/${fileID}/content`, Page, { ...options, headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options?.headers]) });
      }
    };
  }
});

// node_modules/openai/resources/vector-stores/vector-stores.mjs
var VectorStores;
var init_vector_stores = __esm({
  "node_modules/openai/resources/vector-stores/vector-stores.mjs"() {
    init_resource();
    init_file_batches();
    init_file_batches();
    init_files3();
    init_files3();
    init_pagination();
    init_headers();
    init_path();
    VectorStores = class extends APIResource {
      constructor() {
        super(...arguments);
        this.files = new Files3(this._client);
        this.fileBatches = new FileBatches(this._client);
      }
      /**
       * Create a vector store.
       */
      create(body, options) {
        return this._client.post("/vector_stores", {
          body,
          ...options,
          headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options?.headers])
        });
      }
      /**
       * Retrieves a vector store.
       */
      retrieve(vectorStoreID, options) {
        return this._client.get(path`/vector_stores/${vectorStoreID}`, {
          ...options,
          headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options?.headers])
        });
      }
      /**
       * Modifies a vector store.
       */
      update(vectorStoreID, body, options) {
        return this._client.post(path`/vector_stores/${vectorStoreID}`, {
          body,
          ...options,
          headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options?.headers])
        });
      }
      /**
       * Returns a list of vector stores.
       */
      list(query = {}, options) {
        return this._client.getAPIList("/vector_stores", CursorPage, {
          query,
          ...options,
          headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options?.headers])
        });
      }
      /**
       * Delete a vector store.
       */
      delete(vectorStoreID, options) {
        return this._client.delete(path`/vector_stores/${vectorStoreID}`, {
          ...options,
          headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options?.headers])
        });
      }
      /**
       * Search a vector store for relevant chunks based on a query and file attributes
       * filter.
       */
      search(vectorStoreID, body, options) {
        return this._client.getAPIList(path`/vector_stores/${vectorStoreID}/search`, Page, {
          body,
          method: "post",
          ...options,
          headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options?.headers])
        });
      }
    };
    VectorStores.Files = Files3;
    VectorStores.FileBatches = FileBatches;
  }
});

// node_modules/openai/resources/videos.mjs
var Videos;
var init_videos = __esm({
  "node_modules/openai/resources/videos.mjs"() {
    init_resource();
    init_pagination();
    init_headers();
    init_uploads();
    init_path();
    Videos = class extends APIResource {
      /**
       * Create a video
       */
      create(body, options) {
        return this._client.post("/videos", maybeMultipartFormRequestOptions({ body, ...options }, this._client));
      }
      /**
       * Retrieve a video
       */
      retrieve(videoID, options) {
        return this._client.get(path`/videos/${videoID}`, options);
      }
      /**
       * List videos
       */
      list(query = {}, options) {
        return this._client.getAPIList("/videos", ConversationCursorPage, { query, ...options });
      }
      /**
       * Delete a video
       */
      delete(videoID, options) {
        return this._client.delete(path`/videos/${videoID}`, options);
      }
      /**
       * Download video content
       */
      downloadContent(videoID, query = {}, options) {
        return this._client.get(path`/videos/${videoID}/content`, {
          query,
          ...options,
          headers: buildHeaders([{ Accept: "application/binary" }, options?.headers]),
          __binaryResponse: true
        });
      }
      /**
       * Create a video remix
       */
      remix(videoID, body, options) {
        return this._client.post(path`/videos/${videoID}/remix`, maybeMultipartFormRequestOptions({ body, ...options }, this._client));
      }
    };
  }
});

// node_modules/openai/resources/webhooks.mjs
var _Webhooks_instances, _Webhooks_validateSecret, _Webhooks_getRequiredHeader, Webhooks;
var init_webhooks = __esm({
  "node_modules/openai/resources/webhooks.mjs"() {
    init_tslib();
    init_error2();
    init_resource();
    init_headers();
    Webhooks = class extends APIResource {
      constructor() {
        super(...arguments);
        _Webhooks_instances.add(this);
      }
      /**
       * Validates that the given payload was sent by OpenAI and parses the payload.
       */
      async unwrap(payload, headers, secret = this._client.webhookSecret, tolerance = 300) {
        await this.verifySignature(payload, headers, secret, tolerance);
        return JSON.parse(payload);
      }
      /**
       * Validates whether or not the webhook payload was sent by OpenAI.
       *
       * An error will be raised if the webhook payload was not sent by OpenAI.
       *
       * @param payload - The webhook payload
       * @param headers - The webhook headers
       * @param secret - The webhook secret (optional, will use client secret if not provided)
       * @param tolerance - Maximum age of the webhook in seconds (default: 300 = 5 minutes)
       */
      async verifySignature(payload, headers, secret = this._client.webhookSecret, tolerance = 300) {
        if (typeof crypto === "undefined" || typeof crypto.subtle.importKey !== "function" || typeof crypto.subtle.verify !== "function") {
          throw new Error("Webhook signature verification is only supported when the `crypto` global is defined");
        }
        __classPrivateFieldGet(this, _Webhooks_instances, "m", _Webhooks_validateSecret).call(this, secret);
        const headersObj = buildHeaders([headers]).values;
        const signatureHeader = __classPrivateFieldGet(this, _Webhooks_instances, "m", _Webhooks_getRequiredHeader).call(this, headersObj, "webhook-signature");
        const timestamp2 = __classPrivateFieldGet(this, _Webhooks_instances, "m", _Webhooks_getRequiredHeader).call(this, headersObj, "webhook-timestamp");
        const webhookId = __classPrivateFieldGet(this, _Webhooks_instances, "m", _Webhooks_getRequiredHeader).call(this, headersObj, "webhook-id");
        const timestampSeconds = parseInt(timestamp2, 10);
        if (isNaN(timestampSeconds)) {
          throw new InvalidWebhookSignatureError("Invalid webhook timestamp format");
        }
        const nowSeconds = Math.floor(Date.now() / 1e3);
        if (nowSeconds - timestampSeconds > tolerance) {
          throw new InvalidWebhookSignatureError("Webhook timestamp is too old");
        }
        if (timestampSeconds > nowSeconds + tolerance) {
          throw new InvalidWebhookSignatureError("Webhook timestamp is too new");
        }
        const signatures = signatureHeader.split(" ").map((part) => part.startsWith("v1,") ? part.substring(3) : part);
        const decodedSecret = secret.startsWith("whsec_") ? Buffer.from(secret.replace("whsec_", ""), "base64") : Buffer.from(secret, "utf-8");
        const signedPayload = webhookId ? `${webhookId}.${timestamp2}.${payload}` : `${timestamp2}.${payload}`;
        const key = await crypto.subtle.importKey("raw", decodedSecret, { name: "HMAC", hash: "SHA-256" }, false, ["verify"]);
        for (const signature of signatures) {
          try {
            const signatureBytes = Buffer.from(signature, "base64");
            const isValid3 = await crypto.subtle.verify("HMAC", key, signatureBytes, new TextEncoder().encode(signedPayload));
            if (isValid3) {
              return;
            }
          } catch {
            continue;
          }
        }
        throw new InvalidWebhookSignatureError("The given webhook signature does not match the expected signature");
      }
    };
    _Webhooks_instances = /* @__PURE__ */ new WeakSet(), _Webhooks_validateSecret = function _Webhooks_validateSecret2(secret) {
      if (typeof secret !== "string" || secret.length === 0) {
        throw new Error(`The webhook secret must either be set using the env var, OPENAI_WEBHOOK_SECRET, on the client class, OpenAI({ webhookSecret: '123' }), or passed to this function`);
      }
    }, _Webhooks_getRequiredHeader = function _Webhooks_getRequiredHeader2(headers, name) {
      if (!headers) {
        throw new Error(`Headers are required`);
      }
      const value = headers.get(name);
      if (value === null || value === void 0) {
        throw new Error(`Missing required header: ${name}`);
      }
      return value;
    };
  }
});

// node_modules/openai/resources/index.mjs
var init_resources = __esm({
  "node_modules/openai/resources/index.mjs"() {
    init_chat2();
    init_shared();
    init_audio();
    init_batches();
    init_beta();
    init_completions3();
    init_containers();
    init_conversations();
    init_embeddings();
    init_evals();
    init_files2();
    init_fine_tuning();
    init_graders2();
    init_images();
    init_models();
    init_moderations();
    init_realtime2();
    init_responses();
    init_uploads3();
    init_vector_stores();
    init_videos();
    init_webhooks();
  }
});

// node_modules/openai/client.mjs
var _OpenAI_instances, _a2, _OpenAI_encoder, _OpenAI_baseURLOverridden, OpenAI;
var init_client = __esm({
  "node_modules/openai/client.mjs"() {
    init_tslib();
    init_uuid();
    init_values();
    init_sleep();
    init_errors();
    init_detect_platform();
    init_shims();
    init_request_options();
    init_qs();
    init_version();
    init_error();
    init_pagination();
    init_uploads2();
    init_resources();
    init_api_promise();
    init_batches();
    init_completions3();
    init_embeddings();
    init_files2();
    init_images();
    init_models();
    init_moderations();
    init_videos();
    init_webhooks();
    init_audio();
    init_beta();
    init_chat();
    init_containers();
    init_conversations();
    init_evals();
    init_fine_tuning();
    init_graders2();
    init_realtime2();
    init_responses();
    init_uploads3();
    init_vector_stores();
    init_detect_platform();
    init_headers();
    init_env();
    init_log();
    init_values();
    OpenAI = class {
      /**
       * API Client for interfacing with the OpenAI API.
       *
       * @param {string | undefined} [opts.apiKey=process.env['OPENAI_API_KEY'] ?? undefined]
       * @param {string | null | undefined} [opts.organization=process.env['OPENAI_ORG_ID'] ?? null]
       * @param {string | null | undefined} [opts.project=process.env['OPENAI_PROJECT_ID'] ?? null]
       * @param {string | null | undefined} [opts.webhookSecret=process.env['OPENAI_WEBHOOK_SECRET'] ?? null]
       * @param {string} [opts.baseURL=process.env['OPENAI_BASE_URL'] ?? https://api.openai.com/v1] - Override the default base URL for the API.
       * @param {number} [opts.timeout=10 minutes] - The maximum amount of time (in milliseconds) the client will wait for a response before timing out.
       * @param {MergedRequestInit} [opts.fetchOptions] - Additional `RequestInit` options to be passed to `fetch` calls.
       * @param {Fetch} [opts.fetch] - Specify a custom `fetch` function implementation.
       * @param {number} [opts.maxRetries=2] - The maximum number of times the client will retry a request.
       * @param {HeadersLike} opts.defaultHeaders - Default headers to include with every request to the API.
       * @param {Record<string, string | undefined>} opts.defaultQuery - Default query parameters to include with every request to the API.
       * @param {boolean} [opts.dangerouslyAllowBrowser=false] - By default, client-side use of this library is not allowed, as it risks exposing your secret API credentials to attackers.
       */
      constructor({ baseURL = readEnv("OPENAI_BASE_URL"), apiKey = readEnv("OPENAI_API_KEY"), organization = readEnv("OPENAI_ORG_ID") ?? null, project = readEnv("OPENAI_PROJECT_ID") ?? null, webhookSecret = readEnv("OPENAI_WEBHOOK_SECRET") ?? null, ...opts } = {}) {
        _OpenAI_instances.add(this);
        _OpenAI_encoder.set(this, void 0);
        this.completions = new Completions2(this);
        this.chat = new Chat(this);
        this.embeddings = new Embeddings(this);
        this.files = new Files2(this);
        this.images = new Images(this);
        this.audio = new Audio(this);
        this.moderations = new Moderations(this);
        this.models = new Models(this);
        this.fineTuning = new FineTuning(this);
        this.graders = new Graders2(this);
        this.vectorStores = new VectorStores(this);
        this.webhooks = new Webhooks(this);
        this.beta = new Beta(this);
        this.batches = new Batches(this);
        this.uploads = new Uploads(this);
        this.responses = new Responses(this);
        this.realtime = new Realtime2(this);
        this.conversations = new Conversations(this);
        this.evals = new Evals(this);
        this.containers = new Containers(this);
        this.videos = new Videos(this);
        if (apiKey === void 0) {
          throw new OpenAIError("Missing credentials. Please pass an `apiKey`, or set the `OPENAI_API_KEY` environment variable.");
        }
        const options = {
          apiKey,
          organization,
          project,
          webhookSecret,
          ...opts,
          baseURL: baseURL || `https://api.openai.com/v1`
        };
        if (!options.dangerouslyAllowBrowser && isRunningInBrowser()) {
          throw new OpenAIError("It looks like you're running in a browser-like environment.\n\nThis is disabled by default, as it risks exposing your secret API credentials to attackers.\nIf you understand the risks and have appropriate mitigations in place,\nyou can set the `dangerouslyAllowBrowser` option to `true`, e.g.,\n\nnew OpenAI({ apiKey, dangerouslyAllowBrowser: true });\n\nhttps://help.openai.com/en/articles/5112595-best-practices-for-api-key-safety\n");
        }
        this.baseURL = options.baseURL;
        this.timeout = options.timeout ?? _a2.DEFAULT_TIMEOUT;
        this.logger = options.logger ?? console;
        const defaultLogLevel = "warn";
        this.logLevel = defaultLogLevel;
        this.logLevel = parseLogLevel(options.logLevel, "ClientOptions.logLevel", this) ?? parseLogLevel(readEnv("OPENAI_LOG"), "process.env['OPENAI_LOG']", this) ?? defaultLogLevel;
        this.fetchOptions = options.fetchOptions;
        this.maxRetries = options.maxRetries ?? 2;
        this.fetch = options.fetch ?? getDefaultFetch();
        __classPrivateFieldSet(this, _OpenAI_encoder, FallbackEncoder, "f");
        this._options = options;
        this.apiKey = typeof apiKey === "string" ? apiKey : "Missing Key";
        this.organization = organization;
        this.project = project;
        this.webhookSecret = webhookSecret;
      }
      /**
       * Create a new client instance re-using the same options given to the current client with optional overriding.
       */
      withOptions(options) {
        const client = new this.constructor({
          ...this._options,
          baseURL: this.baseURL,
          maxRetries: this.maxRetries,
          timeout: this.timeout,
          logger: this.logger,
          logLevel: this.logLevel,
          fetch: this.fetch,
          fetchOptions: this.fetchOptions,
          apiKey: this.apiKey,
          organization: this.organization,
          project: this.project,
          webhookSecret: this.webhookSecret,
          ...options
        });
        return client;
      }
      defaultQuery() {
        return this._options.defaultQuery;
      }
      validateHeaders({ values, nulls }) {
        return;
      }
      async authHeaders(opts) {
        return buildHeaders([{ Authorization: `Bearer ${this.apiKey}` }]);
      }
      stringifyQuery(query) {
        return stringify(query, { arrayFormat: "brackets" });
      }
      getUserAgent() {
        return `${this.constructor.name}/JS ${VERSION}`;
      }
      defaultIdempotencyKey() {
        return `stainless-node-retry-${uuid4()}`;
      }
      makeStatusError(status, error, message2, headers) {
        return APIError.generate(status, error, message2, headers);
      }
      async _callApiKey() {
        const apiKey = this._options.apiKey;
        if (typeof apiKey !== "function")
          return false;
        let token;
        try {
          token = await apiKey();
        } catch (err) {
          if (err instanceof OpenAIError)
            throw err;
          throw new OpenAIError(
            `Failed to get token from 'apiKey' function: ${err.message}`,
            // @ts-ignore
            { cause: err }
          );
        }
        if (typeof token !== "string" || !token) {
          throw new OpenAIError(`Expected 'apiKey' function argument to return a string but it returned ${token}`);
        }
        this.apiKey = token;
        return true;
      }
      buildURL(path2, query, defaultBaseURL) {
        const baseURL = !__classPrivateFieldGet(this, _OpenAI_instances, "m", _OpenAI_baseURLOverridden).call(this) && defaultBaseURL || this.baseURL;
        const url = isAbsoluteURL(path2) ? new URL(path2) : new URL(baseURL + (baseURL.endsWith("/") && path2.startsWith("/") ? path2.slice(1) : path2));
        const defaultQuery = this.defaultQuery();
        if (!isEmptyObj(defaultQuery)) {
          query = { ...defaultQuery, ...query };
        }
        if (typeof query === "object" && query && !Array.isArray(query)) {
          url.search = this.stringifyQuery(query);
        }
        return url.toString();
      }
      /**
       * Used as a callback for mutating the given `FinalRequestOptions` object.
       */
      async prepareOptions(options) {
        await this._callApiKey();
      }
      /**
       * Used as a callback for mutating the given `RequestInit` object.
       *
       * This is useful for cases where you want to add certain headers based off of
       * the request properties, e.g. `method` or `url`.
       */
      async prepareRequest(request, { url, options }) {
      }
      get(path2, opts) {
        return this.methodRequest("get", path2, opts);
      }
      post(path2, opts) {
        return this.methodRequest("post", path2, opts);
      }
      patch(path2, opts) {
        return this.methodRequest("patch", path2, opts);
      }
      put(path2, opts) {
        return this.methodRequest("put", path2, opts);
      }
      delete(path2, opts) {
        return this.methodRequest("delete", path2, opts);
      }
      methodRequest(method, path2, opts) {
        return this.request(Promise.resolve(opts).then((opts2) => {
          return { method, path: path2, ...opts2 };
        }));
      }
      request(options, remainingRetries = null) {
        return new APIPromise(this, this.makeRequest(options, remainingRetries, void 0));
      }
      async makeRequest(optionsInput, retriesRemaining, retryOfRequestLogID) {
        const options = await optionsInput;
        const maxRetries = options.maxRetries ?? this.maxRetries;
        if (retriesRemaining == null) {
          retriesRemaining = maxRetries;
        }
        await this.prepareOptions(options);
        const { req, url, timeout } = await this.buildRequest(options, {
          retryCount: maxRetries - retriesRemaining
        });
        await this.prepareRequest(req, { url, options });
        const requestLogID = "log_" + (Math.random() * (1 << 24) | 0).toString(16).padStart(6, "0");
        const retryLogStr = retryOfRequestLogID === void 0 ? "" : `, retryOf: ${retryOfRequestLogID}`;
        const startTime = Date.now();
        loggerFor(this).debug(`[${requestLogID}] sending request`, formatRequestDetails({
          retryOfRequestLogID,
          method: options.method,
          url,
          options,
          headers: req.headers
        }));
        if (options.signal?.aborted) {
          throw new APIUserAbortError();
        }
        const controller = new AbortController();
        const response = await this.fetchWithTimeout(url, req, timeout, controller).catch(castToError);
        const headersTime = Date.now();
        if (response instanceof globalThis.Error) {
          const retryMessage = `retrying, ${retriesRemaining} attempts remaining`;
          if (options.signal?.aborted) {
            throw new APIUserAbortError();
          }
          const isTimeout = isAbortError(response) || /timed? ?out/i.test(String(response) + ("cause" in response ? String(response.cause) : ""));
          if (retriesRemaining) {
            loggerFor(this).info(`[${requestLogID}] connection ${isTimeout ? "timed out" : "failed"} - ${retryMessage}`);
            loggerFor(this).debug(`[${requestLogID}] connection ${isTimeout ? "timed out" : "failed"} (${retryMessage})`, formatRequestDetails({
              retryOfRequestLogID,
              url,
              durationMs: headersTime - startTime,
              message: response.message
            }));
            return this.retryRequest(options, retriesRemaining, retryOfRequestLogID ?? requestLogID);
          }
          loggerFor(this).info(`[${requestLogID}] connection ${isTimeout ? "timed out" : "failed"} - error; no more retries left`);
          loggerFor(this).debug(`[${requestLogID}] connection ${isTimeout ? "timed out" : "failed"} (error; no more retries left)`, formatRequestDetails({
            retryOfRequestLogID,
            url,
            durationMs: headersTime - startTime,
            message: response.message
          }));
          if (isTimeout) {
            throw new APIConnectionTimeoutError();
          }
          throw new APIConnectionError({ cause: response });
        }
        const specialHeaders = [...response.headers.entries()].filter(([name]) => name === "x-request-id").map(([name, value]) => ", " + name + ": " + JSON.stringify(value)).join("");
        const responseInfo = `[${requestLogID}${retryLogStr}${specialHeaders}] ${req.method} ${url} ${response.ok ? "succeeded" : "failed"} with status ${response.status} in ${headersTime - startTime}ms`;
        if (!response.ok) {
          const shouldRetry = await this.shouldRetry(response);
          if (retriesRemaining && shouldRetry) {
            const retryMessage2 = `retrying, ${retriesRemaining} attempts remaining`;
            await CancelReadableStream(response.body);
            loggerFor(this).info(`${responseInfo} - ${retryMessage2}`);
            loggerFor(this).debug(`[${requestLogID}] response error (${retryMessage2})`, formatRequestDetails({
              retryOfRequestLogID,
              url: response.url,
              status: response.status,
              headers: response.headers,
              durationMs: headersTime - startTime
            }));
            return this.retryRequest(options, retriesRemaining, retryOfRequestLogID ?? requestLogID, response.headers);
          }
          const retryMessage = shouldRetry ? `error; no more retries left` : `error; not retryable`;
          loggerFor(this).info(`${responseInfo} - ${retryMessage}`);
          const errText = await response.text().catch((err2) => castToError(err2).message);
          const errJSON = safeJSON(errText);
          const errMessage = errJSON ? void 0 : errText;
          loggerFor(this).debug(`[${requestLogID}] response error (${retryMessage})`, formatRequestDetails({
            retryOfRequestLogID,
            url: response.url,
            status: response.status,
            headers: response.headers,
            message: errMessage,
            durationMs: Date.now() - startTime
          }));
          const err = this.makeStatusError(response.status, errJSON, errMessage, response.headers);
          throw err;
        }
        loggerFor(this).info(responseInfo);
        loggerFor(this).debug(`[${requestLogID}] response start`, formatRequestDetails({
          retryOfRequestLogID,
          url: response.url,
          status: response.status,
          headers: response.headers,
          durationMs: headersTime - startTime
        }));
        return { response, options, controller, requestLogID, retryOfRequestLogID, startTime };
      }
      getAPIList(path2, Page2, opts) {
        return this.requestAPIList(Page2, { method: "get", path: path2, ...opts });
      }
      requestAPIList(Page2, options) {
        const request = this.makeRequest(options, null, void 0);
        return new PagePromise(this, request, Page2);
      }
      async fetchWithTimeout(url, init, ms, controller) {
        const { signal, method, ...options } = init || {};
        if (signal)
          signal.addEventListener("abort", () => controller.abort());
        const timeout = setTimeout(() => controller.abort(), ms);
        const isReadableBody = globalThis.ReadableStream && options.body instanceof globalThis.ReadableStream || typeof options.body === "object" && options.body !== null && Symbol.asyncIterator in options.body;
        const fetchOptions = {
          signal: controller.signal,
          ...isReadableBody ? { duplex: "half" } : {},
          method: "GET",
          ...options
        };
        if (method) {
          fetchOptions.method = method.toUpperCase();
        }
        try {
          return await this.fetch.call(void 0, url, fetchOptions);
        } finally {
          clearTimeout(timeout);
        }
      }
      async shouldRetry(response) {
        const shouldRetryHeader = response.headers.get("x-should-retry");
        if (shouldRetryHeader === "true")
          return true;
        if (shouldRetryHeader === "false")
          return false;
        if (response.status === 408)
          return true;
        if (response.status === 409)
          return true;
        if (response.status === 429)
          return true;
        if (response.status >= 500)
          return true;
        return false;
      }
      async retryRequest(options, retriesRemaining, requestLogID, responseHeaders) {
        let timeoutMillis;
        const retryAfterMillisHeader = responseHeaders?.get("retry-after-ms");
        if (retryAfterMillisHeader) {
          const timeoutMs = parseFloat(retryAfterMillisHeader);
          if (!Number.isNaN(timeoutMs)) {
            timeoutMillis = timeoutMs;
          }
        }
        const retryAfterHeader = responseHeaders?.get("retry-after");
        if (retryAfterHeader && !timeoutMillis) {
          const timeoutSeconds = parseFloat(retryAfterHeader);
          if (!Number.isNaN(timeoutSeconds)) {
            timeoutMillis = timeoutSeconds * 1e3;
          } else {
            timeoutMillis = Date.parse(retryAfterHeader) - Date.now();
          }
        }
        if (!(timeoutMillis && 0 <= timeoutMillis && timeoutMillis < 60 * 1e3)) {
          const maxRetries = options.maxRetries ?? this.maxRetries;
          timeoutMillis = this.calculateDefaultRetryTimeoutMillis(retriesRemaining, maxRetries);
        }
        await sleep(timeoutMillis);
        return this.makeRequest(options, retriesRemaining - 1, requestLogID);
      }
      calculateDefaultRetryTimeoutMillis(retriesRemaining, maxRetries) {
        const initialRetryDelay = 0.5;
        const maxRetryDelay = 8;
        const numRetries = maxRetries - retriesRemaining;
        const sleepSeconds = Math.min(initialRetryDelay * Math.pow(2, numRetries), maxRetryDelay);
        const jitter = 1 - Math.random() * 0.25;
        return sleepSeconds * jitter * 1e3;
      }
      async buildRequest(inputOptions, { retryCount = 0 } = {}) {
        const options = { ...inputOptions };
        const { method, path: path2, query, defaultBaseURL } = options;
        const url = this.buildURL(path2, query, defaultBaseURL);
        if ("timeout" in options)
          validatePositiveInteger("timeout", options.timeout);
        options.timeout = options.timeout ?? this.timeout;
        const { bodyHeaders, body } = this.buildBody({ options });
        const reqHeaders = await this.buildHeaders({ options: inputOptions, method, bodyHeaders, retryCount });
        const req = {
          method,
          headers: reqHeaders,
          ...options.signal && { signal: options.signal },
          ...globalThis.ReadableStream && body instanceof globalThis.ReadableStream && { duplex: "half" },
          ...body && { body },
          ...this.fetchOptions ?? {},
          ...options.fetchOptions ?? {}
        };
        return { req, url, timeout: options.timeout };
      }
      async buildHeaders({ options, method, bodyHeaders, retryCount }) {
        let idempotencyHeaders = {};
        if (this.idempotencyHeader && method !== "get") {
          if (!options.idempotencyKey)
            options.idempotencyKey = this.defaultIdempotencyKey();
          idempotencyHeaders[this.idempotencyHeader] = options.idempotencyKey;
        }
        const headers = buildHeaders([
          idempotencyHeaders,
          {
            Accept: "application/json",
            "User-Agent": this.getUserAgent(),
            "X-Stainless-Retry-Count": String(retryCount),
            ...options.timeout ? { "X-Stainless-Timeout": String(Math.trunc(options.timeout / 1e3)) } : {},
            ...getPlatformHeaders(),
            "OpenAI-Organization": this.organization,
            "OpenAI-Project": this.project
          },
          await this.authHeaders(options),
          this._options.defaultHeaders,
          bodyHeaders,
          options.headers
        ]);
        this.validateHeaders(headers);
        return headers.values;
      }
      buildBody({ options: { body, headers: rawHeaders } }) {
        if (!body) {
          return { bodyHeaders: void 0, body: void 0 };
        }
        const headers = buildHeaders([rawHeaders]);
        if (
          // Pass raw type verbatim
          ArrayBuffer.isView(body) || body instanceof ArrayBuffer || body instanceof DataView || typeof body === "string" && // Preserve legacy string encoding behavior for now
          headers.values.has("content-type") || // `Blob` is superset of `File`
          globalThis.Blob && body instanceof globalThis.Blob || // `FormData` -> `multipart/form-data`
          body instanceof FormData || // `URLSearchParams` -> `application/x-www-form-urlencoded`
          body instanceof URLSearchParams || // Send chunked stream (each chunk has own `length`)
          globalThis.ReadableStream && body instanceof globalThis.ReadableStream
        ) {
          return { bodyHeaders: void 0, body };
        } else if (typeof body === "object" && (Symbol.asyncIterator in body || Symbol.iterator in body && "next" in body && typeof body.next === "function")) {
          return { bodyHeaders: void 0, body: ReadableStreamFrom(body) };
        } else {
          return __classPrivateFieldGet(this, _OpenAI_encoder, "f").call(this, { body, headers });
        }
      }
    };
    _a2 = OpenAI, _OpenAI_encoder = /* @__PURE__ */ new WeakMap(), _OpenAI_instances = /* @__PURE__ */ new WeakSet(), _OpenAI_baseURLOverridden = function _OpenAI_baseURLOverridden2() {
      return this.baseURL !== "https://api.openai.com/v1";
    };
    OpenAI.OpenAI = _a2;
    OpenAI.DEFAULT_TIMEOUT = 6e5;
    OpenAI.OpenAIError = OpenAIError;
    OpenAI.APIError = APIError;
    OpenAI.APIConnectionError = APIConnectionError;
    OpenAI.APIConnectionTimeoutError = APIConnectionTimeoutError;
    OpenAI.APIUserAbortError = APIUserAbortError;
    OpenAI.NotFoundError = NotFoundError;
    OpenAI.ConflictError = ConflictError;
    OpenAI.RateLimitError = RateLimitError;
    OpenAI.BadRequestError = BadRequestError;
    OpenAI.AuthenticationError = AuthenticationError;
    OpenAI.InternalServerError = InternalServerError;
    OpenAI.PermissionDeniedError = PermissionDeniedError;
    OpenAI.UnprocessableEntityError = UnprocessableEntityError;
    OpenAI.InvalidWebhookSignatureError = InvalidWebhookSignatureError;
    OpenAI.toFile = toFile;
    OpenAI.Completions = Completions2;
    OpenAI.Chat = Chat;
    OpenAI.Embeddings = Embeddings;
    OpenAI.Files = Files2;
    OpenAI.Images = Images;
    OpenAI.Audio = Audio;
    OpenAI.Moderations = Moderations;
    OpenAI.Models = Models;
    OpenAI.FineTuning = FineTuning;
    OpenAI.Graders = Graders2;
    OpenAI.VectorStores = VectorStores;
    OpenAI.Webhooks = Webhooks;
    OpenAI.Beta = Beta;
    OpenAI.Batches = Batches;
    OpenAI.Uploads = Uploads;
    OpenAI.Responses = Responses;
    OpenAI.Realtime = Realtime2;
    OpenAI.Conversations = Conversations;
    OpenAI.Evals = Evals;
    OpenAI.Containers = Containers;
    OpenAI.Videos = Videos;
  }
});

// node_modules/openai/azure.mjs
var init_azure = __esm({
  "node_modules/openai/azure.mjs"() {
    init_headers();
    init_error2();
    init_utils2();
    init_client();
  }
});

// node_modules/openai/index.mjs
var init_openai = __esm({
  "node_modules/openai/index.mjs"() {
    init_client();
    init_uploads2();
    init_api_promise();
    init_client();
    init_pagination();
    init_error();
    init_azure();
  }
});

// server/lib/openai.ts
var openai_exports = {};
__export(openai_exports, {
  analyzeRejectionReason: () => analyzeRejectionReason,
  calculateAcceptanceProb: () => calculateAcceptanceProb,
  calculatePriority: () => calculatePriority2,
  calculateUrgencyScore: () => calculateUrgencyScore,
  generateCommunicationRuleMessage: () => generateCommunicationRuleMessage,
  generateMessageIA: () => generateMessageIA,
  generatePostVisitMessage: () => generatePostVisitMessage,
  generatePreventiveHealthMessage: () => generatePreventiveHealthMessage,
  generateRelanceMessage: () => generateRelanceMessage,
  generateReminderMessage: () => generateReminderMessage
});
async function calculateUrgencyScore(budgetDetails, patientData) {
  if (!process.env.OPENAI_API_KEY) {
    let score = 50;
    if (budgetDetails.procedures?.some(
      (p) => p.toLowerCase().includes("dolor") || p.toLowerCase().includes("urgencia") || p.toLowerCase().includes("infecci\xF3n")
    )) {
      score = 85;
    }
    if (patientData.edad > 65) score += 10;
    return Math.min(100, score);
  }
  try {
    const prompt = `Eres un agente IA dental experto. Analiza este tratamiento dental y calcula un score de urgencia de 0-100.

Datos del tratamiento:
- Procedimientos: ${JSON.stringify(budgetDetails.treatmentDetails?.procedures || budgetDetails.procedures || [])}
- Monto total: ${budgetDetails.amount}\u20AC
- Edad del paciente: ${patientData.edad} a\xF1os
- Historial: ${patientData.historial || "Sin historial disponible"}

Considera:
- Dolor o molestias mencionadas (aumenta urgencia)
- Tipo de procedimiento (preventivo vs urgente)
- Edad del paciente (mayor edad puede aumentar urgencia)
- Complejidad del tratamiento

Responde SOLO con un n\xFAmero del 0 al 100, sin texto adicional.`;
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 10
    });
    const score = parseInt(response.choices[0]?.message?.content?.trim() || "50");
    return Math.max(0, Math.min(100, score));
  } catch (error) {
    console.error("Error calculating urgency score:", error);
    return 50;
  }
}
async function calculateAcceptanceProb(budgetDetails, patientData) {
  if (!process.env.OPENAI_API_KEY) {
    let prob = 60;
    const avgBudget = patientData.budgetsAnteriores?.length ? patientData.budgetsAnteriores.reduce((sum, b) => sum + Number(b.amount), 0) / patientData.budgetsAnteriores.length : 0;
    if (avgBudget > 0 && Number(budgetDetails.amount) <= avgBudget * 1.2) {
      prob = 75;
    } else if (Number(budgetDetails.amount) > avgBudget * 1.5) {
      prob = 40;
    }
    const acceptanceRate = patientData.budgetsAnteriores?.filter((b) => b.status === "accepted").length || 0;
    if (acceptanceRate > 0) prob += 15;
    return Math.max(0, Math.min(100, prob));
  }
  try {
    const historialText = patientData.budgetsAnteriores?.length ? `Historial de presupuestos anteriores: ${JSON.stringify(patientData.budgetsAnteriores)}` : "Sin historial de presupuestos anteriores";
    const prompt = `Eres un agente IA dental experto. Calcula la probabilidad de aceptaci\xF3n (0-100) de este presupuesto.

Datos del paciente:
- Nombre: ${patientData.nombre}
- Edad: ${patientData.edad} a\xF1os
${historialText}

Datos del presupuesto:
- Monto: ${budgetDetails.amount}\u20AC
- Tratamiento: ${JSON.stringify(budgetDetails.treatmentDetails?.procedures || [])}

Considera:
- Historial de aceptaci\xF3n/rechazo de presupuestos anteriores
- Comparaci\xF3n del precio con presupuestos anteriores
- Tipo de tratamiento (preventivo vs est\xE9tico vs urgente)
- Patrones de comportamiento del paciente

Responde SOLO con un n\xFAmero del 0 al 100, sin texto adicional.`;
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 10
    });
    const prob = parseInt(response.choices[0]?.message?.content?.trim() || "60");
    return Math.max(0, Math.min(100, prob));
  } catch (error) {
    console.error("Error calculating acceptance probability:", error);
    return 60;
  }
}
async function generateRelanceMessage(patientData, budgetDetails, channel, diasPendientes) {
  if (!process.env.OPENAI_API_KEY) {
    const baseMessage = `Hola ${patientData.nombre}, le recordamos que tiene un presupuesto pendiente de ${budgetDetails.amount}\u20AC para ${budgetDetails.treatmentDetails?.procedures?.[0] || "tratamiento dental"}.`;
    const callToAction = channel === "whatsapp" ? "\xBFLe gustar\xEDa agendar una cita para revisarlo?" : "Por favor, cont\xE1ctenos para m\xE1s informaci\xF3n.";
    return `${baseMessage} ${callToAction}`;
  }
  try {
    const prompt = `Eres un agente IA dental amigable y emp\xE1tico. Genera un mensaje de relance personalizado para un presupuesto pendiente.

Paciente: ${patientData.nombre}
Presupuesto: ${budgetDetails.amount}\u20AC para ${JSON.stringify(budgetDetails.treatmentDetails?.procedures || [])}
D\xEDas pendientes: ${diasPendientes} d\xEDas
Canal: ${channel}
Edad paciente: ${patientData.edad} a\xF1os

Requisitos:
- Tono amigable y humano, no rob\xF3tico
- Empat\xEDa y comprensi\xF3n
- Frecuencia basada en d\xEDas pendientes (${diasPendientes} d\xEDas)
- Incluir llamada a la acci\xF3n suave
- Adaptado al canal (${channel})
- En espa\xF1ol o franc\xE9s seg\xFAn corresponda
- M\xE1ximo 160 caracteres si es SMS, m\xE1s largo si es email/WhatsApp

Genera SOLO el mensaje, sin explicaciones adicionales.`;
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: channel === "sms" ? 100 : 200
    });
    return response.choices[0]?.message?.content?.trim() || "";
  } catch (error) {
    console.error("Error generating relance message:", error);
    return `Hola ${patientData.nombre}, le recordamos su presupuesto pendiente de ${budgetDetails.amount}\u20AC. \xBFLe gustar\xEDa agendar una cita?`;
  }
}
async function generatePostVisitMessage(patientData, treatment) {
  if (!process.env.OPENAI_API_KEY) {
    return `Hola ${patientData.nombre}, esperamos que su tratamiento de ${treatment} haya ido bien. \xBFC\xF3mo se siente? Su opini\xF3n es muy importante para nosotros.`;
  }
  try {
    const prompt = `Eres un agente IA dental amigable. Genera un mensaje post-visita de fidelizaci\xF3n.

Paciente: ${patientData.nombre}
Tratamiento realizado: ${treatment}
Edad: ${patientData.edad} a\xF1os

Objetivos:
- Preguntar por feedback
- Fomentar rese\xF1as positivas
- Sugerir cuidados preventivos (upsell suave)
- Tono c\xE1lido y personalizado
- En espa\xF1ol o franc\xE9s

Genera SOLO el mensaje, sin explicaciones.`;
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 150
    });
    return response.choices[0]?.message?.content?.trim() || "";
  } catch (error) {
    console.error("Error generating post-visit message:", error);
    return `Hola ${patientData.nombre}, esperamos que su tratamiento haya ido bien. \xBFC\xF3mo se siente?`;
  }
}
async function generateReminderMessage(patientData, appointmentDate, treatment, hoursBefore) {
  if (!process.env.OPENAI_API_KEY) {
    const timeText = hoursBefore >= 24 ? "ma\xF1ana" : `en ${hoursBefore} horas`;
    return `Hola ${patientData.nombre}, le recordamos su cita ${timeText} para ${treatment}. Le esperamos.`;
  }
  try {
    const prompt = `Eres un agente IA dental. Genera un recordatorio de cita personalizado.

Paciente: ${patientData.nombre}
Fecha cita: ${appointmentDate.toLocaleString("es-ES")}
Tratamiento: ${treatment}
Horas antes: ${hoursBefore} horas
Edad: ${patientData.edad} a\xF1os

Requisitos:
- Personalizado seg\xFAn perfil del paciente
- Tono amigable
- Incluir fecha/hora de la cita
- Recordatorio de reprogramaci\xF3n si es necesario
- En espa\xF1ol o franc\xE9s

Genera SOLO el mensaje.`;
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.6,
      max_tokens: 120
    });
    return response.choices[0]?.message?.content?.trim() || "";
  } catch (error) {
    console.error("Error generating reminder message:", error);
    return `Hola ${patientData.nombre}, le recordamos su cita para ${treatment}.`;
  }
}
async function analyzeRejectionReason(budgetDetails, patientData) {
  if (!process.env.OPENAI_API_KEY) {
    return {
      motivo: "precio",
      detalles: "Posible rechazo por precio elevado comparado con presupuestos anteriores."
    };
  }
  try {
    const prompt = `Eres un agente IA dental experto. Analiza el motivo probable de rechazo de este presupuesto.

Paciente: ${patientData.nombre}
Presupuesto: ${budgetDetails.amount}\u20AC
Tratamiento: ${JSON.stringify(budgetDetails.treatmentDetails?.procedures || [])}
Historial: ${JSON.stringify(patientData.budgetsAnteriores || [])}

Posibles motivos:
- precio (demasiado caro)
- miedo (ansiedad dental)
- comprension (no entiende el tratamiento)
- urgencia (no es urgente para el paciente)
- otro

Responde en formato JSON:
{
  "motivo": "precio|miedo|comprension|urgencia|otro",
  "detalles": "Explicaci\xF3n breve del an\xE1lisis"
}`;
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.5,
      max_tokens: 200
    });
    const content = response.choices[0]?.message?.content?.trim() || "";
    try {
      return JSON.parse(content);
    } catch {
      return {
        motivo: "otro",
        detalles: content
      };
    }
  } catch (error) {
    console.error("Error analyzing rejection reason:", error);
    return {
      motivo: "otro",
      detalles: "No se pudo analizar el motivo del rechazo."
    };
  }
}
function calculatePriority2(urgencyScore, acceptanceProb) {
  const combinedScore = urgencyScore * 0.6 + acceptanceProb * 0.4;
  if (combinedScore >= 75) return "high";
  if (combinedScore >= 50) return "medium";
  return "low";
}
async function generatePreventiveHealthMessage(patientData, tipoTratamiento, diasVencidos, canal, intento) {
  if (!process.env.OPENAI_API_KEY) {
    const mensajes2 = {
      1: `Hola ${patientData.nombre}, es momento de agendar tu ${tipoTratamiento}. Han pasado ${Math.floor(diasVencidos / 30)} meses desde tu \xFAltima visita. \xBFTe gustar\xEDa agendar una cita?`,
      2: `${patientData.nombre}, recordatorio: es hora de tu ${tipoTratamiento}. Han pasado ${Math.floor(diasVencidos / 30)} meses. Ll\xE1manos para agendar.`,
      3: `Estimado/a ${patientData.nombre}, le recordamos que es momento de agendar su ${tipoTratamiento}. Han pasado ${Math.floor(diasVencidos / 30)} meses desde su \xFAltima visita. La salud bucal preventiva es fundamental.`
    };
    return mensajes2[intento] || mensajes2[1];
  }
  try {
    const prompt = `Eres un agente IA dental amigable y experto en salud preventiva. Genera un mensaje de recordatorio para tratamiento preventivo.

Paciente: ${patientData.nombre}
Edad: ${patientData.edad} a\xF1os
Tratamiento: ${tipoTratamiento}
D\xEDas desde \xFAltima visita: ${diasVencidos} d\xEDas (${Math.floor(diasVencidos / 30)} meses)
Canal: ${canal}
Intento: ${intento === 1 ? "Primer contacto (WhatsApp)" : intento === 2 ? "Segundo contacto (SMS)" : "Tercer contacto (Email)"}

Objetivos:
- Recordar la importancia de la salud preventiva
- Motivar a agendar cita para ${tipoTratamiento}
- Tono ${intento === 1 ? "amigable y cercano" : intento === 2 ? "directo pero amable" : "profesional y educativo"}
- Adaptado al canal (${canal})
- En espa\xF1ol o franc\xE9s seg\xFAn corresponda
- ${intento === 1 ? "Mensaje corto y personal" : intento === 2 ? "Mensaje breve" : "Mensaje m\xE1s completo con beneficios"}
- Incluir llamada a la acci\xF3n clara

Genera SOLO el mensaje, sin explicaciones.`;
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: canal === "sms" ? 120 : canal === "whatsapp" ? 200 : 300
    });
    return response.choices[0]?.message?.content?.trim() || "";
  } catch (error) {
    console.error("Error generating preventive health message:", error);
    return `Hola ${patientData.nombre}, es momento de agendar tu ${tipoTratamiento}. Han pasado ${Math.floor(diasVencidos / 30)} meses desde tu \xFAltima visita.`;
  }
}
async function generateCommunicationRuleMessage(tipo, canal, pasoNumero, contexto) {
  if (!process.env.OPENAI_API_KEY) {
    const nombre = contexto?.nombrePaciente || "{nombre}";
    const monto = contexto?.monto || "{monto}";
    const tratamiento = contexto?.tratamiento || "{tratamiento}";
    const mensajesFallback = {
      relance_presupuesto: {
        whatsapp: `Hola ${nombre}, \u{1F44B}

Te recordamos que tienes un presupuesto pendiente de ${monto}\u20AC para ${tratamiento}.

\xBFTe gustar\xEDa agendar una cita para revisarlo?`,
        sms: `Hola ${nombre}, tienes un presupuesto pendiente de ${monto}\u20AC. \xBFQuieres agendar cita?`,
        email: `Estimado/a ${nombre},

Le recordamos que tiene un presupuesto pendiente de ${monto}\u20AC para ${tratamiento}.

Por favor, cont\xE1ctenos para agendar su cita.`,
        llamada: "Llamada telef\xF3nica para recordar el presupuesto pendiente y ofrecer agendar cita"
      },
      recall_paciente: {
        whatsapp: `Hola ${nombre}, \u{1F44B}

Hace tiempo que no te vemos por la cl\xEDnica. \xBFTe gustar\xEDa agendar una revisi\xF3n para cuidar tu salud bucal?

Estamos aqu\xED para ayudarte. \u{1F60A}`,
        sms: `Hola ${nombre}, hace tiempo que no te vemos. \xBFTe gustar\xEDa agendar una revisi\xF3n?`,
        email: `Estimado/a ${nombre},

Hace tiempo que no nos visita. Le invitamos a agendar una revisi\xF3n para cuidar su salud bucal.`,
        llamada: "Llamada telef\xF3nica para invitar al paciente a agendar una revisi\xF3n"
      },
      recordatorio_cita: {
        whatsapp: `Hola ${nombre}, \u{1F44B}

Te recordamos tu cita para ${tratamiento}. Te esperamos.`,
        sms: `Hola ${nombre}, recordatorio: tienes cita para ${tratamiento}.`,
        email: `Estimado/a ${nombre},

Le recordamos su cita para ${tratamiento}.

Le esperamos.`,
        llamada: "Llamada telef\xF3nica para recordar la cita"
      },
      post_visita: {
        whatsapp: `Hola ${nombre}, \u{1F44B}

Esperamos que tu tratamiento haya ido bien. \xBFC\xF3mo te sientes? Tu opini\xF3n es muy importante.`,
        sms: `Hola ${nombre}, esperamos que tu tratamiento haya ido bien. \xBFC\xF3mo te sientes?`,
        email: `Estimado/a ${nombre},

Esperamos que su tratamiento haya ido bien. Su opini\xF3n es muy importante para nosotros.`,
        llamada: "Llamada telef\xF3nica para preguntar por el bienestar del paciente"
      },
      salud_preventiva: {
        whatsapp: `Hola ${nombre}, \u{1F44B}

Es momento de agendar tu ${tratamiento}. La salud preventiva es fundamental.`,
        sms: `Hola ${nombre}, es hora de tu ${tratamiento}. Ll\xE1manos para agendar.`,
        email: `Estimado/a ${nombre},

Le recordamos que es momento de agendar su ${tratamiento}. La salud bucal preventiva es fundamental.`,
        llamada: "Llamada telef\xF3nica para recordar tratamiento preventivo"
      }
    };
    return mensajesFallback[tipo]?.[canal] || `Mensaje para ${tipo} v\xEDa ${canal}`;
  }
  try {
    let prompt = `Eres un agente IA dental amigable y emp\xE1tico. Genera un mensaje personalizado para una campa\xF1a de comunicaci\xF3n dental.

Tipo de campa\xF1a: ${tipo.replace(/_/g, " ")}
Canal: ${canal}
Paso n\xFAmero: ${pasoNumero}${contexto?.nombrePaciente ? `
Paciente: ${contexto.nombrePaciente}` : ""}${contexto?.monto ? `
Monto: ${contexto.monto}\u20AC` : ""}${contexto?.tratamiento ? `
Tratamiento: ${contexto.tratamiento}` : ""}${contexto?.diasPendientes ? `
D\xEDas pendientes: ${contexto.diasPendientes}` : ""}${contexto?.fechaCita ? `
Fecha cita: ${contexto.fechaCita.toLocaleString("es-ES")}` : ""}${contexto?.tipoTratamiento ? `
Tipo tratamiento: ${contexto.tipoTratamiento}` : ""}

Requisitos:
- Tono amigable y humano, no rob\xF3tico
- Empat\xEDa y comprensi\xF3n
- Adaptado al canal (${canal})
- En espa\xF1ol o franc\xE9s seg\xFAn corresponda
- ${canal === "sms" ? "M\xE1ximo 160 caracteres" : canal === "whatsapp" ? "Mensaje personal y cercano" : canal === "email" ? "Mensaje profesional pero c\xE1lido" : "Gui\xF3n breve para llamada"}
- Incluir llamada a la acci\xF3n apropiada
- ${pasoNumero > 1 ? `Este es el paso ${pasoNumero}, adapta el tono seg\xFAn la progresi\xF3n de la campa\xF1a` : "Este es el primer contacto"}

Genera SOLO el mensaje, sin explicaciones adicionales.`;
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: canal === "sms" ? 100 : canal === "whatsapp" ? 200 : canal === "email" ? 300 : 150
    });
    return response.choices[0]?.message?.content?.trim() || "";
  } catch (error) {
    console.error("Error generating communication rule message:", error);
    return `Mensaje para ${tipo} v\xEDa ${canal}`;
  }
}
async function generateMessageIA(params) {
  const { tipo, canal, contexto } = params;
  if (tipo === "contacto_hueco_libre" || tipo === "recordatorio_cita") {
    if (contexto.cita && contexto.paciente) {
      const fechaCita = /* @__PURE__ */ new Date(`${contexto.cita.fecha}T${contexto.cita.hora}`);
      return await generateReminderMessage(
        {
          nombre: contexto.paciente.nombre,
          edad: contexto.paciente.edad || 30
        },
        fechaCita,
        contexto.cita.tipo,
        24
      );
    }
  }
  return await generateCommunicationRuleMessage(
    tipo,
    canal,
    1,
    {
      nombrePaciente: contexto.paciente?.nombre,
      tratamiento: contexto.cita?.tipo,
      fechaCita: contexto.cita ? /* @__PURE__ */ new Date(`${contexto.cita.fecha}T${contexto.cita.hora}`) : void 0
    }
  );
}
var openai;
var init_openai2 = __esm({
  "server/lib/openai.ts"() {
    "use strict";
    init_openai();
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || ""
    });
  }
});

// server/storage.ts
var storage_exports = {};
__export(storage_exports, {
  MemStorage: () => MemStorage,
  storage: () => storage
});
import { randomUUID } from "crypto";
var MemStorage, storage;
var init_storage = __esm({
  "server/storage.ts"() {
    "use strict";
    init_mockData();
    init_openai2();
    MemStorage = class {
      pacientes;
      campanas;
      tareas;
      conversaciones;
      mensajes;
      citas;
      recordatorios;
      budgets;
      clinics;
      users;
      acciones;
      tratamientosPreventivos;
      reglasComunicacion;
      secuenciasComunicacion;
      // Reglas de frecuencia para tratamientos preventivos
      reglasFrecuencia = [
        { tipoTratamiento: "limpieza", frecuenciaMeses: 6, nombre: "Limpieza dental" },
        { tipoTratamiento: "revision", frecuenciaMeses: 12, nombre: "Revisi\xF3n general" },
        { tipoTratamiento: "fluorizacion", frecuenciaMeses: 6, nombre: "Fluorizaci\xF3n" },
        { tipoTratamiento: "selladores", frecuenciaMeses: 12, nombre: "Selladores" },
        { tipoTratamiento: "ortodoncia_revision", frecuenciaMeses: 3, nombre: "Revisi\xF3n ortodoncia" }
      ];
      initializationPromise = null;
      constructor() {
        this.pacientes = /* @__PURE__ */ new Map();
        this.campanas = /* @__PURE__ */ new Map();
        this.tareas = /* @__PURE__ */ new Map();
        this.conversaciones = /* @__PURE__ */ new Map();
        this.mensajes = /* @__PURE__ */ new Map();
        this.citas = /* @__PURE__ */ new Map();
        this.recordatorios = /* @__PURE__ */ new Map();
        this.budgets = /* @__PURE__ */ new Map();
        this.clinics = /* @__PURE__ */ new Map();
        this.users = /* @__PURE__ */ new Map();
        this.acciones = /* @__PURE__ */ new Map();
        this.tratamientosPreventivos = /* @__PURE__ */ new Map();
        this.reglasComunicacion = /* @__PURE__ */ new Map();
        this.secuenciasComunicacion = /* @__PURE__ */ new Map();
        this.inicializarMockData();
        this.initializationPromise = this.initializeAsync();
      }
      async initializeAsync() {
        try {
          await this.inicializarSecuenciasParaPresupuestosExistentes();
          await this.inicializarSecuenciasParaPacientesDormidos();
          this.iniciarAutomatizaciones();
          console.log("[Storage] Async initialization completed");
        } catch (error) {
          console.error("[Storage] Error during async initialization:", error);
        }
      }
      // Método para asegurar que la inicialización esté completa
      async ensureInitialized() {
        try {
          if (this.pacientes.size === 0 || this.budgets.size === 0) {
            console.log("[Storage] ensureInitialized: No data found, reinitializing...");
            console.log("[Storage] Current state - pacientes:", this.pacientes.size, "budgets:", this.budgets.size);
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
            try {
              this.inicializarMockData();
            } catch (error) {
              console.error("[Storage] ERROR in inicializarMockData:", error);
              if (error instanceof Error) {
                console.error("[Storage] Error message:", error.message);
                console.error("[Storage] Error stack:", error.stack);
              }
              throw error;
            }
            const pacientesCount2 = this.pacientes.size;
            const budgetsCount2 = this.budgets.size;
            console.log(`[Storage] After reinitialization - pacientes: ${pacientesCount2}, budgets: ${budgetsCount2}`);
            if (pacientesCount2 === 0 || budgetsCount2 === 0) {
              console.error("[Storage] WARNING: Data still empty after reinitialization!");
              console.error("[Storage] Endpoints will return empty arrays instead of crashing");
            }
          }
          if (this.initializationPromise) {
            try {
              await this.initializationPromise;
            } catch (error) {
              console.error("[Storage] Error in async initialization, but continuing:", error);
            }
          }
          const pacientesCount = this.pacientes.size;
          const budgetsCount = this.budgets.size;
          console.log(`[Storage] ensureInitialized completed - pacientes: ${pacientesCount}, budgets: ${budgetsCount}`);
        } catch (error) {
          console.error("[Storage] ERROR in ensureInitialized:", error);
          if (error instanceof Error) {
            console.error("[Storage] Error message:", error.message);
            console.error("[Storage] Error stack:", error.stack);
          }
          throw error;
        }
      }
      inicializarMockData() {
        try {
          console.log("[Storage] Starting mock data initialization...");
          console.log("[Storage] Environment:", process.env.NODE_ENV, "VERCEL:", process.env.VERCEL);
          const hasData = this.pacientes.size > 0 || this.budgets.size > 0;
          if (hasData) {
            console.log("[Storage] WARNING: Data already exists! Clearing before reinitialization...");
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
          const clinics2 = generarClinicsMock();
          clinics2.forEach((clinic) => {
            this.clinics.set(clinic.id, clinic);
          });
          console.log(`[Storage] \u2713 Loaded ${clinics2.length} clinics`);
          let pacientes2;
          try {
            pacientes2 = generarPacientesMock();
            if (!pacientes2 || pacientes2.length === 0) {
              throw new Error("generarPacientesMock returned empty array");
            }
            pacientes2.forEach((paciente) => {
              this.pacientes.set(paciente.id, paciente);
            });
            console.log(`[Storage] \u2713 Loaded ${pacientes2.length} pacientes`);
          } catch (error) {
            console.error("[Storage] ERROR generating pacientes:", error);
            throw new Error(`Failed to generate pacientes: ${error instanceof Error ? error.message : String(error)}`);
          }
          let budgets2;
          try {
            budgets2 = generarBudgetsMock(pacientes2);
            if (!budgets2 || budgets2.length === 0) {
              throw new Error("generarBudgetsMock returned empty array");
            }
            budgets2.forEach((budget) => {
              this.budgets.set(budget.id, budget);
            });
            console.log(`[Storage] \u2713 Loaded ${budgets2.length} budgets`);
          } catch (error) {
            console.error("[Storage] ERROR generating budgets:", error);
            throw new Error(`Failed to generate budgets: ${error instanceof Error ? error.message : String(error)}`);
          }
          let citas2;
          try {
            citas2 = generarCitasMock(pacientes2);
            if (!citas2 || citas2.length === 0) {
              throw new Error("generarCitasMock returned empty array");
            }
            citas2.forEach((cita) => {
              this.citas.set(cita.id, cita);
            });
            console.log(`[Storage] \u2713 Loaded ${citas2.length} citas`);
          } catch (error) {
            console.error("[Storage] ERROR generating citas:", error);
            throw new Error(`Failed to generate citas: ${error instanceof Error ? error.message : String(error)}`);
          }
          const tratamientosPreventivos2 = generarTratamientosPreventivosMock(pacientes2, citas2, budgets2);
          tratamientosPreventivos2.forEach((tratamiento) => {
            this.tratamientosPreventivos.set(tratamiento.id, tratamiento);
          });
          console.log(`[Storage] \u2713 Loaded ${tratamientosPreventivos2.length} tratamientos preventivos`);
          let campanas2;
          try {
            campanas2 = generarCampanasMock();
            if (!campanas2 || campanas2.length === 0) {
              throw new Error("generarCampanasMock returned empty array");
            }
            campanas2.forEach((campana) => {
              this.campanas.set(campana.id, campana);
            });
            console.log(`[Storage] \u2713 Loaded ${campanas2.length} campanas`);
          } catch (error) {
            console.error("[Storage] ERROR generating campanas:", error);
            throw new Error(`Failed to generate campanas: ${error instanceof Error ? error.message : String(error)}`);
          }
          const tareas = generarTareasLlamadasMock(pacientes2);
          const tareasCampana = generarTareasCampanaMock(pacientes2, campanas2);
          const todasLasTareas = [...tareas, ...tareasCampana];
          todasLasTareas.forEach((tarea) => {
            this.tareas.set(tarea.id, tarea);
          });
          console.log(`[Storage] \u2713 Loaded ${todasLasTareas.length} tareas (${tareas.length} llamadas + ${tareasCampana.length} campa\xF1a)`);
          const { conversaciones: conversaciones2, mensajes: mensajes2 } = generarConversacionesMock(pacientes2);
          conversaciones2.forEach((conversacion) => {
            this.conversaciones.set(conversacion.id, conversacion);
          });
          mensajes2.forEach((mensaje) => {
            this.mensajes.set(mensaje.id, mensaje);
          });
          console.log(`[Storage] \u2713 Loaded ${conversaciones2.length} conversaciones and ${mensajes2.length} mensajes`);
          this.inicializarRecordatoriosDefault();
          console.log(`[Storage] \u2713 Initialized recordatorios`);
          this.inicializarReglasComunicacionDefault();
          console.log(`[Storage] \u2713 Initialized reglas de comunicaci\xF3n`);
          console.log(`[Storage] Mock data initialization completed:`);
          console.log(`[Storage]   - Pacientes: ${this.pacientes.size}`);
          console.log(`[Storage]   - Budgets: ${this.budgets.size}`);
          console.log(`[Storage]   - Citas: ${this.citas.size}`);
          console.log(`[Storage]   - Campa\xF1as: ${this.campanas.size}`);
          console.log(`[Storage]   - Tareas: ${this.tareas.size}`);
          console.log(`[Storage]   - Conversaciones: ${this.conversaciones.size}`);
          if (this.pacientes.size === 0) {
            throw new Error("Failed to load pacientes - pacientes.size is 0");
          }
          if (this.budgets.size === 0) {
            throw new Error("Failed to load budgets - budgets.size is 0");
          }
          if (this.citas.size === 0) {
            throw new Error("Failed to load citas - citas.size is 0");
          }
          if (this.campanas.size === 0) {
            throw new Error("Failed to load campanas - campanas.size is 0");
          }
          console.log("[Storage] \u2713 All critical data loaded successfully");
        } catch (error) {
          console.error("[Storage] CRITICAL ERROR in inicializarMockData:", error);
          if (error instanceof Error) {
            console.error("[Storage] Error message:", error.message);
            console.error("[Storage] Error stack:", error.stack);
          }
          throw error;
        }
      }
      // Crear secuencias para presupuestos pendientes que ya existen
      async inicializarSecuenciasParaPresupuestosExistentes() {
        const budgetsPendientes = Array.from(this.budgets.values()).filter((b) => b.status === "pending");
        const reglasRelance = Array.from(this.reglasComunicacion.values()).filter((r) => r.tipo === "relance_presupuesto" && r.activa);
        if (reglasRelance.length === 0) return;
        const regla = reglasRelance[0];
        const pasos = regla.secuencia;
        if (pasos.length === 0) return;
        const ahora = /* @__PURE__ */ new Date();
        const hoy = new Date(ahora);
        hoy.setHours(0, 0, 0, 0);
        let contadorEjemplos = 0;
        const horasEjemplo = [9, 11, 14, 16, 18];
        for (const budget of budgetsPendientes) {
          const secuenciaExistente = await this.getSecuenciaComunicacionPorBudget(budget.id);
          if (secuenciaExistente) continue;
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
              fechaInicio: new Date(ahora.getTime() - (2 + contadorEjemplos) * 24 * 60 * 60 * 1e3),
              // Hace 2-6 días
              ultimaAccion: null,
              proximaAccion,
              respuestaRecibida: false,
              metadata: {
                reglaNombre: regla.nombre,
                pasosTotales: pasos.length
              }
            });
            contadorEjemplos++;
          } else {
            await this.iniciarSecuenciaRelance(budget.id, budget.patientId);
          }
        }
      }
      inicializarRecordatoriosDefault() {
        const recordatoriosDefault = [
          {
            id: randomUUID(),
            nombre: "Recordatorio 24h antes",
            canal: "sms",
            mensaje: "Hola {nombre}, le recordamos que tiene una cita ma\xF1ana a las {hora} en nuestra cl\xEDnica. Responda CONFIRMAR para confirmar o llame al {telefono_clinica} para reprogramar.",
            horasAntes: 24,
            activo: true
          },
          {
            id: randomUUID(),
            nombre: "Recordatorio 2h antes",
            canal: "whatsapp",
            mensaje: "Hola {nombre}, le recordamos que su cita es en 2 horas ({hora}). Le esperamos en nuestra cl\xEDnica. Si necesita reprogramar, responda a este mensaje.",
            horasAntes: 2,
            activo: true
          }
        ];
        recordatoriosDefault.forEach((r) => {
          this.recordatorios.set(r.id, r);
        });
      }
      inicializarReglasComunicacionDefault() {
        const reglaRelances = {
          id: randomUUID(),
          nombre: "Relance Presupuesto Est\xE1ndar",
          tipo: "relance_presupuesto",
          activa: true,
          secuencia: [
            {
              orden: 1,
              canal: "whatsapp",
              diasDespues: 2,
              accion: "enviar",
              requiereConfirmacion: false
            },
            {
              orden: 2,
              canal: "email",
              diasDespues: 2,
              accion: "enviar",
              requiereConfirmacion: false
            },
            {
              orden: 3,
              canal: "llamada",
              diasDespues: 2,
              accion: "programar_llamada",
              requiereConfirmacion: true
            }
          ],
          criterios: null,
          createdAt: /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date()
        };
        this.reglasComunicacion.set(reglaRelances.id, reglaRelances);
        const reglaRecordatorios = {
          id: randomUUID(),
          nombre: "Recordatorio Cita Est\xE1ndar",
          tipo: "recordatorio_cita",
          activa: true,
          secuencia: [
            {
              orden: 1,
              canal: "whatsapp",
              diasDespues: 1,
              // 24h antes
              accion: "enviar",
              requiereConfirmacion: false
            },
            {
              orden: 2,
              canal: "sms",
              diasDespues: 0,
              // 1h antes (se calcula en horas)
              accion: "enviar",
              requiereConfirmacion: false
            }
          ],
          criterios: null,
          createdAt: /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date()
        };
        this.reglasComunicacion.set(reglaRecordatorios.id, reglaRecordatorios);
        const reglaPostVisita = {
          id: randomUUID(),
          nombre: "Post-Visita Est\xE1ndar",
          tipo: "post_visita",
          activa: true,
          secuencia: [
            {
              orden: 1,
              canal: "whatsapp",
              diasDespues: 7,
              accion: "enviar",
              requiereConfirmacion: false
            }
          ],
          criterios: null,
          createdAt: /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date()
        };
        this.reglasComunicacion.set(reglaPostVisita.id, reglaPostVisita);
        const reglaPreventiva = {
          id: randomUUID(),
          nombre: "Salud Preventiva Est\xE1ndar",
          tipo: "salud_preventiva",
          activa: true,
          secuencia: [
            {
              orden: 1,
              canal: "whatsapp",
              diasDespues: 0,
              // Cuando vence la fecha recomendada
              accion: "enviar",
              requiereConfirmacion: false
            },
            {
              orden: 2,
              canal: "sms",
              diasDespues: 7,
              accion: "enviar",
              requiereConfirmacion: false
            },
            {
              orden: 3,
              canal: "email",
              diasDespues: 7,
              accion: "enviar",
              requiereConfirmacion: false
            }
          ],
          criterios: null,
          createdAt: /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date()
        };
        this.reglasComunicacion.set(reglaPreventiva.id, reglaPreventiva);
        const campa\u00F1asRecall = [
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
                mensaje: "Hola {nombre}, \u{1F44B}\n\nRecordamos tu historial de salud periodontal. Es importante mantener controles regulares para prevenir complicaciones.\n\n\xBFTe gustar\xEDa agendar una revisi\xF3n?",
                requiereConfirmacion: false
              },
              {
                orden: 2,
                canal: "email",
                diasDespues: 3,
                accion: "enviar",
                mensaje: "Estimado/a {nombre},\n\nBasado en su historial de salud periodontal, le recomendamos una revisi\xF3n peri\xF3dica. La prevenci\xF3n es clave para mantener sus enc\xEDas saludables.\n\nLe invitamos a agendar su cita.\n\nSaludos cordiales,\nCl\xEDnica Dental",
                requiereConfirmacion: false
              },
              {
                orden: 3,
                canal: "sms",
                diasDespues: 5,
                accion: "enviar",
                mensaje: "Hola {nombre}, tu revisi\xF3n periodontal est\xE1 pendiente. Es importante para tu salud bucal. Responde S\xCD para agendar.",
                requiereConfirmacion: false
              },
              {
                orden: 4,
                canal: "llamada",
                diasDespues: 7,
                accion: "programar_llamada",
                mensaje: "Llamada para recordar importancia de controles periodontales y agendar revisi\xF3n",
                requiereConfirmacion: true
              }
            ],
            criterios: { diagnostico: "periodontal" },
            createdAt: /* @__PURE__ */ new Date(),
            updatedAt: /* @__PURE__ */ new Date()
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
                mensaje: "Hola {nombre}, \u{1F44B}\n\nRecordamos que ten\xEDas un tratamiento pendiente relacionado con tu diagn\xF3stico. Es importante completarlo para evitar complicaciones.\n\n\xBFTe gustar\xEDa retomar tu tratamiento?",
                requiereConfirmacion: false
              },
              {
                orden: 2,
                canal: "email",
                diasDespues: 2,
                accion: "enviar",
                mensaje: "Estimado/a {nombre},\n\nLe recordamos que tiene un tratamiento pendiente. Completarlo es fundamental para su salud bucal y evitar problemas mayores.\n\nEstaremos encantados de continuar con su cuidado.\n\nSaludos cordiales,\nCl\xEDnica Dental",
                requiereConfirmacion: false
              },
              {
                orden: 3,
                canal: "sms",
                diasDespues: 4,
                accion: "enviar",
                mensaje: "Hola {nombre}, tu tratamiento est\xE1 pendiente. Es importante completarlo. Responde S\xCD para agendar.",
                requiereConfirmacion: false
              },
              {
                orden: 4,
                canal: "llamada",
                diasDespues: 5,
                accion: "programar_llamada",
                mensaje: "Llamada urgente para recordar tratamiento incompleto y ofrecer continuar el cuidado",
                requiereConfirmacion: true
              }
            ],
            criterios: { tratamientoIncompleto: true },
            createdAt: /* @__PURE__ */ new Date(),
            updatedAt: /* @__PURE__ */ new Date()
          },
          {
            id: randomUUID(),
            nombre: "Recall - Prevenci\xF3n y Revisi\xF3n",
            tipo: "recall_paciente",
            activa: true,
            secuencia: [
              {
                orden: 1,
                canal: "whatsapp",
                diasDespues: 0,
                accion: "enviar",
                mensaje: "Hola {nombre}, \u{1F44B}\n\nHace tiempo que no te vemos. Una revisi\xF3n peri\xF3dica es clave para detectar problemas a tiempo y mantener tu salud bucal.\n\n\xBFTe gustar\xEDa agendar tu revisi\xF3n?",
                requiereConfirmacion: false
              },
              {
                orden: 2,
                canal: "sms",
                diasDespues: 5,
                accion: "enviar",
                mensaje: "Hola {nombre}, tu revisi\xF3n dental est\xE1 pendiente. La prevenci\xF3n es la mejor medicina. Responde S\xCD para agendar.",
                requiereConfirmacion: false
              },
              {
                orden: 3,
                canal: "email",
                diasDespues: 7,
                accion: "enviar",
                mensaje: "Estimado/a {nombre},\n\nLe recordamos la importancia de las revisiones peri\xF3dicas. Detectar problemas a tiempo puede ahorrarle tratamientos m\xE1s complejos.\n\nLe invitamos a agendar su cita de revisi\xF3n.\n\nSaludos cordiales,\nCl\xEDnica Dental",
                requiereConfirmacion: false
              },
              {
                orden: 4,
                canal: "llamada",
                diasDespues: 10,
                accion: "programar_llamada",
                mensaje: "Llamada para invitar a revisi\xF3n preventiva y recuperar relaci\xF3n con el paciente",
                requiereConfirmacion: true
              }
            ],
            criterios: { mesesSinVisita: 6 },
            createdAt: /* @__PURE__ */ new Date(),
            updatedAt: /* @__PURE__ */ new Date()
          }
        ];
        campa\u00F1asRecall.forEach((regla) => {
          this.reglasComunicacion.set(regla.id, regla);
        });
      }
      // Pacientes
      async getPacientes() {
        return Array.from(this.pacientes.values());
      }
      async getPaciente(id) {
        return this.pacientes.get(id);
      }
      async getPacientesPerdidos(filtros) {
        let pacientes2 = Array.from(this.pacientes.values()).filter((p) => p.estado === "perdido");
        if (!filtros) return pacientes2;
        if (filtros.prioridad && filtros.prioridad !== "Todas") {
          pacientes2 = pacientes2.filter((p) => p.prioridad === filtros.prioridad);
        }
        if (filtros.diagnostico) {
          pacientes2 = pacientes2.filter((p) => p.diagnostico === filtros.diagnostico);
        }
        if (filtros.edadMin !== void 0) {
          pacientes2 = pacientes2.filter((p) => p.edad >= filtros.edadMin);
        }
        if (filtros.edadMax !== void 0) {
          pacientes2 = pacientes2.filter((p) => p.edad <= filtros.edadMax);
        }
        return pacientes2;
      }
      async calcularPacientesPerdidos() {
        const ahora = /* @__PURE__ */ new Date();
        const pacientes2 = Array.from(this.pacientes.values());
        pacientes2.forEach((paciente) => {
          const diffTime = Math.abs(ahora.getTime() - paciente.ultimaVisita.getTime());
          const diffDays = Math.ceil(diffTime / (1e3 * 60 * 60 * 24));
          const mesesSinVisita = Math.floor(diffDays / 30);
          paciente.mesesSinVisita = mesesSinVisita;
          if (mesesSinVisita > 6 && !paciente.tieneCitaFutura) {
            paciente.estado = "perdido";
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
        const perdidos = pacientes2.filter((p) => p.estado === "perdido");
        return { total: perdidos.length, pacientes: perdidos };
      }
      async getPacientesEnRiesgo() {
        const ahora = /* @__PURE__ */ new Date();
        const pacientes2 = Array.from(this.pacientes.values());
        return pacientes2.filter((p) => {
          if (p.tieneCitaFutura) return false;
          const diffTime = Math.abs(ahora.getTime() - p.ultimaVisita.getTime());
          const diffDays = Math.ceil(diffTime / (1e3 * 60 * 60 * 24));
          const mesesSinVisita = Math.floor(diffDays / 30);
          return mesesSinVisita >= 4 && mesesSinVisita <= 6;
        });
      }
      async getPacientesListosParaCampana(campanaId) {
        const campana = await this.getCampana(campanaId);
        if (!campana) return [];
        const pacientes2 = Array.from(this.pacientes.values());
        const ahora = /* @__PURE__ */ new Date();
        return pacientes2.filter((p) => {
          if (p.enCampana) return false;
          if (p.tieneCitaFutura) return false;
          const diffTime = Math.abs(ahora.getTime() - p.ultimaVisita.getTime());
          const diffDays = Math.ceil(diffTime / (1e3 * 60 * 60 * 24));
          const mesesSinVisita = Math.floor(diffDays / 30);
          return mesesSinVisita >= 6;
        });
      }
      async anadirPacientesACampana(pacienteIds) {
        pacienteIds.forEach((id) => {
          const paciente = this.pacientes.get(id);
          if (paciente) {
            paciente.enCampana = true;
            this.pacientes.set(id, paciente);
          }
        });
      }
      // Campañas
      async getCampanas() {
        return Array.from(this.campanas.values()).sort((a, b) => {
          const fechaA = a.fechaCreacion ? new Date(a.fechaCreacion).getTime() : 0;
          const fechaB = b.fechaCreacion ? new Date(b.fechaCreacion).getTime() : 0;
          return fechaB - fechaA;
        });
      }
      async getCampana(id) {
        return this.campanas.get(id);
      }
      async createCampana(insertCampana) {
        const id = randomUUID();
        const campana = {
          ...insertCampana,
          id,
          fechaCreacion: /* @__PURE__ */ new Date(),
          pacientesIncluidos: 0,
          contactosEnviados: 0,
          citasGeneradas: 0,
          plantillaSMS: insertCampana.plantillaSMS || null,
          plantillaEmail: insertCampana.plantillaEmail || null,
          guionLlamada: insertCampana.guionLlamada || null
        };
        this.campanas.set(id, campana);
        return campana;
      }
      async updateCampanaEstado(id, estado) {
        const campana = this.campanas.get(id);
        if (campana) {
          campana.estado = estado;
          this.campanas.set(id, campana);
        }
        return campana;
      }
      // Tareas de llamadas
      async getTareas() {
        return Array.from(this.tareas.values()).sort((a, b) => {
          const prioridadOrden = { "Alta": 0, "Media": 1, "Baja": 2 };
          const prioA = prioridadOrden[a.prioridad];
          const prioB = prioridadOrden[b.prioridad];
          return prioA - prioB;
        });
      }
      async getTarea(id) {
        return this.tareas.get(id);
      }
      async updateTarea(id, updates) {
        const tarea = this.tareas.get(id);
        if (tarea) {
          if (updates.estado !== void 0) {
            tarea.estado = updates.estado;
          }
          if (updates.notas !== void 0) {
            tarea.notas = updates.notas;
          }
          if (updates.aprobado !== void 0) {
            tarea.aprobado = updates.aprobado;
          }
          if (updates.fechaProgramada !== void 0) {
            tarea.fechaProgramada = updates.fechaProgramada ? new Date(updates.fechaProgramada) : null;
          }
          if (updates.fechaContacto !== void 0) {
            tarea.fechaContacto = updates.fechaContacto ? new Date(updates.fechaContacto) : null;
          }
          if (updates.fechaCompletada !== void 0) {
            tarea.fechaCompletada = updates.fechaCompletada ? new Date(updates.fechaCompletada) : null;
          }
          this.tareas.set(id, tarea);
        }
        return tarea;
      }
      async getTareasParaHoy() {
        const hoy = /* @__PURE__ */ new Date();
        hoy.setHours(0, 0, 0, 0);
        const ma\u00F1ana = new Date(hoy);
        ma\u00F1ana.setDate(ma\u00F1ana.getDate() + 1);
        const tareas = Array.from(this.tareas.values());
        return tareas.filter((t) => {
          if (!t.aprobado || t.estado !== "pendiente") return false;
          if (!t.fechaProgramada) return true;
          const fechaProgramada = new Date(t.fechaProgramada);
          fechaProgramada.setHours(0, 0, 0, 0);
          return fechaProgramada.getTime() === hoy.getTime();
        });
      }
      // Dashboard
      async getDashboardKPIs() {
        const pacientes2 = Array.from(this.pacientes.values());
        const campanas2 = Array.from(this.campanas.values());
        const tareas = Array.from(this.tareas.values());
        const pacientesPerdidos = pacientes2.filter((p) => p.estado === "perdido").length;
        const pacientesEnCampanas = pacientes2.filter((p) => p.enCampana).length;
        const contactosEnviados = campanas2.reduce((sum, c) => sum + (c.contactosEnviados || 0), 0);
        const citasGeneradas = campanas2.reduce((sum, c) => sum + (c.citasGeneradas || 0), 0) + tareas.filter((t) => t.estado === "cita_agendada").length;
        const tasaConversion = contactosEnviados > 0 ? citasGeneradas / contactosEnviados * 100 : 0;
        const roiEstimado = 5.4;
        return {
          pacientesPerdidos,
          pacientesEnCampanas,
          contactosEnviados,
          citasGeneradas,
          tasaConversion,
          roiEstimado
        };
      }
      async getConversionPorCanal() {
        return [
          { canal: "Llamadas del staff", conversion: 14, contactos: 100, citas: 14 },
          { canal: "SMS", conversion: 7, contactos: 150, citas: 11 },
          { canal: "Email", conversion: 7, contactos: 90, citas: 6 }
        ];
      }
      // Conversaciones
      async getConversaciones() {
        const conversaciones2 = Array.from(this.conversaciones.values());
        return conversaciones2.map((conv) => {
          const paciente = this.pacientes.get(conv.pacienteId);
          if (!paciente) return null;
          return {
            ...conv,
            pacienteNombre: paciente.nombre,
            pacienteTelefono: paciente.telefono,
            pacienteEmail: paciente.email
          };
        }).filter((c) => c !== null).sort((a, b) => {
          const fechaA = a.fechaUltimoMensaje?.getTime() || 0;
          const fechaB = b.fechaUltimoMensaje?.getTime() || 0;
          return fechaB - fechaA;
        });
      }
      async getConversacion(id) {
        const conv = this.conversaciones.get(id);
        if (!conv) return void 0;
        const paciente = this.pacientes.get(conv.pacienteId);
        if (!paciente) return void 0;
        return {
          ...conv,
          pacienteNombre: paciente.nombre,
          pacienteTelefono: paciente.telefono,
          pacienteEmail: paciente.email
        };
      }
      async getMensajes(conversacionId) {
        return Array.from(this.mensajes.values()).filter((m) => m.conversacionId === conversacionId).sort((a, b) => a.fechaEnvio.getTime() - b.fechaEnvio.getTime());
      }
      async createMensaje(insertMensaje) {
        const id = randomUUID();
        const mensaje = {
          ...insertMensaje,
          id,
          type: insertMensaje.type || "mensaje",
          channel: insertMensaje.channel || "whatsapp",
          conversacionId: insertMensaje.conversacionId || null,
          patientId: insertMensaje.patientId || null,
          budgetId: insertMensaje.budgetId || null,
          direccion: insertMensaje.direccion || "saliente",
          openedAt: insertMensaje.openedAt || null,
          leido: insertMensaje.direccion === "saliente" ? true : false
        };
        this.mensajes.set(id, mensaje);
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
      async marcarComoLeido(conversacionId) {
        const conv = this.conversaciones.get(conversacionId);
        if (conv) {
          conv.noLeidos = 0;
          this.conversaciones.set(conv.id, conv);
        }
        const mensajes2 = Array.from(this.mensajes.values()).filter((m) => m.conversacionId === conversacionId);
        mensajes2.forEach((m) => {
          m.leido = true;
          this.mensajes.set(m.id, m);
        });
      }
      async getConversacionesSinLeerCount() {
        return Array.from(this.conversaciones.values()).filter((c) => (c.noLeidos || 0) > 0).length;
      }
      // Citas
      async getCitas() {
        return Array.from(this.citas.values()).sort(
          (a, b) => a.fechaHora.getTime() - b.fechaHora.getTime()
        );
      }
      async getCitasPorSemana(inicio, fin) {
        const todasLasCitas = Array.from(this.citas.values());
        console.log(`[Storage] getCitasPorSemana - Total citas: ${todasLasCitas.length}`);
        console.log(`[Storage] Rango buscado - inicio: ${inicio.toISOString()}, fin: ${fin.toISOString()}`);
        if (todasLasCitas.length > 0) {
          const primeraCita = todasLasCitas[0];
          const ultimaCita = todasLasCitas[todasLasCitas.length - 1];
          console.log(`[Storage] Primera cita: ${primeraCita.fechaHora.toISOString()}`);
          console.log(`[Storage] \xDAltima cita: ${ultimaCita.fechaHora.toISOString()}`);
        }
        const citasFiltradas = todasLasCitas.filter((cita) => {
          const fechaCita = cita.fechaHora.getTime();
          const inicioTime = inicio.getTime();
          const finTime = fin.getTime();
          const dentroRango = fechaCita >= inicioTime && fechaCita <= finTime;
          if (!dentroRango && todasLasCitas.length <= 10) {
            console.log(`[Storage] Cita fuera de rango: ${cita.id} - ${cita.fechaHora.toISOString()}`);
          }
          return dentroRango;
        });
        console.log(`[Storage] Citas en rango: ${citasFiltradas.length}`);
        return citasFiltradas.sort((a, b) => a.fechaHora.getTime() - b.fechaHora.getTime());
      }
      async getCita(id) {
        return this.citas.get(id);
      }
      async createCita(insertCita) {
        const id = randomUUID();
        const cita = {
          ...insertCita,
          id,
          duracionMinutos: insertCita.duracionMinutos ?? 30,
          notas: insertCita.notas ?? null,
          doctor: insertCita.doctor ?? null,
          sala: insertCita.sala ?? null,
          origen: insertCita.origen ?? null
        };
        this.citas.set(id, cita);
        return cita;
      }
      async updateCitaEstado(id, estado) {
        const cita = this.citas.get(id);
        if (cita) {
          cita.estado = estado;
          this.citas.set(id, cita);
        }
        return cita;
      }
      async updateCitaFechaHora(id, fechaHora) {
        const cita = this.citas.get(id);
        if (cita) {
          cita.fechaHora = fechaHora;
          this.citas.set(id, cita);
        }
        return cita;
      }
      async detectarHuecosLibres(fechaInicio, fechaFin, duracionMinutos = 30) {
        const huecos = [];
        const citas2 = Array.from(this.citas.values()).filter((c) => {
          const fechaCita = new Date(c.fechaHora);
          return fechaCita >= fechaInicio && fechaCita <= fechaFin && c.estado !== "cancelada";
        });
        const HORA_INICIO = 9;
        const HORA_FIN = 19;
        const DURACION_MINIMA = duracionMinutos;
        const fechaActual = new Date(fechaInicio);
        fechaActual.setHours(0, 0, 0, 0);
        while (fechaActual <= fechaFin) {
          const citasDelDia = citas2.filter((c) => {
            const fechaCita = new Date(c.fechaHora);
            return fechaCita.toDateString() === fechaActual.toDateString();
          }).sort((a, b) => new Date(a.fechaHora).getTime() - new Date(b.fechaHora).getTime());
          let horaActual = HORA_INICIO;
          for (const cita of citasDelDia) {
            const fechaCita = new Date(cita.fechaHora);
            const horaCita = fechaCita.getHours();
            const minutosCita = fechaCita.getMinutes();
            const duracionCita = cita.duracionMinutos || 30;
            const horaFinCita = horaCita + Math.ceil(duracionCita / 60);
            if (horaActual < horaCita) {
              const duracionHueco = (horaCita - horaActual) * 60;
              if (duracionHueco >= DURACION_MINIMA) {
                huecos.push({
                  fecha: new Date(fechaActual),
                  horaInicio: horaActual,
                  horaFin: horaCita,
                  duracion: duracionHueco
                });
              }
            }
            horaActual = horaFinCita;
          }
          if (horaActual < HORA_FIN) {
            const duracionHueco = (HORA_FIN - horaActual) * 60;
            if (duracionHueco >= DURACION_MINIMA) {
              huecos.push({
                fecha: new Date(fechaActual),
                horaInicio: horaActual,
                horaFin: HORA_FIN,
                duracion: duracionHueco
              });
            }
          }
          fechaActual.setDate(fechaActual.getDate() + 1);
        }
        return huecos;
      }
      async sugerirPacientesParaHueco(fecha, horaInicio, horaFin, limite = 5) {
        const sugerencias = [];
        const pacientes2 = Array.from(this.pacientes.values());
        const ahora = /* @__PURE__ */ new Date();
        const recordatoriosPreventivos = await this.getRecordatoriosPreventivosPendientes();
        for (const recordatorio of recordatoriosPreventivos.slice(0, limite * 2)) {
          const paciente = this.pacientes.get(recordatorio.pacienteId);
          if (!paciente || paciente.tieneCitaFutura) continue;
          const diasVencidos = recordatorio.diasVencidos;
          const prioridad = Math.min(100, 50 + diasVencidos * 2);
          sugerencias.push({
            paciente,
            motivo: `Necesita ${recordatorio.tipoTratamiento} (${Math.floor(diasVencidos / 30)} meses de retraso)`,
            prioridad
          });
        }
        const pacientesDormidos = await this.getPacientesPerdidos();
        for (const paciente of pacientesDormidos.slice(0, limite * 2)) {
          if (paciente.tieneCitaFutura) continue;
          const mesesSinVisita = paciente.mesesSinVisita || 0;
          const prioridad = Math.min(100, 40 + mesesSinVisita * 5);
          sugerencias.push({
            paciente,
            motivo: `Paciente dormido (${mesesSinVisita} meses sin visita)`,
            prioridad
          });
        }
        const pacientesEnRiesgo = await this.getPacientesEnRiesgo();
        for (const paciente of pacientesEnRiesgo.slice(0, limite)) {
          if (paciente.tieneCitaFutura) continue;
          sugerencias.push({
            paciente,
            motivo: "Paciente en riesgo de convertirse en dormido",
            prioridad: 30
          });
        }
        const pacientesUnicos = /* @__PURE__ */ new Map();
        for (const sugerencia of sugerencias) {
          const existente = pacientesUnicos.get(sugerencia.paciente.id);
          if (!existente || sugerencia.prioridad > existente.prioridad) {
            pacientesUnicos.set(sugerencia.paciente.id, sugerencia);
          }
        }
        return Array.from(pacientesUnicos.values()).sort((a, b) => b.prioridad - a.prioridad).slice(0, limite);
      }
      // Recordatorios
      async getRecordatorios() {
        return Array.from(this.recordatorios.values());
      }
      async getRecordatorio(id) {
        return this.recordatorios.get(id);
      }
      async createRecordatorio(insertRecordatorio) {
        const id = randomUUID();
        const recordatorio = {
          ...insertRecordatorio,
          id,
          activo: insertRecordatorio.activo ?? true
        };
        this.recordatorios.set(id, recordatorio);
        return recordatorio;
      }
      async updateRecordatorio(id, data) {
        const recordatorio = this.recordatorios.get(id);
        if (recordatorio) {
          const updated = {
            ...recordatorio,
            ...data
          };
          this.recordatorios.set(id, updated);
          return updated;
        }
        return void 0;
      }
      async deleteRecordatorio(id) {
        return this.recordatorios.delete(id);
      }
      // Budgets (DentalIQ)
      async getBudgets() {
        const budgets2 = Array.from(this.budgets.values());
        return budgets2.map((budget) => {
          const patient = this.pacientes.get(budget.patientId);
          if (!patient) {
            throw new Error(`Patient not found for budget ${budget.id}`);
          }
          return {
            ...budget,
            patientName: patient.nombre,
            patientEmail: patient.email,
            patientPhone: patient.telefono,
            patientWhatsapp: patient.whatsapp || void 0
          };
        }).sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });
      }
      async getBudget(id) {
        const budget = this.budgets.get(id);
        if (!budget) return void 0;
        const patient = this.pacientes.get(budget.patientId);
        if (!patient) return void 0;
        return {
          ...budget,
          patientName: patient.nombre,
          patientEmail: patient.email,
          patientPhone: patient.telefono,
          patientWhatsapp: patient.whatsapp || void 0
        };
      }
      async createBudget(budgetData) {
        const id = randomUUID();
        const patient = this.pacientes.get(budgetData.patientId);
        if (!patient) {
          throw new Error("Patient not found");
        }
        let treatmentDetailsJson = {};
        try {
          treatmentDetailsJson = JSON.parse(budgetData.treatmentDetails);
        } catch {
          const procedures = budgetData.treatmentDetails.split(/[,\n]/).map((p) => p.trim()).filter((p) => p.length > 0);
          treatmentDetailsJson = {
            procedures,
            total: Number(budgetData.amount)
          };
        }
        const amountNumber = Number(budgetData.amount);
        const urgencyScore = await calculateUrgencyScore(
          { amount: amountNumber, treatmentDetails: treatmentDetailsJson },
          {
            nombre: patient.nombre,
            edad: patient.edad,
            historial: patient.diagnostico,
            ultimaVisita: patient.ultimaVisita,
            budgetsAnteriores: Array.from(this.budgets.values()).filter((b) => b.patientId === budgetData.patientId).map((b) => ({ amount: Number(b.amount), status: b.status }))
          }
        );
        const acceptanceProb = await calculateAcceptanceProb(
          { amount: amountNumber, treatmentDetails: treatmentDetailsJson },
          {
            nombre: patient.nombre,
            edad: patient.edad,
            historial: patient.diagnostico,
            ultimaVisita: patient.ultimaVisita,
            budgetsAnteriores: Array.from(this.budgets.values()).filter((b) => b.patientId === budgetData.patientId).map((b) => ({ amount: Number(b.amount), status: b.status }))
          }
        );
        const priority = calculatePriority2(urgencyScore, acceptanceProb);
        const budget = {
          ...budgetData,
          id,
          treatmentDetails: treatmentDetailsJson,
          urgencyScore,
          acceptanceProb,
          priority,
          status: budgetData.status || "pending",
          createdAt: /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date()
        };
        this.budgets.set(id, budget);
        await this.createAccion({
          tipo: "scoring",
          estado: "ejecutada",
          titulo: `Scoring IA calculado - ${patient.nombre}`,
          descripcion: `Urgencia: ${urgencyScore}, Aceptaci\xF3n: ${acceptanceProb}%, Prioridad: ${priority}`,
          pacienteId: budget.patientId,
          budgetId: budget.id,
          canal: null,
          mensaje: null,
          requiereConfirmacion: false,
          ejecutadaAt: /* @__PURE__ */ new Date(),
          metadata: {
            urgencyScore,
            acceptanceProb,
            priority
          }
        });
        if (budget.status === "pending") {
          await this.iniciarSecuenciaRelance(budget.id, budget.patientId);
        }
        return budget;
      }
      async updateBudgetStatus(id, status) {
        const budget = this.budgets.get(id);
        if (budget) {
          budget.status = status;
          budget.updatedAt = /* @__PURE__ */ new Date();
          this.budgets.set(id, budget);
        }
        return budget;
      }
      // Clinics
      async getClinics() {
        return Array.from(this.clinics.values());
      }
      async createClinic(clinicData) {
        const id = randomUUID();
        const clinic = {
          ...clinicData,
          id,
          address: clinicData.address || null,
          createdAt: /* @__PURE__ */ new Date()
        };
        this.clinics.set(id, clinic);
        return clinic;
      }
      // Users
      async getUsers() {
        return Array.from(this.users.values());
      }
      async createUser(userData) {
        const id = randomUUID();
        const user = {
          ...userData,
          id,
          clinicId: userData.clinicId || null,
          role: userData.role || "reception",
          createdAt: /* @__PURE__ */ new Date()
        };
        this.users.set(id, user);
        return user;
      }
      // DentalIQ KPIs
      async getDentalIQKPIs() {
        const budgets2 = Array.from(this.budgets.values());
        const total = budgets2.length;
        console.log(`[Storage] getDentalIQKPIs called - total budgets: ${total}`);
        console.log(`[Storage] pacientes count: ${this.pacientes.size}`);
        console.log(`[Storage] budgets map size: ${this.budgets.size}`);
        const tasaAceptacion = 26;
        const tasaAceptacionGoal = tasaAceptacion + 20;
        const accepted = Math.round(total * (tasaAceptacion / 100));
        const rejected = Math.round(total * 0.1);
        const presupuestosObjetivo = 10;
        const mediaPresupuesto = 800;
        const treatmentsAceptados = Math.min(accepted, presupuestosObjetivo);
        const facturacionGenerada = treatmentsAceptados * mediaPresupuesto;
        const ahora = /* @__PURE__ */ new Date();
        const mesesNombres = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
        const tasaTransformacionMensual = [];
        const variacionesMensuales = [2.5, -1.8, 3.2, -0.5, 1.5, -2.1];
        for (let i = 5; i >= 0; i--) {
          const fechaMes = new Date(ahora.getFullYear(), ahora.getMonth() - i, 1);
          const mesNombre = mesesNombres[fechaMes.getMonth()];
          const variacion = variacionesMensuales[5 - i] || 0;
          const tasaMes = Math.max(0, Math.min(100, tasaAceptacion + variacion));
          tasaTransformacionMensual.push({
            mes: mesNombre,
            tasa: Math.round(tasaMes * 10) / 10
            // Redondear a 1 decimal
          });
        }
        const rechazosMotivos = [
          { motivo: "precio", cantidad: Math.max(1, Math.floor(rejected * 0.5)) },
          { motivo: "miedo", cantidad: Math.max(1, Math.floor(rejected * 0.2)) },
          { motivo: "comprension", cantidad: Math.max(1, Math.floor(rejected * 0.15)) },
          { motivo: "urgencia", cantidad: Math.max(1, Math.floor(rejected * 0.1)) },
          { motivo: "otro", cantidad: Math.max(1, Math.floor(rejected * 0.05)) }
        ];
        const minutosAhorradosPorBudget = 15;
        const minutosAhorrados = accepted * minutosAhorradosPorBudget;
        const budgetsPorSemana = Math.max(1, Math.round(total / 4));
        const aceptadosPorSemana = Math.round(budgetsPorSemana * (tasaAceptacion / 100));
        const horasAhorradasCalculadas = Math.round(aceptadosPorSemana * minutosAhorradosPorBudget / 60 * 10) / 10;
        const horasAhorradas = Math.max(8, horasAhorradasCalculadas);
        const result = {
          tasaAceptacion: Math.round(tasaAceptacion * 10) / 10,
          // Redondear a 1 decimal
          tasaAceptacionGoal: Math.round(tasaAceptacionGoal * 10) / 10,
          horasAhorradas: horasAhorradas || 0,
          treatmentsAceptados: treatmentsAceptados || 0,
          facturacionGenerada: facturacionGenerada || 0,
          tasaTransformacionMensual,
          rechazosMotivos
        };
        console.log(`[KPIs] Resultado final:`, result);
        return result;
      }
      // Acciones Automatizadas
      async getAcciones(filtros) {
        let acciones2 = Array.from(this.acciones.values());
        if (filtros?.estado) {
          acciones2 = acciones2.filter((a) => a.estado === filtros.estado);
        }
        if (filtros?.tipo) {
          acciones2 = acciones2.filter((a) => a.tipo === filtros.tipo);
        }
        acciones2.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });
        if (filtros?.limit) {
          acciones2 = acciones2.slice(0, filtros.limit);
        }
        return acciones2.map((accion) => {
          const result = { ...accion };
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
      async createAccion(accionData) {
        const id = randomUUID();
        const accion = {
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
          createdAt: /* @__PURE__ */ new Date()
        };
        this.acciones.set(id, accion);
        return accion;
      }
      async updateAccionEstado(id, estado) {
        const accion = this.acciones.get(id);
        if (accion) {
          accion.estado = estado;
          if (estado === "ejecutada") {
            accion.ejecutadaAt = /* @__PURE__ */ new Date();
          }
          this.acciones.set(id, accion);
        }
        return accion;
      }
      async confirmarAccion(id) {
        const accion = this.acciones.get(id);
        if (accion) {
          accion.estado = "confirmada";
          accion.confirmadaAt = /* @__PURE__ */ new Date();
          this.acciones.set(id, accion);
        }
        return accion;
      }
      // Sistema de automatizaciones
      iniciarAutomatizaciones() {
        if (typeof process !== "undefined" && process.env.VERCEL) {
          setTimeout(() => {
            this.ejecutarAutomatizaciones().catch(console.error);
          }, 2e3);
        } else {
          setInterval(() => {
            this.ejecutarAutomatizaciones().catch(console.error);
          }, 6e4);
          setTimeout(() => {
            this.ejecutarAutomatizaciones().catch(console.error);
          }, 2e3);
        }
      }
      async ejecutarAutomatizaciones() {
        try {
          await this.automatizarRelances();
          await this.automatizarRecordatorios();
          await this.automatizarPostVisita();
          await this.automatizarScoring();
          await this.automatizarSaludPreventiva();
        } catch (error) {
          console.error("Error en automatizaciones:", error);
        }
      }
      async automatizarRelances() {
        const budgets2 = Array.from(this.budgets.values()).filter((b) => b.status === "pending");
        const ahora = /* @__PURE__ */ new Date();
        for (const budget of budgets2) {
          if (!budget.createdAt) continue;
          const fechaCreacion = new Date(budget.createdAt);
          const diasPendientes = Math.floor(
            (ahora.getTime() - fechaCreacion.getTime()) / (1e3 * 60 * 60 * 24)
          );
          const debeEnviar = diasPendientes >= 3 && diasPendientes % 7 === 0;
          if (debeEnviar) {
            const accionesRelances = Array.from(this.acciones.values()).filter(
              (a) => a.budgetId === budget.id && a.tipo === "relance" && a.ejecutadaAt && ahora.getTime() - new Date(a.ejecutadaAt).getTime() < 6 * 60 * 60 * 1e3
            );
            if (accionesRelances.length === 0) {
              const paciente = this.pacientes.get(budget.patientId);
              if (!paciente) continue;
              const canal = paciente.whatsapp ? "whatsapp" : "sms";
              const { generateRelanceMessage: generateRelanceMessage2 } = await Promise.resolve().then(() => (init_openai2(), openai_exports));
              const mensaje = await generateRelanceMessage2(
                {
                  nombre: paciente.nombre,
                  edad: paciente.edad,
                  historial: paciente.diagnostico
                },
                {
                  amount: Number(budget.amount),
                  treatmentDetails: budget.treatmentDetails
                },
                canal,
                diasPendientes
              );
              await this.createAccion({
                tipo: "relance",
                estado: "ejecutada",
                titulo: `Relance autom\xE1tico - ${paciente.nombre}`,
                descripcion: `Presupuesto pendiente desde hace ${diasPendientes} d\xEDas`,
                pacienteId: budget.patientId,
                budgetId: budget.id,
                canal: canal || null,
                mensaje: mensaje || null,
                requiereConfirmacion: false,
                ejecutadaAt: /* @__PURE__ */ new Date(),
                metadata: {
                  diasPendientes,
                  monto: String(budget.amount)
                }
              });
              console.log(`[AUTOMATIZACI\xD3N] Relance enviado a ${paciente.nombre} v\xEDa ${canal}`);
            }
          }
        }
      }
      async automatizarRecordatorios() {
        const reglasRecordatorios = Array.from(this.reglasComunicacion.values()).filter((r) => r.tipo === "recordatorio_cita" && r.activa);
        if (reglasRecordatorios.length === 0) {
          return this.automatizarRecordatoriosConConfiguracion([
            { horasAntes: 24, canal: "whatsapp", mensaje: "" },
            { horasAntes: 1, canal: "sms", mensaje: "" }
          ]);
        }
        const regla = reglasRecordatorios[0];
        const configuraciones = [];
        if (Array.isArray(regla.secuencia)) {
          for (const paso of regla.secuencia) {
            if (typeof paso === "object" && paso !== null) {
              let horasAntes = 24;
              if ("horasAntes" in paso && typeof paso.horasAntes === "number") {
                horasAntes = paso.horasAntes;
              } else if ("diasDespues" in paso) {
                const dias = paso.diasDespues;
                horasAntes = dias === 1 ? 24 : dias === 0 ? 1 : dias * 24;
              }
              const canal = "canal" in paso && typeof paso.canal === "string" ? paso.canal : "whatsapp";
              const mensaje = "mensaje" in paso && typeof paso.mensaje === "string" ? paso.mensaje : "";
              configuraciones.push({ horasAntes, canal, mensaje });
            }
          }
        }
        if (configuraciones.length === 0) {
          configuraciones.push(
            { horasAntes: 24, canal: "whatsapp", mensaje: "" },
            { horasAntes: 1, canal: "sms", mensaje: "" }
          );
        }
        return this.automatizarRecordatoriosConConfiguracion(configuraciones);
      }
      async automatizarRecordatoriosConConfiguracion(configuraciones) {
        const citas2 = Array.from(this.citas.values()).filter((c) => c.estado === "programada");
        const ahora = /* @__PURE__ */ new Date();
        for (const cita of citas2) {
          const fechaCita = new Date(cita.fechaHora);
          const horasHastaCita = (fechaCita.getTime() - ahora.getTime()) / (1e3 * 60 * 60);
          for (const config of configuraciones) {
            const debeEnviar = horasHastaCita > config.horasAntes - 0.5 && horasHastaCita < config.horasAntes + 0.5;
            if (debeEnviar) {
              const tipoRecordatorio = `${config.horasAntes}h`;
              const accionesRecordatorios = Array.from(this.acciones.values()).filter(
                (a) => a.citaId === cita.id && a.tipo === "recordatorio" && a.metadata && typeof a.metadata === "object" && "tipo" in a.metadata && a.metadata.tipo === tipoRecordatorio
              );
              if (accionesRecordatorios.length === 0) {
                const paciente = this.pacientes.get(cita.pacienteId);
                if (!paciente) continue;
                let canal = config.canal || (paciente.whatsapp ? "whatsapp" : "sms");
                if (canal === "whatsapp" && !paciente.whatsapp) {
                  canal = "sms";
                }
                let mensaje = config.mensaje || "";
                if (!mensaje.trim()) {
                  const { generateReminderMessage: generateReminderMessage2 } = await Promise.resolve().then(() => (init_openai2(), openai_exports));
                  mensaje = await generateReminderMessage2(
                    {
                      nombre: paciente.nombre,
                      edad: paciente.edad
                    },
                    fechaCita,
                    cita.tipo,
                    config.horasAntes
                  );
                } else {
                  mensaje = mensaje.replace(/{nombre}/g, paciente.nombre).replace(/{fecha}/g, fechaCita.toLocaleDateString("es-ES")).replace(/{hora}/g, fechaCita.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })).replace(/{tipo}/g, cita.tipo);
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
                  ejecutadaAt: /* @__PURE__ */ new Date(),
                  metadata: {
                    tipo: tipoRecordatorio,
                    horasAntes: config.horasAntes,
                    fechaCita: fechaCita.toISOString(),
                    mensajePersonalizado: !!config.mensaje
                  }
                });
                console.log(`[AUTOMATIZACI\xD3N] Recordatorio ${tipoRecordatorio} enviado a ${paciente.nombre} v\xEDa ${canal}`);
              }
            }
          }
        }
      }
      async automatizarPostVisita() {
        const reglasPostVisita = Array.from(this.reglasComunicacion.values()).filter((r) => r.tipo === "post_visita" && r.activa);
        if (reglasPostVisita.length === 0) {
          return this.automatizarPostVisitaConConfiguracion([
            { horasDespues: 168, canal: "whatsapp", mensaje: "" }
            // 7 días = 168 horas
          ]);
        }
        const regla = reglasPostVisita[0];
        const configuraciones = [];
        if (Array.isArray(regla.secuencia)) {
          for (const paso of regla.secuencia) {
            if (typeof paso === "object" && paso !== null) {
              let horasDespues = 168;
              if ("horasDespues" in paso && typeof paso.horasDespues === "number") {
                horasDespues = paso.horasDespues;
              } else if ("diasDespues" in paso) {
                const dias = paso.diasDespues;
                horasDespues = dias * 24;
              }
              const canal = "canal" in paso && typeof paso.canal === "string" ? paso.canal : "whatsapp";
              const mensaje = "mensaje" in paso && typeof paso.mensaje === "string" ? paso.mensaje : "";
              configuraciones.push({ horasDespues, canal, mensaje });
            }
          }
        }
        if (configuraciones.length === 0) {
          configuraciones.push({ horasDespues: 168, canal: "whatsapp", mensaje: "" });
        }
        return this.automatizarPostVisitaConConfiguracion(configuraciones);
      }
      async automatizarPostVisitaConConfiguracion(configuraciones) {
        const budgets2 = Array.from(this.budgets.values()).filter((b) => b.status === "accepted" && b.updatedAt);
        const ahora = /* @__PURE__ */ new Date();
        for (const budget of budgets2) {
          if (!budget.updatedAt) continue;
          const fechaAceptacion = new Date(budget.updatedAt);
          const horasDesdeAceptacion = (ahora.getTime() - fechaAceptacion.getTime()) / (1e3 * 60 * 60);
          for (const config of configuraciones) {
            const debeEnviar = horasDesdeAceptacion > config.horasDespues - 0.5 && horasDesdeAceptacion < config.horasDespues + 0.5;
            if (debeEnviar) {
              const tipoMensaje = `${config.horasDespues}h`;
              const accionesPostVisita = Array.from(this.acciones.values()).filter(
                (a) => a.budgetId === budget.id && a.tipo === "post_visita" && a.metadata && typeof a.metadata === "object" && "tipo" in a.metadata && a.metadata.tipo === tipoMensaje
              );
              if (accionesPostVisita.length === 0) {
                const paciente = this.pacientes.get(budget.patientId);
                if (!paciente) continue;
                let canal = config.canal || (paciente.whatsapp ? "whatsapp" : "email");
                if (canal === "whatsapp" && !paciente.whatsapp) {
                  canal = "email";
                }
                const tratamiento = budget.treatmentDetails && typeof budget.treatmentDetails === "object" && "procedures" in budget.treatmentDetails && Array.isArray(budget.treatmentDetails.procedures) ? budget.treatmentDetails.procedures.join(", ") : "tratamiento dental";
                let mensaje = config.mensaje || "";
                if (!mensaje.trim()) {
                  const { generatePostVisitMessage: generatePostVisitMessage2 } = await Promise.resolve().then(() => (init_openai2(), openai_exports));
                  mensaje = await generatePostVisitMessage2(
                    {
                      nombre: paciente.nombre,
                      edad: paciente.edad
                    },
                    tratamiento
                  );
                } else {
                  mensaje = mensaje.replace(/{nombre}/g, paciente.nombre).replace(/{fecha}/g, fechaAceptacion.toLocaleDateString("es-ES")).replace(/{tratamiento}/g, tratamiento);
                }
                await this.createAccion({
                  tipo: "post_visita",
                  estado: "ejecutada",
                  titulo: `Mensaje post-visita ${tipoMensaje} - ${paciente.nombre}`,
                  descripcion: `Seguimiento despu\xE9s de ${tratamiento}`,
                  pacienteId: budget.patientId,
                  budgetId: budget.id,
                  canal: canal || null,
                  mensaje: mensaje || null,
                  requiereConfirmacion: false,
                  ejecutadaAt: /* @__PURE__ */ new Date(),
                  metadata: {
                    tipo: tipoMensaje,
                    horasDespues: config.horasDespues,
                    tratamiento,
                    fechaAceptacion: fechaAceptacion.toISOString(),
                    mensajePersonalizado: !!config.mensaje
                  }
                });
                console.log(`[AUTOMATIZACI\xD3N] Mensaje post-visita ${tipoMensaje} enviado a ${paciente.nombre} v\xEDa ${canal}`);
              }
            }
          }
        }
      }
      async automatizarScoring() {
        const budgets2 = Array.from(this.budgets.values()).filter((b) => !b.urgencyScore || !b.acceptanceProb);
        for (const budget of budgets2) {
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
                budgetsAnteriores: Array.from(this.budgets.values()).filter((b) => b.patientId === budget.patientId && b.id !== budget.id).map((b) => ({ amount: Number(b.amount), status: b.status }))
              }
            );
            const acceptanceProb = await calculateAcceptanceProb(
              { amount: amountNumber, treatmentDetails: budget.treatmentDetails },
              {
                nombre: paciente.nombre,
                edad: paciente.edad,
                historial: paciente.diagnostico,
                ultimaVisita: paciente.ultimaVisita,
                budgetsAnteriores: Array.from(this.budgets.values()).filter((b) => b.patientId === budget.patientId && b.id !== budget.id).map((b) => ({ amount: Number(b.amount), status: b.status }))
              }
            );
            const priority = calculatePriority2(urgencyScore, acceptanceProb);
            budget.urgencyScore = urgencyScore;
            budget.acceptanceProb = acceptanceProb;
            budget.priority = priority;
            budget.updatedAt = /* @__PURE__ */ new Date();
            this.budgets.set(budget.id, budget);
            await this.createAccion({
              tipo: "scoring",
              estado: "ejecutada",
              titulo: `Scoring IA calculado - ${paciente.nombre}`,
              descripcion: `Urgencia: ${urgencyScore}, Aceptaci\xF3n: ${acceptanceProb}%, Prioridad: ${priority}`,
              pacienteId: budget.patientId,
              budgetId: budget.id,
              canal: null,
              mensaje: null,
              requiereConfirmacion: false,
              ejecutadaAt: /* @__PURE__ */ new Date(),
              metadata: {
                urgencyScore,
                acceptanceProb,
                priority
              }
            });
            console.log(`[AUTOMATIZACI\xD3N] Scoring calculado para budget ${budget.id}`);
          } catch (error) {
            console.error(`Error calculando scoring para budget ${budget.id}:`, error);
          }
        }
      }
      // Tratamientos Preventivos
      async getTratamientosPreventivos(filtros) {
        let tratamientos = Array.from(this.tratamientosPreventivos.values());
        if (filtros?.pacienteId) {
          tratamientos = tratamientos.filter((t) => t.pacienteId === filtros.pacienteId);
        }
        return tratamientos.map((tratamiento) => {
          const paciente = this.pacientes.get(tratamiento.pacienteId);
          if (!paciente) {
            throw new Error(`Patient not found for tratamiento ${tratamiento.id}`);
          }
          return {
            ...tratamiento,
            pacienteNombre: paciente.nombre,
            pacienteEmail: paciente.email,
            pacientePhone: paciente.telefono,
            pacienteWhatsapp: paciente.whatsapp || void 0
          };
        }).sort((a, b) => {
          const dateA = a.fechaRealizacion ? new Date(a.fechaRealizacion).getTime() : 0;
          const dateB = b.fechaRealizacion ? new Date(b.fechaRealizacion).getTime() : 0;
          return dateB - dateA;
        });
      }
      async createTratamientoPreventivo(tratamientoData) {
        const id = randomUUID();
        const tratamiento = {
          ...tratamientoData,
          id,
          notas: tratamientoData.notas || null,
          citaId: tratamientoData.citaId || null,
          budgetId: tratamientoData.budgetId || null,
          createdAt: /* @__PURE__ */ new Date()
        };
        this.tratamientosPreventivos.set(id, tratamiento);
        return tratamiento;
      }
      async getRecordatoriosPreventivosPendientes() {
        const ahora = /* @__PURE__ */ new Date();
        const recordatorios2 = [];
        const tratamientos = Array.from(this.tratamientosPreventivos.values());
        for (const tratamiento of tratamientos) {
          if (!tratamiento.proximaFechaRecomendada) continue;
          const proximaFecha = new Date(tratamiento.proximaFechaRecomendada);
          const diasVencidos = Math.floor((ahora.getTime() - proximaFecha.getTime()) / (1e3 * 60 * 60 * 24));
          if (diasVencidos > 0) {
            const paciente = this.pacientes.get(tratamiento.pacienteId);
            if (!paciente) continue;
            const accionesPreventivas = Array.from(this.acciones.values()).filter(
              (a) => a.pacienteId === tratamiento.pacienteId && a.tipo === "preventivo" && a.metadata && typeof a.metadata === "object" && "tipoTratamiento" in a.metadata && a.metadata.tipoTratamiento === tratamiento.tipoTratamiento
            );
            const intentosEnviados = accionesPreventivas.length;
            let canalSiguiente = "whatsapp";
            if (intentosEnviados >= 1) canalSiguiente = "sms";
            if (intentosEnviados >= 2) canalSiguiente = "email";
            if (intentosEnviados < 3) {
              recordatorios2.push({
                pacienteId: tratamiento.pacienteId,
                pacienteNombre: paciente.nombre,
                tipoTratamiento: tratamiento.tipoTratamiento,
                ultimaFecha: new Date(tratamiento.fechaRealizacion),
                proximaFechaRecomendada: proximaFecha,
                diasVencidos,
                canalSiguiente,
                intentosEnviados
              });
            }
          }
        }
        return recordatorios2.sort((a, b) => b.diasVencidos - a.diasVencidos);
      }
      async automatizarSaludPreventiva() {
        const recordatoriosPendientes = await this.getRecordatoriosPreventivosPendientes();
        const ahora = /* @__PURE__ */ new Date();
        for (const recordatorio of recordatoriosPendientes) {
          const accionesRecientes = Array.from(this.acciones.values()).filter(
            (a) => a.pacienteId === recordatorio.pacienteId && a.tipo === "preventivo" && a.metadata && typeof a.metadata === "object" && "tipoTratamiento" in a.metadata && a.metadata.tipoTratamiento === recordatorio.tipoTratamiento && a.canal === recordatorio.canalSiguiente && a.ejecutadaAt && ahora.getTime() - new Date(a.ejecutadaAt).getTime() < 24 * 60 * 60 * 1e3
          );
          if (accionesRecientes.length === 0) {
            const paciente = this.pacientes.get(recordatorio.pacienteId);
            if (!paciente) continue;
            const { generatePreventiveHealthMessage: generatePreventiveHealthMessage2 } = await Promise.resolve().then(() => (init_openai2(), openai_exports));
            const mensaje = await generatePreventiveHealthMessage2(
              {
                nombre: paciente.nombre,
                edad: paciente.edad,
                historial: paciente.diagnostico,
                ultimaVisita: recordatorio.ultimaFecha
              },
              recordatorio.tipoTratamiento,
              recordatorio.diasVencidos,
              recordatorio.canalSiguiente,
              recordatorio.intentosEnviados + 1
            );
            await this.createAccion({
              tipo: "preventivo",
              estado: "ejecutada",
              titulo: `Salud Preventiva - ${recordatorio.tipoTratamiento} - ${paciente.nombre}`,
              descripcion: `Recordatorio para ${recordatorio.tipoTratamiento}. Han pasado ${Math.floor(recordatorio.diasVencidos / 30)} meses desde la \xFAltima visita.`,
              pacienteId: recordatorio.pacienteId,
              canal: recordatorio.canalSiguiente,
              mensaje: mensaje || null,
              requiereConfirmacion: false,
              ejecutadaAt: /* @__PURE__ */ new Date(),
              metadata: {
                tipoTratamiento: recordatorio.tipoTratamiento,
                diasVencidos: recordatorio.diasVencidos,
                intento: recordatorio.intentosEnviados + 1,
                ultimaFecha: recordatorio.ultimaFecha.toISOString()
              }
            });
            console.log(`[AUTOMATIZACI\xD3N] Recordatorio preventivo enviado a ${paciente.nombre} v\xEDa ${recordatorio.canalSiguiente} para ${recordatorio.tipoTratamiento}`);
          }
        }
        await this.detectarTratamientosPreventivosDesdeCitas();
        await this.detectarTratamientosPreventivosDesdeBudgets();
      }
      // Detectar tratamientos preventivos desde citas completadas
      async detectarTratamientosPreventivosDesdeCitas() {
        const citasCompletadas = Array.from(this.citas.values()).filter((c) => c.estado === "completada");
        const tratamientosPreventivos2 = ["limpieza", "revision", "fluorizacion"];
        for (const cita of citasCompletadas) {
          if (!tratamientosPreventivos2.includes(cita.tipo)) continue;
          const tratamientoExistente = Array.from(this.tratamientosPreventivos.values()).find((t) => t.citaId === cita.id);
          if (!tratamientoExistente) {
            const regla = this.reglasFrecuencia.find((r) => r.tipoTratamiento === cita.tipo);
            if (!regla) continue;
            const fechaRealizacion = new Date(cita.fechaHora);
            const proximaFecha = new Date(fechaRealizacion);
            proximaFecha.setMonth(proximaFecha.getMonth() + regla.frecuenciaMeses);
            await this.createTratamientoPreventivo({
              pacienteId: cita.pacienteId,
              clinicId: "clinic-1",
              // Default clinic
              tipoTratamiento: cita.tipo,
              fechaRealizacion,
              proximaFechaRecomendada: proximaFecha,
              frecuenciaMeses: regla.frecuenciaMeses,
              citaId: cita.id,
              budgetId: null,
              notas: `Detectado autom\xE1ticamente desde cita completada`
            });
            console.log(`[AUTOMATIZACI\xD3N] Tratamiento preventivo creado para ${cita.tipo} de paciente ${cita.pacienteId}`);
          }
        }
      }
      // Detectar tratamientos preventivos desde budgets aceptados
      async detectarTratamientosPreventivosDesdeBudgets() {
        const budgetsAceptados = Array.from(this.budgets.values()).filter((b) => b.status === "accepted");
        for (const budget of budgetsAceptados) {
          if (!budget.treatmentDetails || typeof budget.treatmentDetails !== "object") continue;
          const procedures = budget.treatmentDetails.procedures || [];
          const procedimientosPreventivos = procedures.filter(
            (p) => p.toLowerCase().includes("limpieza") || p.toLowerCase().includes("revisi\xF3n") || p.toLowerCase().includes("revision") || p.toLowerCase().includes("fluorizaci\xF3n") || p.toLowerCase().includes("fluorizacion")
          );
          for (const procedimiento of procedimientosPreventivos) {
            let tipoTratamiento = "limpieza";
            if (procedimiento.toLowerCase().includes("revisi\xF3n") || procedimiento.toLowerCase().includes("revision")) {
              tipoTratamiento = "revision";
            } else if (procedimiento.toLowerCase().includes("fluor")) {
              tipoTratamiento = "fluorizacion";
            }
            const regla = this.reglasFrecuencia.find((r) => r.tipoTratamiento === tipoTratamiento);
            if (!regla) continue;
            const tratamientoExistente = Array.from(this.tratamientosPreventivos.values()).find((t) => t.budgetId === budget.id && t.tipoTratamiento === tipoTratamiento);
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
                notas: `Detectado autom\xE1ticamente desde presupuesto aceptado`
              });
              console.log(`[AUTOMATIZACI\xD3N] Tratamiento preventivo creado para ${tipoTratamiento} desde budget ${budget.id}`);
            }
          }
        }
      }
      // ============= REGLAS DE COMUNICACIÓN =============
      async getReglasComunicacion() {
        return Array.from(this.reglasComunicacion.values()).sort((a, b) => {
          const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
          const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
          return dateB - dateA;
        });
      }
      async getReglaComunicacion(id) {
        return this.reglasComunicacion.get(id);
      }
      async createReglaComunicacion(reglaData) {
        const id = randomUUID();
        const regla = {
          ...reglaData,
          id,
          activa: reglaData.activa ?? true,
          criterios: reglaData.criterios ?? null,
          createdAt: /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date()
        };
        this.reglasComunicacion.set(id, regla);
        return regla;
      }
      async updateReglaComunicacion(id, reglaData) {
        const regla = this.reglasComunicacion.get(id);
        if (!regla) return void 0;
        const updated = {
          ...regla,
          ...reglaData,
          updatedAt: /* @__PURE__ */ new Date()
        };
        this.reglasComunicacion.set(id, updated);
        return updated;
      }
      async deleteReglaComunicacion(id) {
        return this.reglasComunicacion.delete(id);
      }
      // Crear secuencias de recall para pacientes dormidos (asignación contextual)
      async inicializarSecuenciasParaPacientesDormidos() {
        const ahora = /* @__PURE__ */ new Date();
        const pacientes2 = Array.from(this.pacientes.values());
        const pacientesDormidos = pacientes2.filter((p) => {
          const ultimaVisita = new Date(p.ultimaVisita);
          const mesesSinVisita = (ahora.getTime() - ultimaVisita.getTime()) / (1e3 * 60 * 60 * 24 * 30);
          return p.estado === "perdido" || mesesSinVisita >= 6 && !p.tieneCitaFutura;
        });
        const reglasRecall = Array.from(this.reglasComunicacion.values()).filter((r) => r.tipo === "recall_paciente" && r.activa);
        if (reglasRecall.length === 0) {
          console.log("[AUTOMATIZACI\xD3N] No hay reglas de recall configuradas");
          return;
        }
        const asignarCampa\u00F1aContextual = (diagnostico) => {
          const diagnosticoLower = diagnostico.toLowerCase();
          if (diagnosticoLower.includes("periodoncia") || diagnosticoLower.includes("gingivitis") || diagnosticoLower.includes("enc\xEDa")) {
            return reglasRecall.find((r) => r.nombre.includes("Periodontal")) || reglasRecall[0];
          }
          if (diagnosticoLower.includes("caries") || diagnosticoLower.includes("endodoncia") || diagnosticoLower.includes("conducto") || diagnosticoLower.includes("extracci\xF3n") || diagnosticoLower.includes("tratamiento")) {
            return reglasRecall.find((r) => r.nombre.includes("Incompletos")) || reglasRecall[1] || reglasRecall[0];
          }
          return reglasRecall.find((r) => r.nombre.includes("Prevenci\xF3n")) || reglasRecall[2] || reglasRecall[0];
        };
        for (const paciente of pacientesDormidos) {
          const secuenciasExistentes = await this.getSecuenciasComunicacion({
            tipo: "recall_paciente",
            estado: "activa"
          });
          const tieneSecuenciaActiva = secuenciasExistentes.some((s) => s.pacienteId === paciente.id);
          if (tieneSecuenciaActiva) continue;
          const regla = asignarCampa\u00F1aContextual(paciente.diagnostico);
          if (!regla) continue;
          const pasos = regla.secuencia;
          if (pasos.length === 0) continue;
          const primerPaso = pasos[0];
          const fechaInicio = new Date(ahora.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1e3);
          const proximaAccion = new Date(fechaInicio);
          proximaAccion.setDate(proximaAccion.getDate() + primerPaso.diasDespues);
          if (proximaAccion < ahora) {
            proximaAccion.setTime(ahora.getTime());
            proximaAccion.setDate(proximaAccion.getDate() + primerPaso.diasDespues);
          }
          const secuenciaData = {
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
              diagnostico: paciente.diagnostico
            }
          };
          await this.createSecuenciaComunicacion(secuenciaData);
        }
        console.log(`[AUTOMATIZACI\xD3N] Secuencias de recall contextuales creadas para ${pacientesDormidos.length} pacientes dormidos`);
      }
      // Iniciar secuencia de relance para un presupuesto
      async iniciarSecuenciaRelance(budgetId, pacienteId) {
        const reglasRelance = Array.from(this.reglasComunicacion.values()).filter((r) => r.tipo === "relance_presupuesto" && r.activa);
        if (reglasRelance.length === 0) {
          console.log(`[AUTOMATIZACI\xD3N] No hay reglas de relance configuradas para budget ${budgetId}`);
          return;
        }
        const regla = reglasRelance[0];
        const pasos = regla.secuencia;
        if (pasos.length === 0) {
          console.log(`[AUTOMATIZACI\xD3N] La regla ${regla.id} no tiene pasos configurados`);
          return;
        }
        const secuenciaExistente = await this.getSecuenciaComunicacionPorBudget(budgetId);
        if (secuenciaExistente) {
          console.log(`[AUTOMATIZACI\xD3N] Ya existe una secuencia activa para budget ${budgetId}`);
          return;
        }
        const ahora = /* @__PURE__ */ new Date();
        const primerPaso = pasos[0];
        const proximaAccion = new Date(ahora);
        proximaAccion.setDate(proximaAccion.getDate() + primerPaso.diasDespues);
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
            pasosTotales: pasos.length
          }
        });
        console.log(`[AUTOMATIZACI\xD3N] Secuencia de relance iniciada para budget ${budgetId} con regla "${regla.nombre}"`);
      }
      // ============= SECUENCIAS DE COMUNICACIÓN =============
      async getSecuenciasComunicacion(filtros) {
        let secuencias = Array.from(this.secuenciasComunicacion.values());
        if (filtros?.tipo) {
          secuencias = secuencias.filter((s) => s.tipo === filtros.tipo);
        }
        if (filtros?.estado) {
          secuencias = secuencias.filter((s) => s.estado === filtros.estado);
        }
        if (filtros?.budgetId) {
          secuencias = secuencias.filter((s) => s.budgetId === filtros.budgetId);
        }
        return secuencias.sort((a, b) => {
          const dateA = a.proximaAccion ? new Date(a.proximaAccion).getTime() : 0;
          const dateB = b.proximaAccion ? new Date(b.proximaAccion).getTime() : 0;
          return dateA - dateB;
        });
      }
      async getSecuenciaComunicacionPorBudget(budgetId) {
        const secuencias = Array.from(this.secuenciasComunicacion.values()).filter((s) => s.budgetId === budgetId && s.tipo === "relance_presupuesto" && s.estado === "activa");
        return secuencias[0];
      }
      async getSecuenciaComunicacion(id) {
        return this.secuenciasComunicacion.get(id);
      }
      async createSecuenciaComunicacion(secuenciaData) {
        const id = randomUUID();
        const secuencia = {
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
          createdAt: /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date(),
          metadata: secuenciaData.metadata || null
        };
        this.secuenciasComunicacion.set(id, secuencia);
        return secuencia;
      }
      async updateSecuenciaComunicacion(id, secuenciaData) {
        const secuencia = this.secuenciasComunicacion.get(id);
        if (!secuencia) return void 0;
        const updated = {
          ...secuencia,
          ...secuenciaData,
          ultimaAccion: secuenciaData.ultimaAccion !== void 0 ? secuenciaData.ultimaAccion || null : secuencia.ultimaAccion || null,
          proximaAccion: secuenciaData.proximaAccion !== void 0 ? secuenciaData.proximaAccion || null : secuencia.proximaAccion || null,
          updatedAt: /* @__PURE__ */ new Date()
        };
        this.secuenciasComunicacion.set(id, updated);
        return updated;
      }
      async avanzarSecuenciaComunicacion(id) {
        const secuencia = this.secuenciasComunicacion.get(id);
        if (!secuencia) return void 0;
        const regla = this.reglasComunicacion.get(secuencia.reglaId);
        if (!regla) return void 0;
        const pasos = regla.secuencia;
        const pasoActualNum = secuencia.pasoActual || 0;
        const siguientePaso = pasos[pasoActualNum + 1];
        if (!siguientePaso) {
          return await this.updateSecuenciaComunicacion(id, {
            estado: "completada",
            ultimaAccion: /* @__PURE__ */ new Date()
          });
        }
        const ahora = /* @__PURE__ */ new Date();
        const proximaAccion = new Date(ahora);
        proximaAccion.setDate(proximaAccion.getDate() + siguientePaso.diasDespues);
        return await this.updateSecuenciaComunicacion(id, {
          pasoActual: pasoActualNum + 1,
          ultimaAccion: ahora,
          proximaAccion
        });
      }
    };
    storage = new MemStorage();
    (async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 100));
        const pacientesCount = (await storage.getPacientes()).length;
        const budgetsCount = (await storage.getBudgets()).length;
        const citasCount = (await storage.getCitas()).length;
        const campanasCount = (await storage.getCampanas()).length;
        const tareasCount = (await storage.getTareas()).length;
        console.log(`[Storage] Initialization verified:`);
        console.log(`[Storage]   - Pacientes: ${pacientesCount} (expected: 200)`);
        console.log(`[Storage]   - Budgets: ${budgetsCount} (expected: 50)`);
        console.log(`[Storage]   - Citas: ${citasCount} (expected: ~60)`);
        console.log(`[Storage]   - Campa\xF1as: ${campanasCount} (expected: 3)`);
        console.log(`[Storage]   - Tareas: ${tareasCount}`);
        if (pacientesCount === 0 || budgetsCount === 0) {
          console.error("[Storage] ERROR: Storage appears to be empty!");
          console.error("[Storage] This should not happen - storage should initialize in constructor.");
        }
      } catch (error) {
        console.error("[Storage] Error verifying initialization:", error);
      }
    })();
  }
});

// server/routes.ts
import { createServer } from "http";

// node_modules/drizzle-orm/entity.js
var entityKind = Symbol.for("drizzle:entityKind");
var hasOwnEntityKind = Symbol.for("drizzle:hasOwnEntityKind");
function is(value, type) {
  if (!value || typeof value !== "object") {
    return false;
  }
  if (value instanceof type) {
    return true;
  }
  if (!Object.prototype.hasOwnProperty.call(type, entityKind)) {
    throw new Error(
      `Class "${type.name ?? "<unknown>"}" doesn't look like a Drizzle entity. If this is incorrect and the class is provided by Drizzle, please report this as a bug.`
    );
  }
  let cls = Object.getPrototypeOf(value).constructor;
  if (cls) {
    while (cls) {
      if (entityKind in cls && cls[entityKind] === type[entityKind]) {
        return true;
      }
      cls = Object.getPrototypeOf(cls);
    }
  }
  return false;
}

// node_modules/drizzle-orm/column.js
var Column = class {
  constructor(table, config) {
    this.table = table;
    this.config = config;
    this.name = config.name;
    this.keyAsName = config.keyAsName;
    this.notNull = config.notNull;
    this.default = config.default;
    this.defaultFn = config.defaultFn;
    this.onUpdateFn = config.onUpdateFn;
    this.hasDefault = config.hasDefault;
    this.primary = config.primaryKey;
    this.isUnique = config.isUnique;
    this.uniqueName = config.uniqueName;
    this.uniqueType = config.uniqueType;
    this.dataType = config.dataType;
    this.columnType = config.columnType;
    this.generated = config.generated;
    this.generatedIdentity = config.generatedIdentity;
  }
  static [entityKind] = "Column";
  name;
  keyAsName;
  primary;
  notNull;
  default;
  defaultFn;
  onUpdateFn;
  hasDefault;
  isUnique;
  uniqueName;
  uniqueType;
  dataType;
  columnType;
  enumValues = void 0;
  generated = void 0;
  generatedIdentity = void 0;
  config;
  mapFromDriverValue(value) {
    return value;
  }
  mapToDriverValue(value) {
    return value;
  }
  // ** @internal */
  shouldDisableInsert() {
    return this.config.generated !== void 0 && this.config.generated.type !== "byDefault";
  }
};

// node_modules/drizzle-orm/column-builder.js
var ColumnBuilder = class {
  static [entityKind] = "ColumnBuilder";
  config;
  constructor(name, dataType, columnType) {
    this.config = {
      name,
      keyAsName: name === "",
      notNull: false,
      default: void 0,
      hasDefault: false,
      primaryKey: false,
      isUnique: false,
      uniqueName: void 0,
      uniqueType: void 0,
      dataType,
      columnType,
      generated: void 0
    };
  }
  /**
   * Changes the data type of the column. Commonly used with `json` columns. Also, useful for branded types.
   *
   * @example
   * ```ts
   * const users = pgTable('users', {
   * 	id: integer('id').$type<UserId>().primaryKey(),
   * 	details: json('details').$type<UserDetails>().notNull(),
   * });
   * ```
   */
  $type() {
    return this;
  }
  /**
   * Adds a `not null` clause to the column definition.
   *
   * Affects the `select` model of the table - columns *without* `not null` will be nullable on select.
   */
  notNull() {
    this.config.notNull = true;
    return this;
  }
  /**
   * Adds a `default <value>` clause to the column definition.
   *
   * Affects the `insert` model of the table - columns *with* `default` are optional on insert.
   *
   * If you need to set a dynamic default value, use {@link $defaultFn} instead.
   */
  default(value) {
    this.config.default = value;
    this.config.hasDefault = true;
    return this;
  }
  /**
   * Adds a dynamic default value to the column.
   * The function will be called when the row is inserted, and the returned value will be used as the column value.
   *
   * **Note:** This value does not affect the `drizzle-kit` behavior, it is only used at runtime in `drizzle-orm`.
   */
  $defaultFn(fn) {
    this.config.defaultFn = fn;
    this.config.hasDefault = true;
    return this;
  }
  /**
   * Alias for {@link $defaultFn}.
   */
  $default = this.$defaultFn;
  /**
   * Adds a dynamic update value to the column.
   * The function will be called when the row is updated, and the returned value will be used as the column value if none is provided.
   * If no `default` (or `$defaultFn`) value is provided, the function will be called when the row is inserted as well, and the returned value will be used as the column value.
   *
   * **Note:** This value does not affect the `drizzle-kit` behavior, it is only used at runtime in `drizzle-orm`.
   */
  $onUpdateFn(fn) {
    this.config.onUpdateFn = fn;
    this.config.hasDefault = true;
    return this;
  }
  /**
   * Alias for {@link $onUpdateFn}.
   */
  $onUpdate = this.$onUpdateFn;
  /**
   * Adds a `primary key` clause to the column definition. This implicitly makes the column `not null`.
   *
   * In SQLite, `integer primary key` implicitly makes the column auto-incrementing.
   */
  primaryKey() {
    this.config.primaryKey = true;
    this.config.notNull = true;
    return this;
  }
  /** @internal Sets the name of the column to the key within the table definition if a name was not given. */
  setName(name) {
    if (this.config.name !== "")
      return;
    this.config.name = name;
  }
};

// node_modules/drizzle-orm/table.utils.js
var TableName = Symbol.for("drizzle:Name");

// node_modules/drizzle-orm/pg-core/foreign-keys.js
var ForeignKeyBuilder = class {
  static [entityKind] = "PgForeignKeyBuilder";
  /** @internal */
  reference;
  /** @internal */
  _onUpdate = "no action";
  /** @internal */
  _onDelete = "no action";
  constructor(config, actions) {
    this.reference = () => {
      const { name, columns, foreignColumns } = config();
      return { name, columns, foreignTable: foreignColumns[0].table, foreignColumns };
    };
    if (actions) {
      this._onUpdate = actions.onUpdate;
      this._onDelete = actions.onDelete;
    }
  }
  onUpdate(action) {
    this._onUpdate = action === void 0 ? "no action" : action;
    return this;
  }
  onDelete(action) {
    this._onDelete = action === void 0 ? "no action" : action;
    return this;
  }
  /** @internal */
  build(table) {
    return new ForeignKey(table, this);
  }
};
var ForeignKey = class {
  constructor(table, builder) {
    this.table = table;
    this.reference = builder.reference;
    this.onUpdate = builder._onUpdate;
    this.onDelete = builder._onDelete;
  }
  static [entityKind] = "PgForeignKey";
  reference;
  onUpdate;
  onDelete;
  getName() {
    const { name, columns, foreignColumns } = this.reference();
    const columnNames = columns.map((column) => column.name);
    const foreignColumnNames = foreignColumns.map((column) => column.name);
    const chunks = [
      this.table[TableName],
      ...columnNames,
      foreignColumns[0].table[TableName],
      ...foreignColumnNames
    ];
    return name ?? `${chunks.join("_")}_fk`;
  }
};

// node_modules/drizzle-orm/tracing-utils.js
function iife(fn, ...args) {
  return fn(...args);
}

// node_modules/drizzle-orm/pg-core/unique-constraint.js
function uniqueKeyName(table, columns) {
  return `${table[TableName]}_${columns.join("_")}_unique`;
}
var UniqueConstraintBuilder = class {
  constructor(columns, name) {
    this.name = name;
    this.columns = columns;
  }
  static [entityKind] = "PgUniqueConstraintBuilder";
  /** @internal */
  columns;
  /** @internal */
  nullsNotDistinctConfig = false;
  nullsNotDistinct() {
    this.nullsNotDistinctConfig = true;
    return this;
  }
  /** @internal */
  build(table) {
    return new UniqueConstraint(table, this.columns, this.nullsNotDistinctConfig, this.name);
  }
};
var UniqueOnConstraintBuilder = class {
  static [entityKind] = "PgUniqueOnConstraintBuilder";
  /** @internal */
  name;
  constructor(name) {
    this.name = name;
  }
  on(...columns) {
    return new UniqueConstraintBuilder(columns, this.name);
  }
};
var UniqueConstraint = class {
  constructor(table, columns, nullsNotDistinct, name) {
    this.table = table;
    this.columns = columns;
    this.name = name ?? uniqueKeyName(this.table, this.columns.map((column) => column.name));
    this.nullsNotDistinct = nullsNotDistinct;
  }
  static [entityKind] = "PgUniqueConstraint";
  columns;
  name;
  nullsNotDistinct = false;
  getName() {
    return this.name;
  }
};

// node_modules/drizzle-orm/pg-core/utils/array.js
function parsePgArrayValue(arrayString, startFrom, inQuotes) {
  for (let i = startFrom; i < arrayString.length; i++) {
    const char2 = arrayString[i];
    if (char2 === "\\") {
      i++;
      continue;
    }
    if (char2 === '"') {
      return [arrayString.slice(startFrom, i).replace(/\\/g, ""), i + 1];
    }
    if (inQuotes) {
      continue;
    }
    if (char2 === "," || char2 === "}") {
      return [arrayString.slice(startFrom, i).replace(/\\/g, ""), i];
    }
  }
  return [arrayString.slice(startFrom).replace(/\\/g, ""), arrayString.length];
}
function parsePgNestedArray(arrayString, startFrom = 0) {
  const result = [];
  let i = startFrom;
  let lastCharIsComma = false;
  while (i < arrayString.length) {
    const char2 = arrayString[i];
    if (char2 === ",") {
      if (lastCharIsComma || i === startFrom) {
        result.push("");
      }
      lastCharIsComma = true;
      i++;
      continue;
    }
    lastCharIsComma = false;
    if (char2 === "\\") {
      i += 2;
      continue;
    }
    if (char2 === '"') {
      const [value2, startFrom2] = parsePgArrayValue(arrayString, i + 1, true);
      result.push(value2);
      i = startFrom2;
      continue;
    }
    if (char2 === "}") {
      return [result, i + 1];
    }
    if (char2 === "{") {
      const [value2, startFrom2] = parsePgNestedArray(arrayString, i + 1);
      result.push(value2);
      i = startFrom2;
      continue;
    }
    const [value, newStartFrom] = parsePgArrayValue(arrayString, i, false);
    result.push(value);
    i = newStartFrom;
  }
  return [result, i];
}
function parsePgArray(arrayString) {
  const [result] = parsePgNestedArray(arrayString, 1);
  return result;
}
function makePgArray(array) {
  return `{${array.map((item) => {
    if (Array.isArray(item)) {
      return makePgArray(item);
    }
    if (typeof item === "string") {
      return `"${item.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
    }
    return `${item}`;
  }).join(",")}}`;
}

// node_modules/drizzle-orm/pg-core/columns/common.js
var PgColumnBuilder = class extends ColumnBuilder {
  foreignKeyConfigs = [];
  static [entityKind] = "PgColumnBuilder";
  array(size) {
    return new PgArrayBuilder(this.config.name, this, size);
  }
  references(ref, actions = {}) {
    this.foreignKeyConfigs.push({ ref, actions });
    return this;
  }
  unique(name, config) {
    this.config.isUnique = true;
    this.config.uniqueName = name;
    this.config.uniqueType = config?.nulls;
    return this;
  }
  generatedAlwaysAs(as) {
    this.config.generated = {
      as,
      type: "always",
      mode: "stored"
    };
    return this;
  }
  /** @internal */
  buildForeignKeys(column, table) {
    return this.foreignKeyConfigs.map(({ ref, actions }) => {
      return iife(
        (ref2, actions2) => {
          const builder = new ForeignKeyBuilder(() => {
            const foreignColumn = ref2();
            return { columns: [column], foreignColumns: [foreignColumn] };
          });
          if (actions2.onUpdate) {
            builder.onUpdate(actions2.onUpdate);
          }
          if (actions2.onDelete) {
            builder.onDelete(actions2.onDelete);
          }
          return builder.build(table);
        },
        ref,
        actions
      );
    });
  }
  /** @internal */
  buildExtraConfigColumn(table) {
    return new ExtraConfigColumn(table, this.config);
  }
};
var PgColumn = class extends Column {
  constructor(table, config) {
    if (!config.uniqueName) {
      config.uniqueName = uniqueKeyName(table, [config.name]);
    }
    super(table, config);
    this.table = table;
  }
  static [entityKind] = "PgColumn";
};
var ExtraConfigColumn = class extends PgColumn {
  static [entityKind] = "ExtraConfigColumn";
  getSQLType() {
    return this.getSQLType();
  }
  indexConfig = {
    order: this.config.order ?? "asc",
    nulls: this.config.nulls ?? "last",
    opClass: this.config.opClass
  };
  defaultConfig = {
    order: "asc",
    nulls: "last",
    opClass: void 0
  };
  asc() {
    this.indexConfig.order = "asc";
    return this;
  }
  desc() {
    this.indexConfig.order = "desc";
    return this;
  }
  nullsFirst() {
    this.indexConfig.nulls = "first";
    return this;
  }
  nullsLast() {
    this.indexConfig.nulls = "last";
    return this;
  }
  /**
   * ### PostgreSQL documentation quote
   *
   * > An operator class with optional parameters can be specified for each column of an index.
   * The operator class identifies the operators to be used by the index for that column.
   * For example, a B-tree index on four-byte integers would use the int4_ops class;
   * this operator class includes comparison functions for four-byte integers.
   * In practice the default operator class for the column's data type is usually sufficient.
   * The main point of having operator classes is that for some data types, there could be more than one meaningful ordering.
   * For example, we might want to sort a complex-number data type either by absolute value or by real part.
   * We could do this by defining two operator classes for the data type and then selecting the proper class when creating an index.
   * More information about operator classes check:
   *
   * ### Useful links
   * https://www.postgresql.org/docs/current/sql-createindex.html
   *
   * https://www.postgresql.org/docs/current/indexes-opclass.html
   *
   * https://www.postgresql.org/docs/current/xindex.html
   *
   * ### Additional types
   * If you have the `pg_vector` extension installed in your database, you can use the
   * `vector_l2_ops`, `vector_ip_ops`, `vector_cosine_ops`, `vector_l1_ops`, `bit_hamming_ops`, `bit_jaccard_ops`, `halfvec_l2_ops`, `sparsevec_l2_ops` options, which are predefined types.
   *
   * **You can always specify any string you want in the operator class, in case Drizzle doesn't have it natively in its types**
   *
   * @param opClass
   * @returns
   */
  op(opClass) {
    this.indexConfig.opClass = opClass;
    return this;
  }
};
var IndexedColumn = class {
  static [entityKind] = "IndexedColumn";
  constructor(name, keyAsName, type, indexConfig) {
    this.name = name;
    this.keyAsName = keyAsName;
    this.type = type;
    this.indexConfig = indexConfig;
  }
  name;
  keyAsName;
  type;
  indexConfig;
};
var PgArrayBuilder = class extends PgColumnBuilder {
  static [entityKind] = "PgArrayBuilder";
  constructor(name, baseBuilder, size) {
    super(name, "array", "PgArray");
    this.config.baseBuilder = baseBuilder;
    this.config.size = size;
  }
  /** @internal */
  build(table) {
    const baseColumn = this.config.baseBuilder.build(table);
    return new PgArray(
      table,
      this.config,
      baseColumn
    );
  }
};
var PgArray = class _PgArray extends PgColumn {
  constructor(table, config, baseColumn, range) {
    super(table, config);
    this.baseColumn = baseColumn;
    this.range = range;
    this.size = config.size;
  }
  size;
  static [entityKind] = "PgArray";
  getSQLType() {
    return `${this.baseColumn.getSQLType()}[${typeof this.size === "number" ? this.size : ""}]`;
  }
  mapFromDriverValue(value) {
    if (typeof value === "string") {
      value = parsePgArray(value);
    }
    return value.map((v) => this.baseColumn.mapFromDriverValue(v));
  }
  mapToDriverValue(value, isNestedArray = false) {
    const a = value.map(
      (v) => v === null ? null : is(this.baseColumn, _PgArray) ? this.baseColumn.mapToDriverValue(v, true) : this.baseColumn.mapToDriverValue(v)
    );
    if (isNestedArray)
      return a;
    return makePgArray(a);
  }
};

// node_modules/drizzle-orm/pg-core/columns/enum.js
var isPgEnumSym = Symbol.for("drizzle:isPgEnum");
function isPgEnum(obj) {
  return !!obj && typeof obj === "function" && isPgEnumSym in obj && obj[isPgEnumSym] === true;
}
var PgEnumColumnBuilder = class extends PgColumnBuilder {
  static [entityKind] = "PgEnumColumnBuilder";
  constructor(name, enumInstance) {
    super(name, "string", "PgEnumColumn");
    this.config.enum = enumInstance;
  }
  /** @internal */
  build(table) {
    return new PgEnumColumn(
      table,
      this.config
    );
  }
};
var PgEnumColumn = class extends PgColumn {
  static [entityKind] = "PgEnumColumn";
  enum = this.config.enum;
  enumValues = this.config.enum.enumValues;
  constructor(table, config) {
    super(table, config);
    this.enum = config.enum;
  }
  getSQLType() {
    return this.enum.enumName;
  }
};

// node_modules/drizzle-orm/subquery.js
var Subquery = class {
  static [entityKind] = "Subquery";
  constructor(sql2, selection, alias, isWith = false) {
    this._ = {
      brand: "Subquery",
      sql: sql2,
      selectedFields: selection,
      alias,
      isWith
    };
  }
  // getSQL(): SQL<unknown> {
  // 	return new SQL([this]);
  // }
};
var WithSubquery = class extends Subquery {
  static [entityKind] = "WithSubquery";
};

// node_modules/drizzle-orm/version.js
var version = "0.39.1";

// node_modules/drizzle-orm/tracing.js
var otel;
var rawTracer;
var tracer = {
  startActiveSpan(name, fn) {
    if (!otel) {
      return fn();
    }
    if (!rawTracer) {
      rawTracer = otel.trace.getTracer("drizzle-orm", version);
    }
    return iife(
      (otel2, rawTracer2) => rawTracer2.startActiveSpan(
        name,
        (span) => {
          try {
            return fn(span);
          } catch (e) {
            span.setStatus({
              code: otel2.SpanStatusCode.ERROR,
              message: e instanceof Error ? e.message : "Unknown error"
              // eslint-disable-line no-instanceof/no-instanceof
            });
            throw e;
          } finally {
            span.end();
          }
        }
      ),
      otel,
      rawTracer
    );
  }
};

// node_modules/drizzle-orm/view-common.js
var ViewBaseConfig = Symbol.for("drizzle:ViewBaseConfig");

// node_modules/drizzle-orm/table.js
var Schema = Symbol.for("drizzle:Schema");
var Columns = Symbol.for("drizzle:Columns");
var ExtraConfigColumns = Symbol.for("drizzle:ExtraConfigColumns");
var OriginalName = Symbol.for("drizzle:OriginalName");
var BaseName = Symbol.for("drizzle:BaseName");
var IsAlias = Symbol.for("drizzle:IsAlias");
var ExtraConfigBuilder = Symbol.for("drizzle:ExtraConfigBuilder");
var IsDrizzleTable = Symbol.for("drizzle:IsDrizzleTable");
var Table = class {
  static [entityKind] = "Table";
  /** @internal */
  static Symbol = {
    Name: TableName,
    Schema,
    OriginalName,
    Columns,
    ExtraConfigColumns,
    BaseName,
    IsAlias,
    ExtraConfigBuilder
  };
  /**
   * @internal
   * Can be changed if the table is aliased.
   */
  [TableName];
  /**
   * @internal
   * Used to store the original name of the table, before any aliasing.
   */
  [OriginalName];
  /** @internal */
  [Schema];
  /** @internal */
  [Columns];
  /** @internal */
  [ExtraConfigColumns];
  /**
   *  @internal
   * Used to store the table name before the transformation via the `tableCreator` functions.
   */
  [BaseName];
  /** @internal */
  [IsAlias] = false;
  /** @internal */
  [IsDrizzleTable] = true;
  /** @internal */
  [ExtraConfigBuilder] = void 0;
  constructor(name, schema, baseName) {
    this[TableName] = this[OriginalName] = name;
    this[Schema] = schema;
    this[BaseName] = baseName;
  }
};
function isTable(table) {
  return typeof table === "object" && table !== null && IsDrizzleTable in table;
}

// node_modules/drizzle-orm/sql/sql.js
var FakePrimitiveParam = class {
  static [entityKind] = "FakePrimitiveParam";
};
function isSQLWrapper(value) {
  return value !== null && value !== void 0 && typeof value.getSQL === "function";
}
function mergeQueries(queries) {
  const result = { sql: "", params: [] };
  for (const query of queries) {
    result.sql += query.sql;
    result.params.push(...query.params);
    if (query.typings?.length) {
      if (!result.typings) {
        result.typings = [];
      }
      result.typings.push(...query.typings);
    }
  }
  return result;
}
var StringChunk = class {
  static [entityKind] = "StringChunk";
  value;
  constructor(value) {
    this.value = Array.isArray(value) ? value : [value];
  }
  getSQL() {
    return new SQL([this]);
  }
};
var SQL = class _SQL {
  constructor(queryChunks) {
    this.queryChunks = queryChunks;
  }
  static [entityKind] = "SQL";
  /** @internal */
  decoder = noopDecoder;
  shouldInlineParams = false;
  append(query) {
    this.queryChunks.push(...query.queryChunks);
    return this;
  }
  toQuery(config) {
    return tracer.startActiveSpan("drizzle.buildSQL", (span) => {
      const query = this.buildQueryFromSourceParams(this.queryChunks, config);
      span?.setAttributes({
        "drizzle.query.text": query.sql,
        "drizzle.query.params": JSON.stringify(query.params)
      });
      return query;
    });
  }
  buildQueryFromSourceParams(chunks, _config) {
    const config = Object.assign({}, _config, {
      inlineParams: _config.inlineParams || this.shouldInlineParams,
      paramStartIndex: _config.paramStartIndex || { value: 0 }
    });
    const {
      casing,
      escapeName,
      escapeParam,
      prepareTyping,
      inlineParams,
      paramStartIndex
    } = config;
    return mergeQueries(chunks.map((chunk) => {
      if (is(chunk, StringChunk)) {
        return { sql: chunk.value.join(""), params: [] };
      }
      if (is(chunk, Name)) {
        return { sql: escapeName(chunk.value), params: [] };
      }
      if (chunk === void 0) {
        return { sql: "", params: [] };
      }
      if (Array.isArray(chunk)) {
        const result = [new StringChunk("(")];
        for (const [i, p] of chunk.entries()) {
          result.push(p);
          if (i < chunk.length - 1) {
            result.push(new StringChunk(", "));
          }
        }
        result.push(new StringChunk(")"));
        return this.buildQueryFromSourceParams(result, config);
      }
      if (is(chunk, _SQL)) {
        return this.buildQueryFromSourceParams(chunk.queryChunks, {
          ...config,
          inlineParams: inlineParams || chunk.shouldInlineParams
        });
      }
      if (is(chunk, Table)) {
        const schemaName = chunk[Table.Symbol.Schema];
        const tableName = chunk[Table.Symbol.Name];
        return {
          sql: schemaName === void 0 || chunk[IsAlias] ? escapeName(tableName) : escapeName(schemaName) + "." + escapeName(tableName),
          params: []
        };
      }
      if (is(chunk, Column)) {
        const columnName = casing.getColumnCasing(chunk);
        if (_config.invokeSource === "indexes") {
          return { sql: escapeName(columnName), params: [] };
        }
        const schemaName = chunk.table[Table.Symbol.Schema];
        return {
          sql: chunk.table[IsAlias] || schemaName === void 0 ? escapeName(chunk.table[Table.Symbol.Name]) + "." + escapeName(columnName) : escapeName(schemaName) + "." + escapeName(chunk.table[Table.Symbol.Name]) + "." + escapeName(columnName),
          params: []
        };
      }
      if (is(chunk, View)) {
        const schemaName = chunk[ViewBaseConfig].schema;
        const viewName = chunk[ViewBaseConfig].name;
        return {
          sql: schemaName === void 0 || chunk[ViewBaseConfig].isAlias ? escapeName(viewName) : escapeName(schemaName) + "." + escapeName(viewName),
          params: []
        };
      }
      if (is(chunk, Param)) {
        if (is(chunk.value, Placeholder)) {
          return { sql: escapeParam(paramStartIndex.value++, chunk), params: [chunk], typings: ["none"] };
        }
        const mappedValue = chunk.value === null ? null : chunk.encoder.mapToDriverValue(chunk.value);
        if (is(mappedValue, _SQL)) {
          return this.buildQueryFromSourceParams([mappedValue], config);
        }
        if (inlineParams) {
          return { sql: this.mapInlineParam(mappedValue, config), params: [] };
        }
        let typings = ["none"];
        if (prepareTyping) {
          typings = [prepareTyping(chunk.encoder)];
        }
        return { sql: escapeParam(paramStartIndex.value++, mappedValue), params: [mappedValue], typings };
      }
      if (is(chunk, Placeholder)) {
        return { sql: escapeParam(paramStartIndex.value++, chunk), params: [chunk], typings: ["none"] };
      }
      if (is(chunk, _SQL.Aliased) && chunk.fieldAlias !== void 0) {
        return { sql: escapeName(chunk.fieldAlias), params: [] };
      }
      if (is(chunk, Subquery)) {
        if (chunk._.isWith) {
          return { sql: escapeName(chunk._.alias), params: [] };
        }
        return this.buildQueryFromSourceParams([
          new StringChunk("("),
          chunk._.sql,
          new StringChunk(") "),
          new Name(chunk._.alias)
        ], config);
      }
      if (isPgEnum(chunk)) {
        if (chunk.schema) {
          return { sql: escapeName(chunk.schema) + "." + escapeName(chunk.enumName), params: [] };
        }
        return { sql: escapeName(chunk.enumName), params: [] };
      }
      if (isSQLWrapper(chunk)) {
        if (chunk.shouldOmitSQLParens?.()) {
          return this.buildQueryFromSourceParams([chunk.getSQL()], config);
        }
        return this.buildQueryFromSourceParams([
          new StringChunk("("),
          chunk.getSQL(),
          new StringChunk(")")
        ], config);
      }
      if (inlineParams) {
        return { sql: this.mapInlineParam(chunk, config), params: [] };
      }
      return { sql: escapeParam(paramStartIndex.value++, chunk), params: [chunk], typings: ["none"] };
    }));
  }
  mapInlineParam(chunk, { escapeString }) {
    if (chunk === null) {
      return "null";
    }
    if (typeof chunk === "number" || typeof chunk === "boolean") {
      return chunk.toString();
    }
    if (typeof chunk === "string") {
      return escapeString(chunk);
    }
    if (typeof chunk === "object") {
      const mappedValueAsString = chunk.toString();
      if (mappedValueAsString === "[object Object]") {
        return escapeString(JSON.stringify(chunk));
      }
      return escapeString(mappedValueAsString);
    }
    throw new Error("Unexpected param value: " + chunk);
  }
  getSQL() {
    return this;
  }
  as(alias) {
    if (alias === void 0) {
      return this;
    }
    return new _SQL.Aliased(this, alias);
  }
  mapWith(decoder) {
    this.decoder = typeof decoder === "function" ? { mapFromDriverValue: decoder } : decoder;
    return this;
  }
  inlineParams() {
    this.shouldInlineParams = true;
    return this;
  }
  /**
   * This method is used to conditionally include a part of the query.
   *
   * @param condition - Condition to check
   * @returns itself if the condition is `true`, otherwise `undefined`
   */
  if(condition) {
    return condition ? this : void 0;
  }
};
var Name = class {
  constructor(value) {
    this.value = value;
  }
  static [entityKind] = "Name";
  brand;
  getSQL() {
    return new SQL([this]);
  }
};
var noopDecoder = {
  mapFromDriverValue: (value) => value
};
var noopEncoder = {
  mapToDriverValue: (value) => value
};
var noopMapper = {
  ...noopDecoder,
  ...noopEncoder
};
var Param = class {
  /**
   * @param value - Parameter value
   * @param encoder - Encoder to convert the value to a driver parameter
   */
  constructor(value, encoder = noopEncoder) {
    this.value = value;
    this.encoder = encoder;
  }
  static [entityKind] = "Param";
  brand;
  getSQL() {
    return new SQL([this]);
  }
};
function sql(strings, ...params) {
  const queryChunks = [];
  if (params.length > 0 || strings.length > 0 && strings[0] !== "") {
    queryChunks.push(new StringChunk(strings[0]));
  }
  for (const [paramIndex, param2] of params.entries()) {
    queryChunks.push(param2, new StringChunk(strings[paramIndex + 1]));
  }
  return new SQL(queryChunks);
}
((sql2) => {
  function empty() {
    return new SQL([]);
  }
  sql2.empty = empty;
  function fromList(list) {
    return new SQL(list);
  }
  sql2.fromList = fromList;
  function raw(str2) {
    return new SQL([new StringChunk(str2)]);
  }
  sql2.raw = raw;
  function join(chunks, separator) {
    const result = [];
    for (const [i, chunk] of chunks.entries()) {
      if (i > 0 && separator !== void 0) {
        result.push(separator);
      }
      result.push(chunk);
    }
    return new SQL(result);
  }
  sql2.join = join;
  function identifier(value) {
    return new Name(value);
  }
  sql2.identifier = identifier;
  function placeholder2(name2) {
    return new Placeholder(name2);
  }
  sql2.placeholder = placeholder2;
  function param2(value, encoder) {
    return new Param(value, encoder);
  }
  sql2.param = param2;
})(sql || (sql = {}));
((SQL2) => {
  class Aliased {
    constructor(sql2, fieldAlias) {
      this.sql = sql2;
      this.fieldAlias = fieldAlias;
    }
    static [entityKind] = "SQL.Aliased";
    /** @internal */
    isSelectionField = false;
    getSQL() {
      return this.sql;
    }
    /** @internal */
    clone() {
      return new Aliased(this.sql, this.fieldAlias);
    }
  }
  SQL2.Aliased = Aliased;
})(SQL || (SQL = {}));
var Placeholder = class {
  constructor(name2) {
    this.name = name2;
  }
  static [entityKind] = "Placeholder";
  getSQL() {
    return new SQL([this]);
  }
};
var IsDrizzleView = Symbol.for("drizzle:IsDrizzleView");
var View = class {
  static [entityKind] = "View";
  /** @internal */
  [ViewBaseConfig];
  /** @internal */
  [IsDrizzleView] = true;
  constructor({ name: name2, schema, selectedFields, query }) {
    this[ViewBaseConfig] = {
      name: name2,
      originalName: name2,
      schema,
      selectedFields,
      query,
      isExisting: !query,
      isAlias: false
    };
  }
  getSQL() {
    return new SQL([this]);
  }
};
function isView(view) {
  return typeof view === "object" && view !== null && IsDrizzleView in view;
}
Column.prototype.getSQL = function() {
  return new SQL([this]);
};
Table.prototype.getSQL = function() {
  return new SQL([this]);
};
Subquery.prototype.getSQL = function() {
  return new SQL([this]);
};

// node_modules/drizzle-orm/utils.js
function getTableColumns(table) {
  return table[Table.Symbol.Columns];
}
function getViewSelectedFields(view) {
  return view[ViewBaseConfig].selectedFields;
}
function getColumnNameAndConfig(a, b) {
  return {
    name: typeof a === "string" && a.length > 0 ? a : "",
    config: typeof a === "object" ? a : b
  };
}

// node_modules/drizzle-orm/pg-core/columns/int.common.js
var PgIntColumnBaseBuilder = class extends PgColumnBuilder {
  static [entityKind] = "PgIntColumnBaseBuilder";
  generatedAlwaysAsIdentity(sequence) {
    if (sequence) {
      const { name, ...options } = sequence;
      this.config.generatedIdentity = {
        type: "always",
        sequenceName: name,
        sequenceOptions: options
      };
    } else {
      this.config.generatedIdentity = {
        type: "always"
      };
    }
    this.config.hasDefault = true;
    this.config.notNull = true;
    return this;
  }
  generatedByDefaultAsIdentity(sequence) {
    if (sequence) {
      const { name, ...options } = sequence;
      this.config.generatedIdentity = {
        type: "byDefault",
        sequenceName: name,
        sequenceOptions: options
      };
    } else {
      this.config.generatedIdentity = {
        type: "byDefault"
      };
    }
    this.config.hasDefault = true;
    this.config.notNull = true;
    return this;
  }
};

// node_modules/drizzle-orm/pg-core/columns/bigint.js
var PgBigInt53Builder = class extends PgIntColumnBaseBuilder {
  static [entityKind] = "PgBigInt53Builder";
  constructor(name) {
    super(name, "number", "PgBigInt53");
  }
  /** @internal */
  build(table) {
    return new PgBigInt53(table, this.config);
  }
};
var PgBigInt53 = class extends PgColumn {
  static [entityKind] = "PgBigInt53";
  getSQLType() {
    return "bigint";
  }
  mapFromDriverValue(value) {
    if (typeof value === "number") {
      return value;
    }
    return Number(value);
  }
};
var PgBigInt64Builder = class extends PgIntColumnBaseBuilder {
  static [entityKind] = "PgBigInt64Builder";
  constructor(name) {
    super(name, "bigint", "PgBigInt64");
  }
  /** @internal */
  build(table) {
    return new PgBigInt64(
      table,
      this.config
    );
  }
};
var PgBigInt64 = class extends PgColumn {
  static [entityKind] = "PgBigInt64";
  getSQLType() {
    return "bigint";
  }
  // eslint-disable-next-line unicorn/prefer-native-coercion-functions
  mapFromDriverValue(value) {
    return BigInt(value);
  }
};
function bigint(a, b) {
  const { name, config } = getColumnNameAndConfig(a, b);
  if (config.mode === "number") {
    return new PgBigInt53Builder(name);
  }
  return new PgBigInt64Builder(name);
}

// node_modules/drizzle-orm/pg-core/columns/bigserial.js
var PgBigSerial53Builder = class extends PgColumnBuilder {
  static [entityKind] = "PgBigSerial53Builder";
  constructor(name) {
    super(name, "number", "PgBigSerial53");
    this.config.hasDefault = true;
    this.config.notNull = true;
  }
  /** @internal */
  build(table) {
    return new PgBigSerial53(
      table,
      this.config
    );
  }
};
var PgBigSerial53 = class extends PgColumn {
  static [entityKind] = "PgBigSerial53";
  getSQLType() {
    return "bigserial";
  }
  mapFromDriverValue(value) {
    if (typeof value === "number") {
      return value;
    }
    return Number(value);
  }
};
var PgBigSerial64Builder = class extends PgColumnBuilder {
  static [entityKind] = "PgBigSerial64Builder";
  constructor(name) {
    super(name, "bigint", "PgBigSerial64");
    this.config.hasDefault = true;
  }
  /** @internal */
  build(table) {
    return new PgBigSerial64(
      table,
      this.config
    );
  }
};
var PgBigSerial64 = class extends PgColumn {
  static [entityKind] = "PgBigSerial64";
  getSQLType() {
    return "bigserial";
  }
  // eslint-disable-next-line unicorn/prefer-native-coercion-functions
  mapFromDriverValue(value) {
    return BigInt(value);
  }
};
function bigserial(a, b) {
  const { name, config } = getColumnNameAndConfig(a, b);
  if (config.mode === "number") {
    return new PgBigSerial53Builder(name);
  }
  return new PgBigSerial64Builder(name);
}

// node_modules/drizzle-orm/pg-core/columns/boolean.js
var PgBooleanBuilder = class extends PgColumnBuilder {
  static [entityKind] = "PgBooleanBuilder";
  constructor(name) {
    super(name, "boolean", "PgBoolean");
  }
  /** @internal */
  build(table) {
    return new PgBoolean(table, this.config);
  }
};
var PgBoolean = class extends PgColumn {
  static [entityKind] = "PgBoolean";
  getSQLType() {
    return "boolean";
  }
};
function boolean(name) {
  return new PgBooleanBuilder(name ?? "");
}

// node_modules/drizzle-orm/pg-core/columns/char.js
var PgCharBuilder = class extends PgColumnBuilder {
  static [entityKind] = "PgCharBuilder";
  constructor(name, config) {
    super(name, "string", "PgChar");
    this.config.length = config.length;
    this.config.enumValues = config.enum;
  }
  /** @internal */
  build(table) {
    return new PgChar(
      table,
      this.config
    );
  }
};
var PgChar = class extends PgColumn {
  static [entityKind] = "PgChar";
  length = this.config.length;
  enumValues = this.config.enumValues;
  getSQLType() {
    return this.length === void 0 ? `char` : `char(${this.length})`;
  }
};
function char(a, b = {}) {
  const { name, config } = getColumnNameAndConfig(a, b);
  return new PgCharBuilder(name, config);
}

// node_modules/drizzle-orm/pg-core/columns/cidr.js
var PgCidrBuilder = class extends PgColumnBuilder {
  static [entityKind] = "PgCidrBuilder";
  constructor(name) {
    super(name, "string", "PgCidr");
  }
  /** @internal */
  build(table) {
    return new PgCidr(table, this.config);
  }
};
var PgCidr = class extends PgColumn {
  static [entityKind] = "PgCidr";
  getSQLType() {
    return "cidr";
  }
};
function cidr(name) {
  return new PgCidrBuilder(name ?? "");
}

// node_modules/drizzle-orm/pg-core/columns/custom.js
var PgCustomColumnBuilder = class extends PgColumnBuilder {
  static [entityKind] = "PgCustomColumnBuilder";
  constructor(name, fieldConfig, customTypeParams) {
    super(name, "custom", "PgCustomColumn");
    this.config.fieldConfig = fieldConfig;
    this.config.customTypeParams = customTypeParams;
  }
  /** @internal */
  build(table) {
    return new PgCustomColumn(
      table,
      this.config
    );
  }
};
var PgCustomColumn = class extends PgColumn {
  static [entityKind] = "PgCustomColumn";
  sqlName;
  mapTo;
  mapFrom;
  constructor(table, config) {
    super(table, config);
    this.sqlName = config.customTypeParams.dataType(config.fieldConfig);
    this.mapTo = config.customTypeParams.toDriver;
    this.mapFrom = config.customTypeParams.fromDriver;
  }
  getSQLType() {
    return this.sqlName;
  }
  mapFromDriverValue(value) {
    return typeof this.mapFrom === "function" ? this.mapFrom(value) : value;
  }
  mapToDriverValue(value) {
    return typeof this.mapTo === "function" ? this.mapTo(value) : value;
  }
};
function customType(customTypeParams) {
  return (a, b) => {
    const { name, config } = getColumnNameAndConfig(a, b);
    return new PgCustomColumnBuilder(name, config, customTypeParams);
  };
}

// node_modules/drizzle-orm/pg-core/columns/date.common.js
var PgDateColumnBaseBuilder = class extends PgColumnBuilder {
  static [entityKind] = "PgDateColumnBaseBuilder";
  defaultNow() {
    return this.default(sql`now()`);
  }
};

// node_modules/drizzle-orm/pg-core/columns/date.js
var PgDateBuilder = class extends PgDateColumnBaseBuilder {
  static [entityKind] = "PgDateBuilder";
  constructor(name) {
    super(name, "date", "PgDate");
  }
  /** @internal */
  build(table) {
    return new PgDate(table, this.config);
  }
};
var PgDate = class extends PgColumn {
  static [entityKind] = "PgDate";
  getSQLType() {
    return "date";
  }
  mapFromDriverValue(value) {
    return new Date(value);
  }
  mapToDriverValue(value) {
    return value.toISOString();
  }
};
var PgDateStringBuilder = class extends PgDateColumnBaseBuilder {
  static [entityKind] = "PgDateStringBuilder";
  constructor(name) {
    super(name, "string", "PgDateString");
  }
  /** @internal */
  build(table) {
    return new PgDateString(
      table,
      this.config
    );
  }
};
var PgDateString = class extends PgColumn {
  static [entityKind] = "PgDateString";
  getSQLType() {
    return "date";
  }
};
function date(a, b) {
  const { name, config } = getColumnNameAndConfig(a, b);
  if (config?.mode === "date") {
    return new PgDateBuilder(name);
  }
  return new PgDateStringBuilder(name);
}

// node_modules/drizzle-orm/pg-core/columns/double-precision.js
var PgDoublePrecisionBuilder = class extends PgColumnBuilder {
  static [entityKind] = "PgDoublePrecisionBuilder";
  constructor(name) {
    super(name, "number", "PgDoublePrecision");
  }
  /** @internal */
  build(table) {
    return new PgDoublePrecision(
      table,
      this.config
    );
  }
};
var PgDoublePrecision = class extends PgColumn {
  static [entityKind] = "PgDoublePrecision";
  getSQLType() {
    return "double precision";
  }
  mapFromDriverValue(value) {
    if (typeof value === "string") {
      return Number.parseFloat(value);
    }
    return value;
  }
};
function doublePrecision(name) {
  return new PgDoublePrecisionBuilder(name ?? "");
}

// node_modules/drizzle-orm/pg-core/columns/inet.js
var PgInetBuilder = class extends PgColumnBuilder {
  static [entityKind] = "PgInetBuilder";
  constructor(name) {
    super(name, "string", "PgInet");
  }
  /** @internal */
  build(table) {
    return new PgInet(table, this.config);
  }
};
var PgInet = class extends PgColumn {
  static [entityKind] = "PgInet";
  getSQLType() {
    return "inet";
  }
};
function inet(name) {
  return new PgInetBuilder(name ?? "");
}

// node_modules/drizzle-orm/pg-core/columns/integer.js
var PgIntegerBuilder = class extends PgIntColumnBaseBuilder {
  static [entityKind] = "PgIntegerBuilder";
  constructor(name) {
    super(name, "number", "PgInteger");
  }
  /** @internal */
  build(table) {
    return new PgInteger(table, this.config);
  }
};
var PgInteger = class extends PgColumn {
  static [entityKind] = "PgInteger";
  getSQLType() {
    return "integer";
  }
  mapFromDriverValue(value) {
    if (typeof value === "string") {
      return Number.parseInt(value);
    }
    return value;
  }
};
function integer(name) {
  return new PgIntegerBuilder(name ?? "");
}

// node_modules/drizzle-orm/pg-core/columns/interval.js
var PgIntervalBuilder = class extends PgColumnBuilder {
  static [entityKind] = "PgIntervalBuilder";
  constructor(name, intervalConfig) {
    super(name, "string", "PgInterval");
    this.config.intervalConfig = intervalConfig;
  }
  /** @internal */
  build(table) {
    return new PgInterval(table, this.config);
  }
};
var PgInterval = class extends PgColumn {
  static [entityKind] = "PgInterval";
  fields = this.config.intervalConfig.fields;
  precision = this.config.intervalConfig.precision;
  getSQLType() {
    const fields = this.fields ? ` ${this.fields}` : "";
    const precision = this.precision ? `(${this.precision})` : "";
    return `interval${fields}${precision}`;
  }
};
function interval(a, b = {}) {
  const { name, config } = getColumnNameAndConfig(a, b);
  return new PgIntervalBuilder(name, config);
}

// node_modules/drizzle-orm/pg-core/columns/json.js
var PgJsonBuilder = class extends PgColumnBuilder {
  static [entityKind] = "PgJsonBuilder";
  constructor(name) {
    super(name, "json", "PgJson");
  }
  /** @internal */
  build(table) {
    return new PgJson(table, this.config);
  }
};
var PgJson = class extends PgColumn {
  static [entityKind] = "PgJson";
  constructor(table, config) {
    super(table, config);
  }
  getSQLType() {
    return "json";
  }
  mapToDriverValue(value) {
    return JSON.stringify(value);
  }
  mapFromDriverValue(value) {
    if (typeof value === "string") {
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    }
    return value;
  }
};
function json(name) {
  return new PgJsonBuilder(name ?? "");
}

// node_modules/drizzle-orm/pg-core/columns/jsonb.js
var PgJsonbBuilder = class extends PgColumnBuilder {
  static [entityKind] = "PgJsonbBuilder";
  constructor(name) {
    super(name, "json", "PgJsonb");
  }
  /** @internal */
  build(table) {
    return new PgJsonb(table, this.config);
  }
};
var PgJsonb = class extends PgColumn {
  static [entityKind] = "PgJsonb";
  constructor(table, config) {
    super(table, config);
  }
  getSQLType() {
    return "jsonb";
  }
  mapToDriverValue(value) {
    return JSON.stringify(value);
  }
  mapFromDriverValue(value) {
    if (typeof value === "string") {
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    }
    return value;
  }
};
function jsonb(name) {
  return new PgJsonbBuilder(name ?? "");
}

// node_modules/drizzle-orm/pg-core/columns/line.js
var PgLineBuilder = class extends PgColumnBuilder {
  static [entityKind] = "PgLineBuilder";
  constructor(name) {
    super(name, "array", "PgLine");
  }
  /** @internal */
  build(table) {
    return new PgLineTuple(
      table,
      this.config
    );
  }
};
var PgLineTuple = class extends PgColumn {
  static [entityKind] = "PgLine";
  getSQLType() {
    return "line";
  }
  mapFromDriverValue(value) {
    const [a, b, c] = value.slice(1, -1).split(",");
    return [Number.parseFloat(a), Number.parseFloat(b), Number.parseFloat(c)];
  }
  mapToDriverValue(value) {
    return `{${value[0]},${value[1]},${value[2]}}`;
  }
};
var PgLineABCBuilder = class extends PgColumnBuilder {
  static [entityKind] = "PgLineABCBuilder";
  constructor(name) {
    super(name, "json", "PgLineABC");
  }
  /** @internal */
  build(table) {
    return new PgLineABC(
      table,
      this.config
    );
  }
};
var PgLineABC = class extends PgColumn {
  static [entityKind] = "PgLineABC";
  getSQLType() {
    return "line";
  }
  mapFromDriverValue(value) {
    const [a, b, c] = value.slice(1, -1).split(",");
    return { a: Number.parseFloat(a), b: Number.parseFloat(b), c: Number.parseFloat(c) };
  }
  mapToDriverValue(value) {
    return `{${value.a},${value.b},${value.c}}`;
  }
};
function line(a, b) {
  const { name, config } = getColumnNameAndConfig(a, b);
  if (!config?.mode || config.mode === "tuple") {
    return new PgLineBuilder(name);
  }
  return new PgLineABCBuilder(name);
}

// node_modules/drizzle-orm/pg-core/columns/macaddr.js
var PgMacaddrBuilder = class extends PgColumnBuilder {
  static [entityKind] = "PgMacaddrBuilder";
  constructor(name) {
    super(name, "string", "PgMacaddr");
  }
  /** @internal */
  build(table) {
    return new PgMacaddr(table, this.config);
  }
};
var PgMacaddr = class extends PgColumn {
  static [entityKind] = "PgMacaddr";
  getSQLType() {
    return "macaddr";
  }
};
function macaddr(name) {
  return new PgMacaddrBuilder(name ?? "");
}

// node_modules/drizzle-orm/pg-core/columns/macaddr8.js
var PgMacaddr8Builder = class extends PgColumnBuilder {
  static [entityKind] = "PgMacaddr8Builder";
  constructor(name) {
    super(name, "string", "PgMacaddr8");
  }
  /** @internal */
  build(table) {
    return new PgMacaddr8(table, this.config);
  }
};
var PgMacaddr8 = class extends PgColumn {
  static [entityKind] = "PgMacaddr8";
  getSQLType() {
    return "macaddr8";
  }
};
function macaddr8(name) {
  return new PgMacaddr8Builder(name ?? "");
}

// node_modules/drizzle-orm/pg-core/columns/numeric.js
var PgNumericBuilder = class extends PgColumnBuilder {
  static [entityKind] = "PgNumericBuilder";
  constructor(name, precision, scale) {
    super(name, "string", "PgNumeric");
    this.config.precision = precision;
    this.config.scale = scale;
  }
  /** @internal */
  build(table) {
    return new PgNumeric(table, this.config);
  }
};
var PgNumeric = class extends PgColumn {
  static [entityKind] = "PgNumeric";
  precision;
  scale;
  constructor(table, config) {
    super(table, config);
    this.precision = config.precision;
    this.scale = config.scale;
  }
  getSQLType() {
    if (this.precision !== void 0 && this.scale !== void 0) {
      return `numeric(${this.precision}, ${this.scale})`;
    } else if (this.precision === void 0) {
      return "numeric";
    } else {
      return `numeric(${this.precision})`;
    }
  }
};
function numeric(a, b) {
  const { name, config } = getColumnNameAndConfig(a, b);
  return new PgNumericBuilder(name, config?.precision, config?.scale);
}

// node_modules/drizzle-orm/pg-core/columns/point.js
var PgPointTupleBuilder = class extends PgColumnBuilder {
  static [entityKind] = "PgPointTupleBuilder";
  constructor(name) {
    super(name, "array", "PgPointTuple");
  }
  /** @internal */
  build(table) {
    return new PgPointTuple(
      table,
      this.config
    );
  }
};
var PgPointTuple = class extends PgColumn {
  static [entityKind] = "PgPointTuple";
  getSQLType() {
    return "point";
  }
  mapFromDriverValue(value) {
    if (typeof value === "string") {
      const [x, y] = value.slice(1, -1).split(",");
      return [Number.parseFloat(x), Number.parseFloat(y)];
    }
    return [value.x, value.y];
  }
  mapToDriverValue(value) {
    return `(${value[0]},${value[1]})`;
  }
};
var PgPointObjectBuilder = class extends PgColumnBuilder {
  static [entityKind] = "PgPointObjectBuilder";
  constructor(name) {
    super(name, "json", "PgPointObject");
  }
  /** @internal */
  build(table) {
    return new PgPointObject(
      table,
      this.config
    );
  }
};
var PgPointObject = class extends PgColumn {
  static [entityKind] = "PgPointObject";
  getSQLType() {
    return "point";
  }
  mapFromDriverValue(value) {
    if (typeof value === "string") {
      const [x, y] = value.slice(1, -1).split(",");
      return { x: Number.parseFloat(x), y: Number.parseFloat(y) };
    }
    return value;
  }
  mapToDriverValue(value) {
    return `(${value.x},${value.y})`;
  }
};
function point(a, b) {
  const { name, config } = getColumnNameAndConfig(a, b);
  if (!config?.mode || config.mode === "tuple") {
    return new PgPointTupleBuilder(name);
  }
  return new PgPointObjectBuilder(name);
}

// node_modules/drizzle-orm/pg-core/columns/postgis_extension/utils.js
function hexToBytes(hex) {
  const bytes = [];
  for (let c = 0; c < hex.length; c += 2) {
    bytes.push(Number.parseInt(hex.slice(c, c + 2), 16));
  }
  return new Uint8Array(bytes);
}
function bytesToFloat64(bytes, offset) {
  const buffer = new ArrayBuffer(8);
  const view = new DataView(buffer);
  for (let i = 0; i < 8; i++) {
    view.setUint8(i, bytes[offset + i]);
  }
  return view.getFloat64(0, true);
}
function parseEWKB(hex) {
  const bytes = hexToBytes(hex);
  let offset = 0;
  const byteOrder = bytes[offset];
  offset += 1;
  const view = new DataView(bytes.buffer);
  const geomType = view.getUint32(offset, byteOrder === 1);
  offset += 4;
  let _srid;
  if (geomType & 536870912) {
    _srid = view.getUint32(offset, byteOrder === 1);
    offset += 4;
  }
  if ((geomType & 65535) === 1) {
    const x = bytesToFloat64(bytes, offset);
    offset += 8;
    const y = bytesToFloat64(bytes, offset);
    offset += 8;
    return [x, y];
  }
  throw new Error("Unsupported geometry type");
}

// node_modules/drizzle-orm/pg-core/columns/postgis_extension/geometry.js
var PgGeometryBuilder = class extends PgColumnBuilder {
  static [entityKind] = "PgGeometryBuilder";
  constructor(name) {
    super(name, "array", "PgGeometry");
  }
  /** @internal */
  build(table) {
    return new PgGeometry(
      table,
      this.config
    );
  }
};
var PgGeometry = class extends PgColumn {
  static [entityKind] = "PgGeometry";
  getSQLType() {
    return "geometry(point)";
  }
  mapFromDriverValue(value) {
    return parseEWKB(value);
  }
  mapToDriverValue(value) {
    return `point(${value[0]} ${value[1]})`;
  }
};
var PgGeometryObjectBuilder = class extends PgColumnBuilder {
  static [entityKind] = "PgGeometryObjectBuilder";
  constructor(name) {
    super(name, "json", "PgGeometryObject");
  }
  /** @internal */
  build(table) {
    return new PgGeometryObject(
      table,
      this.config
    );
  }
};
var PgGeometryObject = class extends PgColumn {
  static [entityKind] = "PgGeometryObject";
  getSQLType() {
    return "geometry(point)";
  }
  mapFromDriverValue(value) {
    const parsed = parseEWKB(value);
    return { x: parsed[0], y: parsed[1] };
  }
  mapToDriverValue(value) {
    return `point(${value.x} ${value.y})`;
  }
};
function geometry(a, b) {
  const { name, config } = getColumnNameAndConfig(a, b);
  if (!config?.mode || config.mode === "tuple") {
    return new PgGeometryBuilder(name);
  }
  return new PgGeometryObjectBuilder(name);
}

// node_modules/drizzle-orm/pg-core/columns/real.js
var PgRealBuilder = class extends PgColumnBuilder {
  static [entityKind] = "PgRealBuilder";
  constructor(name, length) {
    super(name, "number", "PgReal");
    this.config.length = length;
  }
  /** @internal */
  build(table) {
    return new PgReal(table, this.config);
  }
};
var PgReal = class extends PgColumn {
  static [entityKind] = "PgReal";
  constructor(table, config) {
    super(table, config);
  }
  getSQLType() {
    return "real";
  }
  mapFromDriverValue = (value) => {
    if (typeof value === "string") {
      return Number.parseFloat(value);
    }
    return value;
  };
};
function real(name) {
  return new PgRealBuilder(name ?? "");
}

// node_modules/drizzle-orm/pg-core/columns/serial.js
var PgSerialBuilder = class extends PgColumnBuilder {
  static [entityKind] = "PgSerialBuilder";
  constructor(name) {
    super(name, "number", "PgSerial");
    this.config.hasDefault = true;
    this.config.notNull = true;
  }
  /** @internal */
  build(table) {
    return new PgSerial(table, this.config);
  }
};
var PgSerial = class extends PgColumn {
  static [entityKind] = "PgSerial";
  getSQLType() {
    return "serial";
  }
};
function serial(name) {
  return new PgSerialBuilder(name ?? "");
}

// node_modules/drizzle-orm/pg-core/columns/smallint.js
var PgSmallIntBuilder = class extends PgIntColumnBaseBuilder {
  static [entityKind] = "PgSmallIntBuilder";
  constructor(name) {
    super(name, "number", "PgSmallInt");
  }
  /** @internal */
  build(table) {
    return new PgSmallInt(table, this.config);
  }
};
var PgSmallInt = class extends PgColumn {
  static [entityKind] = "PgSmallInt";
  getSQLType() {
    return "smallint";
  }
  mapFromDriverValue = (value) => {
    if (typeof value === "string") {
      return Number(value);
    }
    return value;
  };
};
function smallint(name) {
  return new PgSmallIntBuilder(name ?? "");
}

// node_modules/drizzle-orm/pg-core/columns/smallserial.js
var PgSmallSerialBuilder = class extends PgColumnBuilder {
  static [entityKind] = "PgSmallSerialBuilder";
  constructor(name) {
    super(name, "number", "PgSmallSerial");
    this.config.hasDefault = true;
    this.config.notNull = true;
  }
  /** @internal */
  build(table) {
    return new PgSmallSerial(
      table,
      this.config
    );
  }
};
var PgSmallSerial = class extends PgColumn {
  static [entityKind] = "PgSmallSerial";
  getSQLType() {
    return "smallserial";
  }
};
function smallserial(name) {
  return new PgSmallSerialBuilder(name ?? "");
}

// node_modules/drizzle-orm/pg-core/columns/text.js
var PgTextBuilder = class extends PgColumnBuilder {
  static [entityKind] = "PgTextBuilder";
  constructor(name, config) {
    super(name, "string", "PgText");
    this.config.enumValues = config.enum;
  }
  /** @internal */
  build(table) {
    return new PgText(table, this.config);
  }
};
var PgText = class extends PgColumn {
  static [entityKind] = "PgText";
  enumValues = this.config.enumValues;
  getSQLType() {
    return "text";
  }
};
function text(a, b = {}) {
  const { name, config } = getColumnNameAndConfig(a, b);
  return new PgTextBuilder(name, config);
}

// node_modules/drizzle-orm/pg-core/columns/time.js
var PgTimeBuilder = class extends PgDateColumnBaseBuilder {
  constructor(name, withTimezone, precision) {
    super(name, "string", "PgTime");
    this.withTimezone = withTimezone;
    this.precision = precision;
    this.config.withTimezone = withTimezone;
    this.config.precision = precision;
  }
  static [entityKind] = "PgTimeBuilder";
  /** @internal */
  build(table) {
    return new PgTime(table, this.config);
  }
};
var PgTime = class extends PgColumn {
  static [entityKind] = "PgTime";
  withTimezone;
  precision;
  constructor(table, config) {
    super(table, config);
    this.withTimezone = config.withTimezone;
    this.precision = config.precision;
  }
  getSQLType() {
    const precision = this.precision === void 0 ? "" : `(${this.precision})`;
    return `time${precision}${this.withTimezone ? " with time zone" : ""}`;
  }
};
function time(a, b = {}) {
  const { name, config } = getColumnNameAndConfig(a, b);
  return new PgTimeBuilder(name, config.withTimezone ?? false, config.precision);
}

// node_modules/drizzle-orm/pg-core/columns/timestamp.js
var PgTimestampBuilder = class extends PgDateColumnBaseBuilder {
  static [entityKind] = "PgTimestampBuilder";
  constructor(name, withTimezone, precision) {
    super(name, "date", "PgTimestamp");
    this.config.withTimezone = withTimezone;
    this.config.precision = precision;
  }
  /** @internal */
  build(table) {
    return new PgTimestamp(table, this.config);
  }
};
var PgTimestamp = class extends PgColumn {
  static [entityKind] = "PgTimestamp";
  withTimezone;
  precision;
  constructor(table, config) {
    super(table, config);
    this.withTimezone = config.withTimezone;
    this.precision = config.precision;
  }
  getSQLType() {
    const precision = this.precision === void 0 ? "" : ` (${this.precision})`;
    return `timestamp${precision}${this.withTimezone ? " with time zone" : ""}`;
  }
  mapFromDriverValue = (value) => {
    return new Date(this.withTimezone ? value : value + "+0000");
  };
  mapToDriverValue = (value) => {
    return value.toISOString();
  };
};
var PgTimestampStringBuilder = class extends PgDateColumnBaseBuilder {
  static [entityKind] = "PgTimestampStringBuilder";
  constructor(name, withTimezone, precision) {
    super(name, "string", "PgTimestampString");
    this.config.withTimezone = withTimezone;
    this.config.precision = precision;
  }
  /** @internal */
  build(table) {
    return new PgTimestampString(
      table,
      this.config
    );
  }
};
var PgTimestampString = class extends PgColumn {
  static [entityKind] = "PgTimestampString";
  withTimezone;
  precision;
  constructor(table, config) {
    super(table, config);
    this.withTimezone = config.withTimezone;
    this.precision = config.precision;
  }
  getSQLType() {
    const precision = this.precision === void 0 ? "" : `(${this.precision})`;
    return `timestamp${precision}${this.withTimezone ? " with time zone" : ""}`;
  }
};
function timestamp(a, b = {}) {
  const { name, config } = getColumnNameAndConfig(a, b);
  if (config?.mode === "string") {
    return new PgTimestampStringBuilder(name, config.withTimezone ?? false, config.precision);
  }
  return new PgTimestampBuilder(name, config?.withTimezone ?? false, config?.precision);
}

// node_modules/drizzle-orm/pg-core/columns/uuid.js
var PgUUIDBuilder = class extends PgColumnBuilder {
  static [entityKind] = "PgUUIDBuilder";
  constructor(name) {
    super(name, "string", "PgUUID");
  }
  /**
   * Adds `default gen_random_uuid()` to the column definition.
   */
  defaultRandom() {
    return this.default(sql`gen_random_uuid()`);
  }
  /** @internal */
  build(table) {
    return new PgUUID(table, this.config);
  }
};
var PgUUID = class extends PgColumn {
  static [entityKind] = "PgUUID";
  getSQLType() {
    return "uuid";
  }
};
function uuid(name) {
  return new PgUUIDBuilder(name ?? "");
}

// node_modules/drizzle-orm/pg-core/columns/varchar.js
var PgVarcharBuilder = class extends PgColumnBuilder {
  static [entityKind] = "PgVarcharBuilder";
  constructor(name, config) {
    super(name, "string", "PgVarchar");
    this.config.length = config.length;
    this.config.enumValues = config.enum;
  }
  /** @internal */
  build(table) {
    return new PgVarchar(
      table,
      this.config
    );
  }
};
var PgVarchar = class extends PgColumn {
  static [entityKind] = "PgVarchar";
  length = this.config.length;
  enumValues = this.config.enumValues;
  getSQLType() {
    return this.length === void 0 ? `varchar` : `varchar(${this.length})`;
  }
};
function varchar(a, b = {}) {
  const { name, config } = getColumnNameAndConfig(a, b);
  return new PgVarcharBuilder(name, config);
}

// node_modules/drizzle-orm/pg-core/columns/vector_extension/bit.js
var PgBinaryVectorBuilder = class extends PgColumnBuilder {
  static [entityKind] = "PgBinaryVectorBuilder";
  constructor(name, config) {
    super(name, "string", "PgBinaryVector");
    this.config.dimensions = config.dimensions;
  }
  /** @internal */
  build(table) {
    return new PgBinaryVector(
      table,
      this.config
    );
  }
};
var PgBinaryVector = class extends PgColumn {
  static [entityKind] = "PgBinaryVector";
  dimensions = this.config.dimensions;
  getSQLType() {
    return `bit(${this.dimensions})`;
  }
};
function bit(a, b) {
  const { name, config } = getColumnNameAndConfig(a, b);
  return new PgBinaryVectorBuilder(name, config);
}

// node_modules/drizzle-orm/pg-core/columns/vector_extension/halfvec.js
var PgHalfVectorBuilder = class extends PgColumnBuilder {
  static [entityKind] = "PgHalfVectorBuilder";
  constructor(name, config) {
    super(name, "array", "PgHalfVector");
    this.config.dimensions = config.dimensions;
  }
  /** @internal */
  build(table) {
    return new PgHalfVector(
      table,
      this.config
    );
  }
};
var PgHalfVector = class extends PgColumn {
  static [entityKind] = "PgHalfVector";
  dimensions = this.config.dimensions;
  getSQLType() {
    return `halfvec(${this.dimensions})`;
  }
  mapToDriverValue(value) {
    return JSON.stringify(value);
  }
  mapFromDriverValue(value) {
    return value.slice(1, -1).split(",").map((v) => Number.parseFloat(v));
  }
};
function halfvec(a, b) {
  const { name, config } = getColumnNameAndConfig(a, b);
  return new PgHalfVectorBuilder(name, config);
}

// node_modules/drizzle-orm/pg-core/columns/vector_extension/sparsevec.js
var PgSparseVectorBuilder = class extends PgColumnBuilder {
  static [entityKind] = "PgSparseVectorBuilder";
  constructor(name, config) {
    super(name, "string", "PgSparseVector");
    this.config.dimensions = config.dimensions;
  }
  /** @internal */
  build(table) {
    return new PgSparseVector(
      table,
      this.config
    );
  }
};
var PgSparseVector = class extends PgColumn {
  static [entityKind] = "PgSparseVector";
  dimensions = this.config.dimensions;
  getSQLType() {
    return `sparsevec(${this.dimensions})`;
  }
};
function sparsevec(a, b) {
  const { name, config } = getColumnNameAndConfig(a, b);
  return new PgSparseVectorBuilder(name, config);
}

// node_modules/drizzle-orm/pg-core/columns/vector_extension/vector.js
var PgVectorBuilder = class extends PgColumnBuilder {
  static [entityKind] = "PgVectorBuilder";
  constructor(name, config) {
    super(name, "array", "PgVector");
    this.config.dimensions = config.dimensions;
  }
  /** @internal */
  build(table) {
    return new PgVector(
      table,
      this.config
    );
  }
};
var PgVector = class extends PgColumn {
  static [entityKind] = "PgVector";
  dimensions = this.config.dimensions;
  getSQLType() {
    return `vector(${this.dimensions})`;
  }
  mapToDriverValue(value) {
    return JSON.stringify(value);
  }
  mapFromDriverValue(value) {
    return value.slice(1, -1).split(",").map((v) => Number.parseFloat(v));
  }
};
function vector(a, b) {
  const { name, config } = getColumnNameAndConfig(a, b);
  return new PgVectorBuilder(name, config);
}

// node_modules/drizzle-orm/pg-core/columns/all.js
function getPgColumnBuilders() {
  return {
    bigint,
    bigserial,
    boolean,
    char,
    cidr,
    customType,
    date,
    doublePrecision,
    inet,
    integer,
    interval,
    json,
    jsonb,
    line,
    macaddr,
    macaddr8,
    numeric,
    point,
    geometry,
    real,
    serial,
    smallint,
    smallserial,
    text,
    time,
    timestamp,
    uuid,
    varchar,
    bit,
    halfvec,
    sparsevec,
    vector
  };
}

// node_modules/drizzle-orm/pg-core/table.js
var InlineForeignKeys = Symbol.for("drizzle:PgInlineForeignKeys");
var EnableRLS = Symbol.for("drizzle:EnableRLS");
var PgTable = class extends Table {
  static [entityKind] = "PgTable";
  /** @internal */
  static Symbol = Object.assign({}, Table.Symbol, {
    InlineForeignKeys,
    EnableRLS
  });
  /**@internal */
  [InlineForeignKeys] = [];
  /** @internal */
  [EnableRLS] = false;
  /** @internal */
  [Table.Symbol.ExtraConfigBuilder] = void 0;
};
function pgTableWithSchema(name, columns, extraConfig, schema, baseName = name) {
  const rawTable = new PgTable(name, schema, baseName);
  const parsedColumns = typeof columns === "function" ? columns(getPgColumnBuilders()) : columns;
  const builtColumns = Object.fromEntries(
    Object.entries(parsedColumns).map(([name2, colBuilderBase]) => {
      const colBuilder = colBuilderBase;
      colBuilder.setName(name2);
      const column = colBuilder.build(rawTable);
      rawTable[InlineForeignKeys].push(...colBuilder.buildForeignKeys(column, rawTable));
      return [name2, column];
    })
  );
  const builtColumnsForExtraConfig = Object.fromEntries(
    Object.entries(parsedColumns).map(([name2, colBuilderBase]) => {
      const colBuilder = colBuilderBase;
      colBuilder.setName(name2);
      const column = colBuilder.buildExtraConfigColumn(rawTable);
      return [name2, column];
    })
  );
  const table = Object.assign(rawTable, builtColumns);
  table[Table.Symbol.Columns] = builtColumns;
  table[Table.Symbol.ExtraConfigColumns] = builtColumnsForExtraConfig;
  if (extraConfig) {
    table[PgTable.Symbol.ExtraConfigBuilder] = extraConfig;
  }
  return Object.assign(table, {
    enableRLS: () => {
      table[PgTable.Symbol.EnableRLS] = true;
      return table;
    }
  });
}
var pgTable = (name, columns, extraConfig) => {
  return pgTableWithSchema(name, columns, extraConfig, void 0);
};

// node_modules/zod/v3/external.js
var external_exports = {};
__export(external_exports, {
  BRAND: () => BRAND,
  DIRTY: () => DIRTY,
  EMPTY_PATH: () => EMPTY_PATH,
  INVALID: () => INVALID,
  NEVER: () => NEVER,
  OK: () => OK,
  ParseStatus: () => ParseStatus,
  Schema: () => ZodType,
  ZodAny: () => ZodAny,
  ZodArray: () => ZodArray,
  ZodBigInt: () => ZodBigInt,
  ZodBoolean: () => ZodBoolean,
  ZodBranded: () => ZodBranded,
  ZodCatch: () => ZodCatch,
  ZodDate: () => ZodDate,
  ZodDefault: () => ZodDefault,
  ZodDiscriminatedUnion: () => ZodDiscriminatedUnion,
  ZodEffects: () => ZodEffects,
  ZodEnum: () => ZodEnum,
  ZodError: () => ZodError,
  ZodFirstPartyTypeKind: () => ZodFirstPartyTypeKind,
  ZodFunction: () => ZodFunction,
  ZodIntersection: () => ZodIntersection,
  ZodIssueCode: () => ZodIssueCode,
  ZodLazy: () => ZodLazy,
  ZodLiteral: () => ZodLiteral,
  ZodMap: () => ZodMap,
  ZodNaN: () => ZodNaN,
  ZodNativeEnum: () => ZodNativeEnum,
  ZodNever: () => ZodNever,
  ZodNull: () => ZodNull,
  ZodNullable: () => ZodNullable,
  ZodNumber: () => ZodNumber,
  ZodObject: () => ZodObject,
  ZodOptional: () => ZodOptional,
  ZodParsedType: () => ZodParsedType,
  ZodPipeline: () => ZodPipeline,
  ZodPromise: () => ZodPromise,
  ZodReadonly: () => ZodReadonly,
  ZodRecord: () => ZodRecord,
  ZodSchema: () => ZodType,
  ZodSet: () => ZodSet,
  ZodString: () => ZodString,
  ZodSymbol: () => ZodSymbol,
  ZodTransformer: () => ZodEffects,
  ZodTuple: () => ZodTuple,
  ZodType: () => ZodType,
  ZodUndefined: () => ZodUndefined,
  ZodUnion: () => ZodUnion,
  ZodUnknown: () => ZodUnknown,
  ZodVoid: () => ZodVoid,
  addIssueToContext: () => addIssueToContext,
  any: () => anyType,
  array: () => arrayType,
  bigint: () => bigIntType,
  boolean: () => booleanType,
  coerce: () => coerce,
  custom: () => custom,
  date: () => dateType,
  datetimeRegex: () => datetimeRegex,
  defaultErrorMap: () => en_default,
  discriminatedUnion: () => discriminatedUnionType,
  effect: () => effectsType,
  enum: () => enumType,
  function: () => functionType,
  getErrorMap: () => getErrorMap,
  getParsedType: () => getParsedType,
  instanceof: () => instanceOfType,
  intersection: () => intersectionType,
  isAborted: () => isAborted,
  isAsync: () => isAsync,
  isDirty: () => isDirty,
  isValid: () => isValid,
  late: () => late,
  lazy: () => lazyType,
  literal: () => literalType,
  makeIssue: () => makeIssue,
  map: () => mapType,
  nan: () => nanType,
  nativeEnum: () => nativeEnumType,
  never: () => neverType,
  null: () => nullType,
  nullable: () => nullableType,
  number: () => numberType,
  object: () => objectType,
  objectUtil: () => objectUtil,
  oboolean: () => oboolean,
  onumber: () => onumber,
  optional: () => optionalType,
  ostring: () => ostring,
  pipeline: () => pipelineType,
  preprocess: () => preprocessType,
  promise: () => promiseType,
  quotelessJson: () => quotelessJson,
  record: () => recordType,
  set: () => setType,
  setErrorMap: () => setErrorMap,
  strictObject: () => strictObjectType,
  string: () => stringType,
  symbol: () => symbolType,
  transformer: () => effectsType,
  tuple: () => tupleType,
  undefined: () => undefinedType,
  union: () => unionType,
  unknown: () => unknownType,
  util: () => util,
  void: () => voidType
});

// node_modules/zod/v3/helpers/util.js
var util;
(function(util2) {
  util2.assertEqual = (_) => {
  };
  function assertIs(_arg) {
  }
  util2.assertIs = assertIs;
  function assertNever3(_x) {
    throw new Error();
  }
  util2.assertNever = assertNever3;
  util2.arrayToEnum = (items) => {
    const obj = {};
    for (const item of items) {
      obj[item] = item;
    }
    return obj;
  };
  util2.getValidEnumValues = (obj) => {
    const validKeys = util2.objectKeys(obj).filter((k) => typeof obj[obj[k]] !== "number");
    const filtered = {};
    for (const k of validKeys) {
      filtered[k] = obj[k];
    }
    return util2.objectValues(filtered);
  };
  util2.objectValues = (obj) => {
    return util2.objectKeys(obj).map(function(e) {
      return obj[e];
    });
  };
  util2.objectKeys = typeof Object.keys === "function" ? (obj) => Object.keys(obj) : (object) => {
    const keys = [];
    for (const key in object) {
      if (Object.prototype.hasOwnProperty.call(object, key)) {
        keys.push(key);
      }
    }
    return keys;
  };
  util2.find = (arr, checker) => {
    for (const item of arr) {
      if (checker(item))
        return item;
    }
    return void 0;
  };
  util2.isInteger = typeof Number.isInteger === "function" ? (val) => Number.isInteger(val) : (val) => typeof val === "number" && Number.isFinite(val) && Math.floor(val) === val;
  function joinValues(array, separator = " | ") {
    return array.map((val) => typeof val === "string" ? `'${val}'` : val).join(separator);
  }
  util2.joinValues = joinValues;
  util2.jsonStringifyReplacer = (_, value) => {
    if (typeof value === "bigint") {
      return value.toString();
    }
    return value;
  };
})(util || (util = {}));
var objectUtil;
(function(objectUtil2) {
  objectUtil2.mergeShapes = (first, second) => {
    return {
      ...first,
      ...second
      // second overwrites first
    };
  };
})(objectUtil || (objectUtil = {}));
var ZodParsedType = util.arrayToEnum([
  "string",
  "nan",
  "number",
  "integer",
  "float",
  "boolean",
  "date",
  "bigint",
  "symbol",
  "function",
  "undefined",
  "null",
  "array",
  "object",
  "unknown",
  "promise",
  "void",
  "never",
  "map",
  "set"
]);
var getParsedType = (data) => {
  const t = typeof data;
  switch (t) {
    case "undefined":
      return ZodParsedType.undefined;
    case "string":
      return ZodParsedType.string;
    case "number":
      return Number.isNaN(data) ? ZodParsedType.nan : ZodParsedType.number;
    case "boolean":
      return ZodParsedType.boolean;
    case "function":
      return ZodParsedType.function;
    case "bigint":
      return ZodParsedType.bigint;
    case "symbol":
      return ZodParsedType.symbol;
    case "object":
      if (Array.isArray(data)) {
        return ZodParsedType.array;
      }
      if (data === null) {
        return ZodParsedType.null;
      }
      if (data.then && typeof data.then === "function" && data.catch && typeof data.catch === "function") {
        return ZodParsedType.promise;
      }
      if (typeof Map !== "undefined" && data instanceof Map) {
        return ZodParsedType.map;
      }
      if (typeof Set !== "undefined" && data instanceof Set) {
        return ZodParsedType.set;
      }
      if (typeof Date !== "undefined" && data instanceof Date) {
        return ZodParsedType.date;
      }
      return ZodParsedType.object;
    default:
      return ZodParsedType.unknown;
  }
};

// node_modules/zod/v3/ZodError.js
var ZodIssueCode = util.arrayToEnum([
  "invalid_type",
  "invalid_literal",
  "custom",
  "invalid_union",
  "invalid_union_discriminator",
  "invalid_enum_value",
  "unrecognized_keys",
  "invalid_arguments",
  "invalid_return_type",
  "invalid_date",
  "invalid_string",
  "too_small",
  "too_big",
  "invalid_intersection_types",
  "not_multiple_of",
  "not_finite"
]);
var quotelessJson = (obj) => {
  const json2 = JSON.stringify(obj, null, 2);
  return json2.replace(/"([^"]+)":/g, "$1:");
};
var ZodError = class _ZodError extends Error {
  get errors() {
    return this.issues;
  }
  constructor(issues) {
    super();
    this.issues = [];
    this.addIssue = (sub) => {
      this.issues = [...this.issues, sub];
    };
    this.addIssues = (subs = []) => {
      this.issues = [...this.issues, ...subs];
    };
    const actualProto = new.target.prototype;
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(this, actualProto);
    } else {
      this.__proto__ = actualProto;
    }
    this.name = "ZodError";
    this.issues = issues;
  }
  format(_mapper) {
    const mapper = _mapper || function(issue) {
      return issue.message;
    };
    const fieldErrors = { _errors: [] };
    const processError = (error) => {
      for (const issue of error.issues) {
        if (issue.code === "invalid_union") {
          issue.unionErrors.map(processError);
        } else if (issue.code === "invalid_return_type") {
          processError(issue.returnTypeError);
        } else if (issue.code === "invalid_arguments") {
          processError(issue.argumentsError);
        } else if (issue.path.length === 0) {
          fieldErrors._errors.push(mapper(issue));
        } else {
          let curr = fieldErrors;
          let i = 0;
          while (i < issue.path.length) {
            const el = issue.path[i];
            const terminal = i === issue.path.length - 1;
            if (!terminal) {
              curr[el] = curr[el] || { _errors: [] };
            } else {
              curr[el] = curr[el] || { _errors: [] };
              curr[el]._errors.push(mapper(issue));
            }
            curr = curr[el];
            i++;
          }
        }
      }
    };
    processError(this);
    return fieldErrors;
  }
  static assert(value) {
    if (!(value instanceof _ZodError)) {
      throw new Error(`Not a ZodError: ${value}`);
    }
  }
  toString() {
    return this.message;
  }
  get message() {
    return JSON.stringify(this.issues, util.jsonStringifyReplacer, 2);
  }
  get isEmpty() {
    return this.issues.length === 0;
  }
  flatten(mapper = (issue) => issue.message) {
    const fieldErrors = {};
    const formErrors = [];
    for (const sub of this.issues) {
      if (sub.path.length > 0) {
        const firstEl = sub.path[0];
        fieldErrors[firstEl] = fieldErrors[firstEl] || [];
        fieldErrors[firstEl].push(mapper(sub));
      } else {
        formErrors.push(mapper(sub));
      }
    }
    return { formErrors, fieldErrors };
  }
  get formErrors() {
    return this.flatten();
  }
};
ZodError.create = (issues) => {
  const error = new ZodError(issues);
  return error;
};

// node_modules/zod/v3/locales/en.js
var errorMap = (issue, _ctx) => {
  let message2;
  switch (issue.code) {
    case ZodIssueCode.invalid_type:
      if (issue.received === ZodParsedType.undefined) {
        message2 = "Required";
      } else {
        message2 = `Expected ${issue.expected}, received ${issue.received}`;
      }
      break;
    case ZodIssueCode.invalid_literal:
      message2 = `Invalid literal value, expected ${JSON.stringify(issue.expected, util.jsonStringifyReplacer)}`;
      break;
    case ZodIssueCode.unrecognized_keys:
      message2 = `Unrecognized key(s) in object: ${util.joinValues(issue.keys, ", ")}`;
      break;
    case ZodIssueCode.invalid_union:
      message2 = `Invalid input`;
      break;
    case ZodIssueCode.invalid_union_discriminator:
      message2 = `Invalid discriminator value. Expected ${util.joinValues(issue.options)}`;
      break;
    case ZodIssueCode.invalid_enum_value:
      message2 = `Invalid enum value. Expected ${util.joinValues(issue.options)}, received '${issue.received}'`;
      break;
    case ZodIssueCode.invalid_arguments:
      message2 = `Invalid function arguments`;
      break;
    case ZodIssueCode.invalid_return_type:
      message2 = `Invalid function return type`;
      break;
    case ZodIssueCode.invalid_date:
      message2 = `Invalid date`;
      break;
    case ZodIssueCode.invalid_string:
      if (typeof issue.validation === "object") {
        if ("includes" in issue.validation) {
          message2 = `Invalid input: must include "${issue.validation.includes}"`;
          if (typeof issue.validation.position === "number") {
            message2 = `${message2} at one or more positions greater than or equal to ${issue.validation.position}`;
          }
        } else if ("startsWith" in issue.validation) {
          message2 = `Invalid input: must start with "${issue.validation.startsWith}"`;
        } else if ("endsWith" in issue.validation) {
          message2 = `Invalid input: must end with "${issue.validation.endsWith}"`;
        } else {
          util.assertNever(issue.validation);
        }
      } else if (issue.validation !== "regex") {
        message2 = `Invalid ${issue.validation}`;
      } else {
        message2 = "Invalid";
      }
      break;
    case ZodIssueCode.too_small:
      if (issue.type === "array")
        message2 = `Array must contain ${issue.exact ? "exactly" : issue.inclusive ? `at least` : `more than`} ${issue.minimum} element(s)`;
      else if (issue.type === "string")
        message2 = `String must contain ${issue.exact ? "exactly" : issue.inclusive ? `at least` : `over`} ${issue.minimum} character(s)`;
      else if (issue.type === "number")
        message2 = `Number must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${issue.minimum}`;
      else if (issue.type === "bigint")
        message2 = `Number must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${issue.minimum}`;
      else if (issue.type === "date")
        message2 = `Date must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${new Date(Number(issue.minimum))}`;
      else
        message2 = "Invalid input";
      break;
    case ZodIssueCode.too_big:
      if (issue.type === "array")
        message2 = `Array must contain ${issue.exact ? `exactly` : issue.inclusive ? `at most` : `less than`} ${issue.maximum} element(s)`;
      else if (issue.type === "string")
        message2 = `String must contain ${issue.exact ? `exactly` : issue.inclusive ? `at most` : `under`} ${issue.maximum} character(s)`;
      else if (issue.type === "number")
        message2 = `Number must be ${issue.exact ? `exactly` : issue.inclusive ? `less than or equal to` : `less than`} ${issue.maximum}`;
      else if (issue.type === "bigint")
        message2 = `BigInt must be ${issue.exact ? `exactly` : issue.inclusive ? `less than or equal to` : `less than`} ${issue.maximum}`;
      else if (issue.type === "date")
        message2 = `Date must be ${issue.exact ? `exactly` : issue.inclusive ? `smaller than or equal to` : `smaller than`} ${new Date(Number(issue.maximum))}`;
      else
        message2 = "Invalid input";
      break;
    case ZodIssueCode.custom:
      message2 = `Invalid input`;
      break;
    case ZodIssueCode.invalid_intersection_types:
      message2 = `Intersection results could not be merged`;
      break;
    case ZodIssueCode.not_multiple_of:
      message2 = `Number must be a multiple of ${issue.multipleOf}`;
      break;
    case ZodIssueCode.not_finite:
      message2 = "Number must be finite";
      break;
    default:
      message2 = _ctx.defaultError;
      util.assertNever(issue);
  }
  return { message: message2 };
};
var en_default = errorMap;

// node_modules/zod/v3/errors.js
var overrideErrorMap = en_default;
function setErrorMap(map) {
  overrideErrorMap = map;
}
function getErrorMap() {
  return overrideErrorMap;
}

// node_modules/zod/v3/helpers/parseUtil.js
var makeIssue = (params) => {
  const { data, path: path2, errorMaps, issueData } = params;
  const fullPath = [...path2, ...issueData.path || []];
  const fullIssue = {
    ...issueData,
    path: fullPath
  };
  if (issueData.message !== void 0) {
    return {
      ...issueData,
      path: fullPath,
      message: issueData.message
    };
  }
  let errorMessage = "";
  const maps = errorMaps.filter((m) => !!m).slice().reverse();
  for (const map of maps) {
    errorMessage = map(fullIssue, { data, defaultError: errorMessage }).message;
  }
  return {
    ...issueData,
    path: fullPath,
    message: errorMessage
  };
};
var EMPTY_PATH = [];
function addIssueToContext(ctx, issueData) {
  const overrideMap = getErrorMap();
  const issue = makeIssue({
    issueData,
    data: ctx.data,
    path: ctx.path,
    errorMaps: [
      ctx.common.contextualErrorMap,
      // contextual error map is first priority
      ctx.schemaErrorMap,
      // then schema-bound map if available
      overrideMap,
      // then global override map
      overrideMap === en_default ? void 0 : en_default
      // then global default map
    ].filter((x) => !!x)
  });
  ctx.common.issues.push(issue);
}
var ParseStatus = class _ParseStatus {
  constructor() {
    this.value = "valid";
  }
  dirty() {
    if (this.value === "valid")
      this.value = "dirty";
  }
  abort() {
    if (this.value !== "aborted")
      this.value = "aborted";
  }
  static mergeArray(status, results) {
    const arrayValue = [];
    for (const s of results) {
      if (s.status === "aborted")
        return INVALID;
      if (s.status === "dirty")
        status.dirty();
      arrayValue.push(s.value);
    }
    return { status: status.value, value: arrayValue };
  }
  static async mergeObjectAsync(status, pairs) {
    const syncPairs = [];
    for (const pair of pairs) {
      const key = await pair.key;
      const value = await pair.value;
      syncPairs.push({
        key,
        value
      });
    }
    return _ParseStatus.mergeObjectSync(status, syncPairs);
  }
  static mergeObjectSync(status, pairs) {
    const finalObject = {};
    for (const pair of pairs) {
      const { key, value } = pair;
      if (key.status === "aborted")
        return INVALID;
      if (value.status === "aborted")
        return INVALID;
      if (key.status === "dirty")
        status.dirty();
      if (value.status === "dirty")
        status.dirty();
      if (key.value !== "__proto__" && (typeof value.value !== "undefined" || pair.alwaysSet)) {
        finalObject[key.value] = value.value;
      }
    }
    return { status: status.value, value: finalObject };
  }
};
var INVALID = Object.freeze({
  status: "aborted"
});
var DIRTY = (value) => ({ status: "dirty", value });
var OK = (value) => ({ status: "valid", value });
var isAborted = (x) => x.status === "aborted";
var isDirty = (x) => x.status === "dirty";
var isValid = (x) => x.status === "valid";
var isAsync = (x) => typeof Promise !== "undefined" && x instanceof Promise;

// node_modules/zod/v3/helpers/errorUtil.js
var errorUtil;
(function(errorUtil2) {
  errorUtil2.errToObj = (message2) => typeof message2 === "string" ? { message: message2 } : message2 || {};
  errorUtil2.toString = (message2) => typeof message2 === "string" ? message2 : message2?.message;
})(errorUtil || (errorUtil = {}));

// node_modules/zod/v3/types.js
var ParseInputLazyPath = class {
  constructor(parent, value, path2, key) {
    this._cachedPath = [];
    this.parent = parent;
    this.data = value;
    this._path = path2;
    this._key = key;
  }
  get path() {
    if (!this._cachedPath.length) {
      if (Array.isArray(this._key)) {
        this._cachedPath.push(...this._path, ...this._key);
      } else {
        this._cachedPath.push(...this._path, this._key);
      }
    }
    return this._cachedPath;
  }
};
var handleResult = (ctx, result) => {
  if (isValid(result)) {
    return { success: true, data: result.value };
  } else {
    if (!ctx.common.issues.length) {
      throw new Error("Validation failed but no issues detected.");
    }
    return {
      success: false,
      get error() {
        if (this._error)
          return this._error;
        const error = new ZodError(ctx.common.issues);
        this._error = error;
        return this._error;
      }
    };
  }
};
function processCreateParams(params) {
  if (!params)
    return {};
  const { errorMap: errorMap2, invalid_type_error, required_error, description } = params;
  if (errorMap2 && (invalid_type_error || required_error)) {
    throw new Error(`Can't use "invalid_type_error" or "required_error" in conjunction with custom error map.`);
  }
  if (errorMap2)
    return { errorMap: errorMap2, description };
  const customMap = (iss, ctx) => {
    const { message: message2 } = params;
    if (iss.code === "invalid_enum_value") {
      return { message: message2 ?? ctx.defaultError };
    }
    if (typeof ctx.data === "undefined") {
      return { message: message2 ?? required_error ?? ctx.defaultError };
    }
    if (iss.code !== "invalid_type")
      return { message: ctx.defaultError };
    return { message: message2 ?? invalid_type_error ?? ctx.defaultError };
  };
  return { errorMap: customMap, description };
}
var ZodType = class {
  get description() {
    return this._def.description;
  }
  _getType(input) {
    return getParsedType(input.data);
  }
  _getOrReturnCtx(input, ctx) {
    return ctx || {
      common: input.parent.common,
      data: input.data,
      parsedType: getParsedType(input.data),
      schemaErrorMap: this._def.errorMap,
      path: input.path,
      parent: input.parent
    };
  }
  _processInputParams(input) {
    return {
      status: new ParseStatus(),
      ctx: {
        common: input.parent.common,
        data: input.data,
        parsedType: getParsedType(input.data),
        schemaErrorMap: this._def.errorMap,
        path: input.path,
        parent: input.parent
      }
    };
  }
  _parseSync(input) {
    const result = this._parse(input);
    if (isAsync(result)) {
      throw new Error("Synchronous parse encountered promise.");
    }
    return result;
  }
  _parseAsync(input) {
    const result = this._parse(input);
    return Promise.resolve(result);
  }
  parse(data, params) {
    const result = this.safeParse(data, params);
    if (result.success)
      return result.data;
    throw result.error;
  }
  safeParse(data, params) {
    const ctx = {
      common: {
        issues: [],
        async: params?.async ?? false,
        contextualErrorMap: params?.errorMap
      },
      path: params?.path || [],
      schemaErrorMap: this._def.errorMap,
      parent: null,
      data,
      parsedType: getParsedType(data)
    };
    const result = this._parseSync({ data, path: ctx.path, parent: ctx });
    return handleResult(ctx, result);
  }
  "~validate"(data) {
    const ctx = {
      common: {
        issues: [],
        async: !!this["~standard"].async
      },
      path: [],
      schemaErrorMap: this._def.errorMap,
      parent: null,
      data,
      parsedType: getParsedType(data)
    };
    if (!this["~standard"].async) {
      try {
        const result = this._parseSync({ data, path: [], parent: ctx });
        return isValid(result) ? {
          value: result.value
        } : {
          issues: ctx.common.issues
        };
      } catch (err) {
        if (err?.message?.toLowerCase()?.includes("encountered")) {
          this["~standard"].async = true;
        }
        ctx.common = {
          issues: [],
          async: true
        };
      }
    }
    return this._parseAsync({ data, path: [], parent: ctx }).then((result) => isValid(result) ? {
      value: result.value
    } : {
      issues: ctx.common.issues
    });
  }
  async parseAsync(data, params) {
    const result = await this.safeParseAsync(data, params);
    if (result.success)
      return result.data;
    throw result.error;
  }
  async safeParseAsync(data, params) {
    const ctx = {
      common: {
        issues: [],
        contextualErrorMap: params?.errorMap,
        async: true
      },
      path: params?.path || [],
      schemaErrorMap: this._def.errorMap,
      parent: null,
      data,
      parsedType: getParsedType(data)
    };
    const maybeAsyncResult = this._parse({ data, path: ctx.path, parent: ctx });
    const result = await (isAsync(maybeAsyncResult) ? maybeAsyncResult : Promise.resolve(maybeAsyncResult));
    return handleResult(ctx, result);
  }
  refine(check, message2) {
    const getIssueProperties = (val) => {
      if (typeof message2 === "string" || typeof message2 === "undefined") {
        return { message: message2 };
      } else if (typeof message2 === "function") {
        return message2(val);
      } else {
        return message2;
      }
    };
    return this._refinement((val, ctx) => {
      const result = check(val);
      const setError = () => ctx.addIssue({
        code: ZodIssueCode.custom,
        ...getIssueProperties(val)
      });
      if (typeof Promise !== "undefined" && result instanceof Promise) {
        return result.then((data) => {
          if (!data) {
            setError();
            return false;
          } else {
            return true;
          }
        });
      }
      if (!result) {
        setError();
        return false;
      } else {
        return true;
      }
    });
  }
  refinement(check, refinementData) {
    return this._refinement((val, ctx) => {
      if (!check(val)) {
        ctx.addIssue(typeof refinementData === "function" ? refinementData(val, ctx) : refinementData);
        return false;
      } else {
        return true;
      }
    });
  }
  _refinement(refinement) {
    return new ZodEffects({
      schema: this,
      typeName: ZodFirstPartyTypeKind.ZodEffects,
      effect: { type: "refinement", refinement }
    });
  }
  superRefine(refinement) {
    return this._refinement(refinement);
  }
  constructor(def) {
    this.spa = this.safeParseAsync;
    this._def = def;
    this.parse = this.parse.bind(this);
    this.safeParse = this.safeParse.bind(this);
    this.parseAsync = this.parseAsync.bind(this);
    this.safeParseAsync = this.safeParseAsync.bind(this);
    this.spa = this.spa.bind(this);
    this.refine = this.refine.bind(this);
    this.refinement = this.refinement.bind(this);
    this.superRefine = this.superRefine.bind(this);
    this.optional = this.optional.bind(this);
    this.nullable = this.nullable.bind(this);
    this.nullish = this.nullish.bind(this);
    this.array = this.array.bind(this);
    this.promise = this.promise.bind(this);
    this.or = this.or.bind(this);
    this.and = this.and.bind(this);
    this.transform = this.transform.bind(this);
    this.brand = this.brand.bind(this);
    this.default = this.default.bind(this);
    this.catch = this.catch.bind(this);
    this.describe = this.describe.bind(this);
    this.pipe = this.pipe.bind(this);
    this.readonly = this.readonly.bind(this);
    this.isNullable = this.isNullable.bind(this);
    this.isOptional = this.isOptional.bind(this);
    this["~standard"] = {
      version: 1,
      vendor: "zod",
      validate: (data) => this["~validate"](data)
    };
  }
  optional() {
    return ZodOptional.create(this, this._def);
  }
  nullable() {
    return ZodNullable.create(this, this._def);
  }
  nullish() {
    return this.nullable().optional();
  }
  array() {
    return ZodArray.create(this);
  }
  promise() {
    return ZodPromise.create(this, this._def);
  }
  or(option) {
    return ZodUnion.create([this, option], this._def);
  }
  and(incoming) {
    return ZodIntersection.create(this, incoming, this._def);
  }
  transform(transform) {
    return new ZodEffects({
      ...processCreateParams(this._def),
      schema: this,
      typeName: ZodFirstPartyTypeKind.ZodEffects,
      effect: { type: "transform", transform }
    });
  }
  default(def) {
    const defaultValueFunc = typeof def === "function" ? def : () => def;
    return new ZodDefault({
      ...processCreateParams(this._def),
      innerType: this,
      defaultValue: defaultValueFunc,
      typeName: ZodFirstPartyTypeKind.ZodDefault
    });
  }
  brand() {
    return new ZodBranded({
      typeName: ZodFirstPartyTypeKind.ZodBranded,
      type: this,
      ...processCreateParams(this._def)
    });
  }
  catch(def) {
    const catchValueFunc = typeof def === "function" ? def : () => def;
    return new ZodCatch({
      ...processCreateParams(this._def),
      innerType: this,
      catchValue: catchValueFunc,
      typeName: ZodFirstPartyTypeKind.ZodCatch
    });
  }
  describe(description) {
    const This = this.constructor;
    return new This({
      ...this._def,
      description
    });
  }
  pipe(target) {
    return ZodPipeline.create(this, target);
  }
  readonly() {
    return ZodReadonly.create(this);
  }
  isOptional() {
    return this.safeParse(void 0).success;
  }
  isNullable() {
    return this.safeParse(null).success;
  }
};
var cuidRegex = /^c[^\s-]{8,}$/i;
var cuid2Regex = /^[0-9a-z]+$/;
var ulidRegex = /^[0-9A-HJKMNP-TV-Z]{26}$/i;
var uuidRegex = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/i;
var nanoidRegex = /^[a-z0-9_-]{21}$/i;
var jwtRegex = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/;
var durationRegex = /^[-+]?P(?!$)(?:(?:[-+]?\d+Y)|(?:[-+]?\d+[.,]\d+Y$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:(?:[-+]?\d+W)|(?:[-+]?\d+[.,]\d+W$))?(?:(?:[-+]?\d+D)|(?:[-+]?\d+[.,]\d+D$))?(?:T(?=[\d+-])(?:(?:[-+]?\d+H)|(?:[-+]?\d+[.,]\d+H$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:[-+]?\d+(?:[.,]\d+)?S)?)??$/;
var emailRegex = /^(?!\.)(?!.*\.\.)([A-Z0-9_'+\-\.]*)[A-Z0-9_+-]@([A-Z0-9][A-Z0-9\-]*\.)+[A-Z]{2,}$/i;
var _emojiRegex = `^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$`;
var emojiRegex;
var ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/;
var ipv4CidrRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/(3[0-2]|[12]?[0-9])$/;
var ipv6Regex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;
var ipv6CidrRegex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/;
var base64Regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
var base64urlRegex = /^([0-9a-zA-Z-_]{4})*(([0-9a-zA-Z-_]{2}(==)?)|([0-9a-zA-Z-_]{3}(=)?))?$/;
var dateRegexSource = `((\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-((0[13578]|1[02])-(0[1-9]|[12]\\d|3[01])|(0[469]|11)-(0[1-9]|[12]\\d|30)|(02)-(0[1-9]|1\\d|2[0-8])))`;
var dateRegex = new RegExp(`^${dateRegexSource}$`);
function timeRegexSource(args) {
  let secondsRegexSource = `[0-5]\\d`;
  if (args.precision) {
    secondsRegexSource = `${secondsRegexSource}\\.\\d{${args.precision}}`;
  } else if (args.precision == null) {
    secondsRegexSource = `${secondsRegexSource}(\\.\\d+)?`;
  }
  const secondsQuantifier = args.precision ? "+" : "?";
  return `([01]\\d|2[0-3]):[0-5]\\d(:${secondsRegexSource})${secondsQuantifier}`;
}
function timeRegex(args) {
  return new RegExp(`^${timeRegexSource(args)}$`);
}
function datetimeRegex(args) {
  let regex = `${dateRegexSource}T${timeRegexSource(args)}`;
  const opts = [];
  opts.push(args.local ? `Z?` : `Z`);
  if (args.offset)
    opts.push(`([+-]\\d{2}:?\\d{2})`);
  regex = `${regex}(${opts.join("|")})`;
  return new RegExp(`^${regex}$`);
}
function isValidIP(ip, version2) {
  if ((version2 === "v4" || !version2) && ipv4Regex.test(ip)) {
    return true;
  }
  if ((version2 === "v6" || !version2) && ipv6Regex.test(ip)) {
    return true;
  }
  return false;
}
function isValidJWT(jwt, alg) {
  if (!jwtRegex.test(jwt))
    return false;
  try {
    const [header] = jwt.split(".");
    if (!header)
      return false;
    const base64 = header.replace(/-/g, "+").replace(/_/g, "/").padEnd(header.length + (4 - header.length % 4) % 4, "=");
    const decoded = JSON.parse(atob(base64));
    if (typeof decoded !== "object" || decoded === null)
      return false;
    if ("typ" in decoded && decoded?.typ !== "JWT")
      return false;
    if (!decoded.alg)
      return false;
    if (alg && decoded.alg !== alg)
      return false;
    return true;
  } catch {
    return false;
  }
}
function isValidCidr(ip, version2) {
  if ((version2 === "v4" || !version2) && ipv4CidrRegex.test(ip)) {
    return true;
  }
  if ((version2 === "v6" || !version2) && ipv6CidrRegex.test(ip)) {
    return true;
  }
  return false;
}
var ZodString = class _ZodString extends ZodType {
  _parse(input) {
    if (this._def.coerce) {
      input.data = String(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.string) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.string,
        received: ctx2.parsedType
      });
      return INVALID;
    }
    const status = new ParseStatus();
    let ctx = void 0;
    for (const check of this._def.checks) {
      if (check.kind === "min") {
        if (input.data.length < check.value) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            minimum: check.value,
            type: "string",
            inclusive: true,
            exact: false,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "max") {
        if (input.data.length > check.value) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            maximum: check.value,
            type: "string",
            inclusive: true,
            exact: false,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "length") {
        const tooBig = input.data.length > check.value;
        const tooSmall = input.data.length < check.value;
        if (tooBig || tooSmall) {
          ctx = this._getOrReturnCtx(input, ctx);
          if (tooBig) {
            addIssueToContext(ctx, {
              code: ZodIssueCode.too_big,
              maximum: check.value,
              type: "string",
              inclusive: true,
              exact: true,
              message: check.message
            });
          } else if (tooSmall) {
            addIssueToContext(ctx, {
              code: ZodIssueCode.too_small,
              minimum: check.value,
              type: "string",
              inclusive: true,
              exact: true,
              message: check.message
            });
          }
          status.dirty();
        }
      } else if (check.kind === "email") {
        if (!emailRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "email",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "emoji") {
        if (!emojiRegex) {
          emojiRegex = new RegExp(_emojiRegex, "u");
        }
        if (!emojiRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "emoji",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "uuid") {
        if (!uuidRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "uuid",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "nanoid") {
        if (!nanoidRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "nanoid",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "cuid") {
        if (!cuidRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "cuid",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "cuid2") {
        if (!cuid2Regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "cuid2",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "ulid") {
        if (!ulidRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "ulid",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "url") {
        try {
          new URL(input.data);
        } catch {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "url",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "regex") {
        check.regex.lastIndex = 0;
        const testResult = check.regex.test(input.data);
        if (!testResult) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "regex",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "trim") {
        input.data = input.data.trim();
      } else if (check.kind === "includes") {
        if (!input.data.includes(check.value, check.position)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: { includes: check.value, position: check.position },
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "toLowerCase") {
        input.data = input.data.toLowerCase();
      } else if (check.kind === "toUpperCase") {
        input.data = input.data.toUpperCase();
      } else if (check.kind === "startsWith") {
        if (!input.data.startsWith(check.value)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: { startsWith: check.value },
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "endsWith") {
        if (!input.data.endsWith(check.value)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: { endsWith: check.value },
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "datetime") {
        const regex = datetimeRegex(check);
        if (!regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: "datetime",
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "date") {
        const regex = dateRegex;
        if (!regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: "date",
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "time") {
        const regex = timeRegex(check);
        if (!regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: "time",
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "duration") {
        if (!durationRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "duration",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "ip") {
        if (!isValidIP(input.data, check.version)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "ip",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "jwt") {
        if (!isValidJWT(input.data, check.alg)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "jwt",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "cidr") {
        if (!isValidCidr(input.data, check.version)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "cidr",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "base64") {
        if (!base64Regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "base64",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "base64url") {
        if (!base64urlRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "base64url",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else {
        util.assertNever(check);
      }
    }
    return { status: status.value, value: input.data };
  }
  _regex(regex, validation, message2) {
    return this.refinement((data) => regex.test(data), {
      validation,
      code: ZodIssueCode.invalid_string,
      ...errorUtil.errToObj(message2)
    });
  }
  _addCheck(check) {
    return new _ZodString({
      ...this._def,
      checks: [...this._def.checks, check]
    });
  }
  email(message2) {
    return this._addCheck({ kind: "email", ...errorUtil.errToObj(message2) });
  }
  url(message2) {
    return this._addCheck({ kind: "url", ...errorUtil.errToObj(message2) });
  }
  emoji(message2) {
    return this._addCheck({ kind: "emoji", ...errorUtil.errToObj(message2) });
  }
  uuid(message2) {
    return this._addCheck({ kind: "uuid", ...errorUtil.errToObj(message2) });
  }
  nanoid(message2) {
    return this._addCheck({ kind: "nanoid", ...errorUtil.errToObj(message2) });
  }
  cuid(message2) {
    return this._addCheck({ kind: "cuid", ...errorUtil.errToObj(message2) });
  }
  cuid2(message2) {
    return this._addCheck({ kind: "cuid2", ...errorUtil.errToObj(message2) });
  }
  ulid(message2) {
    return this._addCheck({ kind: "ulid", ...errorUtil.errToObj(message2) });
  }
  base64(message2) {
    return this._addCheck({ kind: "base64", ...errorUtil.errToObj(message2) });
  }
  base64url(message2) {
    return this._addCheck({
      kind: "base64url",
      ...errorUtil.errToObj(message2)
    });
  }
  jwt(options) {
    return this._addCheck({ kind: "jwt", ...errorUtil.errToObj(options) });
  }
  ip(options) {
    return this._addCheck({ kind: "ip", ...errorUtil.errToObj(options) });
  }
  cidr(options) {
    return this._addCheck({ kind: "cidr", ...errorUtil.errToObj(options) });
  }
  datetime(options) {
    if (typeof options === "string") {
      return this._addCheck({
        kind: "datetime",
        precision: null,
        offset: false,
        local: false,
        message: options
      });
    }
    return this._addCheck({
      kind: "datetime",
      precision: typeof options?.precision === "undefined" ? null : options?.precision,
      offset: options?.offset ?? false,
      local: options?.local ?? false,
      ...errorUtil.errToObj(options?.message)
    });
  }
  date(message2) {
    return this._addCheck({ kind: "date", message: message2 });
  }
  time(options) {
    if (typeof options === "string") {
      return this._addCheck({
        kind: "time",
        precision: null,
        message: options
      });
    }
    return this._addCheck({
      kind: "time",
      precision: typeof options?.precision === "undefined" ? null : options?.precision,
      ...errorUtil.errToObj(options?.message)
    });
  }
  duration(message2) {
    return this._addCheck({ kind: "duration", ...errorUtil.errToObj(message2) });
  }
  regex(regex, message2) {
    return this._addCheck({
      kind: "regex",
      regex,
      ...errorUtil.errToObj(message2)
    });
  }
  includes(value, options) {
    return this._addCheck({
      kind: "includes",
      value,
      position: options?.position,
      ...errorUtil.errToObj(options?.message)
    });
  }
  startsWith(value, message2) {
    return this._addCheck({
      kind: "startsWith",
      value,
      ...errorUtil.errToObj(message2)
    });
  }
  endsWith(value, message2) {
    return this._addCheck({
      kind: "endsWith",
      value,
      ...errorUtil.errToObj(message2)
    });
  }
  min(minLength, message2) {
    return this._addCheck({
      kind: "min",
      value: minLength,
      ...errorUtil.errToObj(message2)
    });
  }
  max(maxLength, message2) {
    return this._addCheck({
      kind: "max",
      value: maxLength,
      ...errorUtil.errToObj(message2)
    });
  }
  length(len, message2) {
    return this._addCheck({
      kind: "length",
      value: len,
      ...errorUtil.errToObj(message2)
    });
  }
  /**
   * Equivalent to `.min(1)`
   */
  nonempty(message2) {
    return this.min(1, errorUtil.errToObj(message2));
  }
  trim() {
    return new _ZodString({
      ...this._def,
      checks: [...this._def.checks, { kind: "trim" }]
    });
  }
  toLowerCase() {
    return new _ZodString({
      ...this._def,
      checks: [...this._def.checks, { kind: "toLowerCase" }]
    });
  }
  toUpperCase() {
    return new _ZodString({
      ...this._def,
      checks: [...this._def.checks, { kind: "toUpperCase" }]
    });
  }
  get isDatetime() {
    return !!this._def.checks.find((ch) => ch.kind === "datetime");
  }
  get isDate() {
    return !!this._def.checks.find((ch) => ch.kind === "date");
  }
  get isTime() {
    return !!this._def.checks.find((ch) => ch.kind === "time");
  }
  get isDuration() {
    return !!this._def.checks.find((ch) => ch.kind === "duration");
  }
  get isEmail() {
    return !!this._def.checks.find((ch) => ch.kind === "email");
  }
  get isURL() {
    return !!this._def.checks.find((ch) => ch.kind === "url");
  }
  get isEmoji() {
    return !!this._def.checks.find((ch) => ch.kind === "emoji");
  }
  get isUUID() {
    return !!this._def.checks.find((ch) => ch.kind === "uuid");
  }
  get isNANOID() {
    return !!this._def.checks.find((ch) => ch.kind === "nanoid");
  }
  get isCUID() {
    return !!this._def.checks.find((ch) => ch.kind === "cuid");
  }
  get isCUID2() {
    return !!this._def.checks.find((ch) => ch.kind === "cuid2");
  }
  get isULID() {
    return !!this._def.checks.find((ch) => ch.kind === "ulid");
  }
  get isIP() {
    return !!this._def.checks.find((ch) => ch.kind === "ip");
  }
  get isCIDR() {
    return !!this._def.checks.find((ch) => ch.kind === "cidr");
  }
  get isBase64() {
    return !!this._def.checks.find((ch) => ch.kind === "base64");
  }
  get isBase64url() {
    return !!this._def.checks.find((ch) => ch.kind === "base64url");
  }
  get minLength() {
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      }
    }
    return min;
  }
  get maxLength() {
    let max = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return max;
  }
};
ZodString.create = (params) => {
  return new ZodString({
    checks: [],
    typeName: ZodFirstPartyTypeKind.ZodString,
    coerce: params?.coerce ?? false,
    ...processCreateParams(params)
  });
};
function floatSafeRemainder(val, step) {
  const valDecCount = (val.toString().split(".")[1] || "").length;
  const stepDecCount = (step.toString().split(".")[1] || "").length;
  const decCount = valDecCount > stepDecCount ? valDecCount : stepDecCount;
  const valInt = Number.parseInt(val.toFixed(decCount).replace(".", ""));
  const stepInt = Number.parseInt(step.toFixed(decCount).replace(".", ""));
  return valInt % stepInt / 10 ** decCount;
}
var ZodNumber = class _ZodNumber extends ZodType {
  constructor() {
    super(...arguments);
    this.min = this.gte;
    this.max = this.lte;
    this.step = this.multipleOf;
  }
  _parse(input) {
    if (this._def.coerce) {
      input.data = Number(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.number) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.number,
        received: ctx2.parsedType
      });
      return INVALID;
    }
    let ctx = void 0;
    const status = new ParseStatus();
    for (const check of this._def.checks) {
      if (check.kind === "int") {
        if (!util.isInteger(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: "integer",
            received: "float",
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "min") {
        const tooSmall = check.inclusive ? input.data < check.value : input.data <= check.value;
        if (tooSmall) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            minimum: check.value,
            type: "number",
            inclusive: check.inclusive,
            exact: false,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "max") {
        const tooBig = check.inclusive ? input.data > check.value : input.data >= check.value;
        if (tooBig) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            maximum: check.value,
            type: "number",
            inclusive: check.inclusive,
            exact: false,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "multipleOf") {
        if (floatSafeRemainder(input.data, check.value) !== 0) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.not_multiple_of,
            multipleOf: check.value,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "finite") {
        if (!Number.isFinite(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.not_finite,
            message: check.message
          });
          status.dirty();
        }
      } else {
        util.assertNever(check);
      }
    }
    return { status: status.value, value: input.data };
  }
  gte(value, message2) {
    return this.setLimit("min", value, true, errorUtil.toString(message2));
  }
  gt(value, message2) {
    return this.setLimit("min", value, false, errorUtil.toString(message2));
  }
  lte(value, message2) {
    return this.setLimit("max", value, true, errorUtil.toString(message2));
  }
  lt(value, message2) {
    return this.setLimit("max", value, false, errorUtil.toString(message2));
  }
  setLimit(kind, value, inclusive, message2) {
    return new _ZodNumber({
      ...this._def,
      checks: [
        ...this._def.checks,
        {
          kind,
          value,
          inclusive,
          message: errorUtil.toString(message2)
        }
      ]
    });
  }
  _addCheck(check) {
    return new _ZodNumber({
      ...this._def,
      checks: [...this._def.checks, check]
    });
  }
  int(message2) {
    return this._addCheck({
      kind: "int",
      message: errorUtil.toString(message2)
    });
  }
  positive(message2) {
    return this._addCheck({
      kind: "min",
      value: 0,
      inclusive: false,
      message: errorUtil.toString(message2)
    });
  }
  negative(message2) {
    return this._addCheck({
      kind: "max",
      value: 0,
      inclusive: false,
      message: errorUtil.toString(message2)
    });
  }
  nonpositive(message2) {
    return this._addCheck({
      kind: "max",
      value: 0,
      inclusive: true,
      message: errorUtil.toString(message2)
    });
  }
  nonnegative(message2) {
    return this._addCheck({
      kind: "min",
      value: 0,
      inclusive: true,
      message: errorUtil.toString(message2)
    });
  }
  multipleOf(value, message2) {
    return this._addCheck({
      kind: "multipleOf",
      value,
      message: errorUtil.toString(message2)
    });
  }
  finite(message2) {
    return this._addCheck({
      kind: "finite",
      message: errorUtil.toString(message2)
    });
  }
  safe(message2) {
    return this._addCheck({
      kind: "min",
      inclusive: true,
      value: Number.MIN_SAFE_INTEGER,
      message: errorUtil.toString(message2)
    })._addCheck({
      kind: "max",
      inclusive: true,
      value: Number.MAX_SAFE_INTEGER,
      message: errorUtil.toString(message2)
    });
  }
  get minValue() {
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      }
    }
    return min;
  }
  get maxValue() {
    let max = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return max;
  }
  get isInt() {
    return !!this._def.checks.find((ch) => ch.kind === "int" || ch.kind === "multipleOf" && util.isInteger(ch.value));
  }
  get isFinite() {
    let max = null;
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "finite" || ch.kind === "int" || ch.kind === "multipleOf") {
        return true;
      } else if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      } else if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return Number.isFinite(min) && Number.isFinite(max);
  }
};
ZodNumber.create = (params) => {
  return new ZodNumber({
    checks: [],
    typeName: ZodFirstPartyTypeKind.ZodNumber,
    coerce: params?.coerce || false,
    ...processCreateParams(params)
  });
};
var ZodBigInt = class _ZodBigInt extends ZodType {
  constructor() {
    super(...arguments);
    this.min = this.gte;
    this.max = this.lte;
  }
  _parse(input) {
    if (this._def.coerce) {
      try {
        input.data = BigInt(input.data);
      } catch {
        return this._getInvalidInput(input);
      }
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.bigint) {
      return this._getInvalidInput(input);
    }
    let ctx = void 0;
    const status = new ParseStatus();
    for (const check of this._def.checks) {
      if (check.kind === "min") {
        const tooSmall = check.inclusive ? input.data < check.value : input.data <= check.value;
        if (tooSmall) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            type: "bigint",
            minimum: check.value,
            inclusive: check.inclusive,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "max") {
        const tooBig = check.inclusive ? input.data > check.value : input.data >= check.value;
        if (tooBig) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            type: "bigint",
            maximum: check.value,
            inclusive: check.inclusive,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "multipleOf") {
        if (input.data % check.value !== BigInt(0)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.not_multiple_of,
            multipleOf: check.value,
            message: check.message
          });
          status.dirty();
        }
      } else {
        util.assertNever(check);
      }
    }
    return { status: status.value, value: input.data };
  }
  _getInvalidInput(input) {
    const ctx = this._getOrReturnCtx(input);
    addIssueToContext(ctx, {
      code: ZodIssueCode.invalid_type,
      expected: ZodParsedType.bigint,
      received: ctx.parsedType
    });
    return INVALID;
  }
  gte(value, message2) {
    return this.setLimit("min", value, true, errorUtil.toString(message2));
  }
  gt(value, message2) {
    return this.setLimit("min", value, false, errorUtil.toString(message2));
  }
  lte(value, message2) {
    return this.setLimit("max", value, true, errorUtil.toString(message2));
  }
  lt(value, message2) {
    return this.setLimit("max", value, false, errorUtil.toString(message2));
  }
  setLimit(kind, value, inclusive, message2) {
    return new _ZodBigInt({
      ...this._def,
      checks: [
        ...this._def.checks,
        {
          kind,
          value,
          inclusive,
          message: errorUtil.toString(message2)
        }
      ]
    });
  }
  _addCheck(check) {
    return new _ZodBigInt({
      ...this._def,
      checks: [...this._def.checks, check]
    });
  }
  positive(message2) {
    return this._addCheck({
      kind: "min",
      value: BigInt(0),
      inclusive: false,
      message: errorUtil.toString(message2)
    });
  }
  negative(message2) {
    return this._addCheck({
      kind: "max",
      value: BigInt(0),
      inclusive: false,
      message: errorUtil.toString(message2)
    });
  }
  nonpositive(message2) {
    return this._addCheck({
      kind: "max",
      value: BigInt(0),
      inclusive: true,
      message: errorUtil.toString(message2)
    });
  }
  nonnegative(message2) {
    return this._addCheck({
      kind: "min",
      value: BigInt(0),
      inclusive: true,
      message: errorUtil.toString(message2)
    });
  }
  multipleOf(value, message2) {
    return this._addCheck({
      kind: "multipleOf",
      value,
      message: errorUtil.toString(message2)
    });
  }
  get minValue() {
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      }
    }
    return min;
  }
  get maxValue() {
    let max = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return max;
  }
};
ZodBigInt.create = (params) => {
  return new ZodBigInt({
    checks: [],
    typeName: ZodFirstPartyTypeKind.ZodBigInt,
    coerce: params?.coerce ?? false,
    ...processCreateParams(params)
  });
};
var ZodBoolean = class extends ZodType {
  _parse(input) {
    if (this._def.coerce) {
      input.data = Boolean(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.boolean) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.boolean,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
};
ZodBoolean.create = (params) => {
  return new ZodBoolean({
    typeName: ZodFirstPartyTypeKind.ZodBoolean,
    coerce: params?.coerce || false,
    ...processCreateParams(params)
  });
};
var ZodDate = class _ZodDate extends ZodType {
  _parse(input) {
    if (this._def.coerce) {
      input.data = new Date(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.date) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.date,
        received: ctx2.parsedType
      });
      return INVALID;
    }
    if (Number.isNaN(input.data.getTime())) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_date
      });
      return INVALID;
    }
    const status = new ParseStatus();
    let ctx = void 0;
    for (const check of this._def.checks) {
      if (check.kind === "min") {
        if (input.data.getTime() < check.value) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            message: check.message,
            inclusive: true,
            exact: false,
            minimum: check.value,
            type: "date"
          });
          status.dirty();
        }
      } else if (check.kind === "max") {
        if (input.data.getTime() > check.value) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            message: check.message,
            inclusive: true,
            exact: false,
            maximum: check.value,
            type: "date"
          });
          status.dirty();
        }
      } else {
        util.assertNever(check);
      }
    }
    return {
      status: status.value,
      value: new Date(input.data.getTime())
    };
  }
  _addCheck(check) {
    return new _ZodDate({
      ...this._def,
      checks: [...this._def.checks, check]
    });
  }
  min(minDate, message2) {
    return this._addCheck({
      kind: "min",
      value: minDate.getTime(),
      message: errorUtil.toString(message2)
    });
  }
  max(maxDate, message2) {
    return this._addCheck({
      kind: "max",
      value: maxDate.getTime(),
      message: errorUtil.toString(message2)
    });
  }
  get minDate() {
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      }
    }
    return min != null ? new Date(min) : null;
  }
  get maxDate() {
    let max = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return max != null ? new Date(max) : null;
  }
};
ZodDate.create = (params) => {
  return new ZodDate({
    checks: [],
    coerce: params?.coerce || false,
    typeName: ZodFirstPartyTypeKind.ZodDate,
    ...processCreateParams(params)
  });
};
var ZodSymbol = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.symbol) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.symbol,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
};
ZodSymbol.create = (params) => {
  return new ZodSymbol({
    typeName: ZodFirstPartyTypeKind.ZodSymbol,
    ...processCreateParams(params)
  });
};
var ZodUndefined = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.undefined) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.undefined,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
};
ZodUndefined.create = (params) => {
  return new ZodUndefined({
    typeName: ZodFirstPartyTypeKind.ZodUndefined,
    ...processCreateParams(params)
  });
};
var ZodNull = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.null) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.null,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
};
ZodNull.create = (params) => {
  return new ZodNull({
    typeName: ZodFirstPartyTypeKind.ZodNull,
    ...processCreateParams(params)
  });
};
var ZodAny = class extends ZodType {
  constructor() {
    super(...arguments);
    this._any = true;
  }
  _parse(input) {
    return OK(input.data);
  }
};
ZodAny.create = (params) => {
  return new ZodAny({
    typeName: ZodFirstPartyTypeKind.ZodAny,
    ...processCreateParams(params)
  });
};
var ZodUnknown = class extends ZodType {
  constructor() {
    super(...arguments);
    this._unknown = true;
  }
  _parse(input) {
    return OK(input.data);
  }
};
ZodUnknown.create = (params) => {
  return new ZodUnknown({
    typeName: ZodFirstPartyTypeKind.ZodUnknown,
    ...processCreateParams(params)
  });
};
var ZodNever = class extends ZodType {
  _parse(input) {
    const ctx = this._getOrReturnCtx(input);
    addIssueToContext(ctx, {
      code: ZodIssueCode.invalid_type,
      expected: ZodParsedType.never,
      received: ctx.parsedType
    });
    return INVALID;
  }
};
ZodNever.create = (params) => {
  return new ZodNever({
    typeName: ZodFirstPartyTypeKind.ZodNever,
    ...processCreateParams(params)
  });
};
var ZodVoid = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.undefined) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.void,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
};
ZodVoid.create = (params) => {
  return new ZodVoid({
    typeName: ZodFirstPartyTypeKind.ZodVoid,
    ...processCreateParams(params)
  });
};
var ZodArray = class _ZodArray extends ZodType {
  _parse(input) {
    const { ctx, status } = this._processInputParams(input);
    const def = this._def;
    if (ctx.parsedType !== ZodParsedType.array) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.array,
        received: ctx.parsedType
      });
      return INVALID;
    }
    if (def.exactLength !== null) {
      const tooBig = ctx.data.length > def.exactLength.value;
      const tooSmall = ctx.data.length < def.exactLength.value;
      if (tooBig || tooSmall) {
        addIssueToContext(ctx, {
          code: tooBig ? ZodIssueCode.too_big : ZodIssueCode.too_small,
          minimum: tooSmall ? def.exactLength.value : void 0,
          maximum: tooBig ? def.exactLength.value : void 0,
          type: "array",
          inclusive: true,
          exact: true,
          message: def.exactLength.message
        });
        status.dirty();
      }
    }
    if (def.minLength !== null) {
      if (ctx.data.length < def.minLength.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_small,
          minimum: def.minLength.value,
          type: "array",
          inclusive: true,
          exact: false,
          message: def.minLength.message
        });
        status.dirty();
      }
    }
    if (def.maxLength !== null) {
      if (ctx.data.length > def.maxLength.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_big,
          maximum: def.maxLength.value,
          type: "array",
          inclusive: true,
          exact: false,
          message: def.maxLength.message
        });
        status.dirty();
      }
    }
    if (ctx.common.async) {
      return Promise.all([...ctx.data].map((item, i) => {
        return def.type._parseAsync(new ParseInputLazyPath(ctx, item, ctx.path, i));
      })).then((result2) => {
        return ParseStatus.mergeArray(status, result2);
      });
    }
    const result = [...ctx.data].map((item, i) => {
      return def.type._parseSync(new ParseInputLazyPath(ctx, item, ctx.path, i));
    });
    return ParseStatus.mergeArray(status, result);
  }
  get element() {
    return this._def.type;
  }
  min(minLength, message2) {
    return new _ZodArray({
      ...this._def,
      minLength: { value: minLength, message: errorUtil.toString(message2) }
    });
  }
  max(maxLength, message2) {
    return new _ZodArray({
      ...this._def,
      maxLength: { value: maxLength, message: errorUtil.toString(message2) }
    });
  }
  length(len, message2) {
    return new _ZodArray({
      ...this._def,
      exactLength: { value: len, message: errorUtil.toString(message2) }
    });
  }
  nonempty(message2) {
    return this.min(1, message2);
  }
};
ZodArray.create = (schema, params) => {
  return new ZodArray({
    type: schema,
    minLength: null,
    maxLength: null,
    exactLength: null,
    typeName: ZodFirstPartyTypeKind.ZodArray,
    ...processCreateParams(params)
  });
};
function deepPartialify(schema) {
  if (schema instanceof ZodObject) {
    const newShape = {};
    for (const key in schema.shape) {
      const fieldSchema = schema.shape[key];
      newShape[key] = ZodOptional.create(deepPartialify(fieldSchema));
    }
    return new ZodObject({
      ...schema._def,
      shape: () => newShape
    });
  } else if (schema instanceof ZodArray) {
    return new ZodArray({
      ...schema._def,
      type: deepPartialify(schema.element)
    });
  } else if (schema instanceof ZodOptional) {
    return ZodOptional.create(deepPartialify(schema.unwrap()));
  } else if (schema instanceof ZodNullable) {
    return ZodNullable.create(deepPartialify(schema.unwrap()));
  } else if (schema instanceof ZodTuple) {
    return ZodTuple.create(schema.items.map((item) => deepPartialify(item)));
  } else {
    return schema;
  }
}
var ZodObject = class _ZodObject extends ZodType {
  constructor() {
    super(...arguments);
    this._cached = null;
    this.nonstrict = this.passthrough;
    this.augment = this.extend;
  }
  _getCached() {
    if (this._cached !== null)
      return this._cached;
    const shape = this._def.shape();
    const keys = util.objectKeys(shape);
    this._cached = { shape, keys };
    return this._cached;
  }
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.object) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.object,
        received: ctx2.parsedType
      });
      return INVALID;
    }
    const { status, ctx } = this._processInputParams(input);
    const { shape, keys: shapeKeys } = this._getCached();
    const extraKeys = [];
    if (!(this._def.catchall instanceof ZodNever && this._def.unknownKeys === "strip")) {
      for (const key in ctx.data) {
        if (!shapeKeys.includes(key)) {
          extraKeys.push(key);
        }
      }
    }
    const pairs = [];
    for (const key of shapeKeys) {
      const keyValidator = shape[key];
      const value = ctx.data[key];
      pairs.push({
        key: { status: "valid", value: key },
        value: keyValidator._parse(new ParseInputLazyPath(ctx, value, ctx.path, key)),
        alwaysSet: key in ctx.data
      });
    }
    if (this._def.catchall instanceof ZodNever) {
      const unknownKeys = this._def.unknownKeys;
      if (unknownKeys === "passthrough") {
        for (const key of extraKeys) {
          pairs.push({
            key: { status: "valid", value: key },
            value: { status: "valid", value: ctx.data[key] }
          });
        }
      } else if (unknownKeys === "strict") {
        if (extraKeys.length > 0) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.unrecognized_keys,
            keys: extraKeys
          });
          status.dirty();
        }
      } else if (unknownKeys === "strip") {
      } else {
        throw new Error(`Internal ZodObject error: invalid unknownKeys value.`);
      }
    } else {
      const catchall = this._def.catchall;
      for (const key of extraKeys) {
        const value = ctx.data[key];
        pairs.push({
          key: { status: "valid", value: key },
          value: catchall._parse(
            new ParseInputLazyPath(ctx, value, ctx.path, key)
            //, ctx.child(key), value, getParsedType(value)
          ),
          alwaysSet: key in ctx.data
        });
      }
    }
    if (ctx.common.async) {
      return Promise.resolve().then(async () => {
        const syncPairs = [];
        for (const pair of pairs) {
          const key = await pair.key;
          const value = await pair.value;
          syncPairs.push({
            key,
            value,
            alwaysSet: pair.alwaysSet
          });
        }
        return syncPairs;
      }).then((syncPairs) => {
        return ParseStatus.mergeObjectSync(status, syncPairs);
      });
    } else {
      return ParseStatus.mergeObjectSync(status, pairs);
    }
  }
  get shape() {
    return this._def.shape();
  }
  strict(message2) {
    errorUtil.errToObj;
    return new _ZodObject({
      ...this._def,
      unknownKeys: "strict",
      ...message2 !== void 0 ? {
        errorMap: (issue, ctx) => {
          const defaultError = this._def.errorMap?.(issue, ctx).message ?? ctx.defaultError;
          if (issue.code === "unrecognized_keys")
            return {
              message: errorUtil.errToObj(message2).message ?? defaultError
            };
          return {
            message: defaultError
          };
        }
      } : {}
    });
  }
  strip() {
    return new _ZodObject({
      ...this._def,
      unknownKeys: "strip"
    });
  }
  passthrough() {
    return new _ZodObject({
      ...this._def,
      unknownKeys: "passthrough"
    });
  }
  // const AugmentFactory =
  //   <Def extends ZodObjectDef>(def: Def) =>
  //   <Augmentation extends ZodRawShape>(
  //     augmentation: Augmentation
  //   ): ZodObject<
  //     extendShape<ReturnType<Def["shape"]>, Augmentation>,
  //     Def["unknownKeys"],
  //     Def["catchall"]
  //   > => {
  //     return new ZodObject({
  //       ...def,
  //       shape: () => ({
  //         ...def.shape(),
  //         ...augmentation,
  //       }),
  //     }) as any;
  //   };
  extend(augmentation) {
    return new _ZodObject({
      ...this._def,
      shape: () => ({
        ...this._def.shape(),
        ...augmentation
      })
    });
  }
  /**
   * Prior to zod@1.0.12 there was a bug in the
   * inferred type of merged objects. Please
   * upgrade if you are experiencing issues.
   */
  merge(merging) {
    const merged = new _ZodObject({
      unknownKeys: merging._def.unknownKeys,
      catchall: merging._def.catchall,
      shape: () => ({
        ...this._def.shape(),
        ...merging._def.shape()
      }),
      typeName: ZodFirstPartyTypeKind.ZodObject
    });
    return merged;
  }
  // merge<
  //   Incoming extends AnyZodObject,
  //   Augmentation extends Incoming["shape"],
  //   NewOutput extends {
  //     [k in keyof Augmentation | keyof Output]: k extends keyof Augmentation
  //       ? Augmentation[k]["_output"]
  //       : k extends keyof Output
  //       ? Output[k]
  //       : never;
  //   },
  //   NewInput extends {
  //     [k in keyof Augmentation | keyof Input]: k extends keyof Augmentation
  //       ? Augmentation[k]["_input"]
  //       : k extends keyof Input
  //       ? Input[k]
  //       : never;
  //   }
  // >(
  //   merging: Incoming
  // ): ZodObject<
  //   extendShape<T, ReturnType<Incoming["_def"]["shape"]>>,
  //   Incoming["_def"]["unknownKeys"],
  //   Incoming["_def"]["catchall"],
  //   NewOutput,
  //   NewInput
  // > {
  //   const merged: any = new ZodObject({
  //     unknownKeys: merging._def.unknownKeys,
  //     catchall: merging._def.catchall,
  //     shape: () =>
  //       objectUtil.mergeShapes(this._def.shape(), merging._def.shape()),
  //     typeName: ZodFirstPartyTypeKind.ZodObject,
  //   }) as any;
  //   return merged;
  // }
  setKey(key, schema) {
    return this.augment({ [key]: schema });
  }
  // merge<Incoming extends AnyZodObject>(
  //   merging: Incoming
  // ): //ZodObject<T & Incoming["_shape"], UnknownKeys, Catchall> = (merging) => {
  // ZodObject<
  //   extendShape<T, ReturnType<Incoming["_def"]["shape"]>>,
  //   Incoming["_def"]["unknownKeys"],
  //   Incoming["_def"]["catchall"]
  // > {
  //   // const mergedShape = objectUtil.mergeShapes(
  //   //   this._def.shape(),
  //   //   merging._def.shape()
  //   // );
  //   const merged: any = new ZodObject({
  //     unknownKeys: merging._def.unknownKeys,
  //     catchall: merging._def.catchall,
  //     shape: () =>
  //       objectUtil.mergeShapes(this._def.shape(), merging._def.shape()),
  //     typeName: ZodFirstPartyTypeKind.ZodObject,
  //   }) as any;
  //   return merged;
  // }
  catchall(index) {
    return new _ZodObject({
      ...this._def,
      catchall: index
    });
  }
  pick(mask) {
    const shape = {};
    for (const key of util.objectKeys(mask)) {
      if (mask[key] && this.shape[key]) {
        shape[key] = this.shape[key];
      }
    }
    return new _ZodObject({
      ...this._def,
      shape: () => shape
    });
  }
  omit(mask) {
    const shape = {};
    for (const key of util.objectKeys(this.shape)) {
      if (!mask[key]) {
        shape[key] = this.shape[key];
      }
    }
    return new _ZodObject({
      ...this._def,
      shape: () => shape
    });
  }
  /**
   * @deprecated
   */
  deepPartial() {
    return deepPartialify(this);
  }
  partial(mask) {
    const newShape = {};
    for (const key of util.objectKeys(this.shape)) {
      const fieldSchema = this.shape[key];
      if (mask && !mask[key]) {
        newShape[key] = fieldSchema;
      } else {
        newShape[key] = fieldSchema.optional();
      }
    }
    return new _ZodObject({
      ...this._def,
      shape: () => newShape
    });
  }
  required(mask) {
    const newShape = {};
    for (const key of util.objectKeys(this.shape)) {
      if (mask && !mask[key]) {
        newShape[key] = this.shape[key];
      } else {
        const fieldSchema = this.shape[key];
        let newField = fieldSchema;
        while (newField instanceof ZodOptional) {
          newField = newField._def.innerType;
        }
        newShape[key] = newField;
      }
    }
    return new _ZodObject({
      ...this._def,
      shape: () => newShape
    });
  }
  keyof() {
    return createZodEnum(util.objectKeys(this.shape));
  }
};
ZodObject.create = (shape, params) => {
  return new ZodObject({
    shape: () => shape,
    unknownKeys: "strip",
    catchall: ZodNever.create(),
    typeName: ZodFirstPartyTypeKind.ZodObject,
    ...processCreateParams(params)
  });
};
ZodObject.strictCreate = (shape, params) => {
  return new ZodObject({
    shape: () => shape,
    unknownKeys: "strict",
    catchall: ZodNever.create(),
    typeName: ZodFirstPartyTypeKind.ZodObject,
    ...processCreateParams(params)
  });
};
ZodObject.lazycreate = (shape, params) => {
  return new ZodObject({
    shape,
    unknownKeys: "strip",
    catchall: ZodNever.create(),
    typeName: ZodFirstPartyTypeKind.ZodObject,
    ...processCreateParams(params)
  });
};
var ZodUnion = class extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const options = this._def.options;
    function handleResults(results) {
      for (const result of results) {
        if (result.result.status === "valid") {
          return result.result;
        }
      }
      for (const result of results) {
        if (result.result.status === "dirty") {
          ctx.common.issues.push(...result.ctx.common.issues);
          return result.result;
        }
      }
      const unionErrors = results.map((result) => new ZodError(result.ctx.common.issues));
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_union,
        unionErrors
      });
      return INVALID;
    }
    if (ctx.common.async) {
      return Promise.all(options.map(async (option) => {
        const childCtx = {
          ...ctx,
          common: {
            ...ctx.common,
            issues: []
          },
          parent: null
        };
        return {
          result: await option._parseAsync({
            data: ctx.data,
            path: ctx.path,
            parent: childCtx
          }),
          ctx: childCtx
        };
      })).then(handleResults);
    } else {
      let dirty = void 0;
      const issues = [];
      for (const option of options) {
        const childCtx = {
          ...ctx,
          common: {
            ...ctx.common,
            issues: []
          },
          parent: null
        };
        const result = option._parseSync({
          data: ctx.data,
          path: ctx.path,
          parent: childCtx
        });
        if (result.status === "valid") {
          return result;
        } else if (result.status === "dirty" && !dirty) {
          dirty = { result, ctx: childCtx };
        }
        if (childCtx.common.issues.length) {
          issues.push(childCtx.common.issues);
        }
      }
      if (dirty) {
        ctx.common.issues.push(...dirty.ctx.common.issues);
        return dirty.result;
      }
      const unionErrors = issues.map((issues2) => new ZodError(issues2));
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_union,
        unionErrors
      });
      return INVALID;
    }
  }
  get options() {
    return this._def.options;
  }
};
ZodUnion.create = (types, params) => {
  return new ZodUnion({
    options: types,
    typeName: ZodFirstPartyTypeKind.ZodUnion,
    ...processCreateParams(params)
  });
};
var getDiscriminator = (type) => {
  if (type instanceof ZodLazy) {
    return getDiscriminator(type.schema);
  } else if (type instanceof ZodEffects) {
    return getDiscriminator(type.innerType());
  } else if (type instanceof ZodLiteral) {
    return [type.value];
  } else if (type instanceof ZodEnum) {
    return type.options;
  } else if (type instanceof ZodNativeEnum) {
    return util.objectValues(type.enum);
  } else if (type instanceof ZodDefault) {
    return getDiscriminator(type._def.innerType);
  } else if (type instanceof ZodUndefined) {
    return [void 0];
  } else if (type instanceof ZodNull) {
    return [null];
  } else if (type instanceof ZodOptional) {
    return [void 0, ...getDiscriminator(type.unwrap())];
  } else if (type instanceof ZodNullable) {
    return [null, ...getDiscriminator(type.unwrap())];
  } else if (type instanceof ZodBranded) {
    return getDiscriminator(type.unwrap());
  } else if (type instanceof ZodReadonly) {
    return getDiscriminator(type.unwrap());
  } else if (type instanceof ZodCatch) {
    return getDiscriminator(type._def.innerType);
  } else {
    return [];
  }
};
var ZodDiscriminatedUnion = class _ZodDiscriminatedUnion extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.object) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.object,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const discriminator = this.discriminator;
    const discriminatorValue = ctx.data[discriminator];
    const option = this.optionsMap.get(discriminatorValue);
    if (!option) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_union_discriminator,
        options: Array.from(this.optionsMap.keys()),
        path: [discriminator]
      });
      return INVALID;
    }
    if (ctx.common.async) {
      return option._parseAsync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      });
    } else {
      return option._parseSync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      });
    }
  }
  get discriminator() {
    return this._def.discriminator;
  }
  get options() {
    return this._def.options;
  }
  get optionsMap() {
    return this._def.optionsMap;
  }
  /**
   * The constructor of the discriminated union schema. Its behaviour is very similar to that of the normal z.union() constructor.
   * However, it only allows a union of objects, all of which need to share a discriminator property. This property must
   * have a different value for each object in the union.
   * @param discriminator the name of the discriminator property
   * @param types an array of object schemas
   * @param params
   */
  static create(discriminator, options, params) {
    const optionsMap = /* @__PURE__ */ new Map();
    for (const type of options) {
      const discriminatorValues = getDiscriminator(type.shape[discriminator]);
      if (!discriminatorValues.length) {
        throw new Error(`A discriminator value for key \`${discriminator}\` could not be extracted from all schema options`);
      }
      for (const value of discriminatorValues) {
        if (optionsMap.has(value)) {
          throw new Error(`Discriminator property ${String(discriminator)} has duplicate value ${String(value)}`);
        }
        optionsMap.set(value, type);
      }
    }
    return new _ZodDiscriminatedUnion({
      typeName: ZodFirstPartyTypeKind.ZodDiscriminatedUnion,
      discriminator,
      options,
      optionsMap,
      ...processCreateParams(params)
    });
  }
};
function mergeValues(a, b) {
  const aType = getParsedType(a);
  const bType = getParsedType(b);
  if (a === b) {
    return { valid: true, data: a };
  } else if (aType === ZodParsedType.object && bType === ZodParsedType.object) {
    const bKeys = util.objectKeys(b);
    const sharedKeys = util.objectKeys(a).filter((key) => bKeys.indexOf(key) !== -1);
    const newObj = { ...a, ...b };
    for (const key of sharedKeys) {
      const sharedValue = mergeValues(a[key], b[key]);
      if (!sharedValue.valid) {
        return { valid: false };
      }
      newObj[key] = sharedValue.data;
    }
    return { valid: true, data: newObj };
  } else if (aType === ZodParsedType.array && bType === ZodParsedType.array) {
    if (a.length !== b.length) {
      return { valid: false };
    }
    const newArray = [];
    for (let index = 0; index < a.length; index++) {
      const itemA = a[index];
      const itemB = b[index];
      const sharedValue = mergeValues(itemA, itemB);
      if (!sharedValue.valid) {
        return { valid: false };
      }
      newArray.push(sharedValue.data);
    }
    return { valid: true, data: newArray };
  } else if (aType === ZodParsedType.date && bType === ZodParsedType.date && +a === +b) {
    return { valid: true, data: a };
  } else {
    return { valid: false };
  }
}
var ZodIntersection = class extends ZodType {
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    const handleParsed = (parsedLeft, parsedRight) => {
      if (isAborted(parsedLeft) || isAborted(parsedRight)) {
        return INVALID;
      }
      const merged = mergeValues(parsedLeft.value, parsedRight.value);
      if (!merged.valid) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.invalid_intersection_types
        });
        return INVALID;
      }
      if (isDirty(parsedLeft) || isDirty(parsedRight)) {
        status.dirty();
      }
      return { status: status.value, value: merged.data };
    };
    if (ctx.common.async) {
      return Promise.all([
        this._def.left._parseAsync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        }),
        this._def.right._parseAsync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        })
      ]).then(([left, right]) => handleParsed(left, right));
    } else {
      return handleParsed(this._def.left._parseSync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      }), this._def.right._parseSync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      }));
    }
  }
};
ZodIntersection.create = (left, right, params) => {
  return new ZodIntersection({
    left,
    right,
    typeName: ZodFirstPartyTypeKind.ZodIntersection,
    ...processCreateParams(params)
  });
};
var ZodTuple = class _ZodTuple extends ZodType {
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.array) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.array,
        received: ctx.parsedType
      });
      return INVALID;
    }
    if (ctx.data.length < this._def.items.length) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.too_small,
        minimum: this._def.items.length,
        inclusive: true,
        exact: false,
        type: "array"
      });
      return INVALID;
    }
    const rest = this._def.rest;
    if (!rest && ctx.data.length > this._def.items.length) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.too_big,
        maximum: this._def.items.length,
        inclusive: true,
        exact: false,
        type: "array"
      });
      status.dirty();
    }
    const items = [...ctx.data].map((item, itemIndex) => {
      const schema = this._def.items[itemIndex] || this._def.rest;
      if (!schema)
        return null;
      return schema._parse(new ParseInputLazyPath(ctx, item, ctx.path, itemIndex));
    }).filter((x) => !!x);
    if (ctx.common.async) {
      return Promise.all(items).then((results) => {
        return ParseStatus.mergeArray(status, results);
      });
    } else {
      return ParseStatus.mergeArray(status, items);
    }
  }
  get items() {
    return this._def.items;
  }
  rest(rest) {
    return new _ZodTuple({
      ...this._def,
      rest
    });
  }
};
ZodTuple.create = (schemas, params) => {
  if (!Array.isArray(schemas)) {
    throw new Error("You must pass an array of schemas to z.tuple([ ... ])");
  }
  return new ZodTuple({
    items: schemas,
    typeName: ZodFirstPartyTypeKind.ZodTuple,
    rest: null,
    ...processCreateParams(params)
  });
};
var ZodRecord = class _ZodRecord extends ZodType {
  get keySchema() {
    return this._def.keyType;
  }
  get valueSchema() {
    return this._def.valueType;
  }
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.object) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.object,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const pairs = [];
    const keyType = this._def.keyType;
    const valueType = this._def.valueType;
    for (const key in ctx.data) {
      pairs.push({
        key: keyType._parse(new ParseInputLazyPath(ctx, key, ctx.path, key)),
        value: valueType._parse(new ParseInputLazyPath(ctx, ctx.data[key], ctx.path, key)),
        alwaysSet: key in ctx.data
      });
    }
    if (ctx.common.async) {
      return ParseStatus.mergeObjectAsync(status, pairs);
    } else {
      return ParseStatus.mergeObjectSync(status, pairs);
    }
  }
  get element() {
    return this._def.valueType;
  }
  static create(first, second, third) {
    if (second instanceof ZodType) {
      return new _ZodRecord({
        keyType: first,
        valueType: second,
        typeName: ZodFirstPartyTypeKind.ZodRecord,
        ...processCreateParams(third)
      });
    }
    return new _ZodRecord({
      keyType: ZodString.create(),
      valueType: first,
      typeName: ZodFirstPartyTypeKind.ZodRecord,
      ...processCreateParams(second)
    });
  }
};
var ZodMap = class extends ZodType {
  get keySchema() {
    return this._def.keyType;
  }
  get valueSchema() {
    return this._def.valueType;
  }
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.map) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.map,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const keyType = this._def.keyType;
    const valueType = this._def.valueType;
    const pairs = [...ctx.data.entries()].map(([key, value], index) => {
      return {
        key: keyType._parse(new ParseInputLazyPath(ctx, key, ctx.path, [index, "key"])),
        value: valueType._parse(new ParseInputLazyPath(ctx, value, ctx.path, [index, "value"]))
      };
    });
    if (ctx.common.async) {
      const finalMap = /* @__PURE__ */ new Map();
      return Promise.resolve().then(async () => {
        for (const pair of pairs) {
          const key = await pair.key;
          const value = await pair.value;
          if (key.status === "aborted" || value.status === "aborted") {
            return INVALID;
          }
          if (key.status === "dirty" || value.status === "dirty") {
            status.dirty();
          }
          finalMap.set(key.value, value.value);
        }
        return { status: status.value, value: finalMap };
      });
    } else {
      const finalMap = /* @__PURE__ */ new Map();
      for (const pair of pairs) {
        const key = pair.key;
        const value = pair.value;
        if (key.status === "aborted" || value.status === "aborted") {
          return INVALID;
        }
        if (key.status === "dirty" || value.status === "dirty") {
          status.dirty();
        }
        finalMap.set(key.value, value.value);
      }
      return { status: status.value, value: finalMap };
    }
  }
};
ZodMap.create = (keyType, valueType, params) => {
  return new ZodMap({
    valueType,
    keyType,
    typeName: ZodFirstPartyTypeKind.ZodMap,
    ...processCreateParams(params)
  });
};
var ZodSet = class _ZodSet extends ZodType {
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.set) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.set,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const def = this._def;
    if (def.minSize !== null) {
      if (ctx.data.size < def.minSize.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_small,
          minimum: def.minSize.value,
          type: "set",
          inclusive: true,
          exact: false,
          message: def.minSize.message
        });
        status.dirty();
      }
    }
    if (def.maxSize !== null) {
      if (ctx.data.size > def.maxSize.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_big,
          maximum: def.maxSize.value,
          type: "set",
          inclusive: true,
          exact: false,
          message: def.maxSize.message
        });
        status.dirty();
      }
    }
    const valueType = this._def.valueType;
    function finalizeSet(elements2) {
      const parsedSet = /* @__PURE__ */ new Set();
      for (const element of elements2) {
        if (element.status === "aborted")
          return INVALID;
        if (element.status === "dirty")
          status.dirty();
        parsedSet.add(element.value);
      }
      return { status: status.value, value: parsedSet };
    }
    const elements = [...ctx.data.values()].map((item, i) => valueType._parse(new ParseInputLazyPath(ctx, item, ctx.path, i)));
    if (ctx.common.async) {
      return Promise.all(elements).then((elements2) => finalizeSet(elements2));
    } else {
      return finalizeSet(elements);
    }
  }
  min(minSize, message2) {
    return new _ZodSet({
      ...this._def,
      minSize: { value: minSize, message: errorUtil.toString(message2) }
    });
  }
  max(maxSize, message2) {
    return new _ZodSet({
      ...this._def,
      maxSize: { value: maxSize, message: errorUtil.toString(message2) }
    });
  }
  size(size, message2) {
    return this.min(size, message2).max(size, message2);
  }
  nonempty(message2) {
    return this.min(1, message2);
  }
};
ZodSet.create = (valueType, params) => {
  return new ZodSet({
    valueType,
    minSize: null,
    maxSize: null,
    typeName: ZodFirstPartyTypeKind.ZodSet,
    ...processCreateParams(params)
  });
};
var ZodFunction = class _ZodFunction extends ZodType {
  constructor() {
    super(...arguments);
    this.validate = this.implement;
  }
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.function) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.function,
        received: ctx.parsedType
      });
      return INVALID;
    }
    function makeArgsIssue(args, error) {
      return makeIssue({
        data: args,
        path: ctx.path,
        errorMaps: [ctx.common.contextualErrorMap, ctx.schemaErrorMap, getErrorMap(), en_default].filter((x) => !!x),
        issueData: {
          code: ZodIssueCode.invalid_arguments,
          argumentsError: error
        }
      });
    }
    function makeReturnsIssue(returns, error) {
      return makeIssue({
        data: returns,
        path: ctx.path,
        errorMaps: [ctx.common.contextualErrorMap, ctx.schemaErrorMap, getErrorMap(), en_default].filter((x) => !!x),
        issueData: {
          code: ZodIssueCode.invalid_return_type,
          returnTypeError: error
        }
      });
    }
    const params = { errorMap: ctx.common.contextualErrorMap };
    const fn = ctx.data;
    if (this._def.returns instanceof ZodPromise) {
      const me = this;
      return OK(async function(...args) {
        const error = new ZodError([]);
        const parsedArgs = await me._def.args.parseAsync(args, params).catch((e) => {
          error.addIssue(makeArgsIssue(args, e));
          throw error;
        });
        const result = await Reflect.apply(fn, this, parsedArgs);
        const parsedReturns = await me._def.returns._def.type.parseAsync(result, params).catch((e) => {
          error.addIssue(makeReturnsIssue(result, e));
          throw error;
        });
        return parsedReturns;
      });
    } else {
      const me = this;
      return OK(function(...args) {
        const parsedArgs = me._def.args.safeParse(args, params);
        if (!parsedArgs.success) {
          throw new ZodError([makeArgsIssue(args, parsedArgs.error)]);
        }
        const result = Reflect.apply(fn, this, parsedArgs.data);
        const parsedReturns = me._def.returns.safeParse(result, params);
        if (!parsedReturns.success) {
          throw new ZodError([makeReturnsIssue(result, parsedReturns.error)]);
        }
        return parsedReturns.data;
      });
    }
  }
  parameters() {
    return this._def.args;
  }
  returnType() {
    return this._def.returns;
  }
  args(...items) {
    return new _ZodFunction({
      ...this._def,
      args: ZodTuple.create(items).rest(ZodUnknown.create())
    });
  }
  returns(returnType) {
    return new _ZodFunction({
      ...this._def,
      returns: returnType
    });
  }
  implement(func) {
    const validatedFunc = this.parse(func);
    return validatedFunc;
  }
  strictImplement(func) {
    const validatedFunc = this.parse(func);
    return validatedFunc;
  }
  static create(args, returns, params) {
    return new _ZodFunction({
      args: args ? args : ZodTuple.create([]).rest(ZodUnknown.create()),
      returns: returns || ZodUnknown.create(),
      typeName: ZodFirstPartyTypeKind.ZodFunction,
      ...processCreateParams(params)
    });
  }
};
var ZodLazy = class extends ZodType {
  get schema() {
    return this._def.getter();
  }
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const lazySchema = this._def.getter();
    return lazySchema._parse({ data: ctx.data, path: ctx.path, parent: ctx });
  }
};
ZodLazy.create = (getter, params) => {
  return new ZodLazy({
    getter,
    typeName: ZodFirstPartyTypeKind.ZodLazy,
    ...processCreateParams(params)
  });
};
var ZodLiteral = class extends ZodType {
  _parse(input) {
    if (input.data !== this._def.value) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        received: ctx.data,
        code: ZodIssueCode.invalid_literal,
        expected: this._def.value
      });
      return INVALID;
    }
    return { status: "valid", value: input.data };
  }
  get value() {
    return this._def.value;
  }
};
ZodLiteral.create = (value, params) => {
  return new ZodLiteral({
    value,
    typeName: ZodFirstPartyTypeKind.ZodLiteral,
    ...processCreateParams(params)
  });
};
function createZodEnum(values, params) {
  return new ZodEnum({
    values,
    typeName: ZodFirstPartyTypeKind.ZodEnum,
    ...processCreateParams(params)
  });
}
var ZodEnum = class _ZodEnum extends ZodType {
  _parse(input) {
    if (typeof input.data !== "string") {
      const ctx = this._getOrReturnCtx(input);
      const expectedValues = this._def.values;
      addIssueToContext(ctx, {
        expected: util.joinValues(expectedValues),
        received: ctx.parsedType,
        code: ZodIssueCode.invalid_type
      });
      return INVALID;
    }
    if (!this._cache) {
      this._cache = new Set(this._def.values);
    }
    if (!this._cache.has(input.data)) {
      const ctx = this._getOrReturnCtx(input);
      const expectedValues = this._def.values;
      addIssueToContext(ctx, {
        received: ctx.data,
        code: ZodIssueCode.invalid_enum_value,
        options: expectedValues
      });
      return INVALID;
    }
    return OK(input.data);
  }
  get options() {
    return this._def.values;
  }
  get enum() {
    const enumValues = {};
    for (const val of this._def.values) {
      enumValues[val] = val;
    }
    return enumValues;
  }
  get Values() {
    const enumValues = {};
    for (const val of this._def.values) {
      enumValues[val] = val;
    }
    return enumValues;
  }
  get Enum() {
    const enumValues = {};
    for (const val of this._def.values) {
      enumValues[val] = val;
    }
    return enumValues;
  }
  extract(values, newDef = this._def) {
    return _ZodEnum.create(values, {
      ...this._def,
      ...newDef
    });
  }
  exclude(values, newDef = this._def) {
    return _ZodEnum.create(this.options.filter((opt) => !values.includes(opt)), {
      ...this._def,
      ...newDef
    });
  }
};
ZodEnum.create = createZodEnum;
var ZodNativeEnum = class extends ZodType {
  _parse(input) {
    const nativeEnumValues = util.getValidEnumValues(this._def.values);
    const ctx = this._getOrReturnCtx(input);
    if (ctx.parsedType !== ZodParsedType.string && ctx.parsedType !== ZodParsedType.number) {
      const expectedValues = util.objectValues(nativeEnumValues);
      addIssueToContext(ctx, {
        expected: util.joinValues(expectedValues),
        received: ctx.parsedType,
        code: ZodIssueCode.invalid_type
      });
      return INVALID;
    }
    if (!this._cache) {
      this._cache = new Set(util.getValidEnumValues(this._def.values));
    }
    if (!this._cache.has(input.data)) {
      const expectedValues = util.objectValues(nativeEnumValues);
      addIssueToContext(ctx, {
        received: ctx.data,
        code: ZodIssueCode.invalid_enum_value,
        options: expectedValues
      });
      return INVALID;
    }
    return OK(input.data);
  }
  get enum() {
    return this._def.values;
  }
};
ZodNativeEnum.create = (values, params) => {
  return new ZodNativeEnum({
    values,
    typeName: ZodFirstPartyTypeKind.ZodNativeEnum,
    ...processCreateParams(params)
  });
};
var ZodPromise = class extends ZodType {
  unwrap() {
    return this._def.type;
  }
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.promise && ctx.common.async === false) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.promise,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const promisified = ctx.parsedType === ZodParsedType.promise ? ctx.data : Promise.resolve(ctx.data);
    return OK(promisified.then((data) => {
      return this._def.type.parseAsync(data, {
        path: ctx.path,
        errorMap: ctx.common.contextualErrorMap
      });
    }));
  }
};
ZodPromise.create = (schema, params) => {
  return new ZodPromise({
    type: schema,
    typeName: ZodFirstPartyTypeKind.ZodPromise,
    ...processCreateParams(params)
  });
};
var ZodEffects = class extends ZodType {
  innerType() {
    return this._def.schema;
  }
  sourceType() {
    return this._def.schema._def.typeName === ZodFirstPartyTypeKind.ZodEffects ? this._def.schema.sourceType() : this._def.schema;
  }
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    const effect = this._def.effect || null;
    const checkCtx = {
      addIssue: (arg) => {
        addIssueToContext(ctx, arg);
        if (arg.fatal) {
          status.abort();
        } else {
          status.dirty();
        }
      },
      get path() {
        return ctx.path;
      }
    };
    checkCtx.addIssue = checkCtx.addIssue.bind(checkCtx);
    if (effect.type === "preprocess") {
      const processed = effect.transform(ctx.data, checkCtx);
      if (ctx.common.async) {
        return Promise.resolve(processed).then(async (processed2) => {
          if (status.value === "aborted")
            return INVALID;
          const result = await this._def.schema._parseAsync({
            data: processed2,
            path: ctx.path,
            parent: ctx
          });
          if (result.status === "aborted")
            return INVALID;
          if (result.status === "dirty")
            return DIRTY(result.value);
          if (status.value === "dirty")
            return DIRTY(result.value);
          return result;
        });
      } else {
        if (status.value === "aborted")
          return INVALID;
        const result = this._def.schema._parseSync({
          data: processed,
          path: ctx.path,
          parent: ctx
        });
        if (result.status === "aborted")
          return INVALID;
        if (result.status === "dirty")
          return DIRTY(result.value);
        if (status.value === "dirty")
          return DIRTY(result.value);
        return result;
      }
    }
    if (effect.type === "refinement") {
      const executeRefinement = (acc) => {
        const result = effect.refinement(acc, checkCtx);
        if (ctx.common.async) {
          return Promise.resolve(result);
        }
        if (result instanceof Promise) {
          throw new Error("Async refinement encountered during synchronous parse operation. Use .parseAsync instead.");
        }
        return acc;
      };
      if (ctx.common.async === false) {
        const inner = this._def.schema._parseSync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        });
        if (inner.status === "aborted")
          return INVALID;
        if (inner.status === "dirty")
          status.dirty();
        executeRefinement(inner.value);
        return { status: status.value, value: inner.value };
      } else {
        return this._def.schema._parseAsync({ data: ctx.data, path: ctx.path, parent: ctx }).then((inner) => {
          if (inner.status === "aborted")
            return INVALID;
          if (inner.status === "dirty")
            status.dirty();
          return executeRefinement(inner.value).then(() => {
            return { status: status.value, value: inner.value };
          });
        });
      }
    }
    if (effect.type === "transform") {
      if (ctx.common.async === false) {
        const base = this._def.schema._parseSync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        });
        if (!isValid(base))
          return INVALID;
        const result = effect.transform(base.value, checkCtx);
        if (result instanceof Promise) {
          throw new Error(`Asynchronous transform encountered during synchronous parse operation. Use .parseAsync instead.`);
        }
        return { status: status.value, value: result };
      } else {
        return this._def.schema._parseAsync({ data: ctx.data, path: ctx.path, parent: ctx }).then((base) => {
          if (!isValid(base))
            return INVALID;
          return Promise.resolve(effect.transform(base.value, checkCtx)).then((result) => ({
            status: status.value,
            value: result
          }));
        });
      }
    }
    util.assertNever(effect);
  }
};
ZodEffects.create = (schema, effect, params) => {
  return new ZodEffects({
    schema,
    typeName: ZodFirstPartyTypeKind.ZodEffects,
    effect,
    ...processCreateParams(params)
  });
};
ZodEffects.createWithPreprocess = (preprocess, schema, params) => {
  return new ZodEffects({
    schema,
    effect: { type: "preprocess", transform: preprocess },
    typeName: ZodFirstPartyTypeKind.ZodEffects,
    ...processCreateParams(params)
  });
};
var ZodOptional = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType === ZodParsedType.undefined) {
      return OK(void 0);
    }
    return this._def.innerType._parse(input);
  }
  unwrap() {
    return this._def.innerType;
  }
};
ZodOptional.create = (type, params) => {
  return new ZodOptional({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodOptional,
    ...processCreateParams(params)
  });
};
var ZodNullable = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType === ZodParsedType.null) {
      return OK(null);
    }
    return this._def.innerType._parse(input);
  }
  unwrap() {
    return this._def.innerType;
  }
};
ZodNullable.create = (type, params) => {
  return new ZodNullable({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodNullable,
    ...processCreateParams(params)
  });
};
var ZodDefault = class extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    let data = ctx.data;
    if (ctx.parsedType === ZodParsedType.undefined) {
      data = this._def.defaultValue();
    }
    return this._def.innerType._parse({
      data,
      path: ctx.path,
      parent: ctx
    });
  }
  removeDefault() {
    return this._def.innerType;
  }
};
ZodDefault.create = (type, params) => {
  return new ZodDefault({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodDefault,
    defaultValue: typeof params.default === "function" ? params.default : () => params.default,
    ...processCreateParams(params)
  });
};
var ZodCatch = class extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const newCtx = {
      ...ctx,
      common: {
        ...ctx.common,
        issues: []
      }
    };
    const result = this._def.innerType._parse({
      data: newCtx.data,
      path: newCtx.path,
      parent: {
        ...newCtx
      }
    });
    if (isAsync(result)) {
      return result.then((result2) => {
        return {
          status: "valid",
          value: result2.status === "valid" ? result2.value : this._def.catchValue({
            get error() {
              return new ZodError(newCtx.common.issues);
            },
            input: newCtx.data
          })
        };
      });
    } else {
      return {
        status: "valid",
        value: result.status === "valid" ? result.value : this._def.catchValue({
          get error() {
            return new ZodError(newCtx.common.issues);
          },
          input: newCtx.data
        })
      };
    }
  }
  removeCatch() {
    return this._def.innerType;
  }
};
ZodCatch.create = (type, params) => {
  return new ZodCatch({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodCatch,
    catchValue: typeof params.catch === "function" ? params.catch : () => params.catch,
    ...processCreateParams(params)
  });
};
var ZodNaN = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.nan) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.nan,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return { status: "valid", value: input.data };
  }
};
ZodNaN.create = (params) => {
  return new ZodNaN({
    typeName: ZodFirstPartyTypeKind.ZodNaN,
    ...processCreateParams(params)
  });
};
var BRAND = Symbol("zod_brand");
var ZodBranded = class extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const data = ctx.data;
    return this._def.type._parse({
      data,
      path: ctx.path,
      parent: ctx
    });
  }
  unwrap() {
    return this._def.type;
  }
};
var ZodPipeline = class _ZodPipeline extends ZodType {
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.common.async) {
      const handleAsync = async () => {
        const inResult = await this._def.in._parseAsync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        });
        if (inResult.status === "aborted")
          return INVALID;
        if (inResult.status === "dirty") {
          status.dirty();
          return DIRTY(inResult.value);
        } else {
          return this._def.out._parseAsync({
            data: inResult.value,
            path: ctx.path,
            parent: ctx
          });
        }
      };
      return handleAsync();
    } else {
      const inResult = this._def.in._parseSync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      });
      if (inResult.status === "aborted")
        return INVALID;
      if (inResult.status === "dirty") {
        status.dirty();
        return {
          status: "dirty",
          value: inResult.value
        };
      } else {
        return this._def.out._parseSync({
          data: inResult.value,
          path: ctx.path,
          parent: ctx
        });
      }
    }
  }
  static create(a, b) {
    return new _ZodPipeline({
      in: a,
      out: b,
      typeName: ZodFirstPartyTypeKind.ZodPipeline
    });
  }
};
var ZodReadonly = class extends ZodType {
  _parse(input) {
    const result = this._def.innerType._parse(input);
    const freeze = (data) => {
      if (isValid(data)) {
        data.value = Object.freeze(data.value);
      }
      return data;
    };
    return isAsync(result) ? result.then((data) => freeze(data)) : freeze(result);
  }
  unwrap() {
    return this._def.innerType;
  }
};
ZodReadonly.create = (type, params) => {
  return new ZodReadonly({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodReadonly,
    ...processCreateParams(params)
  });
};
function cleanParams(params, data) {
  const p = typeof params === "function" ? params(data) : typeof params === "string" ? { message: params } : params;
  const p2 = typeof p === "string" ? { message: p } : p;
  return p2;
}
function custom(check, _params = {}, fatal) {
  if (check)
    return ZodAny.create().superRefine((data, ctx) => {
      const r = check(data);
      if (r instanceof Promise) {
        return r.then((r2) => {
          if (!r2) {
            const params = cleanParams(_params, data);
            const _fatal = params.fatal ?? fatal ?? true;
            ctx.addIssue({ code: "custom", ...params, fatal: _fatal });
          }
        });
      }
      if (!r) {
        const params = cleanParams(_params, data);
        const _fatal = params.fatal ?? fatal ?? true;
        ctx.addIssue({ code: "custom", ...params, fatal: _fatal });
      }
      return;
    });
  return ZodAny.create();
}
var late = {
  object: ZodObject.lazycreate
};
var ZodFirstPartyTypeKind;
(function(ZodFirstPartyTypeKind2) {
  ZodFirstPartyTypeKind2["ZodString"] = "ZodString";
  ZodFirstPartyTypeKind2["ZodNumber"] = "ZodNumber";
  ZodFirstPartyTypeKind2["ZodNaN"] = "ZodNaN";
  ZodFirstPartyTypeKind2["ZodBigInt"] = "ZodBigInt";
  ZodFirstPartyTypeKind2["ZodBoolean"] = "ZodBoolean";
  ZodFirstPartyTypeKind2["ZodDate"] = "ZodDate";
  ZodFirstPartyTypeKind2["ZodSymbol"] = "ZodSymbol";
  ZodFirstPartyTypeKind2["ZodUndefined"] = "ZodUndefined";
  ZodFirstPartyTypeKind2["ZodNull"] = "ZodNull";
  ZodFirstPartyTypeKind2["ZodAny"] = "ZodAny";
  ZodFirstPartyTypeKind2["ZodUnknown"] = "ZodUnknown";
  ZodFirstPartyTypeKind2["ZodNever"] = "ZodNever";
  ZodFirstPartyTypeKind2["ZodVoid"] = "ZodVoid";
  ZodFirstPartyTypeKind2["ZodArray"] = "ZodArray";
  ZodFirstPartyTypeKind2["ZodObject"] = "ZodObject";
  ZodFirstPartyTypeKind2["ZodUnion"] = "ZodUnion";
  ZodFirstPartyTypeKind2["ZodDiscriminatedUnion"] = "ZodDiscriminatedUnion";
  ZodFirstPartyTypeKind2["ZodIntersection"] = "ZodIntersection";
  ZodFirstPartyTypeKind2["ZodTuple"] = "ZodTuple";
  ZodFirstPartyTypeKind2["ZodRecord"] = "ZodRecord";
  ZodFirstPartyTypeKind2["ZodMap"] = "ZodMap";
  ZodFirstPartyTypeKind2["ZodSet"] = "ZodSet";
  ZodFirstPartyTypeKind2["ZodFunction"] = "ZodFunction";
  ZodFirstPartyTypeKind2["ZodLazy"] = "ZodLazy";
  ZodFirstPartyTypeKind2["ZodLiteral"] = "ZodLiteral";
  ZodFirstPartyTypeKind2["ZodEnum"] = "ZodEnum";
  ZodFirstPartyTypeKind2["ZodEffects"] = "ZodEffects";
  ZodFirstPartyTypeKind2["ZodNativeEnum"] = "ZodNativeEnum";
  ZodFirstPartyTypeKind2["ZodOptional"] = "ZodOptional";
  ZodFirstPartyTypeKind2["ZodNullable"] = "ZodNullable";
  ZodFirstPartyTypeKind2["ZodDefault"] = "ZodDefault";
  ZodFirstPartyTypeKind2["ZodCatch"] = "ZodCatch";
  ZodFirstPartyTypeKind2["ZodPromise"] = "ZodPromise";
  ZodFirstPartyTypeKind2["ZodBranded"] = "ZodBranded";
  ZodFirstPartyTypeKind2["ZodPipeline"] = "ZodPipeline";
  ZodFirstPartyTypeKind2["ZodReadonly"] = "ZodReadonly";
})(ZodFirstPartyTypeKind || (ZodFirstPartyTypeKind = {}));
var instanceOfType = (cls, params = {
  message: `Input not instance of ${cls.name}`
}) => custom((data) => data instanceof cls, params);
var stringType = ZodString.create;
var numberType = ZodNumber.create;
var nanType = ZodNaN.create;
var bigIntType = ZodBigInt.create;
var booleanType = ZodBoolean.create;
var dateType = ZodDate.create;
var symbolType = ZodSymbol.create;
var undefinedType = ZodUndefined.create;
var nullType = ZodNull.create;
var anyType = ZodAny.create;
var unknownType = ZodUnknown.create;
var neverType = ZodNever.create;
var voidType = ZodVoid.create;
var arrayType = ZodArray.create;
var objectType = ZodObject.create;
var strictObjectType = ZodObject.strictCreate;
var unionType = ZodUnion.create;
var discriminatedUnionType = ZodDiscriminatedUnion.create;
var intersectionType = ZodIntersection.create;
var tupleType = ZodTuple.create;
var recordType = ZodRecord.create;
var mapType = ZodMap.create;
var setType = ZodSet.create;
var functionType = ZodFunction.create;
var lazyType = ZodLazy.create;
var literalType = ZodLiteral.create;
var enumType = ZodEnum.create;
var nativeEnumType = ZodNativeEnum.create;
var promiseType = ZodPromise.create;
var effectsType = ZodEffects.create;
var optionalType = ZodOptional.create;
var nullableType = ZodNullable.create;
var preprocessType = ZodEffects.createWithPreprocess;
var pipelineType = ZodPipeline.create;
var ostring = () => stringType().optional();
var onumber = () => numberType().optional();
var oboolean = () => booleanType().optional();
var coerce = {
  string: ((arg) => ZodString.create({ ...arg, coerce: true })),
  number: ((arg) => ZodNumber.create({ ...arg, coerce: true })),
  boolean: ((arg) => ZodBoolean.create({
    ...arg,
    coerce: true
  })),
  bigint: ((arg) => ZodBigInt.create({ ...arg, coerce: true })),
  date: ((arg) => ZodDate.create({ ...arg, coerce: true }))
};
var NEVER = INVALID;

// node_modules/drizzle-zod/index.mjs
var CONSTANTS = {
  INT8_MIN: -128,
  INT8_MAX: 127,
  INT8_UNSIGNED_MAX: 255,
  INT16_MIN: -32768,
  INT16_MAX: 32767,
  INT16_UNSIGNED_MAX: 65535,
  INT24_MIN: -8388608,
  INT24_MAX: 8388607,
  INT24_UNSIGNED_MAX: 16777215,
  INT32_MIN: -2147483648,
  INT32_MAX: 2147483647,
  INT32_UNSIGNED_MAX: 4294967295,
  INT48_MIN: -140737488355328,
  INT48_MAX: 140737488355327,
  INT48_UNSIGNED_MAX: 281474976710655,
  INT64_MIN: -9223372036854775808n,
  INT64_MAX: 9223372036854775807n,
  INT64_UNSIGNED_MAX: 18446744073709551615n
};
function isColumnType(column, columnTypes) {
  return columnTypes.includes(column.columnType);
}
function isWithEnum(column) {
  return "enumValues" in column && Array.isArray(column.enumValues) && column.enumValues.length > 0;
}
var literalSchema = external_exports.union([external_exports.string(), external_exports.number(), external_exports.boolean(), external_exports.null()]);
var jsonSchema = external_exports.union([literalSchema, external_exports.record(external_exports.any()), external_exports.array(external_exports.any())]);
var bufferSchema = external_exports.custom((v) => v instanceof Buffer);
function columnToSchema(column, factory) {
  const z$1 = factory?.zodInstance ?? external_exports;
  const coerce2 = factory?.coerce ?? {};
  let schema;
  if (isWithEnum(column)) {
    schema = column.enumValues.length ? z$1.enum(column.enumValues) : z$1.string();
  }
  if (!schema) {
    if (isColumnType(column, ["PgGeometry", "PgPointTuple"])) {
      schema = z$1.tuple([z$1.number(), z$1.number()]);
    } else if (isColumnType(column, ["PgGeometryObject", "PgPointObject"])) {
      schema = z$1.object({ x: z$1.number(), y: z$1.number() });
    } else if (isColumnType(column, ["PgHalfVector", "PgVector"])) {
      schema = z$1.array(z$1.number());
      schema = column.dimensions ? schema.length(column.dimensions) : schema;
    } else if (isColumnType(column, ["PgLine"])) {
      schema = z$1.tuple([z$1.number(), z$1.number(), z$1.number()]);
    } else if (isColumnType(column, ["PgLineABC"])) {
      schema = z$1.object({
        a: z$1.number(),
        b: z$1.number(),
        c: z$1.number()
      });
    } else if (isColumnType(column, ["PgArray"])) {
      schema = z$1.array(columnToSchema(column.baseColumn, z$1));
      schema = column.size ? schema.length(column.size) : schema;
    } else if (column.dataType === "array") {
      schema = z$1.array(z$1.any());
    } else if (column.dataType === "number") {
      schema = numberColumnToSchema(column, z$1, coerce2);
    } else if (column.dataType === "bigint") {
      schema = bigintColumnToSchema(column, z$1, coerce2);
    } else if (column.dataType === "boolean") {
      schema = coerce2 === true || coerce2.boolean ? z$1.coerce.boolean() : z$1.boolean();
    } else if (column.dataType === "date") {
      schema = coerce2 === true || coerce2.date ? z$1.coerce.date() : z$1.date();
    } else if (column.dataType === "string") {
      schema = stringColumnToSchema(column, z$1, coerce2);
    } else if (column.dataType === "json") {
      schema = jsonSchema;
    } else if (column.dataType === "custom") {
      schema = z$1.any();
    } else if (column.dataType === "buffer") {
      schema = bufferSchema;
    }
  }
  if (!schema) {
    schema = z$1.any();
  }
  return schema;
}
function numberColumnToSchema(column, z, coerce2) {
  let unsigned = column.getSQLType().includes("unsigned");
  let min;
  let max;
  let integer2 = false;
  if (isColumnType(column, ["MySqlTinyInt", "SingleStoreTinyInt"])) {
    min = unsigned ? 0 : CONSTANTS.INT8_MIN;
    max = unsigned ? CONSTANTS.INT8_UNSIGNED_MAX : CONSTANTS.INT8_MAX;
    integer2 = true;
  } else if (isColumnType(column, [
    "PgSmallInt",
    "PgSmallSerial",
    "MySqlSmallInt",
    "SingleStoreSmallInt"
  ])) {
    min = unsigned ? 0 : CONSTANTS.INT16_MIN;
    max = unsigned ? CONSTANTS.INT16_UNSIGNED_MAX : CONSTANTS.INT16_MAX;
    integer2 = true;
  } else if (isColumnType(column, [
    "PgReal",
    "MySqlFloat",
    "MySqlMediumInt",
    "SingleStoreMediumInt",
    "SingleStoreFloat"
  ])) {
    min = unsigned ? 0 : CONSTANTS.INT24_MIN;
    max = unsigned ? CONSTANTS.INT24_UNSIGNED_MAX : CONSTANTS.INT24_MAX;
    integer2 = isColumnType(column, ["MySqlMediumInt", "SingleStoreMediumInt"]);
  } else if (isColumnType(column, [
    "PgInteger",
    "PgSerial",
    "MySqlInt",
    "SingleStoreInt"
  ])) {
    min = unsigned ? 0 : CONSTANTS.INT32_MIN;
    max = unsigned ? CONSTANTS.INT32_UNSIGNED_MAX : CONSTANTS.INT32_MAX;
    integer2 = true;
  } else if (isColumnType(column, [
    "PgDoublePrecision",
    "MySqlReal",
    "MySqlDouble",
    "SingleStoreReal",
    "SingleStoreDouble",
    "SQLiteReal"
  ])) {
    min = unsigned ? 0 : CONSTANTS.INT48_MIN;
    max = unsigned ? CONSTANTS.INT48_UNSIGNED_MAX : CONSTANTS.INT48_MAX;
  } else if (isColumnType(column, [
    "PgBigInt53",
    "PgBigSerial53",
    "MySqlBigInt53",
    "MySqlSerial",
    "SingleStoreBigInt53",
    "SingleStoreSerial",
    "SQLiteInteger"
  ])) {
    unsigned = unsigned || isColumnType(column, ["MySqlSerial", "SingleStoreSerial"]);
    min = unsigned ? 0 : Number.MIN_SAFE_INTEGER;
    max = Number.MAX_SAFE_INTEGER;
    integer2 = true;
  } else if (isColumnType(column, ["MySqlYear", "SingleStoreYear"])) {
    min = 1901;
    max = 2155;
    integer2 = true;
  } else {
    min = Number.MIN_SAFE_INTEGER;
    max = Number.MAX_SAFE_INTEGER;
  }
  let schema = coerce2 === true || coerce2?.number ? z.coerce.number() : z.number();
  schema = schema.min(min).max(max);
  return integer2 ? schema.int() : schema;
}
function bigintColumnToSchema(column, z, coerce2) {
  const unsigned = column.getSQLType().includes("unsigned");
  const min = unsigned ? 0n : CONSTANTS.INT64_MIN;
  const max = unsigned ? CONSTANTS.INT64_UNSIGNED_MAX : CONSTANTS.INT64_MAX;
  const schema = coerce2 === true || coerce2?.bigint ? z.coerce.bigint() : z.bigint();
  return schema.min(min).max(max);
}
function stringColumnToSchema(column, z, coerce2) {
  if (isColumnType(column, ["PgUUID"])) {
    return z.string().uuid();
  }
  let max;
  let regex;
  let fixed = false;
  if (isColumnType(column, ["PgVarchar", "SQLiteText"])) {
    max = column.length;
  } else if (isColumnType(column, ["MySqlVarChar", "SingleStoreVarChar"])) {
    max = column.length ?? CONSTANTS.INT16_UNSIGNED_MAX;
  } else if (isColumnType(column, ["MySqlText", "SingleStoreText"])) {
    if (column.textType === "longtext") {
      max = CONSTANTS.INT32_UNSIGNED_MAX;
    } else if (column.textType === "mediumtext") {
      max = CONSTANTS.INT24_UNSIGNED_MAX;
    } else if (column.textType === "text") {
      max = CONSTANTS.INT16_UNSIGNED_MAX;
    } else {
      max = CONSTANTS.INT8_UNSIGNED_MAX;
    }
  }
  if (isColumnType(column, [
    "PgChar",
    "MySqlChar",
    "SingleStoreChar"
  ])) {
    max = column.length;
    fixed = true;
  }
  if (isColumnType(column, ["PgBinaryVector"])) {
    regex = /^[01]+$/;
    max = column.dimensions;
  }
  let schema = coerce2 === true || coerce2?.string ? z.coerce.string() : z.string();
  schema = regex ? schema.regex(regex) : schema;
  return max && fixed ? schema.length(max) : max ? schema.max(max) : schema;
}
function getColumns(tableLike) {
  return isTable(tableLike) ? getTableColumns(tableLike) : getViewSelectedFields(tableLike);
}
function handleColumns(columns, refinements, conditions, factory) {
  const columnSchemas = {};
  for (const [key, selected] of Object.entries(columns)) {
    if (!is(selected, Column) && !is(selected, SQL) && !is(selected, SQL.Aliased) && typeof selected === "object") {
      const columns2 = isTable(selected) || isView(selected) ? getColumns(selected) : selected;
      columnSchemas[key] = handleColumns(columns2, refinements[key] ?? {}, conditions, factory);
      continue;
    }
    const refinement = refinements[key];
    if (refinement !== void 0 && typeof refinement !== "function") {
      columnSchemas[key] = refinement;
      continue;
    }
    const column = is(selected, Column) ? selected : void 0;
    const schema = column ? columnToSchema(column, factory) : external_exports.any();
    const refined = typeof refinement === "function" ? refinement(schema) : schema;
    if (conditions.never(column)) {
      continue;
    } else {
      columnSchemas[key] = refined;
    }
    if (column) {
      if (conditions.nullable(column)) {
        columnSchemas[key] = columnSchemas[key].nullable();
      }
      if (conditions.optional(column)) {
        columnSchemas[key] = columnSchemas[key].optional();
      }
    }
  }
  return external_exports.object(columnSchemas);
}
var insertConditions = {
  never: (column) => column?.generated?.type === "always" || column?.generatedIdentity?.type === "always",
  optional: (column) => !column.notNull || column.notNull && column.hasDefault,
  nullable: (column) => !column.notNull
};
var createInsertSchema = (entity, refine) => {
  const columns = getColumns(entity);
  return handleColumns(columns, refine ?? {}, insertConditions);
};

// shared/schema.ts
var clinics = pgTable("clinics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  address: text("address"),
  createdAt: timestamp("created_at").defaultNow()
});
var insertClinicSchema = createInsertSchema(clinics).omit({
  id: true,
  createdAt: true
});
var users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  role: text("role").notNull().default("recepcion"),
  // "admin", "recepcion", "dentista"
  clinicId: varchar("clinic_id").references(() => clinics.id),
  createdAt: timestamp("created_at").defaultNow()
});
var insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true
});
var pacientes = pgTable("pacientes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clinicId: varchar("clinic_id").references(() => clinics.id),
  nombre: text("nombre").notNull(),
  ultimaVisita: timestamp("ultima_visita").notNull(),
  diagnostico: text("diagnostico").notNull(),
  telefono: text("telefono").notNull(),
  email: text("email").notNull(),
  whatsapp: text("whatsapp"),
  edad: integer("edad").notNull(),
  estado: text("estado").notNull(),
  // "activo", "perdido", "sin cita"
  prioridad: text("prioridad"),
  // "Alta", "Media", "Baja"
  tieneCitaFutura: boolean("tiene_cita_futura").default(false),
  mesesSinVisita: integer("meses_sin_visita"),
  enCampana: boolean("en_campana").default(false),
  notes: text("notes")
  // Additional notes about patient
});
var insertPacienteSchema = createInsertSchema(pacientes).omit({
  id: true
});
var campanas = pgTable("campanas", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  nombre: text("nombre").notNull(),
  canales: text("canales").array().notNull(),
  // ["SMS", "Email", "Llamadas"]
  cadencia: text("cadencia").notNull(),
  // "Opción 1", "Opción 2", "Opción 3"
  plantillaSMS: text("plantilla_sms"),
  plantillaEmail: text("plantilla_email"),
  guionLlamada: text("guion_llamada"),
  estado: text("estado").notNull(),
  // "activa", "pausada", "completada"
  pacientesIncluidos: integer("pacientes_incluidos").default(0),
  contactosEnviados: integer("contactos_enviados").default(0),
  citasGeneradas: integer("citas_generadas").default(0),
  fechaCreacion: timestamp("fecha_creacion").defaultNow()
});
var insertCampanaSchema = createInsertSchema(campanas).omit({
  id: true,
  fechaCreacion: true
});
var tareasLlamadas = pgTable("tareas_llamadas", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  pacienteId: varchar("paciente_id").notNull(),
  pacienteNombre: text("paciente_nombre").notNull(),
  telefono: text("telefono").notNull(),
  email: text("email"),
  // email del paciente para acciones de tipo email
  motivo: text("motivo").notNull(),
  prioridad: text("prioridad").notNull(),
  // "Alta", "Media", "Baja"
  tipoAccion: text("tipo_accion").notNull().default("llamada"),
  // "llamada", "email", "carta", "añadir_campana", "añadir_campana_riesgo"
  estado: text("estado").notNull(),
  // "pendiente", "contactado", "cita_agendada", "no_contactado", "completada"
  aprobado: boolean("aprobado").default(false),
  // si la tarea ha sido aprobada por supervisor
  fechaProgramada: timestamp("fecha_programada"),
  // fecha en que se programa la tarea
  fechaCreacion: timestamp("fecha_creacion").defaultNow(),
  fechaContacto: timestamp("fecha_contacto"),
  fechaCompletada: timestamp("fecha_completada"),
  // fecha de finalización
  notas: text("notas"),
  campanaId: text("campana_id"),
  // ID de la campaña para acciones de tipo añadir_campana
  cantidadPacientes: integer("cantidad_pacientes")
  // Cantidad de pacientes para acciones de campaña
});
var insertTareaLlamadaSchema = createInsertSchema(tareasLlamadas).omit({
  id: true,
  fechaCreacion: true
});
var conversaciones = pgTable("conversaciones", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  pacienteId: varchar("paciente_id").notNull(),
  canal: text("canal").notNull(),
  // "whatsapp", "sms", "email"
  ultimoMensaje: text("ultimo_mensaje"),
  fechaUltimoMensaje: timestamp("fecha_ultimo_mensaje"),
  noLeidos: integer("no_leidos").default(0),
  estado: text("estado").notNull()
  // "activa", "archivada"
});
var insertConversacionSchema = createInsertSchema(conversaciones).omit({
  id: true
});
var budgets = pgTable("budgets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  patientId: varchar("patient_id").references(() => pacientes.id).notNull(),
  clinicId: varchar("clinic_id").references(() => clinics.id).notNull(),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  urgencyScore: integer("urgency_score"),
  // 0-100 AI calculated
  acceptanceProb: integer("acceptance_prob"),
  // 0-100 AI calculated
  status: text("status").notNull().default("pending"),
  // "pending", "accepted", "rejected"
  treatmentDetails: jsonb("treatment_details"),
  // {procedures: [], total: number}
  priority: text("priority"),
  // "high", "medium", "low" - auto calculated by AI
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var insertBudgetSchema = createInsertSchema(budgets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  urgencyScore: true,
  acceptanceProb: true,
  priority: true
});
var mensajes = pgTable("mensajes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  conversacionId: varchar("conversacion_id"),
  budgetId: varchar("budget_id").references(() => budgets.id),
  patientId: varchar("patient_id").references(() => pacientes.id),
  type: text("type").notNull(),
  // "relance", "reminder", "postvisit", "conversation"
  channel: text("channel").notNull(),
  // "sms", "email", "whatsapp"
  contenido: text("contenido").notNull(),
  direccion: text("direccion").notNull().default("saliente"),
  // "entrante", "saliente"
  fechaEnvio: timestamp("fecha_envio").notNull(),
  openedAt: timestamp("opened_at"),
  leido: boolean("leido").default(false)
});
var insertMensajeSchema = createInsertSchema(mensajes).omit({
  id: true
});
var citas = pgTable("citas", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  pacienteId: varchar("paciente_id").notNull(),
  pacienteNombre: text("paciente_nombre").notNull(),
  telefono: text("telefono").notNull(),
  fechaHora: timestamp("fecha_hora").notNull(),
  duracionMinutos: integer("duracion_minutos").default(30),
  tipo: text("tipo").notNull(),
  // "revision", "limpieza", "tratamiento", "consulta", "urgencia"
  estado: text("estado").notNull(),
  // "programada", "confirmada", "completada", "cancelada", "no_asistio"
  notas: text("notas"),
  doctor: text("doctor"),
  sala: text("sala"),
  origen: text("origen")
  // "reactivacion", "web", "telefono", "presencial"
});
var insertCitaSchema = createInsertSchema(citas).omit({
  id: true
});
var recordatorios = pgTable("recordatorios", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  nombre: text("nombre").notNull(),
  canal: text("canal").notNull(),
  // "sms", "whatsapp", "email"
  mensaje: text("mensaje").notNull(),
  horasAntes: integer("horas_antes").notNull(),
  // tiempo de antelación en horas
  activo: boolean("activo").default(true)
});
var insertRecordatorioSchema = createInsertSchema(recordatorios).omit({
  id: true
});
var analytics = pgTable("analytics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clinicId: varchar("clinic_id").references(() => clinics.id).notNull(),
  fecha: timestamp("fecha").defaultNow(),
  tasaTransformacion: numeric("tasa_transformacion", { precision: 5, scale: 2 }),
  // percentage
  facturacion: numeric("facturacion", { precision: 10, scale: 2 }),
  rechazosPorMotivo: jsonb("rechazos_por_motivo"),
  // {precio: number, miedo: number, comprension: number, etc}
  budgetsTotales: integer("budgets_totales").default(0),
  budgetsAceptados: integer("budgets_aceptados").default(0),
  budgetsRechazados: integer("budgets_rechazados").default(0),
  relancesEnviados: integer("relances_enviados").default(0)
});
var insertAnalyticsSchema = createInsertSchema(analytics).omit({
  id: true
});
var acciones = pgTable("acciones", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tipo: text("tipo").notNull(),
  // "relance", "recordatorio", "post_visita", "scoring", "analisis", "preventivo"
  estado: text("estado").notNull().default("pendiente"),
  // "pendiente", "ejecutada", "confirmada", "rechazada", "error"
  titulo: text("titulo").notNull(),
  descripcion: text("descripcion"),
  pacienteId: varchar("patient_id").references(() => pacientes.id),
  budgetId: varchar("budget_id").references(() => budgets.id),
  citaId: varchar("cita_id").references(() => citas.id),
  canal: text("canal"),
  // "sms", "email", "whatsapp"
  mensaje: text("mensaje"),
  // Contenido del mensaje generado
  metadata: jsonb("metadata"),
  // Datos adicionales
  requiereConfirmacion: boolean("requiere_confirmacion").default(false),
  ejecutadaAt: timestamp("ejecutada_at"),
  confirmadaAt: timestamp("confirmada_at"),
  createdAt: timestamp("created_at").defaultNow()
});
var insertAccionSchema = createInsertSchema(acciones).omit({
  id: true,
  createdAt: true
});
var tratamientosPreventivos = pgTable("tratamientos_preventivos", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  pacienteId: varchar("patient_id").references(() => pacientes.id).notNull(),
  clinicId: varchar("clinic_id").references(() => clinics.id).notNull(),
  tipoTratamiento: text("tipo_tratamiento").notNull(),
  // "limpieza", "revision", "fluorizacion", "selladores", etc.
  fechaRealizacion: timestamp("fecha_realizacion").notNull(),
  proximaFechaRecomendada: timestamp("proxima_fecha_recomendada").notNull(),
  frecuenciaMeses: integer("frecuencia_meses").notNull(),
  // 6 para limpieza, 12 para revision, etc.
  citaId: varchar("cita_id").references(() => citas.id),
  // Si está ligado a una cita
  budgetId: varchar("budget_id").references(() => budgets.id),
  // Si está ligado a un presupuesto
  notas: text("notas"),
  createdAt: timestamp("created_at").defaultNow()
});
var insertTratamientoPreventivoSchema = createInsertSchema(tratamientosPreventivos).omit({
  id: true,
  createdAt: true
});
var reglasComunicacion = pgTable("reglas_comunicacion", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  nombre: text("nombre").notNull(),
  tipo: text("tipo").notNull(),
  // "relance_presupuesto", "recordatorio_cita", "post_visita", "salud_preventiva", "recall_paciente"
  activa: boolean("activa").default(true),
  secuencia: jsonb("secuencia").notNull(),
  // Array de pasos: [{canal: "whatsapp", diasDespues: 2, accion: "enviar"}, ...]
  criterios: jsonb("criterios"),
  // Criterios para asignación: {diagnosticos: [], mesesSinVisitaMin: number, mesesSinVisitaMax: number, interaccionesPrevias: boolean, ...}
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var insertReglaComunicacionSchema = createInsertSchema(reglasComunicacion).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var secuenciasComunicacion = pgTable("secuencias_comunicacion", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  reglaId: varchar("regla_id").references(() => reglasComunicacion.id).notNull(),
  pacienteId: varchar("patient_id").references(() => pacientes.id).notNull(),
  budgetId: varchar("budget_id").references(() => budgets.id),
  citaId: varchar("cita_id").references(() => citas.id),
  tipo: text("tipo").notNull(),
  // Mismo que regla.tipo
  estado: text("estado").notNull().default("activa"),
  // "activa", "pausada", "completada", "cancelada"
  pasoActual: integer("paso_actual").default(0),
  fechaInicio: timestamp("fecha_inicio").notNull(),
  ultimaAccion: timestamp("ultima_accion"),
  proximaAccion: timestamp("proxima_accion"),
  respuestaRecibida: boolean("respuesta_recibida").default(false),
  metadata: jsonb("metadata"),
  // Historial de acciones ejecutadas
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var insertSecuenciaComunicacionSchema = createInsertSchema(secuenciasComunicacion).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

// node_modules/date-fns/toDate.mjs
function toDate(argument) {
  const argStr = Object.prototype.toString.call(argument);
  if (argument instanceof Date || typeof argument === "object" && argStr === "[object Date]") {
    return new argument.constructor(+argument);
  } else if (typeof argument === "number" || argStr === "[object Number]" || typeof argument === "string" || argStr === "[object String]") {
    return new Date(argument);
  } else {
    return /* @__PURE__ */ new Date(NaN);
  }
}

// node_modules/date-fns/constructFrom.mjs
function constructFrom(date2, value) {
  if (date2 instanceof Date) {
    return new date2.constructor(value);
  } else {
    return new Date(value);
  }
}

// node_modules/date-fns/constants.mjs
var daysInYear = 365.2425;
var maxTime = Math.pow(10, 8) * 24 * 60 * 60 * 1e3;
var minTime = -maxTime;
var millisecondsInWeek = 6048e5;
var millisecondsInDay = 864e5;
var secondsInHour = 3600;
var secondsInDay = secondsInHour * 24;
var secondsInWeek = secondsInDay * 7;
var secondsInYear = secondsInDay * daysInYear;
var secondsInMonth = secondsInYear / 12;
var secondsInQuarter = secondsInMonth * 3;

// node_modules/date-fns/_lib/defaultOptions.mjs
var defaultOptions = {};
function getDefaultOptions() {
  return defaultOptions;
}

// node_modules/date-fns/startOfWeek.mjs
function startOfWeek(date2, options) {
  const defaultOptions2 = getDefaultOptions();
  const weekStartsOn = options?.weekStartsOn ?? options?.locale?.options?.weekStartsOn ?? defaultOptions2.weekStartsOn ?? defaultOptions2.locale?.options?.weekStartsOn ?? 0;
  const _date = toDate(date2);
  const day = _date.getDay();
  const diff = (day < weekStartsOn ? 7 : 0) + day - weekStartsOn;
  _date.setDate(_date.getDate() - diff);
  _date.setHours(0, 0, 0, 0);
  return _date;
}

// node_modules/date-fns/startOfISOWeek.mjs
function startOfISOWeek(date2) {
  return startOfWeek(date2, { weekStartsOn: 1 });
}

// node_modules/date-fns/getISOWeekYear.mjs
function getISOWeekYear(date2) {
  const _date = toDate(date2);
  const year = _date.getFullYear();
  const fourthOfJanuaryOfNextYear = constructFrom(date2, 0);
  fourthOfJanuaryOfNextYear.setFullYear(year + 1, 0, 4);
  fourthOfJanuaryOfNextYear.setHours(0, 0, 0, 0);
  const startOfNextYear = startOfISOWeek(fourthOfJanuaryOfNextYear);
  const fourthOfJanuaryOfThisYear = constructFrom(date2, 0);
  fourthOfJanuaryOfThisYear.setFullYear(year, 0, 4);
  fourthOfJanuaryOfThisYear.setHours(0, 0, 0, 0);
  const startOfThisYear = startOfISOWeek(fourthOfJanuaryOfThisYear);
  if (_date.getTime() >= startOfNextYear.getTime()) {
    return year + 1;
  } else if (_date.getTime() >= startOfThisYear.getTime()) {
    return year;
  } else {
    return year - 1;
  }
}

// node_modules/date-fns/startOfDay.mjs
function startOfDay(date2) {
  const _date = toDate(date2);
  _date.setHours(0, 0, 0, 0);
  return _date;
}

// node_modules/date-fns/_lib/getTimezoneOffsetInMilliseconds.mjs
function getTimezoneOffsetInMilliseconds(date2) {
  const _date = toDate(date2);
  const utcDate = new Date(
    Date.UTC(
      _date.getFullYear(),
      _date.getMonth(),
      _date.getDate(),
      _date.getHours(),
      _date.getMinutes(),
      _date.getSeconds(),
      _date.getMilliseconds()
    )
  );
  utcDate.setUTCFullYear(_date.getFullYear());
  return +date2 - +utcDate;
}

// node_modules/date-fns/differenceInCalendarDays.mjs
function differenceInCalendarDays(dateLeft, dateRight) {
  const startOfDayLeft = startOfDay(dateLeft);
  const startOfDayRight = startOfDay(dateRight);
  const timestampLeft = +startOfDayLeft - getTimezoneOffsetInMilliseconds(startOfDayLeft);
  const timestampRight = +startOfDayRight - getTimezoneOffsetInMilliseconds(startOfDayRight);
  return Math.round((timestampLeft - timestampRight) / millisecondsInDay);
}

// node_modules/date-fns/startOfISOWeekYear.mjs
function startOfISOWeekYear(date2) {
  const year = getISOWeekYear(date2);
  const fourthOfJanuary = constructFrom(date2, 0);
  fourthOfJanuary.setFullYear(year, 0, 4);
  fourthOfJanuary.setHours(0, 0, 0, 0);
  return startOfISOWeek(fourthOfJanuary);
}

// node_modules/date-fns/isDate.mjs
function isDate(value) {
  return value instanceof Date || typeof value === "object" && Object.prototype.toString.call(value) === "[object Date]";
}

// node_modules/date-fns/isValid.mjs
function isValid2(date2) {
  if (!isDate(date2) && typeof date2 !== "number") {
    return false;
  }
  const _date = toDate(date2);
  return !isNaN(Number(_date));
}

// node_modules/date-fns/startOfYear.mjs
function startOfYear(date2) {
  const cleanDate = toDate(date2);
  const _date = constructFrom(date2, 0);
  _date.setFullYear(cleanDate.getFullYear(), 0, 1);
  _date.setHours(0, 0, 0, 0);
  return _date;
}

// node_modules/date-fns/locale/en-US/_lib/formatDistance.mjs
var formatDistanceLocale = {
  lessThanXSeconds: {
    one: "less than a second",
    other: "less than {{count}} seconds"
  },
  xSeconds: {
    one: "1 second",
    other: "{{count}} seconds"
  },
  halfAMinute: "half a minute",
  lessThanXMinutes: {
    one: "less than a minute",
    other: "less than {{count}} minutes"
  },
  xMinutes: {
    one: "1 minute",
    other: "{{count}} minutes"
  },
  aboutXHours: {
    one: "about 1 hour",
    other: "about {{count}} hours"
  },
  xHours: {
    one: "1 hour",
    other: "{{count}} hours"
  },
  xDays: {
    one: "1 day",
    other: "{{count}} days"
  },
  aboutXWeeks: {
    one: "about 1 week",
    other: "about {{count}} weeks"
  },
  xWeeks: {
    one: "1 week",
    other: "{{count}} weeks"
  },
  aboutXMonths: {
    one: "about 1 month",
    other: "about {{count}} months"
  },
  xMonths: {
    one: "1 month",
    other: "{{count}} months"
  },
  aboutXYears: {
    one: "about 1 year",
    other: "about {{count}} years"
  },
  xYears: {
    one: "1 year",
    other: "{{count}} years"
  },
  overXYears: {
    one: "over 1 year",
    other: "over {{count}} years"
  },
  almostXYears: {
    one: "almost 1 year",
    other: "almost {{count}} years"
  }
};
var formatDistance = (token, count, options) => {
  let result;
  const tokenValue = formatDistanceLocale[token];
  if (typeof tokenValue === "string") {
    result = tokenValue;
  } else if (count === 1) {
    result = tokenValue.one;
  } else {
    result = tokenValue.other.replace("{{count}}", count.toString());
  }
  if (options?.addSuffix) {
    if (options.comparison && options.comparison > 0) {
      return "in " + result;
    } else {
      return result + " ago";
    }
  }
  return result;
};

// node_modules/date-fns/locale/_lib/buildFormatLongFn.mjs
function buildFormatLongFn(args) {
  return (options = {}) => {
    const width = options.width ? String(options.width) : args.defaultWidth;
    const format2 = args.formats[width] || args.formats[args.defaultWidth];
    return format2;
  };
}

// node_modules/date-fns/locale/en-US/_lib/formatLong.mjs
var dateFormats = {
  full: "EEEE, MMMM do, y",
  long: "MMMM do, y",
  medium: "MMM d, y",
  short: "MM/dd/yyyy"
};
var timeFormats = {
  full: "h:mm:ss a zzzz",
  long: "h:mm:ss a z",
  medium: "h:mm:ss a",
  short: "h:mm a"
};
var dateTimeFormats = {
  full: "{{date}} 'at' {{time}}",
  long: "{{date}} 'at' {{time}}",
  medium: "{{date}}, {{time}}",
  short: "{{date}}, {{time}}"
};
var formatLong = {
  date: buildFormatLongFn({
    formats: dateFormats,
    defaultWidth: "full"
  }),
  time: buildFormatLongFn({
    formats: timeFormats,
    defaultWidth: "full"
  }),
  dateTime: buildFormatLongFn({
    formats: dateTimeFormats,
    defaultWidth: "full"
  })
};

// node_modules/date-fns/locale/en-US/_lib/formatRelative.mjs
var formatRelativeLocale = {
  lastWeek: "'last' eeee 'at' p",
  yesterday: "'yesterday at' p",
  today: "'today at' p",
  tomorrow: "'tomorrow at' p",
  nextWeek: "eeee 'at' p",
  other: "P"
};
var formatRelative = (token, _date, _baseDate, _options) => formatRelativeLocale[token];

// node_modules/date-fns/locale/_lib/buildLocalizeFn.mjs
function buildLocalizeFn(args) {
  return (value, options) => {
    const context = options?.context ? String(options.context) : "standalone";
    let valuesArray;
    if (context === "formatting" && args.formattingValues) {
      const defaultWidth = args.defaultFormattingWidth || args.defaultWidth;
      const width = options?.width ? String(options.width) : defaultWidth;
      valuesArray = args.formattingValues[width] || args.formattingValues[defaultWidth];
    } else {
      const defaultWidth = args.defaultWidth;
      const width = options?.width ? String(options.width) : args.defaultWidth;
      valuesArray = args.values[width] || args.values[defaultWidth];
    }
    const index = args.argumentCallback ? args.argumentCallback(value) : value;
    return valuesArray[index];
  };
}

// node_modules/date-fns/locale/en-US/_lib/localize.mjs
var eraValues = {
  narrow: ["B", "A"],
  abbreviated: ["BC", "AD"],
  wide: ["Before Christ", "Anno Domini"]
};
var quarterValues = {
  narrow: ["1", "2", "3", "4"],
  abbreviated: ["Q1", "Q2", "Q3", "Q4"],
  wide: ["1st quarter", "2nd quarter", "3rd quarter", "4th quarter"]
};
var monthValues = {
  narrow: ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"],
  abbreviated: [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec"
  ],
  wide: [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ]
};
var dayValues = {
  narrow: ["S", "M", "T", "W", "T", "F", "S"],
  short: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
  abbreviated: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  wide: [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday"
  ]
};
var dayPeriodValues = {
  narrow: {
    am: "a",
    pm: "p",
    midnight: "mi",
    noon: "n",
    morning: "morning",
    afternoon: "afternoon",
    evening: "evening",
    night: "night"
  },
  abbreviated: {
    am: "AM",
    pm: "PM",
    midnight: "midnight",
    noon: "noon",
    morning: "morning",
    afternoon: "afternoon",
    evening: "evening",
    night: "night"
  },
  wide: {
    am: "a.m.",
    pm: "p.m.",
    midnight: "midnight",
    noon: "noon",
    morning: "morning",
    afternoon: "afternoon",
    evening: "evening",
    night: "night"
  }
};
var formattingDayPeriodValues = {
  narrow: {
    am: "a",
    pm: "p",
    midnight: "mi",
    noon: "n",
    morning: "in the morning",
    afternoon: "in the afternoon",
    evening: "in the evening",
    night: "at night"
  },
  abbreviated: {
    am: "AM",
    pm: "PM",
    midnight: "midnight",
    noon: "noon",
    morning: "in the morning",
    afternoon: "in the afternoon",
    evening: "in the evening",
    night: "at night"
  },
  wide: {
    am: "a.m.",
    pm: "p.m.",
    midnight: "midnight",
    noon: "noon",
    morning: "in the morning",
    afternoon: "in the afternoon",
    evening: "in the evening",
    night: "at night"
  }
};
var ordinalNumber = (dirtyNumber, _options) => {
  const number = Number(dirtyNumber);
  const rem100 = number % 100;
  if (rem100 > 20 || rem100 < 10) {
    switch (rem100 % 10) {
      case 1:
        return number + "st";
      case 2:
        return number + "nd";
      case 3:
        return number + "rd";
    }
  }
  return number + "th";
};
var localize = {
  ordinalNumber,
  era: buildLocalizeFn({
    values: eraValues,
    defaultWidth: "wide"
  }),
  quarter: buildLocalizeFn({
    values: quarterValues,
    defaultWidth: "wide",
    argumentCallback: (quarter) => quarter - 1
  }),
  month: buildLocalizeFn({
    values: monthValues,
    defaultWidth: "wide"
  }),
  day: buildLocalizeFn({
    values: dayValues,
    defaultWidth: "wide"
  }),
  dayPeriod: buildLocalizeFn({
    values: dayPeriodValues,
    defaultWidth: "wide",
    formattingValues: formattingDayPeriodValues,
    defaultFormattingWidth: "wide"
  })
};

// node_modules/date-fns/locale/_lib/buildMatchFn.mjs
function buildMatchFn(args) {
  return (string, options = {}) => {
    const width = options.width;
    const matchPattern = width && args.matchPatterns[width] || args.matchPatterns[args.defaultMatchWidth];
    const matchResult = string.match(matchPattern);
    if (!matchResult) {
      return null;
    }
    const matchedString = matchResult[0];
    const parsePatterns = width && args.parsePatterns[width] || args.parsePatterns[args.defaultParseWidth];
    const key = Array.isArray(parsePatterns) ? findIndex(parsePatterns, (pattern) => pattern.test(matchedString)) : (
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- I challange you to fix the type
      findKey(parsePatterns, (pattern) => pattern.test(matchedString))
    );
    let value;
    value = args.valueCallback ? args.valueCallback(key) : key;
    value = options.valueCallback ? (
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- I challange you to fix the type
      options.valueCallback(value)
    ) : value;
    const rest = string.slice(matchedString.length);
    return { value, rest };
  };
}
function findKey(object, predicate) {
  for (const key in object) {
    if (Object.prototype.hasOwnProperty.call(object, key) && predicate(object[key])) {
      return key;
    }
  }
  return void 0;
}
function findIndex(array, predicate) {
  for (let key = 0; key < array.length; key++) {
    if (predicate(array[key])) {
      return key;
    }
  }
  return void 0;
}

// node_modules/date-fns/locale/_lib/buildMatchPatternFn.mjs
function buildMatchPatternFn(args) {
  return (string, options = {}) => {
    const matchResult = string.match(args.matchPattern);
    if (!matchResult) return null;
    const matchedString = matchResult[0];
    const parseResult = string.match(args.parsePattern);
    if (!parseResult) return null;
    let value = args.valueCallback ? args.valueCallback(parseResult[0]) : parseResult[0];
    value = options.valueCallback ? options.valueCallback(value) : value;
    const rest = string.slice(matchedString.length);
    return { value, rest };
  };
}

// node_modules/date-fns/locale/en-US/_lib/match.mjs
var matchOrdinalNumberPattern = /^(\d+)(th|st|nd|rd)?/i;
var parseOrdinalNumberPattern = /\d+/i;
var matchEraPatterns = {
  narrow: /^(b|a)/i,
  abbreviated: /^(b\.?\s?c\.?|b\.?\s?c\.?\s?e\.?|a\.?\s?d\.?|c\.?\s?e\.?)/i,
  wide: /^(before christ|before common era|anno domini|common era)/i
};
var parseEraPatterns = {
  any: [/^b/i, /^(a|c)/i]
};
var matchQuarterPatterns = {
  narrow: /^[1234]/i,
  abbreviated: /^q[1234]/i,
  wide: /^[1234](th|st|nd|rd)? quarter/i
};
var parseQuarterPatterns = {
  any: [/1/i, /2/i, /3/i, /4/i]
};
var matchMonthPatterns = {
  narrow: /^[jfmasond]/i,
  abbreviated: /^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i,
  wide: /^(january|february|march|april|may|june|july|august|september|october|november|december)/i
};
var parseMonthPatterns = {
  narrow: [
    /^j/i,
    /^f/i,
    /^m/i,
    /^a/i,
    /^m/i,
    /^j/i,
    /^j/i,
    /^a/i,
    /^s/i,
    /^o/i,
    /^n/i,
    /^d/i
  ],
  any: [
    /^ja/i,
    /^f/i,
    /^mar/i,
    /^ap/i,
    /^may/i,
    /^jun/i,
    /^jul/i,
    /^au/i,
    /^s/i,
    /^o/i,
    /^n/i,
    /^d/i
  ]
};
var matchDayPatterns = {
  narrow: /^[smtwf]/i,
  short: /^(su|mo|tu|we|th|fr|sa)/i,
  abbreviated: /^(sun|mon|tue|wed|thu|fri|sat)/i,
  wide: /^(sunday|monday|tuesday|wednesday|thursday|friday|saturday)/i
};
var parseDayPatterns = {
  narrow: [/^s/i, /^m/i, /^t/i, /^w/i, /^t/i, /^f/i, /^s/i],
  any: [/^su/i, /^m/i, /^tu/i, /^w/i, /^th/i, /^f/i, /^sa/i]
};
var matchDayPeriodPatterns = {
  narrow: /^(a|p|mi|n|(in the|at) (morning|afternoon|evening|night))/i,
  any: /^([ap]\.?\s?m\.?|midnight|noon|(in the|at) (morning|afternoon|evening|night))/i
};
var parseDayPeriodPatterns = {
  any: {
    am: /^a/i,
    pm: /^p/i,
    midnight: /^mi/i,
    noon: /^no/i,
    morning: /morning/i,
    afternoon: /afternoon/i,
    evening: /evening/i,
    night: /night/i
  }
};
var match = {
  ordinalNumber: buildMatchPatternFn({
    matchPattern: matchOrdinalNumberPattern,
    parsePattern: parseOrdinalNumberPattern,
    valueCallback: (value) => parseInt(value, 10)
  }),
  era: buildMatchFn({
    matchPatterns: matchEraPatterns,
    defaultMatchWidth: "wide",
    parsePatterns: parseEraPatterns,
    defaultParseWidth: "any"
  }),
  quarter: buildMatchFn({
    matchPatterns: matchQuarterPatterns,
    defaultMatchWidth: "wide",
    parsePatterns: parseQuarterPatterns,
    defaultParseWidth: "any",
    valueCallback: (index) => index + 1
  }),
  month: buildMatchFn({
    matchPatterns: matchMonthPatterns,
    defaultMatchWidth: "wide",
    parsePatterns: parseMonthPatterns,
    defaultParseWidth: "any"
  }),
  day: buildMatchFn({
    matchPatterns: matchDayPatterns,
    defaultMatchWidth: "wide",
    parsePatterns: parseDayPatterns,
    defaultParseWidth: "any"
  }),
  dayPeriod: buildMatchFn({
    matchPatterns: matchDayPeriodPatterns,
    defaultMatchWidth: "any",
    parsePatterns: parseDayPeriodPatterns,
    defaultParseWidth: "any"
  })
};

// node_modules/date-fns/locale/en-US.mjs
var enUS = {
  code: "en-US",
  formatDistance,
  formatLong,
  formatRelative,
  localize,
  match,
  options: {
    weekStartsOn: 0,
    firstWeekContainsDate: 1
  }
};

// node_modules/date-fns/getDayOfYear.mjs
function getDayOfYear(date2) {
  const _date = toDate(date2);
  const diff = differenceInCalendarDays(_date, startOfYear(_date));
  const dayOfYear = diff + 1;
  return dayOfYear;
}

// node_modules/date-fns/getISOWeek.mjs
function getISOWeek(date2) {
  const _date = toDate(date2);
  const diff = +startOfISOWeek(_date) - +startOfISOWeekYear(_date);
  return Math.round(diff / millisecondsInWeek) + 1;
}

// node_modules/date-fns/getWeekYear.mjs
function getWeekYear(date2, options) {
  const _date = toDate(date2);
  const year = _date.getFullYear();
  const defaultOptions2 = getDefaultOptions();
  const firstWeekContainsDate = options?.firstWeekContainsDate ?? options?.locale?.options?.firstWeekContainsDate ?? defaultOptions2.firstWeekContainsDate ?? defaultOptions2.locale?.options?.firstWeekContainsDate ?? 1;
  const firstWeekOfNextYear = constructFrom(date2, 0);
  firstWeekOfNextYear.setFullYear(year + 1, 0, firstWeekContainsDate);
  firstWeekOfNextYear.setHours(0, 0, 0, 0);
  const startOfNextYear = startOfWeek(firstWeekOfNextYear, options);
  const firstWeekOfThisYear = constructFrom(date2, 0);
  firstWeekOfThisYear.setFullYear(year, 0, firstWeekContainsDate);
  firstWeekOfThisYear.setHours(0, 0, 0, 0);
  const startOfThisYear = startOfWeek(firstWeekOfThisYear, options);
  if (_date.getTime() >= startOfNextYear.getTime()) {
    return year + 1;
  } else if (_date.getTime() >= startOfThisYear.getTime()) {
    return year;
  } else {
    return year - 1;
  }
}

// node_modules/date-fns/startOfWeekYear.mjs
function startOfWeekYear(date2, options) {
  const defaultOptions2 = getDefaultOptions();
  const firstWeekContainsDate = options?.firstWeekContainsDate ?? options?.locale?.options?.firstWeekContainsDate ?? defaultOptions2.firstWeekContainsDate ?? defaultOptions2.locale?.options?.firstWeekContainsDate ?? 1;
  const year = getWeekYear(date2, options);
  const firstWeek = constructFrom(date2, 0);
  firstWeek.setFullYear(year, 0, firstWeekContainsDate);
  firstWeek.setHours(0, 0, 0, 0);
  const _date = startOfWeek(firstWeek, options);
  return _date;
}

// node_modules/date-fns/getWeek.mjs
function getWeek(date2, options) {
  const _date = toDate(date2);
  const diff = +startOfWeek(_date, options) - +startOfWeekYear(_date, options);
  return Math.round(diff / millisecondsInWeek) + 1;
}

// node_modules/date-fns/_lib/addLeadingZeros.mjs
function addLeadingZeros(number, targetLength) {
  const sign = number < 0 ? "-" : "";
  const output = Math.abs(number).toString().padStart(targetLength, "0");
  return sign + output;
}

// node_modules/date-fns/_lib/format/lightFormatters.mjs
var lightFormatters = {
  // Year
  y(date2, token) {
    const signedYear = date2.getFullYear();
    const year = signedYear > 0 ? signedYear : 1 - signedYear;
    return addLeadingZeros(token === "yy" ? year % 100 : year, token.length);
  },
  // Month
  M(date2, token) {
    const month = date2.getMonth();
    return token === "M" ? String(month + 1) : addLeadingZeros(month + 1, 2);
  },
  // Day of the month
  d(date2, token) {
    return addLeadingZeros(date2.getDate(), token.length);
  },
  // AM or PM
  a(date2, token) {
    const dayPeriodEnumValue = date2.getHours() / 12 >= 1 ? "pm" : "am";
    switch (token) {
      case "a":
      case "aa":
        return dayPeriodEnumValue.toUpperCase();
      case "aaa":
        return dayPeriodEnumValue;
      case "aaaaa":
        return dayPeriodEnumValue[0];
      case "aaaa":
      default:
        return dayPeriodEnumValue === "am" ? "a.m." : "p.m.";
    }
  },
  // Hour [1-12]
  h(date2, token) {
    return addLeadingZeros(date2.getHours() % 12 || 12, token.length);
  },
  // Hour [0-23]
  H(date2, token) {
    return addLeadingZeros(date2.getHours(), token.length);
  },
  // Minute
  m(date2, token) {
    return addLeadingZeros(date2.getMinutes(), token.length);
  },
  // Second
  s(date2, token) {
    return addLeadingZeros(date2.getSeconds(), token.length);
  },
  // Fraction of second
  S(date2, token) {
    const numberOfDigits = token.length;
    const milliseconds = date2.getMilliseconds();
    const fractionalSeconds = Math.trunc(
      milliseconds * Math.pow(10, numberOfDigits - 3)
    );
    return addLeadingZeros(fractionalSeconds, token.length);
  }
};

// node_modules/date-fns/_lib/format/formatters.mjs
var dayPeriodEnum = {
  am: "am",
  pm: "pm",
  midnight: "midnight",
  noon: "noon",
  morning: "morning",
  afternoon: "afternoon",
  evening: "evening",
  night: "night"
};
var formatters = {
  // Era
  G: function(date2, token, localize3) {
    const era = date2.getFullYear() > 0 ? 1 : 0;
    switch (token) {
      // AD, BC
      case "G":
      case "GG":
      case "GGG":
        return localize3.era(era, { width: "abbreviated" });
      // A, B
      case "GGGGG":
        return localize3.era(era, { width: "narrow" });
      // Anno Domini, Before Christ
      case "GGGG":
      default:
        return localize3.era(era, { width: "wide" });
    }
  },
  // Year
  y: function(date2, token, localize3) {
    if (token === "yo") {
      const signedYear = date2.getFullYear();
      const year = signedYear > 0 ? signedYear : 1 - signedYear;
      return localize3.ordinalNumber(year, { unit: "year" });
    }
    return lightFormatters.y(date2, token);
  },
  // Local week-numbering year
  Y: function(date2, token, localize3, options) {
    const signedWeekYear = getWeekYear(date2, options);
    const weekYear = signedWeekYear > 0 ? signedWeekYear : 1 - signedWeekYear;
    if (token === "YY") {
      const twoDigitYear = weekYear % 100;
      return addLeadingZeros(twoDigitYear, 2);
    }
    if (token === "Yo") {
      return localize3.ordinalNumber(weekYear, { unit: "year" });
    }
    return addLeadingZeros(weekYear, token.length);
  },
  // ISO week-numbering year
  R: function(date2, token) {
    const isoWeekYear = getISOWeekYear(date2);
    return addLeadingZeros(isoWeekYear, token.length);
  },
  // Extended year. This is a single number designating the year of this calendar system.
  // The main difference between `y` and `u` localizers are B.C. years:
  // | Year | `y` | `u` |
  // |------|-----|-----|
  // | AC 1 |   1 |   1 |
  // | BC 1 |   1 |   0 |
  // | BC 2 |   2 |  -1 |
  // Also `yy` always returns the last two digits of a year,
  // while `uu` pads single digit years to 2 characters and returns other years unchanged.
  u: function(date2, token) {
    const year = date2.getFullYear();
    return addLeadingZeros(year, token.length);
  },
  // Quarter
  Q: function(date2, token, localize3) {
    const quarter = Math.ceil((date2.getMonth() + 1) / 3);
    switch (token) {
      // 1, 2, 3, 4
      case "Q":
        return String(quarter);
      // 01, 02, 03, 04
      case "QQ":
        return addLeadingZeros(quarter, 2);
      // 1st, 2nd, 3rd, 4th
      case "Qo":
        return localize3.ordinalNumber(quarter, { unit: "quarter" });
      // Q1, Q2, Q3, Q4
      case "QQQ":
        return localize3.quarter(quarter, {
          width: "abbreviated",
          context: "formatting"
        });
      // 1, 2, 3, 4 (narrow quarter; could be not numerical)
      case "QQQQQ":
        return localize3.quarter(quarter, {
          width: "narrow",
          context: "formatting"
        });
      // 1st quarter, 2nd quarter, ...
      case "QQQQ":
      default:
        return localize3.quarter(quarter, {
          width: "wide",
          context: "formatting"
        });
    }
  },
  // Stand-alone quarter
  q: function(date2, token, localize3) {
    const quarter = Math.ceil((date2.getMonth() + 1) / 3);
    switch (token) {
      // 1, 2, 3, 4
      case "q":
        return String(quarter);
      // 01, 02, 03, 04
      case "qq":
        return addLeadingZeros(quarter, 2);
      // 1st, 2nd, 3rd, 4th
      case "qo":
        return localize3.ordinalNumber(quarter, { unit: "quarter" });
      // Q1, Q2, Q3, Q4
      case "qqq":
        return localize3.quarter(quarter, {
          width: "abbreviated",
          context: "standalone"
        });
      // 1, 2, 3, 4 (narrow quarter; could be not numerical)
      case "qqqqq":
        return localize3.quarter(quarter, {
          width: "narrow",
          context: "standalone"
        });
      // 1st quarter, 2nd quarter, ...
      case "qqqq":
      default:
        return localize3.quarter(quarter, {
          width: "wide",
          context: "standalone"
        });
    }
  },
  // Month
  M: function(date2, token, localize3) {
    const month = date2.getMonth();
    switch (token) {
      case "M":
      case "MM":
        return lightFormatters.M(date2, token);
      // 1st, 2nd, ..., 12th
      case "Mo":
        return localize3.ordinalNumber(month + 1, { unit: "month" });
      // Jan, Feb, ..., Dec
      case "MMM":
        return localize3.month(month, {
          width: "abbreviated",
          context: "formatting"
        });
      // J, F, ..., D
      case "MMMMM":
        return localize3.month(month, {
          width: "narrow",
          context: "formatting"
        });
      // January, February, ..., December
      case "MMMM":
      default:
        return localize3.month(month, { width: "wide", context: "formatting" });
    }
  },
  // Stand-alone month
  L: function(date2, token, localize3) {
    const month = date2.getMonth();
    switch (token) {
      // 1, 2, ..., 12
      case "L":
        return String(month + 1);
      // 01, 02, ..., 12
      case "LL":
        return addLeadingZeros(month + 1, 2);
      // 1st, 2nd, ..., 12th
      case "Lo":
        return localize3.ordinalNumber(month + 1, { unit: "month" });
      // Jan, Feb, ..., Dec
      case "LLL":
        return localize3.month(month, {
          width: "abbreviated",
          context: "standalone"
        });
      // J, F, ..., D
      case "LLLLL":
        return localize3.month(month, {
          width: "narrow",
          context: "standalone"
        });
      // January, February, ..., December
      case "LLLL":
      default:
        return localize3.month(month, { width: "wide", context: "standalone" });
    }
  },
  // Local week of year
  w: function(date2, token, localize3, options) {
    const week = getWeek(date2, options);
    if (token === "wo") {
      return localize3.ordinalNumber(week, { unit: "week" });
    }
    return addLeadingZeros(week, token.length);
  },
  // ISO week of year
  I: function(date2, token, localize3) {
    const isoWeek = getISOWeek(date2);
    if (token === "Io") {
      return localize3.ordinalNumber(isoWeek, { unit: "week" });
    }
    return addLeadingZeros(isoWeek, token.length);
  },
  // Day of the month
  d: function(date2, token, localize3) {
    if (token === "do") {
      return localize3.ordinalNumber(date2.getDate(), { unit: "date" });
    }
    return lightFormatters.d(date2, token);
  },
  // Day of year
  D: function(date2, token, localize3) {
    const dayOfYear = getDayOfYear(date2);
    if (token === "Do") {
      return localize3.ordinalNumber(dayOfYear, { unit: "dayOfYear" });
    }
    return addLeadingZeros(dayOfYear, token.length);
  },
  // Day of week
  E: function(date2, token, localize3) {
    const dayOfWeek = date2.getDay();
    switch (token) {
      // Tue
      case "E":
      case "EE":
      case "EEE":
        return localize3.day(dayOfWeek, {
          width: "abbreviated",
          context: "formatting"
        });
      // T
      case "EEEEE":
        return localize3.day(dayOfWeek, {
          width: "narrow",
          context: "formatting"
        });
      // Tu
      case "EEEEEE":
        return localize3.day(dayOfWeek, {
          width: "short",
          context: "formatting"
        });
      // Tuesday
      case "EEEE":
      default:
        return localize3.day(dayOfWeek, {
          width: "wide",
          context: "formatting"
        });
    }
  },
  // Local day of week
  e: function(date2, token, localize3, options) {
    const dayOfWeek = date2.getDay();
    const localDayOfWeek = (dayOfWeek - options.weekStartsOn + 8) % 7 || 7;
    switch (token) {
      // Numerical value (Nth day of week with current locale or weekStartsOn)
      case "e":
        return String(localDayOfWeek);
      // Padded numerical value
      case "ee":
        return addLeadingZeros(localDayOfWeek, 2);
      // 1st, 2nd, ..., 7th
      case "eo":
        return localize3.ordinalNumber(localDayOfWeek, { unit: "day" });
      case "eee":
        return localize3.day(dayOfWeek, {
          width: "abbreviated",
          context: "formatting"
        });
      // T
      case "eeeee":
        return localize3.day(dayOfWeek, {
          width: "narrow",
          context: "formatting"
        });
      // Tu
      case "eeeeee":
        return localize3.day(dayOfWeek, {
          width: "short",
          context: "formatting"
        });
      // Tuesday
      case "eeee":
      default:
        return localize3.day(dayOfWeek, {
          width: "wide",
          context: "formatting"
        });
    }
  },
  // Stand-alone local day of week
  c: function(date2, token, localize3, options) {
    const dayOfWeek = date2.getDay();
    const localDayOfWeek = (dayOfWeek - options.weekStartsOn + 8) % 7 || 7;
    switch (token) {
      // Numerical value (same as in `e`)
      case "c":
        return String(localDayOfWeek);
      // Padded numerical value
      case "cc":
        return addLeadingZeros(localDayOfWeek, token.length);
      // 1st, 2nd, ..., 7th
      case "co":
        return localize3.ordinalNumber(localDayOfWeek, { unit: "day" });
      case "ccc":
        return localize3.day(dayOfWeek, {
          width: "abbreviated",
          context: "standalone"
        });
      // T
      case "ccccc":
        return localize3.day(dayOfWeek, {
          width: "narrow",
          context: "standalone"
        });
      // Tu
      case "cccccc":
        return localize3.day(dayOfWeek, {
          width: "short",
          context: "standalone"
        });
      // Tuesday
      case "cccc":
      default:
        return localize3.day(dayOfWeek, {
          width: "wide",
          context: "standalone"
        });
    }
  },
  // ISO day of week
  i: function(date2, token, localize3) {
    const dayOfWeek = date2.getDay();
    const isoDayOfWeek = dayOfWeek === 0 ? 7 : dayOfWeek;
    switch (token) {
      // 2
      case "i":
        return String(isoDayOfWeek);
      // 02
      case "ii":
        return addLeadingZeros(isoDayOfWeek, token.length);
      // 2nd
      case "io":
        return localize3.ordinalNumber(isoDayOfWeek, { unit: "day" });
      // Tue
      case "iii":
        return localize3.day(dayOfWeek, {
          width: "abbreviated",
          context: "formatting"
        });
      // T
      case "iiiii":
        return localize3.day(dayOfWeek, {
          width: "narrow",
          context: "formatting"
        });
      // Tu
      case "iiiiii":
        return localize3.day(dayOfWeek, {
          width: "short",
          context: "formatting"
        });
      // Tuesday
      case "iiii":
      default:
        return localize3.day(dayOfWeek, {
          width: "wide",
          context: "formatting"
        });
    }
  },
  // AM or PM
  a: function(date2, token, localize3) {
    const hours = date2.getHours();
    const dayPeriodEnumValue = hours / 12 >= 1 ? "pm" : "am";
    switch (token) {
      case "a":
      case "aa":
        return localize3.dayPeriod(dayPeriodEnumValue, {
          width: "abbreviated",
          context: "formatting"
        });
      case "aaa":
        return localize3.dayPeriod(dayPeriodEnumValue, {
          width: "abbreviated",
          context: "formatting"
        }).toLowerCase();
      case "aaaaa":
        return localize3.dayPeriod(dayPeriodEnumValue, {
          width: "narrow",
          context: "formatting"
        });
      case "aaaa":
      default:
        return localize3.dayPeriod(dayPeriodEnumValue, {
          width: "wide",
          context: "formatting"
        });
    }
  },
  // AM, PM, midnight, noon
  b: function(date2, token, localize3) {
    const hours = date2.getHours();
    let dayPeriodEnumValue;
    if (hours === 12) {
      dayPeriodEnumValue = dayPeriodEnum.noon;
    } else if (hours === 0) {
      dayPeriodEnumValue = dayPeriodEnum.midnight;
    } else {
      dayPeriodEnumValue = hours / 12 >= 1 ? "pm" : "am";
    }
    switch (token) {
      case "b":
      case "bb":
        return localize3.dayPeriod(dayPeriodEnumValue, {
          width: "abbreviated",
          context: "formatting"
        });
      case "bbb":
        return localize3.dayPeriod(dayPeriodEnumValue, {
          width: "abbreviated",
          context: "formatting"
        }).toLowerCase();
      case "bbbbb":
        return localize3.dayPeriod(dayPeriodEnumValue, {
          width: "narrow",
          context: "formatting"
        });
      case "bbbb":
      default:
        return localize3.dayPeriod(dayPeriodEnumValue, {
          width: "wide",
          context: "formatting"
        });
    }
  },
  // in the morning, in the afternoon, in the evening, at night
  B: function(date2, token, localize3) {
    const hours = date2.getHours();
    let dayPeriodEnumValue;
    if (hours >= 17) {
      dayPeriodEnumValue = dayPeriodEnum.evening;
    } else if (hours >= 12) {
      dayPeriodEnumValue = dayPeriodEnum.afternoon;
    } else if (hours >= 4) {
      dayPeriodEnumValue = dayPeriodEnum.morning;
    } else {
      dayPeriodEnumValue = dayPeriodEnum.night;
    }
    switch (token) {
      case "B":
      case "BB":
      case "BBB":
        return localize3.dayPeriod(dayPeriodEnumValue, {
          width: "abbreviated",
          context: "formatting"
        });
      case "BBBBB":
        return localize3.dayPeriod(dayPeriodEnumValue, {
          width: "narrow",
          context: "formatting"
        });
      case "BBBB":
      default:
        return localize3.dayPeriod(dayPeriodEnumValue, {
          width: "wide",
          context: "formatting"
        });
    }
  },
  // Hour [1-12]
  h: function(date2, token, localize3) {
    if (token === "ho") {
      let hours = date2.getHours() % 12;
      if (hours === 0) hours = 12;
      return localize3.ordinalNumber(hours, { unit: "hour" });
    }
    return lightFormatters.h(date2, token);
  },
  // Hour [0-23]
  H: function(date2, token, localize3) {
    if (token === "Ho") {
      return localize3.ordinalNumber(date2.getHours(), { unit: "hour" });
    }
    return lightFormatters.H(date2, token);
  },
  // Hour [0-11]
  K: function(date2, token, localize3) {
    const hours = date2.getHours() % 12;
    if (token === "Ko") {
      return localize3.ordinalNumber(hours, { unit: "hour" });
    }
    return addLeadingZeros(hours, token.length);
  },
  // Hour [1-24]
  k: function(date2, token, localize3) {
    let hours = date2.getHours();
    if (hours === 0) hours = 24;
    if (token === "ko") {
      return localize3.ordinalNumber(hours, { unit: "hour" });
    }
    return addLeadingZeros(hours, token.length);
  },
  // Minute
  m: function(date2, token, localize3) {
    if (token === "mo") {
      return localize3.ordinalNumber(date2.getMinutes(), { unit: "minute" });
    }
    return lightFormatters.m(date2, token);
  },
  // Second
  s: function(date2, token, localize3) {
    if (token === "so") {
      return localize3.ordinalNumber(date2.getSeconds(), { unit: "second" });
    }
    return lightFormatters.s(date2, token);
  },
  // Fraction of second
  S: function(date2, token) {
    return lightFormatters.S(date2, token);
  },
  // Timezone (ISO-8601. If offset is 0, output is always `'Z'`)
  X: function(date2, token, _localize) {
    const timezoneOffset = date2.getTimezoneOffset();
    if (timezoneOffset === 0) {
      return "Z";
    }
    switch (token) {
      // Hours and optional minutes
      case "X":
        return formatTimezoneWithOptionalMinutes(timezoneOffset);
      // Hours, minutes and optional seconds without `:` delimiter
      // Note: neither ISO-8601 nor JavaScript supports seconds in timezone offsets
      // so this token always has the same output as `XX`
      case "XXXX":
      case "XX":
        return formatTimezone(timezoneOffset);
      // Hours, minutes and optional seconds with `:` delimiter
      // Note: neither ISO-8601 nor JavaScript supports seconds in timezone offsets
      // so this token always has the same output as `XXX`
      case "XXXXX":
      case "XXX":
      // Hours and minutes with `:` delimiter
      default:
        return formatTimezone(timezoneOffset, ":");
    }
  },
  // Timezone (ISO-8601. If offset is 0, output is `'+00:00'` or equivalent)
  x: function(date2, token, _localize) {
    const timezoneOffset = date2.getTimezoneOffset();
    switch (token) {
      // Hours and optional minutes
      case "x":
        return formatTimezoneWithOptionalMinutes(timezoneOffset);
      // Hours, minutes and optional seconds without `:` delimiter
      // Note: neither ISO-8601 nor JavaScript supports seconds in timezone offsets
      // so this token always has the same output as `xx`
      case "xxxx":
      case "xx":
        return formatTimezone(timezoneOffset);
      // Hours, minutes and optional seconds with `:` delimiter
      // Note: neither ISO-8601 nor JavaScript supports seconds in timezone offsets
      // so this token always has the same output as `xxx`
      case "xxxxx":
      case "xxx":
      // Hours and minutes with `:` delimiter
      default:
        return formatTimezone(timezoneOffset, ":");
    }
  },
  // Timezone (GMT)
  O: function(date2, token, _localize) {
    const timezoneOffset = date2.getTimezoneOffset();
    switch (token) {
      // Short
      case "O":
      case "OO":
      case "OOO":
        return "GMT" + formatTimezoneShort(timezoneOffset, ":");
      // Long
      case "OOOO":
      default:
        return "GMT" + formatTimezone(timezoneOffset, ":");
    }
  },
  // Timezone (specific non-location)
  z: function(date2, token, _localize) {
    const timezoneOffset = date2.getTimezoneOffset();
    switch (token) {
      // Short
      case "z":
      case "zz":
      case "zzz":
        return "GMT" + formatTimezoneShort(timezoneOffset, ":");
      // Long
      case "zzzz":
      default:
        return "GMT" + formatTimezone(timezoneOffset, ":");
    }
  },
  // Seconds timestamp
  t: function(date2, token, _localize) {
    const timestamp2 = Math.trunc(date2.getTime() / 1e3);
    return addLeadingZeros(timestamp2, token.length);
  },
  // Milliseconds timestamp
  T: function(date2, token, _localize) {
    const timestamp2 = date2.getTime();
    return addLeadingZeros(timestamp2, token.length);
  }
};
function formatTimezoneShort(offset, delimiter = "") {
  const sign = offset > 0 ? "-" : "+";
  const absOffset = Math.abs(offset);
  const hours = Math.trunc(absOffset / 60);
  const minutes = absOffset % 60;
  if (minutes === 0) {
    return sign + String(hours);
  }
  return sign + String(hours) + delimiter + addLeadingZeros(minutes, 2);
}
function formatTimezoneWithOptionalMinutes(offset, delimiter) {
  if (offset % 60 === 0) {
    const sign = offset > 0 ? "-" : "+";
    return sign + addLeadingZeros(Math.abs(offset) / 60, 2);
  }
  return formatTimezone(offset, delimiter);
}
function formatTimezone(offset, delimiter = "") {
  const sign = offset > 0 ? "-" : "+";
  const absOffset = Math.abs(offset);
  const hours = addLeadingZeros(Math.trunc(absOffset / 60), 2);
  const minutes = addLeadingZeros(absOffset % 60, 2);
  return sign + hours + delimiter + minutes;
}

// node_modules/date-fns/_lib/format/longFormatters.mjs
var dateLongFormatter = (pattern, formatLong3) => {
  switch (pattern) {
    case "P":
      return formatLong3.date({ width: "short" });
    case "PP":
      return formatLong3.date({ width: "medium" });
    case "PPP":
      return formatLong3.date({ width: "long" });
    case "PPPP":
    default:
      return formatLong3.date({ width: "full" });
  }
};
var timeLongFormatter = (pattern, formatLong3) => {
  switch (pattern) {
    case "p":
      return formatLong3.time({ width: "short" });
    case "pp":
      return formatLong3.time({ width: "medium" });
    case "ppp":
      return formatLong3.time({ width: "long" });
    case "pppp":
    default:
      return formatLong3.time({ width: "full" });
  }
};
var dateTimeLongFormatter = (pattern, formatLong3) => {
  const matchResult = pattern.match(/(P+)(p+)?/) || [];
  const datePattern = matchResult[1];
  const timePattern = matchResult[2];
  if (!timePattern) {
    return dateLongFormatter(pattern, formatLong3);
  }
  let dateTimeFormat;
  switch (datePattern) {
    case "P":
      dateTimeFormat = formatLong3.dateTime({ width: "short" });
      break;
    case "PP":
      dateTimeFormat = formatLong3.dateTime({ width: "medium" });
      break;
    case "PPP":
      dateTimeFormat = formatLong3.dateTime({ width: "long" });
      break;
    case "PPPP":
    default:
      dateTimeFormat = formatLong3.dateTime({ width: "full" });
      break;
  }
  return dateTimeFormat.replace("{{date}}", dateLongFormatter(datePattern, formatLong3)).replace("{{time}}", timeLongFormatter(timePattern, formatLong3));
};
var longFormatters = {
  p: timeLongFormatter,
  P: dateTimeLongFormatter
};

// node_modules/date-fns/_lib/protectedTokens.mjs
var dayOfYearTokenRE = /^D+$/;
var weekYearTokenRE = /^Y+$/;
var throwTokens = ["D", "DD", "YY", "YYYY"];
function isProtectedDayOfYearToken(token) {
  return dayOfYearTokenRE.test(token);
}
function isProtectedWeekYearToken(token) {
  return weekYearTokenRE.test(token);
}
function warnOrThrowProtectedError(token, format2, input) {
  const _message = message(token, format2, input);
  console.warn(_message);
  if (throwTokens.includes(token)) throw new RangeError(_message);
}
function message(token, format2, input) {
  const subject = token[0] === "Y" ? "years" : "days of the month";
  return `Use \`${token.toLowerCase()}\` instead of \`${token}\` (in \`${format2}\`) for formatting ${subject} to the input \`${input}\`; see: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md`;
}

// node_modules/date-fns/format.mjs
var formattingTokensRegExp = /[yYQqMLwIdDecihHKkms]o|(\w)\1*|''|'(''|[^'])+('|$)|./g;
var longFormattingTokensRegExp = /P+p+|P+|p+|''|'(''|[^'])+('|$)|./g;
var escapedStringRegExp = /^'([^]*?)'?$/;
var doubleQuoteRegExp = /''/g;
var unescapedLatinCharacterRegExp = /[a-zA-Z]/;
function format(date2, formatStr, options) {
  const defaultOptions2 = getDefaultOptions();
  const locale = options?.locale ?? defaultOptions2.locale ?? enUS;
  const firstWeekContainsDate = options?.firstWeekContainsDate ?? options?.locale?.options?.firstWeekContainsDate ?? defaultOptions2.firstWeekContainsDate ?? defaultOptions2.locale?.options?.firstWeekContainsDate ?? 1;
  const weekStartsOn = options?.weekStartsOn ?? options?.locale?.options?.weekStartsOn ?? defaultOptions2.weekStartsOn ?? defaultOptions2.locale?.options?.weekStartsOn ?? 0;
  const originalDate = toDate(date2);
  if (!isValid2(originalDate)) {
    throw new RangeError("Invalid time value");
  }
  let parts = formatStr.match(longFormattingTokensRegExp).map((substring) => {
    const firstCharacter = substring[0];
    if (firstCharacter === "p" || firstCharacter === "P") {
      const longFormatter = longFormatters[firstCharacter];
      return longFormatter(substring, locale.formatLong);
    }
    return substring;
  }).join("").match(formattingTokensRegExp).map((substring) => {
    if (substring === "''") {
      return { isToken: false, value: "'" };
    }
    const firstCharacter = substring[0];
    if (firstCharacter === "'") {
      return { isToken: false, value: cleanEscapedString(substring) };
    }
    if (formatters[firstCharacter]) {
      return { isToken: true, value: substring };
    }
    if (firstCharacter.match(unescapedLatinCharacterRegExp)) {
      throw new RangeError(
        "Format string contains an unescaped latin alphabet character `" + firstCharacter + "`"
      );
    }
    return { isToken: false, value: substring };
  });
  if (locale.localize.preprocessor) {
    parts = locale.localize.preprocessor(originalDate, parts);
  }
  const formatterOptions = {
    firstWeekContainsDate,
    weekStartsOn,
    locale
  };
  return parts.map((part) => {
    if (!part.isToken) return part.value;
    const token = part.value;
    if (!options?.useAdditionalWeekYearTokens && isProtectedWeekYearToken(token) || !options?.useAdditionalDayOfYearTokens && isProtectedDayOfYearToken(token)) {
      warnOrThrowProtectedError(token, formatStr, String(date2));
    }
    const formatter = formatters[token[0]];
    return formatter(originalDate, token, locale.localize, formatterOptions);
  }).join("");
}
function cleanEscapedString(input) {
  const matched = input.match(escapedStringRegExp);
  if (!matched) {
    return input;
  }
  return matched[1].replace(doubleQuoteRegExp, "'");
}

// node_modules/date-fns/locale/es/_lib/formatDistance.mjs
var formatDistanceLocale2 = {
  lessThanXSeconds: {
    one: "menos de un segundo",
    other: "menos de {{count}} segundos"
  },
  xSeconds: {
    one: "1 segundo",
    other: "{{count}} segundos"
  },
  halfAMinute: "medio minuto",
  lessThanXMinutes: {
    one: "menos de un minuto",
    other: "menos de {{count}} minutos"
  },
  xMinutes: {
    one: "1 minuto",
    other: "{{count}} minutos"
  },
  aboutXHours: {
    one: "alrededor de 1 hora",
    other: "alrededor de {{count}} horas"
  },
  xHours: {
    one: "1 hora",
    other: "{{count}} horas"
  },
  xDays: {
    one: "1 d\xEDa",
    other: "{{count}} d\xEDas"
  },
  aboutXWeeks: {
    one: "alrededor de 1 semana",
    other: "alrededor de {{count}} semanas"
  },
  xWeeks: {
    one: "1 semana",
    other: "{{count}} semanas"
  },
  aboutXMonths: {
    one: "alrededor de 1 mes",
    other: "alrededor de {{count}} meses"
  },
  xMonths: {
    one: "1 mes",
    other: "{{count}} meses"
  },
  aboutXYears: {
    one: "alrededor de 1 a\xF1o",
    other: "alrededor de {{count}} a\xF1os"
  },
  xYears: {
    one: "1 a\xF1o",
    other: "{{count}} a\xF1os"
  },
  overXYears: {
    one: "m\xE1s de 1 a\xF1o",
    other: "m\xE1s de {{count}} a\xF1os"
  },
  almostXYears: {
    one: "casi 1 a\xF1o",
    other: "casi {{count}} a\xF1os"
  }
};
var formatDistance2 = (token, count, options) => {
  let result;
  const tokenValue = formatDistanceLocale2[token];
  if (typeof tokenValue === "string") {
    result = tokenValue;
  } else if (count === 1) {
    result = tokenValue.one;
  } else {
    result = tokenValue.other.replace("{{count}}", count.toString());
  }
  if (options?.addSuffix) {
    if (options.comparison && options.comparison > 0) {
      return "en " + result;
    } else {
      return "hace " + result;
    }
  }
  return result;
};

// node_modules/date-fns/locale/es/_lib/formatLong.mjs
var dateFormats2 = {
  full: "EEEE, d 'de' MMMM 'de' y",
  long: "d 'de' MMMM 'de' y",
  medium: "d MMM y",
  short: "dd/MM/y"
};
var timeFormats2 = {
  full: "HH:mm:ss zzzz",
  long: "HH:mm:ss z",
  medium: "HH:mm:ss",
  short: "HH:mm"
};
var dateTimeFormats2 = {
  full: "{{date}} 'a las' {{time}}",
  long: "{{date}} 'a las' {{time}}",
  medium: "{{date}}, {{time}}",
  short: "{{date}}, {{time}}"
};
var formatLong2 = {
  date: buildFormatLongFn({
    formats: dateFormats2,
    defaultWidth: "full"
  }),
  time: buildFormatLongFn({
    formats: timeFormats2,
    defaultWidth: "full"
  }),
  dateTime: buildFormatLongFn({
    formats: dateTimeFormats2,
    defaultWidth: "full"
  })
};

// node_modules/date-fns/locale/es/_lib/formatRelative.mjs
var formatRelativeLocale2 = {
  lastWeek: "'el' eeee 'pasado a la' p",
  yesterday: "'ayer a la' p",
  today: "'hoy a la' p",
  tomorrow: "'ma\xF1ana a la' p",
  nextWeek: "eeee 'a la' p",
  other: "P"
};
var formatRelativeLocalePlural = {
  lastWeek: "'el' eeee 'pasado a las' p",
  yesterday: "'ayer a las' p",
  today: "'hoy a las' p",
  tomorrow: "'ma\xF1ana a las' p",
  nextWeek: "eeee 'a las' p",
  other: "P"
};
var formatRelative2 = (token, date2, _baseDate, _options) => {
  if (date2.getHours() !== 1) {
    return formatRelativeLocalePlural[token];
  } else {
    return formatRelativeLocale2[token];
  }
};

// node_modules/date-fns/locale/es/_lib/localize.mjs
var eraValues2 = {
  narrow: ["AC", "DC"],
  abbreviated: ["AC", "DC"],
  wide: ["antes de cristo", "despu\xE9s de cristo"]
};
var quarterValues2 = {
  narrow: ["1", "2", "3", "4"],
  abbreviated: ["T1", "T2", "T3", "T4"],
  wide: ["1\xBA trimestre", "2\xBA trimestre", "3\xBA trimestre", "4\xBA trimestre"]
};
var monthValues2 = {
  narrow: ["e", "f", "m", "a", "m", "j", "j", "a", "s", "o", "n", "d"],
  abbreviated: [
    "ene",
    "feb",
    "mar",
    "abr",
    "may",
    "jun",
    "jul",
    "ago",
    "sep",
    "oct",
    "nov",
    "dic"
  ],
  wide: [
    "enero",
    "febrero",
    "marzo",
    "abril",
    "mayo",
    "junio",
    "julio",
    "agosto",
    "septiembre",
    "octubre",
    "noviembre",
    "diciembre"
  ]
};
var dayValues2 = {
  narrow: ["d", "l", "m", "m", "j", "v", "s"],
  short: ["do", "lu", "ma", "mi", "ju", "vi", "s\xE1"],
  abbreviated: ["dom", "lun", "mar", "mi\xE9", "jue", "vie", "s\xE1b"],
  wide: [
    "domingo",
    "lunes",
    "martes",
    "mi\xE9rcoles",
    "jueves",
    "viernes",
    "s\xE1bado"
  ]
};
var dayPeriodValues2 = {
  narrow: {
    am: "a",
    pm: "p",
    midnight: "mn",
    noon: "md",
    morning: "ma\xF1ana",
    afternoon: "tarde",
    evening: "tarde",
    night: "noche"
  },
  abbreviated: {
    am: "AM",
    pm: "PM",
    midnight: "medianoche",
    noon: "mediodia",
    morning: "ma\xF1ana",
    afternoon: "tarde",
    evening: "tarde",
    night: "noche"
  },
  wide: {
    am: "a.m.",
    pm: "p.m.",
    midnight: "medianoche",
    noon: "mediodia",
    morning: "ma\xF1ana",
    afternoon: "tarde",
    evening: "tarde",
    night: "noche"
  }
};
var formattingDayPeriodValues2 = {
  narrow: {
    am: "a",
    pm: "p",
    midnight: "mn",
    noon: "md",
    morning: "de la ma\xF1ana",
    afternoon: "de la tarde",
    evening: "de la tarde",
    night: "de la noche"
  },
  abbreviated: {
    am: "AM",
    pm: "PM",
    midnight: "medianoche",
    noon: "mediodia",
    morning: "de la ma\xF1ana",
    afternoon: "de la tarde",
    evening: "de la tarde",
    night: "de la noche"
  },
  wide: {
    am: "a.m.",
    pm: "p.m.",
    midnight: "medianoche",
    noon: "mediodia",
    morning: "de la ma\xF1ana",
    afternoon: "de la tarde",
    evening: "de la tarde",
    night: "de la noche"
  }
};
var ordinalNumber2 = (dirtyNumber, _options) => {
  const number = Number(dirtyNumber);
  return number + "\xBA";
};
var localize2 = {
  ordinalNumber: ordinalNumber2,
  era: buildLocalizeFn({
    values: eraValues2,
    defaultWidth: "wide"
  }),
  quarter: buildLocalizeFn({
    values: quarterValues2,
    defaultWidth: "wide",
    argumentCallback: (quarter) => Number(quarter) - 1
  }),
  month: buildLocalizeFn({
    values: monthValues2,
    defaultWidth: "wide"
  }),
  day: buildLocalizeFn({
    values: dayValues2,
    defaultWidth: "wide"
  }),
  dayPeriod: buildLocalizeFn({
    values: dayPeriodValues2,
    defaultWidth: "wide",
    formattingValues: formattingDayPeriodValues2,
    defaultFormattingWidth: "wide"
  })
};

// node_modules/date-fns/locale/es/_lib/match.mjs
var matchOrdinalNumberPattern2 = /^(\d+)(º)?/i;
var parseOrdinalNumberPattern2 = /\d+/i;
var matchEraPatterns2 = {
  narrow: /^(ac|dc|a|d)/i,
  abbreviated: /^(a\.?\s?c\.?|a\.?\s?e\.?\s?c\.?|d\.?\s?c\.?|e\.?\s?c\.?)/i,
  wide: /^(antes de cristo|antes de la era com[uú]n|despu[eé]s de cristo|era com[uú]n)/i
};
var parseEraPatterns2 = {
  any: [/^ac/i, /^dc/i],
  wide: [
    /^(antes de cristo|antes de la era com[uú]n)/i,
    /^(despu[eé]s de cristo|era com[uú]n)/i
  ]
};
var matchQuarterPatterns2 = {
  narrow: /^[1234]/i,
  abbreviated: /^T[1234]/i,
  wide: /^[1234](º)? trimestre/i
};
var parseQuarterPatterns2 = {
  any: [/1/i, /2/i, /3/i, /4/i]
};
var matchMonthPatterns2 = {
  narrow: /^[efmajsond]/i,
  abbreviated: /^(ene|feb|mar|abr|may|jun|jul|ago|sep|oct|nov|dic)/i,
  wide: /^(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)/i
};
var parseMonthPatterns2 = {
  narrow: [
    /^e/i,
    /^f/i,
    /^m/i,
    /^a/i,
    /^m/i,
    /^j/i,
    /^j/i,
    /^a/i,
    /^s/i,
    /^o/i,
    /^n/i,
    /^d/i
  ],
  any: [
    /^en/i,
    /^feb/i,
    /^mar/i,
    /^abr/i,
    /^may/i,
    /^jun/i,
    /^jul/i,
    /^ago/i,
    /^sep/i,
    /^oct/i,
    /^nov/i,
    /^dic/i
  ]
};
var matchDayPatterns2 = {
  narrow: /^[dlmjvs]/i,
  short: /^(do|lu|ma|mi|ju|vi|s[áa])/i,
  abbreviated: /^(dom|lun|mar|mi[ée]|jue|vie|s[áa]b)/i,
  wide: /^(domingo|lunes|martes|mi[ée]rcoles|jueves|viernes|s[áa]bado)/i
};
var parseDayPatterns2 = {
  narrow: [/^d/i, /^l/i, /^m/i, /^m/i, /^j/i, /^v/i, /^s/i],
  any: [/^do/i, /^lu/i, /^ma/i, /^mi/i, /^ju/i, /^vi/i, /^sa/i]
};
var matchDayPeriodPatterns2 = {
  narrow: /^(a|p|mn|md|(de la|a las) (mañana|tarde|noche))/i,
  any: /^([ap]\.?\s?m\.?|medianoche|mediodia|(de la|a las) (mañana|tarde|noche))/i
};
var parseDayPeriodPatterns2 = {
  any: {
    am: /^a/i,
    pm: /^p/i,
    midnight: /^mn/i,
    noon: /^md/i,
    morning: /mañana/i,
    afternoon: /tarde/i,
    evening: /tarde/i,
    night: /noche/i
  }
};
var match2 = {
  ordinalNumber: buildMatchPatternFn({
    matchPattern: matchOrdinalNumberPattern2,
    parsePattern: parseOrdinalNumberPattern2,
    valueCallback: function(value) {
      return parseInt(value, 10);
    }
  }),
  era: buildMatchFn({
    matchPatterns: matchEraPatterns2,
    defaultMatchWidth: "wide",
    parsePatterns: parseEraPatterns2,
    defaultParseWidth: "any"
  }),
  quarter: buildMatchFn({
    matchPatterns: matchQuarterPatterns2,
    defaultMatchWidth: "wide",
    parsePatterns: parseQuarterPatterns2,
    defaultParseWidth: "any",
    valueCallback: (index) => index + 1
  }),
  month: buildMatchFn({
    matchPatterns: matchMonthPatterns2,
    defaultMatchWidth: "wide",
    parsePatterns: parseMonthPatterns2,
    defaultParseWidth: "any"
  }),
  day: buildMatchFn({
    matchPatterns: matchDayPatterns2,
    defaultMatchWidth: "wide",
    parsePatterns: parseDayPatterns2,
    defaultParseWidth: "any"
  }),
  dayPeriod: buildMatchFn({
    matchPatterns: matchDayPeriodPatterns2,
    defaultMatchWidth: "any",
    parsePatterns: parseDayPeriodPatterns2,
    defaultParseWidth: "any"
  })
};

// node_modules/date-fns/locale/es.mjs
var es = {
  code: "es",
  formatDistance: formatDistance2,
  formatLong: formatLong2,
  formatRelative: formatRelative2,
  localize: localize2,
  match: match2,
  options: {
    weekStartsOn: 1,
    firstWeekContainsDate: 1
  }
};

// server/routes.ts
var _storage = null;
async function getStorage() {
  if (!_storage) {
    const module = await Promise.resolve().then(() => (init_storage(), storage_exports));
    _storage = module.storage;
  }
  return _storage;
}
async function registerRoutes(app) {
  app.get("/api/pacientes", async (req, res) => {
    try {
      console.log("[API] /api/pacientes called");
      const storage2 = await getStorage();
      await storage2.ensureInitialized();
      const pacientes2 = await storage2.getPacientes();
      console.log("[API] /api/pacientes returning", pacientes2.length, "pacientes");
      res.json(pacientes2);
    } catch (error) {
      console.error("[API] Error in /api/pacientes:", error);
      if (error instanceof Error) {
        console.error("[API] Error message:", error.message);
        console.error("[API] Error stack:", error.stack);
      }
      const storage2 = await getStorage().catch(() => null);
      const pacientesCount = storage2 ? (await storage2.getPacientes().catch(() => [])).length : 0;
      res.status(500).json({
        error: "Error al obtener pacientes",
        details: error instanceof Error ? error.message : String(error),
        pacientesCount
      });
    }
  });
  app.post("/api/pacientes/calcular-perdidos", async (req, res) => {
    try {
      const storage2 = await getStorage();
      await storage2.ensureInitialized();
      const resultado = await storage2.calcularPacientesPerdidos();
      res.json(resultado);
    } catch (error) {
      res.status(500).json({ error: "Error al calcular pacientes perdidos" });
    }
  });
  app.post("/api/pacientes/perdidos", async (req, res) => {
    try {
      const storage2 = await getStorage();
      await storage2.ensureInitialized();
      const filtrosSchema = external_exports.object({
        prioridad: external_exports.enum(["Alta", "Media", "Baja", "Todas"]).optional(),
        diagnostico: external_exports.string().optional(),
        edadMin: external_exports.number().optional(),
        edadMax: external_exports.number().optional()
      });
      const filtros = filtrosSchema.parse(req.body);
      const pacientes2 = await storage2.getPacientesPerdidos(filtros);
      res.json(pacientes2);
    } catch (error) {
      if (error instanceof external_exports.ZodError) {
        res.status(400).json({ error: "Filtros inv\xE1lidos", details: error.errors });
      } else {
        res.status(500).json({ error: "Error al obtener pacientes perdidos" });
      }
    }
  });
  app.post("/api/pacientes/anadir-a-campana", async (req, res) => {
    try {
      const storage2 = await getStorage();
      const schema = external_exports.object({
        pacienteIds: external_exports.array(external_exports.string())
      });
      const { pacienteIds } = schema.parse(req.body);
      await storage2.anadirPacientesACampana(pacienteIds);
      res.json({ success: true, count: pacienteIds.length });
    } catch (error) {
      if (error instanceof external_exports.ZodError) {
        res.status(400).json({ error: "Datos inv\xE1lidos", details: error.errors });
      } else {
        res.status(500).json({ error: "Error al a\xF1adir pacientes a campa\xF1a" });
      }
    }
  });
  app.get("/api/campanas", async (req, res) => {
    try {
      const storage2 = await getStorage();
      await storage2.ensureInitialized();
      const campanas2 = await storage2.getCampanas();
      res.json(campanas2);
    } catch (error) {
      res.status(500).json({ error: "Error al obtener campa\xF1as" });
    }
  });
  app.post("/api/campanas", async (req, res) => {
    try {
      const storage2 = await getStorage();
      const campanaData = insertCampanaSchema.parse(req.body);
      const campana = await storage2.createCampana(campanaData);
      res.status(201).json(campana);
    } catch (error) {
      if (error instanceof external_exports.ZodError) {
        res.status(400).json({ error: "Datos inv\xE1lidos", details: error.errors });
      } else {
        res.status(500).json({ error: "Error al crear campa\xF1a" });
      }
    }
  });
  app.patch("/api/campanas/:id", async (req, res) => {
    try {
      const storage2 = await getStorage();
      const { id } = req.params;
      const schema = external_exports.object({
        estado: external_exports.string()
      });
      const { estado } = schema.parse(req.body);
      const campana = await storage2.updateCampanaEstado(id, estado);
      if (!campana) {
        res.status(404).json({ error: "Campa\xF1a no encontrada" });
        return;
      }
      res.json(campana);
    } catch (error) {
      if (error instanceof external_exports.ZodError) {
        res.status(400).json({ error: "Datos inv\xE1lidos", details: error.errors });
      } else {
        res.status(500).json({ error: "Error al actualizar campa\xF1a" });
      }
    }
  });
  app.get("/api/tareas", async (req, res) => {
    try {
      const storage2 = await getStorage();
      await storage2.ensureInitialized();
      const tareas = await storage2.getTareas();
      res.json(tareas);
    } catch (error) {
      res.status(500).json({ error: "Error al obtener tareas" });
    }
  });
  app.get("/api/tareas/:id", async (req, res) => {
    try {
      const storage2 = await getStorage();
      const { id } = req.params;
      const tareas = await storage2.getTareas();
      const tarea = tareas.find((t) => t.id === id);
      if (!tarea) {
        return res.status(404).json({ error: "Tarea no encontrada" });
      }
      res.json(tarea);
    } catch (error) {
      res.status(500).json({ error: "Error al obtener tarea" });
    }
  });
  app.get("/api/tareas/hoy", async (req, res) => {
    try {
      const storage2 = await getStorage();
      await storage2.ensureInitialized();
      const tareas = await storage2.getTareasParaHoy();
      res.json(tareas);
    } catch (error) {
      res.status(500).json({ error: "Error al obtener tareas para hoy" });
    }
  });
  app.patch("/api/tareas/:id", async (req, res) => {
    try {
      const storage2 = await getStorage();
      const { id } = req.params;
      const schema = external_exports.object({
        estado: external_exports.string().optional(),
        notas: external_exports.string().nullable().optional(),
        aprobado: external_exports.boolean().optional(),
        fechaProgramada: external_exports.string().nullable().optional(),
        fechaContacto: external_exports.string().nullable().optional(),
        fechaCompletada: external_exports.string().nullable().optional()
      });
      const updates = schema.parse(req.body);
      const tarea = await storage2.updateTarea(id, updates);
      if (!tarea) {
        res.status(404).json({ error: "Tarea no encontrada" });
        return;
      }
      res.json(tarea);
    } catch (error) {
      if (error instanceof external_exports.ZodError) {
        res.status(400).json({ error: "Datos inv\xE1lidos", details: error.errors });
      } else {
        res.status(500).json({ error: "Error al actualizar tarea" });
      }
    }
  });
  app.get("/api/dashboard/kpis", async (req, res) => {
    try {
      const storage2 = await getStorage();
      await storage2.ensureInitialized();
      const kpis = await storage2.getDashboardKPIs();
      res.json(kpis);
    } catch (error) {
      console.error("[API] Error in /api/dashboard/kpis:", error);
      res.status(500).json({ error: "Error al obtener KPIs", details: error instanceof Error ? error.message : String(error) });
    }
  });
  app.get("/api/dashboard/conversion-canal", async (req, res) => {
    try {
      const storage2 = await getStorage();
      await storage2.ensureInitialized();
      const conversion = await storage2.getConversionPorCanal();
      res.json(conversion);
    } catch (error) {
      console.error("[API] Error in /api/dashboard/conversion-canal:", error);
      res.status(500).json({ error: "Error al obtener conversi\xF3n por canal", details: error instanceof Error ? error.message : String(error) });
    }
  });
  app.get("/api/pacientes/en-riesgo", async (req, res) => {
    try {
      const storage2 = await getStorage();
      await storage2.ensureInitialized();
      const pacientes2 = await storage2.getPacientesEnRiesgo();
      res.json(pacientes2);
    } catch (error) {
      console.error("[API] Error in /api/pacientes/en-riesgo:", error);
      if (error instanceof Error) {
        console.error("[API] Error message:", error.message);
        console.error("[API] Error stack:", error.stack);
      }
      res.status(500).json({ error: "Error al obtener pacientes en riesgo", details: error instanceof Error ? error.message : String(error) });
    }
  });
  app.get("/api/pacientes/listos-campana/:campanaId", async (req, res) => {
    try {
      const storage2 = await getStorage();
      const { campanaId } = req.params;
      const pacientes2 = await storage2.getPacientesListosParaCampana(campanaId);
      res.json(pacientes2);
    } catch (error) {
      res.status(500).json({ error: "Error al obtener pacientes listos para campa\xF1a" });
    }
  });
  app.get("/api/conversaciones", async (req, res) => {
    try {
      const storage2 = await getStorage();
      await storage2.ensureInitialized();
      const conversaciones2 = await storage2.getConversaciones();
      res.json(conversaciones2);
    } catch (error) {
      res.status(500).json({ error: "Error al obtener conversaciones" });
    }
  });
  app.get("/api/conversaciones/:id", async (req, res) => {
    try {
      const storage2 = await getStorage();
      const { id } = req.params;
      const conversacion = await storage2.getConversacion(id);
      if (!conversacion) {
        res.status(404).json({ error: "Conversaci\xF3n no encontrada" });
        return;
      }
      const mensajes2 = await storage2.getMensajes(id);
      res.json({ conversacion, mensajes: mensajes2 });
    } catch (error) {
      res.status(500).json({ error: "Error al obtener conversaci\xF3n" });
    }
  });
  app.post("/api/conversaciones/:id/mensajes", async (req, res) => {
    try {
      const storage2 = await getStorage();
      const { id } = req.params;
      const schema = external_exports.object({
        contenido: external_exports.string().min(1)
      });
      const { contenido } = schema.parse(req.body);
      const mensaje = await storage2.createMensaje({
        type: "mensaje",
        channel: "whatsapp",
        conversacionId: id,
        contenido,
        direccion: "saliente",
        fechaEnvio: /* @__PURE__ */ new Date(),
        leido: true
      });
      res.status(201).json(mensaje);
    } catch (error) {
      if (error instanceof external_exports.ZodError) {
        res.status(400).json({ error: "Contenido inv\xE1lido", details: error.errors });
      } else {
        res.status(500).json({ error: "Error al enviar mensaje" });
      }
    }
  });
  app.patch("/api/conversaciones/:id/leer", async (req, res) => {
    try {
      const storage2 = await getStorage();
      const { id } = req.params;
      await storage2.marcarComoLeido(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Error al marcar como le\xEDda" });
    }
  });
  app.get("/api/conversaciones/sin-leer/count", async (req, res) => {
    try {
      const storage2 = await getStorage();
      await storage2.ensureInitialized();
      const count = await storage2.getConversacionesSinLeerCount();
      res.json({ count });
    } catch (error) {
      res.status(500).json({ error: "Error al obtener conteo" });
    }
  });
  app.get("/api/citas", async (req, res) => {
    try {
      const storage2 = await getStorage();
      await storage2.ensureInitialized();
      const citas2 = await storage2.getCitas();
      res.json(citas2);
    } catch (error) {
      res.status(500).json({ error: "Error al obtener citas" });
    }
  });
  app.get("/api/citas/semana", async (req, res) => {
    try {
      console.log("[API] /api/citas/semana called");
      const storage2 = await getStorage();
      await storage2.ensureInitialized();
      const { inicio, fin } = req.query;
      console.log("[API] Query params - inicio:", inicio, "fin:", fin);
      if (!inicio || !fin) {
        console.error("[API] Missing inicio or fin parameters");
        res.status(400).json({ error: "Se requieren las fechas inicio y fin" });
        return;
      }
      const fechaInicio = new Date(inicio);
      const fechaFin = new Date(fin);
      fechaInicio.setHours(0, 0, 0, 0);
      fechaFin.setHours(23, 59, 59, 999);
      console.log("[API] Date range - inicio:", fechaInicio.toISOString(), "fin:", fechaFin.toISOString());
      console.log("[API] Date range timestamps - inicio:", fechaInicio.getTime(), "fin:", fechaFin.getTime());
      const todasLasCitas = await storage2.getCitas();
      console.log("[API] Total citas en storage:", todasLasCitas.length);
      if (todasLasCitas.length > 0) {
        const primeraCita = todasLasCitas[0];
        const ultimaCita = todasLasCitas[todasLasCitas.length - 1];
        console.log("[API] Primera cita en storage:", primeraCita.fechaHora.toISOString(), "timestamp:", primeraCita.fechaHora.getTime());
        console.log("[API] \xDAltima cita en storage:", ultimaCita.fechaHora.toISOString(), "timestamp:", ultimaCita.fechaHora.getTime());
      }
      const citas2 = await storage2.getCitasPorSemana(fechaInicio, fechaFin);
      console.log("[API] Citas encontradas en rango:", citas2.length);
      if (citas2.length > 0) {
        console.log("[API] Primera cita:", {
          id: citas2[0].id,
          fechaHora: citas2[0].fechaHora,
          pacienteId: citas2[0].pacienteId
        });
      }
      res.json(citas2);
    } catch (error) {
      console.error("[API] Error in /api/citas/semana:", error);
      if (error instanceof Error) {
        console.error("[API] Error message:", error.message);
        console.error("[API] Error stack:", error.stack);
      }
      res.status(500).json({
        error: "Error al obtener citas de la semana",
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });
  app.get("/api/huecos-libres", async (req, res) => {
    try {
      const storage2 = await getStorage();
      const { inicio, fin, duracionMinutos } = req.query;
      if (!inicio || !fin) {
        res.status(400).json({ error: "Se requieren las fechas inicio y fin" });
        return;
      }
      const fechaInicio = new Date(inicio);
      const fechaFin = new Date(fin);
      if (isNaN(fechaInicio.getTime()) || isNaN(fechaFin.getTime())) {
        res.status(400).json({ error: "Fechas inv\xE1lidas. Formato esperado: ISO 8601" });
        return;
      }
      if (fechaInicio > fechaFin) {
        res.status(400).json({ error: "La fecha de inicio debe ser anterior a la fecha de fin" });
        return;
      }
      const duracion = duracionMinutos ? parseInt(duracionMinutos) : 30;
      const huecos = await storage2.detectarHuecosLibres(
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
  app.get("/api/citas/sugerir-pacientes", async (req, res) => {
    try {
      const storage2 = await getStorage();
      const { fecha, horaInicio, horaFin, limite } = req.query;
      if (!fecha || horaInicio === void 0 || horaFin === void 0) {
        res.status(400).json({ error: "Se requieren fecha, horaInicio y horaFin" });
        return;
      }
      const sugerencias = await storage2.sugerirPacientesParaHueco(
        new Date(fecha),
        parseInt(horaInicio),
        parseInt(horaFin),
        limite ? parseInt(limite) : 5
      );
      res.json(sugerencias);
    } catch (error) {
      console.error("Error sugiriendo pacientes:", error);
      res.status(500).json({ error: "Error al sugerir pacientes" });
    }
  });
  app.post("/api/citas/contactar-pacientes-hueco", async (req, res) => {
    try {
      const storage2 = await getStorage();
      const schema = external_exports.object({
        fecha: external_exports.string(),
        horaInicio: external_exports.number(),
        horaFin: external_exports.number(),
        pacienteIds: external_exports.array(external_exports.string()),
        tipoCita: external_exports.string().default("revision")
      });
      const { fecha, horaInicio, horaFin, pacienteIds, tipoCita } = schema.parse(req.body);
      const resultados = [];
      const { generateMessageIA: generateMessageIA2 } = await Promise.resolve().then(() => (init_openai2(), openai_exports));
      for (const pacienteId of pacienteIds) {
        const paciente = await storage2.getPaciente(pacienteId);
        if (!paciente) continue;
        const fechaHora = /* @__PURE__ */ new Date(`${fecha}T${horaInicio.toString().padStart(2, "0")}:00`);
        const fechaFormateada = format(fechaHora, "yyyy-MM-dd", { locale: es });
        const horaFormateada = format(fechaHora, "HH:mm", { locale: es });
        const mensaje = await generateMessageIA2({
          tipo: "contacto_hueco_libre",
          canal: paciente.whatsapp ? "whatsapp" : "sms",
          contexto: {
            paciente: {
              nombre: paciente.nombre,
              edad: paciente.edad
            },
            cita: {
              fecha: fechaFormateada,
              hora: horaFormateada,
              tipo: tipoCita
            },
            motivo: "Tenemos disponibilidad en este horario y pensamos en ti"
          }
        });
        await storage2.createAccion({
          tipo: "contacto_hueco_libre",
          estado: "ejecutada",
          titulo: `Contacto para hueco libre - ${paciente.nombre}`,
          descripcion: `Hueco disponible el ${format(fechaHora, "dd/MM/yyyy HH:mm", { locale: es })}`,
          pacienteId: paciente.id,
          canal: paciente.whatsapp ? "whatsapp" : "sms",
          mensaje: mensaje || null,
          requiereConfirmacion: false,
          ejecutadaAt: /* @__PURE__ */ new Date(),
          metadata: {
            fechaHueco: fechaHora.toISOString(),
            horaInicio,
            horaFin,
            tipoCita
          }
        });
        resultados.push({
          pacienteId: paciente.id,
          pacienteNombre: paciente.nombre,
          mensajeEnviado: true
        });
      }
      res.json({ resultados, total: resultados.length });
    } catch (error) {
      console.error("Error contactando pacientes:", error);
      res.status(500).json({ error: "Error al contactar pacientes" });
    }
  });
  app.get("/api/citas/:id", async (req, res) => {
    const rutasEspecificas = ["sugerir-pacientes", "semana", "send-bulk-reminders"];
    if (rutasEspecificas.includes(req.params.id)) {
      console.log(`ADVERTENCIA: Ruta espec\xEDfica "${req.params.id}" capturada por /api/citas/:id`);
      res.status(404).json({ error: "Ruta no encontrada" });
      return;
    }
    try {
      const storage2 = await getStorage();
      const { id } = req.params;
      const cita = await storage2.getCita(id);
      if (!cita) {
        res.status(404).json({ error: "Cita no encontrada" });
        return;
      }
      res.json(cita);
    } catch (error) {
      res.status(500).json({ error: "Error al obtener cita" });
    }
  });
  app.patch("/api/citas/:id", async (req, res) => {
    try {
      const storage2 = await getStorage();
      const { id } = req.params;
      const schema = external_exports.object({
        estado: external_exports.string().optional(),
        fechaHora: external_exports.string().optional()
      });
      const data = schema.parse(req.body);
      let cita;
      if (data.estado) {
        cita = await storage2.updateCitaEstado(id, data.estado);
      }
      if (data.fechaHora) {
        cita = await storage2.updateCitaFechaHora(id, new Date(data.fechaHora));
      }
      if (!cita) {
        res.status(404).json({ error: "Cita no encontrada" });
        return;
      }
      res.json(cita);
    } catch (error) {
      if (error instanceof external_exports.ZodError) {
        res.status(400).json({ error: "Datos inv\xE1lidos", details: error.errors });
      } else {
        res.status(500).json({ error: "Error al actualizar cita" });
      }
    }
  });
  app.get("/api/recordatorios", async (req, res) => {
    try {
      const storage2 = await getStorage();
      await storage2.ensureInitialized();
      const recordatorios2 = await storage2.getRecordatorios();
      res.json(recordatorios2);
    } catch (error) {
      res.status(500).json({ error: "Error al obtener recordatorios" });
    }
  });
  app.post("/api/recordatorios", async (req, res) => {
    try {
      const storage2 = await getStorage();
      const recordatorioData = insertRecordatorioSchema.parse(req.body);
      const recordatorio = await storage2.createRecordatorio(recordatorioData);
      res.status(201).json(recordatorio);
    } catch (error) {
      if (error instanceof external_exports.ZodError) {
        res.status(400).json({ error: "Datos inv\xE1lidos", details: error.errors });
      } else {
        res.status(500).json({ error: "Error al crear recordatorio" });
      }
    }
  });
  app.patch("/api/recordatorios/:id", async (req, res) => {
    try {
      const storage2 = await getStorage();
      const { id } = req.params;
      const recordatorio = await storage2.updateRecordatorio(id, req.body);
      if (!recordatorio) {
        res.status(404).json({ error: "Recordatorio no encontrado" });
        return;
      }
      res.json(recordatorio);
    } catch (error) {
      res.status(500).json({ error: "Error al actualizar recordatorio" });
    }
  });
  app.delete("/api/recordatorios/:id", async (req, res) => {
    try {
      const storage2 = await getStorage();
      const { id } = req.params;
      const deleted = await storage2.deleteRecordatorio(id);
      if (!deleted) {
        res.status(404).json({ error: "Recordatorio no encontrado" });
        return;
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Error al eliminar recordatorio" });
    }
  });
  app.get("/api/budgets", async (req, res) => {
    try {
      const storage2 = await getStorage();
      console.log("[API] /api/budgets called");
      await storage2.ensureInitialized();
      const budgets2 = await storage2.getBudgets();
      console.log("[API] /api/budgets returning", budgets2.length, "budgets");
      res.json(budgets2);
    } catch (error) {
      console.error("[API] Error in /api/budgets:", error);
      if (error instanceof Error) {
        console.error("[API] Error message:", error.message);
        console.error("[API] Error stack:", error.stack);
      }
      res.status(500).json({
        error: "Error al obtener presupuestos",
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });
  app.get("/api/budgets/:id", async (req, res) => {
    try {
      const storage2 = await getStorage();
      const { id } = req.params;
      const budget = await storage2.getBudget(id);
      if (!budget) {
        res.status(404).json({ error: "Presupuesto no encontrado" });
        return;
      }
      res.json(budget);
    } catch (error) {
      res.status(500).json({ error: "Error al obtener presupuesto" });
    }
  });
  app.get("/api/budgets/:id/secuencia", async (req, res) => {
    try {
      const storage2 = await getStorage();
      const { id } = req.params;
      const secuencia = await storage2.getSecuenciaComunicacionPorBudget(id);
      if (!secuencia) {
        res.status(404).json({ error: "Secuencia no encontrada" });
        return;
      }
      const regla = await storage2.getReglaComunicacion(secuencia.reglaId);
      res.json({
        secuencia,
        regla
      });
    } catch (error) {
      res.status(500).json({ error: "Error al obtener secuencia" });
    }
  });
  app.get("/api/budgets/:id/touchpoints", async (req, res) => {
    try {
      const storage2 = await getStorage();
      const { id } = req.params;
      const acciones2 = await storage2.getAcciones({ tipo: "relance", limit: 100 });
      const touchpoints = acciones2.filter((a) => a.budgetId === id);
      res.json(touchpoints);
    } catch (error) {
      res.status(500).json({ error: "Error al obtener touchpoints" });
    }
  });
  app.post("/api/budgets", async (req, res) => {
    try {
      const storage2 = await getStorage();
      const schema = external_exports.object({
        patientId: external_exports.string(),
        amount: external_exports.string(),
        treatmentDetails: external_exports.string(),
        clinicId: external_exports.string().optional()
      });
      const data = schema.parse(req.body);
      const pacientes2 = await storage2.getPacientes();
      const patient = pacientes2.find((p) => p.id === data.patientId);
      const clinicId = data.clinicId || patient?.clinicId || "default-clinic";
      const budget = await storage2.createBudget({
        patientId: data.patientId,
        clinicId,
        amount: data.amount,
        treatmentDetails: data.treatmentDetails
      });
      res.status(201).json(budget);
    } catch (error) {
      if (error instanceof external_exports.ZodError) {
        res.status(400).json({ error: "Datos inv\xE1lidos", details: error.errors });
      } else {
        console.error("Error creating budget:", error);
        res.status(500).json({ error: "Error al crear presupuesto" });
      }
    }
  });
  app.patch("/api/budgets/:id/status", async (req, res) => {
    try {
      const storage2 = await getStorage();
      const { id } = req.params;
      const schema = external_exports.object({
        status: external_exports.enum(["pending", "accepted", "rejected"])
      });
      const { status } = schema.parse(req.body);
      const budget = await storage2.updateBudgetStatus(id, status);
      if (!budget) {
        res.status(404).json({ error: "Presupuesto no encontrado" });
        return;
      }
      res.json(budget);
    } catch (error) {
      if (error instanceof external_exports.ZodError) {
        res.status(400).json({ error: "Datos inv\xE1lidos", details: error.errors });
      } else {
        res.status(500).json({ error: "Error al actualizar presupuesto" });
      }
    }
  });
  app.post("/api/budgets/:id/generate-relance", async (req, res) => {
    try {
      const storage2 = await getStorage();
      const { id } = req.params;
      const schema = external_exports.object({
        channel: external_exports.enum(["sms", "email", "whatsapp"])
      });
      const { channel } = schema.parse(req.body);
      const budget = await storage2.getBudget(id);
      if (!budget) {
        res.status(404).json({ error: "Presupuesto no encontrado" });
        return;
      }
      const pacientes2 = await storage2.getPacientes();
      const patient = pacientes2.find((p) => p.id === budget.patientId);
      if (!patient) {
        res.status(404).json({ error: "Paciente no encontrado" });
        return;
      }
      const { generateRelanceMessage: generateRelanceMessage2 } = await Promise.resolve().then(() => (init_openai2(), openai_exports));
      const daysPending = Math.ceil(
        ((/* @__PURE__ */ new Date()).getTime() - new Date(budget.createdAt || /* @__PURE__ */ new Date()).getTime()) / (1e3 * 60 * 60 * 24)
      );
      const message2 = await generateRelanceMessage2(
        {
          nombre: patient.nombre,
          edad: patient.edad,
          historial: patient.diagnostico
        },
        {
          amount: Number(budget.amount),
          treatmentDetails: budget.treatmentDetails
        },
        channel,
        daysPending
      );
      res.json({ message: message2 });
    } catch (error) {
      console.error("Error generating relance:", error);
      res.status(500).json({ error: "Error al generar relance" });
    }
  });
  app.post("/api/budgets/:id/send-relance", async (req, res) => {
    try {
      const storage2 = await getStorage();
      const { id } = req.params;
      const schema = external_exports.object({
        message: external_exports.string(),
        channel: external_exports.enum(["sms", "email", "whatsapp"])
      });
      const { message: message2, channel } = schema.parse(req.body);
      const budget = await storage2.getBudget(id);
      if (!budget) {
        res.status(404).json({ error: "Presupuesto no encontrado" });
        return;
      }
      const mensajes2 = await storage2.getMensajes("");
      const messageId = `msg-${Date.now()}`;
      res.json({
        success: true,
        messageId,
        sentAt: /* @__PURE__ */ new Date(),
        channel
      });
    } catch (error) {
      console.error("Error sending relance:", error);
      res.status(500).json({ error: "Error al enviar relance" });
    }
  });
  app.post("/api/budgets/:id/generate-post-visit", async (req, res) => {
    try {
      const storage2 = await getStorage();
      const { id } = req.params;
      const budget = await storage2.getBudget(id);
      if (!budget) {
        res.status(404).json({ error: "Presupuesto no encontrado" });
        return;
      }
      const pacientes2 = await storage2.getPacientes();
      const patient = pacientes2.find((p) => p.id === budget.patientId);
      if (!patient) {
        res.status(404).json({ error: "Paciente no encontrado" });
        return;
      }
      const { generatePostVisitMessage: generatePostVisitMessage2 } = await Promise.resolve().then(() => (init_openai2(), openai_exports));
      const treatmentDetails = budget.treatmentDetails;
      const treatment = Array.isArray(treatmentDetails?.procedures) ? treatmentDetails.procedures.join(", ") : "tratamiento dental";
      const message2 = await generatePostVisitMessage2(
        {
          nombre: patient.nombre,
          edad: patient.edad
        },
        treatment
      );
      res.json({ message: message2 });
    } catch (error) {
      console.error("Error generating post-visit message:", error);
      res.status(500).json({ error: "Error al generar mensaje post-visita" });
    }
  });
  app.post("/api/budgets/:id/send-post-visit", async (req, res) => {
    try {
      const { id } = req.params;
      const schema = external_exports.object({
        message: external_exports.string()
      });
      const { message: message2 } = schema.parse(req.body);
      res.json({
        success: true,
        sentAt: /* @__PURE__ */ new Date()
      });
    } catch (error) {
      console.error("Error sending post-visit message:", error);
      res.status(500).json({ error: "Error al enviar mensaje post-visita" });
    }
  });
  app.post("/api/citas/:id/send-reminder", async (req, res) => {
    try {
      const storage2 = await getStorage();
      const { id } = req.params;
      const schema = external_exports.object({
        channel: external_exports.enum(["sms", "email", "whatsapp"])
      });
      const { channel } = schema.parse(req.body);
      const cita = await storage2.getCita(id);
      if (!cita) {
        res.status(404).json({ error: "Cita no encontrada" });
        return;
      }
      const pacientes2 = await storage2.getPacientes();
      const patient = pacientes2.find((p) => p.id === cita.pacienteId);
      if (!patient) {
        res.status(404).json({ error: "Paciente no encontrado" });
        return;
      }
      const { generateReminderMessage: generateReminderMessage2 } = await Promise.resolve().then(() => (init_openai2(), openai_exports));
      const hoursBefore = Math.ceil(
        (new Date(cita.fechaHora).getTime() - (/* @__PURE__ */ new Date()).getTime()) / (1e3 * 60 * 60)
      );
      const message2 = await generateReminderMessage2(
        {
          nombre: patient.nombre,
          edad: patient.edad
        },
        new Date(cita.fechaHora),
        cita.tipo,
        hoursBefore
      );
      res.json({
        success: true,
        message: message2,
        sentAt: /* @__PURE__ */ new Date(),
        channel
      });
    } catch (error) {
      console.error("Error sending reminder:", error);
      res.status(500).json({ error: "Error al enviar recordatorio" });
    }
  });
  app.post("/api/citas/send-bulk-reminders", async (req, res) => {
    try {
      const storage2 = await getStorage();
      const schema = external_exports.object({
        date: external_exports.string(),
        channel: external_exports.enum(["sms", "email", "whatsapp"])
      });
      const { date: date2, channel } = schema.parse(req.body);
      const targetDate = new Date(date2);
      const citas2 = await storage2.getCitas();
      const citasDelDia = citas2.filter((c) => {
        const fechaCita = new Date(c.fechaHora);
        return fechaCita.getDate() === targetDate.getDate() && fechaCita.getMonth() === targetDate.getMonth() && fechaCita.getFullYear() === targetDate.getFullYear() && c.estado === "programada";
      });
      res.json({
        success: true,
        count: citasDelDia.length,
        sentAt: /* @__PURE__ */ new Date()
      });
    } catch (error) {
      console.error("Error sending bulk reminders:", error);
      res.status(500).json({ error: "Error al enviar recordatorios masivos" });
    }
  });
  app.get("/api/tratamientos-preventivos", async (req, res) => {
    try {
      const storage2 = await getStorage();
      await storage2.ensureInitialized();
      const pacienteId = req.query.pacienteId;
      const tratamientos = await storage2.getTratamientosPreventivos({ pacienteId });
      res.json(tratamientos);
    } catch (error) {
      res.status(500).json({ error: "Error al obtener tratamientos preventivos" });
    }
  });
  app.post("/api/tratamientos-preventivos", async (req, res) => {
    try {
      const storage2 = await getStorage();
      const schema = external_exports.object({
        pacienteId: external_exports.string(),
        clinicId: external_exports.string(),
        tipoTratamiento: external_exports.string(),
        fechaRealizacion: external_exports.string(),
        frecuenciaMeses: external_exports.number(),
        citaId: external_exports.string().nullable().optional(),
        budgetId: external_exports.string().nullable().optional(),
        notas: external_exports.string().nullable().optional()
      });
      const data = schema.parse(req.body);
      const fechaRealizacion = new Date(data.fechaRealizacion);
      const proximaFecha = new Date(fechaRealizacion);
      proximaFecha.setMonth(proximaFecha.getMonth() + data.frecuenciaMeses);
      const tratamiento = await storage2.createTratamientoPreventivo({
        pacienteId: data.pacienteId,
        clinicId: data.clinicId,
        tipoTratamiento: data.tipoTratamiento,
        fechaRealizacion,
        proximaFechaRecomendada: proximaFecha,
        frecuenciaMeses: data.frecuenciaMeses,
        citaId: data.citaId || null,
        budgetId: data.budgetId || null,
        notas: data.notas || null
      });
      res.status(201).json(tratamiento);
    } catch (error) {
      if (error instanceof external_exports.ZodError) {
        res.status(400).json({ error: "Datos inv\xE1lidos", details: error.errors });
      } else {
        console.error("Error creating tratamiento preventivo:", error);
        res.status(500).json({ error: "Error al crear tratamiento preventivo" });
      }
    }
  });
  app.get("/api/tratamientos-preventivos/pendientes", async (req, res) => {
    try {
      const storage2 = await getStorage();
      await storage2.ensureInitialized();
      const recordatorios2 = await storage2.getRecordatoriosPreventivosPendientes();
      res.json(recordatorios2);
    } catch (error) {
      res.status(500).json({ error: "Error al obtener recordatorios preventivos pendientes" });
    }
  });
  app.get("/api/reglas-comunicacion", async (req, res) => {
    try {
      const storage2 = await getStorage();
      await storage2.ensureInitialized();
      const reglas = await storage2.getReglasComunicacion();
      res.json(reglas);
    } catch (error) {
      console.error("[API] Error in /api/reglas-comunicacion:", error);
      res.status(500).json({ error: "Error al obtener reglas de comunicaci\xF3n", details: error instanceof Error ? error.message : String(error) });
    }
  });
  app.get("/api/reglas-comunicacion/:id", async (req, res) => {
    try {
      const storage2 = await getStorage();
      const regla = await storage2.getReglaComunicacion(req.params.id);
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
      const storage2 = await getStorage();
      const schema = external_exports.object({
        nombre: external_exports.string(),
        tipo: external_exports.enum(["relance_presupuesto", "recordatorio_cita", "post_visita", "salud_preventiva", "recall_paciente"]),
        activa: external_exports.boolean().optional(),
        secuencia: external_exports.array(external_exports.object({
          orden: external_exports.number(),
          canal: external_exports.enum(["whatsapp", "sms", "email", "llamada"]),
          diasDespues: external_exports.number(),
          accion: external_exports.enum(["enviar", "programar_llamada", "escalar"]),
          mensaje: external_exports.string().optional(),
          requiereConfirmacion: external_exports.boolean().optional()
        })),
        criterios: external_exports.any().optional()
      });
      const data = schema.parse(req.body);
      const regla = await storage2.createReglaComunicacion(data);
      res.status(201).json(regla);
    } catch (error) {
      if (error instanceof external_exports.ZodError) {
        res.status(400).json({ error: "Datos inv\xE1lidos", details: error.errors });
      } else {
        console.error("Error creating regla:", error);
        res.status(500).json({ error: "Error al crear regla" });
      }
    }
  });
  app.put("/api/reglas-comunicacion/:id", async (req, res) => {
    try {
      const storage2 = await getStorage();
      const schema = external_exports.object({
        nombre: external_exports.string().optional(),
        activa: external_exports.boolean().optional(),
        secuencia: external_exports.array(external_exports.object({
          orden: external_exports.number(),
          canal: external_exports.enum(["whatsapp", "sms", "email", "llamada"]),
          diasDespues: external_exports.number(),
          accion: external_exports.enum(["enviar", "programar_llamada", "escalar"]),
          mensaje: external_exports.string().optional(),
          requiereConfirmacion: external_exports.boolean().optional()
        })).optional(),
        criterios: external_exports.any().optional()
      });
      const data = schema.parse(req.body);
      const regla = await storage2.updateReglaComunicacion(req.params.id, data);
      if (!regla) {
        res.status(404).json({ error: "Regla no encontrada" });
        return;
      }
      res.json(regla);
    } catch (error) {
      if (error instanceof external_exports.ZodError) {
        res.status(400).json({ error: "Datos inv\xE1lidos", details: error.errors });
      } else {
        res.status(500).json({ error: "Error al actualizar regla" });
      }
    }
  });
  app.delete("/api/reglas-comunicacion/:id", async (req, res) => {
    try {
      const storage2 = await getStorage();
      const deleted = await storage2.deleteReglaComunicacion(req.params.id);
      if (!deleted) {
        res.status(404).json({ error: "Regla no encontrada" });
        return;
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Error al eliminar regla" });
    }
  });
  app.get("/api/secuencias-comunicacion", async (req, res) => {
    try {
      const storage2 = await getStorage();
      console.log("[API] /api/secuencias-comunicacion called with tipo:", req.query.tipo, "estado:", req.query.estado);
      await storage2.ensureInitialized();
      const tipo = req.query.tipo;
      const estado = req.query.estado;
      const secuencias = await storage2.getSecuenciasComunicacion({ tipo, estado });
      console.log("[API] /api/secuencias-comunicacion returning", secuencias.length, "secuencias");
      res.json(secuencias);
    } catch (error) {
      console.error("[API] Error in /api/secuencias-comunicacion:", error);
      if (error instanceof Error) {
        console.error("[API] Error message:", error.message);
        console.error("[API] Error stack:", error.stack);
      }
      res.json([]);
    }
  });
  app.get("/api/secuencias-comunicacion/:id", async (req, res) => {
    try {
      const storage2 = await getStorage();
      const secuencia = await storage2.getSecuenciaComunicacion(req.params.id);
      if (!secuencia) {
        res.status(404).json({ error: "Secuencia no encontrada" });
        return;
      }
      res.json(secuencia);
    } catch (error) {
      res.status(500).json({ error: "Error al obtener secuencia" });
    }
  });
  app.get("/api/acciones", async (req, res) => {
    try {
      const storage2 = await getStorage();
      await storage2.ensureInitialized();
      const estado = req.query.estado;
      const tipo = req.query.tipo;
      const limit2 = req.query.limit ? parseInt(req.query.limit) : void 0;
      const acciones2 = await storage2.getAcciones({ estado, tipo, limit: limit2 });
      res.json(acciones2);
    } catch (error) {
      res.status(500).json({ error: "Error al obtener acciones" });
    }
  });
  app.post("/api/acciones/:id/confirmar", async (req, res) => {
    try {
      const storage2 = await getStorage();
      const { id } = req.params;
      const accion = await storage2.confirmarAccion(id);
      if (!accion) {
        res.status(404).json({ error: "Acci\xF3n no encontrada" });
        return;
      }
      res.json(accion);
    } catch (error) {
      res.status(500).json({ error: "Error al confirmar acci\xF3n" });
    }
  });
  app.post("/api/acciones/:id/rechazar", async (req, res) => {
    try {
      const storage2 = await getStorage();
      const { id } = req.params;
      const accion = await storage2.updateAccionEstado(id, "rechazada");
      if (!accion) {
        res.status(404).json({ error: "Acci\xF3n no encontrada" });
        return;
      }
      res.json(accion);
    } catch (error) {
      res.status(500).json({ error: "Error al rechazar acci\xF3n" });
    }
  });
  app.get("/api/dashboard/dentaliq-kpis", async (req, res) => {
    try {
      const storage2 = await getStorage();
      console.log("[API] /api/dashboard/dentaliq-kpis called");
      await storage2.ensureInitialized();
      const budgets2 = await storage2.getBudgets();
      console.log("[API] Budgets count:", budgets2.length);
      const kpis = await storage2.getDentalIQKPIs();
      console.log("[API] KPIs returned:", JSON.stringify(kpis));
      res.json(kpis);
    } catch (error) {
      console.error("[API] Error getting KPIs:", error);
      if (error instanceof Error) {
        console.error("[API] Error stack:", error.stack);
      }
      res.status(500).json({ error: "Error al obtener KPIs", details: error instanceof Error ? error.message : "Unknown error" });
    }
  });
  app.get("/api/presupuestos/acciones-hoy", async (req, res) => {
    try {
      const storage2 = await getStorage();
      await storage2.ensureInitialized();
      const hoy = /* @__PURE__ */ new Date();
      hoy.setHours(0, 0, 0, 0);
      const ma\u00F1ana = new Date(hoy);
      ma\u00F1ana.setDate(ma\u00F1ana.getDate() + 1);
      const secuencias = await storage2.getSecuenciasComunicacion({
        tipo: "relance_presupuesto",
        estado: "activa"
      });
      const accionesHoy = [];
      for (const secuencia of secuencias) {
        if (!secuencia.proximaAccion) continue;
        const fechaProxima = new Date(secuencia.proximaAccion);
        fechaProxima.setHours(0, 0, 0, 0);
        if (fechaProxima.getTime() === hoy.getTime() || fechaProxima.getTime() < hoy.getTime()) {
          const budget = await storage2.getBudget(secuencia.budgetId || "");
          if (!budget || budget.status !== "pending") continue;
          const regla = await storage2.getReglaComunicacion(secuencia.reglaId);
          if (!regla) continue;
          const pasos = regla.secuencia;
          const pasoActual = pasos[secuencia.pasoActual || 0];
          if (pasoActual) {
            accionesHoy.push({
              budget,
              secuencia,
              regla,
              pasoActual,
              pasoNumero: (secuencia.pasoActual || 0) + 1,
              totalPasos: pasos.length
            });
          }
        }
      }
      res.json(accionesHoy);
    } catch (error) {
      console.error("Error obteniendo acciones del d\xEDa para presupuestos:", error);
      res.status(500).json({ error: "Error al obtener acciones del d\xEDa" });
    }
  });
  app.get("/api/acciones-del-dia", async (req, res) => {
    try {
      const storage2 = await getStorage();
      await storage2.ensureInitialized();
      const hoy = /* @__PURE__ */ new Date();
      hoy.setHours(0, 0, 0, 0);
      const ma\u00F1ana = new Date(hoy);
      ma\u00F1ana.setDate(ma\u00F1ana.getDate() + 1);
      const accionesHoy = [];
      const citas2 = await storage2.getCitas();
      const citasRecordatorio = citas2.filter((c) => {
        if (c.estado !== "programada") return false;
        const fechaCita = new Date(c.fechaHora);
        const horasAntes = (fechaCita.getTime() - hoy.getTime()) / (1e3 * 60 * 60);
        return horasAntes > 23 && horasAntes < 25 || horasAntes > 0.5 && horasAntes < 1.5;
      });
      for (const cita of citasRecordatorio) {
        const paciente = await storage2.getPaciente(cita.pacienteId);
        if (!paciente) continue;
        const fechaCita = new Date(cita.fechaHora);
        const horasAntes = (fechaCita.getTime() - hoy.getTime()) / (1e3 * 60 * 60);
        const tipoRecordatorio = horasAntes > 23 ? "24h" : "1h";
        accionesHoy.push({
          tipo: "recordatorio",
          automatica: true,
          paciente,
          cita,
          tipoRecordatorio,
          fechaCita,
          canal: paciente.whatsapp ? "whatsapp" : "sms",
          horaProgramada: fechaCita
        });
      }
      const secuenciasPostVisita = await storage2.getSecuenciasComunicacion({
        tipo: "post_visita",
        estado: "activa"
      });
      for (const secuencia of secuenciasPostVisita) {
        if (!secuencia.proximaAccion) continue;
        const proximaAccion = new Date(secuencia.proximaAccion);
        proximaAccion.setHours(0, 0, 0, 0);
        if (proximaAccion.getTime() >= hoy.getTime() && proximaAccion.getTime() < ma\u00F1ana.getTime()) {
          const paciente = await storage2.getPaciente(secuencia.pacienteId);
          if (!paciente) continue;
          const regla = await storage2.getReglaComunicacion(secuencia.reglaId);
          if (!regla) continue;
          const pasos = regla.secuencia;
          const pasoActual = pasos[secuencia.pasoActual || 0];
          if (pasoActual) {
            accionesHoy.push({
              tipo: "post_visita",
              automatica: true,
              paciente,
              secuencia,
              pasoActual,
              canal: pasoActual.canal,
              horaProgramada: new Date(secuencia.proximaAccion)
            });
          }
        }
      }
      const secuenciasPresupuestos = await storage2.getSecuenciasComunicacion({
        tipo: "relance_presupuesto",
        estado: "activa"
      });
      for (const secuencia of secuenciasPresupuestos) {
        if (!secuencia.proximaAccion) continue;
        const proximaAccion = new Date(secuencia.proximaAccion);
        proximaAccion.setHours(0, 0, 0, 0);
        if (proximaAccion.getTime() >= hoy.getTime() && proximaAccion.getTime() < ma\u00F1ana.getTime()) {
          const budget = await storage2.getBudget(secuencia.budgetId);
          if (!budget) continue;
          const regla = await storage2.getReglaComunicacion(secuencia.reglaId);
          if (!regla) continue;
          const pasos = regla.secuencia;
          const pasoActual = pasos[secuencia.pasoActual || 0];
          if (pasoActual) {
            accionesHoy.push({
              tipo: "relance_presupuesto",
              automatica: true,
              budget,
              secuencia,
              pasoActual,
              canal: pasoActual.canal,
              horaProgramada: new Date(secuencia.proximaAccion)
            });
          }
        }
      }
      const secuenciasRecall = await storage2.getSecuenciasComunicacion({
        tipo: "recall_paciente",
        estado: "activa"
      });
      for (const secuencia of secuenciasRecall) {
        if (!secuencia.proximaAccion) continue;
        const proximaAccion = new Date(secuencia.proximaAccion);
        proximaAccion.setHours(0, 0, 0, 0);
        if (proximaAccion.getTime() >= hoy.getTime() && proximaAccion.getTime() < ma\u00F1ana.getTime()) {
          const paciente = await storage2.getPaciente(secuencia.pacienteId);
          if (!paciente) continue;
          const regla = await storage2.getReglaComunicacion(secuencia.reglaId);
          if (!regla) continue;
          const pasos = regla.secuencia;
          const pasoActual = pasos[secuencia.pasoActual || 0];
          if (pasoActual) {
            accionesHoy.push({
              tipo: "recall_paciente",
              automatica: true,
              paciente,
              secuencia,
              pasoActual,
              canal: pasoActual.canal,
              horaProgramada: new Date(secuencia.proximaAccion)
            });
          }
        }
      }
      const tareasLlamadas2 = await storage2.getTareas();
      const tareasHoy = tareasLlamadas2.filter((t) => {
        if (t.estado !== "pendiente") return false;
        if (!t.fechaProgramada) return false;
        const fechaProgramada = new Date(t.fechaProgramada);
        fechaProgramada.setHours(0, 0, 0, 0);
        return fechaProgramada.getTime() >= hoy.getTime() && fechaProgramada.getTime() < ma\u00F1ana.getTime();
      });
      for (const tarea of tareasHoy) {
        const paciente = await storage2.getPaciente(tarea.pacienteId);
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
            notas: tarea.notas
          },
          motivo: tarea.motivo,
          prioridad: tarea.prioridad,
          telefono: tarea.telefono,
          horaProgramada: tarea.fechaProgramada ? new Date(tarea.fechaProgramada) : /* @__PURE__ */ new Date()
        });
      }
      accionesHoy.sort((a, b) => {
        const horaA = a.horaProgramada ? new Date(a.horaProgramada).getTime() : 0;
        const horaB = b.horaProgramada ? new Date(b.horaProgramada).getTime() : 0;
        return horaA - horaB;
      });
      res.json(accionesHoy);
    } catch (error) {
      console.error("Error obteniendo acciones del d\xEDa:", error);
      res.status(500).json({ error: "Error al obtener acciones del d\xEDa" });
    }
  });
  app.get("/api/pacientes/acciones-hoy", async (req, res) => {
    try {
      const storage2 = await getStorage();
      await storage2.ensureInitialized();
      const hoy = /* @__PURE__ */ new Date();
      hoy.setHours(0, 0, 0, 0);
      const accionesHoy = [];
      const citas2 = await storage2.getCitas();
      const citasRecordatorio = citas2.filter((c) => {
        if (c.estado !== "programada") return false;
        const fechaCita = new Date(c.fechaHora);
        const horasAntes = (fechaCita.getTime() - hoy.getTime()) / (1e3 * 60 * 60);
        return horasAntes > 23 && horasAntes < 25 || horasAntes > 0.5 && horasAntes < 1.5;
      });
      for (const cita of citasRecordatorio) {
        const paciente = await storage2.getPaciente(cita.pacienteId);
        if (!paciente) continue;
        const fechaCita = new Date(cita.fechaHora);
        const horasAntes = (fechaCita.getTime() - hoy.getTime()) / (1e3 * 60 * 60);
        const tipoRecordatorio = horasAntes > 23 ? "24h" : "1h";
        accionesHoy.push({
          tipo: "recordatorio",
          paciente,
          cita,
          tipoRecordatorio,
          fechaCita,
          canal: paciente.whatsapp ? "whatsapp" : "sms"
        });
      }
      const recordatoriosPreventivos = await storage2.getRecordatoriosPreventivosPendientes();
      for (const recordatorio of recordatoriosPreventivos) {
        const paciente = await storage2.getPaciente(recordatorio.pacienteId);
        if (!paciente) continue;
        accionesHoy.push({
          tipo: "preventivo",
          paciente,
          recordatorio,
          canal: recordatorio.canalSiguiente
        });
      }
      const pacientesDormidos = await storage2.getPacientesPerdidos();
      for (const paciente of pacientesDormidos.slice(0, 10)) {
        const secuencias = await storage2.getSecuenciasComunicacion({
          tipo: "recuperacion_paciente",
          estado: "activa"
        });
        const tieneSecuenciaActiva = secuencias.some((s) => s.pacienteId === paciente.id);
        if (!tieneSecuenciaActiva) {
          accionesHoy.push({
            tipo: "recuperacion",
            paciente,
            mesesSinVisita: paciente.mesesSinVisita || 0,
            prioridad: paciente.prioridad || "Media"
          });
        }
      }
      res.json(accionesHoy);
    } catch (error) {
      console.error("Error obteniendo acciones del d\xEDa para pacientes:", error);
      res.status(500).json({ error: "Error al obtener acciones del d\xEDa" });
    }
  });
  app.post("/api/ia/generar-mensaje", async (req, res) => {
    try {
      const { generateCommunicationRuleMessage: generateCommunicationRuleMessage2 } = await Promise.resolve().then(() => (init_openai2(), openai_exports));
      const schema = external_exports.object({
        tipo: external_exports.enum(["relance_presupuesto", "recordatorio_cita", "post_visita", "salud_preventiva", "recall_paciente"]),
        canal: external_exports.enum(["sms", "email", "whatsapp", "llamada"]),
        pasoNumero: external_exports.number().int().positive(),
        contexto: external_exports.object({
          nombrePaciente: external_exports.string().optional(),
          monto: external_exports.number().optional(),
          tratamiento: external_exports.string().optional(),
          diasPendientes: external_exports.number().optional(),
          fechaCita: external_exports.string().optional(),
          tipoTratamiento: external_exports.string().optional()
        }).optional()
      });
      const { tipo, canal, pasoNumero, contexto } = schema.parse(req.body);
      const contextoFormateado = contexto ? {
        ...contexto,
        fechaCita: contexto.fechaCita ? new Date(contexto.fechaCita) : void 0
      } : void 0;
      const mensaje = await generateCommunicationRuleMessage2(tipo, canal, pasoNumero, contextoFormateado);
      res.json({ mensaje });
    } catch (error) {
      if (error instanceof external_exports.ZodError) {
        res.status(400).json({ error: "Datos inv\xE1lidos", details: error.errors });
      } else {
        console.error("Error generando mensaje con IA:", error);
        res.status(500).json({ error: "Error al generar mensaje con IA" });
      }
    }
  });
  const httpServer = createServer(app);
  return httpServer;
}
export {
  registerRoutes
};
