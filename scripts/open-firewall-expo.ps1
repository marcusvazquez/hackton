# Ejecutar como Administrador: clic derecho → "Ejecutar con PowerShell" como admin
# O en PowerShell admin: Set-ExecutionPolicy Bypass -Scope Process; .\scripts\open-firewall-expo.ps1

$rules = @(
    @{ Name = 'ParaTodos Expo Metro 8081'; Port = 8081 },
    @{ Name = 'ParaTodos Expo Metro 8082'; Port = 8082 }
)

foreach ($r in $rules) {
    $existing = Get-NetFirewallRule -DisplayName $r.Name -ErrorAction SilentlyContinue
    if ($existing) {
        Write-Host "Regla ya existe: $($r.Name)"
        continue
    }
    New-NetFirewallRule -DisplayName $r.Name -Direction Inbound -Action Allow -Protocol TCP -LocalPort $r.Port -Profile Private,Domain | Out-Null
    Write-Host "Creada regla inbound TCP $($r.Port): $($r.Name)"
}

Write-Host "`nListo. Reinicia: npm run start:go"
