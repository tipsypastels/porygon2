import { Controller, proper_controller_for_env } from 'core/controller';
import { logger, panic } from 'core/logger';
import { ControllerRegistrar } from 'core/registrar';
import { Client, Collection } from 'discord.js';
import cron from 'node-cron';
import { Cache } from 'support/cache';
import { InitializerOpts } from '../initializer';
import { error_is_skip } from '../skip';

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
    const guild = controller.try_into_guild(client);
    const opts: TaskOpts = { client, controller, guild };

    try {
      logger.info(`Running task %${this.tag}%`);

      await this.task(opts);

      logger.info(`Task %${this.tag}% finished`);
    } catch (e) {
      if (error_is_skip(e)) {
        logger.warn(`Task %${this.tag}% skipped: %${e.message}%`);
      } else {
        logger.error(`Task %${this.tag}% failed`, e);
      }
    }
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
