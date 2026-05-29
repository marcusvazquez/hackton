/**
 * Desarrollo web con HTTPS vía Cloudflare Tunnel (quick tunnel).
 * Expo en :8082 (HTTP) + cloudflared → https://*.trycloudflare.com
 *
 * Requiere cloudflared: winget install Cloudflare.cloudflared
 */
import { spawn, execSync } from 'node:child_process';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const EXPO_PORT = 8082;
const TUNNEL_URL_RE = /https:\/\/[a-z0-9-]+\.trycloudflare\.com\b/i;

/** Libera el puerto en Windows para que Expo no quede en "Skipping dev server". */
function freePortWindows(port) {
  if (process.platform !== 'win32') return;
  try {
    const out = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf8' });
    const pids = new Set();
    for (const line of out.split(/\r?\n/)) {
      if (!line.includes('LISTENING')) continue;
      const parts = line.trim().split(/\s+/);
      const pid = parts[parts.length - 1];
      if (pid && /^\d+$/.test(pid)) pids.add(pid);
    }
    for (const pid of pids) {
      try {
        execSync(`taskkill /F /PID ${pid}`, { stdio: 'ignore' });
        console.log(`   Puerto ${port}: proceso ${pid} detenido.`);
      } catch {
        /* ya terminó */
      }
    }
  } catch {
    /* puerto libre */
  }
}

const CLOUDFLARED_PATHS = [
  'cloudflared',
  'C:\\Users\\DELL\\AppData\\Local\\Microsoft\\WinGet\\Links\\cloudflared.exe',
  'C:\\Users\\DELL\\AppData\\Local\\Microsoft\\WinGet\\Packages\\Cloudflare.cloudflared_Microsoft.Winget.Source_8wekyb3d8bbwe\\cloudflared.exe',
  'C:\\Users\\DELL\\AppData\\Local\\npm-cache\\_npx\\8a26fc3a61fe4212\\node_modules\\cloudflared\\bin\\cloudflared.exe',
  'C:\\Program Files (x86)\\cloudflared\\cloudflared.exe',
  'C:\\Program Files\\cloudflared\\cloudflared.exe'
];

let cloudflaredBin = 'cloudflared';

function hasCloudflared() {
  for (const bin of CLOUDFLARED_PATHS) {
    try {
      execSync(`"${bin}" --version`, { stdio: 'ignore' });
      cloudflaredBin = bin;
      return true;
    } catch {
      // continua buscando
    }
  }
  return false;
}

function waitForHttp(port, attempts = 120) {
  return new Promise((resolve, reject) => {
    let n = 0;
    const tryOnce = () => {
      n += 1;
      const req = http.get(`http://127.0.0.1:${port}`, (res) => {
        res.resume();
        resolve();
      });
      req.on('error', () => {
        if (n >= attempts) {
          reject(new Error(`Expo no respondió en el puerto ${port} a tiempo.`));
        } else {
          const delayMs = n < 8 ? 400 : 800;
          setTimeout(tryOnce, delayMs);
        }
      });
      req.setTimeout(1500, () => {
        req.destroy();
      });
    };
    tryOnce();
  });
}

function spawnProc(command, args, label, stdio = 'inherit', extraEnv = {}) {
  const child = spawn(command, args, {
    cwd: root,
    stdio,
    shell: true,
    env: { ...process.env, FORCE_COLOR: '1', ...extraEnv },
  });
  child.on('error', (err) => {
    console.error(`[${label}]`, err.message);
  });
  return child;
}

function printTunnelBanner(url) {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`  Abre:  ${url}`);
  console.log('  HTTPS con Cloudflare — GPS y cámara en el navegador');
  console.log('');
  console.log(`  En este PC también vale: http://localhost:${EXPO_PORT}`);
  console.log('  No uses https://localhost:8082 — Expo no sirve TLS ahí.');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

console.log('\n🔒 ParaTodos — web seguro (Cloudflare Tunnel)\n');

if (!hasCloudflared()) {
  console.error('❌ No se encontró cloudflared en el PATH.\n');
  console.error('   Instálalo y vuelve a ejecutar npm run web:secure:\n');
  console.error('   winget install Cloudflare.cloudflared\n');
  console.error('   O descarga: https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/\n');
  process.exit(1);
}

console.log(`   1) Liberando puerto ${EXPO_PORT} si estaba ocupado`);
freePortWindows(EXPO_PORT);

console.log(`   2) Arrancando Expo en http://localhost:${EXPO_PORT}`);
console.log('   3) Luego túnel HTTPS → *.trycloudflare.com\n');

let tunnel = null;
let expo = null;
let tunnelUrlPrinted = false;

const shutdown = () => {
  if (tunnel) tunnel.kill('SIGTERM');
  if (expo) expo.kill('SIGTERM');
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

const CLEAR_METRO = process.env.CLEAR_METRO === '1';
const expoArgs = ['expo', 'start', '--web', '--port', String(EXPO_PORT)];
if (CLEAR_METRO) {
  expoArgs.push('--clear');
  console.log('   Metro: caché limpia (CLEAR_METRO=1)\n');
} else {
  console.log('   Metro: reutiliza caché (más rápido). Usa CLEAR_METRO=1 si hay errores raros.\n');
}

function startExpo(tunnelUrl) {
  printTunnelBanner(tunnelUrl);
  console.log(`   Arrancando Expo en http://localhost:${EXPO_PORT} con proxy ${tunnelUrl}\n`);
  expo = spawnProc(
    'npx',
    expoArgs,
    'expo',
    ['inherit', 'inherit', 'inherit'],
    {
      CI: '1',
      EXPO_PACKAGER_PROXY_URL: tunnelUrl,
      DANGEROUSLY_DISABLE_HOST_CHECK: 'true',
    },
  );
}

console.log('\n✅ Iniciando túnel Cloudflare (Expo arranca en cuanto haya URL HTTPS)…\n');

tunnel = spawnProc(
  cloudflaredBin,
  ['tunnel', '--url', `http://127.0.0.1:${EXPO_PORT}`, '--http-host-header', 'localhost'],
  'cloudflared',
  ['ignore', 'pipe', 'pipe'],
);

const onTunnelOutput = (chunk) => {
  const text = chunk.toString();
  process.stdout.write(text);
  if (!tunnelUrlPrinted) {
    const match = text.match(TUNNEL_URL_RE);
    if (match) {
      tunnelUrlPrinted = true;
      const tunnelUrl = match[0];
      startExpo(tunnelUrl);
    }
  }
};

tunnel.stdout.on('data', onTunnelOutput);
tunnel.stderr.on('data', onTunnelOutput);

tunnel.on('exit', (code) => {
  if (code && code !== 0) {
    console.error(`\n❌ cloudflared terminó con código ${code}`);
  }
  shutdown();
});
