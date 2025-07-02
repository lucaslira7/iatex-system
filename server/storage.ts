import {
  users,
  fabrics,
  models,
  orders,
  clients,
  suppliers,
  garmentTypes,
  modelWeights,
  modelCosts,
  costCategories,
  activityLog,
  quotations,
  quotationSizes,
  quotationCosts,
  type User,
  type UpsertUser,
  type Fabric,
  type InsertFabric,
  type Model,
  type InsertModel,
  type Order,
  type InsertOrder,
  type Client,
  type InsertClient,
  type Supplier,
  type InsertSupplier,
  type GarmentType,
  type ModelWeight,
  type ModelCost,
  type CostCategory,
  type Quotation,
  type InsertQuotation,
  type QuotationSize,
  type InsertQuotationSize,
  type QuotationCost,
  type InsertQuotationCost,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql, and, count, sum } from "drizzle-orm";

export interface IStorage {
  // User operations - required for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Fabric operations
  getFabrics(): Promise<Fabric[]>;
  getFabric(id: number): Promise<Fabric | undefined>;
  createFabric(fabric: InsertFabric): Promise<Fabric>;
  updateFabric(id: number, fabric: Partial<InsertFabric>): Promise<Fabric>;
  deleteFabric(id: number): Promise<void>;
  
  // Model operations
  getModels(): Promise<Model[]>;
  getModel(id: number): Promise<Model | undefined>;
  createModel(model: InsertModel): Promise<Model>;
  updateModel(id: number, model: Partial<InsertModel>): Promise<Model>;
  deleteModel(id: number): Promise<void>;
  
  // Order operations
  getOrders(): Promise<Order[]>;
  getOrder(id: number): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrder(id: number, order: Partial<InsertOrder>): Promise<Order>;
  deleteOrder(id: number): Promise<void>;
  
  // Client operations
  getClients(): Promise<Client[]>;
  getClient(id: number): Promise<Client | undefined>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(id: number, client: Partial<InsertClient>): Promise<Client>;
  deleteClient(id: number): Promise<void>;
  
  // Supplier operations
  getSuppliers(): Promise<Supplier[]>;
  createSupplier(supplier: InsertSupplier): Promise<Supplier>;
  
  // Reference data
  getGarmentTypes(): Promise<GarmentType[]>;
  getCostCategories(): Promise<CostCategory[]>;
  
  // Dashboard metrics
  getDashboardMetrics(): Promise<{
    totalFabrics: number;
    lowStockFabrics: number;
    activeOrders: number;
    totalStockValue: number;
    recentActivities: any[];
  }>;
  
  // Activity logging
  logActivity(userId: string, module: string, action: string, description: string): Promise<void>;
  
  // Quotation operations
  getQuotations(): Promise<Quotation[]>;
  getQuotation(id: number): Promise<Quotation | undefined>;
  createQuotation(quotation: InsertQuotation, sizes: InsertQuotationSize[], costs: InsertQuotationCost[]): Promise<Quotation>;
  updateQuotation(id: number, quotation: Partial<InsertQuotation>): Promise<Quotation>;
  deleteQuotation(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations - required for Replit Auth
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Fabric operations
  async getFabrics(): Promise<Fabric[]> {
    return await db
      .select()
      .from(fabrics)
      .orderBy(desc(fabrics.createdAt));
  }

  async getFabric(id: number): Promise<Fabric | undefined> {
    const [fabric] = await db.select().from(fabrics).where(eq(fabrics.id, id));
    return fabric;
  }

  async createFabric(fabric: InsertFabric): Promise<Fabric> {
    const [newFabric] = await db
      .insert(fabrics)
      .values(fabric)
      .returning();
    return newFabric;
  }

  async updateFabric(id: number, fabric: Partial<InsertFabric>): Promise<Fabric> {
    const [updatedFabric] = await db
      .update(fabrics)
      .set({ ...fabric, updatedAt: new Date() })
      .where(eq(fabrics.id, id))
      .returning();
    return updatedFabric;
  }

  async deleteFabric(id: number): Promise<void> {
    await db.delete(fabrics).where(eq(fabrics.id, id));
  }

  // Model operations
  async getModels(): Promise<Model[]> {
    return await db
      .select()
      .from(models)
      .orderBy(desc(models.createdAt));
  }

  async getModel(id: number): Promise<Model | undefined> {
    const [model] = await db.select().from(models).where(eq(models.id, id));
    return model;
  }

  async createModel(model: InsertModel): Promise<Model> {
    const [newModel] = await db
      .insert(models)
      .values(model)
      .returning();
    return newModel;
  }

  async updateModel(id: number, model: Partial<InsertModel>): Promise<Model> {
    const [updatedModel] = await db
      .update(models)
      .set({ ...model, updatedAt: new Date() })
      .where(eq(models.id, id))
      .returning();
    return updatedModel;
  }

  async deleteModel(id: number): Promise<void> {
    await db.delete(models).where(eq(models.id, id));
  }

  // Order operations
  async getOrders(): Promise<Order[]> {
    return await db
      .select()
      .from(orders)
      .orderBy(desc(orders.createdAt));
  }

  async getOrder(id: number): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order;
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const [newOrder] = await db
      .insert(orders)
      .values(order)
      .returning();
    return newOrder;
  }

