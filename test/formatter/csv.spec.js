import {of} from '../../src/observable';
import {toCsv} from '../../src/formatters/csv';

describe('module:formatter/csv', function() {
  describe('function', function() {
    describe('toCsv()', function() {
      it('should parse a JS object into CSV', function() {
        return expect(
          of({foo: 1, bar: 2, baz: 3}, {foo: 4, bar: 5, baz: 6}).pipe(
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
