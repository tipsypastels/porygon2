import { Lib } from 'lib/lib';

export default async (lib: Lib) => {
  await lib.importCommands(`${__dirname}/commands`, { global: true });
};
