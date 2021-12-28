import { join } from 'path';
import { stat, readdir } from 'fs/promises';
import { IS_DEV } from './env';

export const CODE_DIR = IS_DEV ? 'src' : 'dist';
export const CODE_ROOT = join(process.cwd(), CODE_DIR);

export async function each_file(dir: string, fn: (file: string) => Promise<void>) {
  const root = join(CODE_ROOT, dir);
  const files = await readdir(root);

  const promises = files.map(async (file) => {
    const path = join(root, file);
    if (await is_file(path)) fn(file);
  });

  await Promise.all(promises);
}

export async function is_file(file: string) {
  return (await stat(file)).isFile();
}
