import {Rule} from '../src/rule';
import path from 'path';

const SRC_DIR = path.resolve(__dirname, '..', 'src');
const RULES_DIR = path.join(SRC_DIR, 'rules');
const FIXTURE_RULES_DIR = path.join(__dirname, 'fixture', 'rules');

describe('module:rule-loader', function() {
  const FILES = ['foo.js', 'bar.js'];
  let sandbox;
  let subject;

  beforeEach(function() {
    sandbox = sinon.createSandbox();

    const resolve = sandbox
      .stub()
      .callsFake((...args) => path.resolve(...args));
    resolve
      .withArgs(RULES_DIR, 'foo.js')
      .returns(path.join(FIXTURE_RULES_DIR, 'foo.js'));
    resolve
      .withArgs(RULES_DIR, 'bar.js')
      .returns(path.join(FIXTURE_RULES_DIR, 'bar.js'));

    subject = proxyquire(require.resolve('../src/rule-loader'), {
      fs: {
        readdir: sandbox.stub().callsFake((ignored, callback) => {
          process.nextTick(() => callback(null, FILES));
        })
      },
      path: {
        resolve,
        join: sandbox.stub().returns(FIXTURE_RULES_DIR)
      }
    });
    subject.loadRuleFromRuleDef.cache.clear();
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
      it('should return a list of rules from dir searchPath', function() {
        return expect(
          loadRules({searchPath: FIXTURE_RULES_DIR}),
          'to complete with values',
          Rule.create({
            inspect: require('./fixture/rules/foo').inspect,
            meta: {type: 'info', mode: 'simple', docs: {}},
            id: 'foo',
            filepath: path.join(FIXTURE_RULES_DIR, 'foo.js')
          }),
          Rule.create({
            inspect: require('./fixture/rules/bar').inspect,
            meta: {type: 'info', mode: 'simple', docs: {}},
            id: 'bar',
            filepath: path.join(FIXTURE_RULES_DIR, 'bar.js')
          })
        );
      });

      describe('when called twice with the same dirpath parameter', function() {
        it('should not re-read the directory', async function() {
          const [obs1, obs2] = [
            loadRules({searchPath: FIXTURE_RULES_DIR}),
            loadRules({searchPath: FIXTURE_RULES_DIR})
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
    const searchPath = FIXTURE_RULES_DIR;

    describe('when called with an list of rule IDs', function() {
      it('should only emit rule defs having IDs included in the list', function() {
        return expect(
          subject.findRuleDefs({searchPath, ruleIds: ['foo']}),
          'to complete with values',
          {filepath: path.join(searchPath, 'foo.js'), id: 'foo'}
        ).and('to emit once');
      });
    });

    describe('when called without a list of rule IDs', function() {
      it('should emit all rule defs within default dirpath', function() {
        return expect(
          subject.findRuleDefs({searchPath}),
          'to complete with values',
          {
            filepath: path.join(searchPath, 'foo.js'),
            id: 'foo'
          },
          {
            filepath: path.join(searchPath, 'bar.js'),
            id: 'bar'
          }
        ).and('to emit twice');
      });
    });
  });
});
