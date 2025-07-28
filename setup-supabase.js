#!/usr/bin/env node

/**
 * Script de configuração do IA.TEX com Supabase
 * Execute: node setup-supabase.js
 */

import fs from 'fs';
import path from 'path';
import readline from 'readline';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log(`
🚀 CONFIGURAÇÃO DO IA.TEX COM SUPABASE
=====================================

Este script vai te ajudar a configurar o sistema IA.TEX
para usar o Supabase como banco de dados.

`);

function question(prompt) {
    return new Promise((resolve) => {
        rl.question(prompt, resolve);
    });
}

async function setupSupabase() {
    try {
        console.log('📋 Vamos configurar o Supabase...\n');

        // Coletar informações do Supabase
        const supabaseUrl = await question('🔗 URL do seu projeto Supabase (ex: https://abc123.supabase.co): ');
        const supabaseAnonKey = await question('🔑 Chave anônima do Supabase: ');
        const supabaseServiceKey = await question('🔐 Chave de serviço do Supabase: ');
        const databasePassword = await question('🗄️ Senha do banco de dados Supabase: ');

        // Extrair project ref da URL
        const projectRef = supabaseUrl.replace('https://', '').replace('.supabase.co', '');

        // Construir DATABASE_URL
        const databaseUrl = `postgresql://postgres:${databasePassword}@db.${projectRef}.supabase.co:5432/postgres`;

        // Gerar SESSION_SECRET
        const sessionSecret = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

        // Criar conteúdo do .env
        const envContent = `# ========================================
# CONFIGURAÇÃO DO SISTEMA IA.TEX
# ========================================

# ========================================
# BANCO DE DADOS SUPABASE
# ========================================
SUPABASE_DATABASE_URL=${databaseUrl}
SUPABASE_URL=${supabaseUrl}
SUPABASE_ANON_KEY=${supabaseAnonKey}
SUPABASE_SERVICE_ROLE_KEY=${supabaseServiceKey}

# ========================================
# CONFIGURAÇÕES DO SERVIDOR
# ========================================
PORT=3000
SESSION_SECRET=${sessionSecret}
NODE_ENV=development

# ========================================
# IA E SERVIÇOS EXTERNOS (OPCIONAL)
# ========================================
# OPENAI_API_KEY=sk-[YOUR-OPENAI-KEY]

# ========================================
# CONFIGURAÇÕES DE EMAIL (OPCIONAL)
# ========================================
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=your-email@gmail.com
# SMTP_PASS=your-app-password
`;

        // Salvar arquivo .env
        fs.writeFileSync('.env', envContent);

        console.log('\n✅ Arquivo .env criado com sucesso!');
        console.log('\n📋 PRÓXIMOS PASSOS:');
        console.log('1. Execute o script SQL no Supabase SQL Editor');
        console.log('2. Execute: npm run dev');
        console.log('3. Acesse: http://localhost:3000');

        console.log('\n📁 Arquivo .env criado com as seguintes configurações:');
        console.log(`   - Supabase URL: ${supabaseUrl}`);
        console.log(`   - Database URL: ${databaseUrl.replace(databasePassword, '***')}`);
        console.log(`   - Session Secret: ${sessionSecret}`);

        console.log('\n🔒 IMPORTANTE:');
        console.log('- Mantenha o arquivo .env seguro');
        console.log('- Não compartilhe as chaves do Supabase');
        console.log('- Use variáveis de ambiente em produção');

    } catch (error) {
        console.error('❌ Erro durante a configuração:', error.message);
    } finally {
        rl.close();
    }
}

// Executar setup
setupSupabase(); 