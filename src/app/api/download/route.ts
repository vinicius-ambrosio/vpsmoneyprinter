import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const videoUrl = searchParams.get('url');
  let filename = searchParams.get('filename') || 'video';

  if (!videoUrl) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  try {
    // Limpar o nome do arquivo
    filename = filename.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    
    // Buscar o vídeo no Cloudflare R2
    const response = await fetch(videoUrl);

    if (!response.ok) {
      throw new Error(`Failed to fetch video: ${response.statusText}`);
    }

    // Passar o stream e adicionar o cabeçalho para forçar o download
    const headers = new Headers(response.headers);
    headers.set('Content-Disposition', `attachment; filename="${filename}.mp4"`);
    
    return new NextResponse(response.body, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json({ error: 'Failed to download file' }, { status: 500 });
  }
}
