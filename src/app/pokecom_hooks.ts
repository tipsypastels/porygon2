import { POKECOM } from 'core/controller';
import { add_user_hook, log_joins } from 'core/initializer';
import { staging } from 'support/env';

const LOGS = staging('925944733535195147', '423905036859604993');
// const WARNS = staging('925944747955196004', '613756774234718209');
// const BOTH = [LOGS, WARNS];

add_user_hook(POKECOM, log_joins, { to: LOGS, details: 'all' });
