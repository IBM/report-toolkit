import ms from 'ms';

export const meta = {
  docs: {
    category: 'event-queue',
    description: 'Warn about far-future callbacks in timeout queue',
    url: 'https://more-information-for-this-rule'
  },
  schema: {
    additionalProperties: false,
    properties: {
      timeout: {
        default: 10000,
        minimum: 0,
        type: ['integer', 'string']
      }
    },
    type: 'object'
  }
};

export const inspect = ({timeout} = {}) => {
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
