import { Role } from 'discord.js';
import { assertRequestable } from 'packages/mod/role_mod/policy';
import { embeddedError } from 'porygon/embed/errors';
import { CommandFn, LocalMultipartCommand } from 'porygon/interaction';

type Opts = { role: Role };

const add: CommandFn<Opts> = async ({ opts, embed, command, author }) => {
  const { role } = opts;

  if (author.roles.cache.has(role.id)) {
    throw embeddedError((e) => e.setTitle(`You already have "${role.name}"!`));
  }

  await assertRequestable(role, command.pkg);
  await author.roles.add(role);
  await embed.okColor().setTitle(`Gave you "${role.name}"!`).reply();
};

const remove: CommandFn<Opts> = async ({ opts, embed, command, author }) => {
  const { role } = opts;

  if (!author.roles.cache.has(role.id)) {
    throw embeddedError((e) => e.setTitle(`You don't have the role "${role.name}".`));
  }

  await assertRequestable(role, command.pkg);
  await author.roles.remove(role);
  await embed.okColor().setTitle(`Took away "${role.name}!"`).reply();
};

export default new LocalMultipartCommand(
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
