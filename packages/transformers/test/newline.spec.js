import {of} from '@report-toolkit/common/src/observable.js';

import {transform} from '../src/newline.js';

describe('@report-toolkit/transformers:newline', function() {
  it('should parse a stream of JS objects into newline-delimited JSON', function() {
    return expect(
      of({bar: 2, baz: 3, foo: 1}, {bar: 5, baz: 6, foo: 4}).pipe(
        transform({
          newline: '\n',
          fields: [
            {label: 'Foo', value: 'foo'},
            {label: 'Bar', value: 'bar'},
            {label: 'Baz', value: 'baz'}
          ]
        })
      ),
      'to complete with values',
      '{"bar":2,"baz":3,"foo":1}\n',
      '{"bar":5,"baz":6,"foo":4}\n'
    );
  });

  it('should parse a stream of strings into newline-delimited strings', function() {
    return expect(
      of('foo', 'bar').pipe(
        transform({
          newline: '\n',
          fields: [
            {label: 'Foo', value: 'foo'},
            {label: 'Bar', value: 'bar'},
            {label: 'Baz', value: 'baz'}
          ]
        })
      ),
      'to complete with values',
      'foo\n',
      'bar\n'
    );
  });
});
