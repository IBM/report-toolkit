import * as gnosticOperators from './observable';
import * as operators from 'rxjs/operators';
import * as rxjs from 'rxjs';

import _ from 'lodash/fp';

export const kRuleId = Symbol('ruleId');
export const kRuleMeta = Symbol('ruleMeta');
export const kRuleInspect = Symbol('ruleInspect');
export const kRuleFilepath = Symbol('ruleFilepath');

const {iif, concat, isObservable, throwError} = rxjs;
const {fromArray} = gnosticOperators;
const {mergeMap, filter, map} = operators;

const util = Object.freeze({
  ...operators,
  ...rxjs,
  ...gnosticOperators
});

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

  get description() {
    return _.get('docs.description', this[kRuleMeta]);
  }

  get url() {
    return _.get('docs.url', this[kRuleMeta]);
  }

  get filepath() {
    return this[kRuleFilepath];
  }

  get meta() {
    return this[kRuleMeta];
  }

  inspect(context, config = {}) {
    return throwError(new Error('Not implemented'));
  }

  static formatMessage(message) {
    return String(message).trim();
  }

  static applyDefaults(ruleDef) {
    return _.defaultsDeep(
      {
        meta: {type: 'info', mode: 'simple', docs: {}},
        inspect: () => {
          throw new Error(
            `Rule "${ruleDef.id}" has no "inspect" implementation`
          );
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
  if (!ctor) {
    throw new Error(`Unknown rule mode ${_.get('meta.mode', ruleDef)}`);
  }
  return Reflect.construct(ctor, [ruleDef]);
});

export class SimpleRule extends Rule {
  /**
   *
   * @param {Observable<Context>} contexts - Context objects
   * @param {Object} [config] - Optional rule-specific config
   * @returns {Observable}
   */
  inspect({contexts, config = {}}) {
    return contexts.pipe(
      mergeMap(context =>
        concat(
          fromArray(
            this[kRuleInspect].call(null, {context, config, util}) || []
          ),
          context.flush()
        ).pipe(
          filter(Boolean),
          map(message =>
            this.formatResult({
              filepath: context.filepath,
              message
            })
          )
        )
      )
    );
  }

  formatResult({filepath, message, data} = {}) {
    if (_.isUndefined(message)) {
      return;
    }
    const info = {
      filepath,
      id: this.id
    };

    if (_.has('message', message)) {
      data = message.data;
      message = message.message;
    }

    return {message: Rule.formatMessage(message), data, ...info};
  }
}

export class TemporalRule extends Rule {
  /**
   *
   * @param {Observable<Context>} contexts - Context object
   * @param {Object} [config] - Optional rule-specific config
   * @returns {Observable}
   */
  inspect({contexts: stream, config = {}}) {
    const result = this[kRuleInspect].call(null, {
      stream,
      util,
      config
    });

    return iif(() => isObservable(result), result, fromArray(result)).pipe(
      map(message => this.formatResult({message}))
    );
  }

  formatResult({message, data} = {}) {
    if (_.isUndefined(message)) {
      return;
    }
    const info = {
      id: this.id,
      filepath: '(multiple files)'
    };
    if (_.has('message', message)) {
      return {
        message: String(message.message).trim(),
        data: message.data,
        ...info
      };
    }

    return {message: String(message).trim(), data, ...info};
  }
}

const RULE_MODE_MAP = new Map([
  ['simple', SimpleRule],
  ['temporal', TemporalRule]
]);
