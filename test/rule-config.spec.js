import {RuleConfig} from '../src/rule-config';
import {createSandbox} from 'sinon';

describe('module:rule-config', function() {
  let sandbox;

  beforeEach(function() {
    sandbox = createSandbox();
  });

  afterEach(function() {
    sandbox.restore();
  });

  describe('RuleConfig', function() {
    describe('constructor', function() {
      it('should associate a Rule with a config', function() {
        const config = {};
        const rule = {id: 'foo'};
        expect(
          new RuleConfig(rule, config),
          'to have property',
          'config',
          config
        );
      });
    });

    describe('static method', function() {
      describe('create()', function() {
        it('should delegate to the constructor');
      });
    });

    describe('instance method', function() {
      describe('inspect()', function() {
        it('should call the "inspect" method of its Rule');
      });

      describe('validate()', function() {
        it('should validate the config against its Rule');
      });
    });
  });
});
