import os
import json
import random
import subprocess
import time
from datetime import datetime
# from tiktok_uploader.upload import upload_video # (Requer pip install tiktok-uploader)

# Exemplo conceitual de como sua VPS vai rodar o dia todo:

TEMAS_ORGANICOS = [
    "Curiosidade: O que acontece se você beber 3 litros de água",
    "História: Como o ator X secou para o filme",
    "Top 5: Alimentos que parecem saudáveis mas não são",
    "Curiosidade: A diferença entre suar e queimar gordura",
    "Ciência: O que é o metabolismo basal",
]

TEMAS_VENDAS_DISFARCADAS = [
    "Top 3 erros de quem treina em casa (Gancho pro Seca 30)",
    "A verdade sobre os 12 minutos (Gancho pro Seca 30)",
    "Por que academia não funciona para todo mundo (Gancho pro Seca 30)"
]

def gerar_roteiro_via_ia(tipo):
    """
    Aqui você conectaria na API da OpenAI ou do Gemini.
    Você passaria um prompt pedindo para gerar o JSON no formato do MoneyPrinterTurbo.
    """
    # Mock de exemplo:
    tema = random.choice(TEMAS_ORGANICOS if tipo == "organico" else TEMAS_VENDAS_DISFARCADAS)
    print(f"🧠 [IA] Gerando roteiro sobre: {tema}")
    
    script = "Você sabia que o suor não é gordura chorando? A gordura é exalada pela respiração..."
    if tipo == "venda":
         script += " Quer saber como otimizar isso em casa? Comenta EU QUERO."
         
    return {
        "video_subject": tema,
        "video_script": script,
        "video_language": "pt-BR"
    }

def gerar_lote_do_dia():
    # 3 vídeos por dia: 2 orgânicos/curiosidades, 1 venda disfarçada
    roteiros = [
        gerar_roteiro_via_ia("organico"),
        gerar_roteiro_via_ia("organico"),
        gerar_roteiro_via_ia("venda"),
    ]
    
    batch_file = "vps_daily_batch.json"
    with open(batch_file, "w", encoding="utf-8") as f:
        json.dump(roteiros, f, ensure_ascii=False, indent=2)
        
    return batch_file

def fabricar_videos(batch_file):
    print(f"🎬 [MoneyPrinterTurbo] Iniciando fabricação dos vídeos do {batch_file}...")
    # Chama a CLI nativa do MoneyPrinterTurbo (na mesma pasta)
    comando = f"python cli.py --batch {batch_file}"
    # subprocess.run(comando, shell=True) # Descomente na VPS
    time.sleep(3) # Simulando renderização
    print("✅ Vídeos gerados com sucesso na pasta /storage")
    
def postar_no_tiktok(caminho_video, descricao):
    print(f"🚀 [TikTok Uploader] Postando {caminho_video} no TikTok...")
    # upload_video(caminho_video,
    #             description=descricao,
    #             cookies='tiktok_cookies.txt')
    print("✅ Vídeo postado com sucesso!")

def main():
    print(f"[{datetime.now()}] Iniciando a Máquina de Automação Diária...")
    
    # 1. IA gera o lote
    batch_file = gerar_lote_do_dia()
    
    # 2. MoneyPrinter fabrica os MP4s
    fabricar_videos(batch_file)
    
    # 3. Faz o upload espaçado (ex: de 4 em 4 horas)
    # Na vida real, você buscaria os mp4 recém gerados na pasta storage/
    print("⏱️ Aguardando horário de pico para postar o primeiro...")
    # postar_no_tiktok("storage/video1.mp4", "Gostou da curiosidade? #fitness #curiosidades")

if __name__ == "__main__":
    main()
