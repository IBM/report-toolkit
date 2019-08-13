import {_, createDebugPipe, error, observable} from '@report-toolkit/common';
import cosmiconfig from 'cosmiconfig';

import {RC_NAMESPACE} from './constants.js';

const {RTKERR_MISSING_CONFIG} = error;
const {
  map,
  mapTo,
  mergeMap,
  of,
  pipeIf,
  switchMapTo,
  throwRTkError
} = observable;

const debug = createDebugPipe('cli', 'loaders', 'config');

const getExplorer = _.memoize(opts =>
  cosmiconfig(
    RC_NAMESPACE,
    _.defaultsDeep(
      {
        // @ts-ignore
        loaders: {noExt: cosmiconfig.loadJs}
      },
      opts
    )
  )
);

const toConfigFromSearchPath = (opts = {}) => {
  const explorer = getExplorer(opts);
  return observable =>
    observable.pipe(
      mergeMap(searchpath => explorer.search(searchpath)),
      pipeIf(
        _.isObject,
        debug(config => `found config at ${config.filepath}`),
        map(_.get('config.config'))
      )
    );
};

/**
 *
 * @param {cosmiconfig.ExplorerOptions} [opts] - Extra opts for cosmiconfig
 * @returns {import('rxjs').OperatorFunction<string,object>}
 */
const toConfigFromFilepath = (opts = {}) => {
  const explorer = getExplorer(opts);
  return observable =>
    observable.pipe(
      mergeMap(filepath => explorer.load(filepath)),
      map(_.get('config.config'))
    );
};

export const fromFilesystemToConfig = ({
  config: rawConfigOrFilepath = {},
  searchPath = process.cwd(),
  search = true
} = {}) =>
  of(rawConfigOrFilepath).pipe(
    pipeIf(_.isString, toConfigFromFilepath()),
    pipeIf(
      rawConfig => _.isEmpty(rawConfig) && search,
      debug(() => `searching in ${searchPath} for config`),
      mapTo(searchPath),
      toConfigFromSearchPath()
    ),
    pipeIf(
      _.isEmpty && _.isString(rawConfigOrFilepath),
      switchMapTo(
        throwRTkError(
          RTKERR_MISSING_CONFIG,
          `No config file found at ${rawConfigOrFilepath}`
        )
      )
    ),
    pipeIf(_.isEmpty, mapTo({}))
  );
