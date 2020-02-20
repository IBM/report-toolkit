import {
  _,
  constants,
  createDebugger,
  createDebugPipe,
  observable
} from '@report-toolkit/common';
import {observable as observableAPI} from '@report-toolkit/core';
import {toObjectFromFilepath} from '@report-toolkit/fs';

import {terminalColumns} from '../console-utils.js';

const debug = createDebugPipe('cli', 'commands', 'common');

const {
  compatibleTransformers,
  builtinTransformerIds,
  toReportFromObject
} = observableAPI;

const {fromAny, share} = observable;

const toUniqueArray = _.pipe(_.castArray, _.uniq);

export const GROUPS = {
  FILTER: 'Filter:',
  FILTER_TRANSFORM: '"filter" Transform Options:',
  JSON_TRANSFORM: '"json" Transform Options:',
  OUTPUT: 'Output:',
  TABLE_TRANSFORM: '"table" Transform Options:'
};

export const OPTIONS = {
  FILTER_TRANSFORM: {
    exclude: {
      coerce: toUniqueArray,
      /** @type {string[]}  */
      default: [],
      description: 'Exclude properties (keypaths allowed)',
      group: GROUPS.FILTER_TRANSFORM,
      nargs: 1,
      type: 'string'
    },
    include: {
      coerce: toUniqueArray,
      /** @type {string[]} */
      default: [],
      description: 'Include properties (keypaths allowed)',
      group: GROUPS.FILTER_TRANSFORM,
      nargs: 1,
      type: 'string'
    }
  },
  JSON_TRANSFORM: {
    pretty: {
      description: 'Pretty-print JSON output',
      group: GROUPS.JSON_TRANSFORM,
      type: 'boolean'
    }
  },
  OUTPUT: {
    output: {
      alias: 'o',
      description: 'Output to file instead of STDOUT',
      group: GROUPS.OUTPUT,
      normalize: true,
      requiresArg: true,
      type: 'string'
    },
    'show-secrets-unsafe': {
      description: 'Live dangerously & do not automatically redact secrets',
      group: GROUPS.OUTPUT,
      type: 'boolean'
    }
  },
  TABLE_TRANSFORM: {
    'max-width': {
      default: terminalColumns,
      defaultDescription: 'terminal width',
      description: 'Set maximum output width; ignored if --no-truncate used',
      group: GROUPS.TABLE_TRANSFORM,
      type: 'number'
    },
    truncate: {
      default: true,
      description: 'Truncate & word-wrap output',
      group: GROUPS.TABLE_TRANSFORM,
      type: 'boolean'
    }
  },
  TRANSFORM: {
    // @todo list transform aliases
    alias: 't',
    choices: builtinTransformerIds,
    coerce: toUniqueArray,
    default: constants.DEFAULT_TRANSFORMER,
    description: 'Transform(s) to apply',
    group: GROUPS.OUTPUT,
    nargs: 1,
    type: 'string'
  }
};

/**
 * Yes, yes, I know.
 * @typedef {Object} GetTransformerOptionsOptions
 * @property {'report'|'object'} sourceType - Whether the transformer source is a report or an object
 * @property {string} defaultTransformer - Name of default transformer
 * @property {object} extra - Merge these into the result; use this to override specific values (e.g., default behavior of a transformer)
 * @property {string[]} omit - List of transformers to explicitly omit, if any
 */

/**
 * Get all transformer options for a command
 * @param {Partial<GetTransformerOptionsOptions>} opts - Options
 */
export const getTransformerOptions = ({
  sourceType = 'report',
  defaultTransformer = constants.DEFAULT_TRANSFORMER,
  omit = [],
  extra = {}
} = {}) => {
  const transformerNames = _.filter(
    transformerName => !omit.includes(transformerName),
    compatibleTransformers(sourceType)
  );

  return _.defaultsDeep(
    _.reduce(
      (acc, transformName) => {
        const transformSpecificOptions =
          OPTIONS[
            /** @type {keyof OPTIONS} */ (`${transformName.toUpperCase()}_TRANSFORM`)
          ];
        if (transformSpecificOptions) {
          acc = {...acc, ...transformSpecificOptions};
        }
        return acc;
      },
      {
        transform: {
          ...OPTIONS.TRANSFORM,
          choices: transformerNames,
          default: defaultTransformer
        }
      },
      transformerNames
    ),
    extra
  );
};

/**
 *
 * @param {string[]|string} filepaths
 * @param {Partial<import('@report-toolkit/core/src/observable').ToReportFromObjectOptions>} opts
 */
export function fromFilepathsToReports(filepaths, opts = {}) {
  return fromAny(filepaths).pipe(
    debug(() => `attempting to load filepath(s): ${filepaths}`),
    toObjectFromFilepath(),
    toReportFromObject(opts),
    debug(() => `loaded filepath(s): ${filepaths}`),
    share()
  );
}

/**
 * Compute a configuration for a particular command.  Command-specific
 * config overrides whatever the top-level config is.
 * @param {string} commandName - Name of command
 * @param {object} [argv] - Command-line args
 * @param {object} [defaultConfig] - Default command configuration
 * @returns {object} Resulting config with command-specific stuff on top
 */
export const mergeCommandConfig = (
  commandName,
  argv = {},
  defaultConfig = {}
) => {
  const config = _.omit(
    'commands',
    _.mergeAll([
      // overwrite default config with more-specific default command config, if it exists.
      _.defaultsDeep(
        defaultConfig,
        _.getOr({}, `commands.${commandName}`, defaultConfig)
      ),
      // overwrite transformer default with arg-supplied transformer config
      {
        transformers: _.mapValues(
          transformerConfig =>
            _.defaultsDeep(
              transformerConfig,
              _.omit(['$0', 'config', '_'], argv)
            ),
          _.getOr({}, 'transformers', defaultConfig)
        )
      },
      // overwrite config with command-specific config
      _.defaultsDeep(
        _.getOr({}, 'config', argv),
        _.getOr({}, `config.commands.${commandName}`, argv)
      ),
      _.omit(['$0', 'config', '_'], argv)
    ])
  );
  // @ts-ignore
  if (_.isEmpty(config.transformers)) {
    // @ts-ignore
    delete config.transformers;
  }
  createDebugger(
    'cli',
    'commands',
    'common'
  )(`computed config for command "${commandName}": %O`, config);
  return config;
};
