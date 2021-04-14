import { PorygonEmbed } from 'porygon/embed';

type YieldEmbed = (embed: PorygonEmbed) => unknown;

export abstract class InteractionBaseError {
  constructor(
    protected title: string,
    protected message: string,
    protected yieldEmbed?: YieldEmbed,
  ) {}

  intoEmbed(embed: PorygonEmbed) {
    return embed
      .setTitle(this.title)
      .setDescription(this.message)
      .merge({ intoEmbed: (e) => this.yieldEmbed?.(e) });
  }
}

export class InteractionWarning extends InteractionBaseError {
  constructor(message: string, yieldEmbed?: YieldEmbed) {
    super('Usage Error', message, yieldEmbed);
  }

  intoEmbed(embed: PorygonEmbed) {
    return super.intoEmbed(embed).poryThumb('danger').dangerColor();
  }
}

export class InteractionError extends InteractionBaseError {
  constructor(message: string, yieldEmbed?: YieldEmbed) {
    super('Error', message, yieldEmbed);
  }

  intoEmbed(embed: PorygonEmbed) {
    return super.intoEmbed(embed).errorColor();
  }
}
