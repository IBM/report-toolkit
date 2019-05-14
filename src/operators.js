import {from, iif, of} from 'rxjs';
import {mergeMap, toArray} from 'rxjs/operators';

import _ from 'lodash/fp';

/**
 * Pipes source Observable to one or more Operators if the predicate is truthy.
 * If falsy, just returns the source Observable.
 * @param {Function|any} predicate - If a function, evaluated with the value from the source Observable. Anything else is evaluated when called.
 * @param  {...Operator} operators - One or more RxJS operators to pipe to
 * @returns {Observable}
 */
export const pipeIf = (predicate, ...operators) => {
  predicate = _.isFunction(predicate) ? predicate : _.constant(predicate);
  return observable =>
    observable.pipe(
      mergeMap(v => (predicate(v) ? of(v).pipe(...operators) : of(v)))
    );
};

/**
 * Essentially wraps `_.orderBy()`
 * @see https://lodash.com/docs/4.17.11#orderBy
 * @param {string|string[]|Function|Function[]|Object|Object[]} iteratee - Any supported LoDash iteratee or list thereof
 * @param {string|string[]} [direction=asc] - Order in which to sort (`asc` or `desc`) or list thereof, corresponding to each item in `iteratee` (if `iteratee` is a list)
 * @returns {Observable}
 */
export const sort = (iteratee = _.identity, direction = 'asc') => observable =>
  observable.pipe(
    toArray(),
    mergeMap(_.orderBy(iteratee, direction))
  );

/**
 * NOT AN OPERATOR. If parameter is an Array, return an Observable created from the Array; otherwise return an Observable emitting only the parameter.
 * @param {any|any[]} value - Either a value or an Array of values.
 * @returns {Observable<any>}
 */
export const fromArray = value =>
  iif(() => _.isArray(value), from(value), of(value));
