// Encrypts src/game.js into payload.js (AES-GCM, key from PBKDF2-SHA256).
// Usage: GAME_PASSWORD='...' node tools/build.mjs   (or run it and type the password)
import { readFile, writeFile } from 'node:fs/promises';
import { webcrypto as crypto } from 'node:crypto';
import { createInterface } from 'node:readline/promises';

const root = new URL('..', import.meta.url);
const ITERATIONS = 310000;

async function password() {
  if (process.env.GAME_PASSWORD) return process.env.GAME_PASSWORD;
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const p = await rl.question('Password: ');
  rl.close();
  return p;
}

const pass = await password();
if (!pass) throw new Error('No password given');
const src = await readFile(new URL('src/game.js', root));
const salt = crypto.getRandomValues(new Uint8Array(16));
const iv = crypto.getRandomValues(new Uint8Array(12));
const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(pass), 'PBKDF2', false, ['deriveKey']);
const key = await crypto.subtle.deriveKey({ name: 'PBKDF2', salt, iterations: ITERATIONS, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, false, ['encrypt']);
const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, src));
const b64 = u => Buffer.from(u).toString('base64');
const payload = { n: ITERATIONS, s: b64(salt), i: b64(iv), c: b64(ct) };
await writeFile(new URL('payload.js', root), `window.VP_PAYLOAD=${JSON.stringify(payload)};\n`);
console.log(`payload.js written (${ct.length} bytes encrypted)`);
