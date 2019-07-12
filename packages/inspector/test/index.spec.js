import {ERROR} from '@gnostic/common/src/constants.js';
import {of} from '@gnostic/common/src/observable.js';
import {createReport} from '@gnostic/report';

import {inspectReports} from '../src/index.js';

const REPORT_002_FILEPATH = require.resolve(
  '@gnostic/common/test/fixture/reports/report-002-library-mismatch.json'
);

describe('@gnostic/inspector', function() {
  let sandbox;

  beforeEach(function() {
    sandbox = sinon.createSandbox();
  });

  afterEach(function() {
    sandbox.restore();
  });

  describe('function', function() {
    describe('inspectReports()', function() {
      it('should return an Observable which completes with results for one or more reports', function() {
        return expect(
          of({
            inspect: sandbox
              .stub()
              .returns(of({id: 'bar', message: 'foo', severity: ERROR}))
          }).pipe(
            inspectReports(
              of(
                createReport(require(REPORT_002_FILEPATH), REPORT_002_FILEPATH)
              )
            )
          ),
          'to complete with value satisfying',
          {
            id: 'bar',
            message: 'foo',
            severity: ERROR
          }
        );
      });
    });
  });
});
