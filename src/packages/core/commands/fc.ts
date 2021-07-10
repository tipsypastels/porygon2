import { GuildMember } from 'discord.js';
import { CommandFn, LocalMultipartCommand } from 'porygon/interaction';
import { FriendCodeManager } from '../friend_code_manager';

type GetOpts = { member: GuildMember };
type SetOpts = {
  '3ds': string | null;
  'switch': string | null;
  'go': string | null;
};

const get: CommandFn<GetOpts> = async ({ embed, opts }) => {
  const manager = new FriendCodeManager(opts.member);
  await manager.load();

  await embed
    .infoColor()
    .setTitle('Friend Codes')
    .setAuthorFromMember(opts.member)
    .setFooter('Set or update friend codes with `/fc set`.')
    .merge(manager)
    .reply();
};

const set: CommandFn<SetOpts> = async ({ opts, embed, author }) => {
  const manager = new FriendCodeManager(author);
  await manager.save(opts);

  await embed
    .okColor()
    .setTitle('Friend Codes updated!')
    .setAuthorFromMember(author)
    .merge(manager)
    .reply();
};

export default new LocalMultipartCommand(
  { get, set },
  {
    name: 'fc',
    description: 'Friend-code related utilities.',
    options: [
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
    ],
  },
);
