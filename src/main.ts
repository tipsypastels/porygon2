import { TOKEN } from './secrets.json';
import { make_client } from 'core/client';

make_client().login(TOKEN);
