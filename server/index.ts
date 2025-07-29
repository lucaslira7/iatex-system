import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import compression from "compression";

const app = express();

// Aplicar compressão gzip para todas as respostas
app.use(compression({
  level: 6, // Nível médio de compressão (balance entre velocidade e tamanho)
  threshold: 1024, // Comprimir apenas respostas > 1KB
  filter: (req: Request, res: Response) => {
    // Não comprimir imagens que já estão comprimidas
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  }
}));

app.use(express.json({ limit: '10mb' })); // Reduzido de 50mb para 10mb
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// Servir arquivos PWA
app.use(express.static('public'));

// Headers PWA e Cache
app.use((req, res, next) => {
  // Service Worker precisa ser servido com Content-Type correto
  if (req.path === '/sw.js') {
    res.setHeader('Content-Type', 'application/javascript');
    res.setHeader('Service-Worker-Allowed', '/');
    res.setHeader('Cache-Control', 'no-cache'); // SW sempre fresh
  }

  // Manifest.json
  if (req.path === '/manifest.json') {
    res.setHeader('Content-Type', 'application/manifest+json');
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache por 1 dia
  }

  // Cache para recursos estáticos
  if (req.path.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg)$/)) {
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache por 1 ano
  }

  // Cache para APIs específicas (dados menos dinâmicos)
  if (req.path.match(/\/api\/(garment-types|cost-categories|suppliers)/)) {
    res.setHeader('Cache-Control', 'public, max-age=300'); // Cache por 5 minutos
  }

  next();
});

app.use((req, res, next) => {
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

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Para desenvolvimento local, usar porta 3000
  const port = process.env.PORT || 3000;
  server.listen({
    port,
    host: "localhost",
  }, () => {
    log(`🚀 Servidor rodando em http://localhost:${port}`);
    log(`📱 PWA disponível em http://localhost:${port}`);
  });
})();
