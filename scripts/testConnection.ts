import { db } from '../server/db';

console.log('🧪 Testando conexões...');

async function testConnections() {
    try {
        // Teste 1: Conexão com Supabase
        console.log('📡 Teste 1: Conexão com Supabase...');
        const result = await db.execute('SELECT NOW() as current_time');
        console.log('✅ Supabase conectado:', result);

        // Teste 2: Verificar tabelas
        console.log('📋 Teste 2: Verificando tabelas...');
        const tables = await db.execute(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
        console.log('✅ Tabelas encontradas:', tables.length);

        // Teste 3: Testar API local (se estiver rodando)
        console.log('🌐 Teste 3: Testando API local...');
        try {
            const response = await fetch('http://localhost:3000/api/health');
            if (response.ok) {
                const data = await response.json();
                console.log('✅ API local funcionando:', data);
            } else {
                console.log('⚠️ API local não respondeu corretamente');
            }
        } catch (error) {
            console.log('⚠️ API local não está rodando (normal se não iniciou)');
        }

        console.log('🎉 Todos os testes concluídos!');

    } catch (error) {
        console.error('❌ Erro nos testes:', error);
        process.exit(1);
    }
}

testConnections(); 