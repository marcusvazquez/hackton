const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

const projectRoot = __dirname.replace(/\\/g, '/');

// Solo artefactos locales del repo — no usar /dist/ genérico (rompe node_modules/*/dist).
config.resolver.blockList = [
  ...(Array.isArray(config.resolver.blockList) ? config.resolver.blockList : []),
  new RegExp(`${projectRoot}/_stitch_import/.*`),
  new RegExp(`${projectRoot}/_hackathon_import/.*`),
  new RegExp(`${projectRoot}/\\.expo-tmp-export[^/]*/.*`),
  new RegExp(`${projectRoot}/dist/.*`),
  // Binarios opcionales de @expo/ngrok (otras plataformas) — Metro no debe vigilarlos en Windows.
  /node_modules[/\\]@expo[/\\]ngrok-bin-[^/\\]+[/\\].*/,
];

module.exports = config;
