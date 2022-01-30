import { assert } from 'core/assert';
import { Controller } from 'core/controller';
import { panic } from 'core/logger';
import { ControllerRegistrar } from 'core/registrar';
import { Client, Collection } from 'discord.js';
import { Cache } from 'support/cache';
import { Command, AnyCommand, Data, Args, Intr, ArgsWithSubcommand } from '.';
import { upload_commands } from './upload';

/**
 * A registrar for commands. See the documentation on `Registrar`.
 */
export class CommandRegistrar extends ControllerRegistrar {
  private static CACHE = new Cache((controller: Controller) => new this(controller));

  private pending = new Collection<AnyCommand, Data>();

  static init(controller: Controller) {
    return this.CACHE.get(controller);
  }

  protected constructor(controller: Controller) {
    super('commands', controller);
  }

  protected async synchronize_if_connected(client: Client) {
    const pending_count = this.pending.size;

    if (pending_count === 0) {
      return;
    }

    await upload_commands({
      registrar: this,
      controller: this.controller,
      commands: this.pending,
      client,
    });

    this.pending.clear();
  }

  add_command(command: AnyCommand, data: Data) {
    this.ensure_unique(command, data);
    this.pending.set(command, data);
  }

  private ensure_unique(command: AnyCommand, data: Data) {
    if (this.pending.has(command)) {
      panic(`Command %${data.name}% was added twice to %${this.name}%.`);
    }
  }
}

export function add_command<A extends Args, D extends Data, I extends Intr>(
  controller: Controller,
  command: Command<A, D, I>,
  data: D,
) {
  const registrar = CommandRegistrar.init(controller);
  registrar.add_command(command, data);
}

export function add_sub_commands<
  A extends ArgsWithSubcommand,
  D extends Data,
  I extends Intr,
>(controller: Controller, commands: Record<string, Command<A, D, I>>, data: D) {
  const command: Command<A, D, I> = (args) => {
    const sub = args.opts.sub_command;

    assert(sub, `Didn't get a subcommand for command ${data.name}!`);
    assert(sub in commands, `Unknown subcommand ${sub} for ${data.name}!`);

    const selected = commands[sub];
    return selected(args);
  };

  command.__sub_commands = commands;
  add_command(controller, command, data);
}
