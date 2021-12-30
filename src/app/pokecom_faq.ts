import { add_faq_command } from 'core/command/faq';
import { POKECOM } from 'core/controller';
import * as PC_URL from 'core/guild/pc_url';
import { strip_indent } from 'support/string';

// TODO: this should use the real cooltrainer variable once we do that, maybe?
// still not sure about config overall
const COOLTRAINER = '<@&531984098038775842>';
const SELFPROMO = '<#843868495565029416>';
const MODEROID = '<@&157985920912588800>';
const ROLELIST = PC_URL.about('discordroles');

const PATCHING_TUT = PC_URL.thread(458595);

const RH_ALL_LIST = PC_URL.forum('rom-hacks-studio');
const RH_COMPLETED_LIST = PC_URL.thread(453539);

const GD_ALL_LIST = PC_URL.forum('games-showcase');
const GD_COMPLETED_LIST = PC_URL.forum_prefix('games-showcase', 'gc_completed');

add_faq_command(POKECOM, (faq) => {
  faq.add('How do I post in #self-promo?', (e) => {
    e.title('#self-promo').about(
      `Posting in ${SELFPROMO} is restricted to members with a special role. To prevent members joining to advertise, this role is only given to server regulars. If you've been around for a few months and chatting regularly, feel free to DM a ${MODEROID} and request the role!`,
    );
  });

  faq.add('How do I get a role colour?', (e) => {
    e.title('Role colours').about(
      `PokéCommunity has a large list of requestable roles you can use to colour yourself however you like. [Click here to view the list of available roles](${ROLELIST}). Once you've found one that strikes your fancy, use \`/role add\` to get it!`,
    );
  });

  faq.add('How do I get the COOLTRAINER role?', (e) => {
    e.title('COOLTRAINER').about(
      `${COOLTRAINER} is a special role given to our most active members over a period of time. It cannot be requested, and is always given out (and taken away) automagically by Porygon. If you want the role, try jumping in and chatting and you'll likely find yourself in the COOLTRAINER list before too long!`,
    );
  });

  faq.add('How do I get a ROM?', (e) => {
    e.title('Obtaining ROMs').about(
      "For legal reasons, we can't give out ROMs on PokéCommunity or point you to a site that does. However, they're usually no more than a quick Google search away!",
    );
  });

  faq.add('How do I patch a ROM?', (e) => {
    e.title('Patching ROMs').about(
      `Once you've obtained your ROM (see \`/faq How do I get a ROM?\`), [you can follow this guide](${PATCHING_TUT}) to patch it!`,
    );
  });

  faq.add('What are some good fangames to play?', (e) => {
    e.title('Fangame Recommendations')
      .about(
        'Looking for something to play? PokéCommunity hosts a huge number of fangames on our forums. Here are some links to get you started!',
      )
      .field(
        'Completed',
        strip_indent`
        ⭐ [Completed ROM Hacks Archive](${RH_COMPLETED_LIST})
        ⭐ [Games Showcase Completed Tag](${GD_COMPLETED_LIST})
      `,
      )
      .field(
        'All Games',
        strip_indent`
        🔸 [ROM Hacks Studio](${RH_ALL_LIST})
        🔸 [Games Showcase](${GD_ALL_LIST})
      `,
      )
      .foot(
        'This command may be updated with more detailed recommendations in the future.',
      );
  });
});
