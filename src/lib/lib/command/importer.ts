import { Command } from 'interaction/command';
import { Importer } from 'porygon/importer';

export class LibCommandImporter extends Importer<Command> {
  constructor(dir: string) {
    super({ dir });
  }

  protected hasDefaultExport(mod: unknown): mod is { default: unknown } {
    return super.hasDefaultExport(mod) && typeof mod.default === 'function';
  }
}
