import { GuildMember, TextChannel } from 'discord.js';
import { GuildHandler } from 'lib/lib/event';
import { setting } from 'porygon/settings';
import { PorygonEmbed } from 'porygon/embed';

const CHANNEL_ID = setting('lib.duck.joins.channel');
const ROLE_ID = setting('lib.duck.joins.duck_role');

const joinMessageHandler: GuildHandler = async ({ em }) => {
  em.on('guildMemberAdd', run);
};

export default joinMessageHandler;

function run(member: GuildMember) {
  runWelcome(member);
  runRole(member);
}

function runWelcome(member: GuildMember) {
  const { guild } = member;
  const channel = guild.channels.cache.get(CHANNEL_ID.value) as TextChannel;

  const embed = new PorygonEmbed()
    .okColor()
    .setDescription(`Welcome to the duck zone, ${member.toString()}!`)
    .poryThumb('smile');

  channel.send(embed);
}

function runRole(member: GuildMember) {
  const { guild } = member;
  const role = guild.roles.cache.get(ROLE_ID.value)!;

  member.roles.add(role);
}
