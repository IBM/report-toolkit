import {_, constants} from '@gnostic/common';
const {ERROR, MULTIPLE_FILEPATHS} = constants;

export class Message {
  constructor(opts = {}) {
    const {
      data,
      filepath,
      id,
      isAggregate,
      message,
      originalError,
      config,
      severity = ERROR
    } = _.omitBy(
      _.overEvery([_.negate(_.isError), _.negate(_.isBoolean), _.isEmpty]),
      opts
    );

    this.message = message.toString();
    this.severity = severity;
    this.id = id;

    if (config) {
      this.config = config;
    }

    if (isAggregate) {
      this.filepath = MULTIPLE_FILEPATHS;
    } else if (filepath) {
      this.filepath = filepath;
    }

    if (originalError) {
      this.originalError = originalError;
    }

    if (data) {
      this.data = data;
    }
  }

  isNonEmpty() {
    return Boolean(this.message.trim());
  }

  toString() {
    return this.message;
  }
}

export const createMessage = (
  message,
  {filepath, id, isAggregate = false, config = {}}
) => {
  message = _.isString(message) ? {message} : message;
  return new Message({
    ...message,
    config,
    filepath,
    id,
    isAggregate
  });
};
