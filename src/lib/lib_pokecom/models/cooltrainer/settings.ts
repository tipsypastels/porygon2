import { setting } from 'porygon/settings';

const base = 'lib.pokecom.cooltrainer';

export const CtSettings = {
  roleId: setting<string>(`${base}.role`),
  threshold: setting<number>(`${base}.threshold`),
  ppmExceptions: setting<Record<string, number>>(`${base}.ppm_exceptions`),
};
