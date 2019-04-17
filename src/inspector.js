import {Observable, from} from 'rxjs';

import {RuleConfig} from './rule-config';
import _ from 'lodash';
import {mergeMap} from 'rxjs/operators';

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
    this.config = config;
  }

  inspect(...reports) {
    return from(reports).pipe(
      mergeMap(
        report =>
          new Observable(async observer => {
            const id = this.config.id;
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
              await this.config.inspect(ctx);
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
 * @param {Object|any[]|string} [config] - Rule-specific configuration
 * @returns {Observable<Report>} Observable of `{message, data}`
 * reports, generated from rule implementations. Could be empty.
 */
export const inspect = (report, rule, config = {}) => {
  if (Array.isArray(config)) {
    config = _.find(config, _.isObject) || {};
  }
  const inspector = Inspector.create(RuleConfig.create(rule, config));
  return inspector.inspect(report);
};
