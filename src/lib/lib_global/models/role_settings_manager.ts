import { RoleSettings } from '.prisma/client';
import { Role } from 'discord.js';
import { InteractionWarning } from 'interaction/errors';
import { database } from 'porygon/database';
import { PorygonEmbed } from 'porygon/embed';
import { yesNo } from 'support/format';

type Settable = Partial<{
  bound: boolean;
  requestable: boolean;
  mentionable: boolean;
  hoisted: boolean;
  color: string;
}>;

export class RoleSettingsManager {
  static table = database.roleSettings;

  static async isBound(role: Role) {
    const settings = await this.load(role);
    return settings?.isBound ?? false;
  }

  static async isRequestable(role: Role) {
    const settings = await this.load(role);
    return settings?.isRequestable ?? false;
  }

  private static async load(role: Role) {
    const instance = new this(role);
    await instance.load();
    return instance.settings;
  }

  private settings: RoleSettings | null = null;
  constructor(private role: Role) {}

  async load() {
    this.settings = await RoleSettingsManager.table.findFirst({
      where: { roleId: this.role.id },
    });

    return this;
  }

  async save(set: Settable) {
    if (Object.keys(set).length === 0) {
      throw new InteractionWarning(
        'You used /rolesettings set with no parameters.',
        'Nothing to set!',
      );
    }

    const [settings] = await Promise.all([
      this.setSettings({
        isBound: set.bound,
        isRequestable: set.requestable,
      }),
      this.role.edit({
        color: set.color,
        mentionable: set.mentionable,
        hoist: set.hoisted,
      }),
    ]);

    this.settings = settings;
  }

  intoEmbed(embed: PorygonEmbed) {
    const { role, settings } = this;
    embed
      .setColorIfNonZero(role.color)
      .addField('Color', role.color === 0 ? 'None' : role.hexColor)
      .addField('Hoisted', yesNo(role.hoist))
      .addField('Bound', yesNo(settings?.isBound))
      .addField('Requestable', yesNo(settings?.isRequestable))
      .addField('Mentionable', yesNo(role.mentionable));
  }

  private async setSettings(settings: Partial<Omit<RoleSettings, 'roleId'>>) {
    return await RoleSettingsManager.table.upsert({
      where: { roleId: this.role.id },
      update: settings,
      create: { ...settings, roleId: this.role.id },
    });
  }
}
