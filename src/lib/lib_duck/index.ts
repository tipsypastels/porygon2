import { Lib } from 'lib/lib';

export default async function duck(lib: Lib) {
  await lib.importCommands(`${__dirname}/commands`);
}
