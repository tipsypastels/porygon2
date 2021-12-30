import { create_executor } from 'core/command';
import { on_dm_command } from 'core/command/direct_message';
import { create_status_report_middleware, slow_timing } from 'core/command/middleware';
import { Reply } from 'core/command/reply';
import { Row } from 'core/command/row';
import { Embed } from 'core/embed';
import { ContextMenuInteraction as Intr, GuildMember } from 'discord.js';
import { delete_suffix } from 'support/string';
import { Args as BaseArgs, Data } from '../../command';

interface Opts<A extends BaseArgs, I extends Intr> {
  name: string;
  finalize_args(intr: I, base: BaseArgs): A | string;
  command_subject?(args: A): string;
}

export function create_context_menu_executor<A extends BaseArgs, I extends Intr>(
  opts: Opts<A, I>,
) {
  const report_status = create_status_report_middleware<A>({
    command_subject: opts.command_subject,
    command_name({ cell }) {
      return `"${delete_suffix('.', cell.name)}"`;
    },
  });

  return create_executor<A, Data, I>({
    middleware: [report_status, slow_timing],
    into_args(intr, cell) {
      const { client } = cell;
      const { guild, member: author } = intr;

      if (!guild) {
        on_dm_command(`${opts.name} commands`, client, intr);
        return 'tried_dm';
      }

      if (!(author instanceof GuildMember)) {
        return `invalid_author(${author})`;
      }

      const row = new Row();
      const embed = new Embed();
      const reply = new Reply(intr, embed, row);

      const base: BaseArgs = {
        client,
        author,
        guild,
        intr,
        cell,
        embed,
        reply,
        row,
      };

      return opts.finalize_args(intr, base);
    },
  });
}
