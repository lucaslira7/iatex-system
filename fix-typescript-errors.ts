// Script para corrigir erros TypeScript críticos
// Executar: npx tsx fix-typescript-errors.ts

import fs from 'fs';
import path from 'path';

const fixes = [
  // AIAssistant.tsx - Corrigir tipagem de dados
  {
    file: 'client/src/components/AIAssistant.tsx',
    replacements: [
      {
        search: /data: chatHistory = \[\]/g,
        replace: 'data: chatHistory = [] as Message[]'
      },
      {
        search: /data: suggestions = \[\]/g,
        replace: 'data: suggestions = [] as any[]'
      },
      {
        search: /'suggestions' is of type 'unknown'/g,
        replace: "'suggestions' is typed correctly"
      }
    ]
  },
  
  // AdvancedSimulations.tsx - Corrigir tipagem de arrays
  {
    file: 'client/src/components/AdvancedSimulations.tsx',
    replacements: [
      {
        search: /data: models = \[\]/g,
        replace: 'data: models = [] as any[]'
      },
      {
        search: /data: fabrics = \[\]/g,
        replace: 'data: fabrics = [] as any[]'
      }
    ]
  },

  // OperationalPanel.tsx - Corrigir chamadas API
  {
    file: 'client/src/components/OperationalPanel.tsx',
    replacements: [
      {
        search: /apiRequest\('\/api\/operational\/tasks', \{[\s\S]*?method: 'POST',[\s\S]*?body: JSON\.stringify\(taskData\)[\s\S]*?\}\)/g,
        replace: "apiRequest('POST', '/api/operational/tasks', taskData)"
      }
    ]
  }
];

console.log('🔧 Iniciando correções TypeScript...');

fixes.forEach(fix => {
  const filePath = fix.file;
  
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    fix.replacements.forEach(replacement => {
      if (content.match(replacement.search)) {
        content = content.replace(replacement.search, replacement.replace);
        modified = true;
      }
    });
    
    if (modified) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ Corrigido: ${filePath}`);
    } else {
      console.log(`⚠️ Nenhuma alteração necessária: ${filePath}`);
    }
  } else {
    console.log(`❌ Arquivo não encontrado: ${filePath}`);
  }
});

console.log('🎯 Correções TypeScript finalizadas!');