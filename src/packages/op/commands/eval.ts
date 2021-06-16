/* eslint-disable @typescript-eslint/no-unused-vars */

import { GuildMember } from 'discord.js';
import { Command } from 'porygon/interaction/command';
import { OWNER } from 'secrets.json';
import { isDev } from 'support/dev';
import { codeBlock } from 'support/format';
import { database as databaseImport } from 'porygon/database';
import { InteractionError } from 'interaction/errors';
import * as SettingsImport from 'porygon/settings';

interface Opts {
  code: string;
  quiet?: boolean;
}

const eval_: Command.Fn<Opts> = async (args) => {
  const { interaction, member, guild, embed, client, opts, pkg } = args;
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

export default new Command(eval_, {
  name: 'eval',
  defaultPermission: isDev,
  description: "If you don't know what this does, you shouldn't be using it.",
  options: [
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
  ],
});

const isOwner = (member: GuildMember) => member.id === OWNER;
