import {
  CommandInteractionOption as Option,
  CommandInteractionOptionResolver as Inner,
  GuildMember,
  Message,
  Role,
} from 'discord.js';
import { is_command_channel } from './channel';

interface LocalToInnerGetters {
  str: 'getString';
  num: 'getNumber';
  int: 'getInteger';
  bool: 'getBoolean';
  member: 'getMember';
  channel: 'getChannel';
  role: 'getRole';
  mentionable: 'getMentionable';
  msg: 'getMessage';
  focus: 'getFocused';
}

type Getter = keyof LocalToInnerGetters;

export type Options<K extends Getter = never> = Omit<
  FullOptions<K>,
  K | `maybe_${K}` | `${K}_input`
>;

/**
 * Wraps chat command options in a nicer API. Discord.js's system for this *sucks*,
 * for a bunch of reasons. Wordy, nullable by default, can return API types...
 * we're making our own thing.
 */
export function into_options<K extends Getter>(
  inner: Omit<Inner, LocalToInnerGetters[K]>,
): Omit<FullOptions<K>, K> {
  return new FullOptions(inner);
}

/**
 * We don't export this class because it's impossible to generically omit properties
 * from it based on what's omitted from the inner without manually using `Omit` at
 * every call site. Instead we export a public type and function.
 */
class FullOptions<K extends Getter> {
  private inner: Inner;
  constructor(inner: Omit<Inner, LocalToInnerGetters[K]>) {
    this.inner = <Inner>inner;
  }

  get sub_command() {
    return this.inner.getSubcommand(false);
  }

  get sub_command_group() {
    return this.inner.getSubcommandGroup(false);
  }

  str(name: string) {
    return this.inner.getString(name, true);
  }

  maybe_str(name: string) {
    return this.inner.getString(name);
  }

  num(name: string) {
    return this.inner.getNumber(name, true);
  }

  maybe_num(name: string) {
    return this.inner.getNumber(name);
  }

  int(name: string) {
    return this.inner.getInteger(name, true);
  }

  maybe_int(name: string) {
    return this.inner.getInteger(name);
  }

  bool(name: string) {
    return this.inner.getBoolean(name, true);
  }

  maybe_bool(name: string) {
    return this.inner.getBoolean(name);
  }

  member(name: string) {
    return this.resolve_member(name, true)!;
  }

  maybe_member(name: string) {
    return this.resolve_member(name);
  }

  private resolve_member(name: string, required?: boolean) {
    const member = this.inner.getMember(name, required);
    assert(!member || member instanceof GuildMember, name);
    return member;
  }

  channel(name: string) {
    return this.resolve_channel(name, true)!;
  }

  maybe_channel(name: string) {
    return this.resolve_channel(name);
  }

  private resolve_channel(name: string, required?: boolean) {
    const channel = this.inner.getChannel(name, required);
    assert(!channel || is_command_channel(channel), name);
    return channel;
  }

  role(name: string) {
    return this.resolve_role(name, true)!;
  }

  maybe_role(name: string) {
    return this.resolve_role(name);
  }

  private resolve_role(name: string, required?: boolean) {
    const role = this.inner.getRole(name, required);
    assert(!role || role instanceof Role, name);
    return role;
  }

  mentionable(name: string) {
    return this.resolve_channel(name, true)!;
  }

  maybe_mentionable(name: string) {
    return this.resolve_mentionable(name);
  }

  private resolve_mentionable(name: string, required?: boolean) {
    const ment = this.inner.getMentionable(name, required);
    assert(!ment || ment instanceof Role || ment instanceof GuildMember, name);
    return ment;
  }

  msg(name: string) {
    return this.resolve_msg(name, true)!;
  }

  maybe_msg(name: string) {
    return this.resolve_msg(name);
  }

  private resolve_msg(name: string, required?: boolean) {
    const msg = this.inner.getMessage(name, required);
    assert(!msg || msg instanceof Message, name);
    return msg;
  }

  focus() {
    return this.inner.getFocused(true);
  }

  focus_input() {
    return this.inner.getFocused();
  }

  // HACK: private api, switch to something supported or open a PR about it?
  serialize_options_string() {
    const opts = <any>this.inner;
    const out: string[] = [];

    function push_opt(opt: string) {
      out.push(opt);
    }

    function push_kwopt(keyword: string, opt: string) {
      push_opt(`${keyword}: ${opt}`);
    }

    if (opts._group) push_opt(opts._group);
    if (opts._subcommand) push_opt(opts._subcommand);

    for (const opt of opts._hoistedOptions) {
      push_kwopt(opt.name, serialize(opt));
    }

    return out.join(' ');
  }
}

function assert(cond: boolean, name: string): asserts cond {
  if (!cond) throw new Error(`Got API field for ${name}.`);
}

function serialize(o: Option) {
  // prettier-ignore
  switch (o.type) {
    case 'CHANNEL': return o.channel!.name;
    case 'ROLE': return o.role!.name;
    case 'USER': return o.user!.username;
    case 'MENTIONABLE': return o.role?.name ?? o.user!.username;
    case 'SUB_COMMAND':
    case 'SUB_COMMAND_GROUP': return o.name;
    default: return o.value!.toString();
  }
}
