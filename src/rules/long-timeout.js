const ms = require('ms');

exports.meta = {
  docs: {
    description: 'Warn about far-future callbacks in timeout queue',
    category: 'event-queue',
    url: 'https://more-information-for-this-rule'
  },
  schema: {},
  messages: {}
};

exports.inspect = (config = {}) => {
  const threshold = config.threshold || 10000;
  return context => {
    const {libuv} = context;
    return libuv
      .filter(
        handle =>
          handle.type === 'timer' &&
          handle.is_active &&
          handle.is_referenced &&
          handle.firesInMsFromNow >= threshold
      )
      .map(
        handle =>
          `libuv handle at address ${handle.address} is ${
            handle.repeat ? 'an interval' : 'a timer'
          } with future expiry in ${ms(handle.firesInMsFromNow)}`
      );
  };
};
