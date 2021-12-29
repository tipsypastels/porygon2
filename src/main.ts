import { make_client } from 'core/client';
import { IS_DEBUG, TOKEN } from 'support/env';
import colors from 'colors';

if (!IS_DEBUG) {
  const LINES = `
     ____   ___   ____   __ __   ____   ___   ____
    |    \\ /   \\ |    \\ |  |  | /    | /   \\ |    \\
    |  o  )     ||  D  )|  |  ||   __||     ||  _  |
    |   _/|  O  ||    / |  ~  ||  |  ||  O  ||  |  |
    |  |  |     ||    \\ |___, ||  |_ ||     ||  |  |
    |  |  |     ||  .  \\|     ||     ||     ||  |  |
    |__|   \\___/ |__|\\_||____/ |___,_| \\___/ |__|__|
    `.split('\n');

  for (const line of LINES) {
    console.log(colors.rainbow(line));
  }
}

make_client().login(TOKEN());
