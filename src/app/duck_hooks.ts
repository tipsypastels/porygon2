/* -------------------------------------------------------------------------- */
/*                            Initializers & Tasks                            */
/* -------------------------------------------------------------------------- */

import { DUCK } from 'core/controller';
import { add_init, Initializer } from 'core/initializer';
import { camel_response_for_message } from './impl/camel';

const camel_response: Initializer = ({ events }) => {
  events.on('messageCreate', ({ content, channel }) => {
    const response = camel_response_for_message(content);
    if (response) channel.send(response);
  });
};

add_init(DUCK, camel_response, { name: 'camel_response' });
