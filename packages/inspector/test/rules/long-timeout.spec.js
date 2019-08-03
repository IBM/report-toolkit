import {ERROR} from '@report-toolkit/common/src/constants.js';

import {createInspect, getDefaultConfigValue} from './rules-helper.js';

const RULE_PATH = '../../src/rules/long-timeout.js';

describe('@report-toolkit/rules:long-timeout', function() {
  let inspect;

  beforeEach(function() {
    inspect = createInspect(RULE_PATH);
  });

  describe('inspection', function() {
    describe('when finding an unexpired but unreferenced libuv handle w/timer scheduled beyond the default threshold', function() {
      it('should not report', function() {
        return expect(
          inspect(
            '@report-toolkit/common/test/fixture/reports/report-004-long-timeout-unref.json'
          ),
          'not to emit values'
        );
      });
    });

    describe('when finding an unexpired & referenced libuv handle w/timer scheduled beyond the default threshold', function() {
      it('should report', function() {
        return expect(
          inspect(
            '@report-toolkit/common/test/fixture/reports/report-003-long-timeout.json'
          ),
          'to complete with value satisfying',
          {
            filepath: /fixture\/reports\/report-003-long-timeout\.json/,
            id: 'long-timeout',
            message:
              'libuv handle at address 0x00007ffeefbfe2e8 is a timer with future expiry in 3h',
            severity: ERROR
          }
        );
      });
    });

    describe('when finding a referenced but expired libuv handle w/timer scheduled beyond the default threshold', function() {
      it('should not report', function() {
        return expect(
          inspect(
            '@report-toolkit/common/test/fixture/reports/report-007-long-timeout-expired.json'
          ),
          'not to emit values'
        );
      });
    });

    describe('when provided a user-defined threshold', function() {
      beforeEach(function() {
        inspect = createInspect(RULE_PATH, {timeout: 50000});
      });

      describe('when finding an unexpired & referenced libuv handle w/timer scheduled beyond the default threshold', function() {
        it('should report', function() {
          return expect(
            inspect(
              '@report-toolkit/common/test/fixture/reports/report-003-long-timeout.json'
            ),
            'to complete with value satisfying',
            {
              filepath: /fixture\/reports\/report-003-long-timeout\.json/,
              id: 'long-timeout',
              message:
                'libuv handle at address 0x00007ffeefbfe2e8 is a timer with future expiry in 3h',
              severity: ERROR
            }
          );
        });
      });
    });
  });

  describe('config', function() {
    describe('when config contains no "threshold" prop', function() {
      it('should apply the default value', function() {
        return expect(
          inspect(
            '@report-toolkit/common/test/fixture/reports/report-003-long-timeout.json'
          ),
          'to complete with value satisfying',
          {
            config: {threshold: getDefaultConfigValue(RULE_PATH, 'threshold')}
          }
        );
      });
    });
  });
});
