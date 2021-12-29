import { Controller, proper_controller_for_env } from 'core/controller';
import { logger, panic } from 'core/logger';
import { ControllerRegistrar, Registrar } from 'core/registrar';
import { Client, Collection } from 'discord.js';
import cron from 'node-cron';
import { parseExpression as parse_expression } from 'cron-parser';
import { Cache } from 'support/cache';
import { inline_code, strip_indent } from 'support/string';
import { InitializerOpts } from '../initializer';
import { error_is_skip } from '../skip';
import { formatDistance as format } from 'date-fns';

/**
 * Tasks are functions that run repeatedly at a set interval, or according
 * to a particular cron schedule. They're a subset of initializers, lacking
 * the ability to set events.
 *
 * Tasks also report their own status and track errors to be viewable
 * by the bot operator using `/op` commands.
 */
export interface Task {
  (opts: TaskOpts): void | Promise<void>;
}

type TaskOpts = Omit<InitializerOpts, 'events'>;

interface TaskData {
  run_at: string; // TODO
  quiet?: boolean;
}

class TaskCell {
  private status_manager = new TaskStatusManager();

  constructor(private task: Task, private data: TaskData) {}

  get tag() {
    return this.task.name;
  }

  private get time() {
    return this.data.run_at;
  }

  schedule(client: Client, controller: Controller) {
    logger.debug(`Task %${this.tag}% scheduled at %${this.time}%.`);
    cron.schedule(this.time, () => this.run(client, controller));
  }

  async run(client: Client, controller: Controller) {
    if (!Registrar.synced) {
      // tasks cannot run during startup
      // if this happens it's probably just a coincidence of timing from
      // when the sync phase starts and when the task is scheduled
      return logger.warn(`Task %${this.tag}% tried to run during startup.`);
    }

    const guild = controller.try_into_guild(client);
    const opts: TaskOpts = { client, controller, guild };

    try {
      this.log_non_essential(`Task %${this.tag}% started`);

      await this.task(opts);

      this.report('success');
      this.log_non_essential(`Task %${this.tag}% finished`);
    } catch (e) {
      if (error_is_skip(e)) {
        this.report('skipped');
        logger.warn(`Task %${this.tag}% skipped: %${e.message}%`);
      } else {
        this.report('failure');
        logger.error(`Task %${this.tag}% failed`, e);
      }
    }
  }

  private log_non_essential(message: string) {
    logger[this.data.quiet ? 'debug' : 'info'](message);
  }

  private report(status: Status) {
    this.status_manager.increment(status);
  }

  to_status_string() {
    return strip_indent`
      ${inline_code(this.tag)}
      **Status:** ${this.status_manager.to_status_string()}
      **Runs in:** ${this.next_running_at}`;
  }

  private get next_running_at() {
    const date = parse_expression(this.data.run_at).next().toDate();
    return format(date, new Date());
  }
}

/**
 * A registrar for all tasks. See `Task`.
 */
export class TaskRegistrar extends ControllerRegistrar {
  private static CACHE = new Cache((controller: Controller) => new this(controller));
  private static ALL = new Collection<string, TaskCell>();
  private pending = new Collection<string, TaskCell>();

  static init(prod_controller: Controller) {
    const controller = proper_controller_for_env(prod_controller);
    return this.CACHE.get(controller);
  }

  static to_status_string() {
    return this.ALL.map((task) => task.to_status_string()).join('\n\n');
  }

  protected constructor(controller: Controller) {
    super('tasks', controller);
  }

  async synchronize(client: Client) {
    for (const [, task] of this.pending) {
      task.schedule(client, this.controller);
      TaskRegistrar.ALL.set(task.tag, task);
    }

    this.pending.clear();
  }

  add_task(task: Task, data: TaskData) {
    const cell = new TaskCell(task, data);

    this.ensure_unique(cell);
    this.pending.set(cell.tag, cell);
  }

  private ensure_unique(cell: TaskCell) {
    if (this.pending.has(cell.tag)) {
      panic(`Task %${cell.tag}% was added twice!`);
    }
  }
}

export function add_task(controller: Controller, task: Task, data: TaskData) {
  const registrar = TaskRegistrar.init(controller);
  registrar.add_task(task, data);
}

const STATUSES = <const>['success', 'skipped', 'failure'];
type Status = typeof STATUSES[number];

/**
 * Tracks the success / skip / fail status of a task.
 */
class TaskStatusManager {
  private stats = new Cache<Status, number>(() => 0);
  private last?: Status;
  private symbols = {
    success: '✅',
    skipped: '↩️',
    failure: '❌',
  };

  increment(status: Status) {
    this.stats.update(status, (n) => n + 1);
    this.last = status;
  }

  to_status_string() {
    const list = inline_code(STATUSES.map((s) => this.status_string(s)).join(' '));

    if (!this.last || this.always_got_same_status()) {
      return list;
    }

    const last = ` (last was ${inline_code(this.symbols[this.last])})`;
    return list + last;
  }

  private always_got_same_status() {
    return this.stats.loaded_size < 2;
  }

  private status_string(status: Status) {
    return `${this.symbols[status]} ${this.stats.get(status)}`;
  }
}
