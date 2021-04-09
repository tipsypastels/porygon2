import { Lib } from 'lib/lib';

export default (lib: Lib) => {
  lib.importCommands(`${__dirname}/commands`, { global: true });
};
