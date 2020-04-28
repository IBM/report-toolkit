import {_} from '@report-toolkit/common';

import {RuleConfig} from '../src/rule-config.js';

describe('@report-toolkit/inspector:rule-config', function () {
  let sandbox;

  beforeEach(function () {
    sandbox = sinon.createSandbox();
  });

  afterEach(function () {
    sandbox.restore();
  });

  describe('RuleConfig', function () {
    describe('constructor', function () {
      it('should associate a Rule with a config', function () {
        const config = {};
        const rule = {id: 'foo', validate: _.identity};
        expect(
          new RuleConfig(rule, config),
          'to have property',
          'config',
          config
        );
      });

      it('should validate the config against the Rule schema', function () {
        const config = {};
        const rule = {id: 'foo', validate: sandbox.spy()};
        // eslint-disable-next-line no-new
        new RuleConfig(rule, config);
        expect(rule.validate, 'to have a call satisfying', config);
      });
    });

    describe('static method', function () {
      describe('create()', function () {
        it('should delegate to the constructor');
      });
    });

    describe('instance method', function () {
      describe('inspect()', function () {
        it('should call the "inspect" method of its Rule');
      });

      describe('validate()', function () {
        it('should validate the config against its Rule');
      });
    });
  });
});
