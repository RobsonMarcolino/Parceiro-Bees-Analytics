import { Hono } from "hono";
import { cors } from "hono/cors";
import OpenAI from "openai";

interface Env {
  MOCHA_USERS_SERVICE_API_KEY: string;
  MOCHA_USERS_SERVICE_API_URL: string;
  OPENAI_API_KEY: string;
}

const app = new Hono<{ Bindings: Env }>();

app.use("*", cors());

app.get("/", (c) => {
  return c.text("Parceiro Bees Analytics API");
});

app.post("/api/chat", async (c) => {
  try {
    const { message, context } = await c.req.json();

    if (!c.env.OPENAI_API_KEY) {
      return c.json({ error: "OpenAI API key not configured" }, 500);
    }

    const openai = new OpenAI({
      apiKey: c.env.OPENAI_API_KEY,
    });

    const systemPrompt = `Você é um assistente especializado em análise de dados do aplicativo Parceiro Bees da Ambev. 
    
Você tem acesso aos seguintes dados atuais:
- Aderência total: ${context.totalAdherence.toFixed(2)}%
- Número de redes: ${context.networksCount}
- Número de lojas: ${context.storesCount}
- Total de registros de dados: ${context.totalDataRows}
- Última semana: ${context.latestWeek ? new Date(context.latestWeek).toLocaleDateString('pt-BR') : 'N/A'}

Top 3 redes por performance:
${context.topNetworks.map((network: any, i: number) => `${i + 1}. ${network.name}: ${network.adherence.toFixed(2)}% (${network.stores} lojas)`).join('\n')}

Top 5 lojas detratoras (menor aderência):
${context.worstStores.map((store: any, i: number) => `${i + 1}. ${store.name} - Loja ${store.store}: ${store.adherence.toFixed(2)}%`).join('\n')}

Top 5 SKUs com ativação:
${context.activationSkus.map((sku: any, i: number) => `${i + 1}. ${sku.product}: ${sku.ttcOk} ativações`).join('\n')}

Filtros disponíveis:
- Redes: ${context.filters.networks.slice(0, 5).join(', ')}${context.filters.networks.length > 5 ? ` e mais ${context.filters.networks.length - 5}` : ''}
- Regiões: ${context.filters.regions.slice(0, 5).join(', ')}${context.filters.regions.length > 5 ? ` e mais ${context.filters.regions.length - 5}` : ''}
- Canais: ${context.filters.channels.slice(0, 5).join(', ')}${context.filters.channels.length > 5 ? ` e mais ${context.filters.channels.length - 5}` : ''}

Meta de aderência: 65%

Responda de forma clara, objetiva e em português. Use os dados fornecidos para dar insights específicos e recomendações práticas. 
Se perguntarem sobre dados que não estão disponíveis no contexto, explique isso educadamente e sugira o que pode ser analisado com os dados disponíveis.
Seja proativo em sugerir análises e ações baseadas nos dados.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: message,
        },
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    const response = completion.choices[0]?.message?.content || "Desculpe, não consegui processar sua pergunta.";

    return c.json({ response });
  } catch (error) {
    console.error("Erro no chat:", error);
    return c.json({ error: "Erro interno do servidor" }, 500);
  }
});

export default app;
