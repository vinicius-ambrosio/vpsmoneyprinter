$desktopPath = [Environment]::GetFolderPath("Desktop")
$baseFolder = Join-Path $desktopPath "Videos_Seca30"

$videos = @(
    @{ day = "03-Set"; time = "01_Manha"; format = "mito"; subject = "O mito de treinar em casa"; script = "Ainda acha que treinar em casa não dá resultado? A ciência discorda. Usar o peso do próprio corpo cria uma tensão mecânica absurda se feito da forma certa. Enquanto nas máquinas você isola um músculo só, em casa você obriga o corpo inteiro a estabilizar o movimento. Isso gasta muito mais energia. O segredo não é o peso, é a intensidade. Siga nosso perfil para entender como transformar o seu corpo na sala de casa." },
    @{ day = "03-Set"; time = "02_Noite"; format = "curiosidade"; subject = "O efeito EPOC"; script = "Você sabe por que algumas pessoas não pisam na esteira e mesmo assim são definidas? O nome disso é Efeito EPOC. Quando você faz doze minutos de exercícios curtos e intensos, seu corpo entra num estado de choque. Para se recuperar, ele precisa gastar energia como um motor ligado. O resultado? Você continua queimando gordura no sofá assistindo série por até 48 horas depois do treino. Curtiu? Siga para mais curiosidades sobre metabolismo." },
    @{ day = "04-Set"; time = "01_Manha"; format = "conspiracao"; subject = "O segredo das academias"; script = "Sabe por que ninguém na academia te fala sobre treinos curtos de doze minutos? Porque isso não vende mensalidade. A indústria fitness lucra com o seu tempo. Se você descobrisse que exercícios de alta intensidade ativam picos hormonais que derretem a capa abdominal muito mais rápido que uma hora de esteira, as academias estariam vazias. Não seja enganado pela indústria. Acompanhe a gente para descobrir a verdade sobre o corpo humano." },
    @{ day = "04-Set"; time = "02_Noite"; format = "top5"; subject = "Sinais de perda de musculo"; script = "Top três sinais de que você está perdendo músculo e não gordura. Sinal um: flacidez rápida. A balança desce, mas a pele da barriga e dos braços fica mole. Sinal dois: você sente frio o tempo todo e fraqueza para subir escadas. Sinal três: o peso congela na balança, porque seu metabolismo ficou lento sem a massa magra. Músculo é o seu motor principal, nunca perca ele. Segue aqui para aprender a proteger a sua massa muscular." }
)

foreach ($vid in $videos) {
    $dayFolder = Join-Path $baseFolder $vid.day
    if (-not (Test-Path $dayFolder)) { New-Item -ItemType Directory -Path $dayFolder | Out-Null }
    
    $json = "[{`"video_subject`": `"$($vid.subject)`", `"video_script`": `"$($vid.script)`", `"video_language`": `"pt-BR`"}]"
    [System.IO.File]::WriteAllText("$PWD\temp_task_$($vid.time).json", $json, (New-Object System.Text.UTF8Encoding($False)))
    
    uv run python cli.py --batch-file "temp_task_$($vid.time).json" --bgm-type none
    Start-Sleep -Seconds 5
    
    $newestTaskFolder = Get-ChildItem -Path .\storage\tasks -Directory | Sort-Object CreationTime -Descending | Select-Object -First 1
    $finalMp4 = Join-Path $newestTaskFolder.FullName "final-1.mp4"
    if (Test-Path $finalMp4) {
        $destName = "{0}-{1}.mp4" -f $vid.time, $vid.format
        $destPath = Join-Path $dayFolder $destName
        Copy-Item -Path $finalMp4 -Destination $destPath -Force
    }
}
