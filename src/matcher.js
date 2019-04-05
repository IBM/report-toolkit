import {forkJoin, from} from 'rxjs';
import {map, mergeMap} from 'rxjs/operators';

import {Context} from './context';
import {getRule} from './rule';
import {readReport} from './reader';

/**
 *
 * @param {string} filepath
 * @param {RuleEntry[]} ruleEntries
 */
export const match = (filepath, ruleEntries = []) =>
  forkJoin(from(ruleEntries).pipe(map(getRule)), readReport(filepath)).pipe(
    mergeMap(([rule, report]) => Context.create(rule, report).match())
  );
