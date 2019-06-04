import {Rule, SimpleRule, TemporalRule, kRuleInspect} from '../src/rule';

describe('module:rule', function() {
  let sandbox;

  beforeEach(function() {
    sandbox = sinon.createSandbox();
  });

  afterEach(function() {
    sandbox.restore();
  });

  describe('Rule', function() {
    describe('constructor', function() {
      it('should apply default "meta" property', function() {
        expect(new Rule({}), 'to satisfy', {meta: {mode: 'simple'}});
      });

      describe('when called with rule def missing an "inspect" property', function() {
        it('should supply an implementation which throws', function() {
          expect(
            () => new Rule({})[kRuleInspect](),
            'to throw',
            /Rule ".+?" has no "inspect" implementation/
          );
        });
      });
    });

    describe('static method', function() {
      describe('create()', function() {
        let rule;

        beforeEach(function() {
          Rule.create.cache.clear();
        });

        describe('when no mode specified', function() {
          beforeEach(function() {
            rule = Rule.create({});
          });

          it('should create a SimpleRule', function() {
            expect(rule, 'to be a', SimpleRule);
          });
        });

        describe('when "simple" mode specified', function() {
          beforeEach(function() {
            rule = Rule.create({meta: {mode: 'simple'}});
          });

          it('should create a SimpleRule', function() {
            expect(rule, 'to be a', SimpleRule);
          });
        });

        describe('when "temporal" mode specified', function() {
          beforeEach(function() {
            rule = Rule.create({meta: {mode: 'temporal'}});
          });

          it('should create a TemporalRule', function() {
            expect(rule, 'to be a', TemporalRule);
          });
        });

        describe('when unknown mode specified', function() {
          it('should throw', function() {
            expect(
              () => Rule.create({meta: {mode: 'sylvester-mcmonkey-mcbean'}}),
              'to throw'
            );
          });
        });
      });
    });

    describe('property', function() {
      describe('id', function() {
        it('should return the Rule id', function() {
          expect(new Rule({id: 'foo'}), 'to have property', 'id', 'foo');
        });
      });

      describe('description', function() {
        it('should return the description', function() {
          expect(
            new Rule({meta: {docs: {description: 'foo'}}}),
            'to have property',
            'description',
            'foo'
          );
        });
      });

      describe('url', function() {
        it('should return the url', function() {
          expect(
            new Rule({meta: {docs: {url: 'https://something'}}}),
            'to have property',
            'url',
            'https://something'
          );
        });
      });

      describe('filepath', function() {
        it('should return the filepath', function() {
          expect(
            new Rule({filepath: __filename}),
            'to have property',
            'filepath',
            __filename
          );
        });
      });

      describe('meta', function() {
        it('should return the metadata', function() {
          expect(new Rule(), 'to have property', 'meta');
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
