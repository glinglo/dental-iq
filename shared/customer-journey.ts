/**
 * Customer Journey Dental - Sistema de acompañamiento continuo
 * Define las etapas del journey y los touchpoints automáticos según estadio y visitas
 */

export interface EtapaJourney {
  id: string;
  nombre: string;
  descripcion: string;
  criterios: {
    edadMin?: number;
    edadMax?: number;
    mesesSinVisitaMin?: number;
    mesesSinVisitaMax?: number;
    numeroVisitasMin?: number;
    numeroVisitasMax?: number;
    tieneTratamientoActivo?: boolean;
    diagnosticoRelevante?: string[];
  };
  touchpoints: TouchpointJourney[];
  objetivos: string[];
}

export interface TouchpointJourney {
  orden: number;
  nombre: string;
  descripcion: string;
  tipo: "preventivo" | "recordatorio" | "seguimiento" | "educativo" | "fidelizacion";
  canal: "whatsapp" | "sms" | "email" | "llamada";
  diasDespues: number; // Días después del evento anterior o de la última visita
  mensaje: string; // Plantilla con variables {nombre}, {tratamiento}, {dias}, etc.
  condicion?: {
    // Condiciones adicionales para ejecutar este touchpoint
    requiereRespuesta?: boolean;
    soloSiNoTieneCita?: boolean;
    soloSiTieneTratamientoPendiente?: boolean;
  };
}

