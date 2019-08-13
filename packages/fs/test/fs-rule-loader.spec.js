import path from 'path';

const SRC_DIR = path.resolve(__dirname, '..', 'src');
const RULES_DIR = path.join(SRC_DIR, 'rules');
const FIXTURE_RULES_DIR = path.resolve(__dirname, 'fixture', 'rules');

describe('@report-toolkit/fs:fs-rule-loader', function() {
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

    subject = proxyquire(require.resolve('../src/fs-rule-loader.js'), {
      fs: {
        readdir: sandbox.stub().callsFake((searchPath, callback) => {
          if (!searchPath) {
            process.nextTick(() => callback(new Error()));
            return;
          }
          process.nextTick(() => callback(null, FILES));
        })
      },
      path: {
        resolve
      }
    });
  });

  afterEach(function() {
    sandbox.restore();
  });

  describe('fromDirpathToFilepaths()', function() {
    let fromDirpathToFilepaths;

    beforeEach(function() {
      fromDirpathToFilepaths = subject.fromDirpathToFilepaths;
    });

    describe('when called without dirpath', function() {
      it('should emit an error', function() {
        return expect(fromDirpathToFilepaths(), 'to emit error');
      });
    });

    describe('when called with dirpath', function() {
      it('should return a list of files within dirpath', function() {
        return expect(
          fromDirpathToFilepaths(FIXTURE_RULES_DIR),
          'to complete with values',
          path.join(FIXTURE_RULES_DIR, 'foo.js'),
          path.join(FIXTURE_RULES_DIR, 'bar.js')
        );
      });
    });
  });
});
