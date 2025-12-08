# LaFraise Clone - Plataforma SaaS para Clínicas Dentales

Plataforma web full-stack SaaS para gestión de presupuestos y pacientes con IA, inspirada en LaFraise.

## 🚀 Características Principales

### Presupuestos
- ✅ Lista de presupuestos con tabla sortable
- ✅ Filtros por estado, prioridad, fecha y búsqueda
- ✅ Creación/edición de presupuestos
- ✅ Scoring IA automático (urgencia y probabilidad de aceptación)
- ✅ Priorización automática basada en IA
- ✅ Importación desde PMS (placeholder)

### Pacientes
- ✅ **Relances**: Seguimiento de presupuestos pendientes con mensajes IA personalizados
- ✅ **Seguimiento**: Dashboard de KPIs y análisis de rechazos con IA
- ✅ **Recordatorios**: Gestión de recordatorios automáticos de citas
- ✅ **Mensajes post-visita**: Fidelización después de tratamientos aceptados

### Dashboard
- ✅ KPIs en tiempo real (tasa aceptación, facturación, horas ahorradas)
- ✅ Gráficos de tasa de transformación mensual
- ✅ Análisis de rechazos por motivo (clasificación IA)

### IA Powered
- ✅ Scoring de urgencia (0-100)
- ✅ Probabilidad de aceptación (0-100)
- ✅ Generación de mensajes personalizados (relances, recordatorios, post-visita)
- ✅ Análisis de motivos de rechazo

## 🛠️ Stack Tecnológico

- **Frontend**: React + TypeScript + TailwindCSS + Vite
- **Backend**: Node.js + Express
- **Base de datos**: PostgreSQL + Drizzle ORM
- **IA**: OpenAI API (GPT-4o-mini)
- **Autenticación**: Clerk (configurable)
- **Deployment**: Vercel

## 📦 Instalación

1. **Clonar el repositorio**
```bash
git clone <repo-url>
cd dental-new
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env
```

Editar `.env` y configurar:
- `DATABASE_URL`: URL de conexión a PostgreSQL
- `OPENAI_API_KEY`: Clave API de OpenAI (requerida para funcionalidades IA)
- `CLERK_*`: Claves de Clerk para autenticación (opcional)

4. **Configurar base de datos**
```bash
npm run db:push
```

5. **Ejecutar en desarrollo**
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5000`

## 🚀 Deployment en Vercel

1. **Conectar repositorio a Vercel**
   - Ir a [vercel.com](https://vercel.com)
   - Importar proyecto desde GitHub/GitLab
   - Vercel detectará automáticamente la configuración

2. **Configurar variables de entorno en Vercel**
   - Ir a Settings → Environment Variables
   - Agregar:
     - `DATABASE_URL`: URL de PostgreSQL (usar Vercel Postgres o externo)
     - `OPENAI_API_KEY`: Tu clave API de OpenAI
     - `CLERK_PUBLISHABLE_KEY` y `CLERK_SECRET_KEY` (si usas Clerk)

3. **Deploy**
   - Vercel desplegará automáticamente en cada push a main
   - O hacer deploy manual desde el dashboard

## 🔐 Autenticación con Clerk

Para habilitar autenticación con Clerk:

1. **Crear cuenta en Clerk**
   - Ir a [clerk.com](https://clerk.com)
   - Crear nueva aplicación
   - Copiar las claves API

2. **Configurar en el proyecto**
   - Agregar `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` y `CLERK_SECRET_KEY` en `.env`
   - (Nota: La integración completa de Clerk requiere configuración adicional en el código)

## 📊 Estructura de Base de Datos

### Tablas Principales
- `clinics`: Clínicas dentales
- `users`: Usuarios con roles (admin/recepción/dentista)
- `pacientes`: Pacientes de las clínicas
- `budgets`: Presupuestos con scoring IA
- `mensajes`: Mensajes (relances, recordatorios, post-visita)
- `citas`: Citas/agenda
- `analytics`: KPIs agregados

## 🤖 Funcionalidades IA

### Scoring Automático
Al crear un presupuesto, la IA calcula automáticamente:
- **Urgency Score (0-100)**: Basado en tipo de tratamiento, dolor mencionado, edad del paciente
- **Acceptance Prob (0-100)**: Basado en historial del paciente, precio, tipo de tratamiento
- **Priority**: Calculado automáticamente (high/medium/low) basado en los scores anteriores

### Generación de Mensajes
- **Relances**: Mensajes personalizados según días pendientes y canal
- **Recordatorios**: Mensajes adaptados al perfil del paciente
- **Post-visita**: Mensajes de fidelización con feedback y upsell preventivo

## 📝 Seed Data

El proyecto incluye datos de ejemplo:
- 2 clínicas
- 200 pacientes
- 50 presupuestos con scoring IA
- Citas y mensajes de ejemplo

## 🎨 UI/UX

- Diseño minimalista inspirado en Figma/Linear
- Sidebar fijo izquierdo con submenús
- Responsive mobile-first
- Componentes reutilizables estilo Storybook

## 📄 Licencia

MIT

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:
1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📧 Soporte

Para soporte, abre un issue en GitHub o contacta al equipo de desarrollo.

