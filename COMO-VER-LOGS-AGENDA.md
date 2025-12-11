# Cómo Ver los Logs de la Agenda en Vercel - Paso a Paso

## Paso 1: Acceder a Vercel Dashboard

1. Abre tu navegador y ve a: **https://vercel.com**
2. Inicia sesión con tu cuenta
3. En el dashboard principal, busca y haz clic en tu proyecto **dental-iq** (o el nombre que tenga)

## Paso 2: Ir a la Sección de Functions

1. En la página de tu proyecto, busca en el menú superior las pestañas:
   - **Overview** | **Deployments** | **Analytics** | **Functions** | **Settings**
2. Haz clic en la pestaña **"Functions"** (o "Funciones" si está en español)

## Paso 3: Seleccionar la Función API

1. En la lista de funciones, deberías ver algo como:
   - `/api/index`
   - O simplemente `api/index`
2. Haz clic en **`/api/index`** (o `api/index`)

## Paso 4: Ver los Logs

1. Una vez dentro de la función, verás varias pestañas:
   - **Overview** | **Logs** | **Settings**
2. Haz clic en la pestaña **"Logs"** (o "Registros")

## Paso 5: Filtrar los Logs de Citas

Ahora verás una lista de logs. Para encontrar los logs de la agenda:

### Opción A: Usar el Filtro de Búsqueda
1. Busca un campo de búsqueda o filtro (normalmente arriba de la lista de logs)
2. Escribe: **`citas`** o **`/api/citas/semana`**
3. Presiona Enter

### Opción B: Buscar Manualmente
1. Desplázate por la lista de logs
2. Busca líneas que contengan:
   - `[API] /api/citas/semana`
   - `[API] Total citas en storage`
   - `[Storage] getCitasPorSemana`

## Paso 6: Acceder a la Agenda en tu Aplicación

**IMPORTANTE**: Para que aparezcan los logs, necesitas:

1. Abre tu aplicación en otra pestaña: **https://tu-app.vercel.app** (o la URL que tengas)
2. Navega a la sección de **Agenda** o **Citas**
3. Espera unos segundos mientras se carga

## Paso 7: Volver a Vercel y Ver los Logs Nuevos

1. Vuelve a la pestaña de Vercel con los logs
2. Los logs más recientes deberían aparecer arriba
3. Busca los mensajes que empiezan con `[API]` o `[Storage]`

## Paso 8: Copiar los Logs Relevantes

Busca y copia estos mensajes específicos (copia TODO el mensaje completo):

### Logs que DEBES copiar:

1. **`[API] /api/citas/semana called`**
2. **`[API] Query params - inicio: ... fin: ...`**
3. **`[API] Date range - inicio: ... fin: ...`**
4. **`[API] Total citas en storage: [número]`** ⚠️ MUY IMPORTANTE
5. **`[API] Primera cita en storage: ...`**
6. **`[API] Última cita en storage: ...`**
7. **`[API] Citas encontradas en rango: [número]`** ⚠️ MUY IMPORTANTE
8. **`[Storage] getCitasPorSemana - Total citas: [número]`**
9. **`[Storage] Rango buscado - inicio: ... fin: ...`**
10. **`[Storage] Citas en rango: [número]`**

## Paso 9: Compartir los Logs

1. Selecciona todos los logs relevantes (usa Ctrl+A o Cmd+A)
2. Copia (Ctrl+C o Cmd+C)
3. Pégalos aquí en el chat

## Alternativa: Si No Encuentras los Logs

Si no ves la pestaña "Functions" o "Logs", intenta esto:

### Opción Alternativa 1: Desde Deployments
1. Ve a la pestaña **"Deployments"** (o "Despliegues")
2. Haz clic en el deployment más reciente (el de arriba)
3. Busca un botón o enlace que diga **"View Function Logs"** o **"Ver Logs"**

### Opción Alternativa 2: Desde Runtime Logs
1. En la página principal del proyecto, busca **"Runtime Logs"** o **"Logs de Runtime"**
2. Haz clic ahí
3. Filtra por `api/index` o busca `citas`

## Ejemplo de lo que Deberías Ver

Los logs deberían verse así:

```
[API] /api/citas/semana called
[API] Query params - inicio: 2025-12-08T00:00:00.000Z fin: 2025-12-14T23:59:59.999Z
[API] Date range - inicio: 2025-12-08T00:00:00.000Z fin: 2025-12-14T23:59:59.999Z
[API] Total citas en storage: 60
[API] Primera cita en storage: 2025-11-25T09:00:00.000Z timestamp: 1732525200000
[API] Última cita en storage: 2026-01-05T19:30:00.000Z timestamp: 1736107800000
[Storage] getCitasPorSemana - Total citas: 60
[Storage] Rango buscado - inicio: 2025-12-08T00:00:00.000Z, fin: 2025-12-14T23:59:59.999Z
[Storage] Primera cita: 2025-11-25T09:00:00.000Z
[Storage] Última cita: 2026-01-05T19:30:00.000Z
[Storage] Citas en rango: 8
[API] Citas encontradas en rango: 8
```

## Si Aún No Puedes Encontrar los Logs

Dime:
1. ¿Qué pestañas ves en tu proyecto de Vercel?
2. ¿Ves alguna sección de "Logs" o "Functions"?
3. ¿Puedes hacer una captura de pantalla de la página principal de tu proyecto en Vercel?

Con esa información te puedo guiar más específicamente.
