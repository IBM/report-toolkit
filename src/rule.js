import _ from 'lodash/fp';

export const kRuleId = Symbol('ruleId');
export const kRuleMeta = Symbol('ruleMeta');
export const kRuleInspect = Symbol('ruleInspect');
export const kRuleFilepath = Symbol('ruleFilepath');

/**
 * @typedef {Object} RuleDefinition
 * @property {Object} meta - (schema for `meta` prop)
 * @property {Function} inspect - Async function which receives `Context` object and optional configuration
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
      [kRuleInspect]: ruleDef.inspect,
      [kRuleMeta]: ruleDef.meta,
      [kRuleId]: ruleDef.id,
      [kRuleFilepath]: ruleDef.filepath
    });
  }

  get id() {
    return this[kRuleId];
  }

  get meta() {
    return this[kRuleMeta];
  }

  get filepath() {
    return this[kRuleFilepath];
  }

  /**
   *
   * @param {Context} context - Context object
   * @param {Object} [config] - Optional rule-specific config
   */
  async inspect(context, config = {}) {
    return this[kRuleInspect].call(null, context, config);
  }

  static applyDefaults(ruleDef) {
    return _.defaultsDeep(
      {
        meta: {type: 'info', mode: 'simple', docs: {}},
        inspect: () => {
          throw new Error(`Rule "${ruleDef.id}" has no implementation!`);
        }
      },
      ruleDef
    );
  }
}

/**
 *
 * @param {RuleDefinition} ruleDef
 */
Rule.create = _.memoize(ruleDef => {
  const ctor = RULE_MODE_MAP.get(_.getOr('simple', 'meta.mode', ruleDef));
  return Reflect.construct(ctor, [ruleDef]);
});

export class SimpleRule extends Rule {}

const RULE_MODE_MAP = new Map([['simple', SimpleRule]]);
