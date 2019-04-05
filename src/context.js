import {Observable} from 'rxjs';
import _ from 'lodash';

export class Context {
  constructor(rule, report) {
    Object.defineProperties(this, {
      _rule: {value: rule},
      _report: {value: report}
    });
  }

  toJSON() {
    return this._report;
  }

  match() {
    return new Observable(async observer => {
      const ctx = _.create(
        Object.getPrototypeOf(this),
        Object.assign({}, this._report, {
          report(message, data = {}) {
            observer.next({message, data});
          }
        })
      );

      await this._rule.match(ctx);
      observer.complete();
    });
  }

  /**
   *
   * @param {Rule} rule
   * @param {Object} report
   * @returns {Context}
   */
  static create(rule, report) {
    return new Context(rule, report);
  }
}
