import {createSandbox} from 'sinon';
import rewiremock from './mock-helper';

describe('module:read-report', function() {
  let sandbox;
  let redact;
  let readReports;
  const filepath = require.resolve('./fixture/report-001.json');

  beforeEach(async function() {
    sandbox = createSandbox();

    redact = sandbox.stub().returnsArg(0);
    readReports = (await rewiremock.module(() => import('../src/read-report'), {
      './redact': {redact}
    })).readReports;
  });

  afterEach(function() {
    sandbox.restore();
  });

  describe('function', function() {
    describe('readReports()', function() {
      describe('when given valid filepath to report', function() {
        it('should parse the report JSON', function() {
          // "await import()" does some odd, unwanted things with JSON
          return expect(
            readReports(filepath),
            'to complete with value satisfying',
            require('./fixture/report-001.json')
          );
        });

        it('should redact the report JSON', async function() {
          await readReports(filepath).toPromise();
          expect(redact, 'was called once');
        });
      });

      describe('when not passed a filepath', function() {
        it('should emit an error', function() {
          return expect(readReports(), 'to emit error');
        });
      });
    });
  });
});
