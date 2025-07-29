import { db } from '../server/db';
import { sql } from 'drizzle-orm';
import { generateCustomID } from '../shared/utils/generateCustomID';

console.log('📊 IA.TEX - Painel de Status do Sistema');
console.log('=====================================');

async function checkSystemStatus() {
    const status = {
        database: false,
        tables: 0,
        environment: {} as Record<string, string>,
        idGeneration: false,
        api: false
    };

    try {
        // 1. Verificar conexão com banco
        console.log('🔍 1. Verificando conexão com Supabase...');
        const dbResult = await db.execute(sql`SELECT NOW() as current_time`);
        status.database = true;
        console.log('✅ Banco de dados: CONECTADO');
        console.log(`   Última verificação: ${dbResult[0].current_time}`);

        // 2. Verificar tabelas
        console.log('\n📋 2. Verificando tabelas...');
        const tables = await db.execute(sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
        status.tables = tables.length;
        console.log(`✅ Tabelas encontradas: ${tables.length}`);

        const tableNames = tables.map((t: any) => t.table_name);
        console.log('   Tabelas:', tableNames.join(', '));

        // 3. Verificar variáveis de ambiente
        console.log('\n⚙️ 3. Verificando configurações...');
        const envVars = {
            'NODE_ENV': process.env.NODE_ENV || '❌ Não definido',
            'SUPABASE_URL': process.env.SUPABASE_URL ? '✅ Configurado' : '❌ Não configurado',
            'SUPABASE_DATABASE_URL': process.env.SUPABASE_DATABASE_URL ? '✅ Configurado' : '❌ Não configurado',
            'SUPABASE_ANON_KEY': process.env.SUPABASE_ANON_KEY ? '✅ Configurado' : '❌ Não configurado',
            'SESSION_SECRET': process.env.SESSION_SECRET ? '✅ Configurado' : '❌ Não configurado',
            'OPENAI_API_KEY': process.env.OPENAI_API_KEY ? '✅ Configurado' : '⚠️ Opcional',
            'PORT': process.env.PORT || '3000 (padrão)'
        };

        status.environment = envVars;

        Object.entries(envVars).forEach(([key, value]) => {
            console.log(`   ${key}: ${value}`);
        });

        // 4. Testar geração de IDs
        console.log('\n🆔 4. Testando geração de IDs...');
        try {
            const testOrderID = await generateCustomID('PED', 'orders');
            const testClientID = await generateCustomID('CLI', 'clients');
            status.idGeneration = true;
            console.log('✅ Geração de IDs: FUNCIONANDO');
            console.log(`   Exemplo Pedido: ${testOrderID}`);
            console.log(`   Exemplo Cliente: ${testClientID}`);
        } catch (error) {
            console.log('❌ Geração de IDs: ERRO');
            console.log(`   Erro: ${error}`);
        }

        // 5. Verificar contadores do dia
        console.log('\n📈 5. Verificando contadores do dia...');
        const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');

        const orderCount = await db.execute(sql`
      SELECT COUNT(*) as count FROM orders 
      WHERE id LIKE ${`PED${today}%`}
    `);

        const clientCount = await db.execute(sql`
      SELECT COUNT(*) as count FROM clients 
      WHERE id LIKE ${`CLI${today}%`}
    `);

        console.log(`   Pedidos hoje: ${orderCount[0].count}`);
        console.log(`   Clientes hoje: ${clientCount[0].count}`);

        // 6. Verificar dados de exemplo
        console.log('\n📊 6. Verificando dados de exemplo...');
        const fabricCount = await db.execute(sql`SELECT COUNT(*) as count FROM fabrics`);
        const supplierCount = await db.execute(sql`SELECT COUNT(*) as count FROM suppliers`);
        const modelCount = await db.execute(sql`SELECT COUNT(*) as count FROM models`);

        console.log(`   Tecidos: ${fabricCount[0].count}`);
        console.log(`   Fornecedores: ${supplierCount[0].count}`);
        console.log(`   Modelos: ${modelCount[0].count}`);

        // 7. Resumo final
        console.log('\n🎯 RESUMO DO SISTEMA');
        console.log('==================');
        console.log(`📊 Banco de dados: ${status.database ? '✅ OK' : '❌ ERRO'}`);
        console.log(`📋 Tabelas: ${status.tables} encontradas`);
        console.log(`🆔 Geração de IDs: ${status.idGeneration ? '✅ OK' : '❌ ERRO'}`);
        console.log(`⚙️ Configurações: ${Object.values(envVars).filter(v => v.includes('✅')).length}/${Object.keys(envVars).length} configuradas`);

        const criticalErrors = [
            !status.database,
            !status.idGeneration,
            !process.env.SUPABASE_DATABASE_URL,
            !process.env.SESSION_SECRET
        ].filter(Boolean).length;

        if (criticalErrors === 0) {
            console.log('\n🎉 SISTEMA PRONTO PARA USO!');
            console.log('   Execute: npm run dev');
            console.log('   Acesse: http://localhost:3000');
        } else {
            console.log(`\n⚠️ ${criticalErrors} problema(s) crítico(s) encontrado(s)`);
            console.log('   Configure as variáveis de ambiente e tente novamente');
        }

    } catch (error) {
        console.error('\n❌ ERRO AO VERIFICAR SISTEMA:', error);
        console.log('\n🔧 SOLUÇÕES:');
        console.log('   1. Verifique se o Supabase está configurado');
        console.log('   2. Configure as variáveis de ambiente no .env');
        console.log('   3. Execute: npm run setup');
        process.exit(1);
    }
}

checkSystemStatus(); 