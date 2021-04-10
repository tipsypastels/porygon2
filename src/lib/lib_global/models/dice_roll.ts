import { PorygonEmbed } from 'porygon/embed';
import { random, range, times } from 'support/array';
import { code } from 'support/format';
import { clamp } from 'support/number';

export type DiceRollOpts = Partial<{
  faces?: number;
  count?: number;
  offset?: number;
}>;

export class DiceRoll {
  total = 0;

  readonly faces: number;
  readonly count: number;
  readonly offset: number;

  private range: number[];
  private rolls: number[] = [];

  constructor(opts: DiceRollOpts) {
    this.faces = clamp(opts.faces ?? 6, 1, 100);
    this.count = clamp(opts.count ?? 1, 1, 100);
    this.offset = clamp(opts.offset ?? 0, 0, 100);
    this.range = range(1, this.faces);

    times(this.count, () => this.roll());
  }

  intoEmbed(embed: PorygonEmbed) {
    embed.setDescription(`Rolling ${this.toDiceNotation()}...`);
    embed.addField('Result', `:game_die: ${this.rolls.join(', ')}`);

    if (this.count > 1) {
      embed.addField('Total', this.total);
    }
  }

  toDiceNotation() {
    let base = `${this.count}d${this.faces}`;

    if (this.offset > 0) base += ` + ${this.offset}`;
    if (this.offset < 0) base += ` - ${Math.abs(this.offset)}`;

    return code(base);
  }

  private roll() {
    const roll = random(this.range) + this.offset;

    this.total += roll;
    this.rolls.push(roll);
  }
}
