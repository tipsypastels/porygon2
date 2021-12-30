import { HookEmbed } from './hook_embed';
import { ClientEvents as Events, Guild } from 'discord.js';
import { Possible } from 'support/object';
import { Awaitable } from 'support/async';
import { Controller } from 'core/controller';
import { add_init, ClientWithoutEvents, Initializer } from '..';
import { panic_assert } from 'core/assert';
import { into_resolved, noop, Resolvable } from 'support/fn';
import { logger } from 'core/logger';
import { as_array } from 'support/array';
import { IS_STAGING } from 'support/env';

export * from './hooks';
export * from './backup_join_date';

type Event = keyof Events;
type Output = Resolvable<string | string[], [Tag]>;

/**
 * User hooks are simply a light wrapper around initializers that abstract
 * very common event handlers - users joining, leaving, being kicked, etc..
 * with a pre-made yet customizable appearance.
 */
export interface UserHook<E extends Event, D extends string, C = never> {
  (args: Args<E, D, C>): Awaitable<Tag>;
  on_event: E;
}

/**
 * Tags are a mechanism by which user hooks may dynamically change their
 * destination. A hook may return a tag, which is really just any string that
 * somehow describes a dynamic decision made during hook execution, and the
 * consumer of the hook may provide a function as the `to` layout parameter
 * that switches based on that tag.
 *
 * Tags should never be assumed to be present, and are usually `void`.
 */
type Tag = string | void;
export type { Tag as UserHookTag };

/**
 * Configuration data for a user hook. Individual hooks may have additional requirements.
 */
type Layout<D extends string, C = never> = Possible<{
  to: Output;
  details?: D[] | 'all';
  config: C;
}>;

/**
 * Arguments passed to a user hook function. Includes any additional layout parameters
 * besides the builtin `to` and `details`.
 *
 * TODO: i would wrap this all in Possible<>, but for some reason that removes
 * TODO: events too. it's definitely not never... maybe a deep enough union that
 * TODO: typescript can't check? or something. come back to this
 */
type Args<E extends Event, D extends string, C = never> = Possible<{ config: C }> & {
  event: Events[E];
  embed: HookEmbed<D>;
  client: ClientWithoutEvents;
  controller: Controller;
  guild: Guild;
};

/**
 * Adds a "user hook", a pre-made kind of initializer to facilitate logging
 * common events around users joining, leaving, being kicked, and similar.
 */
export function add_user_hook<E extends Event, D extends string, C = never>(
  controller: Controller,
  hook: UserHook<E, D, C>,
  { to, details, ...layout_extras }: Layout<D, C>,
) {
  if (IS_STAGING) {
    staging_assert_guild(controller);
  }

  const init: Initializer = ({ events, guild, client }) => {
    panic_assert(guild, 'User hooks may not be attatched to GLOBAL.');

    events.on(hook.on_event, async (...event) => {
      const embed = new HookEmbed(details);
      const args: Args<E, D, C> = {
        event,
        embed,
        client,
        controller,
        guild,
        ...layout_extras,
      };

      const tag = await hook(args);
      await output_result(to, embed, guild, tag);
    });
  };

  add_init(controller, init, {
    name: `${hook.name}_${controller.name}`,
  });
}

// just asserting that guild is non-null won't be enough in staging because
// of the controller swap dance, but we still want that safety because otherwise
// it would panic only in production. by calling this function *right* away before
// the initializer even runs, we can check the *actual* controller
function staging_assert_guild({ name }: Controller) {
  panic_assert(name !== 'global', 'User hooks may not be attatched to %GLOBAL%');
}

function output_result(to: Output, embed: HookEmbed<string>, guild: Guild, tag: Tag) {
  if (!embed.touched) {
    return; // the hook probably early returned, that's fine
  }

  const channel_ids = as_array(into_resolved(to, tag));
  const promises = channel_ids.map(async (id) => {
    const ch = await guild.channels.fetch(id).catch(noop);

    if (!ch) {
      return logger.warn(`User hook tried to print to nonexistant channel: %${id}%`);
    }

    if (!ch.isText()) {
      return logger.warn(`User hook tried to print to non-text channel: %${ch.name}%`);
    }

    return ch.send({ embeds: [embed.into_inner()] });
  });

  return Promise.all(promises);
}
