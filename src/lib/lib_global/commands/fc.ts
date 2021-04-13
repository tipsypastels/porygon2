import { GuildMember } from 'discord.js';
import { Command, CommandHandler } from 'interaction/command';
import { disambiguate } from 'interaction/command/disambiguate';
import { FriendCodeManager } from '../models/friend_code_manager';

type GetOpts = { get: { member: GuildMember } };
type SetOpts = {
  set?: { '3ds': string | null; 'switch': string | null; 'go': string | null };
};
type Opts = GetOpts | SetOpts;

const fc: Command<Opts> = async (args) => {
  await disambiguate(args, { get: fcGet, set: fcSet });
};

const fcGet: CommandHandler<GetOpts> = async ({ embed, opts }) => {
  const manager = new FriendCodeManager(opts.get.member);
  await manager.load();

  await embed
    .infoColor()
    .setTitle('Friend Codes')
    .setAuthor(opts.get.member)
    .setFooter('Set or update friend codes with `/fc set`.')
    .merge(manager)
    .reply();
};

const fcSet: CommandHandler<SetOpts> = async ({ opts, embed, member }) => {
  const manager = new FriendCodeManager(member);
  await manager.save(opts.set);

  await embed
    .okColor()
    .setTitle('Friend Codes updated!')
    .setAuthor(member)
    .merge(manager)
    .reply();
};

fc.description = 'Friend-code related utilities.';
fc.options = [
  {
    name: 'get',
    type: 'SUB_COMMAND',
    description: "Get a member's friend codes.",
    options: [
      {
        name: 'member',
        type: 'USER',
        description: 'Member to get.',
        required: true,
      },
    ],
  },
  {
    name: 'set',
    type: 'SUB_COMMAND',
    description: 'Set one or more of your friend codes.',
    options: [
      {
        name: '3ds',
        type: 'STRING',
        required: false,
        description: 'Your 3DS friend code.',
      },
      {
        name: 'switch',
        type: 'STRING',
        required: false,
        description: 'Your Nintendo Switch friend code.',
      },
      {
        name: 'go',
        type: 'STRING',
        required: false,
        description: 'Your Pokémon Go friend code.',
      },
    ],
  },
];

export default fc;
