import {_, constants, createDebugger, observable} from '@report-toolkit/common';
import {JsonPointer} from 'json-ptr';
import {createPatch} from 'rfc6902';
const {Observable, filter, mergeMap, pipeIf, map} = observable;

const {DEFAULT_DIFF_EXCLUDE, DEFAULT_DIFF_INCLUDE} = constants;
const debug = createDebugger('diff');

/**
 * Given an array of Lodash-style keypaths, convert each to an RFC6902-style path.
 * @param {string[]} value - Keypaths
 * @returns {string[]} Paths
 */
const formatPaths = _.map(
  keypath => '/' + keypath.replace(/\[(\d+)\]/g, '.$1').replace(/\./g, '/')
);

/**
 * @param {DiffOptions} [opts]
 * @returns {import('rxjs').OperatorFunction<import('@report-toolkit/common/src/report').Report[],DiffResult>}
 */
export function diff(opts = {}) {
  const {
    includeProperties = DEFAULT_DIFF_INCLUDE,
    excludeProperties = DEFAULT_DIFF_EXCLUDE,
    includeAll = false
  } = opts;

  let includePaths = [];
  let excludePaths = [];

  if (!includeAll) {
    includePaths = formatPaths(includeProperties);
    excludePaths = formatPaths(excludeProperties);
    // since exclude is intended to operate on post-included paths, we need to
    // remove any identical props from the former.
    excludePaths = _.omit(
      _.intersection(includePaths, excludePaths),
      excludePaths
    );

    debug('including paths matching %O', includePaths);
    debug('excluding paths matching %O', excludePaths);
  } else {
    debug('running complete diff');
  }

  return observable =>
    observable.pipe(
      mergeMap(
        ([reportA, reportB]) =>
          new Observable(observer => {
            try {
              const patch = createPatch(reportA, reportB);
              let lastPatchObj;
              let offset = 1;
              _.forEach(patchObj => {
                let oldValue;
                let nextValue;
                // special case for items removed from an array.
                // RFC6902 specifies that the patch is *repeated* for each item removed
                // in sequence; if there is a slice of 3 items removed, then the patch object
                // is repeated 3 times with the same path. to get the old value--in other words,
                // *what* was removed--we must increment the index at the end of the path
                // and use that to retrieve the value from reportA.
                if (
                  lastPatchObj &&
                  patchObj.op === 'remove' &&
                  patchObj.path === lastPatchObj.path &&
                  patchObj.op === lastPatchObj.op
                ) {
                  /**
                   * @type {Array<number|string>}
                   */
                  const nextPathParts = patchObj.path.split('/');
                  const nextPathIdx = Number(nextPathParts.pop()) + offset;
                  const nextPath = nextPathParts.concat(nextPathIdx).join('/');
                  oldValue = JsonPointer.get(reportA, nextPath);
                  offset++;
                  nextValue = {...patchObj, oldValue, path: nextPath};
                } else {
                  // there's no old value to look up for 'add' operations.
                  if (patchObj.op === 'add') {
                    nextValue = patchObj;
                  } else {
                    oldValue = JsonPointer.get(reportA, patchObj.path);
                    nextValue = {...patchObj, oldValue};
                  }
                  offset = 1;
                }
                lastPatchObj = patchObj;
                observer.next(nextValue);
              }, patch);
            } catch (err) {
              observer.error(err);
            }
            observer.complete();
          })
      ),
      pipeIf(
        !includeAll && !_.isEmpty(includeProperties),
        filter(({path}) => _.some(_.startsWith(_.__, path), includePaths))
      ),
      pipeIf(
        !includeAll && !_.isEmpty(excludeProperties),
        filter(({path}) => !_.some(_.startsWith(_.__, path), excludePaths))
      ),
      map(({path: field, op, value, oldValue}) => ({
        field,
        op,
        value,
        oldValue
      }))
    );
}

/**
 * Options for {@link diff}.
 * @typedef {{includeProperties?: string[], excludeProperties?: string[], includeAll?: boolean}} DiffOptions
 */

/**
 * A single difference between two reports.
 * @typedef {object} DiffResult
 * @property {"add"|"remove"|"replace"} op - Operation
 * @property {string} field - [RFC6902](https://tools.ietf.org/html/rfc6902)-style keypath
 * @property {string|boolean|number|null?} value - Value from second report (where applicable)
 * @property {string|boolean|number|null?} oldValue - Value from first report (where applicable)
 */
