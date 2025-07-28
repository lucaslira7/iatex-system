# 🚀 PROMPT COMPLETO - SISTEMA IA.TEX OTIMIZADO

## 📋 CONTEXTO E OBJETIVO

Crie um sistema completo de gestão têxtil chamado **IA.TEX** que integre todos os processos de uma confecção, desde o cadastro de materiais até a entrega final. O sistema deve ser moderno, responsivo, otimizado para performance e seguir as melhores práticas de desenvolvimento.

---

## 🏗️ ARQUITETURA TÉCNICA

### **Stack Tecnológica**
- **Frontend:** React 18 + TypeScript + Vite
- **Backend:** Express.js + TypeScript
- **Banco de Dados:** PostgreSQL + Drizzle ORM
- **UI/UX:** Tailwind CSS + Radix UI + Shadcn/ui
- **Estado:** TanStack Query + React Hook Form
- **Roteamento:** Wouter
- **Autenticação:** Replit Auth
- **PWA:** Service Worker + Manifest
- **Deploy:** Railway/Replit

### **Estrutura de Pastas**
```
iatex/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/ (shadcn components)
│   │   │   ├── pricing/ (módulo de precificação)
│   │   │   ├── analytics/ (dashboard analytics)
│   │   │   └── modals/ (modais reutilizáveis)
│   │   ├── hooks/ (custom hooks)
│   │   ├── lib/ (utilitários)
│   │   ├── pages/ (páginas principais)
│   │   ├── context/ (contextos React)
│   │   └── types/ (tipos TypeScript)
│   ├── index.html
│   └── index.css
├── server/
│   ├── routes.ts
│   ├── db.ts
│   ├── cache.ts
│   └── index.ts
├── shared/
│   └── schema.ts
├── public/
│   ├── manifest.json
│   └── sw.js
└── package.json
```

---

## 🎯 MÓDULOS DO SISTEMA (12 Consolidados)

### **1. Dashboard Inteligente**
- Métricas em tempo real
- Gráficos interativos (Recharts)
- Cards customizáveis
- Notificações centralizadas
- Modo escuro/claro

### **2. Gestão de Tecidos**
- Cadastro completo de tecidos
- Controle de estoque
- Cálculo automático de preços
- Upload de imagens
- Integração com fornecedores

### **3. Modelos & Precificação**
- Cadastro de modelos
- Sistema de precificação em 10 etapas
- Templates reutilizáveis
- Cálculo automático de custos
- Geração de PDFs profissionais

### **4. Gestão de Pedidos**
- Cadastro de pedidos
- Status tracking
- Integração com clientes
- Cronograma de entrega
- Histórico completo

### **5. Produção Avançada**
- Controle de produção por facção
- Cronograma de produção
- Acompanhamento de etapas
- Gestão de qualidade
- Relatórios de produtividade

### **6. Gestão Financeira**
- Controle de receitas/despesas
- Fluxo de caixa
- Orçamentos
- Relatórios financeiros
- Integração com pedidos

### **7. Estoque Inteligente**
- Controle de insumos
- Alertas de estoque baixo
- Movimentações de estoque
- Categorização de produtos
- Relatórios de consumo

### **8. Analytics & Relatórios**
- Dashboard analítico
- Simulações de cenários
- Relatórios customizáveis
- Exportação de dados
- Métricas de performance

### **9. Operações & Cronograma**
- Planejamento operacional
- Cronograma de produção
- Gestão de recursos
- Otimização de processos
- Indicadores de performance

### **10. Gestão de Clientes**
- Cadastro de clientes
- Histórico de pedidos
- Gestão de relacionamento
- Segmentação de clientes
- Relatórios de vendas

### **11. Equipe & Usuários**
- Gestão de funcionários
- Controle de acesso
- Metas e performance
- Treinamentos
- Avaliações

### **12. Administração & Backup**
- Configurações do sistema
- Backup automático
- Exportação de dados
- Logs do sistema
- Manutenção

---

## 🎨 DESIGN SYSTEM

