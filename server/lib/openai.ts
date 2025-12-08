import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

interface PatientData {
  nombre: string;
  edad: number;
  historial?: string;
  ultimaVisita?: Date;
  budgetsAnteriores?: Array<{ amount: number; status: string }>;
}

interface BudgetDetails {
  amount: number;
  treatmentDetails: any;
  procedures?: string[];
}

/**
 * Calcula el urgency_score (0-100) basado en el tratamiento dental
 */
export async function calculateUrgencyScore(
  budgetDetails: BudgetDetails,
  patientData: PatientData
): Promise<number> {
  if (!process.env.OPENAI_API_KEY) {
    // Fallback sin API key - cálculo básico
    let score = 50;
    if (budgetDetails.procedures?.some((p: string) => 
      p.toLowerCase().includes("dolor") || 
      p.toLowerCase().includes("urgencia") ||
      p.toLowerCase().includes("infección")
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
- Monto total: ${budgetDetails.amount}€
- Edad del paciente: ${patientData.edad} años
- Historial: ${patientData.historial || "Sin historial disponible"}

Considera:
- Dolor o molestias mencionadas (aumenta urgencia)
- Tipo de procedimiento (preventivo vs urgente)
- Edad del paciente (mayor edad puede aumentar urgencia)
- Complejidad del tratamiento

Responde SOLO con un número del 0 al 100, sin texto adicional.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 10,
    });

    const score = parseInt(response.choices[0]?.message?.content?.trim() || "50");
    return Math.max(0, Math.min(100, score));
  } catch (error) {
    console.error("Error calculating urgency score:", error);
    return 50; // Fallback
  }
}

/**
 * Calcula la probabilidad de aceptación (0-100) basada en historial y precio
 */
export async function calculateAcceptanceProb(
  budgetDetails: BudgetDetails,
  patientData: PatientData
): Promise<number> {
  if (!process.env.OPENAI_API_KEY) {
    // Fallback sin API key
    let prob = 60;
    const avgBudget = patientData.budgetsAnteriores?.length 
      ? patientData.budgetsAnteriores.reduce((sum, b) => sum + Number(b.amount), 0) / patientData.budgetsAnteriores.length
      : 0;
    
    if (avgBudget > 0 && Number(budgetDetails.amount) <= avgBudget * 1.2) {
      prob = 75;
    } else if (Number(budgetDetails.amount) > avgBudget * 1.5) {
      prob = 40;
    }
    
    const acceptanceRate = patientData.budgetsAnteriores?.filter(b => b.status === "accepted").length || 0;
    if (acceptanceRate > 0) prob += 15;
    
    return Math.max(0, Math.min(100, prob));
  }

  try {
    const historialText = patientData.budgetsAnteriores?.length
      ? `Historial de presupuestos anteriores: ${JSON.stringify(patientData.budgetsAnteriores)}`
      : "Sin historial de presupuestos anteriores";

    const prompt = `Eres un agente IA dental experto. Calcula la probabilidad de aceptación (0-100) de este presupuesto.

Datos del paciente:
- Nombre: ${patientData.nombre}
- Edad: ${patientData.edad} años
${historialText}

Datos del presupuesto:
- Monto: ${budgetDetails.amount}€
- Tratamiento: ${JSON.stringify(budgetDetails.treatmentDetails?.procedures || [])}

Considera:
- Historial de aceptación/rechazo de presupuestos anteriores
- Comparación del precio con presupuestos anteriores
- Tipo de tratamiento (preventivo vs estético vs urgente)
- Patrones de comportamiento del paciente

Responde SOLO con un número del 0 al 100, sin texto adicional.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 10,
    });

    const prob = parseInt(response.choices[0]?.message?.content?.trim() || "60");
    return Math.max(0, Math.min(100, prob));
  } catch (error) {
    console.error("Error calculating acceptance probability:", error);
    return 60; // Fallback
  }
}

/**
 * Genera un mensaje de relance personalizado para un presupuesto
 */
export async function generateRelanceMessage(
  patientData: PatientData,
  budgetDetails: BudgetDetails,
  channel: "sms" | "email" | "whatsapp",
  diasPendientes: number
): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    // Fallback sin API key
    const baseMessage = `Hola ${patientData.nombre}, le recordamos que tiene un presupuesto pendiente de ${budgetDetails.amount}€ para ${budgetDetails.treatmentDetails?.procedures?.[0] || "tratamiento dental"}.`;
    const callToAction = channel === "whatsapp" 
      ? "¿Le gustaría agendar una cita para revisarlo?"
      : "Por favor, contáctenos para más información.";
    return `${baseMessage} ${callToAction}`;
  }

  try {
    const prompt = `Eres un agente IA dental amigable y empático. Genera un mensaje de relance personalizado para un presupuesto pendiente.

Paciente: ${patientData.nombre}
Presupuesto: ${budgetDetails.amount}€ para ${JSON.stringify(budgetDetails.treatmentDetails?.procedures || [])}
Días pendientes: ${diasPendientes} días
Canal: ${channel}
Edad paciente: ${patientData.edad} años

Requisitos:
- Tono amigable y humano, no robótico
- Empatía y comprensión
- Frecuencia basada en días pendientes (${diasPendientes} días)
- Incluir llamada a la acción suave
- Adaptado al canal (${channel})
- En español o francés según corresponda
- Máximo 160 caracteres si es SMS, más largo si es email/WhatsApp

Genera SOLO el mensaje, sin explicaciones adicionales.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: channel === "sms" ? 100 : 200,
    });

    return response.choices[0]?.message?.content?.trim() || "";
  } catch (error) {
    console.error("Error generating relance message:", error);
    return `Hola ${patientData.nombre}, le recordamos su presupuesto pendiente de ${budgetDetails.amount}€. ¿Le gustaría agendar una cita?`;
  }
}

