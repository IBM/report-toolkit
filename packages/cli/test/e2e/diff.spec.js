import {runWithOptions} from './cli-helper.js';

const REPORT_001_FILEPATH = require.resolve(
  '@report-toolkit/common/test/fixture/reports/report-001.json'
);
const REPORT_002_FILEPATH = require.resolve(
  '@report-toolkit/common/test/fixture/reports/report-002-library-mismatch.json'
);

describe('@report-toolkit/cli:command:diff', function () {
  describe('when run with a single report file', function () {
    it('should exit with code 1', function () {
      return expect(
        runWithOptions(['diff', REPORT_001_FILEPATH]),
        'to be rejected with error satisfying',
        {
          exitCode: 1
        }
      );
    });
  });

  describe('when run with two report files', function () {
    it('should exit with code 0', function () {
      return expect(
        runWithOptions(['diff', REPORT_001_FILEPATH, REPORT_002_FILEPATH]),
        'to be fulfilled with value satisfying',
        {
          exitCode: 0
        }
      );
    });
  });
});
