import { db } from '../server/db';
import { sql } from 'drizzle-orm';
import { generateCustomID } from '../shared/utils/generateCustomID';

console.log('🔧 Configurando IA.TEX...');

async function setupSystem() {
    try {
        console.log('📡 Testando conexão com Supabase...');

        // Teste de conexão
        const result = await db.execute(sql`SELECT NOW() as current_time`);
        console.log('✅ Conexão estabelecida:', result[0]);

        // Verificar tabelas existentes
        console.log('📋 Verificando tabelas...');
        const tables = await db.execute(sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

        console.log('📊 Tabelas encontradas:', tables.length);
        tables.forEach((table: any) => {
            console.log(`  - ${table.table_name}`);
        });

        // Testar geração de IDs
        console.log('🆔 Testando geração de IDs...');

        const testOrderID = await generateCustomID('PED', 'orders');
        const testClientID = await generateCustomID('CLI', 'clients');
        const testModelID = await generateCustomID('MOD', 'models');

        console.log('✅ IDs gerados:');
        console.log(`  - Pedido: ${testOrderID}`);
        console.log(`  - Cliente: ${testClientID}`);
        console.log(`  - Modelo: ${testModelID}`);

        // Verificar configurações do sistema
        console.log('⚙️ Verificando configurações...');

        const envVars = {
            NODE_ENV: process.env.NODE_ENV,
            SUPABASE_URL: process.env.SUPABASE_URL ? '✅ Configurado' : '❌ Não configurado',
            SUPABASE_DATABASE_URL: process.env.SUPABASE_DATABASE_URL ? '✅ Configurado' : '❌ Não configurado',
            OPENAI_API_KEY: process.env.OPENAI_API_KEY ? '✅ Configurado' : '⚠️ Opcional',
            SESSION_SECRET: process.env.SESSION_SECRET ? '✅ Configurado' : '❌ Não configurado'
        };

        console.log('📝 Variáveis de ambiente:');
        Object.entries(envVars).forEach(([key, value]) => {
            console.log(`  - ${key}: ${value}`);
        });

        console.log('🎉 Setup concluído com sucesso!');
        console.log('');
        console.log('📋 Próximos passos:');
        console.log('  1. Configure as variáveis de ambiente no .env');
        console.log('  2. Execute: npm run dev');
        console.log('  3. Acesse: http://localhost:3000');
        console.log('  4. Para deploy: configure Vercel/Railway');

    } catch (error) {
        console.error('❌ Erro no setup:', error);
        process.exit(1);
    }
}

setupSystem(); 