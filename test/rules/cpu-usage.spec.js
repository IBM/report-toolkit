import {createInspect} from './rules-helper';

const REPORT_001_FILEPATH = require.resolve(
  '../fixture/reports/report-001.json'
);
const REPORT_006_FILEPATH = require.resolve(
  '../fixture/reports/report-006-cpu-usage.json'
);

describe('rule:cpu-usage', function() {
  let inspect;

  describe('defaults', function() {
    beforeEach(function() {
      inspect = createInspect('../../src/rules/cpu-usage.js');
    });

    describe('when run against a single file', function() {
      describe('when file cpu usage within allowed limits', function() {
        it('should report "info" message', function() {
          return expect(
            inspect(REPORT_001_FILEPATH, {severity: 'info'}),
            'to complete with value satisfying',
            {
              message:
                'Mean CPU consumption percent (6.12%) is within the allowed range 0-50',
              data: {compute: 'mean', usage: 6.12, min: 0, max: 50},
              severity: 'info',
              filepath: /fixture\/reports\/report-001\.json/,
              id: 'cpu-usage'
            }
          );
        });
      });

      describe('when file cpu usage not within allowed limits', function() {
        it('should report "error" message', function() {
          return expect(
            inspect(REPORT_006_FILEPATH),
            'to complete with value satisfying',
            {
              message:
                'Mean CPU consumption percent (70.12%) is outside the allowed range 0-50',
              data: {compute: 'mean', usage: 70.12, min: 0, max: 50},
              severity: 'error',
              filepath: /fixture\/reports\/report-006-cpu-usage\.json/,
              id: 'cpu-usage'
            }
          );
        });
      });
    });

    describe('when run against multiple files', function() {
      describe('when file cpu usage within allowed limits', function() {
        it('should report "info" message', function() {
          return expect(
            inspect([REPORT_001_FILEPATH, REPORT_006_FILEPATH], {
              severity: 'info'
            }),
            'to complete with value satisfying',
            {
              message:
                'Mean CPU consumption percent (38.12%) is within the allowed range 0-50',
              data: {compute: 'mean', usage: 38.12, min: 0, max: 50},
              severity: 'info',
              filepath: '(multiple files)',
              id: 'cpu-usage'
            }
          );
        });
      });
    });
  });
});
