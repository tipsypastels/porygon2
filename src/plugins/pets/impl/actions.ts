import { Guild, GuildMember, Message } from 'discord.js';
import { config } from 'porygon/config';
import { db } from 'porygon/core';
import { Embed } from 'porygon/embed';
import { createBuiltinErrors } from 'porygon/error';
import { CommandChannel } from 'porygon/interaction';
import { createLang } from 'porygon/lang';

const table = db.plugPets_Pet;

const CHANNEL_ID = config('plug.pets.channel');
const MOD_PERM = config('plug.pets.modPerm') as { value: 'KICK_MEMBERS' };
const LIMIT = 10;

export async function petAdd(member: GuildMember, channel: CommandChannel) {
  await assertChannel(channel);

  const [message, url] = await find(member, channel);
  const data = { url, guildId: member.guild.id, userId: member.id };
  const pet = await table.create({ data });

  message.react('✅');

  return function (embed: Embed) {
    embed
      .poryColor('ok')
      .setTitle(lang('added.title'))
      .setDescription(lang('added.desc', { id: pet.id }));
  };
}

export async function petRemove(id: number, member: GuildMember) {
  const entry = await table.findFirst({ where: { id, guildId: member.guild.id } });

  if (!entry) {
    throw error('missingRem', id);
  }

  const isCreator = member.id === entry.userId;
  const isMod = member.permissions.has(MOD_PERM.value);

  if (!isCreator && !isMod) {
    throw error('maliciousRemovalPub');
  }

  await table.delete({ where: { id } });

  return function (embed: Embed) {
    embed.poryColor('ok').setTitle(lang('removed.title'));
  };
}

type Found = [Message, string];

async function find(member: GuildMember, channel: CommandChannel): Promise<Found> {
  const messages = [...(await channel.messages.fetch({ limit: LIMIT })).values()];

  // more likely to be recent
  for (let i = LIMIT - 1; i >= 0; i--) {
    const message = messages[i] as Message | undefined;

    if (!message || message.author.id !== member.id) {
      continue;
    }

    const attachment = message.attachments.first();

    if (!attachment || !attachment.url) {
      continue;
    }

    return [message, attachment.url];
  }

  throw error('missingAdd');
}

async function assertChannel(channel: CommandChannel) {
  if (channel.id !== CHANNEL_ID.value) {
    throw error('wrongChannel');
  }
}

const lang = createLang(<const>{
  wrongChannel: {
    title: "You're in the wrong place!",
    desc: 'Please use the <#{channel}> channel to add pets :)',
  },
  missingAdd: {
    title: "I couldn't find a pet image from you.",
    desc: 'Please upload a pet image, and then use `/pet add` to save it :)',
  },
  missingRem: 'No such pet with ID: {id}.',
  maliciousRem: {
    title: "You can't remove that pet!",
    desc: "You may only remove pets that you've uploaded.",
  },
  added: {
    title: 'Pet added!',
    desc: 'Remove this pet from the database at any time via `/pet remove {id}`.',
  },
  removed: {
    title: 'Pet removed!',
  },
});

const error = createBuiltinErrors({
  wrongChannel(e) {
    e.poryErr('warning').assign(lang('wrongChannel', { channel: CHANNEL_ID.value }));
  },
  missingAdd(e) {
    e.poryErr('warning')
      .setTitle(lang('missingAdd.title'))
      .setDescription(lang('missingAdd.desc'));
  },
  missingRem(e, id: number) {
    e.poryErr('warning').setTitle(lang('missingRem', { id }));
  },
  maliciousRemovalPub(e) {
    e.poryErr('danger')
      .setTitle(lang('maliciousRem.title'))
      .setDescription(lang('maliciousRem.desc'));
  },
});
