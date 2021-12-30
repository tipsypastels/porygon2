import { panic_assert } from 'core/assert';
import { Controller } from 'core/controller';
import { IntoEmbed } from 'core/embed';
import { eager, join, map } from 'support/iterator';
import { ellipsis, code } from 'support/string';
import { add_command, ChatCommand, ChatCommandData, create_usage_errors } from '.';

type Build = (builder: Builder) => void;
type Storage = Map<string, IntoEmbed>;

interface Builder {
  add(question: string, answer: IntoEmbed): this;
}

const MAX_SIZE = 25;

export function add_faq_command(controller: Controller, build: Build) {
  const storage: Storage = new Map();
  const builder: Builder = {
    add(question: string, answer: IntoEmbed) {
      storage.set(question, answer);
      return this;
    },
  };

  build(builder);
  panic_assert(storage.size > 0, 'FAQ may not be empty!');
  panic_assert(storage.size <= MAX_SIZE, `FAQ size limited to %${MAX_SIZE}%`);

  const faq: ChatCommand = async ({ opts, embed }) => {
    const question = opts.str('question');
    const answer = storage.get(question);

    if (!answer) {
      throw usage_error('unknown_question', question, storage);
    }

    embed.color('info').merge(answer);
  };

  const choices = eager(map((n) => ({ name: n, value: n }), storage.keys()));
  const data: ChatCommandData = {
    name: 'faq',
    description: 'Looks up a frequently asked question.',
    options: [
      {
        name: 'question',
        description: 'The question you would like answered.',
        type: 'STRING',
        required: true,
        choices,
      },
    ],
  };

  add_command(controller, faq, data);
}

const truncate = (s: string) => ellipsis(100, s);

const usage_error = create_usage_errors({
  unknown_question(e, question: string, storage: Storage) {
    // prettier-ignore
    const known = join('\n', map((q) => `❓ ${q}`, storage.values()));
    const bit = storage.size === 1 ? 'is this. Does it' : 'are these. Do they';

    e.err('warning')
      .title('Unknown Question')
      .about(`I don't have an entry for ${code(truncate(question))}`)
      .field(`What I do have ${bit} help?`, known);
  },
});
