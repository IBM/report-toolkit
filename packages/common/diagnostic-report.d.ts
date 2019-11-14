export interface ReportHeaderCpu {
  model: string;
  speed: number;
  user: number;
  nice: number;
  sys: number;
  idle: number;
  irq: number;
}

export interface ReportHeader {
  event: string;
  trigger: string;
  filename: string;
  dumpEventTime: string;
  dumpEventTimeStamp: string;
  processId: number;
  cwd: string;
  commandLine: string[];
  nodejsVersion: string;
  wordSize: number;
  arch: string;
  platform: string;
  componentVersions: {
    [key: string]: string;
  };
  release: {
    name: string;
    headersUrl: string;
    sourceUrl: string;
  };
  osName: string;
  osRelease: string;
  osVersion: string;
  osMachine: string;
  cpus: ReportHeaderCpu[];
  host: string;
}

export interface ReportJSStack {
  message: string;
  stack: string[];
}

export interface NativeStackFrame {
  pc: string;
  symbol: string;
}

export interface ReportHeapSpace {
  memorySize: number;
  committedMemory: number;
  capacity: number;
  used: number;
  available: number;
}

export interface ReportJSHeap {
  totalMemory: number;
  totalCommittedMemory: number;
  usedMemory: number;
  availableMemory: number;
  memoryLimit: number;
  heapSpaces: {
    [key: string]: ReportHeapSpace;
  };
}

export interface ReportResourceUsage {
  userCpuSeconds: number;
  kernelCpuSeconds: number;
  cpuConsumptionPercent: number;
  maxRss: number;
  pageFaults: {
    IORequired: number;
    IONotRequired: number;
  };
  fsActivity: {
    reads: number;
    writes: number;
  };
}

// TODO: Multiple variants, CBA for PoC
type ReportUVItem = {};

export type ReportLimit = number | 'unlimited';

export interface ReportUserLimit {
  hard: ReportLimit;
  soft: ReportLimit;
}

export interface DiagnosticReport {
  header: ReportHeader;
  javascriptStack: ReportJSStack;
  nativeStack: NativeStackFrame[];
  javascriptHeap: ReportJSHeap;
  resourceUsage: ReportResourceUsage;
  libuv: ReportUVItem[];
  environmentVariables: {
    [key: string]: string;
  };
  // not present on reports generated on win32 systems
  userLimits?: {
    [key: string]: ReportUserLimit;
  };
  sharedObjects: string[];
}
