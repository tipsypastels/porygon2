import { Command, Args as BaseArgs } from '../../command';
import {
  UserApplicationCommandData as Data,
  UserContextMenuInteraction as Intr,
  GuildMember,
} from 'discord.js';
import { create_context_menu_executor } from './shared';

interface Args extends BaseArgs {
  subject: GuildMember;
  is_self: boolean;
}

/** A "command" (context menu) used by right clicking on a user. */
export type UserCommand = Command<Args, Data, Intr>;
export type { Data as UserCommandData };

/** An executor for user-type context menu commands. */
export const execute_user_command = create_context_menu_executor<Args, Intr>({
  name: 'user',

  command_subject({ subject }) {
    return subject.displayName;
  },

  finalize_args(intr, args) {
    const subject = intr.options.getMember('user');

    if (!(subject instanceof GuildMember)) {
      return `invalid_subject_member(${subject})`;
    }

    const is_self = subject.id === args.author.id;
    return { ...args, subject, is_self };
  },
});
