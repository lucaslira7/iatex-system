import { db } from '../../server/db';
import { sql } from 'drizzle-orm';

/**
 * Gera IDs únicos no formato: PREFIX + YYYYMMDD + contador diário
 * Exemplo: PED20250729001, CLI20250729001, MOD20250729001
 */
export const generateCustomID = async (
    prefix: string,
    tableName: string,
    idColumn: string = 'id'
): Promise<string> => {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const searchPattern = `${prefix}${dateStr}%`;

    try {
        // Buscar o último ID do dia usando SQL direto para maior flexibilidade
        const result = await db.execute(sql`
      SELECT ${sql.identifier(idColumn)} 
      FROM ${sql.identifier(tableName)} 
      WHERE ${sql.identifier(idColumn)} LIKE ${searchPattern}
      ORDER BY ${sql.identifier(idColumn)} DESC 
      LIMIT 1
    `);

        let sequence = 1;

        if (result && result.length > 0) {
            const lastId = result[0][idColumn] as string;
            const lastSequence = parseInt(lastId.slice(-3));
            sequence = lastSequence + 1;
        }

        return `${prefix}${dateStr}${String(sequence).padStart(3, '0')}`;

    } catch (error) {
        console.error(`Erro ao gerar ID para ${tableName}:`, error);
        // Fallback: usar timestamp se houver erro
        const timestamp = Date.now().toString().slice(-6);
        return `${prefix}${dateStr}${timestamp}`;
    }
};

// Funções específicas para cada tipo de entidade
export const generateOrderID = () => generateCustomID('PED', 'orders');
export const generateClientID = () => generateCustomID('CLI', 'clients');
export const generateModelID = () => generateCustomID('MOD', 'models');
export const generateFabricID = () => generateCustomID('TEC', 'fabrics');
export const generateSupplierID = () => generateCustomID('FOR', 'suppliers');
export const generateQuotationID = () => generateCustomID('COT', 'quotations');

// Função para validar formato de ID
export const validateCustomID = (id: string, prefix: string): boolean => {
    const pattern = new RegExp(`^${prefix}\\d{11}$`);
    return pattern.test(id);
};

// Função para extrair informações do ID
export const parseCustomID = (id: string) => {
    const prefix = id.slice(0, 3);
    const dateStr = id.slice(3, 11);
    const sequence = parseInt(id.slice(11));

    const year = parseInt(dateStr.slice(0, 4));
    const month = parseInt(dateStr.slice(4, 6));
    const day = parseInt(dateStr.slice(6, 8));

    return {
        prefix,
        date: new Date(year, month - 1, day),
        sequence,
        isValid: validateCustomID(id, prefix)
    };
}; 