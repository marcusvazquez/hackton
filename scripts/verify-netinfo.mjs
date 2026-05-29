import { appendFileSync, existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');
const logPath = join(projectRoot, 'debug-3d2132.log');
const require = createRequire(import.meta.url);

function log(hypothesisId, message, data) {
  const line = JSON.stringify({
    sessionId: '3d2132',
    runId: 'preflight',
    hypothesisId,
    location: 'scripts/verify-netinfo.mjs',
    message,
    data,
    timestamp: Date.now(),
  });
  appendFileSync(logPath, `${line}\n`);
}

const pkgPath = join(
  projectRoot,
  'node_modules',
  '@react-native-community',
  'netinfo',
  'package.json',
);

const exists = existsSync(pkgPath);
let resolved = null;
let resolveError = null;

try {
  resolved = require.resolve('@react-native-community/netinfo', {
    paths: [projectRoot],
  });
} catch (error) {
  resolveError = error instanceof Error ? error.message : String(error);
}

log('A', 'netinfo package.json on disk', { exists, pkgPath });
log('B', 'require.resolve from project root', { resolved, resolveError });
log('C', 'project root', { projectRoot });

if (!exists || !resolved) {
  process.exitCode = 1;
  console.error('NetInfo dependency check FAILED. Run: npm install && npx expo install @react-native-community/netinfo');
} else {
  console.log('NetInfo OK:', resolved);
}
