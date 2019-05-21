exports.meta = {
  docs: {
    description: 'Assert CPU usage mean over time',
    category: 'resource',
    url: 'https://more-information-for-this-rule'
  },
  schema: {},
  mode: 'temporal',
  messages: {}
};

exports.inspect = ({stream, util, config = {percent: 50}}) => {
  const {pluckProp, mean, filter, map, toArray} = util;

  return stream.pipe(
    pluckProp('resourceUsage.cpuConsumptionPercent'),
    toArray(),
    mean(),
    filter(mean => mean > config.percent),
    map(mean => ({
      message: `Mean CPU usage is greater than ${config.percent} (${mean})`
    }))
  );
};
