// @ts-ignore
import {readFileSync} from 'fs';

import {run, runAsJSON} from './cli-helper.js';

const REPORT_005_FILEPATH = require.resolve(
  '@report-toolkit/common/test/fixture/reports/report-005-secrets.json'
);

describe('@report-toolkit/cli:command:transform', function() {
  describe('when no file specified', function() {
    it('should fail', function() {
      return expect(run('transform'), 'to be rejected with error satisfying', {
        exitCode: 1
      });
    });
  });

  describe('when no --transform specified', function() {
    it('should redact and output JSON', function() {
      // report-005 is the same as report-001, except it is not completely redacted.
      // when it's redacted, it's equial to report-001.
      return expect(
        run('transform', REPORT_005_FILEPATH, '--pretty'),
        'to be fulfilled with value satisfying',
        {
          exitCode: 0,
          stdout: readFileSync(
            require.resolve(
              '@report-toolkit/common/test/fixture/reports/report-001.json'
            ),
            'utf8'
          ).trim() // zap trailing space in this file
        }
      );
    });
  });

  describe('when compatible --transforms specified', function() {
    it('should succeed', function() {
      return expect(
        // filters contrived, as -i header.release.name would work
        runAsJSON(
          'transform',
          REPORT_005_FILEPATH,
          '-t',
          'filter',
          '-i',
          'header.release',
          '-x',
          'header.release.headersUrl',
          '-x',
          'header.release.sourceUrl'
        ),
        'to be fulfilled with',
        {
          header: {
            release: {name: 'node'}
          }
        }
      );
    });
  });
});
