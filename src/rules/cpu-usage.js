const {INFO} = require('../api');

exports.meta = {
  docs: {
    description: 'Assert CPU usage % is within a range',
    category: 'resource',
    url: 'https://more-information-for-this-rule'
  },
  schema: {
    type: 'object',
    properties: {
      min: {
        type: 'integer',
        minimum: 0,
        default: 0
      },
      max: {
        type: 'integer',
        minimum: 0,
        default: 50
      },
      compute: {
        type: 'string',
        enum: ['mean', 'min', 'max', 'all'],
        default: 'mean'
      }
    },
    additionalProperties: false
  }
};

const COMPUTE_MEAN = 'mean';
const COMPUTE_MIN = 'min';
const COMPUTE_MAX = 'max';
const COMPUTE_ALL = 'all';

const hrMap = {
  [COMPUTE_MEAN]: 'Mean',
  [COMPUTE_MIN]: 'Minimum',
  [COMPUTE_MAX]: 'Maximum',
  [COMPUTE_ALL]: 'Report'
};

const computations = {
  [COMPUTE_MEAN]: usages =>
    usages.reduce(
      (acc, value, i, arr) =>
        i === arr.length - 1
          ? parseFloat(((acc + value) / arr.length).toFixed(2))
          : acc + value,
      0
    ),
  [COMPUTE_MIN]: usages =>
    usages.reduce((acc, value) => Math.min(acc, value), Infinity),
  [COMPUTE_MAX]: usages =>
    usages.reduce((acc, value) => Math.max(acc, value), 0)
};

const withinRange = (min, max, usage) => usage >= min && usage <= max;

const ok = ({compute, min, max}, usage) => {
  return {
    message: `${hrMap[compute]} CPU consumption percent (${usage}%) is within the allowed range ${min}-${max}`,
    data: {
      compute,
      usage,
      min,
      max
    },
    severity: INFO
  };
};

const fail = ({compute, min, max}, usage) => {
  return {
    message: `${hrMap[compute]} CPU consumption percent (${usage}%) is outside the allowed range ${min}-${max}`,
    data: {
      compute,
      usage,
      min,
      max
    }
  };
};

exports.inspect = (config = {}) => {
  let {min, max, compute} = config;
  min = min || 0;
  max = max || 50;
  compute = compute || 'mean';
  const usages = [];
  return {
    next(context) {
      const usage = parseFloat(
        context.resourceUsage.cpuConsumptionPercent.toFixed(2)
      );
      if (compute === COMPUTE_ALL) {
        if (withinRange(min, max, usage)) {
          return ok({min, max, compute}, usage);
        }
        return fail({min, max, compute}, usage);
      } else {
        usages.push(usage);
      }
    },
    complete() {
      if (compute !== COMPUTE_ALL) {
        const usage = computations[compute](usages);
        if (withinRange(min, max, usage)) {
          return ok({min, max, compute}, usage);
        }
        return fail({min, max, compute}, usage);
      }
    }
  };
};
