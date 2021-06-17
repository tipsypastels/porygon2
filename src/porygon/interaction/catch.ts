import { InteractionBaseError } from 'interaction/errors';
import { Embed } from 'porygon/embed';
import { codeBlock } from 'support/format';

type ShouldRethrow = boolean;

export function catchInteractionError(error: any, embed: Embed.Replyable) {
  const shouldRethrow = injectErrorResponse(error, embed);
  embed.reply();

  if (shouldRethrow) {
    throw error;
  }
}

function injectErrorResponse(error: any, embed: Embed): ShouldRethrow {
  if (error instanceof InteractionBaseError) {
    error.intoEmbed(embed);
    return false;
  }

  if (typeof error === 'object' && 'message' in error) {
    embed
      .errorColor()
      .poryThumb('error')
      .setTitle("Whoops, that's an error.")
      .setDescription(codeBlock(error.message));
    return true;
  }

  embed.errorColor().poryThumb('error').setTitle('An unknown error occurred.');
  return true;
}
