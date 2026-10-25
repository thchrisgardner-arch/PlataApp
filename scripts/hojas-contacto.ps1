# Genera hojas de contacto (grillas de miniaturas etiquetadas) para revision visual por lotes.
# No modifica las imagenes originales; escribe en docs\_data\hojas\.
# Uso: powershell -NoProfile -ExecutionPolicy Bypass -File scripts\hojas-contacto.ps1
param(
  [string]$Root = (Split-Path -Parent $PSScriptRoot),
  [int]$Columnas = 6,
  [int]$Filas = 2,
  [int]$AnchoMini = 300
)
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$outDir = Join-Path $Root 'docs\_data\hojas'
New-Item -ItemType Directory -Force $outDir | Out-Null
$inv = Import-Csv (Join-Path $Root 'docs\_data\inventario-tecnico.csv')

$porHoja = $Columnas * $Filas
$altoMini = [int]($AnchoMini * 2.2)
$etiqueta = 26
$font = New-Object System.Drawing.Font 'Segoe UI', 13, ([System.Drawing.FontStyle]::Bold)
$jpeg = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object MimeType -eq 'image/jpeg'
$ep = New-Object System.Drawing.Imaging.EncoderParameters 1
$ep.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter ([System.Drawing.Imaging.Encoder]::Quality), 80L

for ($s = 0; $s -lt $inv.Count; $s += $porHoja) {
  $lote = $inv[$s..([math]::Min($s + $porHoja, $inv.Count) - 1)]
  $sheet = New-Object System.Drawing.Bitmap ($Columnas * $AnchoMini), ($Filas * ($altoMini + $etiqueta))
  $g = [System.Drawing.Graphics]::FromImage($sheet)
  $g.Clear([System.Drawing.Color]::FromArgb(40, 40, 40))
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  for ($k = 0; $k -lt $lote.Count; $k++) {
    $r = $lote[$k]
    $x = ($k % $Columnas) * $AnchoMini
    $y = [math]::Floor($k / $Columnas) * ($altoMini + $etiqueta)
    $stream = [System.IO.File]::OpenRead((Join-Path $Root $r.archivo))
    try {
      $img = [System.Drawing.Image]::FromStream($stream)
      $esc = [math]::Min($AnchoMini / $img.Width, $altoMini / $img.Height)
      $w = [int]($img.Width * $esc); $h = [int]($img.Height * $esc)
      $g.DrawImage($img, $x + [int](($AnchoMini - $w) / 2), $y + $etiqueta, $w, $h)
      $img.Dispose()
    } finally { $stream.Dispose() }
    $g.FillRectangle([System.Drawing.Brushes]::Yellow, $x, $y, $AnchoMini, $etiqueta)
    $g.DrawString($r.id, $font, [System.Drawing.Brushes]::Black, $x + 4, $y + 2)
  }
  $g.Dispose()
  $nombre = 'hoja-{0:D2}.jpg' -f ([int][math]::Floor($s / $porHoja) + 1)
  $sheet.Save((Join-Path $outDir $nombre), $jpeg, $ep)
  $sheet.Dispose()
  $nombre
}
