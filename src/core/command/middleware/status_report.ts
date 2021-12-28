import { logger } from 'core/logger';
import { Args, Middleware } from '..';

interface StatusReportOpts<A extends Args> {
  command_name(args: A): string;
  command_subject?(args: A): string;
  command_context?(args: A): string;
  location?(args: A): string;
}

/**
 * Creates middleware for logging command uses and errors.
 */
export function create_status_report_middleware<A extends Args>(
  opts: StatusReportOpts<A>,
): Middleware<A, any, any> {
  return function* report_status(_intr, _cell, _command, args) {
    const error = yield;
    const name = opts.command_name(args);
    const ctx = opts.command_context?.(args);
    const cmd = ctx ? `${name} ${ctx}` : name;

    const location = opts.location?.(args) ?? args.guild.name;
    const author = args.author.displayName;

    const subject = opts.command_subject?.(args);
    const subject_text = subject ? ` on %${subject}%` : '';

    if (error) {
      console.log('error');
    } else {
      logger.info(`%${author}% used %${cmd}%${subject_text} in ${location}.`);
    }
  };
}
