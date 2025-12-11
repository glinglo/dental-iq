// Vercel serverless function wrapper
import { app } from '../server/app';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

let routesRegistered = false;

// Obtener __dirname equivalente en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Función para registrar rutas (solo una vez)
async function registerRoutesOnce() {
  if (routesRegistered) return;
  
  try {
    console.log('[Vercel] Registering routes...');
    
    // Importar y registrar rutas
    const { registerRoutes } = await import('../server/routes');
    
    // En Vercel serverless, registerRoutes crea un servidor HTTP pero no lo necesitamos
    // Solo necesitamos que registre las rutas en el app de Express
    // El servidor HTTP se crea pero no se usa en serverless
    const server = await registerRoutes(app);
    
    // No necesitamos hacer nada con el server en Vercel
    // Las rutas ya están registradas en el app
    
    routesRegistered = true;
    console.log('[Vercel] Routes registered successfully');
  } catch (error) {
    console.error('[Vercel] Error registering routes:', error);
    if (error instanceof Error) {
      console.error('[Vercel] Error message:', error.message);
      console.error('[Vercel] Error stack:', error.stack);
    }
    throw error; // Re-lanzar para que Vercel lo capture
  }
}

// Función para inicializar datos (se ejecuta en cada request si es necesario)
async function ensureDataInitialized() {
  try {
    const { storage } = await import('../server/storage');
    
    // Verificar si ya hay datos
    const pacientes = await storage.getPacientes();
    const budgets = await storage.getBudgets();
    
    if (pacientes.length === 0 || budgets.length === 0) {
      console.log('[Vercel] Data not initialized, initializing now...');
      await storage.ensureInitialized();
      
      // Verificar después de inicializar
      const pacientesAfter = await storage.getPacientes();
      const budgetsAfter = await storage.getBudgets();
      
      console.log(`[Vercel] Data initialized - pacientes: ${pacientesAfter.length}, budgets: ${budgetsAfter.length}`);
      
      if (pacientesAfter.length === 0 || budgetsAfter.length === 0) {
        console.error('[Vercel] WARNING: Data still empty after initialization!');
      }
    }
  } catch (error) {
    console.error('[Vercel] Error ensuring data initialization:', error);
    if (error instanceof Error) {
      console.error('[Vercel] Error message:', error.message);
      console.error('[Vercel] Error stack:', error.stack);
    }
    // No re-lanzar - permitir que las rutas manejen datos vacíos
  }
}

export default async function handler(req: any, res: any) {
  try {
    console.log(`[Vercel] ${req.method} ${req.url}`);
    
    // Paso 1: Registrar rutas (solo una vez, pero seguro en cada request)
    try {
      await registerRoutesOnce();
    } catch (routeError) {
      console.error('[Vercel] Failed to register routes:', routeError);
      if (!res.headersSent) {
        return res.status(500).json({ 
          error: 'Failed to initialize routes',
          message: routeError instanceof Error ? routeError.message : 'Unknown error'
        });
      }
      return;
    }
    
    // Paso 2: Asegurar que los datos estén inicializados
    // Esto se hace en cada request porque en serverless cada instancia puede ser nueva
    await ensureDataInitialized();
    
    // Paso 3: Manejar la request con Express
    app(req, res, (err: any) => {
      if (err) {
        console.error('[Vercel] Express error:', err);
        if (err instanceof Error) {
          console.error('[Vercel] Express error message:', err.message);
          console.error('[Vercel] Express error stack:', err.stack);
        }
        if (!res.headersSent) {
          res.status(500).json({ 
            error: 'Internal Server Error',
            message: err.message || 'Unknown error'
          });
        }
      }
    });
  } catch (error) {
    console.error('[Vercel] CRITICAL Handler error:', error);
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
