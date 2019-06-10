exports.meta = {
  docs: {
    description: 'Assert CPU usage is under or over specified threshold',
    category: 'resource',
    url: 'https://more-information-for-this-rule'
  },
  schema: {
    type: 'object',
    properties: {
      min: {
        type: 'integer',
        minimum: 0,
        maximum: 100,
        default: 0
      },
      max: {
        type: 'integer',
        minimum: 0,
        maximum: 100,
        default: 50
      },
      compute: {
        type: 'string',
        enum: ['mean', 'min', 'max', 'all'],
        default: 'mean'
      },
      mode: {
        type: 'string',
        enum: ['usage'],
        default: 'usage'
      }
    },
    additionalProperties: false
  }
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

const withinRange = (min, max, usage) => usage >= min && usage <= max;

const ok = ({compute, mode, min, max}, usage) => {
  return {
    message: `${hrMap[compute]} ${
      hrMap[mode]
    } (${usage}%) is within the allowed range ${min}-${max}`,
    data: {
      compute,
      usage,
      min,
      max
    },
    severity: 'info'
  };
};

const fail = ({compute, mode, min, max}, usage) => {
  return {
    message: `${hrMap[compute]} ${
      hrMap[mode]
    } (${usage}%) is outside the allowed range ${min}-${max}`,
    data: {
      compute,
      usage,
      min,
      max
    }
  };
};

exports.inspect = (config = {}) => {
  let {min, max, compute, mode} = config;
  mode = mode || 'usage';
  min = min || 0;
  max = max || 50;
  compute = compute || 'mean';
  const usages = [];
  return {
    next(context) {
      const usage = context.resourceUsage[fieldMap[mode]];
      if (compute === COMPUTE_ALL) {
        if (withinRange(min, max, usage)) {
          return ok({min, max, compute, mode}, usage);
        }
        return fail({min, max, compute, mode}, usage);
      } else {
        usages.push(usage);
      }
    },
    complete() {
      if (compute !== COMPUTE_ALL) {
        const usage = computations[compute](usages);
        if (withinRange(min, max, usage)) {
          return ok({min, max, compute, mode}, usage);
        }
        return fail({min, max, compute, mode}, usage);
      }
    }
  };
};
