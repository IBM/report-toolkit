import * as promise from '../../src/api/promise';
import * as stream from '../../src/api/stream';

import {of} from '../../src/observable';

const REPORT_001_FILEPATH = require.resolve(
  '../fixture/reports/report-001.json'
);

describe('module:api/promise', function() {
  let sandbox;

  beforeEach(function() {
    sandbox = sinon.createSandbox();
    sandbox.stub(stream, 'inspect').returns(of({message: 'foo'}));
    sandbox.stub(stream, 'loadConfig').returns(of({}));
    sandbox.stub(stream, 'loadRules').returns(of({id: 'foo'}, {id: 'bar'}));
    sandbox.stub(stream, 'diff').returns(of({}));
    sandbox
      .stub(stream, 'loadReport')
      .returns(of(require(REPORT_001_FILEPATH)));
    sandbox.stub(stream, 'loadRuleConfigs').returns(of({}));
  });

  afterEach(function() {
    sandbox.restore();
  });

  describe('function', function() {
    describe('inspect()', function() {
      let inspect;

      beforeEach(function() {
        inspect = promise.inspect;
      });

      it('should delegate to stream.inspect()', async function() {
        await inspect();
        expect(stream.inspect, 'was called');
      });
    });

    describe('diff()', function() {
      let diff;

      beforeEach(function() {
        diff = promise.diff;
      });

      it('should delegate to stream.inspect()', async function() {
        await diff();
        expect(stream.diff, 'was called');
      });
    });

    describe('loadConfig()', function() {
      let loadConfig;

      beforeEach(function() {
        loadConfig = promise.loadConfig;
      });

      it('should delegate to stream.inspect()', async function() {
        await loadConfig();
        expect(stream.loadConfig, 'was called');
      });
    });

    describe('loadRules()', function() {
      let loadRules;

      beforeEach(function() {
        loadRules = promise.loadRules;
      });

      it('should delegate to stream.inspect()', async function() {
        await loadRules();
        expect(stream.loadRules, 'was called');
      });
    });

    describe('loadReport()', function() {
      let loadReport;

      beforeEach(function() {
        loadReport = promise.loadReport;
      });

      it('should delegate to stream.inspect()', async function() {
        await loadReport();
        expect(stream.loadReport, 'was called');
      });
    });

    describe('loadRuleConfigs()', function() {
      let loadRuleConfigs;

      beforeEach(function() {
        loadRuleConfigs = promise.loadRuleConfigs;
      });

      it('should delegate to stream.inspect()', async function() {
        await loadRuleConfigs();
        expect(stream.loadRuleConfigs, 'was called');
      });
    });
  });
});
