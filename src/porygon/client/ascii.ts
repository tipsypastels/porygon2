import * as colors from 'colors';
import { isDev } from 'support/dev';

if (!isDev) {
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
