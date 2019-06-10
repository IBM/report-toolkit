import {of} from '../../src/observable';

const REPORT_001_FILEPATH = require.resolve(
  '../fixture/reports/report-001.json'
);

describe('module:api/promise', function() {
  let sandbox;
  let subject;
  let streamStubs;

  beforeEach(function() {
    sandbox = sinon.createSandbox();

    streamStubs = {
      inspect: sandbox.stub().returns(of({message: 'foo'})),
      loadConfig: sandbox.stub().returns(of({})),
      loadRules: sandbox.stub().returns(of({id: 'foo'}, {id: 'bar'})),
      diff: sandbox.stub().returns(of({})),
      loadReport: sandbox.stub().returns(of(require(REPORT_001_FILEPATH))),
      loadRuleConfigs: sandbox.stub().returns(of({}))
    };

    subject = proxyquire(require.resolve('../../src/api/promise'), {
      './stream': streamStubs
    });
  });

  afterEach(function() {
    sandbox.restore();
  });

  describe('function', function() {
    describe('inspect()', function() {
      let inspect;

      beforeEach(function() {
        inspect = subject.inspect;
      });

      it('should delegate to stream.inspect()', async function() {
        await inspect();
        expect(streamStubs.inspect, 'was called');
      });
    });

    describe('diff()', function() {
      let diff;

      beforeEach(function() {
        diff = subject.diff;
      });

      it('should delegate to stream.inspect()', async function() {
        await diff();
        expect(streamStubs.diff, 'was called');
      });
    });

    describe('loadConfig()', function() {
      let loadConfig;

      beforeEach(function() {
        loadConfig = subject.loadConfig;
      });

      it('should delegate to stream.inspect()', async function() {
        await loadConfig();
        expect(streamStubs.loadConfig, 'was called');
      });
    });

    describe('loadRules()', function() {
      let loadRules;

      beforeEach(function() {
        loadRules = subject.loadRules;
      });

      it('should delegate to stream.inspect()', async function() {
        await loadRules();
        expect(streamStubs.loadRules, 'was called');
      });
    });

    describe('loadReport()', function() {
      let loadReport;

      beforeEach(function() {
        loadReport = subject.loadReport;
      });

      it('should delegate to stream.inspect()', async function() {
        await loadReport();
        expect(streamStubs.loadReport, 'was called');
      });
    });

    describe('loadRuleConfigs()', function() {
      let loadRuleConfigs;

      beforeEach(function() {
        loadRuleConfigs = subject.loadRuleConfigs;
      });

      it('should delegate to stream.inspect()', async function() {
        await loadRuleConfigs();
        expect(streamStubs.loadRuleConfigs, 'was called');
      });
    });
  });
});
