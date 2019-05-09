import {
  findRuleDefs,
  loadRuleFromRuleDef,
  loadRules,
  readDirpath
} from '../src/rule-loader';

import {Rule} from '../src/rule';
import {createSandbox} from 'sinon';
import fs from 'fs';
import {join} from 'path';

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
    describe('when called without searchPath', function() {
      let rules;

      beforeEach(function() {
        rules = {
          'library-mismatch': require('../src/rules/library-mismatch'),
          'long-timeout': require('../src/rules/long-timeout')
        };
        readdir = sandbox.stub(fs, 'readdir');
        readdir
          .onFirstCall()
          .callsArgWithAsync(1, null, [
            'library-mismatch.js',
            'long-timeout.js'
          ]);
        readdir.onSecondCall().callsArgWithAsync(1, null, ['oops.js']);

        // memoized; clear it before each test run
        loadRuleFromRuleDef.cache.clear();
        readDirpath.cache.clear();
      });

      it('should return a list of rules from ../src/rules/', function() {
        return expect(
          loadRules(),
          'to complete with values',
          Rule.create({
            id: 'library-mismatch',
            filepath: require.resolve('../src/rules/library-mismatch'),
            ...rules['library-mismatch']
          }),
          Rule.create({
            id: 'long-timeout',
            filepath: require.resolve('../src/rules/long-timeout'),
            ...rules['long-timeout']
          })
        );
      });
    });

    describe('when called with searchPath', function() {
      let searchPath;
      let rules;

      beforeEach(function() {
        searchPath = join(__dirname, 'fixture', 'rules');
        rules = {
          foo: require('./fixture/rules/foo'),
          bar: require('./fixture/rules/bar')
        };
        readdir = sandbox.stub(fs, 'readdir');
        readdir.onFirstCall().callsArgWithAsync(1, null, ['foo.js', 'bar.js']);

        readDirpath.cache.clear();
        loadRuleFromRuleDef.cache.clear();
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
    let searchPath;

    beforeEach(function() {
      readdir = sandbox.stub(fs, 'readdir');
      readdir.onFirstCall().callsArgWithAsync(1, null, ['foo.js', 'bar.js']);

      searchPath = join(__dirname, 'fixture', 'rules');
      // memoized; clear it before each test rulon
      readDirpath.cache.clear();
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
