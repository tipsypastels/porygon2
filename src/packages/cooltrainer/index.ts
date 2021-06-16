import { PackageKind } from 'porygon/package';
import { setting } from 'porygon/settings';

export default new PackageKind.Guild(setting('guilds.pokecom').value);
