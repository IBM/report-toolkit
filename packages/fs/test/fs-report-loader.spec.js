import {of} from '@report-toolkit/common/src/observable.js';
// @ts-ignore
import REPORT_001 from '@report-toolkit/common/test/fixture/reports/report-001.json';

import {toObjectFromFilepath} from '../src/index.js';

const REPORT_001_FILEPATH = require.resolve(
  '@report-toolkit/common/test/fixture/reports/report-001.json'
);

describe('@report-toolkit/fs:fs-report-loader', function () {
  describe('function', function () {
    describe('toObjectFromFilepath()', function () {
      describe('when given valid filepath to report', function () {
        it('should parse the report JSON', function () {
          return expect(
            of(REPORT_001_FILEPATH).pipe(toObjectFromFilepath()),
            'to complete with value satisfying',
            {filepath: REPORT_001_FILEPATH, rawReport: REPORT_001}
          );
        });
      });
    });
  });
});
