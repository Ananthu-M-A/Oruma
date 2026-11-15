# Turns narration lines into WAV files with the built-in Windows voice.
# Usage: powershell -File narrate.ps1 -LinesJson lines.json -OutDir out -Voice "Microsoft Zira Desktop"
# lines.json: [{ "id": "01", "text": "..." }, ...]
param(
  [Parameter(Mandatory = $true)][string]$LinesJson,
  [Parameter(Mandatory = $true)][string]$OutDir,
  [string]$Voice = "Microsoft Zira Desktop",
  [int]$Rate = -1
)

Add-Type -AssemblyName System.Speech
$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
$synth.SelectVoice($Voice)
$synth.Rate = $Rate
$format = New-Object System.Speech.AudioFormat.SpeechAudioFormatInfo(
  44100, [System.Speech.AudioFormat.AudioBitsPerSample]::Sixteen,
  [System.Speech.AudioFormat.AudioChannel]::Mono)

New-Item -ItemType Directory -Force -Path $OutDir | Out-Null
$lines = Get-Content -Raw -Encoding UTF8 $LinesJson | ConvertFrom-Json
foreach ($line in $lines) {
  $path = Join-Path $OutDir ("{0}.wav" -f $line.id)
  $synth.SetOutputToWaveFile($path, $format)
  $synth.Speak([string]$line.text)
  $synth.SetOutputToNull()
}
$synth.Dispose()
