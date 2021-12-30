import { Embed } from 'core/embed';
import { Client, BaseCommandInteraction as Intr, User, Guild } from 'discord.js';
import { noop } from 'support/fn';
import { bold } from 'support/string';

export function on_dm_command(type: string, client: Client, intr: Intr) {
  const embed = new Embed();

  shared_guilds_message(client, intr.user)
    .then((message) => {
      embed
        .pory('speech')
        .color('warning')
        .title(`Sorry, I don't support ${type} via direct message.`)
        .about(message);

      return intr.reply({ embeds: [embed.into_inner()] });
    })
    .catch(noop);
}

async function shared_guilds_message(client: Client, user: User) {
  const shared: Guild[] = []; // can't simply map, we want to skip nones
  const promises = client.guilds.cache.map(async (guild) => {
    const member = await guild.members.fetch(user.id).catch(noop);
    if (member) shared.push(guild);
  });

  await Promise.all(promises);
  switch (shared.length) {
    case 0: {
      return 'But I hope you have a lovely day!';
    }
    case 1: {
      return `You can find me on **${shared[0].name}** :)`;
    }
    default: {
      const list = shared.map((g) => bold(g.name)).join('\n');
      return `You and I share the following servers. You can find me there :)\n\n${list}`;
    }
  }
}
