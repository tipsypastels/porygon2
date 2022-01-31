import { FriendCodeType } from '@prisma/client';
import { add_sub_commands, ChatCommand, create_usage_errors } from 'core/command';
import { POKECOM } from 'core/controller';
import { each } from 'support/array';
import { create_fc_handle, fc_clear, fc_get, fc_set } from './impl/fc';

const get: ChatCommand = async ({ opts, author, embed }) => {
  const member = opts.maybe_member('member') ?? author;
  const is_self = member.id === author.id;

  const handle = create_fc_handle(member.id);
  const entries = await fc_get(handle);

  if (entries.length) {
    each((e) => embed.field(TYPE_NAMES[e.type], e.code), entries);
  } else {
    const prefix = is_self ? 'You have' : `${member.displayName} has`;
    embed.about(`${prefix} no friend codes.`);
  }

  embed.color('info').title('Friend Codes').author_member(member);
};

const set: ChatCommand = async ({ opts, author, embed, reply }) => {
  reply.set_ephemeral();

  const handle = create_fc_handle(author.id);
  const result = await fc_set(handle, [
    { type: 'SWITCH', code: opts.maybe_str('switch') },
    { type: 'THREEDS', code: opts.maybe_str('3ds') },
    { type: 'GO', code: opts.maybe_str('go') },
  ]);

  if (!result.ok) {
    switch (result.error) {
      case 'no_op': {
        throw error('no_op_set');
      }
      case 'untidy': {
        throw error('untidy_set', result.untidy_code);
      }
    }
  }

  const { changed } = result;
  const changed_types = changed.map((x) => x.type);
  const unchanged = await fc_get(handle, { exclude_types: changed_types });

  function embed_entries(entries: typeof changed, is_changed: boolean) {
    for (const { type, code } of entries) {
      const should_label_as_updated = is_changed && unchanged.length > 0;
      const title = `${TYPE_NAMES[type]}${should_label_as_updated ? ' (Updated!)' : ''}`;
      embed.field(title, code);
    }
  }

  embed_entries(changed, true);
  embed_entries(unchanged, false);

  embed.color('ok').title('Friend Codes updated!');
};

const clear: ChatCommand = async ({ opts, author, embed, reply }) => {
  reply.set_ephemeral();

  type Target = 'ALL' | FriendCodeType;
  const target = <Target>opts.str('code');
  const query = target === 'ALL' ? undefined : target;

  const handle = await create_fc_handle(author.id);
  const result = await fc_clear(handle, query);

  if (!result.ok) {
    throw target === 'ALL' ? error('no_op_clear_all') : error('no_op_clear', target);
  }

  embed.color('ok');

  if (target === 'ALL') {
    embed
      .title('Friend Codes cleared!')
      .about('All of your friend codes have been purged from my database.');
  } else {
    embed
      .title('Friend Code cleared!')
      .about(`Your ${TYPE_NAMES[target]} friend code has been purged from my database.`);
  }
};

const commands = { get, set, clear };

add_sub_commands(POKECOM, commands, {
  name: 'fc',
  description: 'Friend-code related utilities.',
  options: [
    {
      name: 'get',
      type: 'SUB_COMMAND',
      description: "Gets a member's friend codes.",
      options: [
        {
          name: 'member',
          type: 'USER',
          description: 'Member to get. Defaults to you if unset.',
          required: false,
        },
      ],
    },
    {
      name: 'set',
      type: 'SUB_COMMAND',
      description: 'Set one or more of your friend codes.',
      options: [
        {
          name: 'switch',
          type: 'STRING',
          required: false,
          description: 'Your Nintendo Switch friend code.',
        },
        {
          name: '3ds',
          type: 'STRING',
          required: false,
          description: 'Your 3DS friend code.',
        },

        {
          name: 'go',
          type: 'STRING',
          required: false,
          description: 'Your Pokémon Go friend code.',
        },
      ],
    },
    {
      name: 'clear',
      type: 'SUB_COMMAND',
      description: 'Clear one or all of your friend codes from the database.',
      options: [
        {
          name: 'code',
          type: 'STRING',
          required: true,
          description: 'The code to clear.',
          choices: [
            { name: 'Switch', value: 'SWITCH' },
            { name: '3DS', value: 'THREEDS' },
            { name: 'GO', value: 'GO' },
            { name: 'All', value: 'ALL' },
          ],
        },
      ],
    },
  ],
});

const TYPE_NAMES: Record<FriendCodeType, string> = {
  THREEDS: '3DS',
  SWITCH: 'Switch',
  GO: 'Go',
};

/* -------------------------------------------------------------------------- */
/*                                   Errors                                   */
/* -------------------------------------------------------------------------- */

const error = create_usage_errors({
  no_op_set(e) {
    e.err('warning')
      .title('You used /fc set with no parameters.')
      .about('Please provide at least one of `3ds`, `switch`, or `go` to set.');
  },

  untidy_set(e, code: string) {
    e.err('warning')
      .title(`${code} is not a valid friend code.`)
      .about('Valid friend codes look like `####-####-####`.');
  },

  no_op_clear(e, type: FriendCodeType) {
    e.err('warning')
      .title('Clear that?')
      .about(`You don't have a saved friend code for ${TYPE_NAMES[type]}.`);
  },

  no_op_clear_all(e) {
    e.err('warning').title('Clear what?').about("You don't have any saved friend codes.");
  },
});
