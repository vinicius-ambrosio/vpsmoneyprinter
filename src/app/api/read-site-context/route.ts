import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import { generateObject } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { z } from 'zod';

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    if (!process.env.MOONSHOT_API_KEY) {
      return NextResponse.json({ error: 'Chave da API da Kimi não configurada (MOONSHOT_API_KEY no arquivo .env.local).' }, { status: 500 });
    }

    const moonshot = createOpenAI({
      baseURL: 'https://api.moonshot.ai/v1',
      apiKey: process.env.MOONSHOT_API_KEY,
    });

    let targetUrl = url;
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      targetUrl = 'https://' + targetUrl;
    }

    let textContent = '';
    try {
      // Usar a API do Jina Reader para ler sites dinâmicos (SPAs, React, etc) e extrair o texto limpo
      const jinaResponse = await fetch(`https://r.jina.ai/${targetUrl}`, {
        headers: {
          'Accept': 'text/plain',
          'X-Return-Format': 'markdown'
        }
      });
      
      if (jinaResponse.ok) {
        textContent = await jinaResponse.text();
      } else {
        throw new Error('Jina API failed');
      }
    } catch (e) {
      // Fallback simples se o Jina falhar
      const response = await fetch(targetUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });
      if (response.ok) {
        const html = await response.text();
        const $ = cheerio.load(html);
        $('script, style, noscript, iframe, img, svg').remove();
        textContent = $('body').text().replace(/\s+/g, ' ').trim();
      }
    }

    if (!textContent || textContent.length < 20) {
      return NextResponse.json({ error: 'Não foi possível extrair texto suficiente deste site.' }, { status: 400 });
    }

    // Landing pages can be very long and price is usually at the bottom.
    // Gemini 2.5 Flash has a huge context window, we can send up to 80,000 chars easily
    if (textContent.length > 80000) {
      textContent = textContent.slice(0, 80000) + '...';
    }

    const { object } = await generateObject({
      model: moonshot('kimi-k2.6'),
      schema: z.object({
        nomeProduto: z.string().describe("O nome completo do produto, serviço ou empresa, junto com uma breve descrição do que ele é. (Ex: 'OdontoProfit - Software de Precificação Inteligente para Clínicas Odontológicas')"),
        publico: z.string().describe("Descreva detalhadamente o público-alvo, incluindo suas principais dores, desejos e frustrações atuais. Escreva pelo menos 2 a 3 frases densas. (Ex: 'Dentistas e donos de clínicas que têm dificuldade em precificar seus serviços, vivem no escuro em relação ao lucro real e estão cansados de cobrar barato por medo de perder o paciente.')"),
        beneficio: z.string().describe("Descreva a grande promessa, o benefício final e a transformação de vida que o produto entrega. Não use apenas duas palavras. Explique COMO ele resolve a dor. (Ex: 'Permite que o dentista descubra exatamente quanto cobrar por cada procedimento para garantir lucro, automatizando a gestão financeira e dando segurança para cobrar o preço justo sem perder vendas.')"),
        preco: z.string().describe("Preço, planos, ofertas especiais ou como a empresa cobra (se não encontrar, responda: 'Não informado diretamente na página inicial')")
      }),
      prompt: `Você é um estrategista de marketing digital e copywriter de elite (nível Russell Brunson).
Seu objetivo é analisar a Landing Page de um produto e extrair o "Core Concept" (Contexto Central) da marca.
Essas informações serão usadas para treinar uma IA a escrever roteiros virais e persuasivos de vídeos (Shorts/Reels) para vender este produto.

Portanto, NÃO ME DÊ RESPOSTAS CURTAS DE 1 OU 2 PALAVRAS.
Seja denso, detalhista e persuasivo. Descreva as dores do público, o mecanismo único do produto e a grande transformação que ele vende.

Conteúdo da Landing Page raspada:
${textContent}`
    });

    return NextResponse.json(object);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao ler site' }, { status: 500 });
  }
}
