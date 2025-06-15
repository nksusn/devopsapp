const { describe, it, expect } = require('@jest/globals');
const { z } = require('zod');
const { 
  insertCategorySchema, 
  insertResourceSchema, 
  insertContactSchema 
} = require('../shared/schema');

describe('Schema Validation', () => {
  describe('Category Schema', () => {
    it('should validate valid category data', () => {
      const validCategory = {
        name: 'CI/CD',
        description: 'Continuous Integration and Deployment tools'
      };

      const result = insertCategorySchema.safeParse(validCategory);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validCategory);
      }
    });

    it('should reject empty name', () => {
      const invalidCategory = {
        name: '',
        description: 'Valid description'
      };

      const result = insertCategorySchema.safeParse(invalidCategory);
      expect(result.success).toBe(false);
    });

    it('should reject missing required fields', () => {
      const invalidCategory = {
        name: 'Valid Name'
        // Missing description
      };

      const result = insertCategorySchema.safeParse(invalidCategory);
      expect(result.success).toBe(false);
    });
  });

  describe('Resource Schema', () => {
    it('should validate valid resource data', () => {
      const validResource = {
        title: 'Jenkins Pipeline Tutorial',
        description: 'Learn how to create CI/CD pipelines with Jenkins',
        url: 'https://jenkins.io/doc/book/pipeline/',
        categoryId: 1,
        featured: true
      };

      const result = insertResourceSchema.safeParse(validResource);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validResource);
      }
    });

    it('should reject invalid URL format', () => {
      const invalidResource = {
        title: 'Valid Title',
        description: 'Valid description',
        url: 'not-a-valid-url',
        categoryId: 1,
        featured: false
      };

      const result = insertResourceSchema.safeParse(invalidResource);
      expect(result.success).toBe(false);
    });

    it('should reject missing required fields', () => {
      const invalidResource = {
        title: 'Valid Title',
        // Missing description, url, categoryId
        featured: false
      };

      const result = insertResourceSchema.safeParse(invalidResource);
      expect(result.success).toBe(false);
    });

    it('should reject invalid categoryId type', () => {
      const invalidResource = {
        title: 'Valid Title',
        description: 'Valid description',
        url: 'https://example.com',
        categoryId: 'not-a-number',
        featured: false
      };

      const result = insertResourceSchema.safeParse(invalidResource);
      expect(result.success).toBe(false);
    });
  });

  describe('Contact Schema', () => {
    it('should validate valid contact data', () => {
      const validContact = {
        name: 'John Doe',
        email: 'john.doe@example.com',
        subject: 'Question about DevOps tools',
        message: 'I would like to know more about container orchestration tools.'
      };

      const result = insertContactSchema.safeParse(validContact);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validContact);
      }
    });

    it('should reject invalid email format', () => {
      const invalidContact = {
        name: 'John Doe',
        email: 'invalid-email-format',
        subject: 'Valid subject',
        message: 'Valid message'
      };

      const result = insertContactSchema.safeParse(invalidContact);
      expect(result.success).toBe(false);
    });

    it('should reject empty required fields', () => {
      const invalidContact = {
        name: '',
        email: 'john@example.com',
        subject: '',
        message: ''
      };

      const result = insertContactSchema.safeParse(invalidContact);
      expect(result.success).toBe(false);
    });

    it('should reject missing required fields', () => {
      const invalidContact = {
        name: 'John Doe'
        // Missing email, subject, message
      };

      const result = insertContactSchema.safeParse(invalidContact);
      expect(result.success).toBe(false);
    });
  });
});