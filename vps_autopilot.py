# -*- coding: utf-8 -*-
import os
import json
import time
import requests
import boto3
from botocore.client import Config
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Configuraï¿½ï¿½es do Supabase
SUPABASE_URL = "http://169.58.106.34:8000"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJhbm9uIiwKICAgICJpc3MiOiAic3VwYWJhc2UtZGVtbyIsCiAgICAiaWF0IjogMTY0MTc2OTIwMCwKICAgICJleHAiOiAxNzk5NTM1NjAwCn0.dc_X5iR_VP_qT0zsiyj_I_OZ2T9FtRU2BBNWN8Bu4GE"
HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation"
}

# Configuraï¿½ï¿½es do Cloudflare R2
R2_ACCESS_KEY = "ae7cccdb6cba3b1e53b20d7beaf0ac63"
R2_SECRET_KEY = "b7b93c2abe6e851e7adad9eff8d7df6414ab373206b3d169b1615ba2d810ae6f"
R2_ENDPOINT = "https://ead4aafca17719a0ed9999a1644aa88e.r2.cloudflarestorage.com"
R2_BUCKET = "hookify-videos"

# Cliente S3 (Cloudflare R2)
s3_client = boto3.client(
    "s3",
    endpoint_url=R2_ENDPOINT,
    aws_access_key_id=R2_ACCESS_KEY,
    aws_secret_access_key=R2_SECRET_KEY,
    config=Config(signature_version='s3v4'), region_name='auto',
)

# API do MoneyPrinterTurbo
MONEY_PRINTER_API_VIDEOS = "http://127.0.0.1:8080/api/v1/videos"
MONEY_PRINTER_API_TASKS = "http://127.0.0.1:8080/api/v1/tasks"

def get_pending_videos():
    url = f"{SUPABASE_URL}/rest/v1/videos?status=eq.draft&select=*"
    try:
        response = requests.get(url, headers=HEADERS)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        logger.error(f"Erro ao buscar videos: {e}")
        return []

def update_video_status(video_id, status, video_url=None):
    url = f"{SUPABASE_URL}/rest/v1/videos?id=eq.{video_id}"
    payload = {"status": status}
    if video_url:
        payload["video_url"] = video_url
        
    try:
        response = requests.patch(url, headers=HEADERS, json=payload)
        response.raise_for_status()
        logger.info(f"Video {video_id} atualizado para status '{status}'")
    except Exception as e:
        logger.error(f"Erro ao atualizar status do video {video_id}: {e}")

def generate_video(script_text, title):
    logger.info("Enviando requisicao de geracao de video para MoneyPrinterTurbo...")
    payload = {
        "video_subject": title,
        "video_script": script_text,
        "video_language": "pt-BR",
        "voice_name": "pt-BR-AntonioNeural",
        "voice_volume": 1.0,
        "bgm_type": "random",
        "bgm_volume": 0.2,
        "subtitle_enabled": True,
        "subtitle_position": "center",
        "video_source": "pexels",
        "video_concat_mode": "random",
        "video_aspect": "9:16",
        "video_clip_duration": 5
    }
    try:
        response = requests.post(MONEY_PRINTER_API_VIDEOS, json=payload)
        response.raise_for_status()
        task_data = response.json()
        logger.info(f"Tarefa criada: {task_data}")
        task_id = task_data.get("data", {}).get("task_id")
        return task_id
    except Exception as e:
        logger.error(f"Erro ao chamar API do MoneyPrinterTurbo: {e}")
        return None

def wait_for_task(task_id):
    url = f"{MONEY_PRINTER_API_TASKS}/{task_id}"
    logger.info(f"Aguardando a conclusao da tarefa {task_id}...")
    while True:
        try:
            response = requests.get(url)
            response.raise_for_status()
            data = response.json().get("data", {})
            state = data.get("state")
            progress = data.get("progress", 0)
            videos = data.get("videos") or data.get("video_urls", [])
            if state == 2 or (state == 1 and progress == 100 and videos):
                logger.info(f"Tarefa {task_id} concluida com sucesso!")
                return videos
            elif state == -1:
                logger.error(f"Tarefa {task_id} falhou!")
                return None
            elif state == 1:
                logger.info(f"Tarefa {task_id} em andamento ({progress}%)...")
            elif state == 0:
                logger.info(f"Tarefa {task_id} na fila/preparando...")
        except Exception as e:
            logger.error(f"Erro ao consultar status da tarefa {task_id}: {e}")
        time.sleep(10)

def upload_to_r2(local_file_path, destination_name):
    logger.info(f"Fazendo upload de {local_file_path} para R2...")
    try:
        s3_client.upload_file(
            local_file_path,
            R2_BUCKET,
            destination_name,
            ExtraArgs={'ContentType': 'video/mp4'}
        )
        # Assumindo que o acesso pï¿½blico ao bucket R2 esteja habilitado atravï¿½s de dev URL ou domï¿½nio customizado
        # Para R2 o formato padrï¿½o do R2.dev ï¿½:
        public_url = f"https://cdn.dragiovanna.com/{destination_name}" # Placeholder, precisaremos ajustar
        return public_url
    except Exception as e:
        logger.error(f"Erro no upload para R2: {e}")
        return None

def process_video(video):
    video_id = video["id"]
    script = video["script"]
    title = video["title"]

    logger.info(f"Processando video ID: {video_id} - Titulo: {title}")
    
    task_id = generate_video(script, title)
    if not task_id:
        update_video_status(video_id, "failed")
        return
        
    result_files = wait_for_task(task_id)
    if result_files and len(result_files) > 0:
        local_file = result_files[0]
        if local_file.startswith("/tasks/"):
            local_file = local_file.replace("/tasks/", "./storage/tasks/")
        elif not local_file.startswith("/"):
            local_file = os.path.join("./storage/tasks", local_file)
        
        filename = f"video_{video_id}_{int(time.time())}.mp4"
        r2_url = upload_to_r2(local_file, filename)
        
        if r2_url:
            update_video_status(video_id, "completed", video_url=r2_url)
        else:
            update_video_status(video_id, "failed")
    else:
        update_video_status(video_id, "failed")

def main():
    logger.info("Iniciando Autopilot Worker (Modo Polvo - 3 Tarefas simultaneas)...")
    import concurrent.futures
    with concurrent.futures.ThreadPoolExecutor(max_workers=3) as executor:
        while True:
            try:
                response = requests.get(f"{SUPABASE_URL}/rest/v1/videos?status=eq.draft&select=*&order=created_at.asc&limit=3", headers=HEADERS)
                response.raise_for_status()
                videos = response.json()
                
                if not videos:
                    logger.info("Nenhum video na fila. Aguardando 10 segundos...")
                    time.sleep(10)
                    continue
                
                logger.info(f"Encontrados {len(videos)} videos na fila. Iniciando processamento em lote...")
                
                futures = []
                for video in videos:
                    update_video_status(video["id"], "processing")
                    futures.append(executor.submit(process_video, video))
                    time.sleep(10) # Pausa de 10s para nao dar Rate Limit na API do LLM (concurrency: 1)
                    
                concurrent.futures.wait(futures)
                
            except Exception as e:
                logger.error(f"Erro no loop principal: {e}")
                time.sleep(10)

if __name__ == "__main__":
    main()










