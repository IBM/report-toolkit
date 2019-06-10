import {createInspect} from './rules-helper';

describe('rule:library-mismatch', function() {
  let inspect;

  beforeEach(function() {
    inspect = createInspect('../../src/rules/library-mismatch');
  });

  describe('when the report contains a shared lib with a mismatched version', function() {
    it('should report', function() {
      return expect(
        inspect('../fixture/reports/report-002-library-mismatch.json'),
        'to complete with values',
        {
          id: 'library-mismatch',
          message:
            'Custom shared library at /usr/local/opt/openssl@1.1/lib/libcrypto.1.1.dylib in use conflicting with openssl@1.1.1b',
          filepath: '../fixture/reports/report-002-library-mismatch.json',
          severity: 'error'
        },
        {
          id: 'library-mismatch',
          message:
            'Custom shared library at /usr/local/opt/openssl@1.1/lib/libssl.1.1.dylib in use conflicting with openssl@1.1.1b',
          filepath: '../fixture/reports/report-002-library-mismatch.json',
          severity: 'error'
        }
      );
    });
  });

  describe('when the report does not contain a shared lib with a mismatched version', function() {
    it('should not report', function() {
      return expect(
        inspect('../fixture/reports/report-001.json'),
        'not to emit values'
      );
    });
  });
});
