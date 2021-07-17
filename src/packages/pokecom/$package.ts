import { PackageKind } from 'porygon/package';
import { setting } from 'porygon/settings';

export default PackageKind.Guild.init(setting('guilds.pokecom').value);
