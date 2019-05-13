import {Report} from '../src/report';
import {createDebugger} from '../src/debug';

const debug = createDebugger(module);

const REPORT_005_FILEPATH = require.resolve(
  './fixture/reports/report-005-secrets.json'
);
const UNREDACTED_REPORT = require(REPORT_005_FILEPATH);

const REDACTED_REPORT = {
  ...UNREDACTED_REPORT,
  environmentVariables: {
    ...UNREDACTED_REPORT.environmentVariables,
    SAUCE_ACCESS_KEY: '[REDACTED]'
  }
};

describe('module:load-report', function() {
  let sandbox;
  let subject;

  beforeEach(function() {
    sandbox = sinon.createSandbox();

    subject = rewiremock.proxy(
      () => require('../src/load-report'),
      () => {
        rewiremock(() => require('../src/redact')).with({
          redact: sandbox.stub().callsFake(() => {
            debug('returning mock redacted report');
            return REDACTED_REPORT;
          })
        });
      }
    );
  });

  afterEach(function() {
    sandbox.restore();
  });

  describe('function', function() {
    describe('loadReports()', function() {
      let loadReports;

      beforeEach(function() {
        loadReports = subject.loadReports;
      });

      describe('when given valid filepath to report', function() {
        it('should parse the report JSON', function() {
          return expect(
            loadReports(REPORT_005_FILEPATH),
            'to complete with value',
            Report.create(REPORT_005_FILEPATH, REDACTED_REPORT)
            // require(REPORT_005_FILEPATH)
          );
        });
      });

      describe('when not passed a filepath', function() {
        it('should emit an error', function() {
          return expect(loadReports(), 'to emit error');
        });
      });
    });
  });
});
