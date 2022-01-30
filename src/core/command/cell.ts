import { ApplicationCommand, Client } from 'discord.js';
import { Maybe } from 'support/null';
import { AnyCommand, Args, Command, Data, Intr } from '.';

interface CellOpts {
  command: AnyCommand;
  data: Data;
  id: string;
  api: Maybe<ApplicationCommand>;
  client: Client;
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
  readonly id: string;
  private api: Maybe<ApplicationCommand>;

  // i, the client, am also here :')
  readonly client: Client;

  constructor(opts: CellOpts) {
    this.command = opts.command;
    this.data = opts.data;
    this.id = opts.id;
    this.api = opts.api;
    this.client = opts.client;
  }

  get name() {
    return this.data.name;
  }

  async api_command() {
    this.client.application?.commands.fetch();
  }
}
