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
      timeout: {
        type: ['integer', 'string'],
        minimum: 0,
        default: 10000
      }
    },
    additionalProperties: false
  }
};

exports.inspect = ({timeout} = {}) => {
  timeout = typeof timeout === 'string' ? ms(timeout) : timeout;
  return context => {
    const {libuv} = context;
    return libuv
      .filter(
        handle =>
          handle.type === 'timer' &&
          !handle.expired &&
          handle.is_referenced &&
          handle.firesInMsFromNow >= timeout
      )
      .map(
        handle =>
          `libuv handle at address ${
            handle.address
          } is a timer with future expiry in ${ms(handle.firesInMsFromNow)}`
      );
  };
};
