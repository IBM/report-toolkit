import {bindNodeCallback, of} from 'rxjs';

import {Report} from './report';
import _ from 'lodash/fp';
import fs from 'fs';
import {map} from 'rxjs/operators';
import {redact} from './redact';

const readFile = bindNodeCallback(fs.readFile);

export const readReport = filepath =>
  (_.isObject(filepath)
    ? of(filepath)
    : readFile(filepath, 'utf8').pipe(map(JSON.parse))
  ).pipe(
    map(redact),
    map(report => Report.create(report, filepath))
  );
