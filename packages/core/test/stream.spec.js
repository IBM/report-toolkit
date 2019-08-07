import {ERROR} from '@report-toolkit/common/src/constants.js';
import {
  RTKERR_INVALID_PARAMETER,
  RTKERR_INVALID_REPORT
} from '@report-toolkit/common/src/error.js';
import {of, switchMapTo} from '@report-toolkit/common/src/observable.js';
import {isReportLike} from '@report-toolkit/common/src/report.js';
// @ts-ignore
import REPORT_001 from '@report-toolkit/common/test/fixture/reports/report-001.json';
// @ts-ignore
import REPORT_002 from '@report-toolkit/common/test/fixture/reports/report-002-library-mismatch.json';
const REPORT_001_FILEPATH = require.resolve(
  '@report-toolkit/common/test/fixture/reports/report-001.json'
);
const REPORT_002_FILEPATH = require.resolve(
  '@report-toolkit/common/test/fixture/reports/report-002-library-mismatch.json'
);

describe('@report-toolkit/core:stream', function() {
  let sandbox;
  let subject;

  const msg001 = {
    filepath: REPORT_001_FILEPATH,
    id: 'foo',
    message: 'foo',
    severity: ERROR
  };

  const msg002 = {
    filepath: REPORT_002_FILEPATH,
    id: 'bar',
    message: 'bar',
    severity: ERROR
  };

  beforeEach(function() {
    sandbox = sinon.createSandbox();

    subject = proxyquire(require.resolve('../src/stream'), {
      '@report-toolkit/inspector': {
        inspectReports: sandbox
          .stub()
          .returnsOperatorFunction(switchMapTo([msg001, msg002]))
      },
      '@report-toolkit/diff': {
        diffReports: sandbox.stub().returnsOperatorFunction(
          switchMapTo([
            {
              oldValue: 45164,
              op: 'replace',
              path: '/header/processId',
              value: 4658
            },
            {
              oldValue:
                '/Users/boneskull/projects/christopher-hiller/report-toolkit',
              op: 'replace',
              path: '/header/cwd',
              value: '/Users/boneskull/projects/nodejs/node'
            }
          ])
        )
      }
    });
  });

  afterEach(function() {
    sandbox.restore();
  });

  describe('function', function() {
    describe('diff()', function() {
      /**
       * @type {import('../src/stream').diff}
       */
      let diff;

      beforeEach(function() {
        diff = subject.diff;
      });

      it('should diff two reports', function() {
        return expect(
          diff(REPORT_001, REPORT_002),
          'to complete with values',
          {
            oldValue: 45164,
            op: 'replace',
            path: '/header/processId',
            value: 4658
          },
          {
            oldValue:
              '/Users/boneskull/projects/christopher-hiller/report-toolkit',
            op: 'replace',
            path: '/header/cwd',
            value: '/Users/boneskull/projects/nodejs/node'
          }
        );
      });

      it('should fail if fewer than two parameters are supplied', function() {
        // this is invalid usage, so ignore the TS failure
        // @ts-ignore
        return expect(diff(REPORT_001), 'to emit error satisfying', {
          code: RTKERR_INVALID_PARAMETER
        });
      });

      it('should fail if the second parameter is not a report-like object', function() {
        return expect(diff(REPORT_001, {}), 'to emit error satisfying', {
          code: RTKERR_INVALID_REPORT
        });
      });
    });

    describe('inspect()', function() {
      /**
       * @type {import('../src/stream').inspect}
       */
      let inspect;

      beforeEach(function() {
        inspect = subject.inspect;
        isReportLike.cache.clear();
      });

      describe('when passed raw report objects', function() {
        it('should emit inspection results for a single report', function() {
          return expect(
            inspect(REPORT_002),
            'to complete with values',
            msg001,
            msg002
          );
        });

        it('should emit inspection results for two reports', function() {
          return expect(
            inspect([REPORT_002, REPORT_001]),
            'to complete with values',
            msg001,
            msg002
          );
        });
      });

      describe('when passed Observables of raw report objects', function() {
        it('should emit inspection results for a single report', function() {
          return expect(
            inspect(of(REPORT_002)),
            'to complete with values',
            msg001,
            msg002
          );
        });

        it('should emit inspection results for two reports', function() {
          return expect(
            inspect(of(REPORT_002, REPORT_001)),
            'to complete with values',
            msg001,
            msg002
          );
        });
      });
    });
  });
});
