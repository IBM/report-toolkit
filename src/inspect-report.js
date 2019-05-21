import {concat, of} from 'rxjs';
import {map, mergeAll, mergeMap, tap} from 'rxjs/operators';

import _ from 'lodash/fp';
import {fromArray} from './operators';

/**
 *
 * @param {Observable<Report>} reports
 */
export const inspectReports = reports => {
  return ruleConfigs =>
    ruleConfigs.pipe(
      mergeMap(ruleConfig => {
        const contexts = reports.pipe(
          map(report => report.createContext(ruleConfig))
        );
        return concat(
          ruleConfig.inspect(contexts),
          contexts.pipe(mergeMap(context => context.flush()))
        );
      })
    );
};
