import { add_command, ChatCommand, ChatCommandData } from 'core/command';
import { Controller, DUCK } from 'core/controller';
import { logger } from 'core/logger';
import fs, { WriteStream } from 'fs';
import { random } from 'support/array';
import { Cache } from 'support/cache';
import { tap } from 'support/fn';
import { code_block } from 'support/string';

add_ai_command(DUCK, {
  name: 'pory',
  description: 'Speaks to Porygon.',
  fallback: 'hi im pory',
  embed: {
    title: 'Porygon Talk Show',
  },
  option: {
    name: 'prompt',
    description: 'The message to feed to Pory for future sentences.',
  },
});

/* -------------------------------------------------------------------------- */
/*                               Implementation                               */
/* -------------------------------------------------------------------------- */

interface AddAiOpts {
  name: string;
  description: string;
  fallback: string;
  embed: { title: string };
  option: { name: string; description: string; required?: boolean };
}

const ORDER = 3;
const SPEAK_LEN = 50;

function add_ai_command(controller: Controller, add_opts: AddAiOpts) {
  const ai: ChatCommand = async ({
    opts: cmd_opts,
    client,
    guild,
    embed,
    reply,
    author,
  }) => {
    const ai_cell = CELL_CACHE.get(controller, add_opts);
    const response = ai_cell.speak();
    const bot = await guild.members.fetch(client.user!.id);

    embed.color('info').title(add_opts.embed.title);

    const prompt = cmd_opts.maybe_str(add_opts.option.name);

    if (prompt) {
      embed.field(author.displayName, code_block(prompt));
    }

    embed.field(bot.displayName, code_block(response));

    await reply.send();

    // doesn't need to delay replying
    if (prompt) {
      ai_cell.learn(prompt);
    }
  };

  const ai_data: ChatCommandData = {
    name: add_opts.name,
    description: add_opts.description,
    options: [{ type: 'STRING', ...add_opts.option }],
  };

  add_command(controller, ai, ai_data);
}

const CELL_CACHE = new Cache((controller: Controller, opts: AddAiOpts) => {
  const cache = new AiCache(controller);
  const cell = new AiCell(opts.fallback, cache);
  return cell;
});

class AiCell {
  private states: string[];
  private beginnings: string[] = [];
  private possibilities: Record<string, string[]> = {};

  constructor(private fallback: string, private cache?: AiCache) {
    this.states = cache?.load_initial() ?? [];
    this.train();
  }

  speak() {
    const begin = random(this.beginnings);

    let result = begin;
    let current = begin;
    let next = '';

    for (let i = 0; i < SPEAK_LEN - ORDER; i++) {
      next = random(this.possibilities[current] ?? []);

      if (!next) {
        break;
      }

      result += next;
      current = result.substring(result.length - ORDER, result.length);
    }

    return result ?? this.fallback;
  }

  learn(state: string) {
    this.states.push(state);
    this.train();
    this.cache?.learn(state);
  }

  private train() {
    this.possibilities = {};

    for (let i = 0; i < this.states.length; i++) {
      this.beginnings.push(this.states[i].substring(0, ORDER));

      for (let j = 0; j <= this.states[i].length - ORDER; j++) {
        const gram = this.states[i].substring(j, j + ORDER);

        if (!this.possibilities[gram]) {
          this.possibilities[gram] = [];
        }

        this.possibilities[gram].push(this.states[i].charAt(j + ORDER));
      }
    }
  }
}

class AiCache {
  private readonly file: string;
  private stream: WriteStream;

  constructor(controller: Controller) {
    this.file = `.markov/${controller.file_name}.tmp`;
    this.stream = fs.createWriteStream(this.file, { flags: 'a' });
  }

  load_initial() {
    logger.debug(`Loading AI cache %${this.file}%`);

    if (fs.existsSync(this.file)) {
      const states = fs.readFileSync(this.file, 'utf-8');
      return tap((s) => s.pop(), states.split('\n')); // remove last newline
    } else {
      logger.debug('Creating a new cache file');
      fs.writeFileSync(this.file, '', { flag: 'w' });
    }
  }

  learn(state: string) {
    this.stream.write(`${state}\n`);
  }
}
