import {of} from '@report-toolkit/common/src/observable.js';
import REPORT_DIFF from '@report-toolkit/common/test/fixture/diff/report-001-002.json';
import REPORT_1 from '@report-toolkit/common/test/fixture/reports/report-001.json';
import REPORT_2 from '@report-toolkit/common/test/fixture/reports/report-002-library-mismatch.json';

import {DIFF_OMIT_PATHS, diffReports} from '../src/index.js';

describe('@report-toolkit/diff', function() {
  describe('function', function() {
    describe('diffReports()', function() {
      let source;

      beforeEach(function() {
        source = of([REPORT_1, REPORT_2]);
      });

      it('should diff two reports using default properties', function() {
        return expect(
          source.pipe(diffReports()),
          'to complete with values',
          ...REPORT_DIFF
        );
      });

      it('should not include omitted paths', function() {
        // XXX: yes, this is incredibly slow
        this.timeout(6000);
        this.slow(2250);
        return expect(
          source.pipe(diffReports()),
          'not to complete with values satisfying',
          ...Array.from(DIFF_OMIT_PATHS).map(path => ({path}))
        );
      });
    });
  });
});
