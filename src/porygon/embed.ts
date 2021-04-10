import { CommandInteraction, MessageEmbed } from 'discord.js';
import { PORY_PORTRAIT } from './asset';
import COLORS from './colors.json';

type Reply = CommandInteraction['reply'];

export class PorygonEmbed extends MessageEmbed {
  constructor(private _reply: Reply) {
    super();
  }

  reply() {
    return this._reply(this);
  }

  poryPortrait() {
    return this.setThumbnail(PORY_PORTRAIT);
  }

  okColor() {
    return this.setColor(COLORS.ok);
  }

  infoColor() {
    return this.setColor(COLORS.info);
  }

  errorColor() {
    return this.setColor(COLORS.error);
  }

  warningColor() {
    return this.setColor(COLORS.warning);
  }

  addInlineField(name: any, value: any) {
    return this.addField(name, value, true);
  }
}
