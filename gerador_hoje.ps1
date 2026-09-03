$desktopPath = [Environment]::GetFolderPath("Desktop")
$baseFolder = Join-Path $desktopPath "Videos_Seca30"
$dayFolder = Join-Path $baseFolder "02-Set"
if (-not (Test-Path $dayFolder)) { New-Item -ItemType Directory -Path $dayFolder | Out-Null }

$json = "[{`"video_subject`": `"O erro do emagrecimento falso`", `"video_script`": `"Você tomou a canetinha milagrosa, emagreceu 10 quilos, mas o corpo ficou estranho e flácido? Isso acontece porque você perdeu massa magra junto com a gordura. O segredo pra combater isso não é ir puxar ferro por duas horas, mas sim dar choques de alta tensão no músculo. O efeito EPOC faz isso usando só o peso do seu corpo. Quer o script exato de doze minutos pra endurecer tudo na sala de casa por apenas vinte e sete reais? Comenta EU QUERO que te mando o acesso do Web App.`", `"video_language`": `"pt-BR`"}]"
[System.IO.File]::WriteAllText("$PWD\temp_task_hoje.json", $json, (New-Object System.Text.UTF8Encoding($False)))

uv run python cli.py --batch-file temp_task_hoje.json --bgm-type none

$newestTaskFolder = Get-ChildItem -Path .\storage\tasks -Directory | Sort-Object CreationTime -Descending | Select-Object -First 1
$finalMp4 = Join-Path $newestTaskFolder.FullName "final-1.mp4"
if (Test-Path $finalMp4) {
    $destPath = Join-Path $dayFolder "01_Noite-mito.mp4"
    Copy-Item -Path $finalMp4 -Destination $destPath -Force
}
