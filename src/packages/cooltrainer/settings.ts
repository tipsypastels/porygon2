import { setting } from 'porygon/settings';

const roleId = setting('pkg.cooltrainer.role');
const threshold = setting('pkg.cooltrainer.threshold');
const ppmExceptions = setting('pkg.cooltrainer.ppm_exceptions');

export const CtSettings = { roleId, threshold, ppmExceptions };
