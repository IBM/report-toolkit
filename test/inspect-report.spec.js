import {Inspector} from '../src/inspect-report';
describe('module:inspect-report', function() {
  let sandbox;

  beforeEach(function() {
    sandbox = sinon.createSandbox();
  });

  afterEach(function() {
    sandbox.restore();
  });

  describe('Inspector', function() {
    describe('property', function() {
      describe('ruleConfig', function() {
        it('should be the associated ruleConfig', function() {
          const ruleConfig = {};
          expect(
            new Inspector(ruleConfig),
            'to have property',
            'ruleConfig',
            ruleConfig
          );
        });
      });
    });

    describe('static method', function() {
      describe('create()', function() {
        it('should construct an Inspector', function() {
          const ruleConfig = {};
          const rawConfig = {};

          expect(
            Inspector.create(rawConfig, ruleConfig),
            'to be an',
            Inspector
          );
        });
      });
    });

    describe('instance method', function() {
      describe('inspect()', function() {
        it(
          'should return an Observable which completes with results for one or more reports'
        );
      });
    });
  });
});
