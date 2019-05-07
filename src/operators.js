import _ from 'lodash/fp';
import {mergeMap} from 'rxjs/operators';
import {of} from 'rxjs';

export const pipeIf = (predicate, ...pipes) => {
  if (!_.isFunction(predicate)) {
    predicate = _.constant(predicate);
  }
  return observable =>
    observable.pipe(
      mergeMap(v => (predicate(v) ? of(v).pipe(...pipes) : of(v)))
    );
};
