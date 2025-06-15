const { describe, it, expect, beforeEach } = require('@jest/globals');
const { DatabaseStorage } = require('../server/storage');

// Mock database for testing
const mockDb = {
  select: jest.fn(),
  insert: jest.fn(),
  update: jest.fn(),
  delete: jest.fn()
};

jest.mock('../server/db', () => ({
  db: mockDb
}));

describe('DatabaseStorage', () => {
  let storage;

  beforeEach(() => {
    storage = new DatabaseStorage();
    jest.clearAllMocks();
  });

  describe('Categories', () => {
    it('should get all categories', async () => {
      const mockCategories = [
        { id: 1, name: 'CI/CD', description: 'Continuous Integration and Deployment' },
        { id: 2, name: 'Monitoring', description: 'Application and Infrastructure Monitoring' }
      ];

      mockDb.select.mockReturnValue({
        from: jest.fn().mockResolvedValue(mockCategories)
      });

      const result = await storage.getCategories();
      expect(result).toEqual(mockCategories);
    });

    it('should get category by ID', async () => {
      const mockCategory = { id: 1, name: 'CI/CD', description: 'Continuous Integration and Deployment' };

      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([mockCategory])
        })
      });

      const result = await storage.getCategoryById(1);
      expect(result).toEqual(mockCategory);
    });

    it('should create a new category', async () => {
      const newCategory = { name: 'Testing', description: 'Software Testing Tools' };
      const createdCategory = { id: 3, ...newCategory };

      mockDb.insert.mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([createdCategory])
        })
      });

      const result = await storage.createCategory(newCategory);
      expect(result).toEqual(createdCategory);
    });
  });

  describe('Resources', () => {
    it('should get all resources with categories', async () => {
      const mockResources = [
        {
          id: 1,
          title: 'Jenkins',
          description: 'Open source automation server',
          url: 'https://jenkins.io',
          categoryId: 1,
          featured: true,
          category: { id: 1, name: 'CI/CD', description: 'Continuous Integration and Deployment' }
        }
      ];

      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          leftJoin: jest.fn().mockReturnValue({
            where: jest.fn().mockResolvedValue(mockResources)
          })
        })
      });

      const result = await storage.getResources();
      expect(result).toEqual(mockResources);
    });

    it('should filter resources by category', async () => {
      const mockResources = [
        {
          id: 1,
          title: 'Jenkins',
          description: 'Open source automation server',
          url: 'https://jenkins.io',
          categoryId: 1,
          featured: true,
          category: { id: 1, name: 'CI/CD', description: 'Continuous Integration and Deployment' }
        }
      ];

      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          leftJoin: jest.fn().mockReturnValue({
            where: jest.fn().mockResolvedValue(mockResources)
          })
        })
      });

      const result = await storage.getResources(1);
      expect(result).toEqual(mockResources);
    });

    it('should get featured resources', async () => {
      const mockFeaturedResources = [
        {
          id: 1,
          title: 'Jenkins',
          description: 'Open source automation server',
          url: 'https://jenkins.io',
          categoryId: 1,
          featured: true,
          category: { id: 1, name: 'CI/CD', description: 'Continuous Integration and Deployment' }
        }
      ];

      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          leftJoin: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue(mockFeaturedResources)
            })
          })
        })
      });

      const result = await storage.getFeaturedResources(6);
      expect(result).toEqual(mockFeaturedResources);
    });

    it('should create a new resource', async () => {
      const newResource = {
        title: 'Docker',
        description: 'Container platform',
        url: 'https://docker.com',
        categoryId: 1,
        featured: false
      };
      const createdResource = { id: 2, ...newResource };

      mockDb.insert.mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([createdResource])
        })
      });

      const result = await storage.createResource(newResource);
      expect(result).toEqual(createdResource);
    });
  });

  describe('Contacts', () => {
    it('should create a contact message', async () => {
      const contactData = {
        name: 'John Doe',
        email: 'john@example.com',
        subject: 'Test Subject',
        message: 'Test message'
      };
      const createdContact = { 
        id: 1, 
        ...contactData, 
        createdAt: new Date('2024-01-01T00:00:00Z') 
      };

      mockDb.insert.mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([createdContact])
        })
      });

      const result = await storage.createContact(contactData);
      expect(result).toEqual(createdContact);
    });

    it('should get all contacts', async () => {
      const mockContacts = [
        {
          id: 1,
          name: 'John Doe',
          email: 'john@example.com',
          subject: 'Test Subject',
          message: 'Test message',
          createdAt: new Date('2024-01-01T00:00:00Z')
        }
      ];

      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          orderBy: jest.fn().mockResolvedValue(mockContacts)
        })
      });

      const result = await storage.getContacts();
      expect(result).toEqual(mockContacts);
    });
  });
});