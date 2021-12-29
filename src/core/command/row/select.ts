import { Embed } from 'core/embed';
import {
  MessageSelectMenuOptions as Inner,
  SelectMenuInteraction as Intr,
  GuildMember,
  MessageSelectOptionData,
} from 'discord.js';
import { IntoVoid } from 'support/async';
import { ActiveComponent } from './shared';

type CustomInnner = Omit<Inner, 'customId' | 'type'>;
type Fn = (args: Args) => IntoVoid;

interface Args {
  intr: Intr;
  reply: Reply;
  author: GuildMember;
  choices: string[];
}

export class Select extends ActiveComponent<Inner, Intr, Args> {
  protected fn?: Fn;
  private _inner: CustomInnner = {};

  into_inner() {
    return { type: <const>'SELECT_MENU', customId: this.custom_id, ...this._inner };
  }

  protected get_approximate_name() {
    const label = this._inner.placeholder ?? '<no label>';
    return `Select "${label}"`;
  }

  protected into_args(intr: Intr, embed: Embed) {
    const reply = new Reply(intr, embed, this);
    const { values: choices, member: author } = intr;

    if (!(author instanceof GuildMember)) {
      return `invalid_member(${author})`;
    }

    return { intr, reply, author, choices };
  }

  private set<K extends keyof CustomInnner>(key: K, value: CustomInnner[K]) {
    this._inner[key] = value;
    this.touch();
    return this;
  }

  placeholder(label: string) {
    return this.set('placeholder', label);
  }

  minimum(min: number) {
    return this.set('minValues', min);
  }

  maximum(max: number) {
    return this.set('maxValues', max);
  }

  options(...options: MessageSelectOptionData[]) {
    this._inner.options ??= [];
    this._inner.options.push(...options);
    this.touch();
    return this;
  }

  on_select(fn: Fn) {
    this.fn = fn;
    this.touch();
    return this;
  }
}

// TODO: should we just make a concrete type for this instead of c+p for button and select?
// it's mostly invisible at this point since it notices updates
class Reply {
  private created_at = new Date();
  constructor(private intr: Intr, private embed: Embed, private select: Select) {}

  private get touched() {
    return (
      this.embed.been_touched_since(this.created_at) ||
      this.select.been_touched_since(this.created_at)
    );
  }

  async auto_update() {
    if (this.touched) {
      return this.intr.update({ embeds: [this.embed.into_inner()] });
    }
  }
}
