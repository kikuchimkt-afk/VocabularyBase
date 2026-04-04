// Wrapper to import edge-tts compiled output directly
// because the package's main entry is a .ts file that Turbopack cannot parse
export { tts, ttsSave, getVoices } from '../../node_modules/edge-tts/out/index.js';
