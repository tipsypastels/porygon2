import { Embed } from 'core/embed';
import { logger } from 'core/logger';
import { BaseCommandInteraction as Intr } from 'discord.js';

export class Reply {
  private ephemeral = false;

  constructor(private intr: Intr, private embed: Embed) {}

  set_ephemeral(ephemeral = true) {
    this.ephemeral = ephemeral;
    return this;
  }

  send() {
    return this.if_embed_touched(() =>
      this.intr.reply({
        embeds: [this.embed.into_inner()],
        ephemeral: this.ephemeral,
      }),
    );
  }

  auto_send() {
    if (!this.intr.replied) return this.send();
  }

  private if_embed_touched<T>(fn: () => T) {
    if (!this.embed.touched) {
      logger.warn('Tried to send an untouched embed!');
      return;
    }

    return fn();
  }
}