// Definición de las etapas del Customer Journey Dental
export const ETAPAS_JOURNEY: EtapaJourney[] = [
  {
    id: "primera_visita",
    nombre: "Primera Visita",
    descripcion: "Pacientes nuevos que aún no han visitado la clínica",
    criterios: {
      numeroVisitasMax: 0,
    },
    objetivos: [
      "Bienvenida y presentación de la clínica",
      "Educación sobre salud bucal",
      "Motivación para agendar primera cita"
    ],
    touchpoints: [
      {
        orden: 1,
        nombre: "Bienvenida",
        descripcion: "Mensaje de bienvenida después del registro",
        tipo: "educativo",
        canal: "whatsapp",
        diasDespues: 0,
        mensaje: "Hola {nombre}, 👋\n\n¡Bienvenido/a a nuestra clínica dental! Estamos encantados de tenerte como paciente.\n\nTu salud bucal es nuestra prioridad. ¿Te gustaría agendar tu primera consultiva? 😊"
      },
      {
        orden: 2,
        nombre: "Recordatorio suave",
        descripcion: "Recordatorio si no ha agendado en 3 días",
        tipo: "recordatorio",
        canal: "sms",
        diasDespues: 3,
        mensaje: "Hola {nombre}, aún no has agendado tu primera visita. Estamos aquí para ayudarte. Responde SÍ para agendar.",
        condicion: {
          soloSiNoTieneCita: true
        }
      },
      {
        orden: 3,
        nombre: "Llamada personalizada",
        descripcion: "Llamada si no responde después de 7 días",
        tipo: "seguimiento",
        canal: "llamada",
        diasDespues: 7,
        mensaje: "Llamada telefónica para conocer al paciente y motivar a agendar primera cita",
        condicion: {
          soloSiNoTieneCita: true
        }
      }
    ]
  },
  {
    id: "inicio_relacion",
    nombre: "Inicio de Relación",
    descripcion: "Pacientes que han tenido 1-2 visitas",
    criterios: {
      numeroVisitasMin: 1,
      numeroVisitasMax: 2,
    },
    objetivos: [
      "Establecer confianza",
      "Educar sobre cuidados preventivos",
      "Fomentar visitas regulares"
    ],
    touchpoints: [
      {
        orden: 1,
        nombre: "Post-visita inmediata",
        descripcion: "Mensaje de agradecimiento después de la visita",
        tipo: "fidelizacion",
        canal: "whatsapp",
        diasDespues: 0,
        mensaje: "Hola {nombre}, 👋\n\nGracias por confiar en nosotros. Esperamos que tu visita haya sido excelente.\n\n¿Cómo te sientes después del tratamiento? Tu opinión es muy importante. 😊"
      },
      {
        orden: 2,
        nombre: "Recordatorio limpieza",
        descripcion: "Recordatorio para próxima limpieza (3 meses)",
        tipo: "preventivo",
        canal: "whatsapp",
        diasDespues: 90,
        mensaje: "Hola {nombre}, 👋\n\nEs momento de cuidar tu sonrisa. Te recomendamos agendar tu limpieza dental para mantener una salud bucal perfecta.\n\n¿Te gustaría agendar tu cita? 😊"
      },
      {
        orden: 3,
        nombre: "Recordatorio seguimiento",
        descripcion: "Recordatorio si no agenda en 7 días",
        tipo: "recordatorio",
        canal: "sms",
        diasDespues: 7,
        mensaje: "Hola {nombre}, recordatorio: es momento de tu limpieza dental. Llámanos para agendar.",
        condicion: {
          soloSiNoTieneCita: true
        }
      }
    ]
  },
  {
    id: "relacion_establecida",
    nombre: "Relación Establecida",
    descripcion: "Pacientes con 3+ visitas, relación consolidada",
    criterios: {
      numeroVisitasMin: 3,
    },
    objetivos: [
      "Mantener frecuencia de visitas",
      "Prevención proactiva",
      "Fidelización y recomendaciones"
    ],
    touchpoints: [
      {
        orden: 1,
        nombre: "Post-visita",
        descripcion: "Mensaje de agradecimiento después de cada visita",
        tipo: "fidelizacion",
        canal: "whatsapp",
        diasDespues: 0,
        mensaje: "Hola {nombre}, 👋\n\nGracias por tu visita. Esperamos que todo haya ido perfectamente.\n\n¿Te gustaría dejarnos una reseña? Tu opinión ayuda a otros pacientes. 😊"
      },
      {
        orden: 2,
        nombre: "Recordatorio preventivo",
        descripcion: "Recordatorio para limpieza (5 meses después de última visita)",
        tipo: "preventivo",
        canal: "whatsapp",
        diasDespues: 150,
        mensaje: "Hola {nombre}, 👋\n\nEs momento de tu limpieza dental. La prevención es clave para una sonrisa perfecta.\n\n¿Te gustaría agendar tu cita? 😊"
      },
      {
        orden: 3,
        nombre: "Recordatorio seguimiento",
        descripcion: "Recordatorio si no agenda en 5 días",
        tipo: "recordatorio",
        canal: "sms",
        diasDespues: 5,
        mensaje: "Hola {nombre}, recordatorio: es momento de tu limpieza dental. Llámanos para agendar.",
        condicion: {
          soloSiNoTieneCita: true
        }
      },
      {
        orden: 4,
        nombre: "Email educativo",
        descripcion: "Email con consejos de salud bucal",
        tipo: "educativo",
        canal: "email",
        diasDespues: 10,
        mensaje: "Estimado/a {nombre},\n\nQueremos compartir contigo algunos consejos para mantener una salud bucal perfecta:\n\n- Cepillado 3 veces al día\n- Uso de hilo dental\n- Visitas regulares cada 6 meses\n\nEstamos aquí para cuidar tu sonrisa.\n\nSaludos cordiales,\nClínica Dental"
      }
    ]
  },
  {
    id: "infancia_preventiva",
    nombre: "Infancia Preventiva (0-12 años)",
    descripcion: "Pacientes en edad infantil, enfoque en prevención y educación",
    criterios: {
      edadMin: 0,
      edadMax: 12,
    },
    objetivos: [
      "Educación sobre higiene bucal",
      "Prevención de caries",
      "Seguimiento de desarrollo dental"
    ],
    touchpoints: [
      {
        orden: 1,
        nombre: "Recordatorio limpieza",
        descripcion: "Recordatorio para limpieza cada 4 meses",
        tipo: "preventivo",
        canal: "whatsapp",
        diasDespues: 120,
        mensaje: "Hola {nombre}, 👋\n\nEs momento de la limpieza dental de tu pequeño/a. La prevención desde pequeños es fundamental para una sonrisa saludable.\n\n¿Te gustaría agendar la cita? 😊"
      },
      {
        orden: 2,
        nombre: "Recordatorio selladores",
        descripcion: "Recordatorio para selladores si corresponde",
        tipo: "preventivo",
        canal: "sms",
        diasDespues: 180,
        mensaje: "Hola {nombre}, recordatorio: es momento de revisar los selladores dentales. Llámanos para agendar.",
        condicion: {
          requiereRespuesta: true
        }
      },
      {
        orden: 3,
        nombre: "Email educativo padres",
        descripcion: "Email con consejos para padres",
        tipo: "educativo",
        canal: "email",
        diasDespues: 200,
        mensaje: "Estimado/a {nombre},\n\nComo padre/madre, queremos compartir contigo consejos para la salud bucal de tu hijo/a:\n\n- Supervisar el cepillado hasta los 8 años\n- Limitar azúcares\n- Visitas regulares cada 4-6 meses\n\nEstamos aquí para cuidar la sonrisa de tu pequeño/a.\n\nSaludos cordiales,\nClínica Dental"
      }
    ]
  },
  {
    id: "adolescencia_ortodoncia",
    nombre: "Adolescencia y Ortodoncia (13-18 años)",
    descripcion: "Pacientes adolescentes, enfoque en ortodoncia y educación",
    criterios: {
      edadMin: 13,
      edadMax: 18,
    },
    objetivos: [
      "Seguimiento de ortodoncia",
      "Educación sobre cuidados",
      "Prevención de problemas futuros"
    ],
    touchpoints: [
      {
        orden: 1,
        nombre: "Recordatorio revisión ortodoncia",
        descripcion: "Recordatorio para revisión de ortodoncia cada 3 meses",
        tipo: "preventivo",
        canal: "whatsapp",
        diasDespues: 90,
        mensaje: "Hola {nombre}, 👋\n\nEs momento de tu revisión de ortodoncia. El seguimiento regular es clave para el éxito del tratamiento.\n\n¿Te gustaría agendar tu cita? 😊"
      },
      {
        orden: 2,
        nombre: "Recordatorio limpieza",
        descripcion: "Recordatorio para limpieza cada 6 meses",
        tipo: "preventivo",
        canal: "sms",
        diasDespues: 180,
        mensaje: "Hola {nombre}, recordatorio: es momento de tu limpieza dental. Llámanos para agendar.",
        condicion: {
          soloSiNoTieneCita: true
        }
      },
      {
        orden: 3,
        nombre: "Email motivacional",
        descripcion: "Email motivacional sobre el tratamiento",
        tipo: "educativo",
        canal: "email",
        diasDespues: 200,
        mensaje: "Estimado/a {nombre},\n\nQueremos recordarte la importancia de seguir las indicaciones de tu tratamiento de ortodoncia:\n\n- Usar el aparato según las indicaciones\n- Mantener una buena higiene\n- Asistir a todas las citas\n\nEstamos aquí para ayudarte a conseguir esa sonrisa perfecta.\n\nSaludos cordiales,\nClínica Dental"
      }
    ]
  },
  {
    id: "adulto_joven_prevencion",
    nombre: "Adulto Joven - Prevención (19-35 años)",
    descripcion: "Pacientes adultos jóvenes, enfoque en prevención y estética",
    criterios: {
      edadMin: 19,
      edadMax: 35,
    },
    objetivos: [
      "Prevención de caries",
      "Cuidado estético",
      "Mantenimiento de salud bucal"
    ],
    touchpoints: [
      {
        orden: 1,
        nombre: "Recordatorio limpieza",
        descripcion: "Recordatorio para limpieza cada 6 meses",
        tipo: "preventivo",
        canal: "whatsapp",
        diasDespues: 180,
        mensaje: "Hola {nombre}, 👋\n\nEs momento de tu limpieza dental. La prevención es clave para mantener una sonrisa perfecta.\n\n¿Te gustaría agendar tu cita? 😊"
      },
      {
        orden: 2,
        nombre: "Recordatorio seguimiento",
        descripcion: "Recordatorio si no agenda en 7 días",
        tipo: "recordatorio",
        canal: "sms",
        diasDespues: 7,
        mensaje: "Hola {nombre}, recordatorio: es momento de tu limpieza dental. Llámanos para agendar.",
        condicion: {
          soloSiNoTieneCita: true
        }
      },
      {
        orden: 3,
        nombre: "Email educativo",
        descripcion: "Email con consejos de salud bucal",
        tipo: "educativo",
        canal: "email",
        diasDespues: 14,
        mensaje: "Estimado/a {nombre},\n\nQueremos compartir contigo consejos para mantener una sonrisa perfecta:\n\n- Cepillado 3 veces al día\n- Uso de hilo dental\n- Visitas regulares cada 6 meses\n- Considerar blanqueamiento si lo deseas\n\nEstamos aquí para cuidar tu sonrisa.\n\nSaludos cordiales,\nClínica Dental"
      }
    ]
  },
  {
    id: "adulto_mantenimiento",
    nombre: "Adulto - Mantenimiento (36-50 años)",
    descripcion: "Pacientes adultos, enfoque en mantenimiento y periodoncia",
    criterios: {
      edadMin: 36,
      edadMax: 50,
    },
    objetivos: [
      "Prevención de periodoncia",
      "Mantenimiento de implantes",
      "Prevención de problemas futuros"
    ],
    touchpoints: [
      {
        orden: 1,
        nombre: "Recordatorio limpieza",
        descripcion: "Recordatorio para limpieza cada 6 meses",
        tipo: "preventivo",
        canal: "whatsapp",
        diasDespues: 180,
        mensaje: "Hola {nombre}, 👋\n\nEs momento de tu limpieza dental. El cuidado preventivo es fundamental para mantener una salud bucal óptima.\n\n¿Te gustaría agendar tu cita? 😊"
      },
      {
        orden: 2,
        nombre: "Recordatorio periodoncia",
        descripcion: "Recordatorio para revisión de periodoncia cada 4 meses",
        tipo: "preventivo",
        canal: "sms",
        diasDespues: 120,
        mensaje: "Hola {nombre}, recordatorio: es momento de tu revisión periodontal. Llámanos para agendar.",
        condicion: {
          requiereRespuesta: true
        }
      },
      {
        orden: 3,
        nombre: "Email informativo",
        descripcion: "Email con información sobre salud periodontal",
        tipo: "educativo",
        canal: "email",
        diasDespues: 14,
        mensaje: "Estimado/a {nombre},\n\nQueremos recordarte la importancia del cuidado periodontal:\n\n- Cepillado adecuado\n- Uso de hilo dental\n- Visitas regulares cada 4-6 meses\n- Prevención de problemas de encías\n\nEstamos aquí para cuidar tu salud bucal.\n\nSaludos cordiales,\nClínica Dental"
      }
    ]
  },
  {
    id: "adulto_mayor_cuidado",
    nombre: "Adulto Mayor - Cuidado Especial (50+ años)",
    descripcion: "Pacientes mayores, enfoque en cuidado especial y prótesis",
    criterios: {
      edadMin: 50,
    },
    objetivos: [
      "Cuidado de prótesis",
      "Prevención de cáncer oral",
      "Mantenimiento de salud bucal"
    ],
    touchpoints: [
      {
        orden: 1,
        nombre: "Recordatorio limpieza",
        descripcion: "Recordatorio para limpieza cada 4 meses",
        tipo: "preventivo",
        canal: "whatsapp",
        diasDespues: 120,
        mensaje: "Hola {nombre}, 👋\n\nEs momento de tu limpieza dental. El cuidado regular es fundamental para mantener una salud bucal óptima.\n\n¿Te gustaría agendar tu cita? 😊"
      },
      {
        orden: 2,
        nombre: "Recordatorio prótesis",
        descripcion: "Recordatorio para revisión de prótesis cada 6 meses",
        tipo: "preventivo",
        canal: "sms",
        diasDespues: 180,
        mensaje: "Hola {nombre}, recordatorio: es momento de revisar tu prótesis dental. Llámanos para agendar.",
        condicion: {
          requiereRespuesta: true
        }
      },
      {
        orden: 3,
        nombre: "Email informativo",
        descripcion: "Email con información sobre cuidado especial",
        tipo: "educativo",
        canal: "email",
        diasDespues: 14,
        mensaje: "Estimado/a {nombre},\n\nQueremos recordarte la importancia del cuidado bucal en esta etapa:\n\n- Cuidado de prótesis\n- Prevención de cáncer oral\n- Visitas regulares cada 4-6 meses\n- Mantenimiento de salud bucal\n\nEstamos aquí para cuidar tu salud bucal.\n\nSaludos cordiales,\nClínica Dental"
      }
    ]
  },
  {
    id: "riesgo_perdida",
    nombre: "Riesgo de Pérdida",
    descripcion: "Pacientes que no han visitado en 4-6 meses",
    criterios: {
      mesesSinVisitaMin: 4,
      mesesSinVisitaMax: 6,
    },
    objetivos: [
      "Reactivar la relación",
      "Motivar a agendar cita",
      "Prevenir pérdida del paciente"
    ],
    touchpoints: [
      {
        orden: 1,
        nombre: "Recordatorio reactivación",
        descripcion: "Recordatorio para reactivar la relación",
        tipo: "seguimiento",
        canal: "whatsapp",
        diasDespues: 0,
        mensaje: "Hola {nombre}, 👋\n\nHace tiempo que no te vemos. Tu salud bucal es importante y queremos cuidarte.\n\n¿Te gustaría agendar una cita para revisar cómo estás? 😊"
      },
      {
        orden: 2,
        nombre: "Recordatorio seguimiento",
        descripcion: "Recordatorio si no responde en 3 días",
        tipo: "seguimiento",
        canal: "sms",
        diasDespues: 3,
        mensaje: "Hola {nombre}, recordatorio: hace tiempo que no nos visitas. Tu salud bucal es importante. Llámanos para agendar.",
        condicion: {
          requiereRespuesta: true
        }
      },
      {
        orden: 3,
        nombre: "Llamada personalizada",
        descripcion: "Llamada si no responde después de 7 días",
        tipo: "seguimiento",
        canal: "llamada",
        diasDespues: 7,
        mensaje: "Llamada telefónica para reactivar la relación y motivar a agendar cita",
        condicion: {
          requiereRespuesta: true
        }
      }
    ]
  },
  {
    id: "paciente_dormido",
    nombre: "Paciente Dormido",
    descripcion: "Pacientes que no han visitado en más de 6 meses",
    criterios: {
      mesesSinVisitaMin: 6,
    },
    objetivos: [
      "Recuperar al paciente",
      "Motivar a volver",
      "Reactivar la relación"
    ],
    touchpoints: [
      {
        orden: 1,
        nombre: "Mensaje de recuperación",
        descripcion: "Mensaje para recuperar al paciente",
        tipo: "seguimiento",
        canal: "whatsapp",
        diasDespues: 0,
        mensaje: "Hola {nombre}, 👋\n\nHace tiempo que no te vemos y te echamos de menos. Tu salud bucal es importante y queremos cuidarte.\n\n¿Te gustaría agendar una cita para revisar cómo estás? Estamos aquí para ayudarte. 😊"
      },
      {
        orden: 2,
        nombre: "Recordatorio seguimiento",
        descripcion: "Recordatorio si no responde en 5 días",
        tipo: "seguimiento",
        canal: "sms",
        diasDespues: 5,
        mensaje: "Hola {nombre}, recordatorio: hace tiempo que no nos visitas. Tu salud bucal es importante. Llámanos para agendar.",
        condicion: {
          requiereRespuesta: true
        }
      },
      {
        orden: 3,
        nombre: "Email de recuperación",
        descripcion: "Email para recuperar al paciente",
        tipo: "seguimiento",
        canal: "email",
        diasDespues: 7,
        mensaje: "Estimado/a {nombre},\n\nHace tiempo que no nos visita y queremos saber cómo está.\n\nSu salud bucal es importante y estamos aquí para cuidarla. Le invitamos a agendar una cita para revisar cómo está.\n\nEstaremos encantados de atenderle.\n\nSaludos cordiales,\nClínica Dental"
      },
      {
        orden: 4,
        nombre: "Llamada final",
        descripcion: "Llamada si no responde después de 14 días",
        tipo: "seguimiento",
        canal: "llamada",
        diasDespues: 14,
        mensaje: "Llamada telefónica para recuperar al paciente y motivar a agendar cita",
        condicion: {
          requiereRespuesta: true
        }
      }
    ]
  }
];

