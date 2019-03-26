import {GnosticErrorCodes} from '../lib/error';
import {readReportFromFS} from '../lib/reader';

describe('module:reader', function() {
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

    describe('when provided path to invalid (non-JSON) report file', function() {
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
    });
  });
});
