import { Lib } from 'lib/lib';

export default function duck(lib: Lib) {
  lib.importCommands(`${__dirname}/commands`);
}
