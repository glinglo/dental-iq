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
  const possiblePaths = [
    path.resolve(process.cwd(), 'dist', 'public'),
    path.resolve(process.cwd(), 'public'),
    path.resolve(__dirname, '..', 'dist', 'public'),
    path.resolve(__dirname, '..', 'public'),
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
    app.use(express.static(distPath));
    
    // Fallback para SPA - solo si no es una ruta de API
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api')) {
        return next();
      }
      const indexPath = path.resolve(distPath!, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        next();
      }
    });
  } else {
    console.error('[Vercel] No se encontró el directorio de build. Paths probados:', possiblePaths);
  }
  
  initialized = true;
}

export default async function handler(req: any, res: any) {
  await initialize();
  
  // Manejar la request con Express
  app(req, res);
}
