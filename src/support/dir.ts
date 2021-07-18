import { readdirSync, statSync } from 'fs';
import { join, relative } from 'path';
import { isDev } from './dev';

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
 * Yields each file named `file` in each sub-directory.
 * Ignores other files in the directory.
 */
export function* eachDirectoryWithFile(dir: string, file: string): Generator<string> {
  for (const currentDir of eachDirectory(dir)) {
    const full = join(currentDir, file);

    if (isFile(full)) {
      yield full;
    }
  }
}

/**
 * Returns whether the path is a directory.
 */
export function isDirectory(path: string) {
  try {
    return statSync(path).isDirectory();
  } catch {
    return false;
  }
}

/**
 * Returns whether the path is a file.
 */
export function isFile(path: string) {
  try {
    return statSync(path).isFile();
  } catch {
    return false;
  }
}

/**
 * When using `eachDirectoryWithFile`, when importing JS files you'll want to
 * change the extension based on whether we're running in development mode.
 *
 * Appends `.ts` to `path` when in development, or `.js` otherwise.
 */
export function jsFile(path: string) {
  return path + (isDev ? '.ts' : '.js');
}

interface Opts {
  onFile: 'yield' | 'ignore';
  onDir: 'yield' | 'yield*' | 'ignore';
}

function* eachInternal(dir: string, { onFile, onDir }: Opts): Generator<string> {
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
