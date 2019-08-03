const MODE_ALL = (exports.MODE_ALL = 'all');
const MODE_MEAN = (exports.MODE_MEAN = 'mean');
const MODE_MIN = (exports.MODE_MIN = 'min');
const MODE_MAX = (exports.MODE_MAX = 'max');

const hrMap = {
  [MODE_ALL]: 'Report',
  [MODE_MAX]: 'Maximum',
  [MODE_MEAN]: 'Mean',
  [MODE_MIN]: 'Minimum'
};

const computations = {
  [MODE_MAX]: usages => usages.reduce((acc, value) => Math.max(acc, value), 0),
  [MODE_MEAN]: usages =>
    usages.reduce(
      (acc, value, i, arr) =>
        i === arr.length - 1 ? (acc + value) / arr.length : acc + value,
      0
    ),
  [MODE_MIN]: usages =>
    usages.reduce((acc, value) => Math.min(acc, value), Infinity)
};

const withinRange = (min, max, usage) => usage >= min && usage <= max;

const ok = ({max, min, mode}, usage) => {
  return {
    data: {
      max,
      min,
      mode,
      usage
    },
    message: `${hrMap[mode]} memory usage percent (${usage}%) is within the allowed range ${min}-${max}%`,
    severity: 'info'
  };
};

const fail = ({max, min, mode}, usage) => {
  return {
    data: {
      max,
      min,
      mode,
      usage
    },
    message: `${hrMap[mode]} memory usage percent (${usage}%) is outside the allowed range ${min}-${max}%`
  };
};

export const inspect = ({max, min, mode} = {}) => {
  const usages = [];
  return {
    complete() {
      if (mode !== MODE_ALL) {
        const usage = computations[mode](usages);
        return withinRange(min, max, usage)
          ? ok({max, min, mode}, usage)
          : fail({max, min, mode}, usage);
      }
    },
    next(context) {
      const usage = parseFloat(
        (
          (context.javascriptHeap.totalMemory /
            context.javascriptHeap.availableMemory) *
          100
        ).toFixed(2)
      );
      if (mode === MODE_ALL) {
        return withinRange(min, max, usage)
          ? ok({max, min, mode}, usage)
          : fail({max, min, mode}, usage);
      } else {
        usages.push(usage);
      }
    }
  };
};

export const meta = {
  docs: {
    category: 'resource',
    description: 'Assert memory usage % is within a range',
    url: 'https://more-information-for-this-rule'
  },
  schema: {
    additionalProperties: false,
    properties: {
      max: {
        default: 50,
        minimum: 0,
        type: 'integer'
      },
      min: {
        default: 0,
        minimum: 0,
        type: 'integer'
      },
      mode: {
        default: 'mean',
        enum: ['mean', 'min', 'max', 'all'],
        type: 'string'
      }
    },
    type: 'object'
  }
};
