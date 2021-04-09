import { readdirSync, statSync } from 'fs';
import { join, relative } from 'path';

/**
 * Yields each file in a directory recursively to an iterator.
 */
export function* eachFile(dir: string): Generator<string> {
  for (const file of readdirSync(dir)) {
    const absFile = join(dir, file);

    if (statSync(absFile).isDirectory()) {
      yield* eachFile(absFile);
    } else {
      yield relative(__dirname, absFile);
    }
  }
}
