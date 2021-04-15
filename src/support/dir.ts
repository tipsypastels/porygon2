import { readdirSync, statSync } from 'fs';
import { join, relative } from 'path';

/**
 * Yields each file in a directory to an iterator.
 */
export function* eachFile(dir: string): Generator<string> {
  yield* eachInternal(dir, { onFile: 'yield', onDir: 'ignore' });
}

/**
 * Same as `eachFile`, but will recurse directories.
 */
export function* eachFileRecursive(dir: string): Generator<string> {
  yield* eachInternal(dir, { onFile: 'yield', onDir: 'yield*' });
}

/**
 * Yields each sub-directory in a directory to an interator.
 * Ignores other files in the directory.
 */
export function* eachDirectory(dir: string): Generator<string> {
  yield* eachInternal(dir, { onFile: 'ignore', onDir: 'yield' });
}

/**
 * Returns whether the path is a directory.
 */
export function isDirectory(path: string) {
  return statSync(path).isDirectory();
}

interface EachInternalOpts {
  onFile: 'yield' | 'ignore';
  onDir: 'yield' | 'yield*' | 'ignore';
}

function* eachInternal(
  dir: string,
  { onFile, onDir }: EachInternalOpts,
): Generator<string> {
  for (const file of readdirSync(dir)) {
    const path = join(dir, file);

    if (file === '..' || file === '.') {
      continue;
    }

    if (isDirectory(path)) {
      switch (onDir) {
        case 'yield':
          yield path;
          break;
        case 'yield*':
          yield* eachInternal(path, { onFile, onDir });
          break;
      }
    } else if (onFile === 'yield') {
      yield relative(__dirname, path);
    }
  }
}
