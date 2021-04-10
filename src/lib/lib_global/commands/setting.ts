import { Command, CommandHandler } from 'interaction/command';
import { disambiguate } from 'interaction/command/disambiguate';
import { getValue } from 'lib/lib_value';
import { codeBlock } from 'support/format';

type GetOpts = { get: { key: string } };
type SetOpts = { set: { key: string; value: string } };
type Opts = GetOpts | SetOpts;

const setting: Command<Opts> = (opts) => {
  disambiguate(opts, { get: settingGet, set: settingSet });
};

const settingGet: CommandHandler<GetOpts> = async ({ opts, embed, reply }) => {
  try {
    reply('x');

    const { key } = opts.get;
    const value = await getValue<any>(key, {});
    console.log(key);

    embed
      .infoColor()
      .setTitle(`Setting: ${key}`)
      .setDescription(codeBlock(value, { inspect: true }));

    reply(embed);
  } catch (error) {
    console.log(error);
  }
};

const settingSet: CommandHandler<SetOpts> = () => {
  //
};

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
