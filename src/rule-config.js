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

  async match(ctx) {
    ruleMap.get(this).match(ctx, this.config);
  }

  static create(rule, config = {}) {
    return new RuleConfig(rule, config);
  }
}
