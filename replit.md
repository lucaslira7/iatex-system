# IA.TEX - Sistema de Gestão para Confecção

## Overview

IA.TEX is a comprehensive management system for textile/clothing manufacturing businesses. It's a full-stack web application designed to handle all aspects of a garment manufacturing operation, from fabric management and pricing calculations to production tracking and order management.

The system provides an integrated solution for small to medium-sized clothing manufacturers, offering modules for fabric inventory, cost calculation, model management, order processing, production tracking, and financial management.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Framework**: Tailwind CSS for styling with shadcn/ui component library
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Component Architecture**: Modular component design with reusable UI components

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript throughout the entire application
- **API Design**: RESTful API architecture with structured route handlers
- **Authentication**: Replit Auth integration with OAuth2 and JWT tokens
- **Session Management**: Express sessions with PostgreSQL storage

### Database Architecture
- **Database**: PostgreSQL with Neon serverless hosting
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Connection**: Neon serverless connection pooling

## Key Components

### Authentication System
- **Provider**: Replit Auth with OAuth2 flow
- **Session Storage**: PostgreSQL-backed session store
- **User Management**: Complete user profile management with roles
- **Security**: JWT tokens with secure cookie handling

### Fabric Management Module
- **Features**: Complete CRUD operations for fabric inventory
- **Data Structure**: Fabric properties including type, color, composition, weight, dimensions
- **Supplier Integration**: Fabric-supplier relationship management
- **Stock Tracking**: Current stock levels and yield percentage calculations

### Pricing Calculator Module
- **Multi-step Wizard**: Step-by-step pricing calculation interface
- **Garment Types**: Support for different clothing categories
- **Cost Breakdown**: Detailed cost analysis including materials, labor, and overhead
- **Model Integration**: Direct integration with model management system

### Dashboard & Analytics
- **KPI Tracking**: Key performance indicators for business metrics
- **Real-time Data**: Live updates using React Query
- **Visual Components**: Card-based interface for quick insights
- **Navigation Hub**: Central access point to all system modules

### UI Component System
- **Design System**: Consistent design language using shadcn/ui
- **Accessibility**: ARIA-compliant components with keyboard navigation
- **Responsive Design**: Mobile-first approach with breakpoint optimization
- **Theme Support**: Light/dark mode with CSS custom properties

## Data Flow

### Client-Server Communication
1. **Frontend**: React components make API calls using TanStack Query
2. **API Layer**: Express.js routes handle requests with authentication middleware
3. **Business Logic**: Service layer processes data and applies business rules
4. **Database**: Drizzle ORM executes type-safe queries against PostgreSQL
5. **Response**: JSON responses with proper error handling and status codes

### Authentication Flow
1. **Login**: User redirects to Replit Auth OAuth2 endpoint
2. **Callback**: Replit Auth returns user data and tokens
3. **Session**: Server creates session stored in PostgreSQL
4. **Authorization**: Protected routes verify session and user permissions
5. **Logout**: Session cleanup and token invalidation

### Data Synchronization
- **Real-time Updates**: React Query handles cache invalidation and background refetching
- **Optimistic Updates**: Immediate UI updates with server reconciliation
- **Error Handling**: Comprehensive error boundaries and user feedback
- **Loading States**: Progressive loading indicators throughout the application

## External Dependencies

### Core Framework Dependencies
- **React Ecosystem**: React 18, React DOM, React Query for state management
- **TypeScript**: Full TypeScript support across frontend and backend
- **Vite**: Development server and build tool with plugin ecosystem
- **Express.js**: Backend framework with middleware support

### UI and Styling
- **Tailwind CSS**: Utility-first CSS framework with JIT compilation
- **Radix UI**: Unstyled, accessible component primitives
- **shadcn/ui**: Pre-built component library with customizable themes
- **Lucide React**: Consistent icon library with tree-shaking support

### Database and ORM
- **Drizzle ORM**: Type-safe ORM with excellent TypeScript integration
- **Neon Database**: Serverless PostgreSQL with connection pooling
- **Drizzle Kit**: Schema management and migration tools

### Authentication and Security
- **Replit Auth**: OAuth2 authentication provider
- **Passport.js**: Authentication middleware with strategy support
- **Express Session**: Session management with PostgreSQL storage
- **Connect PG Simple**: PostgreSQL session store adapter

## Deployment Strategy

### Development Environment
- **Replit Integration**: Optimized for Replit development environment
- **Hot Module Replacement**: Instant development feedback with Vite HMR
- **Development Tools**: Replit-specific plugins and error overlays
- **Environment Variables**: Secure configuration management

