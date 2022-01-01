import {
  ColorResolvable,
  GuildMember,
  MessageEmbedOptions as Inner,
  User,
} from 'discord.js';
import { Ary } from 'support/array';
import { is_some, Maybe } from 'support/null';
import { from_indirect, Indirect } from 'support/object';
import { assert } from './assert';
import { AssetsKey } from './asset/registrar';
import { PORY_ASSETS } from './assets';
import { PoryColor, PORY_COLORS } from './color';

/**
 * An `IntoEmbed` is a function that can be applied to an `Embed`, taking the
 * embed as a parameter and making arbitary changes to it. `Embed#merge` will
 * merge an `IntoEmbed` into itself.
 *
 * `IntoEmbed`s are used in Porygon for things like expected usage errors, rather
 * than having to pass the embed deep into implementation functions. See `UsageError`
 * for the setup of this.
 */
export type IntoEmbed<P extends Ary = []> = Indirect<'into_embed', Merge<P>>;

type Merge<P extends Ary = []> = (e: Embed, ...p: P) => void;
type Value<K extends keyof Inner> = NonNullable<Inner[K]>;
type Mapper<K extends keyof Inner> = (value: Value<K>) => Value<K>;

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
  private _touched = 0;

  into_inner() {
    return this.inner;
  }

  get touched() {
    return !!this._touched;
  }

  been_touched_since(date: Date) {
    return this._touched >= date.getTime();
  }

  reset() {
    this.inner = {};
    this._touched = 0;
    return this;
  }

  merge<P extends Ary = []>(into: IntoEmbed<P>, ...params: P) {
    from_indirect(into, 'into_embed')(this, ...params);
    return this;
  }

  private set<K extends keyof Inner>(key: K, value: Value<K>) {
    this.inner[key] = value;
    this._touched = Date.now();
    return this;
  }

  private try_set<K extends keyof Inner>(key: K, value: Maybe<Value<K>>) {
    if (is_some(value)) this.set(key, value);
    return this;
  }

  private map<K extends keyof Inner>(key: K, mapper: Mapper<K>) {
    const value = this.inner[key];

    assert(value, `Can't map unset field ${key}`);
    return this.set<K>(key, mapper(value!)); // TODO: why is the ! needed?
  }

  private add_field(name: string, value: string, inline: boolean) {
    this.inner.fields ??= [];
    this.inner.fields.push({ name, value, inline });
    this._touched = Date.now();

    return this;
  }

  private try_add_field(name: string, value: Maybe<string>, inline: boolean) {
    if (is_some(value)) this.add_field(name, value, inline);
    return this;
  }

  title(title: string) {
    return this.set('title', title);
  }

  map_title(mapper: Mapper<'title'>) {
    return this.map('title', mapper);
  }

  about(about: string) {
    return this.set('description', about);
  }

  map_about(mapper: Mapper<'description'>) {
    return this.map('description', mapper);
  }

  try_about(about: Maybe<string>) {
    return this.try_set('description', about);
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

  err(err: AssetsKey<typeof PORY_ASSETS> & PoryColor) {
    return this.color(err).pory(err);
  }

  image(url: string) {
    return this.set('image', { url });
  }

  thumb(url: string) {
    return this.set('thumbnail', { url });
  }

  author(name: string, icon_url?: Maybe<string>, url?: Maybe<string>) {
    return this.set('author', {
      name,
      icon_url: icon_url ?? undefined,
      url: url ?? undefined,
    });
  }

  // TODO: decide if it's confusing for one to default to disc=true and another
  // TODO: to default to disc=false. it makes sense because displayName is sort of
  // TODO: the pretty version, whereas if you're working with a user you're probably
  // TODO: doing logging and want all the info, but i'll come back to this later and
  // TODO: decide if the inconsistency was worth it

  author_member(member: GuildMember, { discriminator = false } = {}) {
    const name = member.displayName;
    const disc = member.user.discriminator;
    const full = discriminator ? `${name}${disc}` : name;
    return this.author(full, member.user.avatarURL());
  }

  author_user(user: User, { discriminator = true } = {}) {
    const { username: name, discriminator: disc } = user;
    const full = discriminator ? `${name}${disc}` : name;
    return this.author(full, user.avatarURL());
  }

  foot(text: string, icon_url?: Maybe<string>) {
    return this.set('footer', { text, icon_url: icon_url ?? undefined });
  }

  field(name: string, value: string) {
    return this.add_field(name, value, false);
  }

  try_field(name: string, value: Maybe<string>) {
    return this.try_add_field(name, value, false);
  }

  inline(name: string, value: string) {
    return this.add_field(name, value, true);
  }

  try_inline(name: string, value: Maybe<string>) {
    return this.try_add_field(name, value, true);
  }
}
