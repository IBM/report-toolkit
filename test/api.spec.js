import {from, of} from 'rxjs';

import {Report} from '../src/report';
import {Rule} from '../src/rule';
import _ from 'lodash/fp';
import {createSandbox} from 'sinon';
import proxyquire from 'proxyquire';

proxyquire.noPreserveCache();

describe('module:api', function() {
  let sandbox;
  let inspect;

  beforeEach(function() {
    sandbox = createSandbox();
  });

  afterEach(function() {
    sandbox.restore();
  });

  describe('inspect()', function() {
    const report1Filepath = require.resolve('./fixture/report-001.json');
    const report2Filepath = require.resolve(
      './fixture/report-002-library-mismatch.json'
    );

    beforeEach(function() {
      const ruleDefs = [
        {id: 'foo', filepath: '/some/path/foo.js'},
        {id: 'bar', filepath: '/some/path/bar.js'}
      ];
      const rules = {
        foo: {
          inspect: context => {
            if (context.filepath === report1Filepath) {
              context.report('foo');
            }
          },
          meta: {},
          '@noCallThru': true
        },
        bar: {
          inspect: context => {
            if (context.filepath !== report1Filepath) {
              context.report('bar');
            }
          },
          meta: {},
          '@noCallThru': true
        }
      };
      const configStubs = {
        findConfigs: sandbox.spy(_.get('rules')),
        fromDir: sandbox.stub().returns(of({rules: {foo: true, bar: true}})),
        fromFile: sandbox.stub().returns(of({rules: {foo: true, bar: true}}))
      };
      const ruleLoaderStubs = {
        findRuleDefs: sandbox.spy(() => from(ruleDefs)),
        loadRuleFromRuleDef: sandbox.spy(({id, filepath}) =>
          of(Rule.create(_.assign({id: id, filepath: filepath}, rules[id])))
        )
      };
      const reportReaderStubs = {
        readReport: sandbox.spy(filepath =>
          of(Report.create(require(filepath), filepath))
        )
      };
      const api = proxyquire('../src/api', {
        './config': configStubs,
        './rule-loader': ruleLoaderStubs,
        './report-reader': reportReaderStubs
      });
      inspect = api.inspect;
    });

    describe('when called without parameters', function() {
      it('should reject', function() {
        return expect(inspect, 'to be rejected');
      });
    });

    describe('when called with a single report file', function() {
      it('should only emit a single message', function() {
        return expect(
          inspect(report1Filepath, {config: {rules: {foo: true, bar: true}}}),
          'to be fulfilled with',
          [
            {
              message: 'foo',
              data: {},
              filepath: report1Filepath,
              id: 'foo'
            }
          ]
        );
      });
    });

    describe('when called with a two report files', function() {
      it('should emit two messages', function() {
        return expect(
          inspect([report1Filepath, report2Filepath], {
            config: {rules: {foo: true, bar: true}}
          }),
          'to be fulfilled with',
          [
            {
              message: 'foo',
              data: {},
              filepath: report1Filepath,
              id: 'foo'
            },
            {
              message: 'bar',
              data: {},
              filepath: report2Filepath,
              id: 'bar'
            }
          ]
        );
      });
    });
  });
});
