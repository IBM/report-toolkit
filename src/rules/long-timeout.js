const ms = require('ms');

exports.meta = {
  docs: {
    description: 'Warn about far-future callbacks in timeout queue',
    category: 'event-queue',
    url: 'https://more-information-for-this-rule'
  },
  schema: {
    type: 'object',
    properties: {
      threshold: {
        type: ['integer', 'string'],
        minimum: 0,
        default: 10000
      }
    },
    additionalProperties: false
  }
};

exports.inspect = ({threshold} = {}) => {
  threshold = typeof threshold === 'string' ? ms(threshold) : threshold;
  return context => {
    const {libuv} = context;
    return libuv
      .filter(
        handle =>
          handle.type === 'timer' &&
          handle.is_active &&
          handle.is_referenced &&
          !handle.expired &&
          handle.firesInMsFromNow >= threshold
      )
      .map(
        handle =>
          `libuv handle at address ${
            handle.address
          } is a timer with future expiry in ${ms(handle.firesInMsFromNow)}`
      );
  };
};
