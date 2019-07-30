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

const fieldWidthPcts = _.pipe(
  _.map('widthPct'),
  _.map(Number)
);

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

/**
 * This little nasty accepts a list of field objects with `widthPct`
 * props.  In case of bad weirdnessjust count the fields and return
 * a list of equal column widths.
 * @todo "Infinity" should be a problem
 */
const normalizeColWidthPcts = _.pipe(
  /**
   * @param {Field[]} fields
   * @returns {number[]}
   */
  fields => {
    const fieldsCount = _.size(fields);
    const colWidthPcts = fieldWidthPcts(fields);
    return _.some(_.isNaN, colWidthPcts) || _.sum(colWidthPcts) > 100
      ? new Array(fieldsCount).fill(Math.floor(100 / fieldsCount))
      : colWidthPcts;
  },
  _.map(_.clamp(0, 100))
);

/**
 *
 * @param {number} [maxWidth] - Maximum column width
 * @param {Field[]} [fields] - Field settings
 * @returns {number[]}
 */
const calculateColumnWidths = (maxWidth = 80, fields = []) =>
  _.map(
    pct => Math.floor((pct / 100) * maxWidth),
    normalizeColWidthPcts(fields)
  );

/**
 * @param {Field[]} fields - Field whose table headers need formatting
 * @returns {string[]} Formatted headers
 */
const formatTableHeaders = _.pipe(
  _.map('label'),
  _.map(colors.underline)
);

/**
 *
 * @param {Object} [opts] - Options
 * @returns {CLITable3.Table}
 */
const createTable = (opts = {}) => {
  opts = _.defaultsDeep(DEFAULT_TABLE_OPTS, opts);
  const {fields, maxWidth, truncate} = opts;
  if (truncate) {
    opts.colWidths = calculateColumnWidths(maxWidth, fields);
  }
  return new CLITable3({
    // "truncate" is used by CLITable3 for the truncation symbol.
    ..._.omit('truncate', opts),
    // @ts-ignore
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
 * @type {TransformFunction<object,string>}
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
        /**
         * @type {Array<string|CLITable3.Table>}
         */
        const output = table.length ? [table] : [];
        if (outputHeader) {
          output.unshift(withHeader(outputHeader, table));
        }
        if (outputFooter) {
          output.push(withFooter(outputFooter, table));
        }
        return from(output);
      }),
      map(String)
    );
};

/**
 * @typedef {import('@report-toolkit/report').Report} Report
 * @typedef {import('./transformer.js').TransformerField} Field
 * @typedef {import('./transformer.js').TransformerMeta} TransformerMeta
 */

/**
 * @template T,U
 * @typedef {import('./transformer.js').TransformFunction<T,U>} TransformFunction
 */
