// @ts-check

import {_, observable} from '@report-toolkit/common';

const {mergeMap} = observable;

const NUMERIC_FIELDS = [
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
 * Transforms a Report into Transform
 * @param {Object} [opts] - Options
 * @param {string[]} [opts.fields] - Array of numeric fields we care about; defaults to ALL known numeric fields
 * @returns {import('rxjs/internal/types').OperatorFunction<import('@report-toolkit/report').Report,{key:string,value:string}>}
 */
export const toNumeric = ({fields = NUMERIC_FIELDS} = {}) => observable =>
  observable.pipe(
    mergeMap(report => {
      const valueOf = _.pipe(
        _.propertyOf(report),
        _.toNumber
      );
      const tuple = key => [key, valueOf(key)];
      const onlyNumbers = ([key, value]) => !_.isNaN(value);
      const transform = _.pipe(
        _.map(tuple),
        _.filter(onlyNumbers),
        _.map(_.fromPairs)
      );
      return transform(fields);
    })
  );
