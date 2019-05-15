import {fromEvent, iif, interval, of} from 'rxjs';
import {map, pluck, switchMap, takeWhile, tap} from 'rxjs/operators';

const emitReport = () => {
  const report = process.report.getReport();
  process.send({title: 'report', report});
};

fromEvent(process, 'message')
  .pipe(
    pluck(0),
    switchMap(({title = '', payload = {}} = {}) =>
      iif(
        () => title === 'start',
        interval(payload.interval).pipe(map(count => count < payload.count)),
        of(false).pipe(tap(() => console.error('aborting')))
      )
    ),
    takeWhile(v => v)
  )
  .subscribe(emitReport);

process.send({title: 'ready'});