### Production Build
- **Frontend Build**: Vite production build with code splitting and optimization
- **Backend Build**: ESBuild for Node.js production bundle
- **Static Asset Serving**: Express static file serving for production
- **Database Migrations**: Automated schema deployment with Drizzle Kit

### Scaling Considerations
- **Database**: Neon's serverless architecture provides automatic scaling
- **Frontend**: Static asset optimization and code splitting for performance
- **Backend**: Stateless design enables horizontal scaling
- **Session Storage**: PostgreSQL-backed sessions support multiple server instances

## Funcionalidades Implementadas

### 🏢 **Sistema Completo de Gestão IA.TEX**

#### **1. Gestão de Tecidos**
- ✅ CRUD completo (criar, visualizar, editar, excluir)
- ✅ Upload de imagens sem limite de tamanho
- ✅ Controle de estoque com alertas de baixo estoque
- ✅ Integração com fornecedores
- ✅ Filtros e busca avançada
- ✅ Cálculo automático de valor total do estoque

#### **2. Sistema de Precificação Avançado**
- ✅ Calculadora com 8 etapas completas
- ✅ Dois modos operacionais: peça única vs múltiplas peças
- ✅ Geração automática de referências (CL-calça, C-camisa, T-top, CJ-conjunto, V-vestido)
- ✅ Cálculo baseado em peso por tamanho + percentual de desperdício
- ✅ Templates salvos permanentemente para reutilização
- ✅ Integração com modelos e tecidos do sistema
- ✅ Custos de criação com valores pré-definidos (modelagem, piloto, linha, etc.)

#### **3. Geração de PDFs Profissionais**
- ✅ Resumos de precificação com nomenclatura "Resumo_REF_DATA"
- ✅ Fichas técnicas profissionais com nomenclatura "Ficha_REF_DATA"
- ✅ Fichas seguindo formato específico solicitado
- ✅ Posicionamento de imagens dos modelos
- ✅ Preview em tempo real com captura de tela

#### **4. Gestão de Modelos Integrada**
- ✅ Catálogo completo de modelos
- ✅ Integração com templates de precificação
- ✅ Visualização em abas separadas (Templates vs Modelos)
- ✅ Estatísticas de modelos e preços médios
- ✅ Relação bidirecional modelo ↔ template

#### **5. Gestão de Pedidos e Clientes**
- ✅ Sistema completo de pedidos
- ✅ Acompanhamento de status
- ✅ Integração com clientes
- ✅ Histórico de pedidos

#### **6. Acompanhamento de Produção**
- ✅ Status de produção em tempo real
- ✅ Métricas de performance
- ✅ Controle de lotes de produção

#### **7. Dashboard Analytics Avançado**
- ✅ Métricas KPI em tempo real
- ✅ Gráficos de performance e rentabilidade
- ✅ Análise de tipos de peça mais performáticos
- ✅ Relatórios de atividade recente
- ✅ Cálculos de economia de custos

#### **8. Sistema de UX/UI Profissional**
- ✅ Notificações toast com feedback visual
- ✅ Diálogos de confirmação para ações críticas
- ✅ Estados de loading contextuais e skeletons
- ✅ Validação de formulários em tempo real
- ✅ Cache inteligente para otimização de performance
- ✅ Atalhos de teclado personalizados (Ctrl+F1/F3)

#### **9. Funcionalidades Avançadas**
- ✅ Sistema de backup automático e exportação
- ✅ Log de atividades completo
- ✅ Integração com banco PostgreSQL
- ✅ APIs RESTful completas
- ✅ Autenticação com Replit Auth
- ✅ Responsividade mobile-first

#### **10. Arquitetura Técnica**
- ✅ Frontend: React 18 + TypeScript + Tailwind CSS
- ✅ Backend: Node.js + Express + TypeScript
- ✅ Database: PostgreSQL + Drizzle ORM
- ✅ Deployment: Replit com Vite
- ✅ UI Components: shadcn/ui + Radix UI

## Funcionalidades Pendentes

### ✅ **Simulações Avançadas** (IMPLEMENTADO)
- ✅ Comparar custo do modelo com diferentes tecidos
- ✅ Previsão de aumento de preço
- ✅ Simulador de markup reverso (definir preço final e descobrir custo máximo)
- ✅ Interface com 4 abas organizadas (comparação, markup reverso, projeção, análise histórica)

