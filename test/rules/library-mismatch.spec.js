import {Inspector} from '../../src/inspector';
import {RuleConfig} from '../../src/rule-config';
import {loadRuleFromFilepath} from '../../src/rule-loader';
import {mergeMap} from 'rxjs/operators';
import {readReport} from '../../src/report-reader';

describe('rule:library-mismatch', function() {
  let ruleConfig;
  let inspector;

  beforeEach(async function() {
    const rule = await loadRuleFromFilepath(
      require.resolve('../../src/rules/library-mismatch')
    );
    ruleConfig = RuleConfig.create(rule);
    inspector = Inspector.create(ruleConfig);
  });

  describe('when the report contains a shared lib with a mismatched version', function() {
    it('should report', function() {
      return expect(
        readReport(
          require.resolve('../fixture/report-002-library-mismatch.json')
        ).pipe(mergeMap(report => inspector.inspect(report))),
        'to complete with values',
        {
          id: 'library-mismatch',
          message:
            'Potential problem: custom shared library at /usr/local/opt/openssl@1.1/lib/libcrypto.1.1.dylib in use conflicting with openssl@1.1.1b',
          data: {}
        },
        {
          id: 'library-mismatch',
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
          mergeMap(report => inspector.inspect(report))
        ),
        'to complete without values'
      );
    });
  });
});
