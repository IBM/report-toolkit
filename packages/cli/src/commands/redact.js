import {_, createDebugger, observable} from '@report-toolkit/common';
import {observable as api} from '@report-toolkit/core';

import {toOutput} from '../console-utils.js';
import {fromFilepathsToReports, mergeCommandConfig, OPTIONS} from './common.js';
const {transform, fromTransformerChain} = api;
const {of, iif, concatMap} = observable;
const debug = createDebugger('cli', 'commands', 'redact');
const DEFAULT_TRANSFORMER = 'json';

export const command = 'redact <file..>';

export const desc = 'Redact secrets from report file(s)';

export const builder = yargs =>
  yargs
    .positional('file', {
      coerce: _.castArray
    })
    .options({
      ..._.omit(['output', 'show-secrets-unsafe'], OPTIONS.OUTPUT),
      transform: {
        ...OPTIONS.OUTPUT.transform,
        default: DEFAULT_TRANSFORMER
      },
      ...OPTIONS.TABLE_TRANSFORM,
      ...OPTIONS.JSON_TRANSFORM,
      pretty: {
        ...OPTIONS.JSON_TRANSFORM.pretty,
        default: true
      },
      ...OPTIONS.FILTER_TRANSFORM,
      replace: {
        description: 'Replace file(s) in-place',
        type: 'boolean'
      }
    });

export const handler = argv => {
  const config = mergeCommandConfig('transform', argv);
  debug('complete command config: %O', config);
  const files = [...argv.file];
  /**
   * @type {import('@report-toolkit/common/src/observable').Observable<import('@report-toolkit/common').Report>}
   */
  const source = fromFilepathsToReports(argv.file, {showSecretsUnsafe: false});
  fromTransformerChain(argv.transform, config)
    .pipe(
      transform(source, {defaultTransformer: DEFAULT_TRANSFORMER}),
      concatMap(result =>
        iif(
          () => !argv.replace,
          of(result).pipe(toOutput(argv.output, {color: argv.color})),
          of(files.shift()).pipe(
            concatMap(file => of(result).pipe(toOutput(file, {color: false})))
          )
        )
      )
    )
    .subscribe();
};
