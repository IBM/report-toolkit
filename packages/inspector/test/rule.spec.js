import {_, error} from '@report-toolkit/common';

import {AJV} from '../src/ajv.js';
import {Rule} from '../src/rule.js';

const {RTKERR_INVALID_RULE_CONFIG, RTKERR_INVALID_RULE_DEFINITION} = error;

describe('@report-toolkit/inspector:rule', function() {
  let sandbox;
  const ajv = AJV();

  beforeEach(function() {
    sandbox = sinon.createSandbox();
  });

  afterEach(function() {
    sandbox.restore();
  });

  describe('Rule', function() {
    describe('constructor', function() {
      it('should apply default "meta" property', function() {
        expect(new Rule({inspect: _.noop}), 'to satisfy', {meta: {}});
      });

      describe('when called with rule def missing an "inspect" function', function() {
        it('should throw', function() {
          expect(
            () => new Rule({}),
            'to throw with code',
            RTKERR_INVALID_RULE_DEFINITION
          );
        });
      });
    });

    describe('static method', function() {
      describe('create()', function() {
        it('should create a Rule', function() {
          expect(Rule.create({inspect: _.noop}), 'to be a', Rule);
        });
      });
    });

    describe('property', function() {
      describe('id', function() {
        it('should return the Rule id', function() {
          expect(
            new Rule({id: 'foo', inspect: _.noop}),
            'to have property',
            'id',
            'foo'
          );
        });
      });

      describe('description', function() {
        it('should return the description', function() {
          expect(
            new Rule({inspect: _.noop, meta: {docs: {description: 'foo'}}}),
            'to have property',
            'description',
            'foo'
          );
        });
      });

      describe('url', function() {
        it('should return the url', function() {
          expect(
            new Rule({
              inspect: _.noop,
              meta: {docs: {url: 'https://something'}}
            }),
            'to have property',
            'url',
            'https://something'
          );
        });
      });

      describe('filepath', function() {
        it('should return the filepath', function() {
          expect(
            new Rule({filepath: __filename, inspect: _.noop}),
            'to have property',
            'filepath',
            __filename
          );
        });
      });

      describe('meta', function() {
        it('should return the metadata', function() {
          expect(
            new Rule({inspect: _.noop, meta: 'foo'}),
            'to have property',
            'meta',
            'foo'
          );
        });
      });

      describe('validate', function() {
        let rule;
        beforeEach(function() {
          sandbox.spy(ajv, 'compile');
        });

        describe('when a rule has no schema', function() {
          beforeEach(function() {
            rule = new Rule({inspect: _.noop});
          });

          it('should be a noop', function() {
            expect(rule.validate, 'to be', _.identity);
          });
        });

        describe('when a rule has a schema', function() {
          beforeEach(function() {
            rule = new Rule({
              id: 'foo',
              inspect: _.noop,
              meta: {
                schema: {
                  additionalProperties: false,
                  properties: {
                    foo: {
                      type: 'boolean'
                    }
                  },
                  type: 'object'
                }
              }
            });
          });
          it('should throw if passed an invalid config', function() {
            expect(
              () => rule.validate({foo: 'baz'}),
              'to throw with code',
              RTKERR_INVALID_RULE_CONFIG
            );
          });
        });
      });
    });
  });

  describe('instance method', function() {
    describe('inspect()', function() {
      it('should call the `inspect` method of the rule definition');
    });
  });
});
