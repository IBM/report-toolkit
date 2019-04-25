import {join, resolve} from 'path';

import {Rule} from '../src/rule';
import {createSandbox} from 'sinon';
import proxyquire from 'proxyquire';

proxyquire.noPreserveCache();

const BUILTIN_RULES_DIR = resolve(__dirname, '..', 'src', 'rules');

describe('module:rule-loader', function() {
  let sandbox;
  let readdir;

  let fooRule;
  let barRule;

  beforeEach(function() {
    fooRule = {
      inspect: () => {},
      meta: {},
      '@noCallThru': true
    };
    barRule = {
      inspect: () => {},
      meta: {},
      '@noCallThru': true
    };

    sandbox = createSandbox();
    readdir = sandbox.stub();
    readdir.onFirstCall().callsArgWithAsync(1, null, ['foo.js', 'bar.js']);
    readdir.onSecondCall().callsArgWithAsync(1, null, ['oops.js']);
  });

  describe('loadRulesFromDirpath()', function() {
    let loadRulesFromDirpath;

    afterEach(function() {
      sandbox.restore();
    });

    describe('when called without parameters', function() {
      beforeEach(function() {
        const loadRules = proxyquire('../src/rule-loader', {
          fs: {readdir},
          [join(BUILTIN_RULES_DIR, 'foo.js')]: fooRule,
          [join(BUILTIN_RULES_DIR, 'bar.js')]: barRule
        });
        loadRulesFromDirpath = loadRules.loadRulesFromDirpath;
        // memoized; clear it before each test run
        loadRules.loadRuleFromRuleDef.cache.clear();
        loadRules.readDirpath.cache.clear();
      });

      it('should return a list of rules from ../src/rules/', function() {
        return expect(
          loadRulesFromDirpath(),
          'to complete with values',
          Rule.create({
            inspect: fooRule.inspect,
            meta: {type: 'info', mode: 'simple', docs: {}},
            id: 'foo',
            filepath: join(BUILTIN_RULES_DIR, 'foo.js')
          }),
          Rule.create({
            inspect: barRule.inspect,
            meta: {type: 'info', mode: 'simple', docs: {}},
            id: 'bar',
            filepath: join(BUILTIN_RULES_DIR, 'bar.js')
          })
        );
      });
    });

    describe('when called with dirpath parameter', function() {
      const dirpath = '/some/path';

      beforeEach(function() {
        const loadRules = proxyquire('../src/rule-loader', {
          fs: {readdir},
          [join(dirpath, 'foo.js')]: fooRule,
          [join(dirpath, 'bar.js')]: barRule
        });
        loadRulesFromDirpath = loadRules.loadRulesFromDirpath;
        loadRules.readDirpath.cache.clear();
        loadRules.loadRuleFromRuleDef.cache.clear();
      });

      it('should return a list of rules from specified dirpath', function() {
        return expect(
          loadRulesFromDirpath(dirpath),
          'to complete with values',
          Rule.create({
            inspect: fooRule.inspect,
            meta: {type: 'info', mode: 'simple', docs: {}},
            id: 'foo',
            filepath: join(dirpath, 'foo.js')
          }),
          Rule.create({
            inspect: barRule.inspect,
            meta: {type: 'info', mode: 'simple', docs: {}},
            id: 'bar',
            filepath: join(dirpath, 'bar.js')
          })
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

  describe('findRuleDefs()', function() {
    let findRuleDefs;

    beforeEach(function() {
      const loadRules = proxyquire('../src/rule-loader', {
        fs: {readdir},
        [join(BUILTIN_RULES_DIR, 'foo.js')]: fooRule,
        [join(BUILTIN_RULES_DIR, 'bar.js')]: barRule
      });
      findRuleDefs = loadRules.findRuleDefs;
      // memoized; clear it before each test run
      loadRules.readDirpath.cache.clear();
    });

    describe('when called with an object of rule configs', function() {
      it('should only emit rule defs having IDs included in the list', function() {
        return expect(
          findRuleDefs({ruleConfigs: {foo: {some: 'rule'}}}),
          'to complete with values',
          {filepath: join(BUILTIN_RULES_DIR, 'foo.js'), id: 'foo'}
        ).and('to emit once');
      });
    });

    describe('when called without a list of rule IDs', function() {
      it('should emit all rule defs within default dirpath', function() {
        return expect(
          findRuleDefs(),
          'to complete with values',
          {
            filepath: join(BUILTIN_RULES_DIR, 'foo.js'),
            id: 'foo'
          },
          {
            filepath: join(BUILTIN_RULES_DIR, 'bar.js'),
            id: 'bar'
          }
        ).and('to emit twice');
      });
    });
  });
});
