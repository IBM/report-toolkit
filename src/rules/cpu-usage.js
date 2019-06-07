exports.meta = {
  docs: {
    description: 'Assert CPU usage is under or over specified threshold',
    category: 'resource',
    url: 'https://more-information-for-this-rule'
  },
  schema: {},
  messages: {}
};

const fieldMap = {
  usage: ['cpuConsumptionPercent']
};

const COMPUTE_MEAN = 'mean';
const COMPUTE_MIN = 'min';
const COMPUTE_MAX = 'max';
const COMPUTE_ALL = 'all';

const hrMap = {
  [COMPUTE_MEAN]: 'Mean',
  [COMPUTE_MIN]: 'Minimum',
  [COMPUTE_MAX]: 'Maximum',
  [COMPUTE_ALL]: 'Report',
  usage: 'CPU Consumption'
};

const computations = {
  [COMPUTE_MEAN]: usages =>
    usages.reduce(
      (acc, value, i, arr) =>
        i === arr.length - 1 ? (acc + value) / arr.length : acc + value,
      0
    ),
  [COMPUTE_MIN]: usages =>
    usages.reduce((acc, value) => Math.min(acc, value), Infinity),
  [COMPUTE_MAX]: usages =>
    usages.reduce((acc, value) => Math.max(acc, value), 0)
};

const withinRange = (start, end, usage) => usage >= start && usage < end;

const ok = ({compute, mode, start, end}, usage) => {
  return {
    message: `${hrMap[compute]} ${
      hrMap[mode]
    } (${usage}%) is within the allowed range ${start}-${end}`,
    data: {
      compute,
      usage,
      start,
      end
    },
    level: 'info'
  };
};

const fail = ({compute, mode, start, end}, usage) => {
  return {
    message: `${hrMap[compute]} ${
      hrMap[mode]
    } (${usage}%) is outside the allowed range ${start}-${end}`,
    data: {
      compute,
      usage,
      start,
      end
    }
  };
};

exports.inspect = (config = {}) => {
  let {start, end, compute, mode} = config;
  mode = mode || 'usage';
  start = start || 0;
  end = end || 50;
  compute = compute || 'mean';
  const usages = [];
  return {
    next(context) {
      const usage = context.resourceUsage[fieldMap[mode]];
      if (compute === COMPUTE_ALL) {
        if (withinRange(start, end, usage)) {
          return ok({start, end, compute, mode}, usage);
        }
        return fail({start, end, compute, mode}, usage);
      } else {
        usages.push(usage);
      }
    },
    complete() {
      if (compute !== COMPUTE_ALL) {
        const usage = computations[compute](usages);
        if (withinRange(start, end, usage)) {
          return ok({start, end, compute, mode}, usage);
        }
        return fail({start, end, compute, mode}, usage);
      }
    }
  };
};
