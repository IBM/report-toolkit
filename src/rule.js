import _ from 'lodash';

const rules = new WeakMap();

export class RuleEntry {
  constructor(ruleEntry) {
    Object.assign(this, ruleEntry);
  }

  static create(ruleEntry) {
    return new RuleEntry(ruleEntry);
  }
}

export class Rule {
  constructor(rule, config = {}) {
    const {match, meta} = rule;
    Object.defineProperties(this, {
      _match: {value: match},
      _meta: {value: meta},
      _config: {value: config}
    });
  }

  validate() {
    // validate the config against meta.schema using ajv
  }

  async match(context) {
    this._match(context, this.config);
  }

  static create(ruleEntry) {
    const ruleDef = Rule.applyDefaults(require(ruleEntry.filepath));
    const ctor = RULE_MODE_MAP.get(ruleDef.meta.mode);
    return Reflect.construct(ctor, [ruleDef, ruleEntry.config]);
  }
}

Rule.applyDefaults = _.memoize(ruleDef =>
  _.defaultsDeep({}, ruleDef, {meta: {type: 'info', mode: 'simple'}})
);

export class SimpleRule extends Rule {}

const RULE_MODE_MAP = new Map([['simple', SimpleRule]]);

/**
 * Get a (cached) `Rule` from a `RuleEntry`
 * @param {RuleEntry} ruleEntry
 * @returns {Rule}
 */
export const getRule = ruleEntry => {
  if (!rules.has(ruleEntry)) {
    rules.set(ruleEntry, Rule.create(ruleEntry));
  }
  return rules.get(ruleEntry);
};
