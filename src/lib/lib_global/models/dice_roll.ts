import { PorygonEmbed } from 'porygon/embed';
import { random, range, times } from 'support/array';
import { code } from 'support/format';

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
    this.faces = opts.faces ?? 6;
    this.count = opts.count ?? 1;
    this.offset = opts.offset ?? 0;
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
