import {observable} from '@report-toolkit/common';
// @ts-ignore
import REPORT_001 from '@report-toolkit/common/test/fixture/reports/report-001.json';
// @ts-ignore
import REPORT_003 from '@report-toolkit/common/test/fixture/reports/report-003-long-timeout.json';
// @ts-ignore
import REPORT_002 from '@report-toolkit/common/test/fixture/reports/report-004-long-timeout-unref.json';

import {transform} from '../src/stack-hash.js';

const {of} = observable;

describe('@report-toolkit/transformers:stack-hash', function() {
  it('should emit an object containing a unique hash', function() {
    return expect(of(REPORT_001).pipe(transform()), 'to complete with value', {
      dumpEventTime: '2019-04-29T12:31:35Z',
      filename: 'report.20190429.123135.45164.0.001.json',
      message: 'Error [ERR_SYNTHETIC]: JavaScript Callstack',
      sha1: 'a87a1ecedf547e5f223fe47ae4fefb4e86637397'
    });
  });

  describe('when the same stack occurs in a different report', function() {
    it('should emit an object containing the same hash', async function() {
      const {sha1} = await of(REPORT_003)
        .pipe(transform())
        .toPromise();
      return expect(
        of(REPORT_002).pipe(transform()),
        'to complete with value',
        {
          dumpEventTime: '2019-04-16T15:46:19Z',
          filename: 'report.20190416.154619.67845.001.json',
          message: 'Error [ERR_SYNTHETIC]: JavaScript Callstack',
          sha1
        }
      );
    });
  });

  describe('when passed a custom `strip` function', function() {
    it('should emit an object containing a unique hash', function() {
      return expect(
        of(REPORT_001).pipe(transform({strip: msg => msg.slice(6)})),
        'to complete with value',
        {
          dumpEventTime: '2019-04-29T12:31:35Z',
          filename: 'report.20190429.123135.45164.0.001.json',
          message: '[ERR_SYNTHETIC]: JavaScript Callstack',
          sha1: 'a1c25c242fa4e8b157c79b71224b529d6d922564'
        }
      );
    });
  });

  describe('when passed a custom `strip` string', function() {
    it('should emit an object containing a unique hash', function() {
      return expect(
        of(REPORT_001).pipe(transform({strip: 'Error '})),
        'to complete with value',
        {
          dumpEventTime: '2019-04-29T12:31:35Z',
          filename: 'report.20190429.123135.45164.0.001.json',
          message: '[ERR_SYNTHETIC]: JavaScript Callstack',
          sha1: 'a1c25c242fa4e8b157c79b71224b529d6d922564'
        }
      );
    });
  });

  describe('when passed a custom `strip` RegExp', function() {
    it('should emit an object containing a unique hash', function() {
      return expect(
        of(REPORT_001).pipe(transform({strip: /^Error\s/})),
        'to complete with value',
        {
          dumpEventTime: '2019-04-29T12:31:35Z',
          filename: 'report.20190429.123135.45164.0.001.json',
          message: '[ERR_SYNTHETIC]: JavaScript Callstack',
          sha1: 'a1c25c242fa4e8b157c79b71224b529d6d922564'
        }
      );
    });
  });
});
