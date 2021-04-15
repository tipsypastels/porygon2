import { TEST_SERVER } from 'secrets.json';
import { Lib } from 'lib/lib';
import { basename } from 'path';
import { Porygon } from 'porygon/client';
import { Importer } from 'porygon/importer';
import { logger } from 'porygon/logger';
import { isDev } from 'support/dev';
import { eachDirectory } from 'support/dir';

type LibSetup = (lib: Lib) => Promise<void>;

export class LibImporter extends Importer<LibSetup, void> {
  constructor(private client: Porygon) {
    super({ dir: `${__dirname}/../`, each: eachDirectory });
  }

  shouldSkipFile(libDir: string) {
    return basename(libDir) === 'lib'; // this folder is not a lib
  }

  beforeImport(file: string) {
    logger.setup(`Setting up ${basename(file)}...`);
  }

  async transform(setup: LibSetup, libDir: string) {
    const config = await this.importConfig(libDir);
    const guildId = isDev ? TEST_SERVER : config.guildId;
    const lib = Lib.findOrCreate(this.client, guildId);

    await setup?.(lib);
  }

  private importConfig(libDir: string) {
    return import(`${libDir}/lib.json`).catch(() => {
      this.error(`${basename(libDir)} lacks lib.json.`);
    });
  }
}
