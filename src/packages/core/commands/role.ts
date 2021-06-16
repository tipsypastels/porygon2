import { Role } from 'discord.js';
import { Command } from 'porygon/interaction/command';
import { InteractionWarning } from 'interaction/errors';
import { assertRequestable } from 'packages/mod/role_mod/policy';

type Opts = { role: Role };

const add: Command.Fn<Opts> = async ({ opts, embed, pkg, member }) => {
  const { role } = opts;

  if (member.roles.cache.has(role.id)) {
    throw new InteractionWarning(`You already have "${role.name}"!`);
  }

  await assertRequestable(role, pkg);
  await member.roles.add(role);
  await embed.okColor().setTitle(`Gave you "${role.name}"!`).reply();
};

const remove: Command.Fn<Opts> = async ({ opts, embed, pkg, member }) => {
  const { role } = opts;

  if (!member.roles.cache.has(role.id)) {
    throw new InteractionWarning(`You don't have the role "${role.name}".`);
  }

  await assertRequestable(role, pkg);
  await member.roles.remove(role);
  await embed.okColor().setTitle(`Took away "${role.name}!"`).reply();
};

export default new Command.Multipart(
  { add, remove },
  {
    name: 'role',
    description: 'Commands relating to roles.',
    options: [
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
    ],
  },
);
