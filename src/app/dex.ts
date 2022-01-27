import {
  add_autocomplete,
  add_sub_commands,
  Autocomplete,
  ChatCommand,
  create_usage_errors,
} from 'core/command';
import { DUCK } from 'core/controller';
import { partial } from 'support/fn';
import { pluck } from 'support/object';
import { lower, pad_left } from 'support/string';
import { account_for_missingno, MISSINGNO } from './impl/dex/missingno';
import {
  fetch_pokemon,
  fetch_pokemon_sprite,
  Pokemon,
  search_pokemon,
  SpriteDir,
} from './impl/dex/pokemon';

/* -------------------------------------------------------------------------- */
/*                                   Pokémon                                  */
/* -------------------------------------------------------------------------- */

const pokemon: ChatCommand = async ({ embed, opts }) => {
  const search = opts.str('search');
  const sprite = <SpriteDir>opts.maybe_str('sprite') ?? 'front';

  const mon = await fetch_pokemon(search);

  if (!mon) {
    throw usage_error('unknown_mon_pub', search);
  }

  const form_search = opts.maybe_str('form') ?? mon.default_form;
  const form = mon.forms[form_search];

  if (!form) {
    throw usage_error('unknown_form_pub', form_search, mon);
  }

  embed
    .author('Pokémon')
    .thumb(fetch_pokemon_sprite(form.slug, sprite))
    .color_from(COLOR_CODES[mon.color])
    .title(form.name)
    .about(`Discovered in Generation ${form.generation}.`)
    .try_inline('Number', pad_pokemon_number(mon.id))
    .try_inline('Species', mon.genus)
    .try_inline('Type', form.types.map(pluck('name')).join('\n'))
    .try_inline('Abilities', form.abilities.map(format_ability).join('\n'))
    .try_inline('Egg Groups', mon.egg_groups.map(pluck('name')).join('\n'))
    .try_inline('Gender Ratio', mon.gender_ratio.name)
    .try_inline('Height', form.height)
    .try_inline('Weight', form.weight)
    .try_field('Evolutions', mon.evolutions.map(format_evos).join('\n'))
    .try_field('Description', mon.flavour_text);

  if (mon.slug === 'missingno') {
    embed.merge(account_for_missingno);
  }
};

const commands = { pokemon };

add_sub_commands(DUCK, commands, {
  name: 'dex',
  description: 'TODO write a description',
  options: [
    {
      name: 'pokemon',
      description: 'Looks up information about a Pokémon.',
      type: 'SUB_COMMAND',
      options: [
        {
          name: 'search',
          description: 'The name of the Pokémon. Continue typing to refine search...',
          type: 'STRING',
          required: true,
          autocomplete: true,
        },
        {
          name: 'form',
          description: "The Pokémon's form or variant.",
          type: 'STRING',
          required: false,
          autocomplete: true,
        },
        {
          name: 'sprite',
          description:
            'The sprite to display for the Pokémon. Some sprites may not be available.',
          type: 'STRING',
          required: false,
          choices: [
            {
              name: 'Front Sprite',
              value: 'front',
            },
            {
              name: 'Back Sprite',
              value: 'back',
            },
            {
              name: 'Front Shiny Sprite',
              value: 'front-shiny',
            },
            {
              name: 'Back Shiny Sprite',
              value: 'back-shiny',
            },
          ],
        },
      ],
    },
  ],
});

const pokemon_search_autocomplete: Autocomplete = async (args) => {
  const input = lower(`${args.input}`);
  const suggestions = search_pokemon(input);

  if (!suggestions) {
    return [
      {
        name: 'Start typing a Pokémon name to get auto completion!',
        value: MISSINGNO,
      },
    ];
  }

  return suggestions;
};

const pokemon_form_autocomplete: Autocomplete = async ({ opts }) => {
  const search = opts.maybe_str('search');
  if (!search || search === MISSINGNO) return [];

  const mon = await fetch_pokemon(search);
  if (!mon) return [];

  return Object.entries(mon.forms).map(([slug, form]) => ({
    value: slug,
    name: form.name,
  }));
};

add_autocomplete(pokemon, 'search', pokemon_search_autocomplete);
add_autocomplete(pokemon, 'form', pokemon_form_autocomplete);

/* ----------------------------- Implementation ----------------------------- */

const COLOR_CODES: Record<string, number> = {
  red: 0xff0041,
  blue: 0x26bbb1,
  yellow: 0xfdbe4a,
  green: 0x00c17d,
  black: 0x383135,
  brown: 0xe0a709,
  purple: 0xa524bf,
  gray: 0xcfcfcf,
  white: 0xf7f7f7,
  pink: 0xff7095,
};

const pad_pokemon_number = partial(pad_left, '0', 3);

function format_ability({ name, is_hidden }: { name: string; is_hidden: boolean }) {
  return is_hidden ? `${name} (H)` : name;
}

function format_evos(evos: { name: string }[]) {
  return evos.map(pluck('name')).join(' › ');
}

const usage_error = create_usage_errors({
  unknown_mon_pub(e, search: string) {
    e.err('warning')
      .title(`Unknown Pokémon "${search}"`)
      .about('Want to try searching again?');
  },
  unknown_form_pub(e, search: string, mon: Pokemon) {
    e.err('danger').title(`Unknown Form "${search}" for ${mon.name}`);

    const forms = Object.values(mon.forms).map(pluck('name'));

    if (forms.length === 1) {
      e.about(`${mon.name} only has a basic form and no variants.`);
    } else {
      e.about(
        `I know about these ${mon.name} forms, if that might be of help:\n\n${forms.join(
          '\n',
        )}`,
      );
    }
  },
});
