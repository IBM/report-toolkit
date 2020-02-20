import {
  filterEnabledRules,
  parseConfig,
  normalizeFlattenedConfig
} from '../src/config.js';
import {of} from '../src/observable.js';

describe('@report-toolkit/config', function() {
  describe('function', function() {
    describe('filterEnabledRules()', function() {
      it('should return an array of enabled rule IDs', function() {
        expect(
          // @ts-ignore -- partial type OK here
          filterEnabledRules({rules: {bar: false, foo: true}}),
          'to equal',
          ['foo']
        );
      });
    });

    describe('parseConfig()', function() {
      describe('when the config has already been flattened', function() {
        it('should return the config', function() {
          const config = normalizeFlattenedConfig({});
          expect(
            of([config]).pipe(parseConfig()),
            'to complete with value',
            config
          );
        });
      });
    });
  });
});
