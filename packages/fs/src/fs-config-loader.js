import {_, createDebugPipe, error, observable} from '@report-toolkit/common';
import path from 'path';
import {cosmiconfig} from 'cosmiconfig';
import xdgBasedir from 'xdg-basedir';
import globalDirs from 'global-dirs';
import os from 'os';

import {RC_NAMESPACE} from './constants.js';

const {RTKERR_MISSING_CONFIG} = error;
const {
  map,
  mergeMap,
  filter,
  concatMap,
  concatMapTo,
  of,
  pipeIf,
  switchMapTo,
  take,
  throwRTkError
} = observable;

const debug = createDebugPipe('cli', 'loaders', 'config');

const EXTRA_SEARCH_DIRS = [
  os.homedir(),
  path.join(globalDirs.npm.prefix, 'etc')
];
if (os.platform() !== 'win32') {
  EXTRA_SEARCH_DIRS.push(...xdgBasedir.configDirs, '/etc');
}

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

/**
 *
 * @param {import('cosmiconfig').Options} [opts] - Extra opts for cosmiconfig
 * @returns {import('rxjs').OperatorFunction<string,object>}
 */
function toConfigFromSearchPath(opts = {}) {
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
}

/**
 *
 * @param {import('cosmiconfig').Options} [opts] - Extra opts for cosmiconfig
 * @returns {import('rxjs').OperatorFunction<string,object>}
 */
function toConfigFromFilepath(opts = {}) {
  const explorer = getExplorer(opts);
  return observable =>
    observable.pipe(
      mergeMap(filepath => explorer.load(filepath)),
      map(_.get('config.config'))
    );
}

export const fromFilesystemToConfig = ({
  config: rawConfigOrFilepath = {},
  searchPath = process.cwd(),
  search = true
} = {}) => {
  const allSearchPaths = [searchPath, ...EXTRA_SEARCH_DIRS];
  return of(rawConfigOrFilepath).pipe(
    pipeIf(_.isString, toConfigFromFilepath()),
    pipeIf(
      /** @param {object} rawConfig */ rawConfig =>
        _.isEmpty(rawConfig) && search,
      concatMapTo(allSearchPaths),
      debug(allSearchPath => `searching in ${allSearchPath} for config`),
      concatMap(allSearchPath =>
        of(allSearchPath).pipe(
          pipeIf(allSearchPath === searchPath, toConfigFromSearchPath()),
          pipeIf(
            allSearchPath !== searchPath,
            toConfigFromSearchPath({stopDir: allSearchPath})
          )
        )
      ),
      filter(_.negate(_.isEmpty)),
      take(1)
    ),
    pipeIf(
      _.isEmpty && _.isString(rawConfigOrFilepath),
      switchMapTo(
        throwRTkError(
          RTKERR_MISSING_CONFIG,
          `No config file found at ${rawConfigOrFilepath}`
        )
      )
    )
  );
};
