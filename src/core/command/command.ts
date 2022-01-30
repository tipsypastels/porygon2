import { Embed } from 'core/embed';
import { logger } from 'core/logger';
import {
  BaseCommandInteraction as Intr,
  ApplicationCommandData as Data,
  Client,
  Guild,
  GuildMember,
  Message,
} from 'discord.js';
import { identity, noop, tap } from 'support/fn';
import { Maybe, None } from 'support/null';
import { is_string } from 'support/string';
import { Cell } from '.';
import { Reply } from './reply';
import { Row } from './row';

/**
 * The basic arguments to be passed to all commands.
 */
export interface Args {
  client: Client;
  author: GuildMember;
  guild: Guild;
  intr: Intr;
  cell: Cell;
  embed: Embed;
  reply: Reply;
  row: Row;
}

/**
 * An extension to `Args` - those commands whose arguments have support
 * for checking subcommands. This is just `ChatCommand` at the moment, but
 * is left generic for future extension.
 */
export interface ArgsWithSubcommand extends Args {
  opts: { sub_command: Maybe<string> };
}

/**
 * A generic command, parameterized by its arguments, registration data, and the
 * type of interaction that calls it.
 */
export interface Command<A extends Args, D extends Data, I extends Intr> {
  (args: A): Promise<void>;

  // implementation detail
  // this isn't actually used in redirecting commands to subcommands,
  // but *is* used so that the original instances of subcommand functions
  // aren't lost, and they can be used to look up autocompletes and other
  // keyed-by-command accessors.
  __sub_commands?: Record<string, Command<A, D, I>>;

  // note type variables here to keep them from being lost
  // they're not actually used in the `Command` type, but other
  // functions that interface with commands will need them
  __keep_type_D?: D;
  __keep_type_I?: I;
}

export type { Intr, Data };
export type AnyCommand = Command<any, any, any>;

/**
 * The two values known at the start of a command call - the cell containing
 * the command, and the interaction that kicked off the call.
 */
export type Call<A extends Args, D extends Data, I extends Intr> = [
  intr: I,
  cell: Cell<A, D, I>,
];

/**
 * A `Call<A, D, I>` that has completed the first step of resolving arguments.
 * This is the final state of command calls before actually calling the
 * command function.
 */
export type ResolvedCall<A extends Args, D extends Data, I extends Intr> = [
  ...call: Call<A, D, I>,
  args: A,
];

/**
 * A function that executes a command. Takes charge of resolving its arguments
 * and running any associated middleware.
 */
export interface Executor<A extends Args, D extends Data, I extends Intr> {
  (...call: Call<A, D, I>): Promise<void>;
}

/**
 * A generator that wraps a command execution. Code *before* the `yield`
 * runs before the command itself is called, and likewise for after. `yield`
 * returns an `any` for the error produced by the command, or none for success.
 */
export interface Middleware<A extends Args, D extends Data, I extends Intr> {
  (...rcall: ResolvedCall<A, D, I>): Generator<None, void, any>;
}

interface ExecutorOpts<A extends Args, D extends Data, I extends Intr> {
  middleware?: Middleware<A, D, I>[];
  into_args(...call: Call<A, D, I>): A | string;
}

/**
 * Creates an executor. See `Executor`.
 */
export function create_executor<A extends Args, D extends Data, I extends Intr>(
  opts: ExecutorOpts<A, D, I>,
): Executor<A, D, I> {
  return async (intr, cell) => {
    const args = opts.into_args(intr, cell);

    if (is_string(args)) {
      return logger.debug(`Failed to gather args for %${cell.name}%: %${args}%`);
    }

    const start = (m: Middleware<A, D, I>) => {
      return tap((m) => m.next(), m(intr, cell, args));
    };

    const resumable_middleware = opts.middleware?.map(start);

    const error = await run_command(cell.command, args);

    if (!error) {
      start_message_runtime(args, intr).catch((e) => {
        logger.error('Failed to start message runtime', e);
      });
    }

    resumable_middleware?.map((m) => m.next(error));
  };
}

function run_command<A extends Args>(command: Command<A, any, any>, args: A) {
  return command(args).then(noop).catch(identity);
}

async function start_message_runtime(args: Args, intr: Intr) {
  await args.reply.auto_send();

  if (args.row.touched) {
    const message = await intr.fetchReply();

    if (!(message instanceof Message)) {
      return logger.warn(`Couldn't get a message instance, got %${message}%`);
    }

    args.row.start_runtime(message, args.embed);
  }
}
