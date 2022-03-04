import { Client, ClientOptions, Interaction } from 'discord.js';
import { IS_DEBUG, IS_DEV, IS_STAGING } from 'support/env';
import { each_file } from 'support/dir';
import { logger } from './logger';
import { Registrar } from './registrar';
import { TimeDifference } from './stat/time';
import { connect_db } from './db';
import { execute_command, is_command } from './command';

export const uptime = new TimeDifference();

const partials: ClientOptions['partials'] = [
  'USER',
  'GUILD_MEMBER',
  'MESSAGE',
  'CHANNEL',
  'REACTION',
];

const intents: ClientOptions['intents'] = [
  'GUILDS',
  'GUILD_BANS',
  'GUILD_MEMBERS',
  'GUILD_MESSAGES',
  'GUILD_PRESENCES',
  'GUILD_EMOJIS_AND_STICKERS',
  'DIRECT_MESSAGES',
];

export function make_client() {
  log_startup();

  const client = new Client({ intents, partials });

  client.once('ready', on_ready);
  client.on('interactionCreate', on_interaction);

  return client;
}

async function on_ready(client: Client) {
  await setup(client);

  uptime.start_timing();
  logger.info('%Ready!%');
}

function log_startup() {
  const vars = { IS_STAGING, IS_DEBUG, IS_DEV };
  const yn = (b: boolean) => (b ? 'yes' : 'no');
  const get = (key: keyof typeof vars) => `%${key}% = %${yn(vars[key])}%`;

  logger.info(`Using config ${get('IS_DEV')}, ${get('IS_STAGING')}, ${get('IS_DEBUG')}.`);
}

function setup(client: Client) {
  return Promise.all([connect_db(), app_setup(client)]);
}

async function app_setup(client: Client) {
  await import_app();
  await Registrar.synchronize(client);
  await clear_global_commands_in_staging(client);
}

function import_app() {
  logger.debug('Setup phase: %discovery%.');
  return each_file('app', (file) => import(`../app/${file}`));
}

function clear_global_commands_in_staging(client: Client) {
  if (IS_STAGING) {
    logger.debug('Setup phase: %globalfix%.');
    return client.application?.commands.set([]);
  }
}

function on_interaction(intr: Interaction) {
  if (is_command(intr)) return execute_command(intr);
}
