import { GuildMember } from 'discord.js';
import { Command } from 'interaction/command';
import { OWNER } from 'secrets.json';
import { codeBlock } from 'support/format';

interface Args {
  code: string;
  quiet?: boolean;
}

const evalCommand: Command<Args> = (args) => {
  // bring all values into scope for eval
  // eslint-disable-next-line
  const { interaction, member, guild, reply, embed, client, opts } = args;

  if (!isOwner(member)) {
    return reply(embed.errorColor().setTitle('Hahahahah no'));
  }

  const result = eval(opts.code);

  if (opts.quiet) {
    // TODO: once the public api gets a way to pong, do that
    return;
  }

  embed
    .okColor()
    .setTitle('Evaluated Code')
    .setDescription(codeBlock(result, { lang: 'js', inspect: true }));

  return reply(embed);
};

evalCommand.commandName = 'eval';
evalCommand.defaultPermission = false;
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
