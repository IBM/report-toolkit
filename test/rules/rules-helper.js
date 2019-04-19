import {Inspector} from '../../src/inspector';
import {RuleConfig} from '../../src/rule-config';
import {loadRuleFromFilepath} from '../../src/rule-loader';
import {mergeMap} from 'rxjs/operators';
import {readReport} from '../../src/report-reader';

export const createInspect = async (ruleFilepath, config = {}) => {
  const inspector = Inspector.create(
    RuleConfig.create(
      await loadRuleFromFilepath(require.resolve(ruleFilepath)),
      config
    )
  );
  return filepath =>
    readReport(require.resolve(filepath)).pipe(
      mergeMap(report => inspector.inspect(report))
    );
};
