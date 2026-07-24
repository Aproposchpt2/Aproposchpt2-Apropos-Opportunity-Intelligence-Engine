import { mkdir, writeFile } from 'node:fs/promises';

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
console.log('Generated browser-safe AP_COMMAND_CONFIG.');
