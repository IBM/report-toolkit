import {Rule} from '../src/rule';
import fs from 'fs';
import {join} from 'path';

describe('module:rule-loader', function() {
  const FILES = ['foo.js', 'bar.js'];
  let sandbox;
  let subject;
  let readdir;

  beforeEach(function() {
    sandbox = sinon.createSandbox();

    subject = rewiremock.proxy(
      () => require('../src/rule-loader'),
      () => {
        rewiremock(() => require('fs'))
          .with({
            readdir: sandbox.stub().callsFake((ignored, callback) => {
              process.nextTick(() => callback(null, FILES));
            })
          })
          .callThrough();
        rewiremock(() => require('path'))
          .with({
            resolve: (from, to) => join(__dirname, 'fixture', 'rules', to)
          })
          .callThrough();
      }
    );
  });

  afterEach(function() {
    sandbox.restore();
  });

  describe('loadRules()', function() {
    let loadRules;

    beforeEach(function() {
      loadRules = subject.loadRules;
    });

    describe('when called without searchPath', function() {
      it('should return a list of rules from ../src/rules/', function() {
        return expect(
          loadRules(),
          'to complete with values',
          Rule.create({
            id: 'foo',
            filepath: require.resolve('./fixture/rules/foo'),
            ...require('./fixture/rules/foo')
          }),
          Rule.create({
            id: 'bar',
            filepath: require.resolve('./fixture/rules/bar'),
            ...require('./fixture/rules/bar')
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
      subject = rewiremock.proxy(
        () => require('../src/rule-loader'),
        () => {
          rewiremock(() => require('fs'))
            .with({
              readdir: sandbox.stub().callsFake((ignored, callback) => {
                process.nextTick(() => callback(null, FILES));
              })
            })
            .callThrough();
          rewiremock(() => require('path'))
            .with({
              resolve: (from, to) => join(__dirname, 'fixture', 'rules', to)
            })
            .callThrough();
        }
      );
      searchPath = join(__dirname, 'fixture', 'rules');
    });

    describe('when called with an list of rule IDs', function() {
      it('should only emit rule defs having IDs included in the list', function() {
        return expect(
          subject.findRuleDefs({searchPath, ruleIds: ['foo']}),
          'to complete with values',
          {filepath: join(searchPath, 'foo.js'), id: 'foo'}
        ).and('to emit once');
      });
    });

    describe('when called without a list of rule IDs', function() {
      it('should emit all rule defs within default dirpath', function() {
        return expect(
          subject.findRuleDefs({searchPath}),
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
