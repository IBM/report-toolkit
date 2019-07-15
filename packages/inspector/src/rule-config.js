import {_, createDebugger} from '@gnostic/common';

const debug = createDebugger('inspector', 'rule-config');
const ruleMap = new WeakMap();

export class RuleConfig {
  /**
   *
   * @param {Rule} rule
   * @param {Object} [rawConfig]
   * @throws GNOSTIC_ERR_INVALID_RULE_CONFIG
   */
  constructor(rule, rawConfig = {}) {
    ruleMap.set(this, rule);

    if (_.isArray(rawConfig)) {
      rawConfig = rawConfig[1];
    }
    if (_.isBoolean(rawConfig)) {
      rawConfig = {};
    }

    debug(`found raw config %O`, rawConfig);

    this.config = Object.freeze(this.validate(rawConfig));
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
   * @param {Object} rawConfig
   * @returns boolean
   */
  validate(rawConfig) {
    const config = this.rule.validate(rawConfig);
    debug(`config for rule ${this.id} OK:`, this.config);
    return config;
  }

  inspect(reports) {
    return this.rule.inspect({config: this.config, reports});
  }

  static create(rule, rawConfig) {
    return new RuleConfig(rule, rawConfig);
  }
}

export const createRuleConfig = _.curryN(2, _.flip(RuleConfig.create));
