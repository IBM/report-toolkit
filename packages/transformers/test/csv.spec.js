import {of} from '@report-toolkit/common/src/observable.js';

import {transform} from '../src/csv.js';

describe('@report-toolkit/transformers:csv', function() {
  describe('function', function() {
    describe('toCsv()', function() {
      it('should parse a JS object into CSV', function() {
        return expect(
          of({bar: 2, baz: 3, foo: 1}, {bar: 5, baz: 6, foo: 4}).pipe(
            transform({
              fields: [
                {label: 'Foo', value: 'foo'},
                {label: 'Bar', value: 'bar'},
                {label: 'Baz', value: 'baz'}
              ]
            })
          ),
          'to complete with values',
          '"Foo","Bar","Baz"',
          '1,2,3',
          '4,5,6'
        );
      });
    });
  });
});
