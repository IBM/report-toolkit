import {Observable, from} from 'rxjs';
import {map, mergeMap} from 'rxjs/operators';

import _ from 'lodash';

export class RuleMatcher {
  /**
   *
   * @param {RuleConfig[]} configs
   */
  constructor(configs) {
    this.configs = configs;
  }

  match(...reports) {
    return from(reports).pipe(
      mergeMap(report =>
        from(this.configs).pipe(map(config => [config, report]))
      ),
      mergeMap(
        ([ruleConfig, report]) =>
          new Observable(async observer => {
            const ctx = _.create(
              {
                report(message, data = {}) {
                  observer.next({message, data});
                  return this;
                }
              },
              report
            );
            try {
              await ruleConfig.match(ctx);
            } catch (err) {
              observer.error(err);
            }
            observer.complete();
          })
      )
    );
  }

  /**
   * Creates a RuleMatcher with a set of RuleConfigs
   * @param {...RuleConfig|RuleConfig[]} configs
   * @returns {RuleMatcher}
   */
  static create(...configs) {
    if (Array.isArray(configs[0])) {
      configs = configs.shift();
    }
    return new RuleMatcher(configs);
  }
}
