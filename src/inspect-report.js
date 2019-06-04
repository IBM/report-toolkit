import {map, mergeMap} from 'rxjs/operators';

/**
 *
 * @param {Observable<Report>} reports
 */
export const inspectReports = reports => ruleConfigs =>
  ruleConfigs.pipe(
    mergeMap(ruleConfig =>
      ruleConfig.inspect(
        reports.pipe(map(report => report.createContext(ruleConfig)))
      )
    )
  );
