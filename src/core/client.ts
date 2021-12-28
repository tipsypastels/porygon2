import { BaseCommandInteraction, Client, ClientOptions, Interaction } from 'discord.js';
import { IS_DEV } from 'support/env';
import { each_file } from 'support/dir';
import { CommandRegistrar } from './command';
import { logger, panic } from './logger';
import { Registrar } from './registrar';
import { TimeDifference } from './stat/time';
import { $db } from './db';

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
];

export function make_client() {
  const client = new Client({ intents, partials });

  client.once('ready', on_ready);
  client.on('interactionCreate', on_interaction);

  return client;
}

function setup(client: Client) {
  return Promise.all([connect_db(), app_setup(client)]);
}

function connect_db() {
  return $db
    .$connect()
    .then(() => logger.debug('Database connected!'))
    .catch((e: Error) => panic(`Database disconnected! ${e.message}`));
}

async function app_setup(client: Client) {
  await import_app();
  await Registrar.synchronize(client);
  await clear_global_commands_in_dev(client);
}

function import_app() {
  logger.debug('Setup phase: %discovery%.');
  return each_file('app', (file) => import(`../app/${file}`));
}

function clear_global_commands_in_dev(client: Client) {
  if (IS_DEV) {
    logger.debug('Setup phase: %globalfix%.');
    return client.application?.commands.set([]);
  }
}

async function on_ready(client: Client) {
  await setup(client);

  uptime.start_timing();
  logger.info('%Ready!%');
}

function on_interaction(intr: Interaction) {
  if (intr instanceof BaseCommandInteraction) {
    const command = CommandRegistrar.get(intr.commandId);

    if (!command) {
      return logger.debug(`Requested unknown command: %${intr.commandName}%.`);
    }

    command.call(intr);
  }
}