/**
 * Determina en qué etapa del journey se encuentra un paciente
 */
export function determinarEtapaJourney(
  paciente: {
    edad: number;
    ultimaVisita: Date;
    numeroVisitas?: number;
    tieneCitaFutura?: boolean;
    diagnostico?: string;
  },
  etapasDisponibles: EtapaJourney[] = ETAPAS_JOURNEY
): EtapaJourney[] {
  const ahora = new Date();
  const mesesSinVisita = Math.floor(
    (ahora.getTime() - paciente.ultimaVisita.getTime()) / (1000 * 60 * 60 * 24 * 30)
  );
  
  const etapasAplicables: EtapaJourney[] = [];
  
  for (const etapa of etapasDisponibles) {
    const criterios = etapa.criterios;
    let cumpleCriterios = true;
    
    // Verificar edad
    if (criterios.edadMin !== undefined && paciente.edad < criterios.edadMin) {
      cumpleCriterios = false;
    }
    if (criterios.edadMax !== undefined && paciente.edad > criterios.edadMax) {
      cumpleCriterios = false;
    }
    
    // Verificar meses sin visita
    if (criterios.mesesSinVisitaMin !== undefined && mesesSinVisita < criterios.mesesSinVisitaMin) {
      cumpleCriterios = false;
    }
    if (criterios.mesesSinVisitaMax !== undefined && mesesSinVisita > criterios.mesesSinVisitaMax) {
      cumpleCriterios = false;
    }
    
    // Verificar número de visitas
    if (criterios.numeroVisitasMin !== undefined && (paciente.numeroVisitas || 0) < criterios.numeroVisitasMin) {
      cumpleCriterios = false;
    }
    if (criterios.numeroVisitasMax !== undefined && (paciente.numeroVisitas || 0) > criterios.numeroVisitasMax) {
      cumpleCriterios = false;
    }
    
    if (cumpleCriterios) {
      etapasAplicables.push(etapa);
    }
  }
  
  // Priorizar etapas más específicas (riesgo_perdida y paciente_dormido tienen prioridad)
  etapasAplicables.sort((a, b) => {
    if (a.id === "paciente_dormido" || a.id === "riesgo_perdida") return -1;
    if (b.id === "paciente_dormido" || b.id === "riesgo_perdida") return 1;
    return 0;
  });
  
  return etapasAplicables;
}

