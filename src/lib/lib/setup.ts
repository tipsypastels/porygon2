import { Lib } from 'lib/lib';
import { Porygon } from 'porygon/client';
import { isDev } from 'support/dev';
import { LibImporter } from './importer';

export async function setupLibs(client: Porygon) {
  const importer = new LibImporter(client);

  await importer.import();
  await Lib.saveAll();
  await clearGlobalCommandsInDevelopment(client);
}

async function clearGlobalCommandsInDevelopment(client: Porygon) {
  if (!isDev) return;
  await client.application!.commands.set([]);
}
