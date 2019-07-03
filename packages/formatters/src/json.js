import {map, toArray} from '@gnostic/common/src/observable.js';
import stringify from 'fast-safe-stringify';

export const toJson = ({pretty} = {}) => observable =>
  observable.pipe(
    toArray(),
    map(
      pretty
        ? values => stringify(values, null, 2)
        : values => stringify(values)
    )
  );
