// Vercel serverless function wrapper
import { app } from '../server/app';
import { registerRoutes } from '../server/routes';
import fs from 'fs';
import path from 'path';
import express from 'express';
import { fileURLToPath } from 'url';

let initialized = false;
let serverInstance: any = null;

// Obtener __dirname equivalente en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function initialize() {
  if (initialized) return;
  
  try {
    // Registrar rutas (esto devuelve un Server pero no lo necesitamos en Vercel)
    serverInstance = await registerRoutes(app);
    
    // Configurar archivos estáticos para Vercel
    const possiblePaths = [
      path.resolve(process.cwd(), 'dist', 'public'),
      path.resolve(process.cwd(), 'public'),
      path.resolve(__dirname, '..', 'dist', 'public'),
      path.resolve(__dirname, '..', 'public'),
      '/var/task/dist/public', // Lambda function path
      '/var/task/public', // Lambda function path
    ];

    let distPath: string | null = null;
    for (const possiblePath of possiblePaths) {
      try {
        if (fs.existsSync(possiblePath)) {
          distPath = possiblePath;
          console.log(`[Vercel] Found static files at: ${distPath}`);
          break;
        }
      } catch (e) {
        // Ignorar errores de acceso
      }
    }

    if (distPath) {
      // Servir archivos estáticos ANTES de las rutas de API
      app.use(express.static(distPath, {
        maxAge: '1y',
        etag: true,
        index: false
      }));
      
      // Fallback para SPA - solo si no es una ruta de API ni un archivo estático
      app.get('*', (req, res, next) => {
        if (req.path.startsWith('/api')) {
          return next();
        }
        // Si es un archivo estático, ya debería haberse servido arriba
        if (req.path.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|json)$/)) {
          return res.status(404).send('File not found');
        }
        // Servir index.html para todas las demás rutas (SPA fallback)
        const indexPath = path.resolve(distPath!, 'index.html');
        if (fs.existsSync(indexPath)) {
          res.sendFile(indexPath);
        } else {
          console.error(`[Vercel] index.html not found at: ${indexPath}`);
          res.status(404).send('index.html not found');
        }
      });
    } else {
      console.warn('[Vercel] No se encontró el directorio de build. Paths probados:', possiblePaths);
      console.warn('[Vercel] process.cwd():', process.cwd());
      console.warn('[Vercel] __dirname:', __dirname);
      // Continuar sin archivos estáticos - Vercel debería servirlos automáticamente
    }
    
    initialized = true;
  } catch (error) {
    console.error('[Vercel] Error during initialization:', error);
    throw error;
  }
}

export default async function handler(req: any, res: any) {
  try {
    await initialize();
    
    // Manejar la request con Express
    app(req, res);
  } catch (error) {
    console.error('[Vercel] Handler error:', error);
    if (!res.headersSent) {
      res.status(500).json({ 
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}
