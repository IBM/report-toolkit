import {filterEnabledRules, kFlattenedConfig, loadConfig} from '../src/config';

import {join} from 'path';
import rootConfig from '../.gnosticrc';

describe('module:config', function() {
  describe('function', function() {
    describe('loadConfig()', function() {
      describe('when a config is available', function() {
        describe('when passed no parameters', function() {
          it('should load a config from the default directory', function() {
            return expect(loadConfig(), 'to complete with value', {
              rules: {
                'long-timeout': [true, {timeout: 5000}],
                'library-mismatch': true
              },
              [kFlattenedConfig]: true
            }).and('to emit once');
          });
        });

        describe('when passed an explicit search path', function() {
          it('should load a config from the search path', function() {
            return expect(
              loadConfig({searchPath: join(__dirname, 'fixture')}),
              'to complete with value',
              {
                rules: {
                  'long-timeout': [true, {timeout: 3000}],
                  'library-mismatch': false
                },
                [kFlattenedConfig]: true
              }
            ).and('to emit once');
          });
        });

        describe('when passed an object', function() {
          it('should flatten the object', function() {
            return expect(
              loadConfig({config: rootConfig}),
              'to complete with value',
              {
                rules: {
                  'long-timeout': [true, {timeout: 5000}],
                  'library-mismatch': true
                },
                [kFlattenedConfig]: true
              }
            ).and('to emit once');
          });
        });
      });
    });

    describe('filterEnabledRules', function() {
      it('should return an array of enabled rule IDs', function() {
        expect(
          filterEnabledRules({rules: {foo: true, bar: false}}),
          'to equal',
          ['foo']
        );
      });
    });
  });
});
