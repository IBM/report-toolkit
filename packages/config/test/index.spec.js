import {filterEnabledRules} from '../src/index.js';

describe('@gnostic/config', function() {
  describe('function', function() {
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
