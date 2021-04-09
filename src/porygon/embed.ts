import { MessageEmbed } from 'discord.js';
import COLORS from './colors.json';

export class PorygonEmbed extends MessageEmbed {
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
