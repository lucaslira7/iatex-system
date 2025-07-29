import { db } from '../../server/db';
import { orders, clients, models } from '../schema';
import { eq, desc, like } from 'drizzle-orm';

export const generateOrderId = async () => {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');

    // Buscar último número do dia
    const lastOrder = await db.query.orders.findFirst({
        where: like(orders.id, `PED${dateStr}%`),
        orderBy: [desc(orders.id)]
    });

    const sequence = lastOrder ?
        parseInt(lastOrder.id.slice(-3)) + 1 : 1;

    return `PED${dateStr}${String(sequence).padStart(3, '0')}`;
};

export const generateClientId = async () => {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');

    const lastClient = await db.query.clients.findFirst({
        where: like(clients.id, `CLI${dateStr}%`),
        orderBy: [desc(clients.id)]
    });

    const sequence = lastClient ?
        parseInt(lastClient.id.slice(-3)) + 1 : 1;

    return `CLI${dateStr}${String(sequence).padStart(3, '0')}`;
};

export const generateModelId = async () => {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');

    const lastModel = await db.query.models.findFirst({
        where: like(models.id, `MOD${dateStr}%`),
        orderBy: [desc(models.id)]
    });

    const sequence = lastModel ?
        parseInt(lastModel.id.slice(-3)) + 1 : 1;

    return `MOD${dateStr}${String(sequence).padStart(3, '0')}`;
}; 