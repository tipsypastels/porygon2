import { logger } from 'core/logger';
import {
  ApplicationCommand,
  AutocompleteInteraction,
  BaseCommandInteraction,
} from 'discord.js';
import {
  AnyCommand,
  Autocomplete,
  ChatCommand,
  Data,
  execute_autocomplete,
  execute_chat_command,
  execute_user_command,
  UserCommand,
} from '.';

interface CellOpts {
  command: AnyCommand;
  data: Data;
  api: ApplicationCommand;
  autocompletes?: Map<string, Autocomplete>;
}

/**
 * A cell stores a command, along with its data, and a factory to build an execution
 * environment for it. Cells are created by the command registar and can't be made
 * dynamically.
 */
export class Cell {
  private command: AnyCommand;
  readonly data: Data;
  private api: ApplicationCommand;
  private autocompletes?: Map<string, Autocomplete>;

  constructor(opts: CellOpts) {
    this.command = opts.command;
    this.data = opts.data;
    this.api = opts.api;
    this.autocompletes = opts.autocompletes;
  }

  get id() {
    return this.api.id;
  }

  get name() {
    return this.data.name;
  }

  get client() {
    return this.api.client;
  }

  call(intr: BaseCommandInteraction | AutocompleteInteraction) {
    if (intr.isCommand()) {
      return execute_chat_command(intr, this, this.command as ChatCommand);
    }

    if (intr.isUserContextMenu()) {
      return execute_user_command(intr, this, this.command as UserCommand);
    }

    if (intr.isAutocomplete()) {
      const { name } = intr.options.getFocused(true);
      const autocomplete = this.autocompletes?.get(name);

      if (!autocomplete) {
        return logger.warn(`Unknown autocomplete for %${this.name}% option %${name}$`);
      }

      return execute_autocomplete(intr, autocomplete);
    }
  }
}
