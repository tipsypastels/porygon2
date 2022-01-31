import { assert } from 'core/assert';
import { get_command_by_name } from 'core/command';
import { GLOBAL } from 'core/controller';
import { Initializer } from 'core/initializer';
import { fetch_owner } from 'core/owner';

/**
 * Commands that will be enabled for Dakota on every server at startup.
 * These *must* be part of the `GLOBAL` controller.
 */
const COMMANDS_TO_ENABLE_FOR_OP = ['op'];

// TODO
// const enable_op_commands: Initializer = ({ controller, client }) => {
//   assert(controller === GLOBAL, '%enable_op_commands% must run on %GLOBAL%!');

//   const owner = fetch_owner(client);
//   const queue: Promise<void>[] = [];

//   for (const name of COMMANDS_TO_ENABLE_FOR_OP) {
//     const cell = get_command_by_name(name, controller);
//     const

//     for (const [, guild] of client.guilds.cache) {
//     }
//   }

//   const promises = COMMANDS_TO_ENABLE_FOR_OP.map(async (name) => {
//     const cell = get_command_by_name(name, controller);
//     assert(cell, `Tried to enable unknown command %${name}% for OP!`);

//     return cell.set_permission(owner, true);
//   });
// };
