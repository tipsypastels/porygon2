import { Command } from 'porygon/interaction';
import { setting } from 'porygon/settings';

const ROLE_LIST_URL = setting('pkg.pokecom.role_list_url');

const rolelist: Command.Fn = async ({ interaction }) => {
  interaction.reply(ROLE_LIST_URL.value, { ephemeral: true });
};

export default new Command(rolelist, {
  description: 'Provides a link to a list of roles.',
});
