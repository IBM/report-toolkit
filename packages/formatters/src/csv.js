import {_, observable} from '@gnostic/common';
import {AsyncParser} from 'json2csv';
const {concatMapTo, finalize, fromEvent, map, takeUntil, tap} = observable;

export const toCsv = (parserOpts = {}, streamOpts = {}) => observable => {
  const parser = new AsyncParser(parserOpts, {...streamOpts, objectMode: true});
  return observable.pipe(
    finalize(() => {
      parser.input.push(null);
    }),
    tap(row => {
      parser.input.push(row);
    }),
    concatMapTo(fromEvent(parser.processor, 'data')),
    takeUntil(fromEvent(parser.processor, 'end')),
    map(_.trimEnd)
  );
};
