import {of} from '@report-toolkit/common/src/observable.js';

import {transform} from '../src/numeric.js';

describe('@report-toolkit/transformers:numeric', function() {
  it('should return only numeric values from an object', function() {
    return expect(
      of({foo: 'bar', baz: 1}).pipe(transform({keys: ['foo', 'baz']})),
      'to complete with value',
      {key: 'baz', value: 1}
    );
  });
});
