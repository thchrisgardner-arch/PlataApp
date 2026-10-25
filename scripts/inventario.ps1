# Inventario tecnico de capturas (solo lectura sobre las imagenes originales).
# Uso: powershell -NoProfile -ExecutionPolicy Bypass -File scripts\inventario.ps1
# Salida: docs\_data\inventario-tecnico.csv y docs\_data\pares-similares.csv
param(
  [string]$Root = (Split-Path -Parent $PSScriptRoot),
  [int]$UmbralSimilar = 10
)
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$outDir = Join-Path $Root 'docs\_data'
New-Item -ItemType Directory -Force $outDir | Out-Null

function Get-Gcd([int]$a, [int]$b) { while ($b -ne 0) { $t = $b; $b = $a % $b; $a = $t }; return $a }

# ID estable derivado del nombre original: Banco Plata_7.jpg -> PLT-0007; PNG hash -> PLT-P-<ultimos 6>
function Get-StableId([string]$name) {
  if ($name -match '^Banco Plata_(\d+)(?: \((\d+)\))?\.(jpe?g|png)$') {
    $id = 'PLT-{0:D4}' -f [int]$Matches[1]
    if ($Matches[2]) { $id += "-c$($Matches[2])" }
    return $id
  }
  $b = [IO.Path]::GetFileNameWithoutExtension($name); if ($b.Length -gt 6) { $b = $b.Substring($b.Length - 6) }; return 'PLT-P-' + $b
}

function Get-DHash([System.Drawing.Image]$img) {
  # 9x8 en escala de grises; cada bit compara un pixel con su vecino derecho
  $bmp = New-Object System.Drawing.Bitmap 9, 8
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.DrawImage($img, 0, 0, 9, 8)
  $g.Dispose()
  [UInt64]$hash = 0
  for ($y = 0; $y -lt 8; $y++) {
    for ($x = 0; $x -lt 8; $x++) {
      $a = $bmp.GetPixel($x, $y); $b = $bmp.GetPixel($x + 1, $y)
      $la = 0.299 * $a.R + 0.587 * $a.G + 0.114 * $a.B
      $lb = 0.299 * $b.R + 0.587 * $b.G + 0.114 * $b.B
      $hash = $hash -shl 1
      if ($la -gt $lb) { $hash = $hash -bor 1 }
    }
  }
  $bmp.Dispose()
  return $hash
}

function Get-Hamming([UInt64]$a, [UInt64]$b) {
  $x = $a -bxor $b; $c = 0
  while ($x -ne 0) { $x = $x -band ($x - 1); $c++ }
  return $c
}

$files = Get-ChildItem -LiteralPath $Root -File | Where-Object { $_.Extension -match '^\.(jpe?g|png)$' } |
  Sort-Object @{ e = { if ($_.Name -match '_(\d+)') { [int]$Matches[1] } else { 99999 } } }, Name

$rows = New-Object System.Collections.Generic.List[object]
foreach ($f in $files) {
  $stream = [System.IO.File]::OpenRead($f.FullName)
  try {
    $img = [System.Drawing.Image]::FromStream($stream, $false, $false)
    $w = $img.Width; $h = $img.Height
    $dh = Get-DHash $img
    $img.Dispose()
  } finally { $stream.Dispose() }
  $gcd = Get-Gcd $w $h
  $relacion = '{0}:{1}' -f ($w / $gcd), ($h / $gcd)
  $rows.Add([pscustomobject]@{
    id            = Get-StableId $f.Name
    archivo       = $f.Name
    ancho_px      = $w
    alto_px       = $h
    relacion      = $relacion
    relacion_dec  = [math]::Round($h / $w, 4)
    tamano_bytes  = $f.Length
    tamano_kb     = [math]::Round($f.Length / 1KB, 1)
    sha256        = (Get-FileHash -LiteralPath $f.FullName -Algorithm SHA256).Hash.ToLower()
    dhash         = '{0:x16}' -f $dh
    _dh           = $dh
  })
}

# Duplicados exactos (mismo SHA-256) y similares (dHash con distancia <= umbral)
$bySha = $rows | Group-Object sha256 | Where-Object Count -gt 1
$pairs = New-Object System.Collections.Generic.List[object]
for ($i = 0; $i -lt $rows.Count; $i++) {
  for ($j = $i + 1; $j -lt $rows.Count; $j++) {
    $d = Get-Hamming $rows[$i]._dh $rows[$j]._dh
    $exact = $rows[$i].sha256 -eq $rows[$j].sha256
    if ($exact -or $d -le $UmbralSimilar) {
      $tipo = if ($exact) { 'exacto' } elseif ($d -le 4) { 'casi-identico' } else { 'similar' }
      $pairs.Add([pscustomobject]@{
        id_a = $rows[$i].id; archivo_a = $rows[$i].archivo
        id_b = $rows[$j].id; archivo_b = $rows[$j].archivo
        distancia_dhash = $d
        tipo = $tipo
      })
    }
  }
}

foreach ($r in $rows) {
  $dup = @()
  foreach ($g in $bySha) { if ($g.Group.id -contains $r.id) { $dup += ($g.Group.id | Where-Object { $_ -ne $r.id }) } }
  $near = $pairs | Where-Object { $_.tipo -ne 'exacto' -and ($_.id_a -eq $r.id -or $_.id_b -eq $r.id) } |
    ForEach-Object { if ($_.id_a -eq $r.id) { $_.id_b } else { $_.id_a } }
  $r | Add-Member duplicado_exacto_de ($dup -join ';')
  $r | Add-Member similar_a (@($near) -join ';')
}

$rows | Select-Object id, archivo, ancho_px, alto_px, relacion, relacion_dec, tamano_bytes, tamano_kb, sha256, dhash, duplicado_exacto_de, similar_a |
  Export-Csv -NoTypeInformation -Encoding UTF8 (Join-Path $outDir 'inventario-tecnico.csv')
$pairs | Sort-Object distancia_dhash | Export-Csv -NoTypeInformation -Encoding UTF8 (Join-Path $outDir 'pares-similares.csv')

"Archivos: $($rows.Count)"
"Grupos duplicados exactos: $(@($bySha).Count)"
"Pares similares (umbral $UmbralSimilar): $(@($pairs | Where-Object tipo -ne 'exacto').Count)"
$rows | Group-Object { "$($_.ancho_px)x$($_.alto_px)" } | Sort-Object Count -Descending | ForEach-Object { "  $($_.Name): $($_.Count)" }
