/**
 * Expo Go en LAN (puerto 8081) con firewall y hostname correctos para Android/iOS.
 *
 * Uso: npm run start:go
 */
import { spawn, execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const EXPO_PORT = 8081;
const FIREWALL_RULE = 'ParaTodos Expo Metro 8081';
const ANDROID_BUNDLE_PATH =
  '/index.ts.bundle?platform=android&dev=true&hot=false&lazy=true&transform.engine=hermes&transform.bytecode=1&transform.routerRoot=app&unstable_transformProfile=hermes-stable';

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForMetro(port, maxWaitMs = 120_000) {
  const deadline = Date.now() + maxWaitMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/status`);
      if (res.ok) return true;
    } catch {
      /* Metro aún no escucha */
    }
    await sleep(400);
  }
  return false;
}

async function prewarmAndroidBundle(port) {
  const url = `http://127.0.0.1:${port}${ANDROID_BUNDLE_PATH}`;
  console.log(
    '\n   ⏳ Precalentando bundle Android en Metro (~15–60 s la primera vez).\n' +
      '      Cuando termine, abre Expo Go: la pantalla "Loading from…" debería pasar más rápido.\n',
  );
  const started = Date.now();
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`   ⚠️  Precalentado falló: HTTP ${res.status}\n`);
      return;
    }
    await res.arrayBuffer();
    const sec = ((Date.now() - started) / 1000).toFixed(1);
    const len = Number(res.headers.get('content-length') ?? 0);
    const sizeHint = len > 0 ? `${Math.round(len / 1e6)} MB aprox.` : 'descargado';
    console.log(`   ✓ Bundle listo en ${sec}s (${sizeHint}).\n`);
  } catch (err) {
    console.warn(`   ⚠️  No se pudo precalentar: ${err instanceof Error ? err.message : err}\n`);
  }
}

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
        /* noop */
      }
    }
  } catch {
    /* puerto libre */
  }
}

function getLanIPv4() {
  if (process.platform === 'win32') {
    try {
      const out = execSync(
        'powershell -NoProfile -Command "(Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -notlike \'127.*\' -and $_.PrefixOrigin -ne \'WellKnown\' -and $_.InterfaceAlias -notmatch \'vEthernet|WSL|Virtual|Loopback\' } | Select-Object -First 1).IPAddress"',
        { encoding: 'utf8' },
      ).trim();
      if (out && /^\d+\.\d+\.\d+\.\d+$/.test(out)) return out;
    } catch {
      /* fallback */
    }
  }
  return null;
}

function ensureFirewallRule(port) {
  if (process.platform !== 'win32') return true;
  try {
    execSync(`netsh advfirewall firewall show rule name="${FIREWALL_RULE}"`, { stdio: 'ignore' });
    return true;
  } catch {
    try {
      execSync(
        `netsh advfirewall firewall add rule name="${FIREWALL_RULE}" dir=in action=allow protocol=TCP localport=${port} profile=private,domain enable=yes`,
        { stdio: 'inherit' },
      );
      console.log(`   Firewall: regla "${FIREWALL_RULE}" creada (TCP ${port}).\n`);
      return true;
    } catch {
      console.warn(
        `\n   ⚠️  No se pudo crear la regla de firewall (¿ejecutar terminal como Administrador?).\n` +
          `   Si el teléfono no conecta, abre manualmente el puerto ${port} o usa USB:\n` +
          `   adb reverse tcp:${port} tcp:${port}\n`,
      );
      return false;
    }
  }
}

function hasAdb() {
  try {
    execSync('adb version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function tryAdbReverse(port) {
  if (!hasAdb()) return;
  try {
    const devices = execSync('adb devices', { encoding: 'utf8' });
    if (!/device\s*$/m.test(devices.replace('List of devices attached', ''))) return;
    execSync(`adb reverse tcp:${port} tcp:${port}`, { stdio: 'ignore' });
    console.log(`   adb reverse tcp:${port} tcp:${port} — OK (usa exp://127.0.0.1:${port} si LAN falla)\n`);
  } catch {
    /* sin dispositivo USB */
  }
}

function printBanner(lanIp) {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  ParaTodos — Expo Go (Metro :8081)');
  console.log('');
  if (lanIp) {
    console.log(`  Misma Wi‑Fi — URL manual en Expo Go:`);
    console.log(`  exp://${lanIp}:${EXPO_PORT}`);
    console.log('');
    console.log(`  Prueba en el navegador del teléfono:`);
    console.log(`  http://${lanIp}:${EXPO_PORT}`);
  }
  console.log('');
  console.log('  USB + adb reverse → exp://127.0.0.1:8081');
  console.log('  "Loading from…" puede tardar 1–2 min la 1ª vez (~9 MB). Espera o usa túnel.');
  console.log('  Si sigue en rojo: npm run start:go:tunnel (terminal interactiva)');
  console.log('  No corras web:secure al mismo tiempo (usa puerto 8082).');
  console.log('  Caché limpia: CLEAR=1 npm run start:go');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

console.log('\n📱 ParaTodos — Expo Go (LAN)\n');

freePortWindows(EXPO_PORT);

const lanIp = getLanIPv4();
if (lanIp) {
  console.log(`   IP LAN detectada: ${lanIp}`);
} else {
  console.warn('   ⚠️  No se detectó IP LAN; Expo usará la predeterminada.\n');
}

ensureFirewallRule(EXPO_PORT);
tryAdbReverse(EXPO_PORT);
printBanner(lanIp);

const expoEnv = {
  ...process.env,
  FORCE_COLOR: '1',
  REACT_NATIVE_PACKAGER_HOSTNAME: lanIp || process.env.REACT_NATIVE_PACKAGER_HOSTNAME || '',
  EXPO_DEVTOOLS_LISTEN_ADDRESS: '0.0.0.0',
  DANGEROUSLY_DISABLE_HOST_CHECK: 'true',
};

const expoArgs = ['expo', 'start', '--port', String(EXPO_PORT), '--lan'];
if (process.env.CLEAR === '1' || process.env.CLEAR_METRO === '1') {
  expoArgs.push('--clear');
  console.log('   Metro: caché limpia (--clear)\n');
}

const child = spawn(
  'npx',
  expoArgs,
  {
    cwd: root,
    stdio: 'inherit',
    shell: true,
    env: expoEnv,
  },
);

void (async () => {
  const ready = await waitForMetro(EXPO_PORT);
  if (ready) {
    await prewarmAndroidBundle(EXPO_PORT);
  } else {
    console.warn('   ⚠️  Metro no respondió a tiempo; precalentado omitido.\n');
  }
})();

child.on('error', (err) => {
  console.error('[expo]', err.message);
  process.exit(1);
});

child.on('exit', (code) => {
  process.exit(code ?? 0);
});

process.on('SIGINT', () => {
  try {
    child.kill('SIGTERM');
  } catch {
    /* noop */
  }
});
