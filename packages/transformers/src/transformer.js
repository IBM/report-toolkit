/**
 * @module @report-toolkit/transformers
 */
/**
 * do not remove this comment (for typedoc)
 */
import {_, colors, createDebugger, error} from '@report-toolkit/common';
const {RTKERR_INVALID_TRANSFORMER_PIPE, createRTkError} = error;
const FIELD_COLORS = Object.freeze(['cyan', 'magenta', 'blue', 'green']);

const debug = createDebugger('transformers', 'transformer');

/**
 * @type {Partial<TransformerMeta>}
 */
const DEFAULT_TRANSFORMER_META = Object.freeze({
  alias: [],
  input: ['report']
});

const configMap = new WeakMap();

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
   * @param {object} [config] - Transformer config
   */
  constructor(transform, meta, config = {}) {
    /**
     * @type {TransformerMeta}
     */
    this._meta = _.defaultsDeep(DEFAULT_TRANSFORMER_META, meta);
    /**
     * @type {TransformFunction<T,U>}
     */
    this._transform = transform;

    if (config.fields) {
      config.fields = Transformer.normalizeFields(config.fields);
    }
    configMap.set(this, config);

    debug(`created Transform with id "${meta.id}" and config %O`, config);
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

  transform() {
    let defaults = [this.defaults];
    if (this._source && configMap.has(this._source)) {
      const sourceOpts = configMap.get(this._source);
      defaults = _.defaults({fields: sourceOpts.fields}, defaults);
    }
    return this._transform(_.defaultsDeep(defaults, configMap.get(this)));
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
   * @param {TransformerMeta} meta - Transformer meta
   * @param {object} [config] - Transformer config
   * @returns {Transformer<T,U>}
   */
  static create(transform, meta, config = {}) {
    return new Transformer(transform, meta, config);
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
            const result = /** @type {((arg0: any) => string)} */ (fieldColor)(
              row
            );
            const color = colors[result]
              ? result
              : FIELD_COLORS[idx % FIELD_COLORS.length];
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
 * @typedef {import('@report-toolkit/common').Report} Report
 */

/**
 * @typedef {{id: string, description?: string, input?: string[], output: string, alias?: string[], defaults?: any}} TransformerMeta
 */

/**
 * @template T,U
 * @typedef {(opts?: object)=>import('rxjs/internal/types').OperatorFunction<T,U>} TransformFunction
 */
