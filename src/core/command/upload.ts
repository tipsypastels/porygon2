import { logger } from 'core/logger';
import { noop } from 'support/fn';
import { Maybe } from 'support/null';
import { AnyCommand, Cell, CommandRegistrar, Data } from '.';
import sha1 from 'sha1';
import { Controller } from 'core/controller';
import { Client, Collection } from 'discord.js';
import { writeFile as write } from 'fs/promises';
import { store_command } from './storage';

interface CacheFile {
  [key: string]: CacheItem;
}

interface CacheItem {
  id: string;
  data_hash: string;
}

interface Opts {
  registrar: CommandRegistrar;
  controller: Controller;
  commands: Collection<AnyCommand, Data>;
  client: Client;
}

function make_key(reg: CommandRegistrar, data: Data) {
  return `${reg.name}-${data.name}`;
}

export async function upload_commands({ registrar, controller, commands, client }: Opts) {
  const file = `.commands/${controller.file_name}.json`;
  const cur_cache: Maybe<CacheFile> = await import(`../../../${file}`).catch(noop);

  if (!cur_cache) {
    logger.info(`No command cache for %${registrar.name}%, creating`);
  }

  const new_cache: CacheFile = {};
  let changed = false;

  async function make_cell(command: AnyCommand, data: Data) {
    const key = make_key(registrar, data);
    const cached = cur_cache?.[key];
    const hash = sha1(JSON.stringify(data));

    const upload_iface = controller.into_upload_iface(client);
    const cell_data = { command, data, upload_iface };

    if (cached?.data_hash === hash) {
      return new Cell({ ...cell_data, api: cached.id });
    }

    changed = true;

    if (cached) {
      logger.info(`Command %${data.name}% in %${registrar.name}% changed`);
    } else {
      logger.info(`New command %${data.name}% in %${registrar.name}%!`);
    }

    const api_command = await upload_iface.upload(data, cached?.id);

    const new_cached: CacheItem = { id: api_command.id, data_hash: hash };

    new_cache[key] = new_cached;

    return new Cell({ ...cell_data, api: api_command });
  }

  const promises = [...commands].map(async ([command, data]) => {
    const cell = await make_cell(command, data);
    store_command(cell, controller);
  });

  const cells = await Promise.all(promises);

  if (changed) {
    await write(file, JSON.stringify(new_cache, null, 2));
  }

  return cells;
}
