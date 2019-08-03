import {_} from '@report-toolkit/common';

import * as cpuUsage from './cpu-usage.js';
import * as libraryMismatch from './library-mismatch.js';
import * as longTimeout from './long-timeout.js';
import * as memoryUsage from './memory-usage.js';

const ruleDefinitionsByID = {
  'cpu-usage': cpuUsage,
  'library-mismatch': libraryMismatch,
  'long-timeout': longTimeout,
  'memory-usage': memoryUsage
};

export const builtinRuleDefinitions = _.map(
  ([id, ruleDefinition]) => ({id, ruleDefinition}),
  _.toPairs(ruleDefinitionsByID)
);