/**
 * Genera un mensaje post-visita para fidelización
 */
export async function generatePostVisitMessage(
  patientData: PatientData,
  treatment: string
): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    return `Hola ${patientData.nombre}, esperamos que su tratamiento de ${treatment} haya ido bien. ¿Cómo se siente? Su opinión es muy importante para nosotros.`;
  }

  try {
    const prompt = `Eres un agente IA dental amigable. Genera un mensaje post-visita de fidelización.

Paciente: ${patientData.nombre}
Tratamiento realizado: ${treatment}
Edad: ${patientData.edad} años

Objetivos:
- Preguntar por feedback
- Fomentar reseñas positivas
- Sugerir cuidados preventivos (upsell suave)
- Tono cálido y personalizado
- En español o francés

Genera SOLO el mensaje, sin explicaciones.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 150,
    });

    return response.choices[0]?.message?.content?.trim() || "";
  } catch (error) {
    console.error("Error generating post-visit message:", error);
    return `Hola ${patientData.nombre}, esperamos que su tratamiento haya ido bien. ¿Cómo se siente?`;
  }
}

/**
 * Genera un recordatorio de cita personalizado
 */
export async function generateReminderMessage(
  patientData: PatientData,
  appointmentDate: Date,
  treatment: string,
  hoursBefore: number
): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    const timeText = hoursBefore >= 24 ? "mañana" : `en ${hoursBefore} horas`;
    return `Hola ${patientData.nombre}, le recordamos su cita ${timeText} para ${treatment}. Le esperamos.`;
  }

  try {
    const prompt = `Eres un agente IA dental. Genera un recordatorio de cita personalizado.

Paciente: ${patientData.nombre}
Fecha cita: ${appointmentDate.toLocaleString("es-ES")}
Tratamiento: ${treatment}
Horas antes: ${hoursBefore} horas
Edad: ${patientData.edad} años

Requisitos:
- Personalizado según perfil del paciente
- Tono amigable
- Incluir fecha/hora de la cita
- Recordatorio de reprogramación si es necesario
- En español o francés

Genera SOLO el mensaje.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.6,
      max_tokens: 120,
    });

    return response.choices[0]?.message?.content?.trim() || "";
  } catch (error) {
    console.error("Error generating reminder message:", error);
    return `Hola ${patientData.nombre}, le recordamos su cita para ${treatment}.`;
  }
}

