import {observable} from '@gnostic/common';
import stringify from 'fast-safe-stringify';

const {map, toArray} = observable;

export const toJson = ({pretty} = {}) => observable =>
  observable.pipe(
    toArray(),
    map(
      pretty
        ? values => stringify(values, null, 2)
        : values => stringify(values)
    )
  );
