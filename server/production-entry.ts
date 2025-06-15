import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import { registerRoutes } from "./routes.js";
import { metricsMiddleware } from "./metrics.js";
import { initializeDatabase } from "./db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function log(message: string, source = "express") {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`${timestamp} [${source}] ${message}`);
}

async function createApp() {
  const app = express();
  
  // Middleware
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(metricsMiddleware);

  // Serve static files from dist directory
  const staticPath = path.join(__dirname, "..", "dist");
  app.use(express.static(staticPath));

  // API routes
  const httpServer = createServer(app);
  await registerRoutes(app);

  // Catch-all handler for SPA routing
  app.get("*", (req, res) => {
    if (req.path.startsWith("/api/")) {
      return res.status(404).json({ error: "API endpoint not found" });
    }
    res.sendFile(path.join(staticPath, "index.html"));
  });

  // Error handler
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    log(`Error: ${err.message}`, "error");
    res.status(500).json({ error: "Internal server error" });
  });

  return { app, httpServer };
}

// Start server
if (import.meta.url === `file://${process.argv[1]}`) {
  const port = parseInt(process.env.PORT || "5000");
  
  (async () => {
    // Initialize database first
    await initializeDatabase();
    
    const { app, httpServer } = await createApp();
    
    httpServer.listen(port, "0.0.0.0", () => {
      log(`Server running on port ${port}`);
      log(`Health check: http://0.0.0.0:${port}/api/health`);
    });
  })().catch((error) => {
    console.error("Failed to start server:", error);
    process.exit(1);
  });
}

export { createApp };