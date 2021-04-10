import { Collection } from 'discord.js';
import { basename } from 'path';
import { Porygon } from 'porygon/client';
import { logger } from 'porygon/logger';
import { TEST_SERVER } from 'secrets.json';
import { isDev } from 'support/dev';
import { eachDirectory } from 'support/dir';
import { Lib } from './lib';
import { LibCommands } from './lib_commands';

/**
 * See ./lib.ts for an explanation of the lib system.
 */

const libs = new Collection<string, Lib>();
let testLib: Lib;

export async function setupLibs(client: Porygon) {
  const promises = Array.from(eachLibDir()).map(async (dir) => {
    logger.info(`Setting up ${basename(dir)}...`);

    const lib = await createLibForDir(client, dir);
    const setup = await getLibSetupCallback(dir);

    if (lib) {
      await setup?.(lib, client);
      libs.set(lib.guildId, lib);
    }
  });

  await Promise.all(promises);
  await LibCommands.saveAll(client, TEST_SERVER);
}

export function getLib(guildId: string) {
  return libs.get(guildId);
}

async function createLibForDir(client: Porygon, dir: string) {
  const config = await import(`${dir}/lib.json`).catch(() => {
    logger.error(
      `${basename(
        dir,
      )} must have a lib.json file that exports a guildId property.`,
    );
  });

  if (isDev) {
    if (typeof testLib === 'undefined') {
      testLib = new Lib(client, TEST_SERVER);
    }

    return testLib;
  }

  return new Lib(client, config.guildId);
}

async function getLibSetupCallback(dir: string) {
  const mod = await import(`${dir}/index.${isDev ? 'ts' : 'js'}`).catch(() => {
    logger.warn(`${basename(dir)} has no index.ts.`);
  });

  if (typeof mod?.default !== 'function') {
    logger.warn(
      `${basename(dir)}'s setup function is not a function, it's ${
        mod?.default
      }`,
    );
    return;
  }

  return mod?.default;
}

function* eachLibDir() {
  for (const dir of eachDirectory(__dirname)) {
    if (basename(dir).match(/^lib_/)) {
      yield dir;
    }
  }
}
