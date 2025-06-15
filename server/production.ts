import express, { type Express } from "express";
import fs from "fs";
import path from "path";

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit", 
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

export function serveStatic(app: Express) {
  const distPath = path.resolve(process.cwd(), "dist", "public");

  if (!fs.existsSync(distPath)) {
    // Fallback to current directory structure
    const fallbackPath = path.resolve(process.cwd(), "dist");
    if (fs.existsSync(fallbackPath)) {
      app.use(express.static(fallbackPath));
      app.use("*", (_req, res) => {
        const indexPath = path.resolve(fallbackPath, "index.html");
        if (fs.existsSync(indexPath)) {
          res.sendFile(indexPath);
        } else {
          res.status(404).send("Build files not found");
        }
      });
      return;
    }
    
    log("Build directory not found, serving basic HTML response", "production");
    app.use("*", (_req, res) => {
      res.status(200).send(`
        <!DOCTYPE html>
        <html>
        <head><title>DevOps with Hilltop</title></head>
        <body>
          <h1>DevOps with Hilltop API Server</h1>
          <p>API is running on port 5000</p>
          <p>Frontend build not found - check build process</p>
        </body>
        </html>
      `);
    });
    return;
  }

  app.use(express.static(distPath));
  
  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}