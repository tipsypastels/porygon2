import { Role } from 'discord.js';
import { Command, CommandHandler } from 'interaction/command';
import { disambiguate } from 'interaction/command/disambiguate';
import { assertRequestable } from '../models/role_mod/query';

type AddOpts = { add: { role: Role } };
type RemOpts = { remove: { role: Role } };
type Opts = AddOpts | RemOpts;

const role: Command<Opts> = async (args) => {
  await disambiguate(args, { add: roleAdd, remove: roleRem });
};

const roleAdd: CommandHandler<AddOpts> = async ({
  opts,
  embed,
  lib,
  member,
}) => {
  const { role } = opts.add;

  await assertRequestable(role, lib);
  await member.roles.add(role);
  await embed.okColor().setTitle(`Gave you "${role.name}"!`).reply();
};

const roleRem: CommandHandler<RemOpts> = async ({
  opts,
  embed,
  lib,
  member,
}) => {
  const { role } = opts.remove;

  await assertRequestable(role, lib);
  await member.roles.remove(role);
  await embed.okColor().setTitle(`Took away "${role.name}!"`).reply();
};

role.description = 'Commands relating to roles.';
role.options = [
  {
    name: 'add',
    type: 'SUB_COMMAND',
    description: 'Adds a role.',
    options: [
      {
        name: 'role',
        type: 'ROLE',
        description: 'The role to add.',
        required: true,
      },
    ],
  },
  {
    name: 'remove',
    type: 'SUB_COMMAND',
    description: 'Removes a role.',
    options: [
      {
        name: 'role',
        type: 'ROLE',
        description: 'The role to remove.',
        required: true,
      },
    ],
  },
];

export default role;
