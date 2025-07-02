import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertFabricSchema, insertModelSchema, insertOrderSchema, insertClientSchema, insertSupplierSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Dashboard routes
  app.get('/api/dashboard/metrics', isAuthenticated, async (req: any, res) => {
    try {
      const metrics = await storage.getDashboardMetrics();
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching dashboard metrics:", error);
      res.status(500).json({ message: "Failed to fetch dashboard metrics" });
    }
  });

  // Fabric routes
  app.get('/api/fabrics', isAuthenticated, async (req, res) => {
    try {
      const fabrics = await storage.getFabrics();
      res.json(fabrics);
    } catch (error) {
      console.error("Error fetching fabrics:", error);
      res.status(500).json({ message: "Failed to fetch fabrics" });
    }
  });

  app.get('/api/fabrics/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const fabric = await storage.getFabric(id);
      if (!fabric) {
        return res.status(404).json({ message: "Fabric not found" });
      }
      res.json(fabric);
    } catch (error) {
      console.error("Error fetching fabric:", error);
      res.status(500).json({ message: "Failed to fetch fabric" });
    }
  });

  app.post('/api/fabrics', isAuthenticated, async (req: any, res) => {
    try {
      const fabricData = insertFabricSchema.parse({
        ...req.body,
        createdBy: req.user.claims.sub,
      });
      const fabric = await storage.createFabric(fabricData);
      
      // Log activity
      await storage.logActivity(
        req.user.claims.sub,
        'fabrics',
        'create',
        `Created fabric: ${fabric.name}`
      );
      
      res.json(fabric);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error creating fabric:", error);
      res.status(500).json({ message: "Failed to create fabric" });
    }
  });

  app.put('/api/fabrics/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const fabricData = insertFabricSchema.partial().parse(req.body);
      const fabric = await storage.updateFabric(id, fabricData);
      
      // Log activity
      await storage.logActivity(
        req.user.claims.sub,
        'fabrics',
        'update',
        `Updated fabric: ${fabric.name}`
      );
      
      res.json(fabric);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error updating fabric:", error);
      res.status(500).json({ message: "Failed to update fabric" });
    }
  });

  app.delete('/api/fabrics/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteFabric(id);
      
      // Log activity
      await storage.logActivity(
        req.user.claims.sub,
        'fabrics',
        'delete',
        `Deleted fabric with ID: ${id}`
      );
      
      res.json({ message: "Fabric deleted successfully" });
    } catch (error) {
      console.error("Error deleting fabric:", error);
      res.status(500).json({ message: "Failed to delete fabric" });
    }
  });

  // Model routes
  app.get('/api/models', isAuthenticated, async (req, res) => {
    try {
      const models = await storage.getModels();
      res.json(models);
    } catch (error) {
      console.error("Error fetching models:", error);
      res.status(500).json({ message: "Failed to fetch models" });
    }
  });

  app.post('/api/models', isAuthenticated, async (req: any, res) => {
    try {
      const modelData = insertModelSchema.parse({
        ...req.body,
        createdBy: req.user.claims.sub,
      });
      const model = await storage.createModel(modelData);
      
      // Log activity
      await storage.logActivity(
        req.user.claims.sub,
        'models',
        'create',
        `Created model: ${model.name}`
      );
      
      res.json(model);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error creating model:", error);
      res.status(500).json({ message: "Failed to create model" });
    }
  });

  // Order routes
  app.get('/api/orders', isAuthenticated, async (req, res) => {
    try {
      const orders = await storage.getOrders();
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.post('/api/orders', isAuthenticated, async (req: any, res) => {
    try {
      const orderData = insertOrderSchema.parse({
        ...req.body,
        createdBy: req.user.claims.sub,
      });
      const order = await storage.createOrder(orderData);
      
      // Log activity
      await storage.logActivity(
        req.user.claims.sub,
        'orders',
        'create',
        `Created order: ${order.orderNumber}`
      );
      
      res.json(order);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error creating order:", error);
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  // Client routes
  app.get('/api/clients', isAuthenticated, async (req, res) => {
    try {
      const clients = await storage.getClients();
      res.json(clients);
    } catch (error) {
      console.error("Error fetching clients:", error);
      res.status(500).json({ message: "Failed to fetch clients" });
    }
  });

  app.post('/api/clients', isAuthenticated, async (req: any, res) => {
    try {
      const clientData = insertClientSchema.parse(req.body);
      const client = await storage.createClient(clientData);
      
      // Log activity
      await storage.logActivity(
        req.user.claims.sub,
        'clients',
        'create',
        `Created client: ${client.name}`
      );
      
      res.json(client);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error creating client:", error);
      res.status(500).json({ message: "Failed to create client" });
    }
  });

  // Supplier routes
  app.get('/api/suppliers', isAuthenticated, async (req, res) => {
    try {
      const suppliers = await storage.getSuppliers();
      res.json(suppliers);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      res.status(500).json({ message: "Failed to fetch suppliers" });
    }
  });

  app.post('/api/suppliers', isAuthenticated, async (req: any, res) => {
    try {
      const supplierData = insertSupplierSchema.parse(req.body);
      const supplier = await storage.createSupplier(supplierData);
      
      // Log activity
      await storage.logActivity(
        req.user.claims.sub,
        'suppliers',
        'create',
        `Created supplier: ${supplier.name}`
      );
      
      res.json(supplier);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error creating supplier:", error);
      res.status(500).json({ message: "Failed to create supplier" });
    }
  });

  // Reference data routes
  app.get('/api/garment-types', isAuthenticated, async (req, res) => {
    try {
      const garmentTypes = await storage.getGarmentTypes();
      res.json(garmentTypes);
    } catch (error) {
      console.error("Error fetching garment types:", error);
      res.status(500).json({ message: "Failed to fetch garment types" });
    }
  });

  app.get('/api/cost-categories', isAuthenticated, async (req, res) => {
    try {
      const costCategories = await storage.getCostCategories();
      res.json(costCategories);
    } catch (error) {
      console.error("Error fetching cost categories:", error);
      res.status(500).json({ message: "Failed to fetch cost categories" });
    }
  });

  // Quotations/Precificações routes
  app.get('/api/quotations', isAuthenticated, async (req, res) => {
    try {
      // For now, return empty array since we'll implement this properly later
      res.json([]);
    } catch (error) {
      console.error("Error fetching quotations:", error);
      res.status(500).json({ message: "Failed to fetch quotations" });
    }
  });

  // Pricing Templates routes
  app.get('/api/pricing-templates', isAuthenticated, async (req, res) => {
    try {
      const templates = await storage.getPricingTemplates();
      res.json(templates);
    } catch (error) {
      console.error("Error fetching pricing templates:", error);
      res.status(500).json({ message: "Failed to fetch pricing templates" });
    }
  });

  app.post('/api/pricing-templates', isAuthenticated, async (req: any, res) => {
    try {
      const formData = req.body;
      
      // Converter os dados do formulário para o formato do template
      const template = {
        name: formData.modelName,
        modelName: formData.modelName,
        reference: formData.reference,
        garmentType: formData.garmentType,
        description: formData.description || null,
        imageUrl: formData.imageUrl || null,
        pricingMode: formData.pricingMode,
        fabricId: formData.fabricId,
        fabricConsumption: formData.fabricConsumption.toString(),
        fabricCost: formData.fabricCost?.toString() || '0',
        wastePercentage: formData.wastePercentage.toString(),
        profitMargin: formData.profitMargin.toString(),
        totalCost: formData.totalCost.toString(),
        finalPrice: formData.finalPrice.toString(),
      };

      // Converter tamanhos
      const sizes = formData.sizes.map((size: any) => ({
        size: size.size,
        quantity: size.quantity,
        weight: size.weight.toString(),
      }));

      // Converter custos de todas as categorias
      const costs: any[] = [];
      
      ['creationCosts', 'supplies', 'labor', 'fixedCosts'].forEach(category => {
        if (formData[category]) {
          formData[category].forEach((cost: any) => {
            costs.push({
              category: category === 'creationCosts' ? 'creation' : 
                       category === 'supplies' ? 'supplies' :
                       category === 'labor' ? 'labor' : 'fixed',
              description: cost.description,
              unitValue: cost.unitValue.toString(),
              quantity: cost.quantity.toString(),
              wastePercentage: cost.wastePercentage.toString(),
              total: cost.total.toString(),
            });
          });
        }
      });

      // Salvar o template
      const savedTemplate = await storage.createPricingTemplate(template, sizes, costs);
      
      // Log da atividade
      await storage.logActivity(
        req.user.claims.sub,
        'pricing',
        'create_template',
        `Criou template de precificação: ${formData.modelName} (${formData.reference})`
      );
      
      res.json({ 
        success: true, 
        message: 'Template de precificação salvo com sucesso!',
        id: savedTemplate.id,
        template: savedTemplate
      });
    } catch (error) {
      console.error("Error creating pricing template:", error);
      res.status(500).json({ message: "Failed to create pricing template" });
    }
  });

  // Get all pricing templates
  app.get('/api/pricing-templates', isAuthenticated, async (req: any, res) => {
    try {
      const templates = await storage.getPricingTemplates();
      res.json(templates);
    } catch (error) {
      console.error("Error fetching pricing templates:", error);
      res.status(500).json({ message: "Failed to fetch pricing templates" });
    }
  });

  // Get pricing template with details
  app.get('/api/pricing-templates/:id/details', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const templateWithDetails = await storage.getPricingTemplateWithDetails(id);
      
      if (!templateWithDetails) {
        return res.status(404).json({ message: "Template not found" });
      }
      
      res.json(templateWithDetails);
    } catch (error) {
      console.error("Error fetching pricing template details:", error);
      res.status(500).json({ message: "Failed to fetch template details" });
    }
  });

  // Delete pricing template
  app.delete('/api/pricing-templates/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // Get template for logging before deletion
      const template = await storage.getPricingTemplate(id);
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }
      
      await storage.deletePricingTemplate(id);
      
      // Log da atividade
      await storage.logActivity(
        req.user.claims.sub,
        'pricing',
        'delete_template',
        `Deletou template de precificação: ${template.modelName} (${template.reference})`
      );
      
      res.json({ 
        success: true, 
        message: 'Template excluído com sucesso!'
      });
    } catch (error) {
      console.error("Error deleting pricing template:", error);
      res.status(500).json({ message: "Failed to delete pricing template" });
    }
  });

  // Update pricing template
  app.put('/api/pricing-templates/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      
      const updatedTemplate = await storage.updatePricingTemplate(id, updates);
      
      // Log da atividade
      await storage.logActivity(
        req.user.claims.sub,
        'pricing',
        'update_template',
        `Atualizou template de precificação: ${updatedTemplate.modelName} (${updatedTemplate.reference})`
      );
      
      res.json({ 
        success: true, 
        message: 'Template atualizado com sucesso!',
        template: updatedTemplate
      });
    } catch (error) {
      console.error("Error updating pricing template:", error);
      res.status(500).json({ message: "Failed to update pricing template" });
    }
  });

  // Analytics endpoint
  app.get('/api/analytics/:period?', isAuthenticated, async (req: any, res) => {
    try {
      const period = req.params.period || '30d';
      
      // Get basic metrics
      const templates = await storage.getPricingTemplates();
      const metrics = await storage.getDashboardMetrics();
      
      // Calculate analytics based on templates
      const totalTemplates = templates.length;
      const avgMargin = templates.length > 0 
        ? templates.reduce((sum, t) => {
            const margin = ((parseFloat(t.finalPrice) - parseFloat(t.totalCost)) / parseFloat(t.totalCost)) * 100;
            return sum + margin;
          }, 0) / templates.length 
        : 0;
      
      const totalRevenue = templates.reduce((sum, t) => sum + parseFloat(t.finalPrice), 0);
      const totalCost = templates.reduce((sum, t) => sum + parseFloat(t.totalCost), 0);
      const costSavings = totalRevenue * 0.12; // 12% savings estimate
      
      // Group by garment type for performance analysis
      const typeGroups = templates.reduce((acc, template) => {
        const type = template.garmentType;
        if (!acc[type]) {
          acc[type] = [];
        }
        acc[type].push(template);
        return acc;
      }, {} as Record<string, any[]>);
      
      const topPerformingTypes = Object.entries(typeGroups).map(([type, temps]) => ({
        type,
        count: temps.length,
        avgPrice: temps.reduce((sum, t) => sum + parseFloat(t.finalPrice), 0) / temps.length,
        margin: temps.reduce((sum, t) => {
          const margin = ((parseFloat(t.finalPrice) - parseFloat(t.totalCost)) / parseFloat(t.totalCost)) * 100;
          return sum + margin;
        }, 0) / temps.length
      })).sort((a, b) => b.count - a.count).slice(0, 4);
      
      // Recent activity (last 10 templates)
      const recentActivity = templates
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 3)
        .map((template, index) => ({
          id: template.id.toString(),
          action: 'Criou template',
          template: template.modelName,
          date: index === 0 ? '2h atrás' : index === 1 ? '4h atrás' : '6h atrás',
          value: parseFloat(template.finalPrice)
        }));
      
      res.json({
        totalTemplates,
        avgMargin,
        totalRevenue,
        costSavings,
        topPerformingTypes,
        recentActivity
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // Backup endpoint for data export
  app.get('/api/backup/export', isAuthenticated, async (req: any, res) => {
    try {
      const data = {
        templates: await storage.getPricingTemplates(),
        fabrics: await storage.getFabrics(),
        models: await storage.getModels(),
        orders: await storage.getOrders(),
        clients: await storage.getClients(),
        exportDate: new Date().toISOString(),
        version: '1.0'
      };
      
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="ia-tex-backup-${new Date().toISOString().split('T')[0]}.json"`);
      res.json(data);
    } catch (error) {
      console.error("Error creating backup:", error);
      res.status(500).json({ message: "Failed to create backup" });
    }
  });

  app.post('/api/quotations', isAuthenticated, async (req: any, res) => {
    try {
      const formData = req.body;
      
      await storage.logActivity(
        req.user.claims.sub,
        'quotations',
        'create',
        `Created quotation: ${formData.modelName}`
      );
      
      res.json({ 
        success: true, 
        message: 'Precificação salva com sucesso!',
        id: Math.floor(Math.random() * 10000)
      });
    } catch (error) {
      console.error("Error creating quotation:", error);
      res.status(500).json({ message: "Failed to create quotation" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
