import {createInspect} from './rules-helper';

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
            inspect('../fixture/reports/report-001.json', {level: 'info'}),
            'to complete with value satisfying',
            {
              message:
                'Mean CPU Consumption (6.1212%) is within the allowed range 0-50',
              data: {compute: 'mean', usage: 6.1212, start: 0, end: 50},
              level: 'info',
              filepath: /fixture\/reports\/report-001\.json/,
              id: 'cpu-usage'
            }
          );
        });
      });

      describe('when file cpu usage not within allowed limits', function() {
        it('should report "error" message', function() {
          return expect(
            inspect('../fixture/reports/report-006-cpu-usage.json'),
            'to complete with value satisfying',
            {
              message:
                'Mean CPU Consumption (70%) is outside the allowed range 0-50',
              data: {compute: 'mean', usage: 70, start: 0, end: 50},
              level: 'error',
              filepath: /fixture\/reports\/report-006-cpu-usage\.json/,
              id: 'cpu-usage'
            }
          );
        });
      });
    });
  });
});
