import { Lib } from 'lib/lib';

export default function pokecom(lib: Lib) {
  lib.importCommands(`${__dirname}/commands`);
}
