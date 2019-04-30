import {createSandbox} from 'sinon';
import proxyquire from 'proxyquire';

describe('module:read-report', function() {
  let sandbox;
  let redact;
  let readReport;
  let filepath;

  beforeEach(function() {
    filepath = require.resolve('./fixture/report-001.json');
    sandbox = createSandbox();
    redact = sandbox.stub().returnsArg(0);
    readReport = proxyquire('../src/read-report', {
      './redact.js': {redact}
    }).readReport;
  });

  afterEach(function() {
    sandbox.restore();
  });

  describe('function', function() {
    describe('readReport()', function() {
      describe('when given valid filepath to report', function() {
        let observable;

        beforeEach(function() {
          observable = readReport(filepath);
        });

        it('should parse the report JSON', function() {
          return expect(
            observable,
            'to complete with value satisfying',
            require('./fixture/report-001.json')
          );
        });

        it('should redact the report JSON', async function() {
          await observable.toPromise();
          expect(redact, 'was called once');
        });
      });

      describe('when not passed a filepath', function() {
        it('should emit an error', function() {
          return expect(readReport(), 'to emit error satisfying', {
            code: 'ERR_INVALID_ARG_TYPE'
          });
        });
      });
    });
  });
});
