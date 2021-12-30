import { logger } from 'core/logger';
import {
  ApplicationCommand,
  AutocompleteInteraction,
  BaseCommandInteraction,
  CommandInteraction,
  MessageContextMenuInteraction,
  UserContextMenuInteraction,
} from 'discord.js';
import {
  AnyCommand,
  ChatCommand,
  Data,
  execute_autocomplete,
  execute_chat_command,
  execute_user_command,
  UserCommand,
} from '.';
import { fetch_autocomplete } from './types/autocomplete/map';

interface CellOpts {
  command: AnyCommand;
  data: Data;
  api: ApplicationCommand;
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

  constructor(opts: CellOpts) {
    this.command = opts.command;
    this.data = opts.data;
    this.api = opts.api;
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

  // TODO: this all feels like too much logic for a simple container..
  // can you have some kind of type safe map? or a move this to a pre-executor
  // step?

  call(intr: BaseCommandInteraction | AutocompleteInteraction) {
    if (intr.isCommand()) return this.call_chat_command(intr);
    if (intr.isUserContextMenu()) return this.call_user_context_menu(intr);
    if (intr.isMessageContextMenu()) return this.call_message_context_menu(intr);
    if (intr.isAutocomplete()) return this.call_autocomplete(intr);
  }

  private call_chat_command(intr: CommandInteraction) {
    return execute_chat_command(intr, this, this.command as ChatCommand);
  }

  private call_user_context_menu(intr: UserContextMenuInteraction) {
    return execute_user_command(intr, this, this.command as UserCommand);
  }

  private call_message_context_menu(_intr: MessageContextMenuInteraction) {
    return; // TODO
  }

  private call_autocomplete(intr: AutocompleteInteraction) {
    const command = this.get_command_target(intr);
    if (!command) return;

    const { name } = intr.options.getFocused(true);
    const autocomplete = fetch_autocomplete(command, name);

    if (!autocomplete) {
      return logger.warn(`Unknown autocomplete for %${this.name}% option %${name}%`);
    }

    return execute_autocomplete(intr, autocomplete);
  }

  private get_command_target(intr: CommandInteraction | AutocompleteInteraction) {
    const name = intr.options.getSubcommand(false);
    if (!name) return this.command;

    const subcommand = this.command.__sub_commands?.[name];
    if (subcommand) return subcommand;

    return logger.warn(`Unknown subcommand target %${name}% for %${this.name}%`);
  }
}
