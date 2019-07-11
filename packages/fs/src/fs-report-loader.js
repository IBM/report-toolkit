import {observable} from '@gnostic/common';
import {readFile as readFileNodeback} from 'fs';
const {bindNodeCallback, map, mergeMap, toObjectFromJSON} = observable;

const readFile = bindNodeCallback(readFileNodeback);

export const toObjectFromFilepath = () => observable =>
  observable.pipe(
    mergeMap(filepath =>
      readFile(filepath, 'utf8').pipe(
        toObjectFromJSON(),
        map(rawReport => ({filepath, rawReport}))
      )
    )
  );
