import {
  bindNodeCallback,
  fromArray,
  iif,
  map,
  mergeMap,
  of,
  pipeIf,
  sort,
  throwError
} from './observable';

import {Report} from './report';
import _ from 'lodash/fp';
import fs from 'fs';
import {redact} from './redact';

const DEFAULT_SORT_FIELD = 'header.dumpEventTimestamp';
const DEFAULT_SORT_ORDER = 'asc';

const readFile = bindNodeCallback(fs.readFile);

/**
 * Pipes a path to a JSON report into a usually-redacted `Report` object
 * @param {string|Object} filepath - Path to JSON report or raw (parsed) report itself
 * @param {boolean} [opts.redactSecrets=true] - If `true`, redact secrets from loaded report
 * @returns {Observable<Report>}
 */
const load = ({redactSecrets = true} = {}) => observable =>
  observable.pipe(
    mergeMap(filepath =>
      of(filepath).pipe(
        pipeIf(
          _.isString,
          mergeMap(filepath => readFile(filepath, 'utf8')),
          map(JSON.parse)
        ),
        pipeIf(redactSecrets, map(redact)),
        pipeIf(
          _.isObject(filepath),
          map(report => Report.createFromFile(null, report))
        ),
        pipeIf(_.isString(filepath), map(Report.createFromFile(filepath)))
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
    fromArray(filepaths)
  ).pipe(
    load({redactSecrets}),
    pipeIf(!disableSort, sort(sortField, sortDirection))
  );
