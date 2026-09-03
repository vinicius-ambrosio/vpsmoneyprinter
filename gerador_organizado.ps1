$desktopPath = [Environment]::GetFolderPath("Desktop")
$baseFolder = Join-Path $desktopPath "Videos_Seca30"
if (-not (Test-Path $baseFolder)) { New-Item -ItemType Directory -Path $baseFolder | Out-Null }
$videos = @(
    @{ day = "03-Set"; time = "01_Manha"; format = "mito"; subject = "O mito da esteira"; script = "Você passa horas na esteira e a barriga não some? O erro tá aqui: o aeróbico contínuo ensina o corpo a economizar energia. A ciência já provou que o segredo é o efeito EPOC. Doze minutos de alta intensidade queimam calorias por até dois dias seguidos. Se você quer o protocolo pra secar sem esteira, comenta EU QUERO." },
    @{ day = "03-Set"; time = "02_Noite"; format = "top5"; subject = "Top 3 erros no emagrecimento"; script = "Top três erros que travam seu emagrecimento. Erro um: cortar carboidrato. Isso destrói seu metabolismo. Erro dois: tomar remédio milagroso. Você perde músculo e fica flácida. Erro três: achar que precisa de uma hora na academia. Com o seca trinta, doze minutos ativam a queima máxima. Comenta EU QUERO que eu te envio o acesso." },
    @{ day = "04-Set"; time = "01_Manha"; format = "conspiracao"; subject = "O segredo das academias"; script = "Por que a indústria fitness esconde o efeito EPOC de você? Porque se você soubesse que doze minutos em casa queimam mais gordura que uma hora de academia, eles iriam falir. Eles querem sua mensalidade presa. Quer sair do sedentarismo pagando uma vez só por um app vitalício? Comenta EU QUERO." },
    @{ day = "04-Set"; time = "02_Noite"; format = "curiosidade"; subject = "O que acontece aos musculos"; script = "O que acontece com o seu corpo quando você faz doze minutos de alta intensidade? Nos primeiros minutos, seu glicogênio despenca. Depois, o corpo entra em choque e ativa o EPOC, transformando você numa fornalha que queima gordura até dormindo. Se não tem tempo para treinos longos, comenta EU QUERO que te mando o protocolo." }
)
foreach ($vid in $videos) {
    $dayFolder = Join-Path $baseFolder $vid.day
    if (-not (Test-Path $dayFolder)) { New-Item -ItemType Directory -Path $dayFolder | Out-Null }
    $jsonObj = @( @{ video_subject = $vid.subject; video_script = $vid.script; video_language = "pt-BR" } )
    $jsonObj | ConvertTo-Json | Out-File -FilePath .\temp_task.json -Encoding utf8
    uv run python cli.py --batch-file .\temp_task.json --bgm-type none
    $newestTaskFolder = Get-ChildItem -Path .\storage\tasks -Directory | Sort-Object CreationTime -Descending | Select-Object -First 1
    $finalMp4 = Join-Path $newestTaskFolder.FullName "final-1.mp4"
    if (Test-Path $finalMp4) {
        $destName = "{0}-{1}.mp4" -f $vid.time, $vid.format
        $destPath = Join-Path $dayFolder $destName
        Copy-Item -Path $finalMp4 -Destination $destPath -Force
    }
}
