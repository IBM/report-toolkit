import _ from 'lodash/fp';

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
  }

  get id() {
    return ruleMap.get(this).id;
  }

  get severity() {
    return _.getOr('high', 'config.severity', this);
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
    return ruleMap.get(this).inspect(ctx, this.config);
  }

  static create(rule, config) {
    return Reflect.construct(RuleConfig, [rule, config]);
  }
}
