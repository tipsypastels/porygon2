import { Command } from 'interaction/command';
import { Setting } from 'porygon/settings';

const ROLE_LIST_URL = new Setting(
  'pokecom.role_list_url',
  'https://pokecommunity.com/about/discordroles',
);

const rolelist: Command = async ({ reply }) => {
  reply(ROLE_LIST_URL.value, { ephemeral: true });
};

rolelist.description = 'Provides a link to a list of roles.';

export default rolelist;
