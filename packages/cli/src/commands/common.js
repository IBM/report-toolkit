import {FORMAT_CSV, FORMAT_JSON} from '@gnostic/formatters';

import {FORMAT_TABLE} from '../table-formatter.js';

export const GROUPS = {
  OUTPUT: 'Output:',
  FILTER: 'Filter:'
};

export const OPTIONS = {
  OUTPUT: {
    truncate: {
      type: 'boolean',
      description: 'Truncate values (table format)',
      group: GROUPS.OUTPUT,
      default: true,
      conflicts: 'wrap'
    },
    wrap: {
      type: 'boolean',
      description:
        'Hard-wrap values (table format only; implies --no-truncate)',
      group: GROUPS.OUTPUT,
      conflicts: 'truncate'
    },
    format: {
      choices: [FORMAT_CSV, FORMAT_JSON, FORMAT_TABLE],
      description: 'Output format',
      group: GROUPS.OUTPUT,
      default: FORMAT_TABLE
    },
    pretty: {
      type: 'boolean',
      group: GROUPS.OUTPUT,
      description: 'Pretty-print JSON output'
    },
    color: {
      type: 'boolean',
      group: GROUPS.OUTPUT,
      description: 'Use colors w/ "table" format',
      default: true
    },
    output: {
      type: 'string',
      normalize: true,
      requiresArg: true,
      description: 'Output to file instead of STDOUT',
      group: GROUPS.OUTPUT,
      alias: 'o'
    },
    'show-secrets-unsafe': {
      type: 'boolean',
      description: 'Live dangerously & do not automatically redact secrets',
      group: GROUPS.OUTPUT
    }
  }
};
