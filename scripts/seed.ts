import { db } from '../server/db';
import { suppliers, fabrics, garmentTypes, models, clients } from '../shared/schema';
import { generateCustomID } from '../shared/utils/generateCustomID';

console.log('🌱 Populando dados de teste...');

async function seedDatabase() {
    try {
        console.log('📦 Inserindo fornecedores...');

        // Inserir fornecedores
        const supplierData = [
            {
                name: 'Tecidos ABC Ltda',
                contact: 'João Silva',
                phone: '(11) 99999-9999',
                email: 'contato@tecidosabc.com.br'
            },
            {
                name: 'Malhas Express',
                contact: 'Maria Santos',
                phone: '(11) 88888-8888',
                email: 'vendas@malhasexpress.com.br'
            },
            {
                name: 'Tecidos Premium',
                contact: 'Carlos Oliveira',
                phone: '(11) 77777-7777',
                email: 'comercial@tecidospremium.com.br'
            }
        ];

        for (const supplier of supplierData) {
            await db.insert(suppliers).values(supplier);
        }
        console.log('✅ Fornecedores inseridos');

        console.log('👕 Inserindo tipos de peças...');

        // Inserir tipos de peças
        const garmentTypeData = [
            { name: 'Camiseta', icon: 'tshirt' },
            { name: 'Calça', icon: 'pants' },
            { name: 'Jaqueta', icon: 'jacket' },
            { name: 'Vestido', icon: 'dress' },
            { name: 'Shorts', icon: 'shorts' }
        ];

        for (const garmentType of garmentTypeData) {
            await db.insert(garmentTypes).values(garmentType);
        }
        console.log('✅ Tipos de peças inseridos');

        console.log('🧵 Inserindo tecidos...');

        // Inserir tecidos
        const fabricData = [
            {
                name: 'Algodão Penteado 30/1',
                type: 'Algodão',
                composition: '100% Algodão',
                gramWeight: 180,
                usableWidth: 150,
                pricePerKg: 25.50,
                currentStock: 100.0,
                yieldEstimate: 5.5,
                supplierId: 1,
                status: 'available'
            },
            {
                name: 'Malha Suplex',
                type: 'Suplex',
                composition: '95% Poliéster, 5% Elastano',
                gramWeight: 220,
                usableWidth: 160,
                pricePerKg: 32.00,
                currentStock: 75.5,
                yieldEstimate: 4.8,
                supplierId: 2,
                status: 'available'
            },
            {
                name: 'Dry Fit Esportivo',
                type: 'Dry Fit',
                composition: '90% Poliéster, 10% Elastano',
                gramWeight: 160,
                usableWidth: 140,
                pricePerKg: 28.75,
                currentStock: 50.0,
                yieldEstimate: 6.2,
                supplierId: 3,
                status: 'low_stock'
            }
        ];

        for (const fabric of fabricData) {
            await db.insert(fabrics).values(fabric);
        }
        console.log('✅ Tecidos inseridos');

        console.log('👤 Inserindo clientes...');

        // Inserir clientes
        const clientData = [
            {
                id: await generateCustomID('CLI', 'clients'),
                name: 'Loja Fashion Ltda',
                email: 'contato@lojafashion.com.br',
                phone: '(11) 3333-3333',
                address: 'Rua das Flores, 123 - São Paulo/SP',
                cpfCnpj: '12.345.678/0001-90',
                status: 'active'
            },
            {
                id: await generateCustomID('CLI', 'clients'),
                name: 'Maria Silva',
                email: 'maria.silva@email.com',
                phone: '(11) 4444-4444',
                address: 'Av. Paulista, 456 - São Paulo/SP',
                cpfCnpj: '123.456.789-00',
                status: 'active'
            },
            {
                id: await generateCustomID('CLI', 'clients'),
                name: 'Ateliê Elegante',
                email: 'contato@atelieelegante.com.br',
                phone: '(11) 5555-5555',
                address: 'Rua Augusta, 789 - São Paulo/SP',
                cpfCnpj: '98.765.432/0001-10',
                status: 'active'
            }
        ];

        for (const client of clientData) {
            await db.insert(clients).values(client);
        }
        console.log('✅ Clientes inseridos');

        console.log('🎨 Inserindo modelos...');

        // Inserir modelos
        const modelData = [
            {
                name: 'Camiseta Básica',
                reference: 'CAM001',
                garmentTypeId: 1,
                fabricId: 1,
                description: 'Camiseta básica de algodão penteado',
                isTemplate: true,
                status: 'finalized'
            },
            {
                name: 'Calça Jeans Slim',
                reference: 'CAL001',
                garmentTypeId: 2,
                fabricId: 2,
                description: 'Calça jeans slim fit',
                isTemplate: true,
                status: 'finalized'
            },
            {
                name: 'Jaqueta Bomber',
                reference: 'JAQ001',
                garmentTypeId: 3,
                fabricId: 3,
                description: 'Jaqueta bomber esportiva',
                isTemplate: true,
                status: 'finalized'
            }
        ];

        for (const model of modelData) {
            await db.insert(models).values(model);
        }
        console.log('✅ Modelos inseridos');

        console.log('🎉 Dados de teste inseridos com sucesso!');
        console.log('');
        console.log('📊 Resumo:');
        console.log('  - 3 Fornecedores');
        console.log('  - 5 Tipos de peças');
        console.log('  - 3 Tecidos');
        console.log('  - 3 Clientes');
        console.log('  - 3 Modelos');

    } catch (error) {
        console.error('❌ Erro ao inserir dados:', error);
        process.exit(1);
    }
}

seedDatabase(); 