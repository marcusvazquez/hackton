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

  'C:\\Program Files\\cloudflared\\cloudflared.exe',

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



function httpProbe(url, timeoutMs = 4000) {

  return new Promise((resolve, reject) => {

    const req = http.get(url, (res) => {

      res.resume();

      resolve(res.statusCode ?? 0);

    });

    req.on('error', reject);

    req.setTimeout(timeoutMs, () => {

      req.destroy(new Error('timeout'));

    });

  });

}



function waitForHttp(port, attempts = 180) {

  return new Promise((resolve, reject) => {

    let n = 0;

    const tryOnce = async () => {

      n += 1;

      try {

        await httpProbe(`http://127.0.0.1:${port}`);

        resolve();

        return;

      } catch {

        if (n >= attempts) {

          reject(new Error(`Expo no respondió en el puerto ${port} a tiempo.`));

        } else {

          const delayMs = n < 12 ? 500 : 1000;

          setTimeout(tryOnce, delayMs);

        }

      }

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



function killChild(child) {

  if (!child || child.killed) return Promise.resolve();

  return new Promise((resolve) => {

    child.once('exit', () => resolve());

    try {

      child.kill('SIGTERM');

    } catch {

      resolve();

    }

    setTimeout(() => {

      try {

        child.kill('SIGKILL');

      } catch {

        /* noop */

      }

      resolve();

    }, 3000);

  });

}



function printTunnelBanner(url) {

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  console.log(`  Abre:  ${url}`);

  console.log('  HTTPS con Cloudflare — GPS y cámara en el navegador');

  console.log('');

  console.log(`  En este PC también vale: http://localhost:${EXPO_PORT}`);

  console.log('  Espera a ver "Web Bundled" antes de recargar si tarda.');

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

}



console.log('\n🔒 ParaTodos — web seguro (Cloudflare Tunnel)\n');



if (!hasCloudflared()) {

  console.error('❌ No se encontró cloudflared en el PATH.\n');

  console.error('   Instálalo y vuelve a ejecutar npm run web:secure:\n');

  console.error('   winget install Cloudflare.cloudflared\n');

  process.exit(1);

}



console.log(`   1) Liberando puerto ${EXPO_PORT} si estaba ocupado`);

freePortWindows(EXPO_PORT);



const CLEAR_METRO = process.env.CLEAR_METRO === '1';

const expoArgs = ['expo', 'start', '--web', '--port', String(EXPO_PORT)];

if (CLEAR_METRO) {

  expoArgs.push('--clear');

  console.log('   Metro: caché limpia (CLEAR_METRO=1)\n');

} else {

  console.log('   Metro: reutiliza caché (más rápido). Usa CLEAR_METRO=1 si hay errores raros.\n');

}



let tunnel = null;

let expo = null;

let tunnelUrl = null;

let shuttingDown = false;



const shutdown = async () => {

  if (shuttingDown) return;

  shuttingDown = true;

  await killChild(tunnel);

  await killChild(expo);

  process.exit(0);

};



process.on('SIGINT', () => {

  shutdown();

});

process.on('SIGTERM', () => {

  shutdown();

});



function startExpo(extraEnv = {}) {

  return spawnProc('npx', expoArgs, 'expo', ['inherit', 'inherit', 'inherit'], extraEnv);

}



async function main() {

  console.log('   2) Arrancando Expo (sin túnel) hasta que Metro responda…\n');

  expo = startExpo({ DANGEROUSLY_DISABLE_HOST_CHECK: 'true' });

  await waitForHttp(EXPO_PORT);

  console.log(`\n   ✅ Metro listo en http://localhost:${EXPO_PORT}\n`);



  console.log('   3) Abriendo túnel Cloudflare (HTTP/2, más estable en Windows)…\n');



  tunnelUrl = await new Promise((resolve, reject) => {

    const child = spawnProc(

      cloudflaredBin,

      [

        'tunnel',

        '--url',

        `http://127.0.0.1:${EXPO_PORT}`,

        '--http-host-header',

        'localhost',

        '--protocol',

        'http2',

      ],

      'cloudflared',

      ['ignore', 'pipe', 'pipe'],

    );

    tunnel = child;



    const timeout = setTimeout(() => {
      if (!tunnelUrl) {
        reject(new Error('No se obtuvo URL de trycloudflare.com en 90 s'));
      }
    }, 90000);

    const onData = (chunk) => {
      const text = chunk.toString();
      process.stdout.write(text);
      const match = text.match(TUNNEL_URL_RE);
      if (match) {
        tunnelUrl = match[0];
        clearTimeout(timeout);
        child.stdout.removeListener('data', onData);
        child.stderr.removeListener('data', onData);
        resolve(tunnelUrl);
      }
    };

    child.stdout.on('data', onData);
    child.stderr.on('data', onData);

    child.on('exit', (code) => {
      clearTimeout(timeout);
      if (code && code !== 0 && !tunnelUrl) {
        reject(new Error(`cloudflared terminó con código ${code}`));
      }
    });

  });



  console.log(`\n   4) Reiniciando Expo con proxy ${tunnelUrl}\n`);

  await killChild(expo);

  freePortWindows(EXPO_PORT);



  expo = startExpo({

    EXPO_PACKAGER_PROXY_URL: tunnelUrl,

    DANGEROUSLY_DISABLE_HOST_CHECK: 'true',

  });



  await waitForHttp(EXPO_PORT);

  printTunnelBanner(tunnelUrl);



  tunnel.on('exit', (code) => {

    if (code && code !== 0) {

      console.error(`\n❌ cloudflared terminó con código ${code}`);

    }

    shutdown();

  });

}



main().catch((err) => {

  console.error('\n❌', err.message || err);

  shutdown();

});


