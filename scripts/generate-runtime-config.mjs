import { mkdir, readFile, writeFile } from 'node:fs/promises';

const supabaseUrl = process.env.SUPABASE_URL || '';
const anonKey = process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !anonKey) {
  throw new Error('Missing required Netlify environment variables: SUPABASE_URL and/or SUPABASE_ANON_KEY.');
}

await mkdir('assets', { recursive: true });

const runtimeConfig = `window.AP_COMMAND_CONFIG = Object.freeze(${JSON.stringify({
  supabaseUrl,
  anonKey
})});\n`;

await writeFile('assets/runtime-config.js', runtimeConfig, 'utf8');

const indexPath = 'index.html';
const commandCenterScript = '  <script src="assets/command-center.js" defer></script>';
const runtimeScript = '  <script src="assets/runtime-config.js"></script>';
let indexHtml = await readFile(indexPath, 'utf8');

if (!indexHtml.includes('assets/runtime-config.js')) {
  if (!indexHtml.includes(commandCenterScript)) {
    throw new Error('Unable to locate the Command Center script tag in index.html.');
  }
  indexHtml = indexHtml.replace(commandCenterScript, `${runtimeScript}\n${commandCenterScript}`);
  await writeFile(indexPath, indexHtml, 'utf8');
}

console.log('Generated and injected browser-safe AP_COMMAND_CONFIG.');
