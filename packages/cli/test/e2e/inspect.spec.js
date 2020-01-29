import {_} from '@report-toolkit/common';
import {tmpdir} from 'os';

import {run, runWithOptions} from './cli-helper.js';

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
        runWithOptions(['inspect', REPORT_002_FILEPATH, '-t', 'json'], {
          cwd: tmpdir()
        }).catch(_.pipe(_.get('stdout'), JSON.parse)),
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
