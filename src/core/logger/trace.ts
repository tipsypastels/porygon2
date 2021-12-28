import * as parser from 'stacktrace-parser';
import { CODE_ROOT } from 'support/dir';
import { eager } from 'support/iterator';
import { print_table } from './table';

export function print_formatted_frames(stack: string) {
  print_table(
    [
      { name: 'function', color: 'red', alignment: 'left' },
      { name: 'file', alignment: 'left' },
      { name: 'line', color: 'red', alignment: 'right' },
      { name: 'col', color: 'red', alignment: 'right' },
    ],
    eager(each_formatted_row(stack)),
  );
}

export function* each_formatted_row(stack: string) {
  for (const frame of parser.parse(stack)) {
    if (frame.file?.includes('core/logger')) {
      continue; // skip internal machinery
    }

    if (!frame.file?.startsWith(CODE_ROOT)) {
      continue; // skip node_modules, etc
    }

    yield to_row(frame);
  }
}

function to_row(f: parser.StackFrame) {
  const { methodName: func, lineNumber: line, column: col } = f;
  const file = f.file!.replace(`${CODE_ROOT}/`, '');
  return { ['function']: func, file, line, col };
}

export function current_error() {
  try {
    throw new Error();
  } catch (e) {
    return <Error>e;
  }
}
