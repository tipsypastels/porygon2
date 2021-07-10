import { callCommandFn, CommandFn } from './fn';
import { ApplicationCommandData as Data, CommandInteraction } from 'discord.js';
import { PartialKey } from 'support/type';
import { Command } from '.';

/**
 * Since functions have a `name` property, we can usually just infer the name
 * of the command from that. This is the convention for most commands, so we
 * don't need to repeat it. `name` can still be specified for commands whose names
 * are not identifiers, in which case the function name will be different.
 */
type DataOptionalName = PartialKey<Data, 'name'>;

/**
 * The "local" side of a command. In other words, this encapsulates the
 * command function itself, and all the local options to be sent to the
 * API. Command files export these, and Porygon will wrap them in `Command`s
 * during the upload step.
 */
export class LocalCommand<Opts = unknown> {
  private fn: CommandFn<Opts>;
  readonly data: Data;

  constructor(fn: CommandFn<Opts>, data: DataOptionalName) {
    this.fn = fn;
    this.data = { ...data, name: data.name ?? fn.name };
  }

  get name() {
    return this.data.name;
  }

  call(command: Command, interaction: CommandInteraction) {
    callCommandFn({ fn: this.fn, command, interaction });
  }
}
