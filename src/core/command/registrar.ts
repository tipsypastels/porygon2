import { assert } from 'core/assert';
import { Controller, proper_controller_for_env } from 'core/controller';
import { logger, panic } from 'core/logger';
import { ControllerRegistrar } from 'core/registrar';
import { Client, Collection } from 'discord.js';
import { Cache } from 'support/cache';
import { eager, zip } from 'support/iterator';
import { plural } from 'support/string';
import { Cell, Command, AnyCommand, Data, Args, Intr, ArgsWithSubcommand } from '.';

/**
 * A registrar for commands. See the documentation on `Registrar`.
 */
export class CommandRegistrar extends ControllerRegistrar {
  private static CACHE = new Cache((controller: Controller) => new this(controller));
  private static COMMANDS = new Collection<string, Cell>();

  private commands = new Collection<string, Cell>();
  private pending = new Collection<AnyCommand, Data>();

  static init(prod_controller: Controller) {
    const controller = proper_controller_for_env(prod_controller);
    return this.CACHE.get(controller);
  }

  static get(id: string) {
    return this.COMMANDS.get(id);
  }

  protected constructor(controller: Controller) {
    super('commands', controller);
  }

  async synchronize(client: Client) {
    const pending_count = this.pending.size;

    if (pending_count === 0) {
      return;
    }

    const pending_data = eager(this.pending.values());
    const api_data = await this.controller.upload_commands(pending_data, client);

    for (const [[command, data], [, api]] of zip(this.pending, api_data)) {
      const cell = new Cell({ command, data, api });

      this.commands.set(api.id, cell);
      CommandRegistrar.COMMANDS.set(api.id, cell);
    }

    logger.debug(`%${this.tag}% uploaded %${plural(pending_count, 'command')}%.`);

    this.pending.clear();
  }

  add_command(command: AnyCommand, data: Data) {
    this.ensure_unique(command, data);
    this.pending.set(command, data);
  }

  private ensure_unique(command: AnyCommand, data: Data) {
    if (this.pending.has(command)) {
      panic(`Command %${data.name}% was added twice to %${this.tag}%.`);
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
