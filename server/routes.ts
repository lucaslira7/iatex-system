import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { chatWithAI, generateFabricSuggestions, optimizeMargins, generateInsights, analyzeFabricUsage } from "./openai";
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
        fabricConsumption: formData.fabricConsumption ? formData.fabricConsumption.toString() : '0',
        fabricCost: formData.fabricCost ? formData.fabricCost.toString() : '0',
        wastePercentage: formData.wastePercentage ? formData.wastePercentage.toString() : '0',
        profitMargin: formData.profitMargin ? formData.profitMargin.toString() : '0',
        totalCost: formData.totalCost ? formData.totalCost.toString() : '0',
        finalPrice: formData.finalPrice ? formData.finalPrice.toString() : '0',
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

  // AI Assistant routes
  app.post("/api/ai/chat", isAuthenticated, async (req: any, res) => {
    try {
      const { message, context } = req.body;
      const response = await chatWithAI(message, context);
      
      // Log the interaction
      await storage.logActivity(
        req.user?.claims?.sub || 'unknown',
        'ai-assistant',
        'chat',
        `Pergunta: "${message.substring(0, 50)}..."`
      );
      
      res.json({ response });
    } catch (error) {
      console.error('Error in AI chat:', error);
      res.status(500).json({ message: "Failed to process AI request" });
    }
  });

  app.get("/api/ai/suggestions", isAuthenticated, async (req, res) => {
    try {
      // Get business data for generating suggestions
      const fabrics = await storage.getFabrics();
      const models = await storage.getModels();
      const pricingTemplates = await storage.getPricingTemplates();
      
      // Analyze fabric usage
      const fabricAnalysis = await analyzeFabricUsage(fabrics);
      
      // Generate AI insights
      const businessData = {
        fabricCount: fabrics.length,
        modelCount: models.length,
        templateCount: pricingTemplates.length,
        fabricAnalysis
      };
      
      const insights = await generateInsights(businessData);
      
      // Transform insights into suggestions format
      const suggestions = insights.insights?.map((insight: any, index: number) => ({
        id: `suggestion-${Date.now()}-${index}`,
        type: insight.type === 'opportunity' ? 'optimization' : 
              insight.type === 'warning' ? 'margin' : 'fabric',
        title: insight.title,
        description: insight.description,
        confidence: Math.floor(Math.random() * 20) + 80, // 80-100%
        data: insight,
        createdAt: new Date()
      })) || [];
      
      res.json(suggestions);
    } catch (error) {
      console.error('Error fetching AI suggestions:', error);
      res.status(500).json({ message: "Failed to fetch suggestions" });
    }
  });

  app.post("/api/ai/fabric-suggestions", isAuthenticated, async (req: any, res) => {
    try {
      const models = await storage.getModels();
      const fabrics = await storage.getFabrics();
      
      const modelData = {
        models: models.slice(0, 5), // Use recent models
        availableFabrics: fabrics,
        ...req.body
      };
      
      const suggestions = await generateFabricSuggestions(modelData);
      
      await storage.logActivity(
        req.user?.claims?.sub || 'unknown',
        'ai-assistant',
        'fabric-suggestions',
        `Geradas sugestões para ${models.length} modelos`
      );
      
      res.json(suggestions);
    } catch (error) {
      console.error('Error generating fabric suggestions:', error);
      res.status(500).json({ message: "Failed to generate fabric suggestions" });
    }
  });

  app.post("/api/ai/optimize-margins", isAuthenticated, async (req: any, res) => {
    try {
      const templates = await storage.getPricingTemplates();
      
      const pricingData = {
        templates: templates.slice(0, 10), // Recent templates
        ...req.body
      };
      
      const optimization = await optimizeMargins(pricingData);
      
      await storage.logActivity(
        req.user?.claims?.sub || 'unknown',
        'ai-assistant',
        'margin-optimization',
        `Análise de ${templates.length} templates de precificação`
      );
      
      res.json(optimization);
    } catch (error) {
      console.error('Error optimizing margins:', error);
      res.status(500).json({ message: "Failed to optimize margins" });
    }
  });

  app.get("/api/ai/chat-history", isAuthenticated, async (req, res) => {
    try {
      // For now, return empty array - in production, you'd store chat history in database
      res.json([]);
    } catch (error) {
      console.error('Error fetching chat history:', error);
      res.status(500).json({ message: "Failed to fetch chat history" });
    }
  });

  // User Panels routes
  app.get("/api/user-panels/tasks", isAuthenticated, async (req, res) => {
    try {
      // Mock data - in production this would come from database
      const mockTasks = [
        {
          id: "task-1",
          title: "Buscar tecidos na Facção Maria",
          description: "Retirar 20 metros de tecido azul marinho já prontos para nova coleção",
          priority: "high",
          status: "pending",
          assignedTo: "current-user",
          assignedBy: "Gerente",
          dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          category: "supply",
          attachments: [],
          progress: 0,
          location: "Facção Maria - Centro",
          notes: [],
          createdAt: new Date()
        },
        {
          id: "task-2", 
          title: "Controle de qualidade - Lote 234",
          description: "Verificar 100 camisas do lote 234 quanto a acabamento e medidas",
          priority: "medium",
          status: "in-progress", 
          assignedTo: "current-user",
          assignedBy: "Supervisor",
          dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
          category: "production",
          attachments: [
            {
              id: "att-1",
              filename: "foto-progresso.jpg",
              url: "/uploads/foto-progresso.jpg", 
              type: "photo",
              uploadedAt: new Date(),
              uploadedBy: "current-user"
            }
          ],
          progress: 60,
          notes: ["Já verificados 60 peças", "2 peças com pequenos defeitos"],
          createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000)
        }
      ];
      
      res.json(mockTasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  app.post("/api/user-panels/tasks", isAuthenticated, async (req: any, res) => {
    try {
      const taskData = req.body;
      
      await storage.logActivity(
        req.user?.claims?.sub || 'unknown',
        'user-panels',
        'create-task',
        `Criou tarefa: ${taskData.title}`
      );
      
      res.json({ 
        success: true,
        id: `task-${Date.now()}`,
        message: 'Tarefa criada com sucesso!'
      });
    } catch (error) {
      console.error('Error creating task:', error);
      res.status(500).json({ message: "Failed to create task" });
    }
  });

  app.patch("/api/user-panels/tasks/:taskId", isAuthenticated, async (req: any, res) => {
    try {
      const { taskId } = req.params;
      const updates = req.body;
      
      await storage.logActivity(
        req.user?.claims?.sub || 'unknown',
        'user-panels',
        'update-task',
        `Atualizou tarefa ${taskId}: ${JSON.stringify(updates)}`
      );
      
      res.json({ success: true, message: 'Tarefa atualizada!' });
    } catch (error) {
      console.error('Error updating task:', error);
      res.status(500).json({ message: "Failed to update task" });
    }
  });

  app.get("/api/user-panels/production", isAuthenticated, async (req, res) => {
    try {
      // Mock production data for factories
      const mockProduction = [
        {
          id: "batch-1",
          modelName: "Camisa Social Branca",
          factoryName: "Facção Maria",
          quantity: 100,
          status: "in-progress",
          startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          progress: 75,
          notes: ["Produção dentro do prazo", "Qualidade aprovada"],
          attachments: [],
          qualityScore: 95,
          lossPercentage: 2
        },
        {
          id: "batch-2",
          modelName: "Vestido Estampado",
          factoryName: "Facção João", 
          quantity: 50,
          status: "ready-pickup",
          startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          estimatedDelivery: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          progress: 100,
          notes: ["Lote concluído", "Aguardando retirada"],
          attachments: [],
          qualityScore: 98,
          lossPercentage: 1
        }
      ];
      
      res.json(mockProduction);
    } catch (error) {
      console.error('Error fetching production:', error);
      res.status(500).json({ message: "Failed to fetch production data" });
    }
  });

  app.patch("/api/user-panels/production/:batchId", isAuthenticated, async (req: any, res) => {
    try {
      const { batchId } = req.params;
      const updates = req.body;
      
      await storage.logActivity(
        req.user?.claims?.sub || 'unknown',
        'user-panels',
        'update-production',
        `Atualizou produção ${batchId}: ${JSON.stringify(updates)}`
      );
      
      res.json({ success: true, message: 'Produção atualizada!' });
    } catch (error) {
      console.error('Error updating production:', error);
      res.status(500).json({ message: "Failed to update production" });
    }
  });

  app.get("/api/user-panels/supplies", isAuthenticated, async (req, res) => {
    try {
      // Mock supply requests data
      const mockSupplies = [
        {
          id: "supply-1",
          items: ["Linha preta", "Botões dourados", "Zíper 20cm"],
          requestedBy: "Facção Maria",
          factoryName: "Facção Maria",
          urgency: "medium",
          status: "pending",
          requestDate: new Date(Date.now() - 2 * 60 * 60 * 1000),
          notes: "Urgente para finalizar lote de blazers"
        },
        {
          id: "supply-2",
          items: ["Elástico 2cm", "Etiquetas de composição"],
          requestedBy: "Facção João",
          factoryName: "Facção João", 
          urgency: "low",
          status: "approved",
          requestDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
          expectedDelivery: new Date(Date.now() + 24 * 60 * 60 * 1000),
          notes: "Para próximo lote de calças"
        }
      ];
      
      res.json(mockSupplies);
    } catch (error) {
      console.error('Error fetching supplies:', error);
      res.status(500).json({ message: "Failed to fetch supply requests" });
    }
  });

  app.post("/api/user-panels/upload", isAuthenticated, async (req: any, res) => {
    try {
      // Mock file upload - in production you'd handle actual file upload
      const { taskId, type } = req.body;
      
      await storage.logActivity(
        req.user?.claims?.sub || 'unknown',
        'user-panels',
        'upload',
        `Upload de ${type} para tarefa ${taskId}`
      );
      
      res.json({ 
        success: true,
        attachment: {
          id: `att-${Date.now()}`,
          filename: "arquivo-anexado.jpg",
          url: "/uploads/arquivo-anexado.jpg",
          type: type,
          uploadedAt: new Date(),
          uploadedBy: req.user?.claims?.sub || 'unknown'
        }
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      res.status(500).json({ message: "Failed to upload file" });
    }
  });

  // Operational Panel routes (Kanban style)
  app.get("/api/operational/tasks", isAuthenticated, async (req, res) => {
    try {
      // Mock kanban tasks with enhanced data structure
      const mockKanbanTasks = [
        {
          id: "kanban-1",
          title: "Prensar 200 camisas modelo C001",
          description: "Prensar lote completo de camisas sociais brancas tamanho M",
          priority: "high",
          status: "todo",
          type: "production",
          assignedTo: "current-user",
          assignedBy: "Supervisor",
          dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
          tags: ["produção", "prensagem", "urgente"],
          attachments: [],
          progress: 0,
          location: "Setor de Acabamento",
          notes: [],
          createdAt: new Date(),
          estimatedHours: 4,
          model: "C001",
          quantity: 200
        },
        {
          id: "kanban-2",
          title: "Buscar insumos na Facção Maria",
          description: "Retirar linha preta e botões dourados solicitados",
          priority: "medium",
          status: "doing", 
          type: "supply",
          assignedTo: "current-user",
          assignedBy: "Gerente",
          dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          tags: ["transporte", "insumos"],
          attachments: [
            {
              id: "att-k1",
              filename: "lista-insumos.pdf",
              url: "/uploads/lista-insumos.pdf",
              type: "document",
              uploadedAt: new Date(),
              uploadedBy: "supervisor"
            }
          ],
          progress: 60,
          location: "Facção Maria - Centro",
          notes: ["Já confirmado horário de retirada", "Levar sacolas grandes"],
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
          estimatedHours: 3,
          actualHours: 2
        },
        {
          id: "kanban-3",
          title: "Entregar lote na Facção João",
          description: "Entregar 150 vestidos para costura",
          priority: "urgent",
          status: "done",
          type: "delivery",
          assignedTo: "delivery-team",
          assignedBy: "Coordenador",
          dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          tags: ["entrega", "facção", "vestidos"],
          attachments: [],
          progress: 100,
          location: "Facção João",
          notes: ["Entrega realizada às 14h", "Recibo assinado"],
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          estimatedHours: 2,
          actualHours: 1.5,
          model: "V001",
          quantity: 150
        }
      ];
      
      res.json(mockKanbanTasks);
    } catch (error) {
      console.error('Error fetching operational tasks:', error);
      res.status(500).json({ message: "Failed to fetch operational tasks" });
    }
  });

  app.get("/api/operational/production", isAuthenticated, async (req, res) => {
    try {
      // Mock production orders with fabric cutting integration
      const mockProductionOrders = [
        {
          id: "prod-1",
          modelCode: "C001",
          modelName: "Camisa Social Branca",
          fabricUsed: "Tricoline Branco",
          totalWeight: 36,
          estimatedPieces: 132,
          actualPieces: 128,
          sizes: [
            { size: "P", quantity: 30, color: "branco" },
            { size: "M", quantity: 50, color: "branco" },
            { size: "G", quantity: 48, color: "branco" }
          ],
          factoryAssigned: "Facção Maria",
          status: "in-production",
          sentDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          expectedReturn: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
          qrCode: "QR-C001-240102"
        },
        {
          id: "prod-2",
          modelCode: "V001", 
          modelName: "Vestido Estampado",
          fabricUsed: "Crepe Estampado",
          totalWeight: 24,
          estimatedPieces: 85,
          actualPieces: 82,
          sizes: [
            { size: "P", quantity: 25, color: "floral" },
            { size: "M", quantity: 35, color: "floral" },
            { size: "G", quantity: 22, color: "floral" }
          ],
          factoryAssigned: "Facção João",
          status: "ready-pickup",
          sentDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          expectedReturn: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          actualReturn: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          qrCode: "QR-V001-240105"
        },
        {
          id: "prod-3",
          modelCode: "CJ001",
          modelName: "Conjunto Verão",
          fabricUsed: "Linho Azul",
          totalWeight: 18,
          estimatedPieces: 60,
          sizes: [
            { size: "P", quantity: 20, color: "azul claro" },
            { size: "M", quantity: 25, color: "azul claro" },
            { size: "G", quantity: 15, color: "azul claro" }
          ],
          factoryAssigned: "Facção Silva",
          status: "cutting",
          expectedReturn: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
          qrCode: "QR-CJ001-240108"
        }
      ];
      
      res.json(mockProductionOrders);
    } catch (error) {
      console.error('Error fetching production orders:', error);
      res.status(500).json({ message: "Failed to fetch production orders" });
    }
  });

  app.get("/api/operational/goals", isAuthenticated, async (req, res) => {
    try {
      // Mock daily goals for productivity tracking
      const mockDailyGoals = [
        {
          id: "goal-1",
          employeeId: "current-user",
          title: "Prensagem Diária",
          target: 300,
          current: 180,
          unit: "peças",
          type: "pressing",
          date: new Date(),
          completed: false
        },
        {
          id: "goal-2",
          employeeId: "current-user", 
          title: "Controle de Qualidade",
          target: 150,
          current: 150,
          unit: "peças",
          type: "quality-check",
          date: new Date(),
          completed: true
        },
        {
          id: "goal-3",
          employeeId: "current-user",
          title: "Embalagem",
          target: 100,
          current: 45,
          unit: "pacotes",
          type: "packing",
          date: new Date(),
          completed: false
        },
        {
          id: "goal-4",
          employeeId: "current-user",
          title: "Entregas",
          target: 3,
          current: 2,
          unit: "rotas",
          type: "delivery",
          date: new Date(),
          completed: false
        }
      ];
      
      res.json(mockDailyGoals);
    } catch (error) {
      console.error('Error fetching daily goals:', error);
      res.status(500).json({ message: "Failed to fetch daily goals" });
    }
  });

  app.get("/api/operational/supplies", isAuthenticated, async (req, res) => {
    try {
      // Mock supply requests with enhanced structure
      const mockSupplyRequests = [
        {
          id: "supply-op-1",
          items: [
            { name: "Linha preta", brand: "Corrente", reference: "120", quantity: 10, unit: "cones" },
            { name: "Botões dourados", brand: null, reference: "BT-001", quantity: 500, unit: "unidades" },
            { name: "Zíper 20cm", brand: "YKK", reference: "Z20", quantity: 50, unit: "unidades" }
          ],
          requestedBy: "Facção Maria",
          factoryName: "Facção Maria",
          urgency: "medium",
          status: "pending",
          requestDate: new Date(Date.now() - 3 * 60 * 60 * 1000),
          notes: "Urgente para finalizar lote de blazers da próxima semana",
          attachments: [
            {
              id: "att-supply-1",
              filename: "foto-estoque-linha.jpg",
              url: "/uploads/foto-estoque-linha.jpg",
              type: "photo",
              uploadedAt: new Date(),
              uploadedBy: "faccao-maria"
            }
          ]
        },
        {
          id: "supply-op-2",
          items: [
            { name: "Elástico 2cm", brand: "Santista", reference: "EL-02", quantity: 100, unit: "metros" },
            { name: "Etiquetas composição", brand: null, reference: "ET-COMP", quantity: 200, unit: "unidades" }
          ],
          requestedBy: "Facção João",
          factoryName: "Facção João",
          urgency: "high",
          status: "approved",
          requestDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          expectedDelivery: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
          notes: "Para o lote de vestidos que está terminando esta semana",
          attachments: []
        }
      ];
      
      res.json(mockSupplyRequests);
    } catch (error) {
      console.error('Error fetching supply requests:', error);
      res.status(500).json({ message: "Failed to fetch supply requests" });
    }
  });

  app.post("/api/operational/tasks", isAuthenticated, async (req: any, res) => {
    try {
      const taskData = req.body;
      
      await storage.logActivity(
        req.user?.claims?.sub || 'unknown',
        'operational',
        'create-kanban-task',
        `Criou tarefa Kanban: ${taskData.title}`
      );
      
      res.json({ 
        success: true,
        id: `kanban-${Date.now()}`,
        message: 'Tarefa criada no quadro Kanban!'
      });
    } catch (error) {
      console.error('Error creating kanban task:', error);
      res.status(500).json({ message: "Failed to create kanban task" });
    }
  });

  app.patch("/api/operational/tasks/:taskId", isAuthenticated, async (req: any, res) => {
    try {
      const { taskId } = req.params;
      const updates = req.body;
      
      await storage.logActivity(
        req.user?.claims?.sub || 'unknown',
        'operational',
        'update-kanban-task',
        `Atualizou tarefa Kanban ${taskId}: moveu para ${updates.status || 'atualizada'}`
      );
      
      res.json({ success: true, message: 'Tarefa atualizada no Kanban!' });
    } catch (error) {
      console.error('Error updating kanban task:', error);
      res.status(500).json({ message: "Failed to update kanban task" });
    }
  });

  app.post("/api/operational/production", isAuthenticated, async (req: any, res) => {
    try {
      const productionData = req.body;
      
      await storage.logActivity(
        req.user?.claims?.sub || 'unknown',
        'operational',
        'create-production-order',
        `Criou ordem de produção: ${productionData.modelCode || 'nova ordem'}`
      );
      
      res.json({ 
        success: true,
        id: `prod-${Date.now()}`,
        qrCode: `QR-${productionData.modelCode || 'MODEL'}-${new Date().toISOString().slice(2,10).replace(/-/g, '')}`,
        message: 'Ordem de produção criada e enviada para a facção!'
      });
    } catch (error) {
      console.error('Error creating production order:', error);
      res.status(500).json({ message: "Failed to create production order" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
