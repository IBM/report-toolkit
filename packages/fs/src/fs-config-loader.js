import {
  _,
  constants,
  createDebugPipe,
  error,
  observable
} from '@report-toolkit/common';
import cosmiconfig from 'cosmiconfig';

const {SHORT_NAMESPACE} = constants;
const {REPORT_TOOLKIT_ERR_MISSING_CONFIG} = error;
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
    SHORT_NAMESPACE,
    _.defaultsDeep(
      {
        loaders: {'.js': cosmiconfig.loadJs, noExt: cosmiconfig.loadJs}
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

const toConfigFromFilepath = (opts = {}) => {
  const explorer = getExplorer(opts);
  return observable =>
    observable.pipe(
      mergeMap(filepath => explorer.load(filepath)),
      map(_.get('config.config'))
    );
};

export const fromFilesystemToConfig = ({
  config: rawConfigOrFilepath,
  searchPath = process.cwd(),
  search = true
} = {}) =>
  of(rawConfigOrFilepath).pipe(
    pipeIf(_.isString, toConfigFromFilepath()),
    pipeIf(
      rawConfig => _.isEmpty(rawConfig) && search,
      debug(searchPath => `searching in ${searchPath} for config`),
      mapTo(searchPath),
      toConfigFromSearchPath()
    ),
    pipeIf(
      _.isEmpty,
      switchMapTo(
        throwRTkError(
          REPORT_TOOLKIT_ERR_MISSING_CONFIG,
          `No config file found within ${searchPath ||
            'current working directory'}`
        )
      )
    )
  );