  async updateOrder(id: number, order: Partial<InsertOrder>): Promise<Order> {
    const [updatedOrder] = await db
      .update(orders)
      .set({ ...order, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();
    return updatedOrder;
  }

  async deleteOrder(id: number): Promise<void> {
    await db.delete(orders).where(eq(orders.id, id));
  }

  // Client operations
  async getClients(): Promise<Client[]> {
    return await db
      .select()
      .from(clients)
      .orderBy(desc(clients.createdAt));
  }

  async getClient(id: number): Promise<Client | undefined> {
    const [client] = await db.select().from(clients).where(eq(clients.id, id));
    return client;
  }

  async createClient(client: InsertClient): Promise<Client> {
    const [newClient] = await db
      .insert(clients)
      .values(client)
      .returning();
    return newClient;
  }

  async updateClient(id: number, client: Partial<InsertClient>): Promise<Client> {
    const [updatedClient] = await db
      .update(clients)
      .set(client)
      .where(eq(clients.id, id))
      .returning();
    return updatedClient;
  }

  async deleteClient(id: number): Promise<void> {
    await db.delete(clients).where(eq(clients.id, id));
  }

  // Supplier operations
  async getSuppliers(): Promise<Supplier[]> {
    return await db
      .select()
      .from(suppliers)
      .orderBy(desc(suppliers.createdAt));
  }

  async createSupplier(supplier: InsertSupplier): Promise<Supplier> {
    const [newSupplier] = await db
      .insert(suppliers)
      .values(supplier)
      .returning();
    return newSupplier;
  }

  // Reference data
  async getGarmentTypes(): Promise<GarmentType[]> {
    return await db.select().from(garmentTypes);
  }

  async getCostCategories(): Promise<CostCategory[]> {
    return await db.select().from(costCategories);
  }

  // Dashboard metrics
  async getDashboardMetrics() {
    const [fabricCount] = await db.select({ count: count() }).from(fabrics);
    const [lowStockCount] = await db
      .select({ count: count() })
      .from(fabrics)
      .where(sql`${fabrics.currentStock} < 20`);
    
    const [activeOrderCount] = await db
      .select({ count: count() })
      .from(orders)
      .where(eq(orders.status, "approved"));

    const [stockValue] = await db
      .select({ 
        total: sql<number>`COALESCE(SUM(${fabrics.currentStock} * ${fabrics.pricePerMeter}), 0)` 
      })
      .from(fabrics);

    const recentActivities = await db
      .select()
      .from(activityLog)
      .orderBy(desc(activityLog.createdAt))
      .limit(10);

    return {
      totalFabrics: fabricCount.count,
      lowStockFabrics: lowStockCount.count,
      activeOrders: activeOrderCount.count,
      totalStockValue: stockValue.total || 0,
      recentActivities,
    };
  }

  // Activity logging
  async logActivity(userId: string, module: string, action: string, description: string): Promise<void> {
    await db.insert(activityLog).values({
      userId,
      module,
      action,
      description,
    });
  }

  // Quotation operations
  async getQuotations(): Promise<Quotation[]> {
    return await db.select().from(quotations).orderBy(desc(quotations.createdAt));
  }

  async getQuotation(id: number): Promise<Quotation | undefined> {
    const result = await db.select().from(quotations).where(eq(quotations.id, id));
    return result[0];
  }

  async createQuotation(quotation: InsertQuotation, sizes: InsertQuotationSize[], costs: InsertQuotationCost[]): Promise<Quotation> {
    return await db.transaction(async (tx) => {
      // Insert main quotation
      const [newQuotation] = await tx.insert(quotations).values({
        ...quotation,
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      }).returning();

      // Insert sizes
      if (sizes.length > 0) {
        await tx.insert(quotationSizes).values(
          sizes.map(size => ({
            ...size,
            quotationId: newQuotation.id,
          }))
        );
      }

      // Insert costs
      if (costs.length > 0) {
        await tx.insert(quotationCosts).values(
          costs.map(cost => ({
            ...cost,
            quotationId: newQuotation.id,
          }))
        );
      }

      return newQuotation;
    });
  }

  async updateQuotation(id: number, quotation: Partial<InsertQuotation>): Promise<Quotation> {
    const [updated] = await db
      .update(quotations)
      .set({ ...quotation, updatedAt: new Date() })
      .where(eq(quotations.id, id))
      .returning();
    return updated;
  }

  async deleteQuotation(id: number): Promise<void> {
    await db.delete(quotations).where(eq(quotations.id, id));
  }
}

export const storage = new DatabaseStorage();
