import { Tail } from 'support/array';
import { Embed, IntoEmbed } from '../embed';

const TAG: unique symbol = Symbol('usage_error');
const PUBLIC = /_pub$/;

type Context<E extends Errors, K extends keyof E> = Tail<Parameters<E[K]>>;

interface Fn {
  (embed: Embed, ...params: never[]): void;
}

interface Errors {
  [key: string]: Fn;
}

/**
 * A `UsageError` is a pre-made error that occurs when implicit command contracts
 * are violated. Unlike thrown errors, usage errors all have their own builtin formatters
 * and can be completely customized in appearance using an `IntoEmbed`.
 *
 * See `define_usage_errors` for how such errors are defined.
 */
export interface UsageError {
  [TAG]: true;
  code: string;
  ephemeral: boolean;
  into_embed: IntoEmbed<[string]>;
}

export function is_usage_error(err: unknown): err is UsageError {
  return !!(err && typeof err === 'object' && TAG in err);
}

/**
 * Creates a function that throws usage errors specialized to a given command or context.
 * These errors translate to an `IntoEmbed`, which will be caught by the command handler,
 * thus they should only be used inside the command pipeline, as other Porygon error
 * handling won't know how to interpret them.
 *
 * These errors are treated as ephemeral by default when caught. To make one non-ephemeral,
 * suffix the error code with `_pub`. The reason for this is to make it obvious both
 * when calling and defining (which may be far apart in long files).
 */

export function create_usage_errors<E extends Errors>(errors: E) {
  return <C extends keyof E & string>(code: C, ...ctx: Context<E, C>): UsageError => {
    const fn = errors[code];
    const ephemeral = !PUBLIC.exec(code);
    const visible_code = code.replace(PUBLIC, '');

    function into_embed(embed: Embed, command: string) {
      embed.merge(fn, ...ctx).foot(`Error Code: ${command}.${visible_code}`);
    }

    return { [TAG]: true, code, ephemeral, into_embed };
  };
}
