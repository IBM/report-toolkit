// @ts-ignore
import REPORT_001 from '@report-toolkit/common/test/fixture/reports/report-001.json';
// @ts-ignore
import REPORT_002 from '@report-toolkit/common/test/fixture/reports/report-002-library-mismatch.json';

describe('@report-toolkit/core', function() {
  let sandbox;
  let subject;

  beforeEach(function() {
    sandbox = sinon.createSandbox();
  });

  afterEach(function() {
    sandbox.restore();
  });

  describe('function', function() {
    let inspectStub;
    let diffStub;
    let loadConfigStub;
    let toReportFromObjectStub;

    beforeEach(function() {
      inspectStub = sandbox.stub().returnsObservableOf([]);
      diffStub = sandbox.stub().returnsObservableOf([]);
      toReportFromObjectStub = sandbox.stub().returnsOperatorFunction();
      loadConfigStub = sandbox.stub().returnsObservableOf({});
      subject = proxyquire(require.resolve('../src/index.js'), {
        './observable.js': {
          diff: diffStub,
          inspect: inspectStub,
          loadConfig: loadConfigStub,
          toReportFromObject: toReportFromObjectStub
        }
      });
    });

    describe('inspect()', function() {
      it('should delegate to observable.inspect()', async function() {
        await subject.inspect([REPORT_001, REPORT_002], []);
        expect(inspectStub, 'was called');
      });
    });

    describe('diff()', function() {
      it('should delegate to observable.diff()', async function() {
        await subject.diff([REPORT_001, REPORT_002]);
        expect(diffStub, 'was called');
      });
    });

    describe('loadConfig()', function() {
      it('should delegate to observable.loadConfig()', async function() {
        await subject.loadConfig({});
        expect(loadConfigStub, 'was called');
      });
    });

    describe('toReportFromObject()', function() {
      it('should delegate to observable.toReportFromObject()', async function() {
        await subject.toReportFromObject({});
        expect(toReportFromObjectStub, 'was called');
      });
    });
  });
});
