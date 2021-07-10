/* eslint-disable @typescript-eslint/no-unused-vars */

import { database as databaseImport } from 'porygon/database';
import { CommandFn, LocalCommand } from 'porygon/interaction';
import { logger as loggerImport } from 'porygon/logger';
import { assertOwner } from 'porygon/owner';
import * as SettingsImport from 'porygon/settings';
import { codeBlock } from 'support/format';
import { Package as PackageImport } from 'porygon/package';

interface Opts {
  code: string;
  quiet?: boolean;
}

const eval_: CommandFn<Opts> = async (args) => {
  assertOwner(args.author);

  const { interaction, author, guild, embed, client, opts, command } = args;
  const { pkg } = command;
  const database = databaseImport;
  const Settings = SettingsImport;
  const Package = PackageImport;
  const logger = loggerImport;

  // function commandId(name: string) {
  //   return Package.searchCommand(name)?.id;
  // }

  // function enable() {}

  // function disable() {}

  const result = eval(opts.code);

  if (opts.quiet) {
    // TODO: once the public api gets a way to pong, do that
    return;
  }

  await embed
    .okColor()
    .setTitle('Evaluated Code')
    .addField('Input', js(opts.code, { inspect: false }))
    .addField('Output', js(result, { inspect: true }))
    .reply();
};

export default new LocalCommand(eval_, {
  name: 'eval',
  // defaultPermission: isDev,
  description: "If you don't know what this does, you shouldn't be using it.",
  options: [
    {
      name: 'code',
      type: 'STRING',
      required: true,
      description: 'Code to be run.',
    },
    {
      name: 'quiet',
      type: 'BOOLEAN',
      required: false,
      description: 'Silences output in response.',
    },
  ],
});

function js(code: string, { inspect }: { inspect: boolean }) {
  return codeBlock(code, { lang: 'js', inspect });
}
