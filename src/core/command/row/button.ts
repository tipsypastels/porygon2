import { Embed } from 'core/embed';
import {
  InteractionButtonOptions as Inner,
  ButtonInteraction as Intr,
  GuildMember,
} from 'discord.js';
import { IntoVoid } from 'support/async';
import { ActiveComponent } from './shared';

type CustomInner = Omit<Inner, 'customId' | 'type'>;
type Style = 'PRIMARY' | 'SECONDARY' | 'DANGER' | 'SUCCESS';

type Fn = (args: Args) => IntoVoid;

interface Args {
  intr: Intr;
  reply: Reply;
  author: GuildMember;
}

export class Button extends ActiveComponent<Inner, Intr, Args> {
  protected fn?: Fn;
  private _inner: CustomInner = {
    style: 'PRIMARY',
    disabled: false,
  };

  into_inner() {
    return { type: <const>'BUTTON', customId: this.custom_id, ...this._inner };
  }

  protected get_approximate_name() {
    const label = this._inner.label ?? '<no label>';
    return `Button "${label}"`;
  }

  protected into_args(intr: Intr, embed: Embed) {
    const reply = new Reply(intr, embed, this);
    const author = intr.member;

    if (!(author instanceof GuildMember)) {
      return `invalid_member(${author})`;
    }

    return { intr, reply, author };
  }

  private set<K extends keyof CustomInner>(key: K, value: CustomInner[K]) {
    this._inner[key] = value;
    this.touch();
    return this;
  }

  label(label: string) {
    return this.set('label', label);
  }

  emoji(emoji: string) {
    return this.set('emoji', emoji);
  }

  style(style: Style) {
    return this.set('style', style);
  }

  disable() {
    return this.set('disabled', true);
  }

  enable() {
    return this.set('disabled', false);
  }

  on_click(fn: Fn) {
    this.fn = fn;
    this.touch();
    return this;
  }
}

class Reply {
  private created_at = new Date();
  constructor(private intr: Intr, private embed: Embed, private button: Button) {}

  private get touched() {
    return (
      this.embed.been_touched_since(this.created_at) ||
      this.button.been_touched_since(this.created_at)
    );
  }

  async auto_update() {
    if (this.touched) {
      return this.intr.update({ embeds: [this.embed.into_inner()] });
    }
  }
}
