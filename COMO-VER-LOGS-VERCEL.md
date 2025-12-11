# 📋 Cómo Ver Logs de Runtime en Vercel

Los logs de runtime son diferentes de los logs de build. Los logs de runtime muestran lo que sucede cuando tu aplicación se ejecuta en producción.

## Pasos para Ver Logs de Runtime

### Opción 1: Desde el Dashboard de Vercel (Recomendado)

1. **Ve a tu proyecto en Vercel**
   - Abre https://vercel.com
   - Inicia sesión
   - Selecciona tu proyecto `dental-iq`

2. **Accede a los logs de funciones**
   - En el dashboard del proyecto, ve a la pestaña **"Functions"** o **"Deployments"**
   - Haz clic en el deployment más reciente (el último que se desplegó)
   - Busca la sección **"Function Logs"** o **"Runtime Logs"**

3. **Filtra por función**
   - Busca la función `api/index` (esta es la función serverless que maneja todas las rutas)
   - Haz clic en ella para ver los logs específicos de esa función

4. **Ver logs en tiempo real**
   - Los logs aparecerán cuando hagas una request a tu aplicación
   - Abre tu app en el navegador: `https://tu-app.vercel.app`
   - Navega a la sección de agenda/citas
   - Vuelve a Vercel y verás los logs aparecer en tiempo real

### Opción 2: Desde la CLI de Vercel

Si tienes la CLI de Vercel instalada:

```bash
# Instalar Vercel CLI (si no la tienes)
npm i -g vercel

# Iniciar sesión
vercel login

# Ver logs en tiempo real
vercel logs tu-proyecto --follow
```

### Opción 3: Desde el navegador (Network Tab)

1. Abre tu app en el navegador: `https://tu-app.vercel.app`
2. Abre las **DevTools** (F12 o Cmd+Option+I)
3. Ve a la pestaña **"Network"**
4. Filtra por **"Fetch/XHR"**
5. Navega a la sección de agenda
6. Busca la request a `/api/citas/semana`
7. Haz clic en ella y ve a la pestaña **"Response"** para ver la respuesta
8. Si hay un error, verás el código de estado (500, etc.)

## Qué Buscar en los Logs

Cuando accedas a la agenda, deberías ver logs como estos:

```
[Vercel] GET /api/citas/semana
[Vercel] Initializing storage...
[Storage] Starting mock data initialization...
[MockData] Generating citas - Current date: ...
[MockData] Inicio semana (lunes): ...
[MockData] Generated 60 citas
[Storage] ✓ Loaded 60 citas
[API] /api/citas/semana called
[API] Query params - inicio: ..., fin: ...
[API] Date range - inicio: ..., fin: ...
[API] Total citas en storage: 60
[Storage] getCitasPorSemana - Total citas: 60
[Storage] Rango buscado - inicio: ..., fin: ...
[Storage] Primera cita: ...
[Storage] Última cita: ...
[Storage] Citas en rango: X
[API] Citas encontradas en rango: X
```

## Si No Ves Logs

1. **Asegúrate de que el deployment esté activo**
   - Ve a "Deployments" y verifica que el último deployment esté en estado "Ready"

2. **Haz una request a la API**
   - Los logs solo aparecen cuando hay actividad
   - Abre la agenda en tu app para generar logs

3. **Verifica que estés viendo los logs correctos**
   - Los logs de BUILD son diferentes de los logs de RUNTIME
   - Necesitas los logs de RUNTIME (Function Logs)

4. **Usa el filtro de tiempo**
   - Asegúrate de estar viendo logs del último deployment
   - Los logs pueden tardar unos segundos en aparecer

## Ejemplo de URL de Logs

Si tu proyecto se llama `dental-iq`, los logs estarán en:
- Dashboard: `https://vercel.com/tu-usuario/dental-iq`
- Luego: Deployments → Último deployment → Function Logs → `api/index`

## Consejos

- Los logs de Vercel tienen un límite de tiempo (generalmente 24 horas)
- Si no ves logs, intenta hacer una nueva request a la API
- Los logs aparecen en tiempo real cuando hay actividad
- Puedes filtrar por función, tiempo, o buscar texto específico
