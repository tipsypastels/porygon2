import {
  readFileSync,
  createWriteStream,
  WriteStream,
  existsSync,
  writeFileSync,
} from 'fs';
import { random } from 'support/array';

export interface MarkovOpts {
  name: string;
  order?: number;
  fallback?: string;
}

export class Markov {
  readonly file: string;
  readonly order: number;
  readonly fallback?: string;

  private starts: string[] = [];
  private states: string[] = [];
  private possibilities: Record<string, string[]> = {};
  private stream: WriteStream;

  constructor({ name, fallback, order = 3 }: MarkovOpts) {
    this.file = `.markov/${name}.markov`;
    this.order = order;
    this.fallback = fallback;

    if (existsSync(this.file)) {
      this.states = readFileSync(this.file, 'utf-8').split('\n');
      this.states.pop(); // remove final newline
      this.train();
    } else {
      writeFileSync(this.file, '', { flag: 'w' });
      this.states = [];
    }

    this.stream = createWriteStream(this.file, { flags: 'a' });
  }

  speak({ chars = 50 } = {}) {
    const start = random(this.starts);

    let result = start;
    let current = start;
    let next = '';

    for (let i = 0; i < chars - this.order; i++) {
      next = random(this.possibilities[current] ?? []);

      if (!next) {
        break;
      }

      result += next;
      current = result.substring(result.length - this.order, result.length);
    }

    return result ?? this.fallback;
  }

  learn(state: string) {
    this.states.push(state);
    this.train();
    this.stream.write(`${state}\n`);
  }

  private train() {
    this.possibilities = {};

    for (let i = 0; i < this.states.length; i++) {
      this.starts.push(this.states[i].substring(0, this.order));

      for (let j = 0; j <= this.states[i].length - this.order; j++) {
        const gram = this.states[i].substring(j, j + this.order);

        if (!this.possibilities[gram]) {
          this.possibilities[gram] = [];
        }

        this.possibilities[gram].push(this.states[i].charAt(j + this.order));
      }
    }
  }
}
