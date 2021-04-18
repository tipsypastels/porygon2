import { Command } from 'interaction/command';
import { setting } from 'porygon/settings';

const ROLE_LIST_URL = setting('lib.pokecom.role_list_url');

const rolelist: Command = async ({ reply }) => {
  reply(ROLE_LIST_URL.value, { ephemeral: true });
};

rolelist.description = 'Provides a link to a list of roles.';

export default rolelist;
