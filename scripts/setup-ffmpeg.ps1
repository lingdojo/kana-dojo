# Download and setup portable ffmpeg for Windows

$ffmpegUrl = "https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip"
$downloadPath = "$PSScriptRoot\ffmpeg.zip"
$extractPath = "$PSScriptRoot\ffmpeg"
$ffmpegExe = "$extractPath\ffmpeg-*\bin\ffmpeg.exe"

Write-Host "🔽 Downloading ffmpeg..." -ForegroundColor Cyan

try {
    # Download ffmpeg
    Invoke-WebRequest -Uri $ffmpegUrl -OutFile $downloadPath -UseBasicParsing
    
    Write-Host "📦 Extracting ffmpeg..." -ForegroundColor Cyan
    
    # Extract
    Expand-Archive -Path $downloadPath -DestinationPath $extractPath -Force
    
    # Clean up zip
    Remove-Item $downloadPath
    
    Write-Host "✅ ffmpeg setup complete!" -ForegroundColor Green
    Write-Host "Location: $extractPath" -ForegroundColor Gray
    
} catch {
    Write-Host "❌ Error: $_" -ForegroundColor Red
    exit 1
}
