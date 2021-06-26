import type { Hydrator } from '../hydrator';
import type { IntoId } from '../into_id';
import { Base, RawBase } from './base';
import {
  EffectivenessDomain,
  EffectivenessTable,
  RawEffectivenessTable,
} from './effectiveness';

export interface RawType extends RawBase {
  name: string;
  color: string;
  faIcon: string;
  effectiveness: RawEffectivenessTable;
}

export class Type extends Base<RawType> {
  static hydrate(hydrator: Hydrator) {
    hydrator
      .for('effectiveness')
      .map((t) => new EffectivenessTable(t))
      .ok();
  }

  readonly name!: string;
  readonly color!: string;
  readonly faIcon!: string;
  readonly effectiveness!: EffectivenessTable;

  get kind() {
    return 'type' as const;
  }

  getEffectiveness(domain: EffectivenessDomain, type: IntoId<Type>) {
    return this.effectiveness.get(domain, type);
  }
}
