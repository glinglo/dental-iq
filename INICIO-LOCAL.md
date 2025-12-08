# 🚀 Inicio Rápido - Desarrollo Local

## Ejecutar la aplicación localmente

### Opción 1: Comando directo
```bash
npm run dev
```

### Opción 2: Con variables de entorno personalizadas
```bash
# Editar .env si necesitas configurar OpenAI API
# Luego ejecutar:
npm run dev
```

## Acceso a la aplicación

Una vez iniciado el servidor, la aplicación estará disponible en:

**URL:** http://localhost:5000

## Características disponibles sin configuración

✅ **Datos Mock**: La aplicación incluye datos de ejemplo:
- 2 clínicas
- 200 pacientes
- 50 presupuestos con scoring IA simulado
- Citas y mensajes de ejemplo

✅ **Funcionalidades IA**: Las funciones de IA tienen fallback sin API key:
- Scoring de urgencia (cálculo básico)
- Probabilidad de aceptación (cálculo básico)
- Generación de mensajes (mensajes predefinidos)

## Configuración opcional

### Para usar OpenAI API real (recomendado para mejor experiencia)

1. Obtén una API key de OpenAI:
   - Ve a https://platform.openai.com/api-keys
   - Crea una nueva API key

2. Edita el archivo `.env`:
   ```bash
   OPENAI_API_KEY=sk-tu-api-key-aqui
   ```

3. Reinicia el servidor:
   ```bash
   npm run dev
   ```

### Para usar PostgreSQL (opcional)

Si quieres usar una base de datos real en lugar de memoria:

1. Instala PostgreSQL localmente
2. Crea una base de datos:
   ```sql
   CREATE DATABASE dental_db;
   ```

3. Edita `.env`:
   ```bash
   DATABASE_URL=postgresql://usuario:password@localhost:5432/dental_db
   ```

4. Ejecuta las migraciones:
   ```bash
   npm run db:push
   ```

## Estructura de la aplicación

- **Frontend**: React + TypeScript + TailwindCSS
- **Backend**: Node.js + Express
- **Storage**: MemStorage (memoria) por defecto
- **IA**: OpenAI API (con fallback sin API key)

## Páginas disponibles

1. **Dashboard** (`/`) - KPIs y métricas principales
2. **Presupuestos** (`/presupuestos`) - Gestión de presupuestos con IA
3. **Pacientes** (`/pacientes`) - Lista de pacientes
4. **Relances** (`/pacientes/relances`) - Seguimiento de presupuestos pendientes
5. **Seguimiento** (`/pacientes/seguimiento`) - Dashboard de KPIs y análisis
6. **Recordatorios** (`/pacientes/recordatorios`) - Gestión de recordatorios
7. **Mensajes post-visita** (`/pacientes/post-visita`) - Fidelización
8. **Citas** (`/citas`) - Agenda de citas

## Solución de problemas

### El servidor no inicia
- Verifica que el puerto 5000 esté libre
- Cambia el puerto en `.env` si es necesario

### Errores de dependencias
```bash
npm install
```

### Limpiar y reinstalar
```bash
rm -rf node_modules package-lock.json
npm install
npm run dev
```

## Notas importantes

- Los datos se pierden al reiniciar el servidor (usa MemStorage)
- Para persistencia, configura PostgreSQL
- Las funciones IA funcionan mejor con OpenAI API key real
- El diseño es responsive y funciona en móvil

¡Disfruta explorando LaFraise Clone! 🦷✨

