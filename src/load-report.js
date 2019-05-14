import {bindNodeCallback, iif, of, throwError} from 'rxjs';
import {fromArray, pipeIf, sort} from './operators';
import {map, mergeMap} from 'rxjs/operators';

import {Report} from './report';
import _ from 'lodash/fp';
import fs from 'fs';
import {redact} from './redact';

const DEFAULT_SORT_FIELD = 'header.dumpEventTimestamp';
const DEFAULT_SORT_ORDER = 'asc';

const readFile = bindNodeCallback(fs.readFile);

/**
 * Pipes a path to a JSON report into a usually-redacted `Report` object
 * @param {string} filepath - Path to JSON report
 * @param {boolean} [opts.redactSecrets=true] - If `true`, redact secrets from loaded report
 * @returns {Observable<Report>}
 */
const load = ({redactSecrets = true} = {}) => observable =>
  observable.pipe(
    mergeMap(filepath =>
      of(filepath).pipe(
        mergeMap(filepath => readFile(filepath, 'utf8')),
        map(JSON.parse),
        pipeIf(redactSecrets, map(redact)),
        map(Report.create(filepath))
      )
    )
  );

export const loadReport = (
  filepaths = [],
  {
    redactSecrets = true,
    sortField = DEFAULT_SORT_FIELD,
    sortDirection = DEFAULT_SORT_ORDER,
    disableSort = false
  } = {}
) =>
  iif(
    () => _.isEmpty(filepaths),
    throwError(
      new Error('Invalid parameters: one or more filepaths are required')
    ),
    fromArray(filepaths).pipe(
      load({redactSecrets}),
      pipeIf(!disableSort, sort(sortField, sortDirection))
    )
  );
