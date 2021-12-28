import { ApplicationCommand, BaseCommandInteraction } from 'discord.js';
import {
  AnyCommand,
  ChatCommand,
  Data,
  execute_chat_command,
  execute_user_command,
  UserCommand,
} from '.';

/**
 * A cell stores a command, along with its data, and a factory to build an execution
 * environment for it. Cells are created by the command registar and can't be made
 * dynamically.
 */
export class Cell {
  constructor(
    private command: AnyCommand,
    readonly data: Data,
    private api: ApplicationCommand,
  ) {}

  get id() {
    return this.api.id;
  }

  get name() {
    return this.data.name;
  }

  get client() {
    return this.api.client;
  }

  call(intr: BaseCommandInteraction) {
    if (intr.isCommand()) {
      return execute_chat_command(intr, this, this.command as ChatCommand);
    }

    if (intr.isUserContextMenu()) {
      return execute_user_command(intr, this, this.command as UserCommand);
    }
  }
}
