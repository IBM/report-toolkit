import {bindNodeCallback, iif, of, throwError} from 'rxjs';
import {map, mergeMap, toArray} from 'rxjs/operators';

import {Report} from './report';
import _ from 'lodash/fp';
import {createDebugger} from './debug';
import fs from 'fs';
import {pipeIf} from './operators';
import {redact} from './redact';

const DEFAULT_SORT_FIELD = 'header.dumpEventTimestamp';
const DEFAULT_SORT_ORDER = 'asc';

const debug = createDebugger(module);
const readFile = bindNodeCallback(fs.readFile);

export const loadReport = (filepath, {redactSecrets = true} = {}) => {
  if (!redactSecrets) {
    debug(
      `REDACTION DISABLED for ${filepath}; you are bad and should feel bad`
    );
  }
  return (_.isObject(filepath)
    ? of(filepath)
    : readFile(filepath, 'utf8').pipe(map(JSON.parse))
  ).pipe(
    pipeIf(redactSecrets, map(redact)),
    map(Report.create(filepath))
  );
};

export const sortReports = ({sortField, sortDirection}) => observable =>
  observable.pipe(
    toArray(),
    mergeMap(_.orderBy(_.get(sortField), sortDirection))
  );

export const loadReports = (
  filepaths = [],
  {
    redactSecrets = true,
    sortField = DEFAULT_SORT_FIELD,
    sortDirection = DEFAULT_SORT_ORDER
  } = {}
) => {
  if (_.isEmpty(filepaths)) {
    return throwError(
      new Error('Invalid parameters: one or more filepaths are required')
    );
  }
  return iif(() => _.isArray(filepaths), of(...filepaths), of(filepaths)).pipe(
    mergeMap(report => loadReport(report, {redactSecrets})),
    sortReports({sortField, sortDirection})
  );
};
