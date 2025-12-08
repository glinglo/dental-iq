# Guía de Desarrollo

## Iniciar el Servidor

Para iniciar el servidor de desarrollo de forma robusta, usa el script incluido:

```bash
./start-dev.sh
```

Este script:
- Limpia procesos anteriores
- Verifica que el puerto esté disponible
- Inicia el servidor en el puerto 5001
- Monitorea el servidor y lo reinicia si deja de responder
- Guarda los logs en `/tmp/dental-server.log`

## Acceder a la Aplicación

Una vez iniciado, accede a:
- **Frontend**: http://localhost:5001
- **API**: http://localhost:5001/api

## Ver Logs

```bash
tail -f /tmp/dental-server.log
```

## Detener el Servidor

```bash
pkill -f "tsx.*server/index-dev"
```

O presiona `Ctrl+C` si lo ejecutaste en primer plano.

## Solución de Problemas

### El servidor no inicia

1. Verifica que el puerto 5001 esté libre:
   ```bash
   lsof -i :5001
   ```

2. Si el puerto está ocupado, libéralo:
   ```bash
   lsof -ti:5001 | xargs kill -9
   ```

3. Revisa los logs:
   ```bash
   tail -50 /tmp/dental-server.log
   ```

### El servidor se detiene constantemente

1. Verifica errores de sintaxis:
   ```bash
   npm run check
   ```

2. Revisa los logs para ver el error específico:
   ```bash
   tail -100 /tmp/dental-server.log
   ```

### Cambios no se reflejan

1. El servidor debería recargarse automáticamente con HMR
2. Si no funciona, reinicia el servidor:
   ```bash
   pkill -f "tsx.*server/index-dev"
   ./start-dev.sh
   ```

## Estructura del Proyecto

- `client/` - Frontend React + Vite
- `server/` - Backend Express + TypeScript
- `shared/` - Código compartido entre cliente y servidor

## Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con:

```
PORT=5001
NODE_ENV=development
OPENAI_API_KEY=tu_clave_aqui (opcional)
```


