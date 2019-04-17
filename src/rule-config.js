import {kRuleId} from './rule';

const ruleMap = new WeakMap();

export class RuleConfig {
  /**
   *
   * @param {Rule} rule
   * @param {Object} [config]
   */
  constructor(rule, config = {}) {
    ruleMap.set(this, rule);
    try {
      RuleConfig.validate(config);
    } catch (err) {
      // do something
    }
    this.config = Object.freeze(config);
    Object.defineProperty(this, 'id', {value: rule[kRuleId], enumerable: true});
  }

  /**
   * validate the config against meta.schema using ajv
   * @todo
   * @param {Object} config
   * @returns boolean
   */
  static validate(config) {
    // const rule = ruleMap.get(this);
    return true;
  }

  async inspect(ctx) {
    ruleMap.get(this).inspect(ctx, this.config);
  }

  static create(rule, config) {
    return new RuleConfig(rule, config);
  }
}
