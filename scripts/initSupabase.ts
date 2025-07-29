import { db } from '../server/db';

console.log('🔧 Inicializando Supabase...');

async function initSupabase() {
    try {
        // Verificar conexão
        console.log('📡 Testando conexão com Supabase...');
        const result = await db.execute('SELECT NOW()');
        console.log('✅ Conexão estabelecida:', result);

        // Criar tabelas se não existirem
        console.log('🏗️ Verificando tabelas...');

        // Verificar se as tabelas principais existem
        const tables = await db.execute(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);

        console.log('📋 Tabelas encontradas:', tables);
        console.log('✅ Supabase inicializado com sucesso!');

    } catch (error) {
        console.error('❌ Erro ao inicializar Supabase:', error);
        process.exit(1);
    }
}

initSupabase(); 