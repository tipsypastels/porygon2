import type { Hydrator } from '../hydrator';
import { Base, RawBase } from './base';
import { TypeList } from './type_list';

export interface RawPokemon extends RawBase {
  name: string;
  types: string[];
}

export class Pokemon extends Base<RawPokemon> {
  static hydrate(hydrator: Hydrator) {
    hydrator
      .for('types')
      .kindArray('type')
      .map((types) => new TypeList(types))
      .ok();
  }

  readonly name!: string;
  readonly types!: TypeList;

  get kind() {
    return 'pokemon' as const;
  }
}
