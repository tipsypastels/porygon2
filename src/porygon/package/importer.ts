import { stat } from 'fs/promises';
import { LocalCommand } from 'porygon/interaction';
import { basename, dirname } from 'path';
import { Porygon } from 'porygon/client';
import { Importer } from 'porygon/importer';
import { logger } from 'porygon/logger';
import { isDev } from 'support/dev';
import { eachDirectoryWithFile, eachFile, jsFile } from 'support/dir';
import { EventHandler, runEventHandler } from './events';
import { PackageKind } from './kind';
import { Package } from './package';

type SubImportCb = (dir: string) => Promise<void>;

export class PackageImporter extends Importer<PackageKind, void> {
  constructor(private client: Porygon) {
    super(eachDirectoryWithFile(`${__dirname}/../../packages`, jsFile('$package')));
  }

  protected override beforeImport($file: string) {
    logger.setup(`Setting up package ${basename(dirname($file))}...`);
  }

  protected override async transform(prodKind: PackageKind, $file: string) {
    const pkgDir = dirname($file);
    const kind = isDev ? PackageKind.DEV_SINGLETON : prodKind;
    const pkg = Package.init(kind, this.client);

    await Promise.all([
      this.importCommands(pkg, pkgDir),
      this.importEvents(kind, pkgDir),
    ]);
  }

  private importCommands(pkg: Package, pkgDir: string) {
    return this.subImport(pkgDir, 'commands', async (dir) => {
      const importer = new CommandImporter(eachFile(dir));
      await importer.import((command) => pkg.addCommand(command));
    });
  }

  private importEvents(kind: PackageKind, pkgDir: string) {
    return this.subImport(pkgDir, 'events', async (dir) => {
      const importer = new Importer<EventHandler<any>>(eachFile(dir));
      await importer.import((handler) => runEventHandler(this.client, kind, handler));
    });
  }

  private async subImport(pkgDir: string, subDir: string, cb: SubImportCb) {
    const dir = `${pkgDir}/${subDir}`;
    const exists = await this.exists(dir);

    if (exists) {
      return await cb(dir);
    }
  }

  private exists(dir: string) {
    return stat(dir)
      .then(() => true)
      .catch(() => false);
  }
}

class CommandImporter extends Importer<LocalCommand> {
  protected override hasDefaultExport(mod: unknown): mod is { default: LocalCommand } {
    return super.hasDefaultExport(mod) && mod.default instanceof LocalCommand;
  }
}
