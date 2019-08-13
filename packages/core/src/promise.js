import {observable} from '@report-toolkit/common';

import * as stream from './stream.js';

const {of, toArray, fromAny} = observable;
const {
  compatibleTransforms,
  builtinTransformerIds,
  deregisterPlugins,
  isPluginRegistered
} = stream;

/**
 *
 * @param {ReportLike} report1
 * @param {ReportLike} report2
 * @param {*} opts
 */
export const diff = async (report1, report2, opts = {}) =>
  stream
    .diff(report1, report2, opts)
    .pipe(toArray())
    .toPromise();

/**
 *
 * @param {ReportLike} reports
 * @param {*} opts
 */
export const inspect = async (reports, opts = {}) =>
  stream
    .inspect(reports, opts)
    .pipe(toArray())
    .toPromise();

export const loadConfig = async config => stream.loadConfig(config).toPromise();

/**
 *
 * @param {object} value
 * @param {*} opts
 */
export const toReportFromObject = async (value, opts = {}) =>
  of(value)
    .pipe(stream.toReportFromObject(opts))
    .toPromise();

export const use = async id => stream.use(id).toPromise();

export const registeredRuleDefinitions = async () =>
  stream
    .fromRegisteredRuleDefinitions()
    .pipe(toArray())
    .toPromise();

export const transform = async (
  transformerIds,
  source,
  transformerConfig = {},
  options = {}
) =>
  stream
    .fromTransformerChain(transformerIds, transformerConfig)
    .pipe(
      transform(fromAny(source), options),
      toArray()
    )
    .toPromise();

export {
  compatibleTransforms,
  builtinTransformerIds,
  isPluginRegistered,
  deregisterPlugins
};

/**
 * @typedef {import('./stream').ReportLike} ReportLike
 */
