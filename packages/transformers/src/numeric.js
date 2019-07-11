import {_, observable} from '@gnostic/common';
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

export const toNumeric = ({
  fields: field = NUMERIC_FIELDS
} = {}) => observable =>
  observable.pipe(
    mergeMap(report =>
      _.map(field => ({key: field, value: _.get(field, report)}), field)
    )
  );
