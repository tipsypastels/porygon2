import { getNonNull } from './cache';
import { log, setLogger } from './logger';

setLogger((x) => console.log(x));

async function main() {
  const Fire = await getNonNull('type', 'fire');
  // const Bulbasaur = await getNonNull('pokemon', 'bulbasaur');

  // log(Bulbasaur.types.weaknessTo(Fire));
  log(await Fire.effectiveness.getHydratedTypes());
}

main();
