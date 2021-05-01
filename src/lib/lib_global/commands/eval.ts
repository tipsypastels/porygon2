/* eslint-disable @typescript-eslint/no-unused-vars */

import { GuildMember } from 'discord.js';
import { Command } from 'interaction/command';
import { OWNER } from 'secrets.json';
import { isDev } from 'support/dev';
import { codeBlock } from 'support/format';
import { database as databaseImport } from 'porygon/database';
import { InteractionError } from 'interaction/errors';
import * as SettingsImport from 'porygon/settings';

interface Args {
  code: string;
  quiet?: boolean;
}

const evalCommand: Command<Args> = async (args) => {
  const { interaction, member, guild, embed, client, opts, lib } = args;
  const database = databaseImport;
  const Settings = SettingsImport;

  if (!isOwner(member)) {
    throw new InteractionError({
      title: 'No.',
      yieldEmbed: (e) => e.poryThumb('angry'),
    });
  }

  const result = eval(opts.code);

  if (opts.quiet) {
    // TODO: once the public api gets a way to pong, do that
    return;
  }

  await embed
    .okColor()
    .setTitle('Evaluated Code')
    .setDescription(codeBlock(result, { lang: 'js', inspect: true }))
    .reply();
};

evalCommand.commandName = 'eval';
evalCommand.defaultPermission = isDev;
evalCommand.description =
  "If you don't know what this does, you shouldn't be using it.";
evalCommand.options = [
  {
    name: 'code',
    type: 'STRING',
    required: true,
    description: 'Code to be run.',
  },
  {
    name: 'quiet',
    type: 'BOOLEAN',
    required: false,
    description: 'Silences output in response.',
  },
];

export default evalCommand;

const isOwner = (member: GuildMember) => member.id === OWNER;
