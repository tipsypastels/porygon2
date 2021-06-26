import { getNonNull } from '../cache';
import { intoId, IntoId } from '../into_id';
import type { Type } from './type';

export enum Effectiveness {
  Quad = 4,
  Strong = 2,
  Normal = 1,
  Weak = 0.5,
  None = 0,
}

export const DEFAULT_EFFECTIVENESS = Effectiveness.Normal;

export type EffectivenessRecord = Record<string, Effectiveness>;
export type EffectivenessDomain = 'offense' | 'defense';

export interface RawEffectivenessTable {
  offense: EffectivenessRecord;
  defense: EffectivenessRecord;
}

/**
 * A plain helper class that does low-level effectiveness checks.
 * Delegated to by `Pokemon`, `Type`, and `TypeList`.
 */
export class EffectivenessTable {
  private offense: EffectivenessRecord;
  private defense: EffectivenessRecord;

  constructor(raw: RawEffectivenessTable) {
    this.offense = raw.offense;
    this.defense = raw.defense;
  }

  /**
   * Gets the effectiveness of `type` compared to the types in this table.
   * `domain` determines whether the comparison is attacking or defending.
   *
   *     const table = new EffectivenessTable({ offense: { grass: 2 }, defense: {} })
   *     table.get('offense', 'grass') // => 2
   */
  get(domain: EffectivenessDomain, type: IntoId<Type>) {
    return this[domain][intoId(type)] ?? DEFAULT_EFFECTIVENESS;
  }

  /**
   * Returns hydrated `Type` classes for all stored type IDs.
   * This is never needed in type logic, but important when displaying the
   * types to the user in a list such as "Weaknesses: Fire, Water".
   */
  async getHydratedTypes() {
    const [offense, defense] = await Promise.all([
      this.getHydratedTypesInDomain('offense'),
      this.getHydratedTypesInDomain('defense'),
    ]);

    return { offense, defense };
  }

  /**
   * Returns hydrated `Type` classes for all the keys in `domain`.
   * @see getHydratedTypes
   */
  async getHydratedTypesInDomain(domain: EffectivenessDomain) {
    const typeIds = Object.keys(this[domain]);
    const out: Type[] = [];

    const promises = typeIds.map(async (id, index) => {
      out[index] = await getNonNull('type', id);
    });

    await Promise.all(promises);
    return out;
  }
}
