import {of} from 'rxjs';
import {toJson} from '../../src/formatter/json';

describe('module:formatter/json', function() {
  describe('function', function() {
    describe('toJson()', function() {
      it('should parse a JS object and return JSON', function() {
        return expect(
          of({foo: 1, bar: 2, baz: 3}, {foo: 4, bar: 5, baz: 6}).pipe(toJson()),
          'to complete with value',
          '[{"foo":1,"bar":2,"baz":3},{"foo":4,"bar":5,"baz":6}]'
        );
      });

      describe('when "pretty" option enabled', function() {
        it('should parse a JS object and return pretty JSON', function() {
          return expect(
            of({foo: 1, bar: 2, baz: 3}, {foo: 4, bar: 5, baz: 6}).pipe(
              toJson({pretty: true})
            ),
            'to complete with value',
            `[
  {
    "foo": 1,
    "bar": 2,
    "baz": 3
  },
  {
    "foo": 4,
    "bar": 5,
    "baz": 6
  }
]`
          );
        });
      });
    });
  });
});
