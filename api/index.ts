// Vercel serverless function wrapper
import { app } from '../server/app';
import { registerRoutes } from '../server/routes';
import { serveStatic } from '../server/index-prod';
import { createServer } from 'http';

let initialized = false;
let serverInstance: any = null;

async function initialize() {
  if (initialized) return;
  
  // Registrar rutas (esto devuelve un Server pero no lo necesitamos en Vercel)
  serverInstance = await registerRoutes(app);
  
  // Configurar archivos estáticos
  await serveStatic(app, serverInstance);
  
  initialized = true;
}

export default async function handler(req: any, res: any) {
  await initialize();
  
  // Manejar la request con Express
  app(req, res);
}