### ✅ **Produção Avançada por Facção** (IMPLEMENTADO)
- ✅ Cadastro completo de facções com especialidades e scores
- ✅ Acompanhamento de produção semanal com métricas
- ✅ Monitoramento de perdas e eficiência por lote
- ✅ Metas de perda e acompanhamento de performance
- ✅ Pipeline visual de produção com etapas
- ✅ Analytics comparativo entre facções

### ✅ **Financeiro Completo** (IMPLEMENTADO)
- ✅ Contas a pagar e receber com controle de vencimentos
- ✅ Fluxo de caixa completo com múltiplas contas
- ✅ Orçamentos por categoria com controle de gastos
- ✅ Dashboard financeiro com métricas em tempo real
- ✅ Relatórios mensais e análise de lucros

### ✅ **Estoque Inteligente** (IMPLEMENTADO)
- ✅ Estoque de insumos, aviamentos, embalagens completo
- ✅ Previsão inteligente de compras baseada em consumo
- ✅ Categorização e organização por fornecedores
- ✅ Alertas de estoque baixo e controle de movimentações
- ✅ Gestão de categorias e relatórios de valor

### 🤖 **Assistente com IA**
- Sugestão de tecidos, margens e otimizações
- Chat interno com IA para dúvidas de operação

### 📅 **Calendário Integrado**
- Visualização da produção por data
- Integração futura com Google Calendar

### ✅ **Central de Documentos** (IMPLEMENTADO)
- ✅ Upload completo de moldes, vídeos, fotos por modelo
- ✅ Organização por tipo (moldes, vídeos, imagens, PDFs, planilhas)
- ✅ Categorização por modelo com filtros avançados
- ✅ Documentos públicos para acesso de clientes
- ✅ Sistema de download, visualização e duplicação

### 🧾 **Emissão de Notas e Contratos**
- Emissão de NF simplificada
- Geração de contratos com assinatura digital

### ✅ **Gestão de Funcionários** (IMPLEMENTADO)
- ✅ Cadastro completo de funcionários com roles e performance
- ✅ Sistema de tarefas com prioridades e acompanhamento
- ✅ Dashboard com métricas de departamentos e produtividade
- ✅ Análise de eficiência temporal e rankings
- ✅ Planejamento e distribuição de tarefas

### 🧑‍💻 **Área do Cliente com Login**
- Acompanhar pedidos, ver PDFs, baixar ficha técnica

### 📊 **Relatórios Inteligentes**
- Insights automáticos baseados no uso e vendas
- Relatórios comparativos (lucro real vs planejado)

### ✅ **Duplicação de Modelos com Variações** (IMPLEMENTADO)
- ✅ Sistema de duplicação automática com 3 variações por modelo
- ✅ Variações por tecido, cor e tamanho integradas ao sistema
- ✅ Modal intuitivo com preview das variações a serem criadas
- ✅ Manutenção da estrutura de custos original
- ✅ Geração automática de novas referências

## Changelog

- July 01, 2025. Initial setup
- July 01, 2025. Fixed fabric image upload system - removed 500 character limit from code and database, images now display correctly in fabric cards
- July 02, 2025. Implemented complete pricing system with templates, PDF generation, and technical sheets - all templates are saved and displayed, PDFs are named correctly as "Resumo_REF_DATE" and "Ficha_REF_DATE"
- July 02, 2025. Enhanced template system with image positioning, complete data loading for edit/copy buttons, preview PDF capture, and custom keyboard shortcuts (Ctrl+F1/F3)
- July 02, 2025. Comprehensive system improvements: fixed all bugs, implemented toast notifications, confirmation dialogs, smart caching, loading states, form validation, analytics dashboard, backup system, and delete functionality
- July 02, 2025. Integrated pricing templates with models module - templates now appear in models section with full CRUD operations and statistics
- July 02, 2025. Unified Pricing and Models into single integrated module "Modelos & Precificação" - eliminated redundancy, improved UX with unified interface, advanced search/filters, and seamless workflow from pricing to model management
- July 02, 2025. Documented comprehensive roadmap with 12 major feature categories pending implementation
- July 02, 2025. Implemented 4 major new modules: Advanced Simulations (fabric comparison, reverse markup, price projections), Employee Management (tasks, performance tracking), Financial Management (complete cash flow, budgets, DRE), and Inventory Management (supplies, predictions, categories) - significantly expanding system capabilities
- July 02, 2025. Finalized critical production modules: Advanced Production with factory management, loss tracking and weekly analytics; Document Center with complete file management by model; Model duplication with automatic variations system - completing the core business functionality

## User Preferences

Preferred communication style: Simple, everyday language.