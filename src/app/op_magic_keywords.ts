import { assert } from 'core/assert';
import { get_command_by_name } from 'core/command';
import { GLOBAL } from 'core/controller';
import { Initializer, InitializerOpts, add_init } from 'core/initializer';
import { logger } from 'core/logger';
import { fetch_owner } from 'core/owner';
import { Message, User } from 'discord.js';
import { noop } from 'support/fn';

/**
 * Magic keywords are OP-only commands that are run by DMing Porygon
 * with a plain message. Right now, the only existing keyword is
 * `bootstrap`, which sets up permissions for the OP to use all
 * their exclusive slash commands, but more might be added in
 * the future.
 */
interface MagicKeyword {
  (init: MagicKeywordOpts): Promise<void>;
}

interface MagicKeywordOpts extends InitializerOpts {
  message: Message;
  owner: User;
}

const MAGIC_KEYWORDS: Record<string, MagicKeyword> = {
  async bootstrap({ controller, client, owner }) {
    const op_commands_to_bootstrap = ['op'];
    const queue: Promise<void>[] = [];

    for (const name of op_commands_to_bootstrap) {
      const cell = get_command_by_name(name, controller);
      assert(cell, `Unknown OP command for bootstrap: %${name}%`);

      for (const [, guild] of client.guilds.cache) {
        const do_bootstrap = async () => {
          const owner_member = await guild.members.fetch(owner.id).catch(noop);

          if (!owner_member) {
            logger.warn(`OP is not on %${guild.name}%, skipping for bootstrap`);
            return;
          }

          await cell.set_permission(owner_member, true);
        };

        queue.push(do_bootstrap());
      }
    }

    await Promise.all(queue);
  },
};

const install_magic_keywords: Initializer = async (init_opts) => {
  assert(init_opts.controller === GLOBAL, 'Magic keywords must be part of %GLOBAL%!');

  const owner = await fetch_owner(init_opts.client);

  init_opts.events.global_on('messageCreate', (message) => {
    const by_owner = message.author.id === owner.id;
    const via_dm = message.guild == null;
    const magic_func = MAGIC_KEYWORDS[message.content];

    if (by_owner && via_dm && magic_func) {
      magic_func({ ...init_opts, message, owner })
        .then(() => logger.info(`Ran magic keyword %${magic_func.name}%`))
        .catch((e) => logger.error(`Magic keyword %${magic_func.name}% crashed`, e));
    }
  });
};

add_init(GLOBAL, install_magic_keywords, {
  name: 'op_magic_keywords',
});
