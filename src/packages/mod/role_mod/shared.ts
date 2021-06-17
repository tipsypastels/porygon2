import { Role } from 'discord.js';
import { database } from 'porygon/database';
import { Embed } from 'porygon/embed';
import { yesNo } from 'support/format';
import {
  RoleBehaviorSettings,
  RoleBuiltinSettings,
  RoleModOpts,
} from './types';

export async function fetchRoleOpts(role: Role): Promise<RoleModOpts> {
  const currentBehaviors = await database.roleBehaviors.findFirst({
    where: { roleId: role.id },
  });

  return {
    name: role.name,
    hoist: role.hoist,
    mentionable: role.mentionable,
    requestable: currentBehaviors?.requestable ?? false,
    bound: currentBehaviors?.bound ?? false,
  };
}

export function embedRoleFields(
  embed: Embed,
  role: RoleBuiltinSettings,
  behaviors: RoleBehaviorSettings,
) {
  embed
    .addField('Name', role.name)
    .addField('Hoist', yesNo(role.hoist))
    .addField('Bound', yesNo(behaviors.bound))
    .addField('Requestable', yesNo(behaviors.requestable))
    .addField('Mentionable', yesNo(role.mentionable));
}
