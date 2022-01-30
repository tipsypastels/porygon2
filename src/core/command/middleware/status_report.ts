import { Embed } from 'core/embed';
import { logger } from 'core/logger';
import { get_scrubbed_error_message } from 'support/error';
import { is_none } from 'support/null';
import { code_block } from 'support/string';
import { Args, Middleware } from '..';
import { Reply } from '../reply';
import { is_usage_error } from '../usage_error';

interface StatusReportOpts<A extends Args> {
  command_name(args: A): string;
  command_subject?(args: A): string;
  command_context?(args: A): string;
  location?(args: A): string;
}

const DEFAULT_ERROR = 'No error message could be provided.';

/**
 * Creates middleware for logging command uses and errors.
 */
export function create_status_report_middleware<A extends Args>(
  opts: StatusReportOpts<A>,
): Middleware<A, any, any> {
  return function* report_status(intr, cell, args) {
    const error = yield;
    const name = opts.command_name(args);
    const ctx = opts.command_context?.(args);
    const cmd = ctx ? `${name} ${ctx}` : name;

    const location = opts.location?.(args) ?? args.guild.name;
    const author = args.author.displayName;

    const subject = opts.command_subject?.(args);
    const subject_text = subject ? ` on %${subject}%` : '';

    function basic_message(verb: string) {
      return `%${author}% ${verb} %${cmd}%${subject_text} in ${location}`;
    }

    if (is_none(error)) {
      logger.info(basic_message('used'));
    } else {
      const embed = new Embed();
      const reply = new Reply(intr, embed);

      if (is_usage_error(error)) {
        const code = `${cell.name}.${error.code}`;

        logger.warn(`${basic_message('misused')} and encountered error %${code}%`);
        reply.set_ephemeral(error.ephemeral);
        embed.merge(error.into_embed, cell.name);
      } else {
        logger.error(basic_message('crashed'), error);
        reply.set_ephemeral(args.reply.ephemeral_on_crash);
        embed
          .pory('error')
          .color('error')
          .title('Welp! The command crashed.')
          .about(code_block(get_scrubbed_error_message(error) ?? DEFAULT_ERROR))
          .foot('Error Code: unknown');
      }

      reply.send()?.catch((e) => {
        logger.error('Above error could not be reported by interaction', e);
      });
    }
  };
}
