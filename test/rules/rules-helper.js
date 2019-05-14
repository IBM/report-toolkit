import {map, mergeMap} from 'rxjs/operators';

import {Inspector} from '../../src/inspect-report';
import {Report} from '../../src/report';
import {loadReports} from '../../src/load-report';
import {loadRuleFromFilepath} from '../../src/rule-loader';

export const createInspect = async (ruleFilepath, config = {}) => {
  const inspector = Inspector.create(
    config,
    await loadRuleFromFilepath(require.resolve(ruleFilepath))
  );
  return filepath =>
    loadReports(require.resolve(filepath)).pipe(
      map(Report.create(filepath)),
      mergeMap(report => inspector.inspect(report))
    );
};
