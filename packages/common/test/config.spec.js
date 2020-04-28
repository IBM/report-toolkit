import {
  filterEnabledRules,
  parseConfig,
  normalizeFlattenedConfig
} from '../src/config.js';
import {of} from '../src/observable.js';
import {kFlattenedConfig} from '../src/symbols.js';
import {
  RTKERR_UNKNOWN_BUILTIN_CONFIG,
  RTKERR_INVALID_CONFIG
} from '../src/error.js';

describe('@report-toolkit/common:config', function () {
  describe('function', function () {
    describe('filterEnabledRules()', function () {
      it('should return an array of enabled rule IDs', function () {
        expect(
          // @ts-ignore -- partial type OK here
          filterEnabledRules({rules: {bar: false, foo: true}}),
          'to equal',
          ['foo']
        );
      });
    });

    describe('parseConfig()', function () {
      describe('when the ExportedConfig has already been flattened', function () {
        it('should return the Config', function () {
          const config = normalizeFlattenedConfig({});
          expect(
            of([config]).pipe(parseConfig()),
            'to complete with value',
            config
          );
        });
      });

      describe('when the Config has already been flattened', function () {
        it('should return the Config', function () {
          const config = normalizeFlattenedConfig({});
          expect(
            of(config).pipe(parseConfig()),
            'to complete with value',
            config
          );
        });
      });

      describe('when the ExportedConfig references a valid builtin', function () {
        it('should return a flattened Config', function () {
          /** @type {import('../src/config').ExportedConfig} */
          const config = ['rtk:recommended'];
          expect(of(config).pipe(parseConfig()), 'to complete with value', {
            commands: {},
            rules: {
              'cpu-usage': true,
              'library-mismatch': true,
              'long-timeout': true,
              'memory-usage': true
            },
            plugins: [],
            transformers: {},
            [kFlattenedConfig]: true
          });
        });
      });

      describe('when the ExportedConfig references an invalid builtin', function () {
        it('should fail', function () {
          // @ts-ignore
          const config = ['rtk:not-recommended'];
          expect(
            of(config).pipe(
              // @ts-ignore
              parseConfig()
            ),
            'to emit error',
            {code: RTKERR_UNKNOWN_BUILTIN_CONFIG}
          );
        });
      });

      describe('when the ExportedConfig is of an invalid format', function () {
        it('should fail', function () {
          // @ts-ignore
          const config = [[{wtf: 'is this'}]];
          expect(
            of(config).pipe(
              // @ts-ignore
              parseConfig()
            ),
            'to emit error',
            {code: RTKERR_INVALID_CONFIG, message: /config value/}
          );
        });
      });

      describe('when the ExportedConfig contains an invalid key', function () {
        it('should fail', function () {
          // @ts-ignore
          const config = [{wtf: 'is this'}];
          expect(
            of(config).pipe(
              // @ts-ignore
              parseConfig()
            ),
            'to emit error',
            {code: RTKERR_INVALID_CONFIG, message: /config key/}
          );
        });
      });
    });
  });
});
