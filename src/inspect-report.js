import {concat, from} from 'rxjs';
import {map, mergeMap} from 'rxjs/operators';

import {Rule} from './rule';
import {RuleConfig} from './rule-config';
import _ from 'lodash/fp';
import {pipeIf} from '../.history/src/operators_20190514142208';

const ruleConfigMap = new WeakMap();

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
    ruleConfigMap.set(this, config);
  }

  /**
   * @todo add helper to format output better
   * @param  {...Report} reports
   * @returns {Observable<RuleReport>}
   */
  inspect(...reports) {
    const contexts = _.map(report => report.createContext(), reports);
    return from(contexts).pipe(
      mergeMap(context => {
        const basicInfo = {
          filepath: context.filepath,
          id: this.ruleConfig.id
        };
        const formatResult = (message, data) => ({
          message: String(message).trim(),
          data,
          ...basicInfo
        });

        return concat(
          this.ruleConfig.inspect(context, from(contexts)),
          context.readQueue()
        ).pipe(
          pipeIf(
            _.has('message'),
            map(({message, data}) => formatResult(message, data))
          ),
          pipeIf(_.isString, map(_.unary(formatResult))),
          pipeIf(
            _.negate(_.isObject),
            map(result => {
              throw new Error(`Invalid result: ${result}`);
            })
          )
        );
      })
    );
  }

  get ruleConfig() {
    return ruleConfigMap.get(this);
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
