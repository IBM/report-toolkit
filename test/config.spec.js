import {filterEnabledRules, fromDir, fromFile} from '../src/config';

import {join} from 'path';

describe('module:config', function() {
  describe('function', function() {
    describe('fromFile()', function() {
      it('should load a config file', function() {
        return expect(
          fromFile(require.resolve('./fixture/gnostic.config.js')),
          'to complete with value',
          {
            config: {
              rules: {
                'long-timeout': [true, {timeout: 5000}],
                'library-mismatch': false
              }
            }
          }
        )
          .and('to emit once')
          .and('not to emit error');
      });
    });

    describe('fromDir()', function() {
      it('should load a config file', function() {
        return expect(
          fromDir(join(__dirname, 'fixture')),
          'to complete with value',
          {
            config: {
              rules: {
                'long-timeout': [true, {timeout: 5000}],
                'library-mismatch': false
              }
            }
          }
        )
          .and('to emit once')
          .and('not to emit error');
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
