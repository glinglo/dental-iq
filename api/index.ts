// Vercel serverless function wrapper
import { app } from '../server/app';
import { registerRoutes } from '../server/routes';
import fs from 'fs';
import path from 'path';
import express from 'express';

let initialized = false;
let serverInstance: any = null;

async function initialize() {
  if (initialized) return;
  
  // Registrar rutas (esto devuelve un Server pero no lo necesitamos en Vercel)
  serverInstance = await registerRoutes(app);
  
  // Configurar archivos estáticos para Vercel
  const currentDir = path.dirname(new URL(import.meta.url).pathname);
  const possiblePaths = [
    path.resolve(process.cwd(), 'dist', 'public'),
    path.resolve(process.cwd(), 'public'),
    path.resolve(currentDir, '..', 'dist', 'public'),
    path.resolve(currentDir, '..', 'public'),
  ];

  let distPath: string | null = null;
  for (const possiblePath of possiblePaths) {
    if (fs.existsSync(possiblePath)) {
      distPath = possiblePath;
      break;
    }
  }

  if (distPath) {
    console.log(`[Vercel] Serving static files from: ${distPath}`);
    
    // Servir archivos estáticos ANTES de las rutas de API
    app.use(express.static(distPath, {
      maxAge: '1y',
      etag: true
    }));
    
    // Fallback para SPA - solo si no es una ruta de API
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api')) {
        return next();
      }
      // Si es un archivo estático, ya debería haberse servido arriba
      if (req.path.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|json)$/)) {
        return res.status(404).send('File not found');
      }
      const indexPath = path.resolve(distPath!, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        console.error(`[Vercel] index.html not found at: ${indexPath}`);
        res.status(404).send('index.html not found');
      }
    });
  } else {
    console.error('[Vercel] No se encontró el directorio de build. Paths probados:', possiblePaths);
    console.error('[Vercel] process.cwd():', process.cwd());
    console.error('[Vercel] currentDir:', currentDir);
  }
  
  initialized = true;
}

export default async function handler(req: any, res: any) {
  await initialize();
  
  // Manejar la request con Express
  app(req, res);
}
