import {tmpdir} from 'os';

import {run, runAsJSON} from './cli-helper.js';

const REPORT_001_FILEPATH = require.resolve(
  '@report-toolkit/common/test/fixture/reports/report-002-library-mismatch.json'
);
const REPORT_002_FILEPATH = require.resolve(
  '@report-toolkit/common/test/fixture/reports/report-002-library-mismatch.json'
);

describe('@report-toolkit/cli:command:inspect', function() {
  describe('when run without parameters', function() {
    it('should exit with code 1', function() {
      return expect(run('inspect'), 'to be rejected with error satisfying', {
        exitCode: 1
      });
    });
  });

  describe('when it cannot find a config file', function() {
    it('should enable all rules', function() {
      return expect(
        runAsJSON(['inspect', REPORT_001_FILEPATH], {
          cwd: tmpdir()
        }),
        'when fulfilled',
        'to have items satisfying',
        {
          message: expect.it('to be a', 'string'),
          severity: 'error',
          id: 'library-mismatch',
          filepath: REPORT_002_FILEPATH
        }
      );
    });
  });
});
