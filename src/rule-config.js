import _ from 'lodash/fp';

const ruleMap = new WeakMap();

export class RuleConfig {
  /**
   *
   * @param {Rule} rule
   * @param {Object} [rawConfig]
   */
  constructor(rule, rawConfig = {}) {
    ruleMap.set(this, rule);
    try {
      RuleConfig.validate(rawConfig);
    } catch (err) {
      // do something
    }
    this.config = Object.freeze(rawConfig);
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

  inspect(context, stream) {
    return ruleMap.get(this).inspect({context, stream, config: this.config});
  }

  static create(rule, rawConfig) {
    return new RuleConfig(rule, rawConfig);
  }
}
