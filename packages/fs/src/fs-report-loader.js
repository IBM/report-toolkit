import {createDebugPipe, observable} from '@report-toolkit/common';
import {readFile as readFileNodeback} from 'fs';
const {bindNodeCallback, map, mergeMap, toObjectFromJSON} = observable;

const readFile = bindNodeCallback(readFileNodeback);

const debug = createDebugPipe('fs', 'report-loader');

export const toObjectFromFilepath = () => observable =>
  observable.pipe(
    mergeMap(filepath =>
      readFile(filepath, 'utf8').pipe(
        toObjectFromJSON(),
        map(rawReport => ({filepath, rawReport})),
        debug(({filepath}) => `parsed raw report from ${filepath}`)
      )
    )
  );