/**
 * Analiza el motivo de rechazo de un presupuesto
 */
export async function analyzeRejectionReason(
  budgetDetails: BudgetDetails,
  patientData: PatientData
): Promise<{ motivo: string; detalles: string }> {
  if (!process.env.OPENAI_API_KEY) {
    return {
      motivo: "precio",
      detalles: "Posible rechazo por precio elevado comparado con presupuestos anteriores.",
    };
  }

  try {
    const prompt = `Eres un agente IA dental experto. Analiza el motivo probable de rechazo de este presupuesto.

Paciente: ${patientData.nombre}
Presupuesto: ${budgetDetails.amount}€
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
  "detalles": "Explicación breve del análisis"
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.5,
      max_tokens: 200,
    });

    const content = response.choices[0]?.message?.content?.trim() || "";
    try {
      return JSON.parse(content);
    } catch {
      return {
        motivo: "otro",
        detalles: content,
      };
    }
  } catch (error) {
    console.error("Error analyzing rejection reason:", error);
    return {
      motivo: "otro",
      detalles: "No se pudo analizar el motivo del rechazo.",
    };
  }
}

/**
 * Calcula la prioridad automática basada en urgency_score y acceptance_prob
 */
export function calculatePriority(urgencyScore: number, acceptanceProb: number): "high" | "medium" | "low" {
  const combinedScore = (urgencyScore * 0.6) + (acceptanceProb * 0.4);
  
  if (combinedScore >= 75) return "high";
  if (combinedScore >= 50) return "medium";
  return "low";
}

/**
 * Genera un mensaje de salud preventiva personalizado
 */
export async function generatePreventiveHealthMessage(
  patientData: PatientData,
  tipoTratamiento: string,
  diasVencidos: number,
  canal: "sms" | "email" | "whatsapp",
  intento: number // 1 = WhatsApp, 2 = SMS, 3 = Email
): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    // Fallback sin API key
    const mensajes = {
      1: `Hola ${patientData.nombre}, es momento de agendar tu ${tipoTratamiento}. Han pasado ${Math.floor(diasVencidos / 30)} meses desde tu última visita. ¿Te gustaría agendar una cita?`,
      2: `${patientData.nombre}, recordatorio: es hora de tu ${tipoTratamiento}. Han pasado ${Math.floor(diasVencidos / 30)} meses. Llámanos para agendar.`,
      3: `Estimado/a ${patientData.nombre}, le recordamos que es momento de agendar su ${tipoTratamiento}. Han pasado ${Math.floor(diasVencidos / 30)} meses desde su última visita. La salud bucal preventiva es fundamental.`,
    };
    return mensajes[intento as keyof typeof mensajes] || mensajes[1];
  }

  try {
    const prompt = `Eres un agente IA dental amigable y experto en salud preventiva. Genera un mensaje de recordatorio para tratamiento preventivo.

Paciente: ${patientData.nombre}
Edad: ${patientData.edad} años
Tratamiento: ${tipoTratamiento}
Días desde última visita: ${diasVencidos} días (${Math.floor(diasVencidos / 30)} meses)
Canal: ${canal}
Intento: ${intento === 1 ? "Primer contacto (WhatsApp)" : intento === 2 ? "Segundo contacto (SMS)" : "Tercer contacto (Email)"}

Objetivos:
- Recordar la importancia de la salud preventiva
- Motivar a agendar cita para ${tipoTratamiento}
- Tono ${intento === 1 ? "amigable y cercano" : intento === 2 ? "directo pero amable" : "profesional y educativo"}
- Adaptado al canal (${canal})
- En español o francés según corresponda
- ${intento === 1 ? "Mensaje corto y personal" : intento === 2 ? "Mensaje breve" : "Mensaje más completo con beneficios"}
- Incluir llamada a la acción clara

Genera SOLO el mensaje, sin explicaciones.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: canal === "sms" ? 120 : canal === "whatsapp" ? 200 : 300,
    });

    return response.choices[0]?.message?.content?.trim() || "";
  } catch (error) {
    console.error("Error generating preventive health message:", error);
    return `Hola ${patientData.nombre}, es momento de agendar tu ${tipoTratamiento}. Han pasado ${Math.floor(diasVencidos / 30)} meses desde tu última visita.`;
  }
}

