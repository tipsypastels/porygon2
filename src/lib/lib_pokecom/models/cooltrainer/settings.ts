import { setting } from 'porygon/settings';

const base = 'lib.pokecom.cooltrainer';

export const CtSettings = {
  roleId: setting(`${base}.role` as const),
  threshold: setting(`${base}.threshold` as const),
  ppmExceptions: setting(`${base}.ppm_exceptions` as const),
};
