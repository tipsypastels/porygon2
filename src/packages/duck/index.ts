import { PackageKind } from 'porygon/package';
import { setting } from 'porygon/settings';

export default new PackageKind.Guild(setting('guilds.duck').value);