### **Paleta de Cores**
```css
:root {
  --primary: #2563eb;
  --primary-foreground: #ffffff;
  --secondary: #64748b;
  --secondary-foreground: #ffffff;
  --accent: #f59e0b;
  --accent-foreground: #ffffff;
  --background: #ffffff;
  --foreground: #0f172a;
  --card: #ffffff;
  --card-foreground: #0f172a;
  --border: #e2e8f0;
  --input: #e2e8f0;
  --ring: #2563eb;
  --destructive: #ef4444;
  --destructive-foreground: #ffffff;
}
```

### **Componentes UI**
- Usar Shadcn/ui como base
- Componentes customizados para casos específicos
- Responsividade mobile-first
- Animações suaves com Framer Motion
- Acessibilidade completa

---

## 🔧 FUNCIONALIDADES TÉCNICAS

### **Performance**
- Lazy loading de componentes
- Virtualização de listas grandes
- Cache inteligente com TanStack Query
- Compressão gzip no servidor
- Service Worker para cache offline

### **Segurança**
- Autenticação via Replit Auth
- Validação de dados com Zod
- Rate limiting
- Sanitização de inputs
- Headers de segurança

### **PWA Features**
- Instalação offline
- Push notifications
- Background sync
- App-like experience
- Manifest otimizado

### **Banco de Dados**
- Schema otimizado com Drizzle
- Índices para performance
- Relacionamentos bem definidos
- Migrations automáticas
- Backup automático

---

## 📱 RESPONSIVIDADE

### **Breakpoints**
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

### **Navegação**
- Sidebar colapsável no desktop
- Bottom navigation no mobile
- Gestos touch otimizados
- Keyboard navigation

---

## 🔄 FLUXO DE DADOS

### **Estado Global**
- TanStack Query para cache de dados
- React Context para estado local
- LocalStorage para preferências
- SessionStorage para dados temporários

### **API Design**
- RESTful endpoints
- Padrão de resposta consistente
- Error handling padronizado
- Rate limiting
- Caching headers

---

## 📊 MÓDULO DE PRECIFICAÇÃO (Destaque)

### **10 Etapas de Precificação**
1. **Modo de Precificação** - Custo real vs. Template
2. **Tipo de Peça** - Seleção da categoria
3. **Informações do Modelo** - Dados básicos
4. **Tamanhos** - Grade de tamanhos
5. **Tecido** - Seleção e quantidade
6. **Custos de Criação** - Desenvolvimento
7. **Insumos** - Aviamentos e materiais
8. **Mão de Obra** - Custos de produção
9. **Custos Fixos** - Overhead
10. **Revisão Final** - Resumo e ajustes

### **Cálculos Automáticos**
- Custo de tecido por peça
- Consumo de insumos
- Tempo de produção
- Margem de lucro
- Preço final

---

## 🚀 DEPLOY E INFRAESTRUTURA

### **Ambiente de Desenvolvimento**
- Hot reload com Vite
- TypeScript strict mode
- ESLint + Prettier
- Husky para pre-commit hooks

### **Deploy**
- Railway para produção
- Replit para desenvolvimento
- Variáveis de ambiente
- Logs centralizados
- Monitoramento

---

## 📋 IMPLEMENTAÇÃO DETALHADA

### **1. Setup Inicial**
```bash
npm create vite@latest iatex -- --template react-ts
cd iatex
npm install
```

### **2. Dependências Principais**
```json
{
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "express": "^4.21.2",
    "drizzle-orm": "^0.39.1",
    "@tanstack/react-query": "^5.60.5",
    "tailwindcss": "^3.4.17",
    "@radix-ui/react-*": "latest",
    "framer-motion": "^11.13.1",
    "wouter": "^3.3.5",
    "zod": "^3.24.2"
  }
}
```

### **3. Estrutura de Componentes**
- Componentes funcionais com hooks
- TypeScript strict
- Props tipadas
- Error boundaries
- Loading states

### **4. Sistema de Roteamento**
- Wouter para roteamento
- Lazy loading de páginas
- Protected routes
- 404 handling

### **5. Estado e Cache**
- TanStack Query para dados
- React Context para UI state
- LocalStorage para persistência
- Optimistic updates

---

## 🎯 CRITÉRIOS DE QUALIDADE

