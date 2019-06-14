import _ from 'lodash/fp';
import {createDebugger} from './debug';
import {map} from './observable';

const debug = createDebugger(module);
const ruleMap = new WeakMap();

export class RuleConfig {
  /**
   *
   * @param {Rule} rule
   * @param {Object} [rawConfig]
   */
  constructor(rule, rawConfig = {}) {
    ruleMap.set(this, rule);

    if (_.isArray(rawConfig)) {
      rawConfig = rawConfig[1];
    }
    if (_.isBoolean(rawConfig)) {
      rawConfig = {};
    }

    this.config = rawConfig;
    this.validate();
    // IMPORTANT: validate() *mutates* the config, so we must freeze AFTER
    Object.freeze(rawConfig);
  }

  get rule() {
    return ruleMap.get(this);
  }

  get id() {
    return this.rule.id;
  }

  /**
   * validate the config against meta.schema using ajv
   * @todo
   * @param {Object} config
   * @returns boolean
   */
  validate() {
    this.rule.validate(this.config);
    debug(`config for rule ${this.id} OK:`, this.config);
  }

  inspect(contexts) {
    return this.rule.inspect({contexts, config: this.config});
  }

  static create(rule, rawConfig) {
    return new RuleConfig(rule, rawConfig);
  }
}

export const loadRuleConfig = config => rules =>
  rules.pipe(map(rule => RuleConfig.create(rule, config.rules[rule.id])));
