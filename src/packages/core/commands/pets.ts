import { Pet } from '.prisma/client';
import { Guild, GuildMember } from 'discord.js';
import { Command } from 'porygon/interaction/command';
import { InteractionWarning, InteractionDanger } from 'interaction/errors';
import { database } from 'porygon/database';
import { setting } from 'porygon/settings';
import { code } from 'support/format';

type RandOpts = { by?: GuildMember };
type AddOpts = { url: string };
type RemOpts = { id: number };

const CAN_MOD_PETS = setting('pkg.core.pets.mod_perm');

const add: Command.Fn<AddOpts> = async ({ opts, embed, guild, member }) => {
  const { url } = opts;
  const data = { url, guildId: guild.id, userId: member.id };
  const entry = await database.pet.create({ data });

  await embed
    .okColor()
    .setTitle('Pet added!')
    .setDescription(
      `Remove this pet from the database at any time via ${code(
        `/pet remove ${entry.id}`,
      )}.`,
    )
    .reply();
};

const remove: Command.Fn<RemOpts> = async ({ opts, embed, guild, member }) => {
  const { id } = opts;
  const entry = await database.pet.findFirst({
    where: { id, guildId: guild.id },
  });

  if (!entry) {
    throw new InteractionWarning(`No such pet with ID: ${id}.`);
  }

  const isCreator = member.id === entry.userId;
  const isMod = member.permissions.has(CAN_MOD_PETS.value as 'KICK_MEMBERS');

  if (!(isCreator || isMod)) {
    throw new InteractionDanger(
      "You can't remove that pet!",
      "You may only remove pets that you've uploaded.",
    );
  }

  await database.pet.delete({ where: { id } });
  await embed.okColor().setTitle('Pet removed!').reply();
};

const random: Command.Fn<RandOpts> = async ({ opts, embed, guild }) => {
  const { by } = opts;
  const entry = await randomEntry(guild, by);

  if (!entry) {
    throw new InteractionWarning(
      `${by?.displayName ?? 'This server'} has not uploaded any pets.`,
    );
  }

  const petOwner = by ?? (await guild.members.fetch(entry.userId));

  await embed
    .infoColor()
    .setAuthorFromMember(petOwner)
    .setImage(entry.url)
    .setFooter(`Delete this entry with /pets remove ${entry.id}.`)
    .reply();
};

export default new Command.Multipart(
  {
    add,
    remove,
    random,
  },
  {
    name: 'pets',
    description: 'Commands relating to pets.',
    options: [
      {
        name: 'random',
        description:
          'Shows a random pet by a user, or by anyone in the server if no user is provided.',
        type: 'SUB_COMMAND',
        options: [
          {
            name: 'by',
            type: 'USER',
            description: 'The user whose pets should be shown.',
            required: false,
          },
        ],
      },
      {
        name: 'add',
        description: 'Adds a new pet.',
        type: 'SUB_COMMAND',
        options: [
          {
            name: 'url',
            type: 'STRING',
            description: 'URL of pet image to add.',
            required: true,
          },
        ],
      },
      {
        name: 'remove',
        description: "Removes a pet image from Porygon's database.",
        type: 'SUB_COMMAND',
        options: [
          {
            name: 'id',
            type: 'INTEGER',
            description: 'ID of the pet image.',
            required: true,
          },
        ],
      },
    ],
  },
);

async function randomEntry(guild: Guild, by: GuildMember | undefined) {
  const entries = await (by ? randomEntryBy(guild, by) : randomEntryAny(guild));
  return entries[0] as Pet | undefined;
}

function randomEntryAny(guild: Guild) {
  return database.$queryRaw<Pet[]>`
    SELECT * 
    FROM "public"."Pet" 
    WHERE "Pet"."guildId" = ${guild.id} 
    ORDER BY RANDOM() 
    LIMIT 1`;
}

function randomEntryBy(guild: Guild, member: GuildMember) {
  return database.$queryRaw<Pet[]>`
    SELECT * 
    FROM "public"."Pet" 
    WHERE "Pet"."guildId" = ${guild.id} 
    AND "Pet"."userId" = ${member.user.id} 
    ORDER BY RANDOM() 
    LIMIT 1
  `;
}
