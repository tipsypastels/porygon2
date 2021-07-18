import { code } from 'support/format';

interface Renamed {
  kind: 'renamed';
  to: string;
}

interface Unchanged {
  kind: 'unchanged';
}

interface Removed {
  kind: 'removed';
}

type LegacyCommand = Renamed | Unchanged | Removed;

// Note: this list only includes public pc commands.
// It's a waste of time to build in a permission system to shim mod commands,
// and Duck Communism users are already used to slash commands.
const LEGACY_COMMANDS: Record<string, LegacyCommand> = {
  // FC
  delfc: { kind: 'removed' }, // TODO: was this intentional?
  fc: { kind: 'renamed', to: 'fc get' },
  setfc: { kind: 'renamed', to: 'fc set' },

  // PETS (includes aliases)
  addpet: { kind: 'renamed', to: 'pets add' },
  addpets: { kind: 'renamed', to: 'pets add' },
  delpet: { kind: 'renamed', to: 'pets remove' },
  delpets: { kind: 'renamed', to: 'pets remove' },
  pet: { kind: 'renamed', to: 'pets random' },
  pets: { kind: 'renamed', to: 'pets random' },

  // REQUESTABLE ROLES
  addrole: { kind: 'renamed', to: 'role add' },
  removerole: { kind: 'renamed', to: 'role remove' },
  rolelist: { kind: 'unchanged' },

  // UTILITIES
  calc: { kind: 'unchanged' },
  dice: { kind: 'renamed', to: 'roll' },
  roll: { kind: 'unchanged' },
  flip: { kind: 'unchanged' },
  guild: { kind: 'removed' },
  poll: { kind: 'unchanged' }, // TODO: this isn't actually in yet, waiting for varargs

  // META
  changelog: { kind: 'removed' },
  commands: { kind: 'removed' },
  help: { kind: 'unchanged' },
  ping: { kind: 'unchanged' },
  version: { kind: 'removed' },
};

export function getLegacyCommandRecommendation(command: string) {
  const shim = LEGACY_COMMANDS[command];

  if (!shim) {
    return;
  }

  switch (shim.kind) {
    case 'renamed':
      return `${bang(command)} has been renamed and is now usable as ${slash(shim.to)}.`;
    case 'unchanged':
      return `${bang(command)} is now usable as ${slash(command)}`;
    case 'removed':
      return `${bang(command)} has been removed.`;
  }
}

function bang(name: string) {
  return format(name, '!');
}

function slash(name: string) {
  return format(name, '/');
}

function format(name: string, prefix: '!' | '/') {
  return code(prefix + name);
}
