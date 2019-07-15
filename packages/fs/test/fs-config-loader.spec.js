import customConfig from '@report-toolkit/common/test/fixture/config/custom.config.js';
import {join} from 'path';

// import {fromFilesystemToConfig} from '../src/fs-config-loader.js';

const defaultConfig = [
  'report-toolkit:recommended',
  {
    rules: {
      'long-timeout': ['on', {timeout: 5000}]
    }
  }
];

describe('@report-toolkit/fs:fs-config-loader', function() {
  let sandbox;

  beforeEach(function() {
    sandbox = sinon.createSandbox();
  });

  afterEach(function() {
    sandbox.restore();
  });

  describe('function', function() {
    describe('fromFilesystemToConfig()', function() {
      describe('when a config is available within default search path', function() {
        let subject;

        beforeEach(function() {
          subject = proxyquire(require.resolve('../src/fs-config-loader.js'), {
            cosmiconfig: () => ({
              search: sandbox.stub().callsFake(searchPath => {
                if (searchPath === process.cwd()) {
                  return Promise.resolve({config: {config: defaultConfig}});
                }
                return Promise.resolve({config: {config: customConfig}});
              })
            })
          }).fromFilesystemToConfig;
        });

        describe('when passed no parameters', function() {
          it('should load a config from the default directory', function() {
            return expect(
              subject(),
              'to complete with value',
              defaultConfig
            ).and('to emit once');
          });
        });

        describe('when passed an explicit search path', function() {
          it('should load a config from the search path', function() {
            return expect(
              subject({
                searchPath: join(__dirname, 'fixture', 'config')
              }),
              'to complete with value',
              customConfig
            ).and('to emit once');
          });
        });
      });

      describe('when passed an object', function() {
        let subject;

        beforeEach(function() {
          subject = proxyquire(
            require.resolve('../src/fs-config-loader.js'),
            {}
          ).fromFilesystemToConfig;
        });

        it('should return identity', function() {
          return expect(
            subject({config: customConfig}),
            'to complete with value',
            customConfig
          ).and('to emit once');
        });
      });
    });
  });
});
