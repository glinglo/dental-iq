// Vercel serverless function wrapper
import { app } from '../server/app';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

let initialized = false;

// Obtener __dirname equivalente en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function initialize() {
  if (initialized) return;
  
  try {
    console.log('[Vercel] Initializing application...');
    console.log('[Vercel] NODE_ENV:', process.env.NODE_ENV);
    console.log('[Vercel] VERCEL:', process.env.VERCEL);
    
    // Asegurar que storage se inicialice antes de importar routes
    // Esto fuerza la inicialización de los datos mock
    const { storage } = await import('../server/storage');
    console.log('[Vercel] Storage initialized, pacientes count:', (await storage.getPacientes()).length);
    
    // Importar registerRoutes dinámicamente
    const { registerRoutes } = await import('../server/routes');
    
    // Registrar rutas de API
    await registerRoutes(app);
    console.log('[Vercel] Routes registered');
    
    // Configurar fallback para SPA
    const possiblePaths = [
      path.resolve(process.cwd(), 'dist', 'public'),
      path.resolve(__dirname, '..', 'dist', 'public'),
      path.resolve(__dirname, '..', '..', 'dist', 'public'),
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

    // Fallback para SPA - solo para rutas que no sean API ni archivos estáticos
    app.get('*', (req, res, next) => {
      // Las rutas de API ya están manejadas arriba
      if (req.path.startsWith('/api')) {
        return next();
      }
      // Los archivos estáticos los sirve Vercel automáticamente
      if (req.path.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|json)$/)) {
        return res.status(404).json({ error: 'Static file not found' });
      }
      // Servir index.html para todas las demás rutas (SPA fallback)
      if (distPath) {
        const indexPath = path.resolve(distPath, 'index.html');
        if (fs.existsSync(indexPath)) {
          res.sendFile(indexPath);
        } else {
          res.status(404).json({ error: 'index.html not found' });
        }
      } else {
        // Fallback básico si no encontramos los archivos
        res.status(200).send('<!DOCTYPE html><html><head><title>DentalIQ</title></head><body><div id="root"></div><p>Loading...</p></body></html>');
      }
    });
    
    initialized = true;
    console.log('[Vercel] Application initialized successfully');
  } catch (error) {
    console.error('[Vercel] Error during initialization:', error);
    if (error instanceof Error) {
      console.error('[Vercel] Error message:', error.message);
      console.error('[Vercel] Error stack:', error.stack);
    }
    throw error;
  }
}

export default async function handler(req: any, res: any) {
  try {
    console.log(`[Vercel] Request: ${req.method} ${req.url}`);
    
    await initialize();
    
    // Manejar la request con Express
    app(req, res, (err: any) => {
      if (err) {
        console.error('[Vercel] Express error:', err);
        if (!res.headersSent) {
          res.status(500).json({ 
            error: 'Internal Server Error',
            message: err.message || 'Unknown error'
          });
        }
      }
    });
  } catch (error) {
    console.error('[Vercel] Handler error:', error);
    if (error instanceof Error) {
      console.error('[Vercel] Error message:', error.message);
      console.error('[Vercel] Error stack:', error.stack);
    }
    if (!res.headersSent) {
      res.status(500).json({ 
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}
