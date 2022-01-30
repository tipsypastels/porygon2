import { UploadInterface } from 'core/controller';
import { logger } from 'core/logger';
import { ApplicationCommand, GuildMember, Role } from 'discord.js';
import { UNSET, Unset } from 'support/unset';
import { AnyCommand, Args, Command, Data, Intr } from '.';

interface CellOpts {
  command: AnyCommand;
  data: Data;
  api: string | ApplicationCommand;
  upload_iface: UploadInterface;
}

/**
 * A cell stores a command, along with its data, and a factory to build an execution
 * environment for it. Cells are created by the command registar and can't be made
 * dynamically.
 */
export class Cell<A extends Args = any, D extends Data = any, I extends Intr = any> {
  // local data
  readonly command: Command<A, D, I>;
  readonly data: Data;

  // api/cache data. if `api` is present then we did an edit/update or loaded later
  private api: LazyApplicationCommand;

  // i, the upload iface, am also here :')
  private upload_iface: UploadInterface;

  constructor(opts: CellOpts) {
    this.command = opts.command;
    this.data = opts.data;
    this.api = new LazyApplicationCommand(opts);
    this.upload_iface = opts.upload_iface;
  }

  get id() {
    return this.api.id;
  }

  get name() {
    return this.data.name;
  }

  get client() {
    return this.upload_iface.client;
  }

  async set_permission(target: Role | GuildMember, is_enabled: boolean) {
    const api = await this.api.fetch();

    const type = target instanceof GuildMember ? 'USER' : 'ROLE';
    const permissions = [{ id: target.id, type, permission: is_enabled }];
    const options: any = { permissions, guild: target.guild };

    return api.permissions.add(options);
  }
}

/**
 * Tiny loader for the `ApplicationCommand`. Because commands are cached,
 * most `Cell`s will *not* have this loaded by default, and it's a waste to
 * bother with it up front. But we do want it sometimes and at that point it's
 * cached by the individual cell.
 */
class LazyApplicationCommand {
  readonly id: string;
  private api: Unset<ApplicationCommand>;

  constructor(private opts: CellOpts) {
    if (typeof opts.api === 'string') {
      this.id = opts.api;
      this.api = UNSET;
    } else {
      this.id = opts.api.id;
      this.api = opts.api;
    }
  }

  async fetch() {
    if (this.api !== UNSET) {
      return this.api;
    }

    logger.debug(`Fetching API command for %${this.opts.data.name}%`);

    const api = await this.opts.upload_iface.fetch(this.id);
    this.api = api;
    return api;
  }
}
