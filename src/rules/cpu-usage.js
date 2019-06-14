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
      mode: {
        type: 'string',
        enum: ['mean', 'min', 'max', 'all'],
        default: 'mean'
      }
    },
    additionalProperties: false
  }
};

export const MODE_MEAN = 'mean';
export const MODE_MIN = 'min';
export const MODE_MAX = 'max';
export const MODE_ALL = 'all';

const hrMap = {
  [MODE_MEAN]: 'Mean',
  [MODE_MIN]: 'Minimum',
  [MODE_MAX]: 'Maximum',
  [MODE_ALL]: 'Report'
};

const computations = {
  [MODE_MEAN]: usages =>
    usages.reduce(
      (acc, value, i, arr) =>
        i === arr.length - 1
          ? parseFloat(((acc + value) / arr.length).toFixed(2))
          : acc + value,
      0
    ),
  [MODE_MIN]: usages =>
    usages.reduce((acc, value) => Math.min(acc, value), Infinity),
  [MODE_MAX]: usages => usages.reduce((acc, value) => Math.max(acc, value), 0)
};

const withinRange = (min, max, usage) => usage >= min && usage <= max;

const ok = ({mode, min, max}, usage) => {
  return {
    message: `${hrMap[mode]} CPU consumption percent (${usage}%) is within the allowed range of ${min}-${max}%`,
    data: {
      mode,
      usage,
      min,
      max
    },
    severity: INFO
  };
};

const fail = ({mode, min, max}, usage) => {
  return {
    message: `${hrMap[mode]} CPU consumption percent (${usage}%) is outside the allowed range of ${min}-${max}%`,
    data: {
      mode,
      usage,
      min,
      max
    }
  };
};

exports.inspect = (config = {}) => {
  let {min, max, mode} = config;
  min = min || 0;
  max = max || 50;
  mode = mode || 'mean';
  const usages = [];
  return {
    next(context) {
      const usage = parseFloat(
        context.resourceUsage.cpuConsumptionPercent.toFixed(2)
      );
      if (mode === MODE_ALL) {
        return withinRange(min, max, usage)
          ? ok({min, max, mode}, usage)
          : fail({min, max, mode}, usage);
      } else {
        usages.push(usage);
      }
    },
    complete() {
      if (mode !== MODE_ALL) {
        const usage = computations[mode](usages);
        return withinRange(min, max, usage)
          ? ok({min, max, mode}, usage)
          : fail({min, max, mode}, usage);
      }
    }
  };
};
