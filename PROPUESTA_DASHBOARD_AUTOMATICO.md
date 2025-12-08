# Propuesta: Dashboard Automático de Seguimiento

## Visión General
Transformar el dashboard en una herramienta completamente automática donde dos agentes IA trabajan de forma independiente:
- **Agente de Presupuestos**: Cierra presupuestos (positiva o negativamente) mediante relances automáticos
- **Agente de Seguimiento de Clientes**: Recupera pacientes perdidos/dormidos mediante campañas automáticas

## Estructura Propuesta

### 📊 DASHBOARD PRINCIPAL (`/`)
**Vista general del estado de ambos agentes**

**KPIs Principales:**
- Presupuestos activos siendo seguidos
- Pacientes dormidos siendo recuperados
- Tasa de cierre (positivo + negativo)
- Acciones ejecutadas hoy
- Horas ahorradas

**Secciones:**
1. **Actividad Reciente** - Timeline de acciones de ambos agentes
2. **Presupuestos en Proceso** - Top 5 presupuestos con más actividad
3. **Pacientes en Recuperación** - Top 5 pacientes siendo recuperados
4. **Métricas de Éxito** - Gráficos de conversión y recuperación

---

### 💰 PRESUPUESTOS

#### 1. Dashboard de Presupuestos (`/presupuestos`)
**Vista centralizada del Agente de Presupuestos**

**Secciones:**
- **KPIs del Agente:**
  - Presupuestos activos
  - Tasa de cierre (positivo + negativo)
  - Promedio días hasta cierre
  - Facturación generada

- **Presupuestos en Seguimiento Activo** (Tabla)
  - Lista de presupuestos pendientes con:
    - Estado de la campaña (paso actual)
    - Última acción del agente
    - Próxima acción programada
    - Días en seguimiento
    - Click para ver detalle completo

- **Análisis de Cierres** (Gráficos)
  - Tasa de conversión por canal
  - Motivos de rechazo (IA analizada)
  - Tiempo promedio hasta cierre
  - Facturación generada por mes

#### 2. Relances (`/presupuestos/relances`)
**Vista de presupuestos pendientes con campañas activas**

**Estructura:**
- Tabla de presupuestos pendientes mostrando:
  - Paciente
  - Monto
  - Días pendiente
  - **Estado Campaña** (paso actual, canal, fecha próxima acción)
  - Botón "Ver Detalle" → Página de detalle con timeline completo

- **Filtros automáticos:**
  - Por estado de campaña (activa, pendiente acción, completada)
  - Por días pendientes
  - Por monto

#### 3. Seguimiento (`/presupuestos/seguimiento`)
**Análisis y métricas del Agente de Presupuestos**

**Secciones:**
- **Métricas de Cierre:**
  - Tasa de conversión total
  - Tasa de conversión por canal (WhatsApp, SMS, Email, Llamada)
  - Facturación generada
  - Promedio días hasta cierre

- **Análisis de Rechazos (IA):**
  - Motivos principales de rechazo (analizados por IA)
  - Patrones detectados
  - Recomendaciones del agente

- **Presupuestos Cerrados Recientemente:**
  - Lista de presupuestos cerrados (aceptados/rechazados)
  - Timeline de acciones que llevaron al cierre
  - Lecciones aprendidas por IA

#### 4. Análisis de Cierres (`/presupuestos/analisis`) [NUEVO]
**Vista detallada de cómo se cerraron los presupuestos**

**Secciones:**
- **Presupuestos Cerrados (Últimos 30 días):**
  - Tabla con: Paciente, Monto, Estado (Aceptado/Rechazado), Días hasta cierre, Canal que cerró, Acciones realizadas
  - Click para ver timeline completo de acciones

- **Gráficos:**
  - Conversión por canal
  - Conversión por número de touchpoints
  - Conversión por días pendientes
  - Motivos de rechazo (análisis IA)

---

### 👥 CAMPAÑAS (Seguimiento de Pacientes)

#### 1. Dashboard de Campañas (`/campañas`)
**Vista centralizada del Agente de Seguimiento de Clientes**

**Secciones:**
- **KPIs del Agente:**
  - Pacientes dormidos siendo recuperados
  - Pacientes recuperados (últimos 30 días)
  - Citas generadas desde recuperación
  - Tasa de recuperación

- **Pacientes en Recuperación Activa** (Tabla)
  - Lista de pacientes dormidos con:
    - Estado de la campaña de recuperación
    - Última acción del agente
    - Próxima acción programada
    - Meses sin visita
    - Click para ver detalle completo

- **Métricas de Recuperación** (Gráficos)
  - Pacientes recuperados por mes
  - Citas generadas desde recuperación
  - Efectividad por canal

