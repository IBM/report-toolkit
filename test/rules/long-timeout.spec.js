import {Inspector} from '../../src/inspector';
import {RuleConfig} from '../../src/rule-config';
import {loadRuleFromFilepath} from '../../src/rule-loader';
import {mergeMap} from 'rxjs/operators';
import {readReport} from '../../src/report-reader';

describe('rule:long-timeout', function() {
  let ruleConfig;
  let inspector;

  beforeEach(async function() {
    const rule = await loadRuleFromFilepath(
      require.resolve('../../src/rules/long-timeout')
    );
    ruleConfig = RuleConfig.create(rule);
    inspector = Inspector.create(ruleConfig);
  });

  describe('when the report contains an active libuv handle containing a timer beyond the default threshold', function() {
    describe('when the timer is referenced', function() {
      it('should report', function() {
        return expect(
          readReport(
            require.resolve('../fixture/report-003-long-timeout.json')
          ).pipe(mergeMap(report => inspector.inspect(report))),
          'to complete with values',
          {
            id: 'long-timeout',
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
          ).pipe(mergeMap(report => inspector.inspect(report))),
          'to complete without values'
        );
      });
    });
  });
});
