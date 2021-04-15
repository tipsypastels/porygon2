import { Lib } from 'lib/lib';
import { Porygon } from 'porygon/client';
import { LibImporter } from './importer';

export async function setupLibs(client: Porygon) {
  const importer = new LibImporter(client);

  await importer.import();
  await Lib.saveAll();
}
