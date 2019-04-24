import {config} from './fixture/gnosticrc-array-builtin';
import {flatten} from '../src/config';

describe('module:config', function() {
  describe('flattenConfig()', function() {
    describe('when provided config-as-array', function() {
      describe('when array contains reference to builtin', function() {
        it('should return a flattened config', function() {
          expect(flatten(config), 'to equal', {
            rules: {
              'long-timeout': [true, {timeout: 5000}],
              'library-mismatch': false
            }
          });
        });
      });
    });
  });
});
