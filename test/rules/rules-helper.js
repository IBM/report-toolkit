import {map, mergeMap} from 'rxjs/operators';

import {Inspector} from '../../src/inspect-report';
import {Report} from '../../src/report';
import {loadRuleFromFilepath} from '../../src/rule-loader';
import {readReports} from '../../src/read-report';

export const createInspect = async (ruleFilepath, config = {}) => {
  const inspector = Inspector.create(
    config,
    await loadRuleFromFilepath(require.resolve(ruleFilepath))
  );
  return filepath =>
    readReports(require.resolve(filepath)).pipe(
      map(Report.create(filepath)),
      mergeMap(report => inspector.inspect(report))
    );
};
