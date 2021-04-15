import { Importer } from 'porygon/importer';
import { eachFileRecursive } from 'support/dir';
import { GuildHandler } from '.';

export class LibEventImporter extends Importer<GuildHandler> {
  constructor(dir: string) {
    super({ dir, each: eachFileRecursive });
  }

  protected hasDefaultExport(mod: unknown): mod is { default: unknown } {
    return super.hasDefaultExport(mod) && typeof mod.default === 'function';
  }
}
