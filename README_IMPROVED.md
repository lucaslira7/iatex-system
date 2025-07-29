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

## ⚙️ Configuração

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

# Build
npm run build:all

# Testes
npm run test:connection
npm run init:supabase

# Deploy
npm start
```

## 🏗️ Estrutura do Projeto

```
iatex-system/
├── client/              # Frontend React + Vite
├── server/              # Backend Express + TypeScript
├── shared/              # Schemas e tipos compartilhados
├── scripts/             # Scripts de inicialização
├── env.example          # Template de variáveis
└── README.md           # Documentação
```

## 🔧 Tecnologias

- **Frontend:** React 18 + TypeScript + Vite + Tailwind + Shadcn/ui
- **Backend:** Express + TypeScript + Drizzle ORM
- **Banco:** Supabase PostgreSQL
- **Deploy:** Vercel (Frontend) + Railway (Backend)
- **IA:** OpenAI GPT-4

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

## 🔍 Health Check

Teste a saúde do sistema:
```bash
curl https://seu-dominio.vercel.app/api/health
```

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique os logs do deploy
2. Teste a conexão: `npm run test:connection`
3. Inicialize o Supabase: `npm run init:supabase`

---

**🎉 Sistema pronto para produção!** 