import {of} from '@report-toolkit/common/src/observable.js';

import {transform} from '../src/json.js';

describe('@report-toolkit/transformers:json', function() {
  describe('function', function() {
    describe('toJson()', function() {
      it('should parse a JS object and return JSON', function() {
        return expect(
          of(
            {
              bar: 2,
              baz: 3,
              foo: 1
            },
            {
              bar: 5,
              baz: 6,
              foo: 4
            }
          ).pipe(transform()),
          'to complete with value',
          JSON.stringify([
            {
              bar: 2,
              baz: 3,
              foo: 1
            },
            {
              bar: 5,
              baz: 6,
              foo: 4
            }
          ])
        );
      });

      describe('when "pretty" option enabled', function() {
        it('should parse a JS object and return pretty JSON', function() {
          return expect(
            of(
              {
                bar: 2,
                baz: 3,
                foo: 1
              },
              {
                bar: 5,
                baz: 6,
                foo: 4
              }
            ).pipe(transform({pretty: true})),
            'to complete with value',
            JSON.stringify(
              [
                {
                  bar: 2,
                  baz: 3,
                  foo: 1
                },
                {
                  bar: 5,
                  baz: 6,
                  foo: 4
                }
              ],
              null,
              2
            )
          );
        });
      });
    });
  });
});
