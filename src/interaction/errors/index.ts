import COLORS from 'porygon/colors.json';
import { PorygonEmbed } from 'porygon/embed';

export abstract class InteractionBaseError {
  protected abstract color: string;

  constructor(protected title: string, protected message: string) {}

  intoEmbed(embed: PorygonEmbed) {
    return embed
      .setTitle(this.title)
      .setDescription(this.message)
      .setColor(this.color);
  }
}

export class InteractionWarning extends InteractionBaseError {
  constructor(message: string) {
    super('Usage Error', message);
  }

  protected color = COLORS.warning;
}

export class InteractionError extends InteractionBaseError {
  protected color = COLORS.danger;
}
