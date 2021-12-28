import { ColorResolvable, MessageEmbedOptions as Inner } from 'discord.js';
import { AssetsKey } from './asset/registrar';
import { PORY_ASSETS } from './assets';
import { PoryColor, PORY_COLORS } from './color';

/**
 * An embed lets you control the layout of a bot response.
 *
 * NOTE: We deliberately do not use Discord.js's MessageEmbed builder, because:
 *  - it's all camelCase and used very frequently, which is awkward
 *  - we rename some fields to shorter variants for convenience
 *  - its implementation makes it annoying to add features like touch checking
 *  - we need to extend it with our own stuff anyways.
 */
export class Embed {
  private inner: Inner = {};
  private _touched = false;

  into_inner() {
    return this.inner;
  }

  get touched() {
    return this._touched;
  }

  private set<K extends keyof Inner>(key: K, value: NonNullable<Inner[K]>) {
    this.inner[key] = value;
    this._touched = true;
    return this;
  }

  private add_field(name: string, value: string, inline: boolean) {
    this.inner.fields ??= [];
    this.inner.fields.push({ name, value, inline });
    this._touched = true;

    return this;
  }

  title(title: string) {
    return this.set('title', title);
  }

  about(about: string) {
    return this.set('description', about);
  }

  color(color: PoryColor) {
    return this.color_from(PORY_COLORS[color]);
  }

  color_from(color: ColorResolvable) {
    return this.set('color', color);
  }

  pory(thumb: AssetsKey<typeof PORY_ASSETS>) {
    return this.set('thumbnail', { url: PORY_ASSETS.get(thumb).url });
  }

  image(url: string) {
    return this.set('image', { url });
  }

  author(name: string, icon_url?: string, url?: string) {
    return this.set('author', { name, icon_url, url });
  }

  foot(text: string, icon_url?: string) {
    return this.set('footer', { text, icon_url });
  }

  field(name: string, value: string) {
    return this.add_field(name, value, false);
  }

  inline(name: string, value: string) {
    return this.add_field(name, value, true);
  }
}