### **Código**
- TypeScript strict mode
- ESLint + Prettier
- Testes unitários
- Documentação inline
- Performance monitoring

### **UX/UI**
- Design system consistente
- Responsividade completa
- Acessibilidade (WCAG 2.1)
- Performance otimizada
- Feedback visual

### **Segurança**
- Input validation
- XSS protection
- CSRF protection
- Rate limiting
- Secure headers

---

## 🔮 SUGESTÕES DE MELHORIAS FUTURAS

### **1. Inteligência Artificial**
- **Assistente IA Avançado**: Integração com GPT-4 para sugestões de precificação, otimização de processos e análise de dados
- **Predição de Demanda**: Machine learning para prever tendências de vendas
- **Otimização de Estoque**: IA para sugerir reabastecimento ideal
- **Análise de Imagens**: Reconhecimento de tecidos via foto

### **2. Integrações Externas**
- **E-commerce**: Integração com Shopify, WooCommerce
- **ERP**: Conexão com sistemas como SAP, Oracle
- **Marketplace**: Integração com Mercado Livre, Amazon
- **Pagamentos**: Stripe, PayPal, PIX
- **Logística**: Correios, transportadoras

### **3. Mobile App Nativo**
- **React Native**: App nativo para iOS/Android
- **Push Notifications**: Alertas em tempo real
- **Offline Mode**: Funcionamento sem internet
- **QR Code Scanner**: Leitura de códigos de produtos
- **GPS Tracking**: Rastreamento de entregas

### **4. Analytics Avançados**
- **Business Intelligence**: Dashboards mais sofisticados
- **Relatórios Customizáveis**: Drag & drop para criar relatórios
- **Exportação Avançada**: PDF, Excel, Power BI
- **Métricas de Performance**: KPIs personalizados
- **Análise de Competidores**: Benchmarking

### **5. Automação**
- **Workflows Automatizados**: Zapier, Make.com
- **Email Marketing**: Integração com Mailchimp
- **Chatbot**: Atendimento automático
- **Backup Automático**: Cloud storage
- **Deploy Automático**: CI/CD pipeline

### **6. Colaboração**
- **Chat Interno**: Comunicação entre equipes
- **Compartilhamento de Arquivos**: Google Drive, Dropbox
- **Calendário Compartilhado**: Google Calendar
- **Videoconferência**: Zoom, Teams
- **Gestão de Projetos**: Trello, Asana

### **7. Compliance e Segurança**
- **LGPD**: Conformidade com proteção de dados
- **Certificações**: ISO 9001, 14001
- **Auditoria**: Logs detalhados
- **Backup Redundante**: Múltiplas localizações
- **Criptografia**: End-to-end encryption

### **8. Performance**
- **CDN**: Distribuição global de conteúdo
- **Microserviços**: Arquitetura escalável
- **Cache Redis**: Performance de consultas
- **Load Balancing**: Distribuição de carga
- **Monitoring**: APM, logs estruturados

### **9. Experiência do Usuário**
- **Onboarding Interativo**: Tutorial guiado
- **Gamificação**: Sistema de pontos e conquistas
- **Personalização**: Interface customizável
- **Acessibilidade**: Suporte completo a leitores de tela
- **Internacionalização**: Múltiplos idiomas

### **10. Inovação**
- **Blockchain**: Rastreabilidade de produtos
- **IoT**: Sensores em estoque
- **Realidade Aumentada**: Visualização 3D de produtos
- **Voice Commands**: Controle por voz
- **API Pública**: Marketplace de integrações

---

## 📝 CONSIDERAÇÕES FINAIS

Este sistema representa uma solução completa e moderna para gestão têxtil, com foco em:

1. **Simplicidade**: Interface intuitiva e fácil de usar
2. **Performance**: Otimização em todos os níveis
3. **Escalabilidade**: Arquitetura preparada para crescimento
4. **Manutenibilidade**: Código limpo e bem documentado
5. **Segurança**: Proteção de dados e usuários
6. **Flexibilidade**: Adaptável a diferentes necessidades

O sistema está pronto para produção e pode ser expandido conforme as necessidades do negócio evoluem. 