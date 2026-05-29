# Cómo abrir Ruta Libre en el navegador

## 1. Iniciar el servidor (terminal en la carpeta del proyecto)

```powershell
npx expo start --web --port 8082 --clear
```

Espera a ver: `Waiting on http://localhost:8082`

## 2. Abrir en el navegador

http://localhost:8082

## Si no carga

1. **Cierra** otras ventanas de Expo (puertos 8081 y 8082 ocupados).
2. En PowerShell, si `npm` falla por permisos, usa:
   ```powershell
   npx expo start --web --port 8082 --clear
   ```
3. Pulsa **Ctrl+Shift+R** en el navegador (recarga forzada).
4. Abre **F12 → Consola** y revisa errores en rojo.

## VS Code / Chrome Debug

El archivo `.vscode/launch.json` usa el puerto **8082**. Primero debe estar corriendo el servidor del paso 1.

## Expo Go (Android / iPhone)

El error rojo **"Could not connect to development server"** casi siempre es el **firewall de Windows** bloqueando el puerto **8081** desde el celular.

### Una sola vez (como Administrador)

Abre **PowerShell como administrador** en la carpeta del proyecto y ejecuta:

```powershell
Set-ExecutionPolicy Bypass -Scope Process -Force
.\scripts\open-firewall-expo.ps1
```

### Cada vez que desarrolles en el teléfono

```powershell
npm run start:go
```

En **Expo Go** → *Enter URL manually*:

```text
exp://172.31.99.134:8081
```

(Si tu IP cambia, mira la que imprime el script al arrancar.)

**Comprueba la red:** en el navegador del celular abre `http://172.31.99.134:8081`. Si no carga, el firewall sigue bloqueando o la Wi‑Fi tiene aislamiento entre dispositivos.

### Se queda en "Loading from…"

Esa pantalla es **Expo Go descargando el JavaScript** desde tu PC (~9 MB). La **primera vez** puede tardar **1–2 minutos** en Wi‑Fi; no cierres la app.

1. Espera a que en la terminal aparezca **"✓ Bundle listo"** (el script precalienta Metro antes de que abras el proyecto).
2. Si lleva más de 3 minutos: sacude el teléfono → **Reload**, o cierra Expo Go y vuelve a abrir la URL.
3. Caché corrupta: `CLEAR=1 npm run start:go` (PowerShell: `$env:CLEAR=1; npm run start:go`).
4. Wi‑Fi lenta o router con aislamiento AP → `npm run start:go:tunnel`.

Si **pasa** "Loading from…" pero ves solo un círculo blanco, espera unos segundos (fuentes y preferencias guardadas). Ya no debería quedarse colgado más de ~8 s.

**Alternativa USB:** con Android Studio / platform-tools instalado: `adb reverse tcp:8081 tcp:8081` y usa `exp://127.0.0.1:8081`.

**Alternativa sin LAN:** en una terminal interactiva (no Cursor en segundo plano): `npm run start:go:tunnel` y escanea el QR de ngrok.

No uses `npm run web:secure` y `npm run start:go` a la vez si uno mata el puerto del otro.

## Subir cambios a GitHub

Guarda tus archivos en Cursor (**Ctrl+S**) y ejecuta en la carpeta del proyecto:

```powershell
git add .
git commit -m "describe tu cambio"
git push origin main
```

Repositorio: https://github.com/marcusvazquez/hackton
