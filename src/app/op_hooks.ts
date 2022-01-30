import { assert } from 'core/assert';
import { get_command_by_name } from 'core/command';
import { GLOBAL } from 'core/controller';
import { Initializer } from 'core/initializer';

/**
 * Commands that will be enabled for Dakota on every server at startup.
 * These *must* be part of the `GLOBAL` controller.
 */
const COMMANDS_TO_ENABLE_FOR_OP = ['op'];

const enable_op_commands: Initializer = ({ controller }) => {
  assert(controller === GLOBAL, '%enable_op_commands% must run on %GLOBAL%!');

  const promises = COMMANDS_TO_ENABLE_FOR_OP.map(async (name) => {
    const command = get_command_by_name(name, controller);
    assert(command, `Tried to enable unknown command %${name}% for OP!`);
  });
};
