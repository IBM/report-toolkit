import {join, resolve} from 'path';

import {createSandbox} from 'sinon';
import {kRuleId} from '../src/rule';
import proxyquire from 'proxyquire';

proxyquire.noPreserveCache();

const BUILTIN_RULES_DIR = resolve(__dirname, '..', 'src', 'rules');

describe('module:load-rules', function() {
  describe('loadRulesFromDirpath()', function() {
    let sandbox;
    let readdir;
    let loadRulesFromDirpath;
    let fooRule;
    let barRule;

    beforeEach(function() {
      sandbox = createSandbox();
      readdir = sandbox.stub();
      readdir.onFirstCall().callsArgWithAsync(1, null, ['foo.js', 'bar.js']);
      readdir.onSecondCall().callsArgWithAsync(1, null, ['oops.js']);
      fooRule = {
        match: () => {},
        meta: {},
        '@noCallThru': true
      };
      barRule = {
        match: () => {},
        meta: {},
        '@noCallThru': true
      };
    });

    afterEach(function() {
      sandbox.restore();
    });

    describe('when called without parameters', function() {
      beforeEach(function() {
        const loadRules = proxyquire('../src/load-rules', {
          fs: {readdir},
          [join(BUILTIN_RULES_DIR, 'foo.js')]: fooRule,
          [join(BUILTIN_RULES_DIR, 'bar.js')]: barRule
        });
        loadRulesFromDirpath = loadRules.loadRulesFromDirpath;
        // these are memoized; clear it before each test run
        loadRules.findRulesFromDirpath.cache.clear();
        loadRulesFromDirpath.cache.clear();
      });

      it('should return a list of rules from ../src/rules/', function() {
        return expect(
          loadRulesFromDirpath(),
          'to complete with values',
          {
            match: fooRule.match,
            meta: {},
            [kRuleId]: 'foo'
          },
          {
            match: barRule.match,
            meta: {},
            [kRuleId]: 'bar'
          }
        );
      });
    });

    describe('when called with dirpath parameter', function() {
      const dirpath = '/some/path';

      beforeEach(function() {
        const loadRules = proxyquire('../src/load-rules', {
          fs: {readdir},
          [join(dirpath, 'foo.js')]: fooRule,
          [join(dirpath, 'bar.js')]: barRule
        });
        loadRulesFromDirpath = loadRules.loadRulesFromDirpath;
        // loadRules is memoized; clear it before each test run
        loadRulesFromDirpath.cache.clear();
      });

      it('should return a list of rules from specified dirpath', function() {
        return expect(
          loadRulesFromDirpath(dirpath),
          'to complete with values',
          {
            match: fooRule.match,
            meta: {},
            [kRuleId]: 'foo'
          },
          {
            match: barRule.match,
            meta: {},
            [kRuleId]: 'bar'
          }
        );
      });

      describe('when called twice with the same dirpath parameter', function() {
        it('should not re-read the directory', async function() {
          const [obs1, obs2] = [
            loadRulesFromDirpath(dirpath),
            loadRulesFromDirpath(dirpath)
          ];
          return expect(
            obs2.toPromise(),
            'to be fulfilled with',
            await obs1.toPromise()
          );
        });
      });
    });
  });
});
