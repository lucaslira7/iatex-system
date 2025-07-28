# 🚀 GUIA COMPLETO DE DEPLOY - IA.TEX COM SUPABASE

## 📋 **OPÇÕES DE DEPLOY RECOMENDADAS**

### **🥇 1. Railway (Mais Fácil)**
- Deploy automático do GitHub
- Banco PostgreSQL incluído
- SSL gratuito
- Domínio personalizado
- **Preço:** $5/mês (500 horas gratuitas)

### **🥈 2. Render**
- Deploy full-stack
- PostgreSQL incluído
- SSL gratuito
- **Preço:** $7/mês (750 horas gratuitas)

### **🥉 3. Vercel + Supabase**
- Frontend no Vercel
- Backend como serverless functions
- Supabase para banco e autenticação
- **Preço:** Gratuito (com limitações)

---

## 🔧 **CONFIGURAÇÃO DO SUPABASE**

### **1. Criar Projeto no Supabase**
1. Acesse [supabase.com](https://supabase.com)
2. Clique em "New Project"
3. Escolha sua organização
4. Digite nome do projeto: `iatex-system`
5. Escolha uma senha forte para o banco
6. Escolha região mais próxima (São Paulo)
7. Clique em "Create new project"

### **2. Configurar Banco de Dados**
1. No dashboard do Supabase, vá em **SQL Editor**
2. Execute o script de criação das tabelas:

```sql
-- Executar no SQL Editor do Supabase
-- Este script cria todas as tabelas necessárias

-- Habilitar extensões
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de sessões
CREATE TABLE IF NOT EXISTS sessions (
  sid VARCHAR PRIMARY KEY,
  sess JSONB NOT NULL,
  expire TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS IDX_session_expire ON sessions(expire);

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR PRIMARY KEY NOT NULL,
  email VARCHAR UNIQUE,
  first_name VARCHAR,
  last_name VARCHAR,
  profile_image_url VARCHAR,
  role VARCHAR DEFAULT 'user',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de fornecedores
CREATE TABLE IF NOT EXISTS suppliers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  contact VARCHAR(255),
  phone VARCHAR(50),
  email VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de tecidos
CREATE TABLE IF NOT EXISTS fabrics (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(100) NOT NULL,
  composition TEXT,
  gram_weight INTEGER NOT NULL,
  usable_width INTEGER NOT NULL,
  price_per_kg DECIMAL(10,2) NOT NULL,
  price_per_meter DECIMAL(10,2),
  current_stock DECIMAL(10,2) NOT NULL,
  yield_estimate DECIMAL(10,4),
  supplier_id INTEGER REFERENCES suppliers(id),
  image_url TEXT,
  status VARCHAR(50) DEFAULT 'available',
  created_by VARCHAR REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de tipos de peças
CREATE TABLE IF NOT EXISTS garment_types (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  icon VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de modelos
CREATE TABLE IF NOT EXISTS models (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  reference VARCHAR(100) UNIQUE NOT NULL,
  garment_type_id INTEGER REFERENCES garment_types(id),
  fabric_id INTEGER REFERENCES fabrics(id),
  description TEXT,
  image_url VARCHAR(500),
  is_template BOOLEAN DEFAULT FALSE,
  is_external_production BOOLEAN DEFAULT FALSE,
  status VARCHAR(50) DEFAULT 'draft',
  created_by VARCHAR REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de pesos dos modelos por tamanho
CREATE TABLE IF NOT EXISTS model_weights (
  id SERIAL PRIMARY KEY,
  model_id INTEGER REFERENCES models(id) ON DELETE CASCADE,
  size VARCHAR(10) NOT NULL,
  weight_grams INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de custos dos modelos
CREATE TABLE IF NOT EXISTS model_costs (
  id SERIAL PRIMARY KEY,
  model_id INTEGER REFERENCES models(id) ON DELETE CASCADE,
  cost_type VARCHAR(50) NOT NULL,
  cost_value DECIMAL(10,2) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de categorias de custo
CREATE TABLE IF NOT EXISTS cost_categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de clientes
CREATE TABLE IF NOT EXISTS clients (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  cpf_cnpj VARCHAR(20),
  created_by VARCHAR REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de pedidos
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  client_id INTEGER REFERENCES clients(id),
  order_number VARCHAR(50) UNIQUE NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  total_value DECIMAL(10,2),
  delivery_date DATE,
  notes TEXT,
  created_by VARCHAR REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de itens do pedido
CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
  model_id INTEGER REFERENCES models(id),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2),
  total_price DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de cotações
CREATE TABLE IF NOT EXISTS quotations (
  id SERIAL PRIMARY KEY,
  client_id INTEGER REFERENCES clients(id),
  quotation_number VARCHAR(50) UNIQUE NOT NULL,
  status VARCHAR(50) DEFAULT 'draft',
  total_value DECIMAL(10,2),
  valid_until DATE,
  notes TEXT,
  created_by VARCHAR REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de itens da cotação
CREATE TABLE IF NOT EXISTS quotation_items (
  id SERIAL PRIMARY KEY,
  quotation_id INTEGER REFERENCES quotations(id) ON DELETE CASCADE,
  model_id INTEGER REFERENCES models(id),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2),
  total_price DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de tamanhos dos itens da cotação
CREATE TABLE IF NOT EXISTS quotation_item_sizes (
  id SERIAL PRIMARY KEY,
  quotation_item_id INTEGER REFERENCES quotation_items(id) ON DELETE CASCADE,
  size VARCHAR(10) NOT NULL,
  quantity INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de custos dos itens da cotação
CREATE TABLE IF NOT EXISTS quotation_item_costs (
  id SERIAL PRIMARY KEY,
  quotation_item_id INTEGER REFERENCES quotation_items(id) ON DELETE CASCADE,
  cost_type VARCHAR(50) NOT NULL,
  cost_value DECIMAL(10,2) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de templates de precificação
CREATE TABLE IF NOT EXISTS pricing_templates (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_by VARCHAR REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de tamanhos dos templates
CREATE TABLE IF NOT EXISTS pricing_template_sizes (
  id SERIAL PRIMARY KEY,
  template_id INTEGER REFERENCES pricing_templates(id) ON DELETE CASCADE,
  size VARCHAR(10) NOT NULL,
  weight_grams INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de custos dos templates
CREATE TABLE IF NOT EXISTS pricing_template_costs (
  id SERIAL PRIMARY KEY,
  template_id INTEGER REFERENCES pricing_templates(id) ON DELETE CASCADE,
  cost_type VARCHAR(50) NOT NULL,
  cost_value DECIMAL(10,2) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de contas
CREATE TABLE IF NOT EXISTS accounts (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  balance DECIMAL(10,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de transações
CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  account_id INTEGER REFERENCES accounts(id),
  type VARCHAR(50) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  created_by VARCHAR REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de orçamentos
CREATE TABLE IF NOT EXISTS budgets (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  spent DECIMAL(10,2) DEFAULT 0,
  period_start DATE,
  period_end DATE,
  created_by VARCHAR REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de categorias de suprimentos
CREATE TABLE IF NOT EXISTS supplies_categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de suprimentos
CREATE TABLE IF NOT EXISTS supplies (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category_id INTEGER REFERENCES supplies_categories(id),
  unit VARCHAR(50) NOT NULL,
  current_stock DECIMAL(10,2) DEFAULT 0,
  minimum_stock DECIMAL(10,2) DEFAULT 0,
  unit_price DECIMAL(10,2),
  supplier_id INTEGER REFERENCES suppliers(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de movimentações de estoque
CREATE TABLE IF NOT EXISTS stock_movements (
  id SERIAL PRIMARY KEY,
  supply_id INTEGER REFERENCES supplies(id),
  type VARCHAR(50) NOT NULL,
  quantity DECIMAL(10,2) NOT NULL,
  unit_price DECIMAL(10,2),
  total_value DECIMAL(10,2),
  notes TEXT,
  created_by VARCHAR REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de etapas de produção
CREATE TABLE IF NOT EXISTS production_stages (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  estimated_duration_hours INTEGER,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de produção em facção
CREATE TABLE IF NOT EXISTS factory_production (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id),
  stage_id INTEGER REFERENCES production_stages(id),
  status VARCHAR(50) DEFAULT 'pending',
  start_date DATE,
  end_date DATE,
  quantity INTEGER,
  notes TEXT,
  created_by VARCHAR REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de documentos
CREATE TABLE IF NOT EXISTS documents (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  file_url TEXT,
  file_size INTEGER,
  mime_type VARCHAR(100),
  created_by VARCHAR REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Inserir dados iniciais
INSERT INTO garment_types (name, icon) VALUES 
('Camiseta', 'tshirt'),
('Calça', 'pants'),
('Vestido', 'dress'),
('Jaqueta', 'jacket'),
('Blusa', 'blouse'),
('Shorts', 'shorts'),
('Saia', 'skirt'),
('Terno', 'suit'),
('Uniforme', 'uniform'),
('Outros', 'other')
ON CONFLICT DO NOTHING;

INSERT INTO cost_categories (name, description) VALUES 
('Tecido', 'Custos relacionados a tecidos'),
('Mão de Obra', 'Custos de produção'),
('Aviamentos', 'Botões, zíperes, linhas'),
('Custos Fixos', 'Overhead e despesas gerais'),
('Embalagem', 'Embalagem e etiquetas'),
('Transporte', 'Custos de logística'),
('Marketing', 'Custos de divulgação'),
('Administrativo', 'Custos administrativos')
ON CONFLICT DO NOTHING;

INSERT INTO supplies_categories (name, description) VALUES 
('Linhas', 'Linhas de costura'),
('Botões', 'Botões diversos'),
('Zíperes', 'Zíperes e fechos'),
('Elásticos', 'Elásticos e elásticos'),
('Etiquetas', 'Etiquetas e tags'),
('Embalagem', 'Materiais de embalagem'),
('Ferramentas', 'Ferramentas de costura'),
('Outros', 'Outros materiais')
ON CONFLICT DO NOTHING;

INSERT INTO production_stages (name, description, estimated_duration_hours) VALUES 
('Corte', 'Corte dos tecidos', 2),
('Costura', 'Costura das peças', 4),
('Acabamento', 'Acabamento final', 1),
('Qualidade', 'Controle de qualidade', 1),
('Embalagem', 'Embalagem para entrega', 0.5)
ON CONFLICT DO NOTHING;
```

### **3. Obter Credenciais do Supabase**
1. No dashboard, vá em **Settings** > **Database**
2. Copie a **Connection string** (URI)
3. Vá em **Settings** > **API**
4. Copie a **URL** e **anon key**

---

## 🚀 **DEPLOY NO RAILWAY (RECOMENDADO)**

### **1. Preparar o Repositório**
1. Crie um repositório no GitHub
2. Faça push do código
3. Certifique-se de que o `package.json` está correto

### **2. Deploy no Railway**
1. Acesse [railway.app](https://railway.app)
2. Faça login com GitHub
3. Clique em "New Project"
4. Escolha "Deploy from GitHub repo"
5. Selecione seu repositório
6. Clique em "Deploy Now"

### **3. Configurar Variáveis de Ambiente**
1. No projeto Railway, vá em **Variables**
2. Adicione as seguintes variáveis:

```env
SUPABASE_DATABASE_URL=postgresql://postgres:[SUA-SENHA]@db.[SEU-PROJETO].supabase.co:5432/postgres
SUPABASE_URL=https://[SEU-PROJETO].supabase.co
SUPABASE_ANON_KEY=[SUA-ANON-KEY]
SUPABASE_SERVICE_ROLE_KEY=[SUA-SERVICE-ROLE-KEY]
SESSION_SECRET=sua-chave-secreta-super-segura
NODE_ENV=production
PORT=3000
```

### **4. Configurar Domínio**
1. No Railway, vá em **Settings**
2. Em **Domains**, clique em "Generate Domain"
3. Ou configure um domínio personalizado

---

## 🌐 **DEPLOY NO RENDER**

### **1. Criar Conta**
1. Acesse [render.com](https://render.com)
2. Faça login com GitHub

### **2. Criar Web Service**
1. Clique em "New" > "Web Service"
2. Conecte seu repositório GitHub
3. Configure:
   - **Name:** iatex-system
   - **Environment:** Node
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`

### **3. Configurar Banco PostgreSQL**
1. Clique em "New" > "PostgreSQL"
2. Configure o banco
3. Copie a **Internal Database URL**

### **4. Configurar Variáveis**
1. No web service, vá em **Environment**
2. Adicione as variáveis de ambiente

---

## 🔧 **CONFIGURAÇÃO LOCAL COM SUPABASE**

### **1. Criar arquivo .env**
```bash
# Copie o arquivo env.example
cp env.example .env
```

### **2. Configurar variáveis**
Edite o arquivo `.env` com suas credenciais do Supabase:

```env
SUPABASE_DATABASE_URL=postgresql://postgres:[SUA-SENHA]@db.[SEU-PROJETO].supabase.co:5432/postgres
SUPABASE_URL=https://[SEU-PROJETO].supabase.co
SUPABASE_ANON_KEY=[SUA-ANON-KEY]
SUPABASE_SERVICE_ROLE_KEY=[SUA-SERVICE-ROLE-KEY]
SESSION_SECRET=sua-chave-secreta-local
NODE_ENV=development
PORT=3000
```

### **3. Executar localmente**
```bash
npm run dev
```

---

## 📱 **CONFIGURAÇÃO PWA**

### **1. Atualizar manifest.json**
Edite `public/manifest.json`:

```json
{
  "name": "IA.TEX - Sistema de Gestão Têxtil",
  "short_name": "IA.TEX",
  "description": "Sistema completo de gestão para confecções",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#2563eb",
  "icons": [
    {
      "src": "/pwa-icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/pwa-icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### **2. Configurar Service Worker**
O arquivo `public/sw.js` já está configurado para cache offline.

---

## 🔒 **SEGURANÇA E PRODUÇÃO**

### **1. Configurações de Segurança**
- Use HTTPS em produção
- Configure CORS adequadamente
- Use variáveis de ambiente para senhas
- Implemente rate limiting

### **2. Backup Automático**
- Supabase faz backup automático
- Configure backup adicional se necessário

### **3. Monitoramento**
- Use logs do Railway/Render
- Configure alertas de erro
- Monitore performance

---

## 📊 **TESTE DO SISTEMA**

### **1. Teste Local**
```bash
npm run dev
# Acesse http://localhost:3000
```

### **2. Teste de Produção**
1. Faça deploy
2. Acesse a URL fornecida
3. Teste todas as funcionalidades
4. Verifique PWA

### **3. Checklist de Teste**
- [ ] Login/Autenticação
- [ ] Dashboard carrega
- [ ] Cadastro de tecidos
- [ ] Precificação funciona
- [ ] PWA instala
- [ ] Responsividade mobile
- [ ] Geração de PDFs
- [ ] Upload de imagens

---

## 🆘 **SOLUÇÃO DE PROBLEMAS**

### **Erro de Conexão com Banco**
- Verifique `SUPABASE_DATABASE_URL`
- Confirme se o projeto está ativo
- Verifique se as tabelas foram criadas

### **Erro de Autenticação**
- Verifique as chaves do Supabase
- Confirme se o domínio está autorizado
- Verifique logs do servidor

### **PWA não funciona**
- Verifique se HTTPS está ativo
- Confirme se o manifest.json está correto
- Verifique se o service worker está sendo servido

---

## 💰 **CUSTOS ESTIMADOS**

### **Railway**
- **Desenvolvimento:** Gratuito (500h/mês)
- **Produção:** $5/mês

### **Supabase**
- **Desenvolvimento:** Gratuito
- **Produção:** $25/mês (recomendado)

### **Total Estimado:** $30/mês para produção

---

## 🎯 **PRÓXIMOS PASSOS**

1. **Configure o Supabase** seguindo o guia
2. **Escolha uma plataforma** (Railway recomendado)
3. **Faça o deploy** seguindo as instruções
4. **Teste todas as funcionalidades**
5. **Configure domínio personalizado**
6. **Implemente backup adicional**
7. **Configure monitoramento**

O sistema estará pronto para uso em produção! 🚀 