$ptDir = (Get-ChildItem "c:\Users\makoto\Documents\アプリ開発" -Directory | Where-Object { $_.Name -like "Vocabraly*PassTan" }).FullName
Write-Host "PassTan dir: $ptDir"

# Copy quiz JSONs
Copy-Item "$PSScriptRoot\passtan_output\pass5_quiz.json" $ptDir -Force
Copy-Item "$PSScriptRoot\passtan_output\pass4_quiz.json" $ptDir -Force
Copy-Item "$PSScriptRoot\passtan_output\pass3_quiz.json" $ptDir -Force
Copy-Item "$PSScriptRoot\passtan_output\pass_pre2_quiz.json" $ptDir -Force
Write-Host "Quiz JSON copied"

# Copy audio
$audioSrc = "c:\Users\makoto\Documents\アプリ開発\VocabularyBase\public\audio"
foreach ($d in @("5kyu_pass","4kyu_pass","3kyu_pass","pre2kyu_pass")) {
    $dest = Join-Path $ptDir "audio\$d"
    if (!(Test-Path $dest)) { New-Item -ItemType Directory -Path $dest -Force | Out-Null }
    Copy-Item "$audioSrc\$d\*" $dest -Force
    $count = (Get-ChildItem $dest).Count
    Write-Host "Audio $d : $count files"
}
Write-Host "All done"
