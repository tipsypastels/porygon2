import { Command, CommandHandler } from 'interaction/command';
import { disambiguate } from 'interaction/command/disambiguate';
import { code, codeBlock } from 'support/format';
import { OWNER } from 'secrets.json';
import * as Settings from 'porygon/settings';

type GetOpts = { get: { key: string } };
type SetOpts = { set: { key: string; value: string } };
type UpdateOpts = { update: { key: string; expression: string } };
type Opts = GetOpts | SetOpts | UpdateOpts;

const setting: Command<Opts> = async (opts) => {
  await disambiguate(opts, {
    get: settingGet,
    set: settingSet,
    update: settingUpdate,
  });
};

const settingGet: CommandHandler<GetOpts> = async ({ opts, embed }) => {
  const { key } = opts.get;
  const { value } = Settings.setting(key as never);

  await embed
    .infoColor()
    .setTitle('Settings')
    .addField('Key', code(key))
    .addField('Value', codeBlock(value, { inspect: true, lang: 'js' }))
    .reply();
};

const settingSet: CommandHandler<SetOpts> = async ({ opts, embed }) => {
  const { key, value: rawValue } = opts.set;

  await parse(rawValue)
    .then(async (value) => {
      Settings.setSetting(key, value);

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

const settingUpdate: CommandHandler<UpdateOpts> = async ({
  opts,
  embed,
  member,
}) => {
  if (member.id !== OWNER) {
    throw new Error('nope');
  }

  const { key, expression } = opts.update;
  const { value: currentValue } = await Settings.setting(key as never);
  const nextValue = evaluate(expression, currentValue);

  Settings.setSetting(key, nextValue);

  await embed
    .okColor()
    .setTitle('Settings updated!')
    .addField('Key', code(key))
    .addField('New Value', codeBlock(nextValue, { lang: 'js' }))
    .reply();
};

setting.defaultPermission = true;
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
        description: 'The ID of the setting to set.',
      },
      {
        name: 'value',
        type: 'STRING',
        required: true,
        description: 'An expression that evaluates to a new value.',
      },
    ],
  },
  {
    name: 'update',
    type: 'SUB_COMMAND',
    description:
      'Updates a setting by evaluating a JavaScript expression where `this` is the current value.',
    options: [
      {
        name: 'key',
        type: 'STRING',
        required: true,
        description: 'The ID of the setting to update.',
      },
      {
        name: 'expression',
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

function evaluate(expr: string, thisValue: any) {
  return new Function(`return ${expr}`).call(thisValue);
}
