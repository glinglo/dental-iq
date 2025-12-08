import type { TouchpointNode } from "@/components/campaign-canvas";

export interface CampaignTemplate {
  id: string;
  nombre: string;
  descripcion: string;
  icono: string;
  tratamiento: string;
  mesesSinVisita: number;
  edadMin?: number;
  edadMax?: number;
  touchpoints: TouchpointNode[];
}

const generarTouchpoint = (
  id: string,
  canal: string,
  x: number,
  mensaje: string,
  diasEspera: number
): TouchpointNode => ({
  id,
  canal,
  x,
  y: 200,
  mensaje,
  diasEspera,
});

export const campaignTemplates: CampaignTemplate[] = [
  {
    id: "limpiezas",
    nombre: "Limpiezas",
    descripcion: "Campaña específica para reactivar pacientes que necesitan limpieza dental",
    icono: "🦷",
    tratamiento: "Limpieza bucal",
    mesesSinVisita: 6,
    touchpoints: [
      generarTouchpoint(
        "tp-1",
        "SMS",
        100,
        "Hola {nombre}, hace más de 6 meses que no te realizas una limpieza dental. Es importante mantener tu salud bucal. ¿Te gustaría agendar tu limpieza? Responde SÍ para confirmar.",
        0
      ),
      generarTouchpoint(
        "tp-2",
        "Email",
        350,
        "Estimado/a {nombre},\n\nLe recordamos que hace más de 6 meses que no se realiza una limpieza dental profesional. Las limpiezas regulares son esenciales para prevenir problemas como caries y enfermedades de las encías.\n\nLe ofrecemos una cita de limpieza con nuestros especialistas. ¿Le gustaría agendar?\n\nUn saludo,\nClínica Dental",
        3
      ),
      generarTouchpoint(
        "tp-3",
        "WhatsApp",
        600,
        "¡Hola {nombre}!\n\n🦷 Recordatorio importante: Hace más de 6 meses que no te realizas una limpieza dental.\n\nLas limpiezas regulares ayudan a:\n✅ Prevenir caries\n✅ Mantener encías saludables\n✅ Conservar una sonrisa brillante\n\n¿Te gustaría agendar tu limpieza? Responde a este mensaje y te ayudamos a encontrar el mejor horario.",
        5
      ),
      generarTouchpoint(
        "tp-4",
        "LlamadasStaff",
        850,
        "Buenos días, ¿hablo con {nombre}? Le llamamos de la Clínica Dental para recordarle que hace más de 6 meses que no se realiza una limpieza dental. Es importante mantener su salud bucal con limpiezas regulares. ¿Le vendría bien agendar una cita esta semana o la próxima?",
        7
      ),
    ],
  },
  {
    id: "ortodoncia",
    nombre: "Ortodoncia",
    descripcion: "Campaña para pacientes en tratamiento de ortodoncia que necesitan seguimiento",
    icono: "🦴",
    tratamiento: "Ortodoncia",
    mesesSinVisita: 3,
    touchpoints: [
      generarTouchpoint(
        "tp-1",
        "WhatsApp",
        100,
        "Hola {nombre}, 👋\n\nNotamos que hace más de 3 meses que no visitas la clínica para tu seguimiento de ortodoncia.\n\nEs importante mantener las citas regulares para asegurar que tu tratamiento avance correctamente. ¿Puedes agendar tu próxima cita?",
        0
      ),
      generarTouchpoint(
        "tp-2",
        "Email",
        350,
        "Estimado/a {nombre},\n\nLe recordamos que hace más de 3 meses que no acude a su cita de seguimiento de ortodoncia. Las visitas regulares son fundamentales para el éxito de su tratamiento.\n\nPor favor, contáctenos para agendar su próxima cita de control.\n\nSaludos cordiales,\nEquipo de Ortodoncia",
        2
      ),
      generarTouchpoint(
        "tp-3",
        "SMS",
        600,
        "{nombre}, es importante que continúes con tu tratamiento de ortodoncia. Hace más de 3 meses sin visita. Responde SÍ para agendar tu cita de seguimiento.",
        4
      ),
      generarTouchpoint(
        "tp-4",
        "LlamadasStaff",
        850,
        "Buenos días {nombre}, le llamamos de la Clínica Dental. Hace más de 3 meses que no acude a su cita de ortodoncia. Es importante mantener el seguimiento del tratamiento. ¿Cuándo le vendría bien venir?",
        6
      ),
    ],
  },
  {
    id: "implantes",
    nombre: "Implantes",
    descripcion: "Campaña para pacientes con implantes que requieren revisiones periódicas",
    icono: "⚕️",
    tratamiento: "Implante dental",
    mesesSinVisita: 6,
    touchpoints: [
      generarTouchpoint(
        "tp-1",
        "Email",
        100,
        "Estimado/a {nombre},\n\nLe recordamos que hace más de 6 meses que no realiza una revisión de sus implantes dentales. Las revisiones periódicas son esenciales para asegurar la salud y durabilidad de sus implantes.\n\nLe invitamos a agendar una cita de revisión con nuestro especialista.\n\nAtentamente,\nClínica Dental",
        0
      ),
      generarTouchpoint(
        "tp-2",
        "SMS",
        350,
        "{nombre}, recordatorio: Hace más de 6 meses sin revisar tus implantes. Es importante mantener revisiones regulares. Responde SÍ para agendar.",
        3
      ),
      generarTouchpoint(
        "tp-3",
        "WhatsApp",
        600,
        "Hola {nombre} 👋\n\n🦷 Recordatorio importante sobre tus implantes dentales:\n\nHace más de 6 meses que no realizas una revisión. Las revisiones periódicas son clave para:\n✅ Detectar problemas a tiempo\n✅ Asegurar la durabilidad de tus implantes\n✅ Mantener tu salud bucal\n\n¿Te gustaría agendar tu revisión?",
        5
      ),
      generarTouchpoint(
        "tp-4",
        "LlamadasStaff",
        850,
        "Buenos días {nombre}, le llamamos de la Clínica Dental para recordarle que hace más de 6 meses que no revisa sus implantes dentales. Las revisiones son importantes para el mantenimiento. ¿Le gustaría agendar una cita?",
        7
      ),
    ],
  },
  {
    id: "blanqueamiento",
    nombre: "Blanqueamiento",
    descripcion: "Campaña para reactivar pacientes interesados en tratamientos de blanqueamiento",
    icono: "✨",
    tratamiento: "Blanqueamiento",
    mesesSinVisita: 12,
    touchpoints: [
      generarTouchpoint(
        "tp-1",
        "WhatsApp",
        100,
        "¡Hola {nombre}! ✨\n\nHace más de 1 año que no nos visitas. ¿Te gustaría recuperar una sonrisa más blanca y brillante?\n\nTenemos ofertas especiales en tratamientos de blanqueamiento dental. Responde a este mensaje para más información.",
        0
      ),
      generarTouchpoint(
        "tp-2",
        "Email",
        350,
        "Estimado/a {nombre},\n\nHace más de 1 año que no nos visita. Le recordamos que tenemos tratamientos de blanqueamiento dental disponibles que pueden ayudarle a conseguir una sonrisa más brillante.\n\nSi está interesado/a en mejorar el aspecto de su sonrisa, no dude en contactarnos.\n\nSaludos,\nClínica Dental",
        3
      ),
      generarTouchpoint(
        "tp-3",
        "SMS",
        600,
        "{nombre}, hace más de 1 año sin visitarnos. ¿Te gustaría una sonrisa más blanca? Tenemos ofertas en blanqueamiento. Responde SÍ para más info.",
        5
      ),
      generarTouchpoint(
        "tp-4",
        "LlamadasStaff",
        850,
        "Buenos días {nombre}, le llamamos de la Clínica Dental. Hace más de 1 año que no nos visita. Tenemos ofertas especiales en blanqueamiento dental. ¿Le interesaría conocer más detalles?",
        7
      ),
    ],
  },
  {
    id: "revision-general",
    nombre: "Revisión General",
    descripcion: "Campaña para pacientes que necesitan una revisión general de su salud bucal",
    icono: "🔍",
    tratamiento: "Revisión general",
    mesesSinVisita: 12,
    touchpoints: [
      generarTouchpoint(
        "tp-1",
        "SMS",
        100,
        "Hola {nombre}, hace más de 1 año que no te realizas una revisión dental. Es importante mantener tu salud bucal. ¿Te gustaría agendar una revisión? Responde SÍ para confirmar.",
        0
      ),
      generarTouchpoint(
        "tp-2",
        "Email",
        350,
        "Estimado/a {nombre},\n\nEsperamos que se encuentre bien. Hemos notado que hace más de 1 año que no nos visita para una revisión general.\n\nLas revisiones periódicas son fundamentales para detectar problemas a tiempo y mantener una buena salud bucal. Le invitamos a agendar una cita.\n\nUn saludo,\nClínica Dental",
        3
      ),
      generarTouchpoint(
        "tp-3",
        "WhatsApp",
        600,
        "¡Hola {nombre}!\n\n🔍 Recordatorio: Hace más de 1 año que no realizas una revisión dental general.\n\nLas revisiones regulares ayudan a:\n✅ Detectar problemas temprano\n✅ Prevenir enfermedades\n✅ Mantener tu salud bucal\n\n¿Te gustaría agendar tu revisión?",
        5
      ),
      generarTouchpoint(
        "tp-4",
        "LlamadasStaff",
        850,
        "Buenos días {nombre}, le llamamos de la Clínica Dental para recordarle que hace más de 1 año que no realiza una revisión general. Es importante mantener revisiones periódicas. ¿Le gustaría agendar una cita?",
        7
      ),
    ],
  },
  {
    id: "periodoncia",
    nombre: "Periodoncia",
    descripcion: "Campaña para pacientes con problemas de encías que requieren seguimiento",
    icono: "🩺",
    tratamiento: "Periodoncia",
    mesesSinVisita: 4,
    touchpoints: [
      generarTouchpoint(
        "tp-1",
        "Email",
        100,
        "Estimado/a {nombre},\n\nLe recordamos que hace más de 4 meses que no acude a su cita de seguimiento de periodoncia. El cuidado de las encías es fundamental para su salud bucal general.\n\nLe recomendamos agendar una cita de revisión lo antes posible.\n\nAtentamente,\nEquipo de Periodoncia",
        0
      ),
      generarTouchpoint(
        "tp-2",
        "WhatsApp",
        350,
        "Hola {nombre} 🩺\n\nRecordatorio importante: Hace más de 4 meses sin revisar tus encías.\n\nEl cuidado periodontal es esencial para:\n✅ Prevenir enfermedades de las encías\n✅ Mantener dientes fuertes\n✅ Evitar problemas mayores\n\n¿Puedes agendar tu revisión?",
        2
      ),
      generarTouchpoint(
        "tp-3",
        "SMS",
        600,
        "{nombre}, hace más de 4 meses sin revisar tus encías. Es importante el seguimiento periodontal. Responde SÍ para agendar.",
        4
      ),
      generarTouchpoint(
        "tp-4",
        "LlamadasStaff",
        850,
        "Buenos días {nombre}, le llamamos de la Clínica Dental. Hace más de 4 meses que no revisa sus encías. El seguimiento periodontal es importante. ¿Cuándo le vendría bien venir?",
        6
      ),
    ],
  },
];

export function getTemplateById(id: string): CampaignTemplate | undefined {
  return campaignTemplates.find(t => t.id === id);
}
