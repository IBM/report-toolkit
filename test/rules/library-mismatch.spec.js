import {RuleEntry} from '../../src/rule';
import {match} from '../../src/matcher';
import {toArray} from 'rxjs/operators';

describe('rule:library-mismatch', function() {
  let rules;

  beforeEach(function() {
    rules = [
      RuleEntry.create({
        id: 'gnostic/library-mismatch',
        filepath: require.resolve('../../src/rules/library-mismatch')
      })
    ];
  });

  describe('when the report contains a shared lib with a mismatched version', function() {
    it('should report', function() {
      return expect(
        match(require.resolve('../fixture/report-002.json'), rules)
          .pipe(toArray())
          .toPromise(),
        'to be fulfilled with',
        [
          {
            message:
              'Potential problem: custom shared library at /usr/local/opt/openssl@1.1/lib/libcrypto.1.1.dylib in use conflicting with openssl@1.1.1b',
            data: {}
          }
        ]
      );
    });
  });
});
