const URL =
  'https://raw.githubusercontent.com/tipsypastels/porygon2/master/assets/pokemon_sprites';

// TODO: support back/shiny
export function fetch_pokemon_sprite(num: number) {
  return `${URL}/front/${num}.png`;
}
