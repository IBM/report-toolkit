import {
  concatMap,
  filter,
  first,
  map,
  mergeMap,
  pluck,
  share,
  takeUntil
} from 'rxjs/operators';

import {Inspector} from '../../src/inspect-report';
import {Report} from '../../src/report';
import _ from 'lodash/fp';
import childProcess from 'child_process';
import {fromEvent} from 'rxjs';
import {loadReport} from '../../src/load-report';
import {loadRuleFromFilepath} from '../../src/rule-loader';
import {redact} from '../../src/redact';

export const createInspect = async (ruleFilepath, config = {}) => {
  const inspector = Inspector.create(
    config,
    await loadRuleFromFilepath(require.resolve(ruleFilepath))
  );
  return filepath =>
    loadReport(require.resolve(filepath)).pipe(
      map(Report.createFromFile(filepath)),
      mergeMap(report => inspector.inspect(report))
    );
};

const fromIPC = (proc, event = 'message') =>
  fromEvent(proc, event).pipe(
    pluck(0),
    takeUntil(fromEvent(proc, 'exit'))
  );

export const sample = (interval = 500, count = 5) => {
  const proc = childProcess.fork(require.resolve('./sampler'), {
    execArgv: ['--experimental-report', '--require', 'esm', '--no-warnings'],
    stdio: 'ignore'
  });

  const ipc = fromIPC(proc);

  const reports = ipc.pipe(
    filter(
      _.pipe(
        _.get('title'),
        _.eq('report')
      )
    ),
    pluck('report'),
    map(redact),
    share()
  );

  return ipc.pipe(
    filter(
      _.pipe(
        _.get('title'),
        _.eq('ready')
      )
    ),
    first(),
    concatMap(() => {
      proc.send({title: 'start', payload: {interval, count}});
      return reports;
    })
  );
};
