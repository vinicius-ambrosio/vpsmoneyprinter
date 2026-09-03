import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import { generateText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';

export async function POST(req: Request) {
  try {
    const { url, brandContext } = await req.json();

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

    let targetUrl = url.trim();
    if (!targetUrl.match(/^https?:\/\//i)) {
      targetUrl = 'https://' + targetUrl;
    }

    try {
      new URL(targetUrl);
    } catch (e) {
      return NextResponse.json({ error: 'Formato de URL inválido.' }, { status: 400 });
    }

    let textContent = '';
    try {
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

    if (textContent.length > 80000) {
      textContent = textContent.slice(0, 80000) + '...';
    }

    let contextPrompt = '';
    if (brandContext) {
      contextPrompt = `\n\nInformações obrigatórias sobre o produto (use-as para moldar a oferta):\nO que é: ${brandContext.nomeProduto || 'N/A'}\nPúblico: ${brandContext.publico || 'N/A'}\nBenefício Principal: ${brandContext.beneficio || 'N/A'}\nPreço: ${brandContext.preco || 'N/A'}\n\n`;
    }

    const { text: generatedScript } = await generateText({
      model: moonshot('kimi-k2.6'),
      prompt: `Você é um especialista em criação de roteiros curtos (TikTok, Reels, Shorts).
Leia as informações extraídas de um link fornecido pelo usuário e crie um roteiro direto ao ponto, em formato de fala narrativa (sem marcadores de cena como [música toca] ou [câmera aproxima]). 
O roteiro deve durar cerca de 30 a 60 segundos falando (em média 70 a 120 palavras).
Faça um gancho forte na primeira frase!
${contextPrompt}
Conteúdo do link base:
${textContent}

Roteiro final (apenas o que será falado):`
    });

    return NextResponse.json({ text: generatedScript.trim() });
  } catch (error: any) {
    const errorString = error?.message?.toLowerCase() || '';
    if (errorString.includes('429') || errorString.includes('rate limit') || errorString.includes('concurrency') || errorString.includes('too many requests') || errorString.includes('quota')) {
      return NextResponse.json({ error: 'RATE_LIMIT' }, { status: 429 });
    }
    return NextResponse.json({ error: error.message || 'Erro ao ler site' }, { status: 500 });
  }
}
