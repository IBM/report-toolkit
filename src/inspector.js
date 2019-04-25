import {Observable, from} from 'rxjs';

import {RuleConfig} from './rule-config';
import _ from 'lodash/fp';
import {mergeMap} from 'rxjs/operators';

const configMap = new WeakMap();

/**
 * Object output by inspection
 * @typedef {Object} RuleResult
 * @property {string} message - Info/error/warning message from rule
 * @property {any?} data - Any extra data
 */

/**
 * Given a value returned (fulfilled) by a Rule's `inspect()` function,
 * determine how to emit it from the `Observer`, if at all.
 * @param {Observer} observer
 * @param {string} id
 * @param {string|string[]|RuleResult|RuleResult[]} [result] Whatever `inspect()` returned
 */
const processResult = (observer, id, result) => {
  if (result) {
    (function process(result) {
      if (_.isArray(result)) {
        return result.forEach(process);
      }
      const nextValue = {id};
      if (_.isObject(result)) {
        return observer.next(
          _.defaults(
            {message: '(no description)', data: {}},
            _.assign(nextValue, result)
          )
        );
      }
      if (_.isString(result)) {
        observer.next(_.defaults({message: result, data: {}}, nextValue));
      }
    })(result);
  }
};

/**
 * Runs a rule against reports.
 */
export class Inspector {
  /**
   *
   * @param {RuleConfig} config
   */
  constructor(config) {
    configMap.set(this, config);
  }

  inspect(...reports) {
    return from(reports).pipe(
      mergeMap(
        report =>
          new Observable(async observer => {
            const {ruleConfig} = this;
            const {id} = ruleConfig;
            const ctx = _.create(
              _.assign(
                {
                  report(message, data = {}) {
                    observer.next({id, message, data});
                    return this;
                  }
                },
                report
              )
            );
            try {
              const result = await ruleConfig.inspect(ctx);
              processResult(observer, id, result);
            } catch (err) {
              observer.error(err);
            }
            observer.complete();
          })
      )
    );
  }

  /**
   * Creates a configured Inspector
   * @param {RuleConfig} config
   * @returns {Inspector}
   */
  static create(config) {
    return Reflect.construct(Inspector, [config]);
  }

  get ruleConfig() {
    return configMap.get(this);
  }

  /**
   * Inspect a report, given a list of loaded `Rule`s and
   * rule-specific configurations.  Associates the configurations with
   * rules by ID.
   * @param {Report} report - Parsed JSON report
   * @param {Rule} rule - Rule
   * @param {Object|any[]|string} [rawConfig] - Rule-specific configuration
   * @todo accept multiple reports
   * @returns {Observable<RuleResult>} Observable of `{message, data}`
   * reports, generated from rule implementations. Could be empty.
   */
  static inspectReport(report, rule, rawConfig = {}) {
    // XXX this is not right.
    if (Array.isArray(rawConfig)) {
      rawConfig = _.find(_.isObject, rawConfig) || {};
    }
    return Inspector.create(RuleConfig.create(rule, rawConfig)).inspect(report);
  }
}
