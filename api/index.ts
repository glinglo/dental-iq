// Vercel serverless function wrapper
import { app } from '../server/app';

let routesRegistered = false;
let storageInitialized = false;

// Función para obtener storage de forma lazy
async function getStorage() {
  const { storage } = await import('../server/storage');
  return storage;
}

// Función para inicializar datos de forma robusta
// En serverless, cada instancia puede ser nueva, así que siempre verificamos
async function initializeStorage() {
  try {
    const storage = await getStorage();
    
    // Verificar si ya hay datos
    const pacientes = await storage.getPacientes();
    const budgets = await storage.getBudgets();
    
    // Si no hay datos, inicializar
    if (pacientes.length === 0 || budgets.length === 0) {
      console.log('[Vercel] Storage empty, initializing...');
      await storage.ensureInitialized();
      
      // Verificar después de inicializar
      const pacientesAfter = await storage.getPacientes();
      const budgetsAfter = await storage.getBudgets();
      
      console.log(`[Vercel] Storage initialized - pacientes: ${pacientesAfter.length}, budgets: ${budgetsAfter.length}`);
      
      if (pacientesAfter.length === 0 || budgetsAfter.length === 0) {
        console.error('[Vercel] CRITICAL: Storage is still empty after initialization!');
        throw new Error(`Storage initialization failed - pacientes: ${pacientesAfter.length}, budgets: ${budgetsAfter.length}`);
      }
    } else {
      console.log(`[Vercel] Storage already initialized - pacientes: ${pacientes.length}, budgets: ${budgets.length}`);
    }
  } catch (error) {
    console.error('[Vercel] CRITICAL ERROR initializing storage:', error);
    if (error instanceof Error) {
      console.error('[Vercel] Error message:', error.message);
      console.error('[Vercel] Error stack:', error.stack);
    }
    throw error; // Re-lanzar para que se capture arriba
  }
}

// Función para registrar rutas (solo una vez)
async function registerRoutesOnce() {
  if (routesRegistered) return;
  
  try {
    console.log('[Vercel] Registering routes...');
    
    // Importar routes dinámicamente para evitar inicialización temprana del storage
    const { registerRoutes } = await import('../server/routes');
    
    // Registrar rutas en el app
    await registerRoutes(app);
    
    routesRegistered = true;
    console.log('[Vercel] Routes registered successfully');
  } catch (error) {
    console.error('[Vercel] ERROR registering routes:', error);
    if (error instanceof Error) {
      console.error('[Vercel] Error message:', error.message);
      console.error('[Vercel] Error stack:', error.stack);
    }
    throw error;
  }
}

export default async function handler(req: any, res: any) {
  // Timeout para evitar que la función se quede colgada
  const timeout = setTimeout(() => {
    if (!res.headersSent) {
      console.error('[Vercel] Request timeout');
      res.status(504).json({ error: 'Request timeout' });
    }
  }, 30000); // 30 segundos
  
  try {
    console.log(`[Vercel] ${req.method} ${req.url || req.path}`);
    
    // Paso 1: Registrar rutas primero
    try {
      await registerRoutesOnce();
    } catch (routeError) {
      clearTimeout(timeout);
      console.error('[Vercel] Failed to register routes:', routeError);
      if (!res.headersSent) {
        return res.status(500).json({ 
          error: 'Failed to initialize routes',
          message: routeError instanceof Error ? routeError.message : 'Unknown error'
        });
      }
      return;
    }
    
    // Paso 2: Inicializar storage ANTES de manejar la request
    try {
      await initializeStorage();
    } catch (storageError) {
      clearTimeout(timeout);
      console.error('[Vercel] Failed to initialize storage:', storageError);
      if (!res.headersSent) {
        return res.status(500).json({ 
          error: 'Failed to initialize data',
          message: storageError instanceof Error ? storageError.message : 'Unknown error',
          details: 'Storage initialization failed. Check server logs for details.'
        });
      }
      return;
    }
    
    // Paso 3: Manejar la request con Express
    app(req, res, (err: any) => {
      clearTimeout(timeout);
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
    clearTimeout(timeout);
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
