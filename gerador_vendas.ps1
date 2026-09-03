$desktopPath = [Environment]::GetFolderPath("Desktop")
$baseFolder = Join-Path $desktopPath "Videos_Seca30"

$videos = @(
    @{ day = "05-Set"; time = "01_Manha"; format = "top5"; subject = "Top 5 alimentos que travam metabolismo"; script = "Top cinco alimentos que travam o seu metabolismo e você come achando que são saudáveis. Número um: suco de caixinha. É puro açúcar disfarçado de fruta. Número dois: barra de cereal. A maioria tem mais xarope de milho do que um doce de padaria. Número três: peito de peru. É lotado de sódio e conservantes que retêm líquido. Número quatro: tapioca exagerada. Ela tem alto índice glicêmico e sem fibra vira açúcar no sangue. Número cinco: refrigerante zero. Adoçantes artificiais podem bagunçar a sua flora intestinal. Quer descobrir como ativar o modo queima de gordura no seu corpo com um protocolo de doze minutos? Me siga e comente EU QUERO que eu te mando no direct." },
    @{ day = "05-Set"; time = "02_Noite"; format = "mito"; subject = "Mito abdominais secam barriga"; script = "Você faz cem abdominais por dia e a barriga não some? Presta atenção porque você está destruindo a sua lombar à toa. O mito de que abdominal queima a gordura da barriga é a maior mentira do mundo fitness. O abdominal apenas fortalece o músculo que está escondido debaixo da sua capa de gordura. Para derreter a pochete, você precisa de um choque metabólico no corpo inteiro. É por isso que treinos curtos de alta intensidade usando o peso do corpo funcionam muito mais rápido do que ficar deitado no colchonete. Quer a minha ajuda para secar essa barriga sem precisar sair de casa? Me siga e comente EU QUERO que te envio a solução." },
    @{ day = "06-Set"; time = "01_Manha"; format = "conspiracao"; subject = "A mentira dos emagrecedores"; script = "Por que as grandes empresas farmacêuticas não querem que você descubra o efeito EPOC? Porque se você soubesse que pode obrigar o seu próprio corpo a queimar calorias por quarenta e oito horas seguidas apenas fazendo doze minutos de exercícios de alta tensão em casa, eles iriam falir. É muito mais lucrativo te vender pílulas milagrosas e canetas emagrecedoras que destroem a sua massa magra e te deixam flácida. A verdade está na biomecânica do seu corpo, e não numa farmácia. Está cansada de ser enganada e quer descobrir o protocolo secreto de doze minutos que acelera o seu metabolismo? Me siga e comente EU QUERO que eu te mostro como." },
    @{ day = "06-Set"; time = "02_Noite"; format = "curiosidade"; subject = "O que a agua gelada faz no corpo"; script = "O que acontece dentro do seu corpo quando você bebe água gelada de manhã? Você provavelmente já ouviu falar em termogênese. O seu corpo gasta energia apenas para aquecer essa água até a temperatura corporal. Mas isso é só a ponta do iceberg. Se você quer transformar o seu corpo numa verdadeira fornalha queimadora de calorias, o segredo é combinar a hidratação com picos de alta intensidade logo pela manhã. Apenas doze minutos do exercício certo disparam hormônios que aceleram o metabolismo o dia inteiro. Quer o mapa exato do que fazer assim que acordar para secar a pochete? Me siga e comente EU QUERO." },
    @{ day = "07-Set"; time = "01_Manha"; format = "quiz"; subject = "Sinais de metabolismo quebrado"; script = "Você tem esses três sinais de que o seu metabolismo está completamente quebrado? Responda mentalmente. Sinal um: você acorda cansada mesmo depois de dormir oito horas seguidas. Sinal dois: você sente um desejo incontrolável por doces no meio da tarde. Sinal três: você corta calorias, passa fome e a balança simplesmente não desce uma grama. Se você disse sim para algum desses, o seu corpo está no modo de sobrevivência, estocando cada gota de gordura. A única forma de quebrar esse ciclo é gerando um choque metabólico de doze minutos. Aceita o desafio de reverter isso? Me siga e comente EU QUERO que te mando o aplicativo." }
)

foreach ($vid in $videos) {
    $dayFolder = Join-Path $baseFolder $vid.day
    if (-not (Test-Path $dayFolder)) { New-Item -ItemType Directory -Path $dayFolder | Out-Null }
    
    $json = "[{`"video_subject`": `"$($vid.subject)`", `"video_script`": `"$($vid.script)`", `"video_language`": `"pt-BR`"}]"
    [System.IO.File]::WriteAllText("$PWD\temp_task_vendas_$($vid.time).json", $json, (New-Object System.Text.UTF8Encoding($False)))
    
    uv run python cli.py --batch-file "temp_task_vendas_$($vid.time).json" --bgm-type none --subtitle-position top
    Start-Sleep -Seconds 5
    
    $newestTaskFolder = Get-ChildItem -Path .\storage\tasks -Directory | Sort-Object CreationTime -Descending | Select-Object -First 1
    $finalMp4 = Join-Path $newestTaskFolder.FullName "final-1.mp4"
    if (Test-Path $finalMp4) {
        $destName = "{0}-{1}.mp4" -f $vid.time, $vid.format
        $destPath = Join-Path $dayFolder $destName
        Copy-Item -Path $finalMp4 -Destination $destPath -Force
    }
}
