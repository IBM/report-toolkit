import {createReport, observable} from '@report-toolkit/common';
// @ts-ignore
import REPORT_001 from '@report-toolkit/common/test/fixture/reports/report-001.json';
// @ts-ignore
import REPORT_003 from '@report-toolkit/common/test/fixture/reports/report-003-long-timeout.json';
// @ts-ignore
import REPORT_004 from '@report-toolkit/common/test/fixture/reports/report-004-long-timeout-unref.json';

import {transform} from '../src/stack-hash.js';

const REPORT_001_FILEPATH = require.resolve(
  '@report-toolkit/common/test/fixture/reports/report-001.json'
);
const REPORT_004_FILEPATH = require.resolve(
  '@report-toolkit/common/test/fixture/reports/report-004-long-timeout-unref.json'
);
const REPORT_003_FILEPATH = require.resolve(
  '@report-toolkit/common/test/fixture/reports/report-003-long-timeout.json'
);

const {of} = observable;

describe('@report-toolkit/transformers:stack-hash', function () {
  it('should emit an object containing a unique hash', function () {
    return expect(
      of(createReport(REPORT_001, REPORT_001_FILEPATH)).pipe(transform()),
      'to complete with value satisfying',
      {
        dumpEventTime: '2019-04-29T12:31:35Z',
        filepath: REPORT_001_FILEPATH,
        message: 'Error [ERR_SYNTHETIC]: JavaScript Callstack',
        sha1: 'a87a1ecedf547e5f223fe47ae4fefb4e86637397',
        stack: expect.it('to be an', 'array')
      }
    );
  });

  describe('when the same stack occurs in a different report', function () {
    it('should emit an object containing the same hash', async function () {
      const {sha1} = await of(createReport(REPORT_003, REPORT_003_FILEPATH))
        .pipe(transform())
        .toPromise();
      return expect(
        of(createReport(REPORT_004, REPORT_004_FILEPATH)).pipe(transform()),
        'to complete with value satisfying',
        {
          dumpEventTime: '2019-04-16T15:46:19Z',
          filepath: REPORT_004_FILEPATH,
          message: 'Error [ERR_SYNTHETIC]: JavaScript Callstack',
          sha1,
          stack: expect.it('to be an', 'array')
        }
      );
    });
  });

  describe('when passed a custom `strip` function', function () {
    it('should emit an object containing a unique hash', function () {
      return expect(
        of(createReport(REPORT_001, REPORT_001_FILEPATH)).pipe(
          transform({strip: msg => msg.slice(6)})
        ),
        'to complete with value satisfying',
        {
          dumpEventTime: '2019-04-29T12:31:35Z',
          filepath: REPORT_001_FILEPATH,
          message: '[ERR_SYNTHETIC]: JavaScript Callstack',
          sha1: 'a1c25c242fa4e8b157c79b71224b529d6d922564',
          stack: expect.it('to be an', 'array')
        }
      );
    });
  });

  describe('when passed a custom `strip` string', function () {
    it('should emit an object containing a unique hash', function () {
      return expect(
        of(createReport(REPORT_001, REPORT_001_FILEPATH)).pipe(
          transform({strip: 'Error '})
        ),
        'to complete with value satisfying',
        {
          dumpEventTime: '2019-04-29T12:31:35Z',
          filepath: REPORT_001_FILEPATH,
          message: '[ERR_SYNTHETIC]: JavaScript Callstack',
          sha1: 'a1c25c242fa4e8b157c79b71224b529d6d922564',
          stack: expect.it('to be an', 'array')
        }
      );
    });
  });

  describe('when passed a custom `strip` RegExp', function () {
    it('should emit an object containing a unique hash', function () {
      return expect(
        of(createReport(REPORT_001, REPORT_001_FILEPATH)).pipe(
          transform({strip: /^Error\s/})
        ),
        'to complete with value satisfying',
        {
          dumpEventTime: '2019-04-29T12:31:35Z',
          filepath: REPORT_001_FILEPATH,
          message: '[ERR_SYNTHETIC]: JavaScript Callstack',
          sha1: 'a1c25c242fa4e8b157c79b71224b529d6d922564',
          stack: expect.it('to be an', 'array')
        }
      );
    });
  });
});
