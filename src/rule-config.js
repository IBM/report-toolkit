import _ from 'lodash/fp';
import {map} from 'rxjs/operators';

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

  get rule() {
    return ruleMap.get(this);
  }

  get id() {
    return this.rule.id;
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

  inspect(contexts) {
    return this.rule.inspect({contexts, config: this.config});
  }

  static create(rule, rawConfig) {
    return new RuleConfig(rule, rawConfig);
  }
}

export const loadRuleConfig = config => rules =>
  rules.pipe(map(rule => RuleConfig.create(rule, config[rule.id])));
