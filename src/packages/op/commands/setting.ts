import { CommandFn, LocalMultipartCommand } from 'porygon/interaction';
import { assertOwner } from 'porygon/owner';
import * as Settings from 'porygon/settings';
import { isDev } from 'support/dev';
import { code, codeBlock } from 'support/format';

type GetOpts = { key: never };
type SetOpts = { key: never; value: string };
type UpdateOpts = { key: never; expression: string };

const get: CommandFn<GetOpts> = async ({ opts, embed }) => {
  const { key } = opts;
  const { value } = Settings.setting(key);

  await embed
    .infoColor()
    .setTitle('Settings')
    .addField('Key', code(key))
    .addField('Value', codeBlock(value, { inspect: true, lang: 'js' }))
    .reply();
};

const set: CommandFn<SetOpts> = async ({ opts, embed }) => {
  const { key, value: rawValue } = opts;

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

const update: CommandFn<UpdateOpts> = async ({ opts, embed, author }) => {
  assertOwner(author);

  const { key, expression } = opts;
  const { value: currentValue } = await Settings.setting(key);
  const nextValue = evaluate(expression, currentValue);

  Settings.setSetting(key, nextValue);

  await embed
    .okColor()
    .setTitle('Settings updated!')
    .addField('Key', code(key))
    .addField('New Value', codeBlock(nextValue, { lang: 'js' }))
    .reply();
};

export default new LocalMultipartCommand(
  { get, set, update },
  {
    name: 'setting',
    defaultPermission: isDev,
    description: 'Gets or sets a Porygon setting by its internal ID.',
    options: [
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
    ],
  },
);

async function parse(code: string) {
  return JSON.parse(code);
}

function evaluate(expr: string, thisValue: any) {
  return new Function(`return ${expr}`).call(thisValue);
}
