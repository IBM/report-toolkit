import {flattenConfig} from '../src/config';

describe('module:config', function() {
  describe('flattenConfig()', function() {
    describe('when provided config-as-array', function() {
      describe('when array contains reference to builtin', function() {
        const {config} = require('./fixture/gnosticrc-array-builtin');

        it('should return a flattened config', function() {
          expect(flattenConfig(config), 'to equal', {
            rules: {
              'long-timeout': ['on', {timeout: 5000}],
              'library-mismatch': 'on'
            }
          });
        });
      });
    });
  });
});
