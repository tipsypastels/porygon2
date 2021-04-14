import { Lib } from 'lib/lib';

export default async function pokecom(lib: Lib) {
  await lib.importCommands(`${__dirname}/commands`);
}
