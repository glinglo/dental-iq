#!/bin/bash

# Script para iniciar el servidor de desarrollo de forma robusta
# Este script se asegura de que el servidor se mantenga corriendo

PORT=${PORT:-5001}
LOG_FILE="/tmp/dental-server.log"

# Función para limpiar procesos anteriores
cleanup() {
    echo "Deteniendo procesos anteriores..."
    pkill -f "tsx.*server/index-dev" || true
    pkill -f "node.*server" || true
    sleep 2
}

# Función para iniciar el servidor
start_server() {
    echo "Iniciando servidor en puerto $PORT..."
    echo "Logs disponibles en: $LOG_FILE"
    
    cd /Users/usuario/Desktop/dental-new
    
    # Limpiar logs anteriores
    > "$LOG_FILE"
    
    # Iniciar el servidor
    PORT=$PORT NODE_ENV=development npm run dev >> "$LOG_FILE" 2>&1 &
    
    SERVER_PID=$!
    echo "Servidor iniciado con PID: $SERVER_PID"
    
    # Esperar a que el servidor esté listo
    echo "Esperando a que el servidor esté listo..."
    for i in {1..30}; do
        if curl -s http://localhost:$PORT/api/pacientes > /dev/null 2>&1; then
            echo "✓ Servidor listo en http://localhost:$PORT"
            return 0
        fi
        sleep 1
    done
    
    echo "✗ El servidor no respondió a tiempo"
    echo "Últimas líneas del log:"
    tail -20 "$LOG_FILE"
    return 1
}

# Limpiar procesos anteriores
cleanup

# Verificar que el puerto esté disponible
if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null ; then
    echo "Puerto $PORT ya está en uso. Intentando liberarlo..."
    lsof -ti:$PORT | xargs kill -9 2>/dev/null || true
    sleep 2
fi

# Iniciar el servidor
if start_server; then
    echo ""
    echo "=========================================="
    echo "Servidor corriendo en http://localhost:$PORT"
    echo "Para ver los logs: tail -f $LOG_FILE"
    echo "Para detener: pkill -f 'tsx.*server/index-dev'"
    echo "=========================================="
    echo ""
    
    # Mantener el script corriendo y monitorear
    while kill -0 $SERVER_PID 2>/dev/null; do
        sleep 5
        # Verificar que el servidor siga respondiendo
        if ! curl -s http://localhost:$PORT/api/pacientes > /dev/null 2>&1; then
            echo "⚠ El servidor dejó de responder. Reiniciando..."
            kill $SERVER_PID 2>/dev/null || true
            sleep 2
            start_server
        fi
    done
else
    echo "Error al iniciar el servidor. Revisa los logs en $LOG_FILE"
    exit 1
fi