/**
 * Genera un mensaje personalizado para una regla de comunicación
 */
export async function generateCommunicationRuleMessage(
  tipo: "relance_presupuesto" | "recordatorio_cita" | "post_visita" | "salud_preventiva" | "recall_paciente",
  canal: "sms" | "email" | "whatsapp" | "llamada",
  pasoNumero: number,
  contexto?: {
    nombrePaciente?: string;
    monto?: number;
    tratamiento?: string;
    diasPendientes?: number;
    fechaCita?: Date;
    tipoTratamiento?: string;
  }
): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    // Fallback sin API key
    const nombre = contexto?.nombrePaciente || "{nombre}";
    const monto = contexto?.monto || "{monto}";
    const tratamiento = contexto?.tratamiento || "{tratamiento}";
    
    const mensajesFallback: Record<string, Record<string, string>> = {
      relance_presupuesto: {
        whatsapp: `Hola ${nombre}, 👋\n\nTe recordamos que tienes un presupuesto pendiente de ${monto}€ para ${tratamiento}.\n\n¿Te gustaría agendar una cita para revisarlo?`,
        sms: `Hola ${nombre}, tienes un presupuesto pendiente de ${monto}€. ¿Quieres agendar cita?`,
        email: `Estimado/a ${nombre},\n\nLe recordamos que tiene un presupuesto pendiente de ${monto}€ para ${tratamiento}.\n\nPor favor, contáctenos para agendar su cita.`,
        llamada: "Llamada telefónica para recordar el presupuesto pendiente y ofrecer agendar cita",
      },
      recall_paciente: {
        whatsapp: `Hola ${nombre}, 👋\n\nHace tiempo que no te vemos por la clínica. ¿Te gustaría agendar una revisión para cuidar tu salud bucal?\n\nEstamos aquí para ayudarte. 😊`,
        sms: `Hola ${nombre}, hace tiempo que no te vemos. ¿Te gustaría agendar una revisión?`,
        email: `Estimado/a ${nombre},\n\nHace tiempo que no nos visita. Le invitamos a agendar una revisión para cuidar su salud bucal.`,
        llamada: "Llamada telefónica para invitar al paciente a agendar una revisión",
      },
      recordatorio_cita: {
        whatsapp: `Hola ${nombre}, 👋\n\nTe recordamos tu cita para ${tratamiento}. Te esperamos.`,
        sms: `Hola ${nombre}, recordatorio: tienes cita para ${tratamiento}.`,
        email: `Estimado/a ${nombre},\n\nLe recordamos su cita para ${tratamiento}.\n\nLe esperamos.`,
        llamada: "Llamada telefónica para recordar la cita",
      },
      post_visita: {
        whatsapp: `Hola ${nombre}, 👋\n\nEsperamos que tu tratamiento haya ido bien. ¿Cómo te sientes? Tu opinión es muy importante.`,
        sms: `Hola ${nombre}, esperamos que tu tratamiento haya ido bien. ¿Cómo te sientes?`,
        email: `Estimado/a ${nombre},\n\nEsperamos que su tratamiento haya ido bien. Su opinión es muy importante para nosotros.`,
        llamada: "Llamada telefónica para preguntar por el bienestar del paciente",
      },
      salud_preventiva: {
        whatsapp: `Hola ${nombre}, 👋\n\nEs momento de agendar tu ${tratamiento}. La salud preventiva es fundamental.`,
        sms: `Hola ${nombre}, es hora de tu ${tratamiento}. Llámanos para agendar.`,
        email: `Estimado/a ${nombre},\n\nLe recordamos que es momento de agendar su ${tratamiento}. La salud bucal preventiva es fundamental.`,
        llamada: "Llamada telefónica para recordar tratamiento preventivo",
      },
    };
    
    return mensajesFallback[tipo]?.[canal] || `Mensaje para ${tipo} vía ${canal}`;
  }

  try {
    let prompt = `Eres un agente IA dental amigable y empático. Genera un mensaje personalizado para una campaña de comunicación dental.

Tipo de campaña: ${tipo.replace(/_/g, " ")}
Canal: ${canal}
Paso número: ${pasoNumero}${contexto?.nombrePaciente ? `\nPaciente: ${contexto.nombrePaciente}` : ""}${contexto?.monto ? `\nMonto: ${contexto.monto}€` : ""}${contexto?.tratamiento ? `\nTratamiento: ${contexto.tratamiento}` : ""}${contexto?.diasPendientes ? `\nDías pendientes: ${contexto.diasPendientes}` : ""}${contexto?.fechaCita ? `\nFecha cita: ${contexto.fechaCita.toLocaleString("es-ES")}` : ""}${contexto?.tipoTratamiento ? `\nTipo tratamiento: ${contexto.tipoTratamiento}` : ""}

Requisitos:
- Tono amigable y humano, no robótico
- Empatía y comprensión
- Adaptado al canal (${canal})
- En español o francés según corresponda
- ${canal === "sms" ? "Máximo 160 caracteres" : canal === "whatsapp" ? "Mensaje personal y cercano" : canal === "email" ? "Mensaje profesional pero cálido" : "Guión breve para llamada"}
- Incluir llamada a la acción apropiada
- ${pasoNumero > 1 ? `Este es el paso ${pasoNumero}, adapta el tono según la progresión de la campaña` : "Este es el primer contacto"}

Genera SOLO el mensaje, sin explicaciones adicionales.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: canal === "sms" ? 100 : canal === "whatsapp" ? 200 : canal === "email" ? 300 : 150,
    });

    return response.choices[0]?.message?.content?.trim() || "";
  } catch (error) {
    console.error("Error generating communication rule message:", error);
    return `Mensaje para ${tipo} vía ${canal}`;
  }
}

/**
 * Genera un mensaje con IA basado en tipo, canal y contexto
 */
export async function generateMessageIA(params: {
  tipo: "relance_presupuesto" | "recordatorio_cita" | "post_visita" | "salud_preventiva" | "recall_paciente" | "contacto_hueco_libre";
  canal: "sms" | "email" | "whatsapp" | "llamada";
  contexto: {
    paciente?: {
      nombre: string;
      edad?: number;
    };
    cita?: {
      fecha: string;
      hora: string;
      tipo: string;
    };
    motivo?: string;
    [key: string]: any;
  };
}): Promise<string> {
  const { tipo, canal, contexto } = params;
  
  // Si es contacto_hueco_libre, usar generateReminderMessage o crear uno específico
  if (tipo === "contacto_hueco_libre" || tipo === "recordatorio_cita") {
    if (contexto.cita && contexto.paciente) {
      const fechaCita = new Date(`${contexto.cita.fecha}T${contexto.cita.hora}`);
      return await generateReminderMessage(
        {
          nombre: contexto.paciente.nombre,
          edad: contexto.paciente.edad || 30,
        },
        fechaCita,
        contexto.cita.tipo,
        24
      );
    }
  }
  
  // Para otros tipos, usar generateCommunicationRuleMessage
  return await generateCommunicationRuleMessage(
    tipo as any,
    canal,
    1,
    {
      nombrePaciente: contexto.paciente?.nombre,
      tratamiento: contexto.cita?.tipo,
      fechaCita: contexto.cita ? new Date(`${contexto.cita.fecha}T${contexto.cita.hora}`) : undefined,
    }
  );
}

