import { assert } from 'core/assert';
import { logger, panic } from 'core/logger';
import { Client } from 'discord.js';
import { IS_DEBUG } from 'support/env';

/**
 * A step of the setup process. Setup steps define a callback to
 * execute during setup, along with a data-gathering "storage" system
 * that allows applying the same step to different operands to "merge"
 * into a single operation with combined operands.
 */
interface Step<I, S> {
  /**
   * The name of the setup step. Globally unique. If your step
   * is scoped to a controller, the controller must be part of its name.
   *
   * Steps of the same name are only ever run once, no matter how many
   * times `add_setup_step` is called. Subsequent calls will instead
   * take the provided `item` and `store_push` it onto the operand list
   * of the original call of that name.
   */
  name: string;
  /**
   * If true, the setup process will *not* wait for this step to finish,
   * and it will log an error instead of panicking if the step fails. Not
   * usually what you want, but useful for throwaway tasks.
   */
  floating?: boolean;
  /**
   * Executes the step during the setup phase.
   */
  execute(client: Client, store: S): Promise<void>;
  /**
   * Creates the backing storage that operands will be added to while
   * building up the full list of operands for the step to process.
   */
  store_create(): S;
  /**
   * Pushes an item onto the backing storage.
   */
  store_push(item: I, store: S): void;
  /**
   * Allows skipping the setup step if this function returns true. If your
   * step is scoped to a controller, check `is_connected`.
   */
  skip_if?(client: Client): boolean;
}

/**
 * The internal format of a step that has been added.
 */
interface StepCell<I, S> {
  /**
   * @see Step
   */
  step: Step<I, S>;
  /**
   * The backing storage for the step, which was created when it was
   * first added.
   */
  store: S;
  /**
   * The caller of the `add_setup_step` function. In development, it is
   * checked against subsequent calls to make sure the same name is not
   * being used from multiple locations and potentially multiple types,
   * which would violate the type safety of `STEPS`.
   *
   * In production, the value is always an empty string.
   */
  caller: string;
}

const STEPS = new Map<string, StepCell<any, any>>();

/**
 * Registers a function to run during the setup phase, such as a command
 * upload or initializer.
 *
 * @see Step
 */
export function add_setup_step<I, S>(item: I, step: Step<I, S>) {
  const old_cell = STEPS.get(step.name);
  const caller = trace_caller();

  if (old_cell) {
    assert(caller === old_cell.caller, `%$${step.name}% called from multiple places!`);
    logger.debug(`Setup step %${step.name}% gained an item`);

    return old_cell.step.store_push(item, old_cell.store);
  }

  logger.debug(`Setup step %${step.name}% created!`);

  const store = step.store_create();
  const new_cell: StepCell<I, S> = { step, store, caller };

  new_cell.step.store_push(item, new_cell.store);
  STEPS.set(step.name, new_cell);
}

export function run_setup_steps(client: Client) {
  const promises: Promise<void>[] = [];

  for (const [step_id, step_cell] of STEPS) {
    const { step, store } = step_cell;

    if (step.skip_if?.(client)) {
      continue;
    }

    const float = step.floating;
    const promise = step.execute(client, store).catch((e) => {
      const fn = float ? logger.error : panic;
      fn(`${float ? 'Floating s' : 'S'}etup step %${step_id}% failed`, e);
    });

    if (!float) {
      promises.push(promise);
    }
  }

  return Promise.all(promises);
}

function trace_caller(): string {
  if (!IS_DEBUG) {
    return '';
  }

  try {
    throw new Error();
  } catch (e: any) {
    return e.stack;
  }
}
