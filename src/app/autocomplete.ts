import { add_autocomplete, add_command, Autocomplete, ChatCommand } from 'core/command';
import { GLOBAL } from 'core/controller';

const autocomplete: ChatCommand = async () => {
  //
};

add_command(GLOBAL, autocomplete, {
  name: 'autocomplete',
  description: 'xyz',
  options: [
    {
      name: 'youcompleteme',
      description: 'hello',
      type: 'STRING',
      required: true,
      autocomplete: true,
    },
    {
      name: 'youalsocompleteme',
      description: 'goodbye',
      type: 'STRING',
      required: true,
      autocomplete: true,
    },
  ],
});

const youcompleteme: Autocomplete = () => {
  return ['hello', 'how is it going'];
};

const youalsocompleteme: Autocomplete = () => {
  return ['goodbye', 'wahts up'];
};

add_autocomplete(autocomplete, youcompleteme);
add_autocomplete(autocomplete, youalsocompleteme);
