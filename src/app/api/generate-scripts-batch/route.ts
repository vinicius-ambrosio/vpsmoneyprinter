import { NextResponse } from 'next/server';
import { generateText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';

export async function POST(req: Request) {
  try {
    const { topic, format, quantity, cta, brandContext } = await req.json();

    if ((!topic && !brandContext) || !format || !quantity) {
      return NextResponse.json({ error: 'Tema ou Branding devem ser fornecidos.' }, { status: 400 });
    }

    if (!process.env.MOONSHOT_API_KEY) {
      return NextResponse.json({ error: 'Chave da API da Kimi não configurada.' }, { status: 500 });
    }

    const moonshot = createOpenAI({
      baseURL: 'https://api.moonshot.ai/v1',
      apiKey: process.env.MOONSHOT_API_KEY,
    });

    const parsedQuantity = parseInt(quantity, 10);
    const maxQuantity = Math.min(parsedQuantity, 5); // Limit max scripts to 5

    let ctaInstruction = "";
    if (cta && cta.trim() !== "") {
      ctaInstruction = `\nIMPORTANTE: No final de cada roteiro, inclua de forma natural uma Chamada para Ação (CTA) com o seguinte direcionamento: "${cta}".\n`;
    }

    let brandInstruction = "";
    if (brandContext) {
      brandInstruction = `\nCONTEXTO DA MARCA (Integre esses elementos no roteiro de forma sutil e persuasiva):
- Nome do Produto/Marca: ${brandContext.nomeProduto}
- Público Alvo: ${brandContext.publico}
- Benefício Principal: ${brandContext.beneficio}
- Preço/Oferta: ${brandContext.preco}\n`;
    }

    const prompt = `Você é um especialista em criação de roteiros curtos (TikTok, Reels, Shorts).
${topic ? `O usuário forneceu o seguinte tema ou URL de referência: "${topic}"` : `O usuário quer que você gere vídeos exclusivamente com base no contexto da marca fornecido abaixo.`}
O formato desejado para o vídeo é: "${format}"${brandInstruction}

Sua tarefa é gerar exatamente ${maxQuantity} opção(ões) de roteiro(s) para este tema.
Cada roteiro deve ser direto ao ponto, em formato de fala narrativa, durando cerca de 30 a 60 segundos (70 a 120 palavras), com um gancho forte na primeira frase.${ctaInstruction}

OBRIGATÓRIO: Retorne a resposta ESTRITAMENTE como um array JSON válido, onde cada elemento é um objeto contendo duas chaves:
- "title": Um título curto e chamativo para a ideia (máximo 5 palavras).
- "script": O roteiro completo a ser falado.

Não inclua nenhum outro texto, markdown, ou explicações na sua resposta além do JSON puro.
Exemplo do formato esperado:
[
  { "title": "Ideia 1", "script": "Fala do roteiro 1..." },
  { "title": "Ideia 2", "script": "Fala do roteiro 2..." }
]`;

    const { text: generatedText } = await generateText({
      model: moonshot('kimi-k2.6'),
      prompt: prompt
    });

    let jsonResult;
    try {
      // Remove possible markdown formatting for JSON
      const cleanText = generatedText.replace(/```json/g, '').replace(/```/g, '').trim();
      jsonResult = JSON.parse(cleanText);
    } catch {
      console.error("Failed to parse JSON from AI response", generatedText);
      return NextResponse.json({ error: 'Erro ao formatar a resposta da IA como JSON.' }, { status: 500 });
    }

    return NextResponse.json({ scripts: jsonResult });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erro ao gerar scripts';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
