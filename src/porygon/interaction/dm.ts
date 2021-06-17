import { CommandInteraction, Guild, User } from 'discord.js';
import { Porygon } from 'porygon/client';
import { Embed } from 'porygon/embed';
import { MISPLACED_GLOBAL_CONSOLATION_DUCKS } from 'porygon/assets';

export async function onDMCommand(
  client: Porygon,
  interaction: CommandInteraction,
) {
  const embed = new Embed.Replyable(interaction);
  const guilds = await getSharedGuilds(client, interaction.user);

  if (guilds.length) {
    const term = guilds.length === 1 ? 'server' : 'servers';
    const list = guilds.map((g) => `• **${g.name}**`).join('\n');

    embed.setDescription(
      `You and I share the following ${term}. You can find me there :)\n\n${list}`,
    );
  } else {
    embed
      .setDescription('Anyways, have some rubber ducks.')
      .setImage(MISPLACED_GLOBAL_CONSOLATION_DUCKS.url);
  }

  embed
    .warningColor()
    .poryThumb('speech')
    .setTitle("Sorry, I don't support DM commands right now.")
    .reply();
}

async function getSharedGuilds(client: Porygon, user: User) {
  // can't simply map promises as we want to skip nulls
  const shared: Guild[] = [];

  const promises = client.guilds.cache.map(async (guild) => {
    const member = await guild.members.fetch(user.id).catch(() => null);

    if (member) {
      shared.push(guild);
    }
  });

  await Promise.all(promises);
  return shared;
}
