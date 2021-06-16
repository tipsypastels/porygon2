import { ApplicationCommandOption, Role } from 'discord.js';
import { Command } from 'porygon/interaction';
import { isDev } from 'support/dev';
import {
  RoleModOpts,
  updateRoleMod,
  createRoleMod,
  fetchRoleMod,
} from '../role_mod';

type GetOpts = { role: Role };
type SetOpts = { role: Role } & Partial<RoleModOpts>;
type CreateOpts = Partial<RoleModOpts>;

const get: Command.Fn<GetOpts> = async ({ embed, opts }) => {
  const { role } = opts;
  const result = await fetchRoleMod(role);

  await embed.infoColor().setTitle(role.name).merge(result).reply();
};

const set: Command.Fn<SetOpts> = async ({ embed, opts }) => {
  const { role, ...roleOpts } = opts;
  const result = await updateRoleMod(role, roleOpts);

  await embed
    .okColor()
    .setTitle(`Role "${role.name}" updated!`)
    .merge(result)
    .reply();
};

const create: Command.Fn<CreateOpts> = async ({ embed, opts, guild }) => {
  const result = await createRoleMod(guild, opts);
  await embed.okColor().merge(result).reply();
};

export default new Command.Multipart(
  { get, set, create },
  {
    name: 'rolemod',
    description: 'Manages role settings.',
    defaultPermission: isDev,
    options: [
      {
        name: 'get',
        type: 'SUB_COMMAND',
        description: 'Gets settings for a role.',
        options: [
          {
            name: 'role',
            type: 'ROLE',
            description: 'The role to show settings for.',
            required: true,
          },
        ],
      },
      {
        name: 'set',
        type: 'SUB_COMMAND',
        description: 'Updates settings for a role.',
        options: [
          {
            name: 'role',
            type: 'ROLE',
            description: 'The role to update.',
            required: true,
          },
          ...createRoleModOptions({ isNameOptional: true }),
        ],
      },
      {
        name: 'create',
        type: 'SUB_COMMAND',
        description: 'Creates a new role with the specified settings.',
        options: createRoleModOptions({ isNameOptional: false }),
      },
    ],
  },
);

function createRoleModOptions({
  isNameOptional = false,
}): ApplicationCommandOption[] {
  return [
    {
      name: 'name',
      type: 'STRING',
      description: 'Name of the role.',
      required: !isNameOptional,
    },
    {
      name: 'hoist',
      type: 'BOOLEAN',
      description: 'Whether to hoist the role.',
      required: false,
    },
    {
      name: 'mentionable',
      type: 'BOOLEAN',
      description: 'Whether others can mention the role.',
      required: false,
    },
    {
      name: 'requestable',
      type: 'BOOLEAN',
      description: 'Whether users can give themselves the role.',
      required: false,
    },
    {
      name: 'bound',
      type: 'BOOLEAN',
      description: 'Whether the role stays with users across rejoins.',
      required: false,
    },
  ];
}
