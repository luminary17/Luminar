$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Speech
$root = Split-Path -Parent $PSScriptRoot
$jsonPath = Join-Path $root 'data\full-mocks\ielts-academic.json'
$outDir = Join-Path $root 'assets\ielts-audio'
New-Item -ItemType Directory -Force -Path $outDir | Out-Null
$mocks = Get-Content -Raw -Path $jsonPath | ConvertFrom-Json
$voices = @('Microsoft Zira Desktop','Microsoft David Desktop','Microsoft Mark')
$i = 0
foreach ($mock in $mocks) {
  foreach ($module in ($mock.sections | Where-Object id -eq 'listening').modules) {
    $partNo = 0
    foreach ($part in $module.parts) {
      $partNo++
      $target = Join-Path $outDir ("{0}-part-{1}.wav" -f $mock.id,$partNo)
      $synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
      $synth.Rate = -1
      $synth.Volume = 95
      $synth.SetOutputToWaveFile($target)
      $lines = ($part.transcript -split "`n") | ForEach-Object { $_.Trim() } | Where-Object { $_ }
      $speakerIndex = 0
      foreach ($line in $lines) {
        $speaker = $null
        $speech = $line
        if ($line -match '^([^:]{1,28}):\s*(.+)$') { $speaker = $Matches[1]; $speech = $Matches[2] }
        if ($speaker) {
          $voice = $voices[$speakerIndex % $voices.Count]
          try { $synth.SelectVoice($voice) } catch { }
          $speakerIndex++
          $speech = "$speaker. $speech"
        }
        $speech = $speech -replace '\*\*|`',''
        $synth.Speak($speech)
      }
      $synth.Dispose()
      $i++
    }
  }
}
Write-Output ("Generated {0} synthetic listening recordings." -f $i)
