import {observable} from '@report-toolkit/common';

import * as stream from './stream.js';

const {of, toArray} = observable;
const {compatibleTransforms, builtinTransformerIds} = stream;

export const diff = async (report1, report2, opts = {}) =>
  stream
    .diff(report1, report2, opts)
    .pipe(toArray())
    .toPromise();

export const inspect = async (reports, opts = {}) =>
  stream
    .inspect(reports, opts)
    .pipe(toArray())
    .toPromise();

export const loadConfig = async config => stream.loadConfig(config).toPromise();

export const toReportFromObject = async (value, opts = {}) =>
  of(value)
    .pipe(stream.toReportFromObject(opts))
    .toPromise();

export const builtinRuleDefinitions = stream.builtinRuleDefinitions;

export {compatibleTransforms, builtinTransformerIds};
