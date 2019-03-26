import cosmiconfig from 'cosmiconfig';
import pkg from '../package.json';

export const search = (from = process.cwd(), opts = {}) => {
  const explorer = cosmiconfig(pkg.name);
  return explorer.search(from, opts);
};
