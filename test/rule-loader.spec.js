import {join, resolve} from 'path';

import {Rule} from '../src/rule';
import {createSandbox} from 'sinon';
import proxyquire from 'proxyquire';

proxyquire.noPreserveCache();

const BUILTIN_RULES_DIR = resolve(__dirname, '..', 'src', 'rules');

describe('module:rule-loader', function() {
  let sandbox;
  let readdir;
  let rules;

  beforeEach(function() {
    rules = {
      foo: {
        inspect: () => {},
        meta: {},
        '@noCallThru': true
      },
      bar: {
        inspect: () => {},
        meta: {},
        '@noCallThru': true
      }
    };

    sandbox = createSandbox();
    readdir = sandbox.stub();
    readdir.onFirstCall().callsArgWithAsync(1, null, ['foo.js', 'bar.js']);
    readdir.onSecondCall().callsArgWithAsync(1, null, ['oops.js']);
  });

  describe('loadRules()', function() {
    let loadRules;

    afterEach(function() {
      sandbox.restore();
    });

    describe('when called without parameters', function() {
      beforeEach(function() {
        const ruleLoader = proxyquire('../src/rule-loader', {
          fs: {readdir},
          [join(BUILTIN_RULES_DIR, 'foo.js')]: rules.foo,
          [join(BUILTIN_RULES_DIR, 'bar.js')]: rules.bar
        });
        loadRules = ruleLoader.loadRules;
        // memoized; clear it before each test run
        ruleLoader.loadRuleFromRuleDef.cache.clear();
        ruleLoader.readDirpath.cache.clear();
      });

      it('should return a list of rules from ../src/rules/', function() {
        return expect(
          loadRules(),
          'to complete with values',
          Rule.create({
            inspect: rules.foo.inspect,
            meta: {type: 'info', mode: 'simple', docs: {}},
            id: 'foo',
            filepath: join(BUILTIN_RULES_DIR, 'foo.js')
          }),
          Rule.create({
            inspect: rules.bar.inspect,
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
        const ruleLoader = proxyquire('../src/rule-loader', {
          fs: {readdir},
          [join(dirpath, 'foo.js')]: rules.foo,
          [join(dirpath, 'bar.js')]: rules.bar
        });
        loadRules = ruleLoader.loadRules;
        ruleLoader.readDirpath.cache.clear();
        ruleLoader.loadRuleFromRuleDef.cache.clear();
      });

      it('should return a list of rules from specified dirpath', function() {
        return expect(
          loadRules({dirpath}),
          'to complete with values',
          Rule.create({
            inspect: rules.foo.inspect,
            meta: {type: 'info', mode: 'simple', docs: {}},
            id: 'foo',
            filepath: join(dirpath, 'foo.js')
          }),
          Rule.create({
            inspect: rules.bar.inspect,
            meta: {type: 'info', mode: 'simple', docs: {}},
            id: 'bar',
            filepath: join(dirpath, 'bar.js')
          })
        );
      });

      describe('when called twice with the same dirpath parameter', function() {
        it('should not re-read the directory', async function() {
          const [obs1, obs2] = [loadRules({dirpath}), loadRules({dirpath})];
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
      const ruleLoader = proxyquire('../src/rule-loader', {
        fs: {readdir},
        [join(BUILTIN_RULES_DIR, 'foo.js')]: rules.foo,
        [join(BUILTIN_RULES_DIR, 'bar.js')]: rules.bar
      });
      findRuleDefs = ruleLoader.findRuleDefs;
      // memoized; clear it before each test rulon
      ruleLoader.readDirpath.cache.clear();
    });

    describe('when called with an list of rule IDs', function() {
      it('should only emit rule defs having IDs included in the list', function() {
        return expect(
          findRuleDefs({ruleIds: ['foo']}),
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
