const request = require('supertest');
const { describe, it, expect, beforeAll, afterAll } = require('@jest/globals');

// Mock Express app for testing
let app;
let server;

beforeAll(async () => {
  // Import the app after setting test environment
  process.env.NODE_ENV = 'test';
  process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';
  
  const { createApp } = require('../server/index');
  app = await createApp();
  server = app.listen(0); // Use random available port
});

afterAll(async () => {
  if (server) {
    server.close();
  }
});

describe('Health Endpoint', () => {
  it('should return healthy status', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);
    
    expect(response.body).toMatchObject({
      status: 'healthy',
      service: 'DevOps with Hilltop'
    });
    expect(response.body.timestamp).toBeDefined();
  });
});

describe('Categories API', () => {
  it('should get all categories', async () => {
    const response = await request(app)
      .get('/api/categories')
      .expect(200);
    
    expect(Array.isArray(response.body)).toBe(true);
    if (response.body.length > 0) {
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('name');
      expect(response.body[0]).toHaveProperty('description');
    }
  });

  it('should create a new category', async () => {
    const newCategory = {
      name: 'Test Category',
      description: 'Test Description'
    };

    const response = await request(app)
      .post('/api/categories')
      .send(newCategory)
      .expect(201);
    
    expect(response.body).toMatchObject(newCategory);
    expect(response.body.id).toBeDefined();
  });

  it('should validate category input', async () => {
    const invalidCategory = {
      name: '', // Invalid empty name
      description: 'Test Description'
    };

    await request(app)
      .post('/api/categories')
      .send(invalidCategory)
      .expect(400);
  });
});

describe('Resources API', () => {
  it('should get all resources', async () => {
    const response = await request(app)
      .get('/api/resources')
      .expect(200);
    
    expect(Array.isArray(response.body)).toBe(true);
    if (response.body.length > 0) {
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('title');
      expect(response.body[0]).toHaveProperty('description');
      expect(response.body[0]).toHaveProperty('url');
      expect(response.body[0]).toHaveProperty('category');
    }
  });

  it('should get featured resources', async () => {
    const response = await request(app)
      .get('/api/resources/featured')
      .expect(200);
    
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeLessThanOrEqual(6); // Default limit
  });

  it('should filter resources by category', async () => {
    const response = await request(app)
      .get('/api/resources?categoryId=1')
      .expect(200);
    
    expect(Array.isArray(response.body)).toBe(true);
    if (response.body.length > 0) {
      expect(response.body[0].category.id).toBe(1);
    }
  });

  it('should search resources', async () => {
    const response = await request(app)
      .get('/api/resources?search=jenkins')
      .expect(200);
    
    expect(Array.isArray(response.body)).toBe(true);
  });

  it('should create a new resource', async () => {
    const newResource = {
      title: 'Test Resource',
      description: 'Test Description',
      url: 'https://example.com',
      categoryId: 1,
      featured: false
    };

    const response = await request(app)
      .post('/api/resources')
      .send(newResource)
      .expect(201);
    
    expect(response.body).toMatchObject({
      title: newResource.title,
      description: newResource.description,
      url: newResource.url,
      categoryId: newResource.categoryId,
      featured: newResource.featured
    });
    expect(response.body.id).toBeDefined();
  });

  it('should validate resource input', async () => {
    const invalidResource = {
      title: '', // Invalid empty title
      description: 'Test Description',
      url: 'invalid-url', // Invalid URL format
      categoryId: 999, // Non-existent category
      featured: false
    };

    await request(app)
      .post('/api/resources')
      .send(invalidResource)
      .expect(400);
  });
});

describe('Contact API', () => {
  it('should create a contact message', async () => {
    const contactData = {
      name: 'John Doe',
      email: 'john@example.com',
      subject: 'Test Subject',
      message: 'Test message content'
    };

    const response = await request(app)
      .post('/api/contact')
      .send(contactData)
      .expect(201);
    
    expect(response.body).toMatchObject(contactData);
    expect(response.body.id).toBeDefined();
    expect(response.body.createdAt).toBeDefined();
  });

  it('should validate contact input', async () => {
    const invalidContact = {
      name: '',
      email: 'invalid-email',
      subject: '',
      message: ''
    };

    await request(app)
      .post('/api/contact')
      .send(invalidContact)
      .expect(400);
  });

  it('should get all contacts', async () => {
    const response = await request(app)
      .get('/api/contacts')
      .expect(200);
    
    expect(Array.isArray(response.body)).toBe(true);
    if (response.body.length > 0) {
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('name');
      expect(response.body[0]).toHaveProperty('email');
      expect(response.body[0]).toHaveProperty('subject');
      expect(response.body[0]).toHaveProperty('message');
      expect(response.body[0]).toHaveProperty('createdAt');
    }
  });
});

describe('Error Handling', () => {
  it('should handle 404 for non-existent endpoints', async () => {
    await request(app)
      .get('/api/nonexistent')
      .expect(404);
  });

  it('should handle 404 for non-existent resource by ID', async () => {
    await request(app)
      .get('/api/resources/999999')
      .expect(404);
  });

  it('should handle 404 for non-existent category by ID', async () => {
    await request(app)
      .get('/api/categories/999999')
      .expect(404);
  });
});