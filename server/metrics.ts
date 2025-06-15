import { Request, Response, NextFunction } from 'express';
import { register, Counter, Histogram, Gauge, collectDefaultMetrics } from 'prom-client';

// Enable collection of default metrics (CPU, memory, etc.)
collectDefaultMetrics({
  gcDurationBuckets: [0.001, 0.01, 0.1, 1, 2, 5], // seconds
  eventLoopMonitoringPrecision: 10, // milliseconds
});

// Custom metrics for DevOps Hilltop application
export const httpRequestsTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'status', 'route'],
});

export const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'status', 'route'],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
});

export const activeHttpConnections = new Gauge({
  name: 'http_active_connections',
  help: 'Number of active HTTP connections',
});

export const contactFormSubmissions = new Counter({
  name: 'contact_form_submissions_total',
  help: 'Total number of contact form submissions',
  labelNames: ['subject', 'status'],
});

export const databaseConnectionsActive = new Gauge({
  name: 'database_connections_active',
  help: 'Number of active database connections',
});

export const databaseConnectionsIdle = new Gauge({
  name: 'database_connections_idle',
  help: 'Number of idle database connections',
});

export const databaseQueryDuration = new Histogram({
  name: 'database_query_duration_seconds',
  help: 'Duration of database queries in seconds',
  labelNames: ['operation', 'table'],
  buckets: [0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
});

export const databaseConnectionsFailed = new Counter({
  name: 'database_connections_failed_total',
  help: 'Total number of failed database connections',
});

export const applicationInfo = new Gauge({
  name: 'application_info',
  help: 'Application information',
  labelNames: ['version', 'environment', 'node_version'],
});

// Set application info
applicationInfo.set(
  {
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    node_version: process.version,
  },
  1
);

// Middleware to track HTTP metrics
export function metricsMiddleware(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  
  // Increment active connections
  activeHttpConnections.inc();
  
  // Track when response finishes
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route?.path || req.path || 'unknown';
    const labels = {
      method: req.method,
      status: res.statusCode.toString(),
      route: route,
    };
    
    // Record metrics
    httpRequestsTotal.inc(labels);
    httpRequestDuration.observe(labels, duration);
    
    // Decrement active connections
    activeHttpConnections.dec();
  });
  
  next();
}

// Database metrics helpers
export function recordDatabaseConnection(type: 'active' | 'idle', count: number) {
  if (type === 'active') {
    databaseConnectionsActive.set(count);
  } else {
    databaseConnectionsIdle.set(count);
  }
}

export function recordDatabaseQuery(operation: string, table: string, duration: number) {
  databaseQueryDuration.observe({ operation, table }, duration);
}

export function recordDatabaseError() {
  databaseConnectionsFailed.inc();
}

export function recordContactFormSubmission(subject: string, status: 'success' | 'error') {
  contactFormSubmissions.inc({ subject, status });
}

// Export the registry for the metrics endpoint
export { register };