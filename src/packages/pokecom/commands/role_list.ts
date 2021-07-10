import { CommandFn, LocalCommand } from 'porygon/interaction';
import { setting } from 'porygon/settings';

const ROLE_LIST_URL = setting('pkg.pokecom.role_list_url');

const rolelist: CommandFn = async ({ interaction }) => {
  interaction.reply(ROLE_LIST_URL.value, { ephemeral: true });
};

export default new LocalCommand(rolelist, {
  description: 'Provides a link to a list of roles.',
});
