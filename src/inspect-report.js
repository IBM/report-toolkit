import {filter, map, mergeMap} from './observable';

import _ from 'lodash/fp';

const ERRORLEVEL = {
  error: 30,
  warning: 20,
  info: 10
};

/**
 *
 * @param {Observable<Report>} reports
 */
export const inspectReports = (
  reports,
  {level = 'error'} = {}
) => ruleConfigs =>
  ruleConfigs.pipe(
    mergeMap(ruleConfig => ruleConfig.inspect(reports)),
    map(message =>
      _.has('level', message) ? message : {...message, level: 'error'}
    ),
    filter(message => _.get(message.level, ERRORLEVEL) >= ERRORLEVEL[level])
  );
