import {_, constants, observable} from '@report-toolkit/common';
import {stream} from '@report-toolkit/core';
import {toObjectFromFilepath} from '@report-toolkit/fs';
import {
  compatibleTransforms,
  knownTransformerIds
} from '@report-toolkit/transformers';

import {terminalColumns} from '../console-utils.js';

const {toReportFromObject} = stream;

const {fromAny, share} = observable;

export const GROUPS = {
  FILTER: 'Filter:',
  FILTER_TRANSFORM: '"filter" Transform Options:',
  JSON_TRANSFORM: '"json" Transform Options:',
  OUTPUT: 'Output:',
  TABLE_TRANSFORM: '"table" Transform Options:'
};

export const OPTIONS = {
  JSON_TRANSFORM: {
    pretty: {
      description: 'Pretty-print JSON output',
      group: GROUPS.JSON_TRANSFORM,
      type: 'boolean'
    }
  },
  FILTER_TRANSFORM: {
    include: {
      alias: 'i',
      description: 'Include properties (keypaths allowed)',
      group: GROUPS.FILTER_TRANSFORM,
      type: 'array',
      coerce: _.castArray
    },
    exclude: {
      alias: 'x',
      description: 'Exclude properties (keypaths allowed)',
      group: GROUPS.FILTER_TRANSFORM,
      type: 'array',
      coerce: _.castArray
    }
  },
  OUTPUT: {
    color: {
      default: true,
      description: 'Use color output where applicable',
      group: GROUPS.OUTPUT,
      type: 'boolean'
    },
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
    },
    transform: {
      // @todo list transform aliases
      alias: 't',
      choices: knownTransformerIds,
      coerce: _.castArray,
      default: constants.DEFAULT_TRANSFORMER,
      description: 'Transform(s) to apply',
      group: GROUPS.OUTPUT,
      type: 'array'
    }
  },
  TABLE_TRANSFORM: {
    'max-width': {
      defaultDescription: `terminal width (${terminalColumns})`,
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
  }
};

export const getOptions = (
  group,
  {
    sourceType = 'report',
    defaultTransformer = constants.DEFAULT_TRANSFORMER
  } = {}
) =>
  group.transform
    ? {
        ...group,
        transform: {
          ...group.transform,
          choices: compatibleTransforms(sourceType),
          default: defaultTransformer
        }
      }
    : group;

export const fromFilepathToReport = (filepaths, opts = {}) =>
  fromAny(filepaths).pipe(
    toObjectFromFilepath(),
    toReportFromObject(opts),
    share()
  );

/**
 * Compute a configuration for a particular command.  Command-specific
 * config overrides whatever the top-level config is.
 * @param {string} commandName - Name of command
 * @param {object} [argv] - Command-line args
 * @param {object} [defaultConfig] - Default command configuration
 * @returns {object} Resulting config with command-specific stuff on top
 */
export const commandConfig = (commandName, argv = {}, defaultConfig = {}) =>
  _.omit(
    commandName,
    _.mergeAll([
      _.defaultsDeep(defaultConfig, _.getOr({}, commandName, defaultConfig)),
      _.defaultsDeep(
        _.getOr({}, 'config', argv),
        _.getOr({}, `config.${commandName}`, argv)
      ),
      _.omit(['$0', 'config', '_'], argv)
    ])
  );
