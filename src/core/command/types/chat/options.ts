import {
  CommandInteraction,
  CommandInteractionOption as Option,
  GuildMember,
  Role,
} from 'discord.js';
import { is_command_channel } from '../../channel';

type Inner = CommandInteraction['options'];

/**
 * Wraps chat command options in a nicer API. Discord.js's system for this *sucks*,
 * for a bunch of reasons. Wordy, nullable by default, can return API types...
 * we're making our own thing.
 */
export class Options {
  constructor(private inner: Inner) {}

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

  try_bool(name: string) {
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
