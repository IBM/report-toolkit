exports.meta = {
  docs: {
    description: 'Assert CPU usage is under or over specified threshold',
    category: 'resource',
    url: 'https://more-information-for-this-rule'
  },
  schema: {},
  mode: 'simple',
  messages: {}
};

const fieldMap = {
  all: ['userCpuSeconds', 'kernelCpuSeconds'],
  kernel: ['kernelCpuSeconds'],
  user: ['userCpuSeconds']
};

const hrMap = {
  kernel: 'Kernel CPU (ms)',
  user: 'User CPU (ms)',
  all: 'Kernel+User Avg CPU (ms)',
  over: 'over',
  under: 'under'
};

const modeMap = {
  over: (v, t) => v >= t,
  under: (v, t) => v <= t
};

exports.inspect = ({context, config} = {}) => {
  let {threshold, cpu, mode} = config;
  threshold = threshold || 1000;
  cpu = cpu || 'all';
  mode = mode || 'over';
  const usage =
    fieldMap[cpu].reduce(
      (acc, field, i, arr) =>
        i === arr.length - 1
          ? (acc + context.resourceUsage[field]) / arr.length
          : acc + context.resourceUsage[field],
      0
    ) * 1000;
  if (modeMap[mode](usage, threshold)) {
    return {
      message: `${hrMap[cpu]} is ${hrMap[mode]} the specified threshold`,
      data: {
        threshold,
        usage: mode === 'over' ? Math.ceil(usage) : Math.floor(usage)
      }
    };
  }
};
