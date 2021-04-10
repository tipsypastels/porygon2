import { Prisma } from '.prisma/client';
import { Command, CommandHandler } from 'interaction/command';
import { disambiguate } from 'interaction/command/disambiguate';
import { getSetting, setSetting } from 'porygon/settings';
import { isDev } from 'support/dev';
import { code, codeBlock } from 'support/format';

type GetOpts = { get: { key: string } };
type SetOpts = { set: { key: string; value: string } };
type Opts = GetOpts | SetOpts;

const setting: Command<Opts> = (opts) => {
  disambiguate(opts, { get: settingGet, set: settingSet });
};

const settingGet: CommandHandler<GetOpts> = async ({ opts, embed, reply }) => {
  const { key } = opts.get;
  const value = await getSetting<any>(key);

  embed
    .infoColor()
    .setTitle('Settings')
    .addField('Key', code(key))
    .addField('Value', codeBlock(value, { inspect: true, lang: 'js' }));

  reply(embed);
};

const settingSet: CommandHandler<SetOpts> = async ({ opts, embed }) => {
  const { key, value: rawValue } = opts.set;

  parse(rawValue)
    .then(async (value) => {
      await setSetting(key, value);

      embed
        .okColor()
        .setTitle('Settings updated!')
        .addField('Key', code(key))
        .addField('New Value', codeBlock(value, { lang: 'js' }))
        .reply();
    })
    .catch(() => {
      embed
        .errorColor()
        .setTitle('JSON was badly formed, operation aborted.')
        .setDescription(codeBlock(rawValue, { lang: 'json' }))
        .reply();
    });
};

setting.defaultPermission = isDev;
setting.description = 'Gets or sets a Porygon setting by its internal ID.';
setting.options = [
  {
    name: 'get',
    type: 'SUB_COMMAND',
    description: 'Gets a setting.',
    options: [
      {
        name: 'key',
        type: 'STRING',
        required: true,
        description: 'The ID of the setting to find.',
      },
    ],
  },
  {
    name: 'set',
    type: 'SUB_COMMAND',
    description: 'Sets a setting.',
    options: [
      {
        name: 'key',
        type: 'STRING',
        required: true,
        description: 'The ID of the setting to update.',
      },
      {
        name: 'value',
        type: 'STRING',
        required: true,
        description: 'The value to update to.',
      },
    ],
  },
];

export default setting;

async function parse(code: string) {
  return JSON.parse(code);
}
