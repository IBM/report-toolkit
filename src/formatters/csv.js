import {concatMapTo, finalize, fromEvent, takeUntil, tap} from '../observable';

import {AsyncParser} from 'json2csv';

export const toCsv = (parserOpts = {}, streamOpts = {}) => {
  const parser = new AsyncParser(parserOpts, {...streamOpts, objectMode: true});
  return observable =>
    observable.pipe(
      finalize(() => {
        parser.input.push(null);
      }),
      tap(row => {
        parser.input.push(row);
      }),
      concatMapTo(fromEvent(parser.processor, 'data')),
      takeUntil(fromEvent(parser.processor, 'end'))
    );
};
