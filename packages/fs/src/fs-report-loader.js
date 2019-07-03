import {
  bindNodeCallback,
  map,
  mergeMap,
  toObjectFromJSON
} from '@gnostic/common/src/observable.js';
import fs from 'fs';

const readFile = bindNodeCallback(fs.readFile);

export const toObjectFromFilepath = () => observable =>
  observable.pipe(
    mergeMap(filepath =>
      readFile(filepath, 'utf8').pipe(
        toObjectFromJSON(),
        map(rawReport => ({filepath, rawReport}))
      )
    )
  );
