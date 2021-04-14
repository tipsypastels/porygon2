import { GuildMember } from 'discord.js';
import { Command, CommandHandler } from 'interaction/command';
import { disambiguate } from 'interaction/command/disambiguate';
import { InteractionWarning, InteractionDanger } from 'interaction/errors';
import { database } from 'porygon/database';
import { Setting } from 'porygon/settings';
import { code } from 'support/format';

type RandOpts = { random: { by?: GuildMember } };
type AddOpts = { add: { url: string } };
type DelOpts = { delete: { id: number } };
type Opts = RandOpts | AddOpts | DelOpts;

const Pet = database.pet;
const CAN_MOD_PETS = new Setting('pets.can_mod', 'KICK_MEMBERS');

const pets: Command<Opts> = async (args) => {
  await disambiguate(args, { add: petsAdd, delete: petsDel, random: petsRand });
};

const petsAdd: CommandHandler<AddOpts> = async ({
  opts,
  embed,
  guild,
  member,
}) => {
  const { url } = opts.add;
  const data = { url, guildId: guild.id, userId: member.id };
  const entry = await Pet.create({ data });

  await embed
    .okColor()
    .setTitle('Pet added!')
    .setDescription(
      `Delete this pet from the database at any time via ${code(
        `/pet delete ${entry.id}`,
      )}.`,
    )
    .reply();
};

const petsDel: CommandHandler<DelOpts> = async ({
  opts,
  embed,
  guild,
  member,
}) => {
  const { id } = opts.delete;
  const entry = await Pet.findFirst({
    where: { id, guildId: guild.id },
  });

  if (!entry) {
    throw new InteractionWarning(`No such pet with ID: ${id}.`);
  }

  const isCreator = member.id === entry.userId;
  const isMod = member.permissions.has(CAN_MOD_PETS.value);

  if (!(isCreator || isMod)) {
    throw new InteractionDanger(
      "You can't delete that pet!",
      "You may only delete pets that you've uploaded.",
    );
  }

  await Pet.delete({ where: { id } });
  await embed.okColor().setTitle('Pet deleted!').reply();
};

const petsRand: CommandHandler<RandOpts> = async ({ opts, embed, guild }) => {
  const { by } = opts.random;
  // const entry = await Pet.findFirst({
  //   where: { userId: by?.user.id, guildId: guild.id },
  // });

  const entry = await database.$queryRaw`SELECT * FROM porygon2.Pet WHERE guildId = ${guild.id} ORDER BY RANDOM() LIMIT 1`;

  if (!entry) {
    throw new InteractionWarning(
      `${by?.displayName ?? 'This server'} has not uploaded any pets.`,
    );
  }

  const petOwner = by ?? (await guild.members.fetch(entry.userId));

  await embed
    .infoColor()
    .setAuthor(petOwner)
    .setImage(entry.url)
    .setFooter(`Delete this entry with /pets delete ${entry.id}.`)
    .reply();
};

pets.description = 'Commands relating to pets.';
pets.options = [
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
    name: 'delete',
    description: "Deletes a pet image from Porygon's database.",
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
];

export default pets;
