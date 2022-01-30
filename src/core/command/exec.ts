import { logger, panic } from 'core/logger';
import {
  Interaction as AnyIntr,
  AutocompleteInteraction as AutocompleteIntr,
  CommandInteraction as CommandIntr,
  UserContextMenuInteraction as UserIntr,
  MessageContextMenuInteraction as MessageIntr,
} from 'discord.js';
import {
  execute_autocomplete,
  execute_chat_command,
  execute_user_command,
  get_command,
} from '.';

type Intr = CommandIntr | UserIntr | MessageIntr | AutocompleteIntr;

/**
 * The top-level command execution function.
 *
 * This will ripple through a bunch of sub-layers and executors defined
 * by individual command types, but if you're reading this you can just
 * pretend none of that exists.
 */
export function execute_command(intr: Intr) {
  const cell = get_command(intr.commandId);

  if (!cell) {
    return logger.debug(`Requested unknown command: %${intr.commandName}%.`);
  }

  // avert your eyes for a few lines...
  if (intr.isCommand()) return execute_chat_command(intr, cell);
  if (intr.isUserContextMenu()) return execute_user_command(intr, cell);
  if (intr.isMessageContextMenu()) panic('TODO message context menus');
  if (intr.isAutocomplete()) return execute_autocomplete(intr, cell);
}

/**
 * Is this interaction actually a command? Questions for the philosophers.
 */
export function is_command(intr: AnyIntr): intr is Intr {
  return intr.type.startsWith('APPLICATION_COMMAND');
}
