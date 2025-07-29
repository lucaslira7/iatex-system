import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// Configuração para diferentes ambientes
let db: any;
let pool: any = null;

if (process.env.SUPABASE_DATABASE_URL) {
  // Usar Supabase PostgreSQL
  console.log("🔗 Conectando ao Supabase PostgreSQL");
  pool = new Pool({ connectionString: process.env.SUPABASE_DATABASE_URL });
  db = drizzle({ client: pool, schema });
} else if (process.env.DATABASE_URL) {
  // Usar DATABASE_URL (Railway, Render, etc.)
  console.log("🔗 Conectando ao banco PostgreSQL");
  pool = new Pool({ connectionString: process.env.DATABASE_URL });
  db = drizzle({ client: pool, schema });
} else {
  // Em produção, exigir banco configurado
  if (process.env.NODE_ENV === 'production') {
    throw new Error("DATABASE_URL ou SUPABASE_DATABASE_URL deve ser configurado em produção");
  }

  // Em desenvolvimento, usar mock database
  console.log("⚠️  Nenhum banco configurado. Usando mock database para desenvolvimento.");
  db = {
    // Mock database para desenvolvimento local
    query: async () => ({ rows: [] }),
    execute: async () => ({ rows: [] }),
    transaction: async (fn: any) => fn(db),
  };
  pool = null;
}

export { db, pool };