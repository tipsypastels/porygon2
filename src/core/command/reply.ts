import { Embed } from 'core/embed';
import { logger } from 'core/logger';
import { BaseCommandInteraction as Intr, InteractionReplyOptions } from 'discord.js';
import { Row } from './row';

/**
 * A replier
 */
export class Reply {
  private _content?: string;
  private _ephemeral = false;
  private _ephemeral_on_crash = true;

  constructor(private intr: Intr, readonly embed: Embed, private row?: Row) {}

  get touched() {
    return this.embed.touched || this.row?.touched || this._content;
  }

  get ephemeral() {
    return this._ephemeral;
  }

  set_ephemeral(ephemeral = true) {
    this._ephemeral = ephemeral;
    return this;
  }

  get ephemeral_on_crash() {
    return this._ephemeral_on_crash;
  }

  set_ephemeral_on_crash(ephemeral: boolean) {
    this._ephemeral_on_crash = ephemeral;
    return this;
  }

  set_content(content: string) {
    this._content = content;
  }

  async send() {
    if (this.check_touched()) {
      await this.intr.reply(this.build_response_data());
    }
  }

  async send_or_update() {
    if (this.check_touched()) {
      const data = this.build_response_data();
      const method = this.intr.replied || this.intr.deferred ? 'editReply' : 'reply';
      await this.intr[method](data);
    }
  }

  async auto_send() {
    if (!this.intr.replied) await this.send();
  }

  private check_touched() {
    if (this.touched) {
      return true;
    }

    logger.warn('Tried to send an untouched reply!');
    return false;
  }

  private build_response_data() {
    const out: InteractionReplyOptions = {};

    out.ephemeral = this._ephemeral;

    if (this.embed.touched) {
      out.embeds = [this.embed.into_inner()];
    }

    if (this.row?.touched) {
      out.components = [this.row.into_inner()];
    }

    if (this._content) {
      out.content = this._content;
    }

    return out;
  }
}
