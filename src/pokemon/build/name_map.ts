/**
 * Creates a "name map" - a map of ALL data classes mixed together,
 * indexed by lowercase name (not id). Each name points to a kind-id name, which
 * can be looked up from there.
 *
 * The kind map is created at build time and should never be
 * done dynamically, as it is expensive to create.
 *
 * The reason this exists is to facilitate searching, without having to
 * use IDs or explicitly specify the kind. /dt Mega Charizard or the like
 * should just work.
 *
 * The naming format (lowercase names) is used because Pokemon names can't
 * be unambiguously cased correctly. This means that the key can't actually
 * be used in user-facing text, such as a did-you-mean, and you must look
 * up the actual entry. But this is usually fine.
 */

import { readdir, writeFile } from 'fs/promises';
import type { Kind } from '../kind';
import type { RawBase } from '../models';

interface Entry {
  kind: Kind;
  id: string;
}

type Out = Record<string, Entry>;

async function createNameMap() {
  const files = await readdir(`${__dirname}/../data`);
  const kinds = files.filter((f) => !f.includes('.')) as Kind[];
  const out: Out = {};

  const promises = kinds.map(async (kind) => {
    await eachOfKind(out, kind);
  });

  await Promise.all(promises);

  const json = JSON.stringify(out, null, 2);

  await writeFile(`${__dirname}/../data/name_map.json`, json);
}

async function eachOfKind(out: Out, kind: Kind) {
  const files = await readdir(`${__dirname}/../data/${kind}`);
  const promises = files.map(async (file) => {
    const id = file.replace(/\.json$/, '');
    const mod = await import(`../data/${kind}/${file}`);
    const raw: RawBase = mod.default;
    const name = raw.name.toLowerCase();

    out[name] = { id, kind };
  });

  await Promise.all(promises);
}

if (require.main === module) {
  createNameMap();
} else {
  throw new Error(
    "name_map.ts should be run via `yarn createNameMap`, not imported. It's part of the build step.",
  );
}
