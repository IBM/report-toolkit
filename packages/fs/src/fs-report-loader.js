import {createDebugPipe, observable} from '@report-toolkit/common';
import {readFile as readFileNodeback} from 'fs';
const {bindNodeCallback, map, mergeMap, toObjectFromJSON} = observable;

const debug = createDebugPipe('fs', 'report-loader');

/**
 * @type {(filepath: string, encoding:string)=>Observable<any>}
 */
const readFile = bindNodeCallback(readFileNodeback);

/**
 * @returns {import('rxjs').OperatorFunction<string,object>}
 */
export function toObjectFromFilepath() {
  return observable =>
    observable.pipe(
      mergeMap(
        /**
         * @param {string} filepath
         */
        filepath =>
          readFile(filepath, 'utf8').pipe(
            toObjectFromJSON(),
            map(rawReport => ({filepath, rawReport})),
            debug(({filepath}) => `loaded report at filepath ${filepath}`)
          )
      )
    );
}

/**
 * @template T
 * @typedef {import('@report-toolkit/common/src/observable').Observable<T>} Observable
 */
