import {Rule} from '../../src/rule';
import {RuleConfig} from '../../src/rule-config';
import {RuleMatcher} from '../../src/rule-matcher';
import {loadRuleFromFilepath} from '../../src/load-rules';
import {mergeMap} from 'rxjs/operators';
import {readReport} from '../../src/reader';

describe('rule:long-timeout', function() {
  let ruleConfig;
  let matcher;

  beforeEach(async function() {
    const rule = Rule.create(
      await loadRuleFromFilepath(
        require.resolve('../../src/rules/long-timeout')
      )
    );
    ruleConfig = RuleConfig.create(rule);
    matcher = RuleMatcher.create([ruleConfig]);
  });

  describe('when the report contains an active libuv handle containing a timer beyond the default threshold', function() {
    describe('when the timer is referenced', function() {
      it('should report', function() {
        return expect(
          readReport(
            require.resolve('../fixture/report-003-long-timeout.json')
          ).pipe(mergeMap(report => matcher.match(report))),
          'to complete with values',
          {
            message:
              'libuv handle at address 0x00007ffeefbfe2e8 is a timer with future expiry in 3h',
            data: {}
          }
        );
      });
    });

    describe('when the timer is unreferenced', function() {
      it('should not report', function() {
        return expect(
          readReport(
            require.resolve('../fixture/report-004-long-timeout-unref.json')
          ).pipe(mergeMap(report => matcher.match(report))),
          'to complete without values'
        );
      });
    });
  });
});
