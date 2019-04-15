import {Rule} from '../../src/rule';
import {RuleConfig} from '../../src/rule-config';
import {RuleMatcher} from '../../src/rule-matcher';
import {loadRuleFromFilepath} from '../../src/load-rules';
import {mergeMap} from 'rxjs/operators';
import {readReport} from '../../src/reader';

describe('rule:library-mismatch', function() {
  let ruleConfig;
  let matcher;

  beforeEach(async function() {
    const rule = Rule.create(
      await loadRuleFromFilepath(
        require.resolve('../../src/rules/library-mismatch')
      )
    );

    ruleConfig = RuleConfig.create(rule);
    matcher = RuleMatcher.create([ruleConfig]);
  });

  describe('when the report contains a shared lib with a mismatched version', function() {
    it('should report', function() {
      return expect(
        readReport(require.resolve('../fixture/report-002.json')).pipe(
          mergeMap(report => matcher.match(report))
        ),
        'to complete with values',
        {
          message:
            'Potential problem: custom shared library at /usr/local/opt/openssl@1.1/lib/libcrypto.1.1.dylib in use conflicting with openssl@1.1.1b',
          data: {}
        },
        {
          message:
            'Potential problem: custom shared library at /usr/local/opt/openssl@1.1/lib/libssl.1.1.dylib in use conflicting with openssl@1.1.1b',
          data: {}
        }
      );
    });
  });

  describe('when the report does not contain a shared lib with a mismatched version', function() {
    it('should not report', function() {
      return expect(
        readReport(require.resolve('../fixture/report-001.json')).pipe(
          mergeMap(report => matcher.match(report))
        ),
        'to complete without values'
      );
    });
  });
});
