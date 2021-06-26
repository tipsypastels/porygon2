import { Type, Pokemon, Item } from './models';

export type Kinds = {
  pokemon: Pokemon;
  item: Item;
  type: Type;
};

export type Kind = keyof Kinds;
export type MatchKindFn<K extends Kind, R> = (data: Kinds[K]) => R;
export type MatchKind<R> = Partial<
  {
    [K in Kind]: MatchKindFn<K, R>;
  }
>;

// this should be doable staticly, but it seems to not load them properly
// likely a bundler/transpilation issue?
// having to type this any and such is super awkward as a result,
// since idk how to reference the static side of a class + its descendants
export function getKindConstructors(): Record<Kind, any> {
  return {
    pokemon: Pokemon,
    item: Item,
    type: Type,
  };
}
