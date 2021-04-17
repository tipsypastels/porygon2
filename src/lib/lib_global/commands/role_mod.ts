import { ApplicationCommandOption, Role } from 'discord.js';
import { Command, CommandHandler } from 'interaction/command';
import { disambiguate } from 'interaction/command/disambiguate';
import { isDev } from 'support/dev';
import {
  RoleModOpts,
  updateRoleMod,
  createRoleMod,
  fetchRoleMod,
} from '../models/role_mod';

type GetOpts = { get: { role: Role } };
type SetOpts = { set: { role: Role } & Partial<RoleModOpts> };
type CreateOpts = { create: Partial<RoleModOpts> };
type Opts = GetOpts | SetOpts | CreateOpts;

const rolemod: Command<Opts> = async (args) => {
  await disambiguate(args, {
    get: rolemodGet,
    set: rolemodSet,
    create: rolemodCreate,
  });
};

const rolemodGet: CommandHandler<GetOpts> = async ({ embed, opts }) => {
  const { role } = opts.get;
  const result = await fetchRoleMod(role);

  await embed.infoColor().setTitle(role.name).merge(result).reply();
};

const rolemodSet: CommandHandler<SetOpts> = async ({ embed, opts }) => {
  const { role, ...roleOpts } = opts.set;
  const result = await updateRoleMod(role, roleOpts);

  await embed
    .okColor()
    .setTitle(`Role "${role.name}" updated!`)
    .merge(result)
    .reply();
};

const rolemodCreate: CommandHandler<CreateOpts> = async ({
  embed,
  opts,
  guild,
}) => {
  const result = await createRoleMod(guild, opts.create);
  await embed.okColor().merge(result).reply();
};

rolemod.description = 'Manages role settings.';
rolemod.defaultPermission = isDev;
rolemod.options = [
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
];

export default rolemod;

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
