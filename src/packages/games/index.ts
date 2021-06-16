import { PackageKind } from 'porygon/package';
import { setting } from 'porygon/settings';

// might change in the future
export default PackageKind.Guild.init(setting('guilds.duck').value);
