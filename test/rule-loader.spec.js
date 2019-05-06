import {Rule} from '../src/rule';
import _ from 'lodash';
import {createSandbox} from 'sinon';
import {join} from 'path';
import rewiremock from './mock-helper';

describe('module:rule-loader', function() {
  let sandbox;
  let readdir;

  beforeEach(function() {
    sandbox = createSandbox();
  });

  afterEach(function() {
    sandbox.restore();
  });

  describe('loadRules()', function() {
    let loadRules;

    describe('when called without searchPath', function() {
      let rules;

      beforeEach(async function() {
        rules = {
          'library-mismatch': await import('../src/rules/library-mismatch'),
          'long-timeout': await import('../src/rules/long-timeout')
        };
        readdir = sandbox.stub();
        readdir
          .onFirstCall()
          .callsArgWithAsync(1, null, [
            'library-mismatch.js',
            'long-timeout.js'
          ]);
        readdir.onSecondCall().callsArgWithAsync(1, null, ['oops.js']);

        const ruleLoader = await rewiremock.module(
          () => import('../src/rule-loader'),
          {
            fs: {readdir}
          }
        );
        loadRules = ruleLoader.loadRules;
        // memoized; clear it before each test run
        ruleLoader.loadRuleFromRuleDef.cache.clear();
        ruleLoader.readDirpath.cache.clear();
      });

      it('should return a list of rules from ../src/rules/', function() {
        return expect(
          loadRules(),
          'to complete with values',
          Rule.create(
            _.assign(
              {
                id: 'library-mismatch',
                filepath: require.resolve('../src/rules/library-mismatch')
              },
              rules['library-mismatch']
            )
          ),
          Rule.create(
            _.assign(
              {
                id: 'long-timeout',
                filepath: require.resolve('../src/rules/long-timeout')
              },
              rules['long-timeout']
            )
          )
        );
      });
    });

    describe('when called with searchPath', function() {
      let searchPath;
      let rules;

      beforeEach(async function() {
        searchPath = join(__dirname, 'fixture', 'rules');
        rules = {
          foo: await import('./fixture/rules/foo'),
          bar: await import('./fixture/rules/bar')
        };
        readdir = sandbox.stub();
        readdir.onFirstCall().callsArgWithAsync(1, null, ['foo.js', 'bar.js']);

        const ruleLoader = await rewiremock.module(
          () => import('../src/rule-loader'),
          {
            fs: {readdir}
          }
        );
        loadRules = ruleLoader.loadRules;
        ruleLoader.readDirpath.cache.clear();
        ruleLoader.loadRuleFromRuleDef.cache.clear();
      });

      it('should return a list of rules from dir searchPath', function() {
        return expect(
          loadRules({searchPath}),
          'to complete with values',
          Rule.create({
            inspect: rules.foo.inspect,
            meta: {type: 'info', mode: 'simple', docs: {}},
            id: 'foo',
            filepath: join(searchPath, 'foo.js')
          }),
          Rule.create({
            inspect: rules.bar.inspect,
            meta: {type: 'info', mode: 'simple', docs: {}},
            id: 'bar',
            filepath: join(searchPath, 'bar.js')
          })
        );
      });

      describe('when called twice with the same dirpath parameter', function() {
        it('should not re-read the directory', async function() {
          const [obs1, obs2] = [
            loadRules({searchPath}),
            loadRules({searchPath})
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
    let searchPath;

    beforeEach(async function() {
      readdir = sandbox.stub();
      readdir.onFirstCall().callsArgWithAsync(1, null, ['foo.js', 'bar.js']);

      const ruleLoader = await rewiremock.module(
        () => import('../src/rule-loader'),
        {
          fs: {readdir}
        }
      );
      searchPath = join(__dirname, 'fixture', 'rules');
      findRuleDefs = ruleLoader.findRuleDefs;
      // memoized; clear it before each test rulon
      ruleLoader.readDirpath.cache.clear();
    });

    describe('when called with an list of rule IDs', function() {
      it('should only emit rule defs having IDs included in the list', function() {
        return expect(
          findRuleDefs({searchPath, ruleIds: ['foo']}),
          'to complete with values',
          {filepath: join(searchPath, 'foo.js'), id: 'foo'}
        ).and('to emit once');
      });
    });

    describe('when called without a list of rule IDs', function() {
      it('should emit all rule defs within default dirpath', function() {
        return expect(
          findRuleDefs({searchPath}),
          'to complete with values',
          {
            filepath: join(searchPath, 'foo.js'),
            id: 'foo'
          },
          {
            filepath: join(searchPath, 'bar.js'),
            id: 'bar'
          }
        ).and('to emit twice');
      });
    });
  });
});
