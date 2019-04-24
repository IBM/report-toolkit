import {Inspector} from '../src/inspector';
import {createSandbox} from 'sinon';

describe('module:inspector', function() {
  let sandbox;

  beforeEach(function() {
    sandbox = createSandbox();
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
        it('should delegate to the constructor', function() {
          const ruleConfig = {};
          sandbox.spy(Reflect, 'construct');
          Inspector.create(ruleConfig);
          expect(Reflect.construct, 'to have a call satisfying', [
            Inspector,
            [ruleConfig]
          ]);
        });
      });

      describe('inspectReport()', function() {
        it(
          'should return an Observable which completes with results for a rule run against a report'
        );
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
