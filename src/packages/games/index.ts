import { PackageKind } from 'porygon/package';
import { setting } from 'porygon/settings';

// might change in the future
export default new PackageKind.Guild(setting('guilds.duck').value);
