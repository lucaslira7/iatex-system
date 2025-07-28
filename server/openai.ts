import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
let openai: OpenAI | null = null;

if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
} else {
  console.log("⚠️  OPENAI_API_KEY não encontrada. Funcionalidades de IA serão limitadas.");
}

export async function chatWithAI(message: string, context: string = 'general'): Promise<string> {
  try {
    if (!openai) {
      return "Funcionalidade de IA não disponível. Configure OPENAI_API_KEY para usar esta funcionalidade.";
    }

    const systemPrompt = getSystemPrompt(context);

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      max_tokens: 500,
      temperature: 0.7
    });

    return response.choices[0].message.content || "Desculpe, não consegui processar sua solicitação.";
  } catch (error) {
    console.error("Error in chatWithAI:", error);
    throw new Error("Falha na comunicação com IA: " + (error as Error).message);
  }
}

export async function generateFabricSuggestions(modelData: any): Promise<any> {
  try {
    if (!openai) {
      return { suggestions: [] };
    }

    const prompt = `Baseado nos seguintes dados de modelos de confecção, sugira os melhores tecidos:

Dados dos modelos: ${JSON.stringify(modelData, null, 2)}

Analise e retorne sugestões em JSON no formato:
{
  "suggestions": [
    {
      "fabricType": "nome do tecido",
      "reason": "motivo da recomendação",
      "confidence": 85,
      "benefits": ["benefício 1", "benefício 2"],
      "estimatedCost": "faixa de preço",
      "compatibility": "alta/média/baixa"
    }
  ]
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Você é um especialista em tecidos para confecção com 20 anos de experiência. Analise dados e forneça sugestões práticas e precisas."
        },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3
    });

    return JSON.parse(response.choices[0].message.content || '{"suggestions": []}');
  } catch (error) {
    console.error("Error in generateFabricSuggestions:", error);
    throw new Error("Falha ao gerar sugestões de tecidos: " + (error as Error).message);
  }
}

export async function optimizeMargins(pricingData: any): Promise<any> {
  try {
    if (!openai) {
      return { improvements: [] };
    }

    const prompt = `Analise os seguintes dados de precificação e sugira otimizações de margem:

Dados de precificação: ${JSON.stringify(pricingData, null, 2)}

Retorne análise em JSON no formato:
{
  "currentMargin": "margem atual em %",
  "optimizedMargin": "margem otimizada sugerida em %",
  "improvements": [
    {
      "area": "área de melhoria",
      "currentCost": "custo atual",
      "optimizedCost": "custo otimizado",
      "savings": "economia em %",
      "implementation": "como implementar"
    }
  ],
  "risks": ["risco 1", "risco 2"],
  "timeline": "tempo para implementação"
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Você é um consultor financeiro especializado em confecção. Analise custos e sugira otimizações realistas e implementáveis."
        },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.2
    });

    return JSON.parse(response.choices[0].message.content || '{"improvements": []}');
  } catch (error) {
    console.error("Error in optimizeMargins:", error);
    throw new Error("Falha ao otimizar margens: " + (error as Error).message);
  }
}

export async function generateInsights(businessData: any): Promise<any> {
  try {
    if (!openai) {
      return { insights: [] };
    }

    const prompt = `Analise os dados do negócio de confecção e gere insights inteligentes:

Dados: ${JSON.stringify(businessData, null, 2)}

Retorne insights em JSON no formato:
{
  "insights": [
    {
      "type": "opportunity|warning|trend",
      "title": "título do insight",
      "description": "descrição detalhada",
      "impact": "alto/médio/baixo",
      "actionItems": ["ação 1", "ação 2"],
      "priority": 1-5
    }
  ],
  "kpis": {
    "efficiency": "percentual de eficiência",
    "profitability": "lucratividade média",
    "growth": "potencial de crescimento"
  }
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Você é um analista de negócios especializado em indústria têxtil. Gere insights acionáveis baseados em dados reais."
        },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.4
    });

    return JSON.parse(response.choices[0].message.content || '{"insights": []}');
  } catch (error) {
    console.error("Error in generateInsights:", error);
    throw new Error("Falha ao gerar insights: " + (error as Error).message);
  }
}

function getSystemPrompt(context: string): string {
  const basePrompt = `Você é um assistente especializado em gestão de confecção e indústria têxtil. 
Você tem conhecimento profundo sobre:
- Tecidos, fibras e suas propriedades
- Processos de produção têxtil
- Precificação e cálculo de custos
- Gestão de estoque e fornecedores
- Tendências de moda e mercado
- Otimização de processos produtivos

Responda sempre em português brasileiro, seja prático e direto, com foco em soluções aplicáveis para pequenas e médias confecções.`;

  const contextPrompts = {
    general: basePrompt,
    fabrics: basePrompt + "\nFoque em sugestões de tecidos, suas propriedades e adequação para diferentes tipos de peças.",
    pricing: basePrompt + "\nFoque em cálculos de custo, precificação e otimização de margens de lucro.",
    production: basePrompt + "\nFoque em processos produtivos, eficiência e gestão de facções.",
    inventory: basePrompt + "\nFoque em gestão de estoque, controle de insumos e previsão de compras."
  };

  return contextPrompts[context as keyof typeof contextPrompts] || basePrompt;
}

// Analysis functions for different business aspects
export async function analyzeFabricUsage(fabricData: any[]): Promise<any> {
  const usage = fabricData.reduce((acc, fabric) => {
    acc[fabric.type] = (acc[fabric.type] || 0) + parseFloat(fabric.currentStock || '0');
    return acc;
  }, {} as Record<string, number>);

  return {
    totalTypes: Object.keys(usage).length,
    mostUsed: Object.entries(usage).sort(([, a], [, b]) => (b as number) - (a as number)).slice(0, 5),
    lowStock: fabricData.filter(f => parseFloat(f.currentStock || '0') < parseFloat(f.minimumStock || '10')),
    recommendations: await generateFabricRecommendations(usage)
  };
}

export async function generateFabricRecommendations(usage: Record<string, number>): Promise<string[]> {
  const recommendations = [];

  // Simple logic - in a real implementation, this would be more sophisticated
  const sortedUsage = Object.entries(usage).sort(([, a], [, b]) => b - a);

  if (sortedUsage.length > 0) {
    const topFabric = sortedUsage[0][0];
    recommendations.push(`Considere aumentar estoque de ${topFabric} (mais utilizado)`);
  }

  if (sortedUsage.length > 3) {
    const underUsed = sortedUsage.slice(-2);
    recommendations.push(`Avalie reduzir estoque de ${underUsed.map(([name]) => name).join(' e ')} (pouco utilizados)`);
  }

  return recommendations;
}