import {_} from '@report-toolkit/common';

/**
 * @type {Partial<TransformerMeta>}
 */
const DEFAULT_TRANSFORMER_META = Object.freeze({
  input: ['report']
});

/**
 * @typedef {"json"|"csv"|"table"} Formatters
 * @typedef {{label: string, value: string|function(any): string, color?: string|function(any): string}} Field
 * @typedef {import('@report-toolkit/report').Report} Report
 */

/**
 * @typedef {{id: string, description?: string, input?: string[], output: string, fields?: Field[], alias?: string|string[]}} TransformerMeta
 */

/**
 * @template T,U
 * @typedef {(...opts: any)=>import('rxjs/internal/types').OperatorFunction<T,U>} TransformFunction
 */

/**
 * Represents a Transformer having a transform() function and
 * metadata.
 * The resulting object can be called as a function, which executes the
 * `transform()` method--by the magic of Proxy.
 * This allows a reasonable way of attaching metadata to the Transformer
 * while making function contexts and method calls unnecessary.
 * @template T,U
 */
export class Transformer extends Function {
  /**
   * Sets defaults and instance props
   * @param {TransformFunction<T,U>} transform
   * @param {TransformerMeta} meta - Transformer options
   */
  constructor(transform, meta) {
    super();
    /**
     * @type {TransformerMeta}
     */
    this._meta = _.defaultsDeep(DEFAULT_TRANSFORMER_META, meta);
    /**
     * @type {TransformFunction<T,U>}
     */
    this._transform = transform;

    return new Proxy(this, {
      apply(target, thisArg, args) {
        return target._transform(...args);
      }
    });
  }

  get meta() {
    return this._meta;
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

  get fields() {
    return this._meta.fields;
  }

  set fields(fields) {
    this._meta.fields = fields;
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

export const createTransformer = Transformer.create;