/**
 * Genera los touchpoints pendientes para un paciente según su etapa del journey
 */
export function generarTouchpointsPendientes(
  paciente: {
    edad: number;
    ultimaVisita: Date;
    numeroVisitas?: number;
    tieneCitaFutura?: boolean;
    diagnostico?: string;
  },
  ultimaAccion?: Date,
  etapasDisponibles: EtapaJourney[] = ETAPAS_JOURNEY
): Array<{
  etapa: EtapaJourney;
  touchpoint: TouchpointJourney;
  fechaProgramada: Date;
  prioridad: "alta" | "media" | "baja";
}> {
  const etapas = determinarEtapaJourney(paciente, etapasDisponibles);
  const touchpointsPendientes: Array<{
    etapa: EtapaJourney;
    touchpoint: TouchpointJourney;
    fechaProgramada: Date;
    prioridad: "alta" | "media" | "baja";
  }> = [];
  
  const fechaBase = ultimaAccion || paciente.ultimaVisita;
  
  for (const etapa of etapas) {
    for (const touchpoint of etapa.touchpoints) {
      // Verificar condiciones
      if (touchpoint.condicion) {
        if (touchpoint.condicion.soloSiNoTieneCita && paciente.tieneCitaFutura) {
          continue;
        }
        // Otras condiciones se pueden agregar aquí
      }
      
      const fechaProgramada = new Date(fechaBase);
      fechaProgramada.setDate(fechaProgramada.getDate() + touchpoint.diasDespues);
      
      const ahora = new Date();
      const diasRestantes = Math.floor((fechaProgramada.getTime() - ahora.getTime()) / (1000 * 60 * 60 * 24));
      
      let prioridad: "alta" | "media" | "baja" = "baja";
      if (diasRestantes < 0) prioridad = "alta";
      else if (diasRestantes < 7) prioridad = "media";
      
      touchpointsPendientes.push({
        etapa,
        touchpoint,
        fechaProgramada,
        prioridad,
      });
    }
  }
  
  // Ordenar por fecha programada
  touchpointsPendientes.sort((a, b) => a.fechaProgramada.getTime() - b.fechaProgramada.getTime());
  
  return touchpointsPendientes;
}

