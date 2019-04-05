import {basename, resolve} from 'path';
import {filter, map} from 'rxjs/operators';

import {RuleEntry} from '../rule.js';
import _ from 'lodash';
import {bindNodeCallback} from 'rxjs';
import fs from 'fs';
import {name as pkgName} from '../../package.json';

const readdir = bindNodeCallback(fs.readdir);

export const findBuiltinRules = _.once(() =>
  readdir(__dirname).pipe(
    filter(entry => entry !== basename(__filename)),
    map(entry => ({
      id: `${pkgName}/${basename(entry, '.js')}`,
      filepath: resolve(__dirname, entry),
      config: {}
    })),
    map(RuleEntry.create)
  )
);
