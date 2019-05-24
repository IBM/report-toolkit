import {concatMap, map, reduce} from 'rxjs/operators';

import CLITable3 from 'cli-table3';
import _ from 'lodash/fp';
import colors from '../cli/colors';
import {from} from 'rxjs';
import {pipeIf} from '../operators';
import {version} from '../../package.json';
import wrapAnsi from 'wrap-ansi';

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
  colWidthPcts: [],
  fields: [],
  style: {
    head: []
  },
  wordWrap: true
};

const fieldWidthPcts = _.pipe(
  _.map('widthPct'),
  _.map(Number)
);

const constantValue = v => (_.isFunction(v) ? v : _.constant(v));

const withHeader = _.curry((header, value) => {
  header = constantValue(header);
  return (
    colors.grey('[') +
    colors.cyan().bold('gnostic') +
    ' ' +
    colors.cyan(`v${version}`) +
    colors.grey('] ') +
    colors.magenta(header(value)) +
    `
`
  );
});

const withFooter = _.curry((footer, value) => {
  footer = constantValue(footer);
  return `
${footer(value)}`;
});

/**
 * This little nasty accepts a list of field objects with `widthPct`
 * props.  In case of bad weirdnessjust count the fields and return
 * a list of equal column widths.
 * @todo "Infinity" should be a problem
 */
const normalizeColWidthPcts = _.pipe(
  fields => {
    const fieldsCount = _.size(fields);
    const colWidthPcts = fieldWidthPcts(fields);
    return _.some(_.isNaN, colWidthPcts) || _.sum(colWidthPcts) > 100
      ? new Array(fieldsCount).fill(Math.floor(100 / fieldsCount))
      : colWidthPcts;
  },
  _.map(_.clamp(0, 100))
);

const calculateColumnWidths = (maxWidth = 80, fields = []) =>
  _.map(
    pct => Math.floor((pct / 100) * maxWidth),
    normalizeColWidthPcts(fields)
  );

const formatTableHeaders = _.pipe(
  _.map('label'),
  _.map(colors.underline)
);

const createTable = (opts = {}) => {
  opts = _.defaultsDeep(DEFAULT_TABLE_OPTS, opts);
  const {fields, truncateValues, wrapValues, maxWidth} = opts;
  if (_.some('widthPct', fields) && (truncateValues || wrapValues)) {
    opts.colWidths = calculateColumnWidths(maxWidth, fields);
  }
  return new CLITable3({
    ...opts,
    head: formatTableHeaders(fields)
  });
};

const colValuesByFields = _.curry((fields, row) =>
  _.map(_.invokeArgs('value', [row]), fields)
);

export const toTable = (opts = {}) => {
  const table = createTable(opts);
  const {fields, wrapValues, outputHeader, outputFooter} = opts;
  const colValues = colValuesByFields(fields);
  const padding =
    table.options.style['padding-left'] - table.options.style['padding-right'];
  return observable =>
    observable.pipe(
      map(colValues),
      pipeIf(
        wrapValues,
        map(
          // this force-wraps the column text
          _.map((col, idx) =>
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
        let output = [table];
        if (outputHeader) {
          output = [withHeader(outputHeader, table), ...output];
        }
        if (outputFooter) {
          output = [...output, withFooter(outputFooter, table)];
        }
        return from(output);
      })
    );
};
