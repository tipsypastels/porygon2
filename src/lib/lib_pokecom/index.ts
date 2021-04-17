import { Lib } from 'lib/lib';

export default async function pokecom(lib: Lib) {
  await Promise.all([
    lib.importCommands(`${__dirname}/commands`),
    lib.importEvents(`${__dirname}/events`),
  ]);
}
