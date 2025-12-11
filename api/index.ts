// Vercel serverless function wrapper
// Importar express directamente aquí para evitar problemas de paths
import express, {
  type Express,
  type Request,
  Response,
  NextFunction,
} from "express";

let routesRegistered = false;
let appInstance: Express | null = null;

// Crear instancia de Express
function getApp(): Express {
  if (!appInstance) {
    appInstance = express();
    
    // Configurar middleware
    appInstance.use(express.json({
      verify: (req, _res, buf) => {
        (req as any).rawBody = buf;
      }
    }));
    appInstance.use(express.urlencoded({ extended: false }));
    
    // Middleware de logging
    appInstance.use((req, res, next) => {
      const start = Date.now();
      const path = req.path;
      let capturedJsonResponse: Record<string, any> | undefined = undefined;

      const originalResJson = res.json;
      res.json = function (bodyJson, ...args) {
        capturedJsonResponse = bodyJson;
        return originalResJson.apply(res, [bodyJson, ...args]);
      };

      res.on("finish", () => {
        const duration = Date.now() - start;
        if (path.startsWith("/api")) {
          let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
          if (capturedJsonResponse) {
            logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
          }
          if (logLine.length > 80) {
            logLine = logLine.slice(0, 79) + "…";
          }
          console.log(logLine);
        }
      });

      next();
    });
  }
  return appInstance;
}

// Función para obtener storage de forma lazy
async function getStorage() {
  try {
    // Intentar importar desde la ruta relativa
    const { storage } = await import('../server/storage');
    return storage;
  } catch (error) {
    // Si falla, intentar desde la ruta absoluta
    console.error('[Vercel] Error importing storage from relative path, trying absolute:', error);
    try {
      const storageModule = await import('/var/task/server/storage');
      return storageModule.storage;
    } catch (absError) {
      console.error('[Vercel] Error importing storage from absolute path:', absError);
      // Último intento: usar process.cwd()
      const path = await import('path');
      const storagePath = path.join(process.cwd(), 'server', 'storage');
      const storageModule = await import(storagePath);
      return storageModule.storage;
    }
  }
}

// Función para inicializar datos de forma robusta
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
    throw error;
  }
}

// Función para registrar rutas (solo una vez)
async function registerRoutesOnce() {
  if (routesRegistered) return;
  
  try {
    console.log('[Vercel] Registering routes...');
    const app = getApp();
    
    // Importar routes dinámicamente
    let registerRoutes;
    try {
      const routesModule = await import('../server/routes');
      registerRoutes = routesModule.registerRoutes;
    } catch (error) {
      console.error('[Vercel] Error importing routes from relative path:', error);
      // Intentar desde ruta absoluta
      try {
        const routesModule = await import('/var/task/server/routes');
        registerRoutes = routesModule.registerRoutes;
      } catch (absError) {
        console.error('[Vercel] Error importing routes from absolute path:', absError);
        const path = await import('path');
        const routesPath = path.join(process.cwd(), 'server', 'routes');
        const routesModule = await import(routesPath);
        registerRoutes = routesModule.registerRoutes;
      }
    }
    
    // Crear un servidor HTTP mock para registerRoutes (no se usará en serverless)
    const { createServer } = await import('http');
    const mockServer = createServer(app);
    
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
  const timeout = setTimeout(() => {
    if (!res.headersSent) {
      console.error('[Vercel] Request timeout');
      res.status(504).json({ error: 'Request timeout' });
    }
  }, 30000);
  
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
    const app = getApp();
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
