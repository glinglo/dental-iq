// Vercel serverless function wrapper
import { app } from '../server/app';
import { registerRoutes } from '../server/routes';
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
    console.log('[Vercel] process.cwd():', process.cwd());
    console.log('[Vercel] __dirname:', __dirname);
    
    // Registrar rutas de API
    await registerRoutes(app);
    
    // Configurar fallback para SPA (solo para rutas que no sean API ni archivos estáticos)
    // Los archivos estáticos los sirve Vercel automáticamente desde outputDirectory
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

    if (distPath) {
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
        const indexPath = path.resolve(distPath!, 'index.html');
        if (fs.existsSync(indexPath)) {
          res.sendFile(indexPath);
        } else {
          console.error(`[Vercel] index.html not found at: ${indexPath}`);
          res.status(404).json({ error: 'index.html not found' });
        }
      });
    } else {
      console.warn('[Vercel] No se encontró el directorio de build. Vercel debería servir archivos estáticos automáticamente.');
      // Fallback básico sin archivos estáticos
      app.get('*', (req, res) => {
        if (!req.path.startsWith('/api')) {
          res.status(200).send('<!DOCTYPE html><html><head><title>DentalIQ</title></head><body><div id="root"></div><p>Loading...</p></body></html>');
        }
      });
    }
    
    initialized = true;
    console.log('[Vercel] Application initialized successfully');
  } catch (error) {
    console.error('[Vercel] Error during initialization:', error);
    if (error instanceof Error) {
      console.error('[Vercel] Error stack:', error.stack);
    }
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
    if (error instanceof Error) {
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
