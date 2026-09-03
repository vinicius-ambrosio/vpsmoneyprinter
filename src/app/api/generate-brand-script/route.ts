import { NextResponse } from 'next/server';
import { generateText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';

export async function POST(req: Request) {
  try {
    const { brandContext } = await req.json();

    if (!brandContext) {
      return NextResponse.json({ error: 'Configuração da Marca é obrigatória' }, { status: 400 });
    }

    if (!process.env.MOONSHOT_API_KEY) {
      return NextResponse.json({ error: 'Chave da API da Kimi não configurada (MOONSHOT_API_KEY no .env.local).' }, { status: 500 });
    }

    const moonshot = createOpenAI({
      baseURL: 'https://api.moonshot.ai/v1',
      apiKey: process.env.MOONSHOT_API_KEY,
    });

    const contextPrompt = `\n\nInformações do Produto/Marca:\nO que é: ${brandContext.nomeProduto || 'N/A'}\nPúblico: ${brandContext.publico || 'N/A'}\nBenefício Principal: ${brandContext.beneficio || 'N/A'}\nPreço: ${brandContext.preco || 'N/A'}\n\n`;

    const { text: generatedScript } = await generateText({
      model: moonshot('kimi-k2.6'),
      prompt: `Você é um especialista em criação de roteiros curtos (TikTok, Reels, Shorts).
Crie um roteiro direto ao ponto, em formato de fala narrativa (sem marcadores de cena como [música toca] ou [câmera aproxima]), para divulgar o produto abaixo.
O roteiro deve durar NO MÁXIMO 20 a 30 segundos (OBRIGATÓRIO: 40 a no máximo 60 palavras totais).
Faça um gancho forte na primeira frase para prender a atenção do público-alvo!
${contextPrompt}

Roteiro final (apenas o que será falado):`
    });

    return NextResponse.json({ text: generatedScript.trim() });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao gerar script' }, { status: 500 });
  }
}
