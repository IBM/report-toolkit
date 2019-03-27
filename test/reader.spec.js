import {GnosticErrorCodes} from '../lib/error';
import {createSandbox} from 'sinon';
import proxyquire from 'proxyquire';

describe('module:reader', function() {
  let sandbox;
  let redact;
  let readReportFromFS;

  beforeEach(function() {
    sandbox = createSandbox();
    redact = sandbox.stub().returnsArg(0);
    readReportFromFS = proxyquire('../lib/reader', {
      './redact.js': {redact}
    }).readReportFromFS;
  });

  afterEach(function() {
    sandbox.restore();
  });

  describe('readReportFromFS()', function() {
    describe('when provided no filepath', function() {
      it('should reject with GNOSTIC_ERR_INVALID_ARG', function() {
        return expect(
          readReportFromFS(),
          'to be rejected with error satisfying',
          {
            code: GnosticErrorCodes.GNOSTIC_ERR_INVALID_ARG
          }
        );
      });
    });

    describe('when provided an invalid filepath', function() {
      it('should reject with ENOENT', function() {
        return expect(
          readReportFromFS('/does/not/exist'),
          'to be rejected with error satisfying',
          {code: 'ENOENT'}
        );
      });
    });

    describe('when provided path to invalid (or non-JSON) report file', function() {
      it('should reject with GNOSTIC_ERR_INVALID_REPORT', function() {
        return expect(
          readReportFromFS(__filename),
          'to be rejected with error satisfying',
          {code: GnosticErrorCodes.GNOSTIC_ERR_INVALID_REPORT}
        );
      });
    });

    describe('when provided path to valid (JSON) report file', function() {
      it('should return the parsed JSON', function() {
        return expect(
          readReportFromFS(require.resolve('./fixture/report-001.json')),
          'to be fulfilled with',
          require('./fixture/report-001.json')
        );
      });

      it('should attempt to redact the parsed object', function() {
        return readReportFromFS(
          require.resolve('./fixture/report-001.json')
        ).then(() => {
          expect(redact, 'was called once').and(
            'was called with',
            require('./fixture/report-001.json')
          );
        });
      });
    });
  });
});
