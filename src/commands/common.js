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
      description: 'Hard-wrap values (table format; implies --no-truncate)',
      group: GROUPS.OUTPUT,
      conflicts: 'truncate'
    },
    format: {
      choices: ['table', 'csv', 'json'],
      description: 'Output format',
      group: GROUPS.OUTPUT,
      default: 'table'
    },
    pretty: {
      type: 'boolean',
      group: GROUPS.OUTPUT,
      description: 'Pretty-print JSON output'
    },
    color: {
      type: 'boolean',
      group: GROUPS.OUTPUT,
      description: 'Use colors in table format',
      default: true
    },
    output: {
      type: 'string',
      normalize: true,
      requiresArg: true,
      description: 'Output to file instead of STDOUT',
      group: GROUPS.OUTPUT,
      alias: 'o'
    }
  }
};
