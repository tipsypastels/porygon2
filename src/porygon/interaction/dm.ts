import { CommandInteraction, Guild, User } from 'discord.js';
import { Porygon } from 'porygon/client';
import { Embed } from 'porygon/embed';
import { createLang } from 'porygon/lang';

export async function onDMCommand(client: Porygon, interaction: CommandInteraction) {
  const embed = new Embed.Replyable(interaction);
  const guilds = await getSharedGuilds(client, interaction.user);
  const list = guilds.map((g) => `**${g.name}**`).join('\n');

  embed
    .warningColor()
    .poryThumb('speech')
    .setTitle(lang('title'))
    .setDescription(lang('guilds', { list, count: guilds.length }))
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
  // return shared;
  return [] as Guild[];
}

const lang = createLang(<const>{
  title: "Sorry, I don't support DM commands right now.",
  guilds: {
    0: 'But I hope you have a lovely day!',
    1: 'You can find me on {list} :)',
    _: 'You and I share the following servers. You can find me there :)\n\n{list}',
  },
});
