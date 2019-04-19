import {createInspect} from './rules-helper';

describe('rule:library-mismatch', function() {
  let inspect;

  beforeEach(async function() {
    inspect = await createInspect('../../src/rules/library-mismatch');
  });

  describe('when the report contains a shared lib with a mismatched version', function() {
    it('should report', function() {
      return expect(
        inspect('../fixture/report-002-library-mismatch.json'),
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
        inspect('../fixture/report-001.json'),
        'to complete without values'
      );
    });
  });
});
