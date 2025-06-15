import { categories, resources, contacts, type Category, type Resource, type Contact, type InsertCategory, type InsertResource, type InsertContact, type ResourceWithCategory } from "@shared/schema";
import { db } from "./db";
import { eq, desc, ilike, and } from "drizzle-orm";

export interface IStorage {
  // Categories
  getCategories(): Promise<Category[]>;
  getCategoryById(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category | undefined>;
  deleteCategory(id: number): Promise<boolean>;

  // Resources
  getResources(categoryId?: number, search?: string): Promise<ResourceWithCategory[]>;
  getResourceById(id: number): Promise<ResourceWithCategory | undefined>;
  createResource(resource: InsertResource): Promise<Resource>;
  updateResource(id: number, resource: Partial<InsertResource>): Promise<Resource | undefined>;
  deleteResource(id: number): Promise<boolean>;
  getFeaturedResources(limit?: number): Promise<ResourceWithCategory[]>;

  // Contacts
  createContact(contact: InsertContact): Promise<Contact>;
  getContacts(): Promise<Contact[]>;
}

export class DatabaseStorage implements IStorage {
  // Categories
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories).orderBy(categories.name);
  }

  async getCategoryById(id: number): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category || undefined;
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = await db
      .insert(categories)
      .values(category)
      .returning();
    return newCategory;
  }

  async updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category | undefined> {
    const [updatedCategory] = await db
      .update(categories)
      .set(category)
      .where(eq(categories.id, id))
      .returning();
    return updatedCategory || undefined;
  }

  async deleteCategory(id: number): Promise<boolean> {
    const result = await db.delete(categories).where(eq(categories.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Resources
  async getResources(categoryId?: number, search?: string): Promise<ResourceWithCategory[]> {
    let query = db
      .select({
        id: resources.id,
        title: resources.title,
        description: resources.description,
        url: resources.url,
        categoryId: resources.categoryId,
        tags: resources.tags,
        imageUrl: resources.imageUrl,
        createdAt: resources.createdAt,
        updatedAt: resources.updatedAt,
        category: {
          id: categories.id,
          name: categories.name,
          description: categories.description,
          icon: categories.icon,
          createdAt: categories.createdAt,
        }
      })
      .from(resources)
      .innerJoin(categories, eq(resources.categoryId, categories.id))
      .orderBy(desc(resources.createdAt));

    const conditions = [];
    
    if (categoryId) {
      conditions.push(eq(resources.categoryId, categoryId));
    }
    
    if (search) {
      conditions.push(
        ilike(resources.title, `%${search}%`)
      );
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as typeof query;
    }

    return await query;
  }

  async getResourceById(id: number): Promise<ResourceWithCategory | undefined> {
    const [resource] = await db
      .select({
        id: resources.id,
        title: resources.title,
        description: resources.description,
        url: resources.url,
        categoryId: resources.categoryId,
        tags: resources.tags,
        imageUrl: resources.imageUrl,
        createdAt: resources.createdAt,
        updatedAt: resources.updatedAt,
        category: {
          id: categories.id,
          name: categories.name,
          description: categories.description,
          icon: categories.icon,
          createdAt: categories.createdAt,
        }
      })
      .from(resources)
      .innerJoin(categories, eq(resources.categoryId, categories.id))
      .where(eq(resources.id, id));
    
    return resource || undefined;
  }

  async createResource(resource: InsertResource): Promise<Resource> {
    const [newResource] = await db
      .insert(resources)
      .values({
        ...resource,
        updatedAt: new Date(),
      })
      .returning();
    return newResource;
  }

  async updateResource(id: number, resource: Partial<InsertResource>): Promise<Resource | undefined> {
    const [updatedResource] = await db
      .update(resources)
      .set({
        ...resource,
        updatedAt: new Date(),
      })
      .where(eq(resources.id, id))
      .returning();
    return updatedResource || undefined;
  }

  async deleteResource(id: number): Promise<boolean> {
    const result = await db.delete(resources).where(eq(resources.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getFeaturedResources(limit: number = 6): Promise<ResourceWithCategory[]> {
    return await db
      .select({
        id: resources.id,
        title: resources.title,
        description: resources.description,
        url: resources.url,
        categoryId: resources.categoryId,
        tags: resources.tags,
        imageUrl: resources.imageUrl,
        createdAt: resources.createdAt,
        updatedAt: resources.updatedAt,
        category: {
          id: categories.id,
          name: categories.name,
          description: categories.description,
          icon: categories.icon,
          createdAt: categories.createdAt,
        }
      })
      .from(resources)
      .innerJoin(categories, eq(resources.categoryId, categories.id))
      .orderBy(desc(resources.createdAt))
      .limit(limit);
  }

  // Contacts
  async createContact(contact: InsertContact): Promise<Contact> {
    const [newContact] = await db
      .insert(contacts)
      .values(contact)
      .returning();
    return newContact;
  }

  async getContacts(): Promise<Contact[]> {
    return await db.select().from(contacts).orderBy(desc(contacts.createdAt));
  }
}

export const storage = new DatabaseStorage();
