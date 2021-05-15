import { logger } from 'porygon/logger';
import { CommandArgs, CommandFn } from '.';
import { inspect } from 'util';

type Groups<T, G> = {
  [K in keyof G]: CommandFn<Extract<T, Record<K, any>>>;
};

export function disambiguate<T, G>(args: CommandArgs<T>, groups: Groups<T, G>) {
  for (const key in groups) {
    if (key in args.opts) {
      return groups[key](args as any);
    }
  }

  logger.error(
    `Command disambiguation yielded no result. Groups were ${inspect(groups)}`,
  );
}
