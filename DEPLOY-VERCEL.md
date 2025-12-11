# 🚀 Guía de Despliegue en Vercel

## Pasos para desplegar en Vercel

### 1. Conectar el repositorio a Vercel

1. Ve a [vercel.com](https://vercel.com) e inicia sesión
2. Haz clic en "Add New Project"
3. Importa el repositorio: `glinglo/dental-iq`
4. Vercel detectará automáticamente la configuración desde `vercel.json`

### 2. Configuración del Proyecto

Vercel debería detectar automáticamente:
- **Framework Preset**: Other
- **Build Command**: `npm run build` (ya configurado en vercel.json)
- **Output Directory**: `dist/public` (ya configurado en vercel.json)
- **Install Command**: `npm install` (ya configurado en vercel.json)

### 3. Variables de Entorno (Opcional)

Si quieres usar funcionalidades avanzadas de IA, puedes configurar:

```
OPENAI_API_KEY=sk-tu-api-key-aqui
```

**Nota**: La aplicación funciona perfectamente sin esta variable, usando fallbacks para las funciones de IA.

### 4. Desplegar

1. Haz clic en "Deploy"
2. Vercel construirá y desplegará automáticamente
3. Una vez completado, tendrás una URL como: `https://dental-iq.vercel.app`

### 5. Verificar el Despliegue

Después del despliegue, verifica que:

1. **La aplicación carga correctamente**: Visita la URL de Vercel
2. **Los datos se cargan**: Verifica que las secciones muestren datos:
   - Dashboard con KPIs
   - Lista de pacientes (200 pacientes)
   - Presupuestos (50 presupuestos)
   - Citas (60 citas)
   - Campañas (3 campañas)

3. **Las rutas API funcionan**: Prueba:
   - `https://tu-app.vercel.app/api/pacientes` - Debe devolver 200 pacientes
   - `https://tu-app.vercel.app/api/budgets` - Debe devolver 50 presupuestos
   - `https://tu-app.vercel.app/api/dashboard/kpis` - Debe devolver KPIs

### 6. Monitoreo

Revisa los logs de Vercel para verificar que:
- Los datos mock se inicializan correctamente
- No hay errores en la inicialización
- Las rutas API responden correctamente

En los logs deberías ver:
```
[Vercel] Storage initialized:
[Vercel]   - Pacientes: 200 (expected: 200)
[Vercel]   - Budgets: 50 (expected: 50)
[Vercel]   - Campañas: 3 (expected: 3)
[Vercel]   - Citas: 60 (expected: ~60)
```

## Solución de Problemas

### Las secciones aparecen vacías

1. **Revisa los logs de Vercel**: Ve a la pestaña "Functions" y revisa los logs
2. **Verifica que `ensureInitialized()` se ejecute**: Los logs deberían mostrar la inicialización
3. **Prueba las rutas API directamente**: Usa curl o Postman para verificar que devuelven datos

### Error en el build

1. Verifica que todas las dependencias estén en `package.json`
2. Revisa los logs de build en Vercel
3. Prueba el build localmente: `npm run build`

### Las rutas API no funcionan

1. Verifica que `vercel.json` tenga la configuración correcta de rewrites
2. Asegúrate de que `api/index.ts` esté en la raíz del proyecto
3. Revisa los logs de las funciones serverless en Vercel

## Configuración Actual

- **Build Command**: `npm run build`
- **Output Directory**: `dist/public`
- **API Routes**: `/api/*` → `/api/index`
- **SPA Fallback**: Todas las rutas no-API → `/index.html`

## Notas Importantes

- ✅ Los datos se inicializan automáticamente en cada request (serverless)
- ✅ No se requiere base de datos (usa MemStorage)
- ✅ Los datos se regeneran en cada cold start
- ✅ Funciona sin variables de entorno (usa fallbacks para IA)

## Próximos Pasos

Una vez desplegado, puedes:
1. Configurar un dominio personalizado
2. Configurar variables de entorno para IA avanzada
3. Configurar PostgreSQL si necesitas persistencia de datos
4. Configurar webhooks para integraciones
