import cosmiconfig from 'cosmiconfig';
import pkg from '../package.json';

export const search = (from = process.cwd(), opts = {}) =>
  cosmiconfig(pkg.name).search(from, opts);
