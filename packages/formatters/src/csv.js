import {_} from '@gnostic/common';
import {
  concatMapTo,
  finalize,
  fromEvent,
  map,
  takeUntil,
  tap
} from '@gnostic/common/src/observable.js';
import {AsyncParser} from 'json2csv';

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
