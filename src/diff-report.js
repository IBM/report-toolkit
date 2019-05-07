import {Observable} from 'rxjs';
import _ from 'lodash/fp';
import {createPatch} from 'rfc6902';
import ptr from 'json-ptr';

/**
 * snooze-inducing paths to omit from the diff
 */
export const DIFF_OMIT_PATHS = Object.freeze(
  new Set([
    '/header/filename',
    '/header/dumpEventTime',
    '/header/dumpEventTimeStamp'
  ])
);

export const DIFF_DEFAULT_PROPERTIES = Object.freeze([
  'environmentVariables',
  'header',
  'userLimits',
  'sharedObjects'
]);

export const pathToProperty = path => path.split('/')[1];

export const diffReports = (reportA, reportB) =>
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
          const nextPathParts = patchObj.path.split('/');
          const nextPathIdx = Number(nextPathParts.pop()) + offset;
          const nextPath = nextPathParts.concat(nextPathIdx).join('/');
          oldValue = ptr.get(reportA, nextPath);
          offset++;
          nextValue = {...patchObj, oldValue, path: nextPath};
        } else {
          // there's no old value to look up for 'add' operations.
          if (patchObj.op === 'add') {
            nextValue = patchObj;
          } else {
            oldValue = ptr.get(reportA, patchObj.path);
            nextValue = {...patchObj, oldValue};
          }
          offset = 1;
        }
        lastPatchObj = patchObj;
        observer.next(nextValue);
      }, _.filter(patchObj => !DIFF_OMIT_PATHS.has(patchObj.path), patch));
    } catch (err) {
      observer.error(err);
    }
    observer.complete();
  });
