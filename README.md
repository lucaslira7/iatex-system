# 🎯 IA.TEX - Sistema Completo de Gestão Têxtil

Sistema inteligente para gestão completa de produção têxtil, com IA integrada e deploy otimizado.

## 🚀 Deploy Rápido

### **Opção 1: Vercel (Recomendado)**
```bash
# 1. Acesse: https://vercel.com
# 2. Conecte seu repositório GitHub
# 3. Configure as variáveis de ambiente
# 4. Deploy automático!
```

### **Opção 2: Railway**
```bash
# 1. Acesse: https://railway.app
# 2. Conecte seu repositório GitHub
# 3. Configure as variáveis de ambiente
# 4. Deploy automático!
```

## ⚙️ Configuração Completa

### **1. Variáveis de Ambiente**
Copie `env.example` para `.env` e configure:

```env
# Supabase (Banco de Dados)
SUPABASE_DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres
SUPABASE_URL=https://[PROJECT].supabase.co
SUPABASE_ANON_KEY=[YOUR-ANON-KEY]
SUPABASE_SERVICE_ROLE_KEY=[YOUR-SERVICE-ROLE-KEY]

# Servidor
NODE_ENV=production
PORT=3000
SESSION_SECRET=iatex-session-secret-2024-prod

# IA (Opcional)
OPENAI_API_KEY=[YOUR-OPENAI-API-KEY]
```

### **2. Scripts Disponíveis**
```bash
# Desenvolvimento
npm run dev

# Setup e Configuração
npm run setup          # Configuração inicial
npm run seed           # Dados de teste
npm run status         # Verificar status do sistema

# Build e Deploy
npm run build:all
npm start

# Testes e Verificação
npm run test:connection
npm run init:supabase
```

## 🏗️ Estrutura do Projeto

```
iatex-system/
├── client/              # Frontend React + Vite
├── server/              # Backend Express + TypeScript
├── shared/              # Schemas e tipos compartilhados
│   ├── schema.ts        # Definição das tabelas
│   └── utils/           # Utilitários compartilhados
│       ├── generateId.ts        # Geração de IDs antiga
│       └── generateCustomID.ts  # Geração de IDs nova
├── scripts/             # Scripts de inicialização
│   ├── setup.ts         # Setup inicial
│   ├── seed.ts          # Dados de teste
│   ├── status.ts        # Painel de status
│   ├── initSupabase.ts  # Inicialização Supabase
│   └── testConnection.ts # Teste de conexão
├── env.example          # Template de variáveis
├── turbo.json           # Configuração TurboRepo
└── README.md           # Documentação
```

## 🔧 Tecnologias

- **Frontend:** React 18 + TypeScript + Vite + Tailwind + Shadcn/ui
- **Backend:** Express + TypeScript + Drizzle ORM
- **Banco:** Supabase PostgreSQL
- **Deploy:** Vercel (Frontend) + Railway (Backend)
- **IA:** OpenAI GPT-4
- **Monorepo:** TurboRepo

## 📱 Funcionalidades

- ✅ **Gestão de Tecidos** - Cadastro e controle de estoque
- ✅ **Modelos** - Criação e gerenciamento de peças
- ✅ **Pedidos** - Sistema completo de pedidos
- ✅ **Clientes** - Gestão de clientes
- ✅ **Produção** - Controle de produção
- ✅ **Relatórios** - Analytics e insights
- ✅ **IA Integrada** - Sugestões inteligentes
- ✅ **PWA** - Aplicativo mobile

## 🎯 Geração de IDs Únicos

O sistema gera automaticamente IDs únicos baseados na data:

- **Pedidos:** `PED20250729001`
- **Clientes:** `CLI20250729001`
- **Modelos:** `MOD20250729001`
- **Tecidos:** `TEC20250729001`
- **Fornecedores:** `FOR20250729001`
- **Cotações:** `COT20250729001`

### **Função Genérica:**
```typescript
import { generateCustomID } from '../shared/utils/generateCustomID';

// Gerar ID para qualquer entidade
const orderId = await generateCustomID('PED', 'orders');
const clientId = await generateCustomID('CLI', 'clients');
```

## 🔍 Health Check e Status

### **Painel de Status:**
```bash
npm run status
```

### **Health Check API:**
```bash
curl https://seu-dominio.vercel.app/api/health
```

### **Teste de Conexão:**
```bash
npm run test:connection
```

## 📊 Setup Inicial

### **1. Configuração Completa:**
```bash
# Clone o repositório
git clone https://github.com/seu-usuario/iatex-system.git
cd iatex-system

# Instale dependências
npm install

# Configure variáveis de ambiente
cp env.example .env
# Edite o .env com suas credenciais

# Setup inicial
npm run setup

# Popule dados de teste (opcional)
npm run seed

# Verifique o status
npm run status

# Inicie o desenvolvimento
npm run dev
```

### **2. Verificação de Status:**
O comando `npm run status` verifica:
- ✅ Conexão com Supabase
- ✅ Tabelas existentes
- ✅ Variáveis de ambiente
- ✅ Geração de IDs
- ✅ Contadores do dia
- ✅ Dados de exemplo

## 🚀 Deploy em Produção

### **Vercel (Frontend):**
1. Conecte o repositório no Vercel
2. Configure as variáveis de ambiente
3. Deploy automático

### **Railway (Backend):**
1. Conecte o repositório no Railway
2. Configure as variáveis de ambiente
3. Deploy automático

### **Supabase (Banco):**
1. Crie um projeto no Supabase
2. Configure as tabelas via Drizzle
3. Configure RLS (Row-Level Security)

## 📞 Suporte

Para dúvidas ou problemas:

1. **Verifique o status:** `npm run status`
2. **Teste a conexão:** `npm run test:connection`
3. **Configure o setup:** `npm run setup`
4. **Verifique os logs** do deploy

## 🎯 Checklist Final

- [ ] Sistema funcionando localmente (`npm run dev`)
- [ ] Scripts de inicialização prontos (`npm run setup`)
- [ ] Supabase configurado com tabelas
- [ ] Geração de IDs funcionando
- [ ] Tipos TypeScript consistentes
- [ ] Deploy configurado (Vercel/Railway)

---

**🎉 Sistema pronto para produção!**

**IA.TEX** - Transformando a gestão têxtil com tecnologia e inovação 🚀
