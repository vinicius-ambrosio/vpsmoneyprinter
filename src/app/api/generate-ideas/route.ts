import { NextResponse } from 'next/server';
import { generateObject } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import * as cheerio from 'cheerio';
import { z } from 'zod';

export async function POST(req: Request) {
  try {
    const { url, brandContext } = await req.json();

    if (!url && !brandContext) {
      return NextResponse.json({ error: 'URL ou Configuração da Marca é obrigatória' }, { status: 400 });
    }

    let textContent = '';
    
    if (url) {
      let targetUrl = url;
      if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
        targetUrl = 'https://' + targetUrl;
      }

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

      if (textContent.length > 80000) {
        textContent = textContent.slice(0, 80000);
      }

      if (textContent.length < 20) {
        return NextResponse.json({ error: 'O site não possui texto ou metadados suficientes para a IA analisar. Certifique-se de que não é uma página vazia.' }, { status: 400 });
      }
    }

    if (!process.env.MOONSHOT_API_KEY) {
      return NextResponse.json({ error: 'Chave da API da Kimi não configurada (MOONSHOT_API_KEY no arquivo .env.local).' }, { status: 500 });
    }

    const moonshot = createOpenAI({
      baseURL: 'https://api.moonshot.ai/v1',
      apiKey: process.env.MOONSHOT_API_KEY,
    });
    
    let contextPrompt = '';
    if (brandContext) {
      contextPrompt = `\n\nInformações do Produto/Marca do cliente:\nO que é: ${brandContext.nomeProduto || 'N/A'}\nPúblico: ${brandContext.publico || 'N/A'}\nBenefício Principal: ${brandContext.beneficio || 'N/A'}\nPreço: ${brandContext.preco || 'N/A'}\nUse essas informações para alinhar perfeitamente o roteiro com o produto do cliente!`;
    }

    let systemPrompt = '';
    if (url) {
      systemPrompt = `Você é um especialista em criação de vídeos virais para TikTok, Reels e Shorts focado em conversão e engajamento.\n\nAnalise o seguinte conteúdo extraído de um site e gere entre 3 a 5 ideias de vídeos curtos que tenham alto potencial de atração para o público-alvo deste site. \n\nImportante: Adapte o "estilo" do vídeo para fazer sentido com o produto/serviço. Se for um software B2B, use estilos como "Problema/Solução", "Mito vs Verdade", "Estudo de Caso". Não use "Canal Dark" para empresas corporativas.\n\nCrie ganchos (hooks) muito fortes para prender a atenção nos primeiros 3 segundos.\n\nConteúdo do site de inspiração/referência:\n\n${textContent}${contextPrompt}`;
    } else {
      systemPrompt = `Você é um especialista em criação de vídeos virais para TikTok, Reels e Shorts focado em conversão e engajamento.\n\nCom base nas informações da marca/produto abaixo, gere entre 3 a 5 ideias de vídeos curtos altamente persuasivos para atrair o público-alvo e vender o produto ou serviço.\n\nImportante: Adapte o "estilo" do vídeo para o nicho (ex: "Problema/Solução", "Mito vs Verdade", "Storytelling", "Estudo de Caso", "Dica Prática").\nCrie ganchos (hooks) muito fortes para prender a atenção nos primeiros 3 segundos.\n${contextPrompt}`;
    }

    const { object } = await generateObject({
      model: moonshot('kimi-k2.6'),
      schema: z.object({
        tema: z.string().describe("O tema principal da marca ou do lote de vídeos, em 1-3 palavras (ex: Emagrecimento, Finanças, Dica Rápida)"),
        ideias: z.array(z.object({
          titulo: z.string().describe("Título chamativo do vídeo (ex: O Erro Fatal)"),
          estilo: z.string().describe("O formato ou estilo do vídeo. (ex: Estudo de Caso, Problema/Solução, Tutorial Rápido, Storytelling, Venda Direta)"),
          script: z.string().describe("A primeira frase impactante (o gancho/hook) do vídeo. No máximo 20 palavras.")
        })).min(3).max(5)
      }),
      prompt: systemPrompt
    });

    return NextResponse.json(object);
  } catch (error: any) {
    console.error('Error generating ideas:', error);
    return NextResponse.json({ error: error.message || 'Erro ao processar a requisição' }, { status: 500 });
  }
}
