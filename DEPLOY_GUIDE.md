# 🚀 Guia de Deploy - IA.TEX

## **📋 Pré-requisitos**

- ✅ Conta no [Vercel](https://vercel.com)
- ✅ Conta no [Railway](https://railway.app)
- ✅ Conta no [Supabase](https://supabase.com)
- ✅ Repositório no GitHub

## **🎯 Estratégia de Deploy**

### **Frontend (Vercel)**
- React + Vite
- Build estático
- CDN global

### **Backend (Railway)**
- Express + TypeScript
- API REST
- Conectado ao Supabase

### **Banco de Dados (Supabase)**
- PostgreSQL
- Drizzle ORM
- RLS configurado

## **⚙️ Configuração do Supabase**

### **1. Criar Projeto**
1. Acesse [supabase.com](https://supabase.com)
2. Crie novo projeto
3. Anote as credenciais:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SUPABASE_DATABASE_URL`

### **2. Configurar Tabelas**
```bash
# Execute no Supabase SQL Editor
npm run db:push
```

## **🚀 Deploy no Vercel (Frontend)**

### **1. Conectar Repositório**
1. Acesse [vercel.com](https://vercel.com)
2. Clique em "New Project"
3. Conecte o repositório GitHub
4. Configure as variáveis de ambiente

### **2. Variáveis de Ambiente (Vercel)**
```env
NODE_ENV=production
SUPABASE_URL=https://[PROJECT].supabase.co
SUPABASE_ANON_KEY=[YOUR-ANON-KEY]
```

### **3. Configuração do Build**
- **Framework Preset:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

### **4. Deploy**
1. Clique em "Deploy"
2. Aguarde o build
3. URL será gerada automaticamente

## **🚂 Deploy no Railway (Backend)**

### **1. Conectar Repositório**
1. Acesse [railway.app](https://railway.app)
2. Clique em "New Project"
3. Conecte o repositório GitHub
4. Configure as variáveis de ambiente

### **2. Variáveis de Ambiente (Railway)**
```env
NODE_ENV=production
SUPABASE_DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres
SUPABASE_URL=https://[PROJECT].supabase.co
SUPABASE_ANON_KEY=[YOUR-ANON-KEY]
SUPABASE_SERVICE_ROLE_KEY=[YOUR-SERVICE-ROLE-KEY]
SESSION_SECRET=iatex-session-secret-2024-prod
OPENAI_API_KEY=[YOUR-OPENAI-API-KEY]
PORT=3000
```

### **3. Configuração do Build**
- **Build Command:** `npm run build:server`
- **Start Command:** `npm start`
- **Health Check:** `/api/health`

### **4. Deploy**
1. Clique em "Deploy"
2. Aguarde o build
3. URL será gerada automaticamente

## **🔗 Configurar CORS**

### **No Railway (Backend)**
```typescript
// server/index.ts
app.use(cors({
  origin: [
    'https://seu-app.vercel.app',
    'http://localhost:3000'
  ],
  credentials: true
}));
```

### **No Vercel (Frontend)**
```typescript
// client/src/lib/api.ts
const API_BASE = process.env.NODE_ENV === 'production' 
  ? 'https://seu-backend.railway.app' 
  : 'http://localhost:3000';
```

## **🧪 Testes Pós-Deploy**

### **1. Health Check**
```bash
# Testar backend
curl https://seu-backend.railway.app/api/health

# Testar frontend
curl https://seu-app.vercel.app
```

### **2. Testar Funcionalidades**
- ✅ Login/Autenticação
- ✅ CRUD de clientes
- ✅ CRUD de tecidos
- ✅ Geração de IDs únicos
- ✅ Relatórios

### **3. Verificar Logs**
- **Vercel:** Dashboard do projeto
- **Railway:** Aba "Deployments"

## **🔧 Troubleshooting**

### **Erro: Build Failed**
```bash
# Verificar dependências
npm install

# Verificar TypeScript
npm run check

# Verificar build local
npm run build:all
```

### **Erro: Database Connection**
```bash
# Verificar variáveis de ambiente
npm run status

# Testar conexão
npm run test:connection
```

### **Erro: CORS**
- Verificar configuração de CORS no backend
- Verificar URLs permitidas
- Verificar credenciais

## **📊 Monitoramento**

### **Vercel Analytics**
- Performance do frontend
- Erros de build
- Métricas de usuário

### **Railway Metrics**
- Performance do backend
- Uso de recursos
- Logs de erro

### **Supabase Dashboard**
- Queries do banco
- Performance
- Logs de autenticação

## **🔄 Deploy Automático**

### **GitHub Actions (Opcional)**
```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## **🎉 Sucesso!**

Após o deploy:
1. ✅ Frontend rodando no Vercel
2. ✅ Backend rodando no Railway
3. ✅ Banco conectado no Supabase
4. ✅ Sistema 100% funcional

**URLs finais:**
- **Frontend:** `https://seu-app.vercel.app`
- **Backend:** `https://seu-backend.railway.app`
- **API Health:** `https://seu-backend.railway.app/api/health` 