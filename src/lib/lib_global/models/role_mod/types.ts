import { RoleBehaviors } from '.prisma/client';

export interface RoleBuiltinSettings {
  name: string;
  hoist: boolean;
  mentionable: boolean;
}

export type RoleBehaviorSettings = Omit<RoleBehaviors, 'roleId'>;
export type RoleModOpts = RoleBuiltinSettings & RoleBehaviorSettings;
