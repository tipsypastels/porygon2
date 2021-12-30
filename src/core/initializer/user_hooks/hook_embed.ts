import { Embed, IntoEmbed } from 'core/embed';
import { Ary } from 'support/array';
import { Maybe } from 'support/null';

/**
 * Wrapper around an `Embed` that facilitates tweaking content based on the
 * selected details.
 */
export class HookEmbed<ExtraDetails extends string> {
  private enabled_details: Set<ExtraDetails> | 'all';
  private embed = new Embed();

  constructor(details: Maybe<ExtraDetails[] | 'all'>) {
    this.enabled_details = details === 'all' ? details : new Set(details ?? []);
  }

  get touched() {
    return this.embed.touched;
  }

  into_inner() {
    return this.embed.into_inner();
  }

  by_default(into: IntoEmbed) {
    this.embed.merge(into);
    return this;
  }

  detail(detail: ExtraDetails, into: IntoEmbed) {
    if (this.has(detail)) this.embed.merge(into);
    return this;
  }

  merge<P extends Ary = []>(into: (e: this, ...p: P) => void, ...params: P) {
    into(this, ...params);
    return this;
  }

  private has(detail: ExtraDetails) {
    return this.enabled_details === 'all' || this.enabled_details.has(detail);
  }
}
