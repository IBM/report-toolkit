import _ from 'lodash';

export const kRuleId = Symbol('ruleId');
export const kRuleMeta = Symbol('ruleMeta');
export const kRuleMatch = Symbol('ruleMatch');

/**
 * @typedef {Object} RuleDefinition
 * @property {Object} meta - (schema for `meta` prop)
 * @property {Function} match - Async function which receives `Context` object and optional configuration
 */

/**
 * A Rule which can be matched against a Context
 */
export class Rule {
  /**
   *
   * @param {RuleDefinition} ruleDef
   */
  constructor(ruleDef) {
    ruleDef = Rule.applyDefaults(ruleDef);
    Object.assign(this, {
      [kRuleMatch]: ruleDef.match,
      [kRuleMeta]: ruleDef.meta,
      [kRuleId]: ruleDef.id
    });
  }

  /**
   *
   * @param {Context} context - Context object
   * @param {Object} [config] - Optional rule-specific config
   */
  async match(context, config = {}) {
    this[kRuleMatch].call(null, context, config);
  }
}

/**
 *
 * @param {RuleDefinition} ruleDef
 */
Rule.create = _.memoize(ruleDef => {
  const ctor = RULE_MODE_MAP.get(ruleDef.meta.mode);
  return Reflect.construct(ctor, [ruleDef]);
});

Rule.applyDefaults = _.memoize(ruleDef =>
  _.defaultsDeep({}, ruleDef, {meta: {type: 'info', mode: 'simple'}})
);

export class SimpleRule extends Rule {}

const RULE_MODE_MAP = new Map([['simple', SimpleRule]]);
