# Sube cambios guardados a https://github.com/marcusvazquez/hackton
Set-Location $PSScriptRoot

git add -A
git status

$msg = Read-Host "Mensaje del commit (Enter = actualizacion)"
if ([string]::IsNullOrWhiteSpace($msg)) {
  $msg = "actualizacion"
}

git commit -m $msg
if ($LASTEXITCODE -ne 0) {
  Write-Host "No hay cambios nuevos que subir (o el commit fallo)."
  exit $LASTEXITCODE
}

git push origin main
Write-Host "Listo: https://github.com/marcusvazquez/hackton"
