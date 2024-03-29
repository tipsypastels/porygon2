import { HEADPAT_ASSETS } from 'core/assets';
import { add_command, ChatCommand, UserCommand } from 'core/command';
import { DUCK } from 'core/controller';
import { $db } from 'core/db';
import { Guild, GuildMember } from 'discord.js';
import { plural } from 'support/string';
import { Headpat } from '.prisma/client';
import { Embed } from 'core/embed';

const headpat_context_menu: UserCommand = async (args) => {
  return headpat_inner(args);
};

const headpat_chat_command: ChatCommand = async ({ embed, author, opts }) => {
  const subject = opts.member('friend');
  const is_self = author.id === subject.id;
  return headpat_inner({ embed, subject, is_self });
};

add_command(DUCK, headpat_context_menu, { name: 'Offer a Headpat', type: 'USER' });
add_command(DUCK, headpat_chat_command, {
  name: 'headpat',
  description: 'Offer a headpat to a friend.',
  options: [
    {
      name: 'friend',
      description: 'The friend to headpat.',
      type: 'USER',
      required: true,
    },
  ],
});

const headpatscores: ChatCommand = async ({ embed, guild }) => {
  for await (const { member, score } of leaderboard(guild)) {
    embed.field(member.displayName, `${score}`);
  }

  embed.color('info').title('Headpat Scores').about(HOWTO);
};

add_command(DUCK, headpatscores, {
  name: 'headpatscores',
  description: 'Shows the most headpatted members.',
});

/* -------------------------------------------------------------------------- */
/*                                    Inner                                   */
/* -------------------------------------------------------------------------- */

interface Inner {
  embed: Embed;
  subject: GuildMember;
  is_self: boolean;
}

async function headpat_inner({ embed, subject, is_self }: Inner) {
  embed.color('ok').about(`${subject} has been headpat!`).image(gif());

  if (!is_self) {
    await increment_score(subject);
    const score = await get_score(subject);
    embed.foot(`${subject.displayName} has been headpat ${plural(score, 'time')}!`);
  }
}

/* -------------------------------------------------------------------------- */
/*                               Implementation                               */
/* -------------------------------------------------------------------------- */

const TABLE = $db.headpat;
const HOWTO =
  "To give a headpat, right click on a friend's name and select `Apps › Offer a headpat`.";

function gif() {
  return HEADPAT_ASSETS.random().url;
}

async function get_score({ id }: GuildMember) {
  return TABLE.findUnique({ where: { user_id: id } }).then((x) => x?.score ?? 0);
}

async function increment_score({ id }: GuildMember, by = 1) {
  await $db.$executeRaw`
    INSERT INTO
      "public"."Headpat" ("user_id", "score")
    VALUES
      (${id}, ${by})
    ON CONFLICT ON CONSTRAINT
      "Headpat_pkey"
    DO UPDATE SET score = (
      "Headpat"."score" + "excluded"."score"
    )
  `;
}

async function* leaderboard(guild: Guild) {
  const entries = await fetch_leaderboard();
  const promises = entries.map(({ user_id }) => {
    return guild.members.fetch(user_id).catch(() => null);
  });

  const members = await Promise.all(promises);
  for (let i = 0; i < entries.length; i++) {
    const member = members[i];
    const score = entries[i].score;

    if (member && score) {
      yield { member, score };
    }
  }
}

function fetch_leaderboard() {
  return $db.$queryRaw<Headpat[]>`
    SELECT 
      "user_id", "score"
    FROM
      "public"."Headpat"
    ORDER BY
      "score" DESC
    LIMIT
      10
  `;
}
