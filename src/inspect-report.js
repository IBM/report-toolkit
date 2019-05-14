import {Observable, from} from 'rxjs';

import {Rule} from './rule';
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

  /**
   * @todo add helper to format output better
   * @param  {...Report} reports
   * @returns {Observable<RuleReport>}
   */
  inspect(...reports) {
    return from(reports).pipe(
      mergeMap(
        report =>
          new Observable(async observer => {
            const formatResult = (message, data) => ({
              message: String(message).trim(),
              data,
              ...basicInfo
            });
            const {ruleConfig} = this;
            const {id} = ruleConfig;
            const basicInfo = {filepath: report.filepath, id};
            const reporter = function() {
              observer.next(formatResult(...arguments));
              return this;
            };
            const ctx = Proxy.revocable(report, {
              get(target, prop) {
                if (prop === 'report') {
                  return reporter;
                } else if (prop === 'filepath') {
                  return report.filepath;
                }
                return Reflect.get(...arguments);
              }
            });

            from(ruleConfig.inspect(ctx.proxy)).subscribe({
              next: result => {
                if (_.isString(result)) {
                  observer.next(formatResult(result));
                } else if (_.isObject(result)) {
                  observer.next(formatResult(result.message, result.data));
                } else if (!_.isUndefined(result)) {
                  observer.error(new Error(`Invalid result: ${result}`));
                }
              },
              error: err => {
                observer.error(err);
              },
              complete: () => {
                ctx.revoke();
                observer.complete();
              }
            });
          })
      )
    );
  }

  get ruleConfig() {
    return configMap.get(this);
  }
}

/**
 * Creates a configured Inspector
 * @param {Object|any[]|string} rawConfig - Rule-specific configuration; unused if `rule` is a `RuleConfig`
 * @param {Rule|RuleConfig} ruleConfig - Rule or RuleConfig
 * @returns {Inspector}
 */
Inspector.create = _.curry((rawConfig, ruleConfig) => {
  if (ruleConfig instanceof Rule) {
    // XXX this is not right.
    if (_.isArray(rawConfig)) {
      rawConfig = _.find(_.isObject, rawConfig) || {};
    }
    ruleConfig = RuleConfig.create(ruleConfig, rawConfig);
  }

  return new Inspector(ruleConfig);
});
