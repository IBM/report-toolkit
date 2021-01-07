import {_, constants, createDebugger} from '@report-toolkit/common';

const debug = createDebugger('inspector', 'message');
const {ERROR, MULTIPLE_FILEPATHS} = constants;

const compactMessageOptions = _.omitBy(
  _.overEvery([_.negate(_.isError), _.negate(_.isBoolean), _.isEmpty])
);

export class Message {
  /**
   *
   * @param {Partial<MessageOptions>} opts
   */
  constructor(opts = {}) {
    const {
      data,
      filepath,
      id,
      isAggregate,
      message,
      error,
      config,
      severity = ERROR
    } = compactMessageOptions(opts);

    if (message) {
      this.message = message.toString();
    } else {
      debug('creating empty Message from opts:', opts);
    }
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

    if (error) {
      this.error = error;
    }

    if (data) {
      this.data = data;
    }
  }

  isNonEmpty() {
    return Boolean(this.message && this.message.trim());
  }

  toString() {
    return this.message;
  }
}

/**
 * Create a {@link Message} to be displayed to the user. Used by Rule implementations. Calls without either `message` or a `message` prop on a provided {@link MessageOptions} object will be result in a {@link Message} which will be ignored.}
 * @param {RawMessage} message - Message to display to user, or {@link MessageOptions} object with `message` prop
 * @param {Partial<MessageOptions>} [opts] - Options
 */
export const createMessage = (message, opts = {}) => {
  message = _.isString(message) ? {message} : message;
  return Object.freeze(
    new Message({
      ...message,
      ...opts
    })
  );
};

/**
 * Allowed extra options when creating a {@link Message}
 * @typedef {object} MessageOptions
 * @property {object} data - Extra data
 * @property {string} filepath - Filepath of associated report, if applicable. Ignored if `isAggregate` is `true`
 * @property {string} id - ID of Rule which created the {@link Message}
 * @property {boolean} isAggregate - `true` if {@link Message} references multiple files
 * @property {Error} error - If present, an `Error` which was thrown by the Rule
 * @property {object} config - Rule configuration
 * @property {constants.ERROR|constants.WARNING|constants.INFO} severity - The severity of the {@link Message}
 * @property {string} message - The message text itself, if first param not passed to {@link Message.createMessage}.
 */

/**
 * @typedef {string|Partial<MessageOptions>} RawMessage
 */

/**
 * @typedef {import('@report-toolkit/common/src/constants')} constants
 */
