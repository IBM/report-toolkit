import {isReportLike} from '../src/report.js';

const REPORT_010_FILEPATH = require.resolve(
  './fixture/reports/report-010-win32.json'
);
const REPORT_011_FILEPATH = require.resolve(
  './fixture/reports/report-011-missing-prop.json'
);

describe('@report-toolkit/common:report', function() {
  describe('class Report', function() {
    describe('static method', function() {
      describe('isReportLike', function() {
        it('should return `true` for a report generated on a win32 box (missing "userLimits")', function() {
          const report = require(REPORT_010_FILEPATH);
          expect(isReportLike(report), 'to be true');
        });

        it('should return `false` for a report otherwise missing a property', function() {
          const report = require(REPORT_011_FILEPATH);
          expect(isReportLike(report), 'to be false');
        });
      });
    });
  });
});
