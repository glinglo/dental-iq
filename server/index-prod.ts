import fs from "node:fs";
import path from "node:path";
import { type Server } from "node:http";

import express, { type Express } from "express";
import runApp from "./app";

export async function serveStatic(app: Express, _server: Server) {
  // En producción, los archivos estáticos están en dist/public
  // En Vercel, pueden estar en diferentes ubicaciones según la configuración
  const possiblePaths = [
    path.resolve(import.meta.dirname, "..", "dist", "public"),
    path.resolve(import.meta.dirname, "public"),
    path.resolve(process.cwd(), "dist", "public"),
    path.resolve(process.cwd(), "public"),
  ];

  let distPath: string | null = null;
  for (const possiblePath of possiblePaths) {
    if (fs.existsSync(possiblePath)) {
      distPath = possiblePath;
      break;
    }
  }

  if (!distPath) {
    console.error("No se encontró el directorio de build. Paths probados:", possiblePaths);
    throw new Error(
      `Could not find the build directory. Make sure to build the client first.`,
    );
  }

  console.log(`Serving static files from: ${distPath}`);
  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath!, "index.html"));
  });
}

(async () => {
  await runApp(serveStatic);
})();
