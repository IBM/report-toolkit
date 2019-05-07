import {concatMapTo, finalize, takeUntil, tap} from 'rxjs/operators';

import {AsyncParser} from 'json2csv';
import {fromEvent} from 'rxjs';

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
