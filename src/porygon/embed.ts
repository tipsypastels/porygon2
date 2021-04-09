import { MessageEmbed } from 'discord.js';
import { PORY_PORTRAIT } from './asset';
import COLORS from './colors.json';

export class PorygonEmbed extends MessageEmbed {
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

  if(cond: any, callback: (embed: this) => void) {
    if (cond) {
      callback(this);
    }

    return this;
  }
}
