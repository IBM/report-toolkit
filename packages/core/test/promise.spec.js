import REPORT_001 from '@gnostic/common/test/fixture/reports/report-001.json';
import REPORT_002 from '@gnostic/common/test/fixture/reports/report-002-library-mismatch.json';

describe('@gnostic/core:promise', function() {
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

    beforeEach(function() {
      inspectStub = sandbox.stub().returnsObservableOf({});
      diffStub = sandbox.stub().returnsObservableOf({});
      subject = proxyquire(require.resolve('../src/promise.js'), {
        './stream.js': {
          diff: diffStub,
          inspect: inspectStub
        }
      });
    });

    describe('inspect()', function() {
      it('should delegate to stream.inspect()', async function() {
        await subject.inspect([REPORT_001, REPORT_002], []);
        expect(inspectStub, 'was called');
      });
    });

    describe('diff()', function() {
      it('should delegate to stream.diff()', async function() {
        await subject.diff([REPORT_001, REPORT_002]);
        expect(diffStub, 'was called');
      });
    });
  });
});
