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

## Subir cambios a GitHub

Guarda tus archivos en Cursor (**Ctrl+S**) y ejecuta en la carpeta del proyecto:

```powershell
git add .
git commit -m "describe tu cambio"
git push origin main
```

Repositorio: https://github.com/marcusvazquez/hackton
