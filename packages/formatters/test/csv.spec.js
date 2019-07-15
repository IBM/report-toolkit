import {of} from '@report-toolkit/common/src/observable.js';

import {toCsv} from '../src/csv.js';

describe('@report-toolkit/formatters:csv', function() {
  describe('function', function() {
    describe('toCsv()', function() {
      it('should parse a JS object into CSV', function() {
        return expect(
          of({bar: 2, baz: 3, foo: 1}, {bar: 5, baz: 6, foo: 4}).pipe(
            toCsv({
              fields: [
                {label: 'Foo', value: 'foo'},
                {label: 'Bar', value: 'bar'},
                {label: 'Baz', value: 'baz'}
              ]
            })
          ),
          'to complete with values',
          '"Foo","Bar","Baz"',
          '\n1,2,3',
          '\n4,5,6'
        );
      });
    });
  });
});
