import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  decimal,
  boolean,
  uuid,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";

// Session storage table - required for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table - required for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").default("user"), // admin, manager, user
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Suppliers table
export const suppliers = pgTable("suppliers", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  contact: varchar("contact", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Fabrics table
export const fabrics = pgTable("fabrics", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  type: varchar("type", { length: 100 }).notNull(), // Suplex, Dry Fit, Cotton, etc.
  composition: text("composition"),
  gramWeight: integer("gram_weight").notNull(), // gramatura em g/m²
  usableWidth: integer("usable_width").notNull(), // largura útil em cm
  pricePerKg: decimal("price_per_kg", { precision: 10, scale: 2 }).notNull(), // preço principal por kg
  pricePerMeter: decimal("price_per_meter", { precision: 10, scale: 2 }), // calculado automaticamente
  currentStock: decimal("current_stock", { precision: 10, scale: 2 }).notNull(), // em kg
  yieldEstimate: decimal("yield_estimate", { precision: 10, scale: 4 }), // rendimento calculado em m/kg
  supplierId: integer("supplier_id").references(() => suppliers.id),
  imageUrl: text("image_url"),
  status: varchar("status", { length: 50 }).default("available"), // available, low_stock
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Garment types table
export const garmentTypes = pgTable("garment_types", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  icon: varchar("icon", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Models table
export const models = pgTable("models", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  reference: varchar("reference", { length: 100 }).unique().notNull(),
  garmentTypeId: integer("garment_type_id").references(() => garmentTypes.id),
  fabricId: integer("fabric_id").references(() => fabrics.id),
  description: text("description"),
  imageUrl: varchar("image_url", { length: 500 }),
  isTemplate: boolean("is_template").default(false),
  isExternalProduction: boolean("is_external_production").default(false),
  status: varchar("status", { length: 50 }).default("draft"), // draft, finalized, template
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Model weights by size
export const modelWeights = pgTable("model_weights", {
  id: serial("id").primaryKey(),
  modelId: integer("model_id").references(() => models.id, { onDelete: "cascade" }),
  size: varchar("size", { length: 10 }).notNull(), // P, M, G, GG, XG
  weightGrams: integer("weight_grams").notNull(),
  fabricConsumption: decimal("fabric_consumption", { precision: 10, scale: 3 }), // metros de tecido
});

// Cost categories
export const costCategories = pgTable("cost_categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(), // creation, materials, labor, overhead
  unit: varchar("unit", { length: 20 }), // m, un, kg, %
});

// Model costs
export const modelCosts = pgTable("model_costs", {
  id: serial("id").primaryKey(),
  modelId: integer("model_id").references(() => models.id, { onDelete: "cascade" }),
  categoryId: integer("category_id").references(() => costCategories.id),
  description: varchar("description", { length: 255 }),
  unitCost: decimal("unit_cost", { precision: 10, scale: 2 }).notNull(),
  quantity: decimal("quantity", { precision: 10, scale: 3 }).notNull(),
  wastePercentage: integer("waste_percentage").default(0),
  totalCost: decimal("total_cost", { precision: 10, scale: 2 }).notNull(),
});

// Clients table
export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  address: text("address"),
  document: varchar("document", { length: 50 }), // CPF/CNPJ
  createdAt: timestamp("created_at").defaultNow(),
});

// Orders table
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderNumber: varchar("order_number", { length: 50 }).unique().notNull(),
  clientId: integer("client_id").references(() => clients.id),
  modelId: integer("model_id").references(() => models.id),
  status: varchar("status", { length: 50 }).default("pending"), // pending, approved, in_production, delivered
  totalValue: decimal("total_value", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: varchar("payment_method", { length: 50 }),
  paymentTerms: varchar("payment_terms", { length: 100 }),
  deliveryDate: timestamp("delivery_date"),
  notes: text("notes"),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Order items (quantities by size)
export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").references(() => orders.id, { onDelete: "cascade" }),
  size: varchar("size", { length: 10 }).notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
});

// Factories/Production units
export const factories = pgTable("factories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(), // internal, external
  contact: varchar("contact", { length: 255 }),
  specialties: text("specialties"), // tipos de produção que fazem
  createdAt: timestamp("created_at").defaultNow(),
});

// Production batches
export const productionBatches = pgTable("production_batches", {
  id: serial("id").primaryKey(),
  batchNumber: varchar("batch_number", { length: 50 }).unique().notNull(),
  orderId: integer("order_id").references(() => orders.id),
  factoryId: integer("factory_id").references(() => factories.id),
  currentStage: varchar("current_stage", { length: 50 }).default("cutting"), // cutting, sewing, pressing, finishing
  startDate: timestamp("start_date"),
  expectedEndDate: timestamp("expected_end_date"),
  actualEndDate: timestamp("actual_end_date"),
  notes: text("notes"),
  losses: integer("losses").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Activity log
export const activityLog = pgTable("activity_log", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  module: varchar("module", { length: 50 }).notNull(),
  action: varchar("action", { length: 100 }).notNull(),
  description: text("description"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Quotations/Orçamentos table - Header information
export const quotations = pgTable("quotations", {
  id: serial("id").primaryKey(),
  quotationNumber: varchar("quotation_number", { length: 50 }).notNull().unique(), // Número único do orçamento
  userId: varchar("user_id").references(() => users.id),
  clientId: integer("client_id").references(() => clients.id),
  clientName: varchar("client_name", { length: 255 }),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  totalAmount: decimal("total_amount", { precision: 12, scale: 2 }).default("0"),
  status: varchar("status", { length: 50 }).default("draft"), // draft, approved, sent
  validUntil: timestamp("valid_until"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Quotation Items - Multiple models per quotation
export const quotationItems = pgTable("quotation_items", {
  id: serial("id").primaryKey(),
  quotationId: integer("quotation_id").references(() => quotations.id, { onDelete: "cascade" }),
  modelName: varchar("model_name", { length: 255 }).notNull(),
  reference: varchar("reference", { length: 100 }).notNull(),
  description: text("description"),
  garmentType: varchar("garment_type", { length: 100 }).notNull(),
  pricingMode: varchar("pricing_mode", { length: 20 }).notNull(), // single, multiple
  imageUrl: text("image_url"),
  fabricId: integer("fabric_id").references(() => fabrics.id),
  fabricConsumption: decimal("fabric_consumption", { precision: 10, scale: 3 }),
  wastePercentage: decimal("waste_percentage", { precision: 5, scale: 2 }),
  profitMargin: decimal("profit_margin", { precision: 5, scale: 2 }),
  unitCost: decimal("unit_cost", { precision: 10, scale: 2 }),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }),
  totalCost: decimal("total_cost", { precision: 10, scale: 2 }),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }),
  hasColors: boolean("has_colors").default(false), // Se tem variações de cor
  createdAt: timestamp("created_at").defaultNow(),
});

// Quotation item sizes - Tamanhos por item do orçamento
export const quotationItemSizes = pgTable("quotation_item_sizes", {
  id: serial("id").primaryKey(),
  itemId: integer("item_id").references(() => quotationItems.id, { onDelete: "cascade" }),
  size: varchar("size", { length: 20 }).notNull(),
  quantity: integer("quantity").notNull(),
  weight: integer("weight").notNull(), // em gramas
  color: varchar("color", { length: 50 }), // cor opcional (branco, preto, azul, etc.)
});

// Quotation item costs - Custos por item do orçamento
export const quotationItemCosts = pgTable("quotation_item_costs", {
  id: serial("id").primaryKey(),
  itemId: integer("item_id").references(() => quotationItems.id, { onDelete: "cascade" }),
  category: varchar("category", { length: 50 }).notNull(), // creation, supplies, labor, fixed
  description: varchar("description", { length: 255 }).notNull(),
  unitValue: decimal("unit_value", { precision: 10, scale: 2 }),
  quantity: decimal("quantity", { precision: 10, scale: 3 }),
  wastePercentage: decimal("waste_percentage", { precision: 5, scale: 2 }),
  total: decimal("total", { precision: 10, scale: 2 }),
});

// Relations
export const fabricsRelations = relations(fabrics, ({ one, many }) => ({
  supplier: one(suppliers, {
    fields: [fabrics.supplierId],
    references: [suppliers.id],
  }),
  models: many(models),
}));

export const modelsRelations = relations(models, ({ one, many }) => ({
  fabric: one(fabrics, {
    fields: [models.fabricId],
    references: [fabrics.id],
  }),
  garmentType: one(garmentTypes, {
    fields: [models.garmentTypeId],
    references: [garmentTypes.id],
  }),
  weights: many(modelWeights),
  costs: many(modelCosts),
  orders: many(orders),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  client: one(clients, {
    fields: [orders.clientId],
    references: [clients.id],
  }),
  model: one(models, {
    fields: [orders.modelId],
    references: [models.id],
  }),
  items: many(orderItems),
  productionBatches: many(productionBatches),
}));

export const quotationsRelations = relations(quotations, ({ one, many }) => ({
  client: one(clients, {
    fields: [quotations.clientId],
    references: [clients.id],
  }),
  items: many(quotationItems),
}));

export const quotationItemsRelations = relations(quotationItems, ({ one, many }) => ({
  quotation: one(quotations, {
    fields: [quotationItems.quotationId],
    references: [quotations.id],
  }),
  fabric: one(fabrics, {
    fields: [quotationItems.fabricId],
    references: [fabrics.id],
  }),
  sizes: many(quotationItemSizes),
  costs: many(quotationItemCosts),
}));

export const quotationItemSizesRelations = relations(quotationItemSizes, ({ one }) => ({
  item: one(quotationItems, {
    fields: [quotationItemSizes.itemId],
    references: [quotationItems.id],
  }),
}));

export const quotationItemCostsRelations = relations(quotationItemCosts, ({ one }) => ({
  item: one(quotationItems, {
    fields: [quotationItemCosts.itemId],
    references: [quotationItems.id],
  }),
}));

// Insert schemas
export const insertSupplierSchema = createInsertSchema(suppliers).omit({ id: true, createdAt: true });
export const insertFabricSchema = createInsertSchema(fabrics).omit({ id: true, createdAt: true, updatedAt: true });
export const insertModelSchema = createInsertSchema(models).omit({ id: true, createdAt: true, updatedAt: true });
export const insertOrderSchema = createInsertSchema(orders).omit({ id: true, createdAt: true, updatedAt: true });
export const insertClientSchema = createInsertSchema(clients).omit({ id: true, createdAt: true });
export const insertQuotationSchema = createInsertSchema(quotations).omit({ id: true, createdAt: true, updatedAt: true });
export const insertQuotationItemSchema = createInsertSchema(quotationItems).omit({ id: true, createdAt: true });
export const insertQuotationItemSizeSchema = createInsertSchema(quotationItemSizes).omit({ id: true });
export const insertQuotationItemCostSchema = createInsertSchema(quotationItemCosts).omit({ id: true });

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Supplier = typeof suppliers.$inferSelect;
export type InsertSupplier = typeof insertSupplierSchema._type;
export type Fabric = typeof fabrics.$inferSelect;
export type InsertFabric = typeof insertFabricSchema._type;
export type Model = typeof models.$inferSelect;
export type InsertModel = typeof insertModelSchema._type;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof insertOrderSchema._type;
export type Client = typeof clients.$inferSelect;
export type InsertClient = typeof insertClientSchema._type;
export type ProductionBatch = typeof productionBatches.$inferSelect;
export type GarmentType = typeof garmentTypes.$inferSelect;
export type ModelWeight = typeof modelWeights.$inferSelect;
export type ModelCost = typeof modelCosts.$inferSelect;
export type CostCategory = typeof costCategories.$inferSelect;
export type Quotation = typeof quotations.$inferSelect;
export type InsertQuotation = typeof insertQuotationSchema._type;
export type QuotationItem = typeof quotationItems.$inferSelect;
export type InsertQuotationItem = typeof insertQuotationItemSchema._type;
export type QuotationItemSize = typeof quotationItemSizes.$inferSelect;
export type InsertQuotationItemSize = typeof insertQuotationItemSizeSchema._type;
export type QuotationItemCost = typeof quotationItemCosts.$inferSelect;
export type InsertQuotationItemCost = typeof insertQuotationItemCostSchema._type;
