import { Porygon } from 'porygon/client';
import { isDev } from 'support/dev';
import { PackageImporter } from './importer';
import { Package } from './package';

// all other contents are considered private api
export * from './kind';
export * from './package';
export { EventHandler } from './events';

export async function setupPackages(client: Porygon) {
  const importer = new PackageImporter(client);

  await importer.import();
  await Package.uploadAllCommands();
  await clearGlobalCommandsInDevelopment(client);
}

async function clearGlobalCommandsInDevelopment(client: Porygon) {
  if (!isDev) return;
  await client.application!.commands.set([
    {
      name: 'ping',
      description: 'yo',
    },
  ]);
}
