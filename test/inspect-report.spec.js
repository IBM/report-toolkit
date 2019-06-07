import {Report} from '../src/report';
import {inspectReports} from '../src/inspect-report';
import {loadRuleConfigs} from '../src/api/stream';
import {of} from '../src/observable';

const REPORT_002_FILEPATH = require.resolve(
  './fixture/reports/report-002-library-mismatch.json'
);

describe('module:inspect-reports', function() {
  let sandbox;

  beforeEach(function() {
    sandbox = sinon.createSandbox();
  });

  afterEach(function() {
    sandbox.restore();
  });

  describe('function', function() {
    describe('inspectReports()', function() {
      it('should return an Observable which completes with results for one or more reports', function() {
        return expect(
          loadRuleConfigs({
            config: {
              rules: {
                'long-timeout': [
                  true,
                  {
                    timeout: 3000
                  }
                ],
                'library-mismatch': true
              }
            }
          }).pipe(
            inspectReports(
              of(
                Report.create(require(REPORT_002_FILEPATH), REPORT_002_FILEPATH)
              )
            )
          ),
          'to complete with values satisfying',
          {
            message:
              'Custom shared library at /usr/local/opt/openssl@1.1/lib/libcrypto.1.1.dylib in use conflicting with openssl@1.1.1b',
            filepath: /test\/fixture\/reports\/report-002-library-mismatch\.json/,
            id: 'library-mismatch',
            level: 'error'
          },
          {
            message:
              'Custom shared library at /usr/local/opt/openssl@1.1/lib/libssl.1.1.dylib in use conflicting with openssl@1.1.1b',
            filepath: /test\/fixture\/reports\/report-002-library-mismatch\.json/,
            id: 'library-mismatch',
            level: 'error'
          }
        );
      });
    });
  });
});
