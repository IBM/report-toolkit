import cosmiconfig from 'cosmiconfig';
import pkg from '../package.json';

export const search = (fromDirpath = process.cwd(), opts = {}) =>
  cosmiconfig(pkg.name).search(fromDirpath, opts);
