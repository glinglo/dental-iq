# Debug de Agenda Vacía

## Logs a Revisar en Vercel

Cuando accedas a la agenda, revisa los logs de runtime de Vercel y busca estos mensajes específicos:

### 1. Logs de Inicialización de Storage
Busca mensajes que empiecen con `[Storage]`:
- `[Storage] Starting mock data initialization...`
- `[Storage] ✓ Loaded X citas` - Debe mostrar un número > 0
- `[MockData] Generated X citas` - Debe mostrar un número > 0
- `[MockData] Primera cita: [fecha]`
- `[MockData] Última cita: [fecha]`

### 2. Logs de la API `/api/citas/semana`
Busca mensajes que empiecen con `[API]`:
- `[API] /api/citas/semana called`
- `[API] Query params - inicio: [fecha], fin: [fecha]`
- `[API] Date range - inicio: [fecha], fin: [fecha]`
- `[API] Total citas en storage: [número]` - **IMPORTANTE**: Debe ser > 0
- `[API] Primera cita en storage: [fecha]`
- `[API] Última cita en storage: [fecha]`
- `[API] Citas encontradas en rango: [número]` - **IMPORTANTE**: Este es el número que se devuelve al frontend

### 3. Logs de Storage `getCitasPorSemana`
Busca mensajes que empiecen con `[Storage]`:
- `[Storage] getCitasPorSemana - Total citas: [número]`
- `[Storage] Rango buscado - inicio: [fecha], fin: [fecha]`
- `[Storage] Primera cita: [fecha]`
- `[Storage] Última cita: [fecha]`
- `[Storage] Citas en rango: [número]` - **IMPORTANTE**: Debe coincidir con el número de citas encontradas

## Qué Buscar

1. **Si `Total citas en storage: 0`**: Las citas no se están generando. Problema en `generarCitasMock`.

2. **Si `Total citas en storage: > 0` pero `Citas encontradas en rango: 0`**: 
   - Las fechas del rango no coinciden con las fechas de las citas
   - Problema de zona horaria o formato de fechas
   - Compara las fechas de "Primera cita" y "Última cita" con el rango buscado

3. **Si las fechas no coinciden**: 
   - El frontend está buscando un rango que no tiene citas
   - Las citas se generaron para un rango diferente

## Cómo Obtener los Logs

1. Ve a Vercel Dashboard
2. Selecciona tu proyecto
3. Ve a la pestaña "Functions"
4. Haz clic en `/api/index`
5. Ve a la pestaña "Logs"
6. Filtra por "citas" o busca los mensajes `[API]` y `[Storage]`
7. Copia los logs relevantes y compártelos

## Información Adicional Necesaria

Cuando compartas los logs, incluye:
- La fecha y hora actual (para verificar el rango de fechas)
- Los logs completos de una petición a `/api/citas/semana`
- Los logs de inicialización de storage (si están disponibles)
