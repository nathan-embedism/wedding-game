// Decrypts payload.js back into src/game.js so the game can be edited.
// Usage: GAME_PASSWORD='...' node tools/unpack.mjs   (or run it and type the password)
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { webcrypto as crypto } from 'node:crypto';
import { createInterface } from 'node:readline/promises';

const root = new URL('..', import.meta.url);

async function password() {
  if (process.env.GAME_PASSWORD) return process.env.GAME_PASSWORD;
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const p = await rl.question('Password: ');
  rl.close();
  return p;
}

const text = await readFile(new URL('payload.js', root), 'utf8');
const P = JSON.parse(text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1));
const pass = await password();
const buf = s => Buffer.from(s, 'base64');
const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(pass), 'PBKDF2', false, ['deriveKey']);
const key = await crypto.subtle.deriveKey({ name: 'PBKDF2', salt: buf(P.s), iterations: P.n, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, false, ['decrypt']);
const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: buf(P.i) }, key, buf(P.c));
await mkdir(new URL('src/', root), { recursive: true });
await writeFile(new URL('src/game.js', root), Buffer.from(pt));
console.log('src/game.js restored');
