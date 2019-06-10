import {Report} from '../src/report';
import {inspectReports} from '../src/inspect-report';
import {of} from '../src/observable';

const REPORT_002_FILEPATH = require.resolve(
  './fixture/reports/report-002-library-mismatch.json'
);

describe('module:inspect-reports', function() {
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
              .returns(of({message: 'foo', id: 'bar', severity: 'error'}))
          }).pipe(
            inspectReports(
              of(
                Report.create(require(REPORT_002_FILEPATH), REPORT_002_FILEPATH)
              )
            )
          ),
          'to complete with value satisfying',
          {
            message: 'foo',
            id: 'bar',
            severity: 'error'
          }
        );
      });
    });
  });
});
