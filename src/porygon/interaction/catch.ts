import { Embed } from 'porygon/embed';
import { isEmbeddedError } from 'porygon/embed/errors';
import { codeBlock } from 'support/format';

const enum After {
  Rethrow,
  Ignore,
}

export function catchInteractionError(error: any, embed: Embed.Replyable) {
  const after = injectErrorResponse(error, embed);
  embed.reply();

  if (after === After.Rethrow) {
    throw error;
  }
}

function injectErrorResponse(error: any, embed: Embed): After {
  if (isEmbeddedError(error)) {
    error.intoEmbed(embed);
    return After.Ignore;
  }

  if (typeof error === 'object' && 'message' in error) {
    embed
      .errorColor()
      .poryThumb('error')
      .setTitle("Whoops, that's an error.")
      .setDescription(codeBlock(error.message));

    return After.Rethrow;
  }

  embed.errorColor().poryThumb('error').setTitle('An unknown error occurred.');

  return After.Rethrow;
}
