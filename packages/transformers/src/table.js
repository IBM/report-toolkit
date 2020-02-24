/**
 * @module @report-toolkit/transformers.table
 */
/**
 * do not remove this comment (for typedoc)
 */
import {_, colors, createDebugPipe, observable} from '@report-toolkit/common';
import CLITable3 from 'cli-table3';
import wrapAnsi from 'wrap-ansi';

// @ts-ignore
import {version} from '../package.json';

const debug = createDebugPipe('transformers', 'table');
const {concatMap, from, map, pipeIf, reduce} = observable;

const DEFAULT_TABLE_OPTS = {
  chars: {
    bottom: '',
    'bottom-left': '',
    'bottom-mid': '',
    'bottom-right': '',
    left: '',
    'left-mid': '',
    mid: '─',
    'mid-mid': '',
    middle: '',
    right: '',
    'right-mid': '',
    top: '',
    'top-left': '',
    'top-mid': '',
    'top-right': ''
  },
  /**
   * @type {number[]}
   */
  colWidthPcts: [],
  /**
   * @type {Field[]}
   */
  fields: [],
  style: {
    /**
     * @type {object[]}
     */
    head: []
  },
  wordWrap: true
};

const fieldWidthPcts = _.pipe(_.map('widthPct'), _.map(Number));

/**
 * @param {(...args: any[]) => string | string} v
 */
const constantValue = v => (_.isFunction(v) ? v : _.constant(v));

/**
 * @param {(arg: CLITable3.Table) => string | string} header
 * @param {CLITable3.Table} value
 * @returns {string}
 */
const withHeader = (header, value) => {
  header = constantValue(header);
  return (
    colors.grey('[') +
    colors.cyan().bold('report-toolkit') +
    ' ' +
    colors.cyan(`v${version}`) +
    colors.grey('] ') +
    colors.magenta(header(value)) +
    `
`
  );
};
/**
 * @param {(arg: CLITable3.Table) => string | string} footer
 * @param {CLITable3.Table} value
 * @returns {string}
 */
const withFooter = (footer, value) => {
  /**
   * @type {(arg: CLITable3.Table) => string}
   */
  footer = constantValue(footer);
  return `
${footer(value)}`;
};

const safeSum = _.reduce((sum, pct) => (_.isNaN(pct) ? sum : sum + pct), 0);

/**
 * This little nasty accepts a list of field objects with `widthPct`
 * props and a `colWidths` array.  It prefers the `colWidths` array.
 * It calculates column widths _as a percentage_ of maxWidth.
 * @todo "Infinity" should be a problem
 * @param {Field[]} fields
 * @param {number[]} colWidths
 * @param {number} maxWidth
 * @returns {number[]}
 */
const normalizeColWidthPcts = (fields, colWidths, maxWidth) => {
  if (!_.isEmpty(colWidths)) {
    const maxPct = 100 - (safeSum(colWidths) / maxWidth) * 100;
    const fieldsCount =
      _.size(fields) - _.size(_.filter(_.isNumber, colWidths));
    return _.map(
      width =>
        typeof width === 'number'
          ? Math.floor((width / maxWidth) * 100)
          : Math.floor(maxPct / fieldsCount),
      [...colWidths, ...new Array(fields.length - colWidths.length).fill(null)]
    );
  }
  const colWidthPcts = fieldWidthPcts(fields);
  if (_.some(_.isNaN, colWidthPcts)) {
    const maxPct = 100 - safeSum(colWidthPcts);
    if (maxPct < 100) {
      const fieldsCount =
        _.size(fields) - _.size(_.filter(_.isNumber, colWidthPcts));
      return _.map(
        pct => (_.isNaN(pct) ? Math.floor(maxPct / fieldsCount) : pct),
        colWidthPcts
      );
    } else {
      const fieldsCount = _.size(fields);
      return new Array(fieldsCount).fill(Math.floor(100 / fieldsCount));
    }
  }
  return colWidthPcts;
};

/**
 *
 * @param {Field[]} [fields] - Field settings
 * @param {number[]} [colWidths] - Fixed column widths
 * @param {number} [maxWidth] - Maximum column width
 * @returns {number[]}
 */
const calculateColumnWidths = (fields = [], colWidths = [], maxWidth = 80) =>
  _.map(
    // normalize column widths to total max width
    pct => Math.floor((pct / 100) * maxWidth),

    // normalize column widths based on explicit colWidths option
    normalizeColWidthPcts(fields, colWidths, maxWidth)
  );

/**
 * @param {Field[]} fields - Field whose table headers need formatting
 * @returns {string[]} Formatted headers
 */
const formatTableHeaders = _.pipe(
  _.map('label'),
  _.map(v => colors.underline(v))
);

/**
 *
 * @param {Object} [opts] - Options
 * @returns {CLITable3.Table}
 */
const createTable = (opts = {}) => {
  opts = _.defaultsDeep(DEFAULT_TABLE_OPTS, opts);
  const {fields, maxWidth, truncate, colWidths} = opts;
  if (truncate) {
    opts.colWidths = calculateColumnWidths(fields, colWidths, maxWidth);
  }
  return new CLITable3({
    // "truncate" is used by CLITable3 for the truncation symbol.
    ..._.omit('truncate', opts),
    head: formatTableHeaders(fields),
    truncate: '…'
  });
};

const colValuesByFields = _.curry(
  /**
   * @param {Field[]} fields
   * @param {object} row
   * @returns {string[]}
   */
  (fields, row) => _.map(_.invokeArgs('value', [row]), fields)
);

/**
 * @type {TransformerMeta}
 */
export const meta = {
  description: 'Tabular output',
  id: 'table',
  input: ['object'],
  output: 'string'
};

/**
 * @returns {TransformFunction<object,string>}
 */
export const transform = (opts = {}) => {
  const table = createTable(opts);
  const {fields, outputFooter, outputHeader, wrap} = opts;
  const colValues = colValuesByFields(fields);
  const padding =
    table.options.style['padding-left'] - table.options.style['padding-right'];
  return observable =>
    observable.pipe(
      debug(
        /**
         * @param {object} value
         */
        // @ts-ignore
        value => [`received data %O`, value]
      ),
      map(colValues),
      pipeIf(
        wrap,
        map(
          // this force-wraps the column text
          _.map(
            /**
             * @param {string} col
             * @param {string | number} idx
             */
            (col, idx) =>
              wrapAnsi(col, table.options.colWidths[idx] - padding, {
                hard: true,
                wordWrap: false
              })
          )
        )
      ),
      reduce((table, row) => {
        // `push` must be used because Table subclasses Array, but
        // doesn't implement concat, so we'd just get a plain Array back...
        table.push(row);
        return table;
      }, table),
      concatMap(table => {
        const isTableEmpty = _.isEmpty(table);
        /**
         * @type {Array<string|CLITable3.Table>}
         */
        const output = isTableEmpty ? [] : [table];
        if (!isTableEmpty) {
          if (outputHeader) {
            output.unshift(withHeader(outputHeader, table));
          }
          if (outputFooter) {
            output.push(withFooter(outputFooter, table));
          }
        }
        return from(output);
      }),
      map(String)
    );
};

/**
 * @typedef {import('@report-toolkit/common').Report} Report
 * @typedef {import('./transformer.js').TransformerField} Field
 * @typedef {import('./transformer.js').TransformerMeta} TransformerMeta
 */

/**
 * @template T,U
 * @typedef {import('./transformer.js').TransformFunction<T,U>} TransformFunction
 */
