import { Base, RawBase } from './base';

export interface RawItem extends RawBase {
  name: string;
}

export class Item extends Base<RawItem> {
  readonly name!: string;

  get kind() {
    return 'item' as const;
  }
}
