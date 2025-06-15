import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { sql } from 'drizzle-orm';
import * as schema from "@shared/schema";

// Use PostgreSQL connection from environment
const connectionString = process.env.DATABASE_URL;

export const pool = new Pool({ 
  connectionString,
  ssl: connectionString?.includes('sslmode=require') ? { rejectUnauthorized: false } : false,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

export const db = drizzle(pool, { schema });

// Initialize database and create tables
export async function initializeDatabase() {
  try {
    console.log('Connecting to database...');
    const client = await pool.connect();
    console.log('Database connection established');
    
    // Create tables directly using SQL
    console.log('Creating database tables...');
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        description TEXT NOT NULL,
        icon TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS resources (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        url TEXT,
        category_id INTEGER REFERENCES categories(id) NOT NULL,
        tags TEXT[] DEFAULT '{}',
        image_url TEXT,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS contacts (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        contact TEXT,
        address TEXT,
        subject TEXT NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);

    // Insert default data if tables are empty
    const categoriesCount = await client.query('SELECT COUNT(*) FROM categories');
    if (parseInt(categoriesCount.rows[0].count) === 0) {
      console.log('Inserting default categories...');
      await client.query(`
        INSERT INTO categories (name, description, icon) VALUES 
        ('CI/CD', 'Continuous Integration and Continuous Deployment tools and practices', 'GitBranch'),
        ('Kubernetes', 'Container orchestration and management', 'Container'),
        ('Monitoring', 'Application and infrastructure monitoring solutions', 'Activity'),
        ('Security', 'DevOps security tools and best practices', 'Shield'),
        ('Infrastructure', 'Infrastructure as Code and cloud management', 'Server'),
        ('Automation', 'Automation tools and scripting solutions', 'Zap')
      `);

      console.log('Inserting default resources...');
      await client.query(`
        INSERT INTO resources (title, description, url, category_id, tags) VALUES 
        ('Jenkins Pipeline Tutorial', 'Comprehensive guide to building CI/CD pipelines with Jenkins', 'https://jenkins.io/doc/book/pipeline/', 1, ARRAY['jenkins', 'pipeline', 'ci/cd']),
        ('GitHub Actions Workflows', 'Learn to automate your workflow with GitHub Actions', 'https://docs.github.com/en/actions', 1, ARRAY['github', 'actions', 'automation']),
        ('Kubernetes Basics', 'Introduction to Kubernetes concepts and deployment', 'https://kubernetes.io/docs/tutorials/', 2, ARRAY['kubernetes', 'containers', 'orchestration']),
        ('Helm Charts Guide', 'Package manager for Kubernetes applications', 'https://helm.sh/docs/', 2, ARRAY['helm', 'kubernetes', 'packages']),
        ('Prometheus Monitoring', 'Open-source monitoring and alerting toolkit', 'https://prometheus.io/docs/', 3, ARRAY['prometheus', 'monitoring', 'metrics']),
        ('Grafana Dashboards', 'Create beautiful monitoring dashboards', 'https://grafana.com/docs/', 3, ARRAY['grafana', 'dashboards', 'visualization'])
      `);
    }

    client.release();
    console.log('Database initialization completed');
    
    return true;
  } catch (error) {
    console.error('Database initialization failed:', error);
    // Continue without database for development
    return false;
  }
}