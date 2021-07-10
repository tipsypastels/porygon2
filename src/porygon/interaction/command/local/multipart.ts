import { ApplicationCommandData as Data } from 'discord.js';
import { extractOnlyKey } from 'support/object';
import { CommandFn } from '../fn';
import { LocalCommand } from '../local';

/**
 * An object of commands, where the key corresponds to the name of
 * the command subgroup, and the value is the handler function.
 */
type MultipartFns<Opts> = {
  [K in keyof Opts]: CommandFn<Opts[K]>;
};

/**
 * A multipart command has several function bodies, based on which
 * command subgroup is used.
 *
 * Unlike the superclass, the `name` property of `Data` may not be
 * elided, since it can't be inferred from the function in this case.
 */
export class LocalMultipartCommand<Opts> extends LocalCommand<Opts> {
  constructor(fns: MultipartFns<Opts>, data: Data) {
    const fn: CommandFn<Opts> = async (args) => {
      const key = extractOnlyKey(args.opts);
      const newArgs = { ...args, opts: args.opts[key] };
      await fns[key](newArgs);
    };

    super(fn, data);
  }
}
