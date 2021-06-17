import { GuildMember, TextChannel } from 'discord.js';
import { setting } from 'porygon/settings';
import { Embed } from 'porygon/embed';
import { EventHandler, PackageKind } from 'porygon/package';

const CHANNEL_ID = setting('pkg.duck.joins.channel');
const ROLE_ID = setting('pkg.duck.joins.duck_role');

const join: EventHandler = async ({ events }) => {
  events.on('guildMemberAdd', run);
};

export default join;

function run(member: GuildMember) {
  runWelcome(member);
  runRole(member);
}

function runWelcome(member: GuildMember) {
  const { guild } = member;
  const channel = guild.channels.cache.get(CHANNEL_ID.value) as TextChannel;

  const embed = new Embed()
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
