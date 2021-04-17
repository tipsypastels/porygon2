import { RoleBehaviors } from '.prisma/client';
import { Role } from 'discord.js';
import { InteractionWarning } from 'interaction/errors';
import { database } from 'porygon/database';
import { Diff } from 'porygon/diff';
import { PorygonEmbed } from 'porygon/embed';

export interface RoleBuiltinSettings {
  hoist: boolean;
  mentionable: boolean;
}

export type RoleBehaviorSettings = Omit<RoleBehaviors, 'roleId'>;
export type RoleModOpts = RoleBuiltinSettings & RoleBehaviorSettings;

export class RoleMod {
  static table = database.roleBehaviors;

  // async constructors when
  static async init(role: Role) {
    const behaviors = await RoleMod.table.findFirst({
      where: { roleId: role.id },
    });

    return new this(role, behaviors ?? { requestable: false, bound: false });
  }

  static extractOpts(role: Role, behaviors: RoleBehaviorSettings): RoleModOpts {
    return {
      hoist: role.hoist,
      mentionable: role.mentionable,
      requestable: behaviors.requestable,
      bound: behaviors.bound,
    };
  }

  private role: Role;
  private diff: Diff<RoleModOpts>;

  private constructor(role: Role, behaviors: RoleBehaviorSettings) {
    this.role = role;
    this.diff = new Diff(RoleMod.extractOpts(role, behaviors));
  }

  set(opts: Partial<RoleModOpts>) {
    this.diff.changeMany(opts);
    return this;
  }

  async save() {
    if (this.diff.unchanged) {
      throw new InteractionWarning(
        'You used /rolesettings set with no parameters.',
        'Nothing to set!',
      );
    }

    const state = this.diff.getCurrentState();

    await Promise.all([
      this.setBehaviors({
        bound: state.bound,
        requestable: state.requestable,
      }),
      this.role.edit({
        mentionable: state.mentionable,
        hoist: state.hoist,
      }),
    ]);
  }

  intoEmbed(embed: PorygonEmbed) {
    const { role, diff } = this;

    embed
      .setColorIfNonZero(role.color)
      .addField('Hoisted', diff.getChangeString('hoist'))
      .addField('Bound', diff.getChangeString('bound'))
      .addField('Requestable', diff.getChangeString('requestable'))
      .addField('Mentionable', diff.getChangeString('mentionable'));
  }

  private async setBehaviors(behaviors: RoleBehaviorSettings) {
    return await RoleMod.table.upsert({
      where: { roleId: this.role.id },
      update: behaviors,
      create: { ...behaviors, roleId: this.role.id },
    });
  }
}
