import { Embed } from 'core/embed';
import { logger } from 'core/logger';
import {
  BaseMessageComponentOptions as BaseInner,
  MessageComponentInteraction as BaseIntr,
  MessageComponentType as Type,
} from 'discord.js';
import { IntoVoid, Resolvable } from 'support/async';
import { is_string } from 'support/string';

/**
 * @internal
 */
export abstract class Component<Inner extends BaseInner = BaseInner> {
  abstract touched: boolean;
  abstract into_inner(): Inner & { type: Type };
}

type TryArgs<A> = A | string;

/**
 * @internal
 */
export abstract class ActiveComponent<
  Inner extends BaseInner = BaseInner,
  Intr extends BaseIntr = BaseIntr,
  Args extends BaseArgs = BaseArgs,
> extends Component<Inner> {
  protected abstract get_approximate_name(): string;
  protected abstract fn?(args: Args): IntoVoid;
  protected abstract into_args(intr: Intr, embed: Embed): Resolvable<TryArgs<Args>>;
  private _touched = 0;

  readonly custom_id = `${Math.random()}`;

  get touched() {
    return !!this._touched;
  }

  been_touched_since(date: Date) {
    return this._touched >= date.getTime();
  }

  protected touch() {
    this._touched = Date.now();
  }

  async call(intr: Intr, embed: Embed) {
    const name = this.get_approximate_name();

    if (this.fn) {
      const args = await this.into_args(intr, embed);

      if (is_string(args)) {
        return logger.debug(`Failed to gather args for %${name}%: %${args}%`);
      }

      try {
        await this.fn(args);
        await args.reply.auto_update();
      } catch (e) {
        logger.error(`${name} threw`, e);
      }
    } else {
      logger.warn(`${name} has no handler`);
    }
  }
}

interface BaseReply {
  auto_update(): Promise<void>;
}

interface BaseArgs {
  intr: BaseIntr;
  reply: BaseReply;
}