#### 2. Recuperación de Pacientes (`/campañas/recuperacion`) [NUEVO]
**Vista de pacientes dormidos siendo recuperados**

**Estructura:**
- Tabla de pacientes dormidos con:
  - Nombre
  - Meses sin visita
  - Último tratamiento
  - **Estado Campaña** (paso actual, canal, fecha próxima acción)
  - Prioridad (calculada por IA)
  - Botón "Ver Detalle" → Página de detalle con timeline completo

- **Filtros automáticos:**
  - Por prioridad (Alta, Media, Baja)
  - Por meses sin visita
  - Por tipo de último tratamiento
  - Por estado de campaña

#### 3. Salud Preventiva (`/campañas/salud-preventiva`)
**Recordatorios automáticos para tratamientos preventivos**

**Estructura actual mejorada:**
- Mostrar acciones automáticas del agente
- Timeline de recordatorios enviados
- Efectividad de los recordatorios

#### 4. Recordatorios (`/pacientes/recordatorios`)
**Recordatorios automáticos de citas**

**Estructura actual mejorada:**
- Mostrar acciones automáticas del agente
- Timeline de recordatorios enviados

#### 5. Mensajes Post-Visita (`/pacientes/post-visita`)
**Mensajes automáticos después de tratamientos**

**Estructura actual mejorada:**
- Mostrar acciones automáticas del agente
- Timeline de mensajes enviados

---

### 📋 ACCIONES (`/acciones`)
**Log centralizado de todas las acciones automáticas**

**Mejoras propuestas:**
- Filtros por agente (Presupuestos vs Seguimiento Clientes)
- Vista de timeline global
- Agrupación por presupuesto/paciente
- Métricas de efectividad

---

## Características Clave

### 1. Automatización Total
- Los agentes trabajan 24/7 sin intervención
- Los presupuestos y pacientes aparecen automáticamente cuando cumplen criterios
- Las acciones se ejecutan según las reglas configuradas

### 2. Visibilidad Completa
- Cada presupuesto/paciente muestra su timeline de acciones
- Se ve claramente qué hizo el agente y cuándo
- Próximas acciones programadas visibles

### 3. Análisis Inteligente
- IA analiza motivos de rechazo
- IA calcula prioridades
- IA genera recomendaciones

### 4. Cierre Automático
- Presupuestos se marcan como "cerrados" (aceptado/rechazado) automáticamente
- Pacientes se marcan como "recuperados" cuando agendan cita
- Todo queda registrado en el timeline

---

## Flujo de Trabajo Propuesto

### Para Presupuestos:
1. Se crea un presupuesto → Agente inicia campaña automáticamente
2. Agente ejecuta acciones según reglas configuradas
3. Si paciente acepta/rechaza → Presupuesto se marca como cerrado automáticamente
4. Si no hay respuesta después de X días → Agente analiza y marca como rechazado con motivo IA
5. Todo queda registrado en timeline visible

### Para Pacientes Dormidos:
1. Sistema detecta paciente dormido (>6 meses sin visita) → Agente inicia campaña automáticamente
2. Agente ejecuta acciones según reglas configuradas
3. Si paciente agenda cita → Se marca como recuperado automáticamente
4. Si no hay respuesta después de X intentos → Se marca como "no recuperable" temporalmente
5. Todo queda registrado en timeline visible

---

## Páginas a Crear/Modificar

### Nuevas Páginas:
1. `/presupuestos` - Dashboard de Presupuestos (modificar existente)
2. `/presupuestos/analisis` - Análisis de Cierres (nueva)
3. `/campañas` - Dashboard de Campañas (nueva, reemplaza `/pacientes`)
4. `/campañas/recuperacion` - Recuperación de Pacientes (nueva)

### Páginas a Modificar:
1. `/presupuestos/relances` - Ya tiene estructura, mejorar visualización
2. `/presupuestos/seguimiento` - Mejorar con análisis IA
3. `/campañas/salud-preventiva` - Mejorar visualización de acciones
4. `/acciones` - Mejorar con filtros por agente

---

## Implementación Sugerida

### Fase 1: Estructura Base
- Crear dashboards de Presupuestos y Campañas
- Reorganizar menú de navegación
- Implementar detección automática de pacientes dormidos

### Fase 2: Visualización de Acciones
- Timeline en cada presupuesto/paciente
- Vista de acciones del agente
- Métricas de efectividad

### Fase 3: Análisis IA
- Análisis automático de motivos de rechazo
- Cálculo de prioridades
- Recomendaciones automáticas

### Fase 4: Cierre Automático
- Detección automática de aceptación/rechazo
- Marcado automático de pacientes recuperados
- Análisis post-cierre

