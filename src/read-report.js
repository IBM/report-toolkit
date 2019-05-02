import {bindNodeCallback, of} from 'rxjs';

import {Report} from './report';
import _ from 'lodash/fp';
import {createDebugger} from './debug';
import fs from 'fs';
import {map} from 'rxjs/operators';
import {redact} from './redact';

const debug = createDebugger(module);
const readFile = bindNodeCallback(fs.readFile);

export const readReport = (filepath, {redactSecrets = true} = {}) => {
  if (!redactSecrets) {
    debug(
      `REDACTION DISABLED for ${filepath}; you are bad and should feel bad`
    );
  }
  return (_.isObject(filepath)
    ? of(filepath)
    : readFile(filepath, 'utf8').pipe(map(JSON.parse))
  ).pipe(
    map(report => (redactSecrets ? redact(report) : report)),
    map(report => Report.create(report, filepath))
  );
};
