import {_, colors, error} from '@report-toolkit/common';

const {RTKERR_INVALID_TRANSFORMER_PIPE, createRTkError} = error;
const FIELD_COLORS = Object.freeze(['cyan', 'magenta', 'blue', 'green']);

/**
 * @type {Partial<TransformerMeta>}
 */
const DEFAULT_TRANSFORMER_META = Object.freeze({
  alias: [],
  input: ['report']
});

const optionMap = new WeakMap();

/**
 * Represents a Transformer having a transform() function and
 * metadata.
 * @template T,U
 */
class Transformer {
  /**
   * Sets defaults and instance props
   * @param {TransformFunction<T,U>} transform
   * @param {TransformerMeta} meta - Transformer metdata
   */
  constructor(transform, meta) {
    /**
     * @type {TransformerMeta}
     */
    this._meta = _.defaultsDeep(DEFAULT_TRANSFORMER_META, meta);
    /**
     * @type {TransformFunction<T,U>}
     */
    this._transform = transform;
  }

  get id() {
    return this._meta.id;
  }

  get input() {
    return this._meta.input;
  }

  get output() {
    return this._meta.output;
  }

  get defaults() {
    return this._meta.defaults;
  }

  /**
   * Pipe one Transformer to another
   * @param {Transformer} transformer
   * @returns {Transformer}
   */
  pipe(transformer) {
    if (!this.canPipeTo(transformer)) {
      throw createRTkError(
        RTKERR_INVALID_TRANSFORMER_PIPE,
        `Transformer "${this.id}" cannot pipe to transformer "${transformer.id}"`
      );
    }
    return transformer.pipeFrom(this);
  }

  transform(opts = {}) {
    const defaults = [this.defaults, opts];
    opts = _.defaultsDeep(opts, this.defaults);
    if (this._source && optionMap.has(this._source)) {
      const sourceOpts = optionMap.get(this._source);
      defaults.push({fields: sourceOpts.fields});
    }
    opts = _.defaultsDeepAll(defaults);
    if (opts.fields) {
      opts = {...opts, fields: Transformer.normalizeFields(opts.fields)};
    }
    optionMap.set(this, opts);
    return this._transform(opts);
  }

  /**
   *
   * @param {Transformer} transformer
   * @returns {Transformer}
   */
  pipeFrom(transformer) {
    this._source = transformer;
    return this;
  }

  /**
   * Returns `true` if this Transformer can pipe to another
   * @param {Transformer} transformer - Transformer to compare
   */
  canPipeTo(transformer) {
    return _.includes(this.output, transformer.input);
  }

  canBeginWith(type) {
    return _.includes(type, this.input);
  }

  canEndWith(type) {
    return this.output === type;
  }

  /**
   * Creates a Transformer
   * @template T,U
   * @param {TransformFunction<T,U>} transform - Transformer function
   * @param {TransformerMeta} opts - Transformer options
   * @returns {Transformer<T,U>}
   */
  static create(transform, opts) {
    return new Transformer(transform, opts);
  }
}

Transformer.normalizeFields = _.pipe(
  _.toPairs,
  _.map(
    /**
     * @param {[number, TransformerField]} value
     */
    ([idx, field]) => {
      // a field can have a string `color`, no `color`, or a function which accepts a `row` and returns a string.
      // likewise, it can have a `value` function which accepts a `row` and returns a value, or just a string, which
      // corresponds to a property of the `row` object.
      const fieldColor = field.color || FIELD_COLORS[idx % FIELD_COLORS.length];
      const colorFn = _.isFunction(fieldColor)
        ? (row, value) => {
            // the function might not return a color
            const color =
              colors[fieldColor(row)] ||
              FIELD_COLORS[idx % FIELD_COLORS.length];
            return colors[color](value);
          }
        : (row, value) => colors[/** @type {string} */ (fieldColor)](value);
      const valueFn = _.isFunction(field.value)
        ? row => {
            // yuck
            const fn =
              /**
               * @type {function(typeof row): string}
               */ (field.value);
            return fn(row);
          }
        : _.get(field.value);
      return {
        ...field,
        value: row => colorFn(row, valueFn(row))
      };
    }
  )
);

export {Transformer};
export const createTransformer = Transformer.create;

/**
 * @typedef {"json"|"csv"|"table"} Formatters
 * @typedef {{label: string, value: string|function(any): string, color?: string|function(any): string}} TransformerField
 * @typedef {import('@report-toolkit/report').Report} Report
 */

/**
 * @typedef {{id: string, description?: string, input?: string[], output: string, alias?: string[], defaults?: any}} TransformerMeta
 */

/**
 * @template T,U
 * @typedef {(opts?: object)=>import('rxjs/internal/types').OperatorFunction<T,U>} TransformFunction
 */
