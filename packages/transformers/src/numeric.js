/**
 * Extracts only numeric data from a Report. Useful combined with the {@link @report-toolkit/transformers.newline} Transformer to pipe output on the command-line.
 * @module @report-toolkit/transformers.numeric
 */
/**
 * do not remove this comment (for typedoc)
 */
import {_, createDebugger, observable} from '@report-toolkit/common';
const {mergeMap} = observable;
const debug = createDebugger('transformers', 'numeric');

const NUMERIC_KEYPATHS = [
  'javascriptHeap.totalMemory',
  'javascriptHeap.totalCommittedMemory',
  'javascriptHeap.usedMemory',
  'javascriptHeap.availableMemory',
  'javascriptHeap.memoryLimit',
  'javascriptHeap.heapSpaces.read_only_space.memorySize',
  'javascriptHeap.heapSpaces.read_only_space.committedMemory',
  'javascriptHeap.heapSpaces.read_only_space.capacity',
  'javascriptHeap.heapSpaces.read_only_space.used',
  'javascriptHeap.heapSpaces.read_only_space.available',
  'javascriptHeap.heapSpaces.new_space.memorySize',
  'javascriptHeap.heapSpaces.new_space.committedMemory',
  'javascriptHeap.heapSpaces.new_space.capacity',
  'javascriptHeap.heapSpaces.new_space.used',
  'javascriptHeap.heapSpaces.new_space.available',
  'javascriptHeap.heapSpaces.old_space.memorySize',
  'javascriptHeap.heapSpaces.old_space.committedMemory',
  'javascriptHeap.heapSpaces.old_space.capacity',
  'javascriptHeap.heapSpaces.old_space.used',
  'javascriptHeap.heapSpaces.old_space.available',
  'javascriptHeap.heapSpaces.code_space.memorySize',
  'javascriptHeap.heapSpaces.code_space.committedMemory',
  'javascriptHeap.heapSpaces.code_space.capacity',
  'javascriptHeap.heapSpaces.code_space.used',
  'javascriptHeap.heapSpaces.code_space.available',
  'javascriptHeap.heapSpaces.map_space.memorySize',
  'javascriptHeap.heapSpaces.map_space.committedMemory',
  'javascriptHeap.heapSpaces.map_space.capacity',
  'javascriptHeap.heapSpaces.map_space.used',
  'javascriptHeap.heapSpaces.map_space.available',
  'javascriptHeap.heapSpaces.large_object_space.memorySize',
  'javascriptHeap.heapSpaces.large_object_space.committedMemory',
  'javascriptHeap.heapSpaces.large_object_space.capacity',
  'javascriptHeap.heapSpaces.large_object_space.used',
  'javascriptHeap.heapSpaces.large_object_space.available',
  'javascriptHeap.heapSpaces.code_large_object_space.memorySize',
  'javascriptHeap.heapSpaces.code_large_object_space.committedMemory',
  'javascriptHeap.heapSpaces.code_large_object_space.capacity',
  'javascriptHeap.heapSpaces.code_large_object_space.used',
  'javascriptHeap.heapSpaces.code_large_object_space.available',
  'javascriptHeap.heapSpaces.new_large_object_space.memorySize',
  'javascriptHeap.heapSpaces.new_large_object_space.committedMemory',
  'javascriptHeap.heapSpaces.new_large_object_space.capacity',
  'javascriptHeap.heapSpaces.new_large_object_space.used',
  'javascriptHeap.heapSpaces.new_large_object_space.available',
  'resourceUsage.userCpuSeconds',
  'resourceUsage.kernelCpuSeconds',
  'resourceUsage.cpuConsumptionPercent',
  'resourceUsage.maxRss',
  'resourceUsage.pageFaults.IORequired',
  'resourceUsage.pageFaults.IONotRequired',
  'resourceUsage.fsActivity.reads',
  'resourceUsage.fsActivity.writes',
  'libuv.length'
];

/**
 * @type {TransformerMeta}
 */
export const meta = {
  defaults: /**
   * @type {NumericTransformOptions}
   */ ({
    fields: [
      {label: 'Field', value: 'key'},
      {label: 'Value', value: 'value'}
    ],
    keys: NUMERIC_KEYPATHS
  }),
  description: 'Filter on numeric fields',
  id: 'numeric',
  input: ['report', 'object'],
  output: 'object'
};

/**
 * Transforms a Report (by default) or generic object (w/ appropriate keys)
 * to keypaths and numeric values
 * @param {Partial<NumericTransformOptions>} [opts] - Options
 * @returns {TransformFunction<Report|object,NumericTransformResult>}
 */
export const transform = ({keys} = {}) => {
  return observable =>
    observable.pipe(
      mergeMap(report => {
        const tuple = key => [key, parseFloat(_.get(key, report))];
        const makeArray = _.pipe(
          _.map(tuple),
          _.filter(([key, value]) => {
            if (isNaN(value)) {
              debug(`skipping NaN value at key ${key}`);
              return false;
            }
            return true;
          }),
          _.map(([key, value]) => ({key, value}))
        );
        return makeArray(keys);
      })
    );
};

/**
 * @typedef {object} NumericTransformOptions
 * @property {TransformerField[]} fields - Field definitions for other transformers which might want to use them
 * @property {string[]} keys - Keys to extract; supports dot-separted keypaths
 */
/**
 * @typedef {object} NumericTransformResult
 * @property {string} key - The key name (dot-separated)
 * @property {number} value - The numeric value of the property at `key`
 */

/**
 * @typedef {import('@report-toolkit/common').Report} Report
 * @typedef {import('./transformer.js').TransformerMeta} TransformerMeta
 * @typedef {import('./transformer.js').TransformerField} TransformerField
 */
/**
 * @template T,U
 * @typedef {import('./transformer.js').TransformFunction<T,U>} TransformFunction
 */
