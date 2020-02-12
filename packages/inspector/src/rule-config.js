import {_, createDebugger} from '@report-toolkit/common';

const debug = createDebugger('inspector', 'rule-config');
const ruleMap = new WeakMap();

export class RuleConfig {
  /**
   *
   * @param {import('./rule').Rule} rule
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

    if (!_.isEmpty(rawConfig)) {
      debug('found raw config %O', rawConfig);
    }

    this.config = this.validate(rawConfig);
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

  /**
   *
   * @param {import('@report-toolkit/common/src/observable').Observable<import('@report-toolkit/common/src/report').Report>} reports
   * @returns {import('@report-toolkit/common/src/observable').Observable<import('./message').Message>}
   */
  inspect(reports) {
    return this.rule.inspect({config: this.config, reports});
  }

  static create(rule, rawConfig) {
    return Object.freeze(new RuleConfig(rule, rawConfig));
  }
}

/**
 * @type {(rawConfig: object, rule: import('./rule').Rule) => RuleConfig}
 */
export const createRuleConfig = _.curryN(2, _.flip(RuleConfig.create));
