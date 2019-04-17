import {Observable, from} from 'rxjs';

import {RuleConfig} from './rule-config';
import _ from 'lodash';
import {mergeMap} from 'rxjs/operators';

const configMap = new WeakMap();

/**
 * Object output by inspection
 * @typedef {Object} Report
 * @property {string} message - Info/error/warning message from rule
 * @property {any?} data - Any extra data
 */

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
            const config = configMap.get(this);
            const {id} = config;
            const ctx = _.create(
              {
                report(message, data = {}) {
                  observer.next({id, message, data});
                  return this;
                }
              },
              report
            );
            try {
              await config.inspect(ctx);
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
    return new Inspector(config);
  }
}

/**
 * Inspect one or more reports, given a list of loaded `Rule`s and
 * rule-specific configurations.  Associates the configurations with
 * rules by ID.
 * @param {Report} report - Parsed JSON report
 * @param {Rule} rule - Rule
 * @param {Object|any[]|string} [rawConfig] - Rule-specific configuration
 * @returns {Observable<Report>} Observable of `{message, data}`
 * reports, generated from rule implementations. Could be empty.
 */
export const inspect = (report, rule, rawConfig = {}) => {
  if (Array.isArray(rawConfig)) {
    rawConfig = _.find(rawConfig, _.isObject) || {};
  }
  const inspector = Inspector.create(RuleConfig.create(rule, rawConfig));
  return inspector.inspect(report);
};
