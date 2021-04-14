import { PorygonEmbed } from 'porygon/embed';

export abstract class InteractionBaseError {
  constructor(protected title: string, protected message: string) {}

  intoEmbed(embed: PorygonEmbed) {
    return embed.setTitle(this.title).setDescription(this.message);
  }
}

export class InteractionWarning extends InteractionBaseError {
  constructor(message: string) {
    super('Usage Error', message);
  }

  intoEmbed(embed: PorygonEmbed) {
    return super.intoEmbed(embed).poryThumb('danger').dangerColor();
  }
}

export class InteractionError extends InteractionBaseError {
  intoEmbed(embed: PorygonEmbed) {
    return super.intoEmbed(embed).errorColor();
  }
}
