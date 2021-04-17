import { ApplicationCommandOption, Role } from 'discord.js';
import { Command, CommandHandler } from 'interaction/command';
import { disambiguate } from 'interaction/command/disambiguate';
import { isDev } from 'support/dev';
import { RoleMod, RoleModOpts } from '../models/role_mod';

type GetOpts = { get: { role: Role } };
type SetOpts = { set: { role: Role } & Partial<RoleModOpts> };
type Opts = GetOpts | SetOpts;

const rolemod: Command<Opts> = async (args) => {
  await disambiguate(args, { get: rolemodGet, set: rolemodSet });
};

const rolemodGet: CommandHandler<GetOpts> = async ({ embed, opts }) => {
  const { role } = opts.get;
  const manager = await RoleMod.init(role);

  await embed.setTitle(role.name).merge(manager).reply();
};

const rolemodSet: CommandHandler<SetOpts> = async ({ embed, opts }) => {
  const { role, ...roleOpts } = opts.set;
  const manager = await RoleMod.init(role);

  await manager.set(roleOpts).save();
  await embed.setTitle(`Role "${role.name}" updated!`).merge(manager).reply();
};

// maybe reuse this for a /role create in the future?
const SETTINGS: ApplicationCommandOption[] = [
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
      ...SETTINGS,
    ],
  },
];

export default rolemod;
