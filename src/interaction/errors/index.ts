// TODO: figure out what you're doing with this and move it into porygon/interaction

import { PorygonEmbed } from 'porygon/embed';

type YieldEmbed = (embed: PorygonEmbed) => unknown;

interface Opts {
  title?: string;
  message?: string;
  yieldEmbed?: YieldEmbed;
}

export abstract class InteractionBaseError {
  protected title?: string;
  protected message?: string;
  protected yieldEmbed?: YieldEmbed;

  constructor(title?: string, message?: string, yieldEmbed?: YieldEmbed);
  constructor(opts: Opts);
  constructor(...args: any[]) {
    if (typeof args[0] === 'string') {
      this.title = args[0];
      this.message = args[1];
      this.yieldEmbed = args[2];
    } else {
      const opts: Opts = args[0];
      this.title = opts.title;
      this.message = opts.message;
      this.yieldEmbed = opts.yieldEmbed;
    }
  }

  intoEmbed(embed: PorygonEmbed) {
    if (this.title) embed.setTitle(this.title);
    if (this.message) embed.setDescription(this.message);
    return embed.merge((e) => this.yieldEmbed?.(e));
  }
}

export class InteractionWarning extends InteractionBaseError {
  intoEmbed(embed: PorygonEmbed) {
    return embed
      .poryThumb('warning')
      .warningColor()
      .merge((e) => super.intoEmbed(e));
  }
}

export class InteractionDanger extends InteractionBaseError {
  intoEmbed(embed: PorygonEmbed) {
    return embed
      .poryThumb('danger')
      .dangerColor()
      .merge((e) => super.intoEmbed(e));
  }
}

export class InteractionError extends InteractionBaseError {
  intoEmbed(embed: PorygonEmbed) {
    return embed
      .poryThumb('danger')
      .dangerColor()
      .merge((e) => super.intoEmbed(e));
  }
}
