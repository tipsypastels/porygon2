import { ApplicationCommandOption, Role } from 'discord.js';
import { Command, CommandHandler } from 'interaction/command';
import { disambiguate } from 'interaction/command/disambiguate';
import { isDev } from 'support/dev';
import { RoleSettingsManager } from '../models/role_settings_manager';

type GetOpts = { get: { role: Role } };
type SetOpts = {
  set: { role: Role } & Partial<{
    color: string;
    mentionable: boolean;
    requestable: boolean;
    hoisted: boolean;
    bound: boolean;
  }>;
};
type Opts = GetOpts | SetOpts;

const rolesettings: Command<Opts> = async (args) => {
  await disambiguate(args, { get: rolesettingsGet, set: rolesettingsSet });
};

const rolesettingsGet: CommandHandler<GetOpts> = async ({ embed, opts }) => {
  const { role } = opts.get;
  const manager = new RoleSettingsManager(role);
  await manager.load();

  await embed.setTitle(role.name).merge(manager).reply();
};

const rolesettingsSet: CommandHandler<SetOpts> = async ({ embed, opts }) => {
  const { role, ...settings } = opts.set;
  const manager = new RoleSettingsManager(role);
  await manager.save(settings);

  await embed
    .setTitle('Role updated!')
    .addField('Name', role.name)
    .merge(manager)
    .reply();
};

// maybe reuse this for a /role create in the future?
const SETTINGS: ApplicationCommandOption[] = [
  {
    name: 'color',
    type: 'STRING',
    description: 'Color of the role.',
    required: false,
  },
  {
    name: 'hoisted',
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

rolesettings.description = 'Manages role settings.';
rolesettings.defaultPermission = isDev;
rolesettings.options = [
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

export default rolesettings;
