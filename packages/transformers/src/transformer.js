// @ts-check

import {_} from '@report-toolkit/common';

/**
 * @typedef {"json"|"csv"|"table"} Formatters
 * @typedef {{label: string, value: string, color?: string|Function}} Field
 * @typedef {import('@report-toolkit/report').Report} Report
 * @typedef {{defaultFormat?: Formatters, fields?: Field[], allowedFormats?: Formatters|Formatters[]}} TransformerOptions
 */

/**
 * @template T
 * @typedef {(...opts: any)=>import('rxjs/internal/types').OperatorFunction<Report,T>} TransformFunction<T>
 */

/**
 * Represents a Transformer having a transform() function and
 * metadata.
 * The only way to instantiate this function is to call
 * `createTransformer`, which is exported by this module.  This will
 * return a Proxy object which intercepts function calls to the instance
 * and delegates them to the `Transformer#transform` function.
 * This allows a reasonable way of attaching metadata to the Transformer
 * while making function contexts and method calls unnecessary.
 * @template T
 */
export class Transformer extends Function {
  /**
   * Sets defaults and instance props
   * @param {TransformFunction<T>} transform
   * @param {TransformerOptions} [opts] - Transformer options
   */
  constructor(transform, {allowedFormats, defaultFormat, fields} = {}) {
    super();
    this.transform = transform;
    this.fields = fields;
    this.defaultFormat =
      typeof allowedFormats === 'string' ? allowedFormats : defaultFormat;
    this.allowedFormats = _.castArray(allowedFormats);
  }

  static get [Symbol.species]() {
    return Function;
  }

  /**
   * Creates a Transformer
   * @template T
   * @param {TransformFunction<T>} transform - Transformer function
   * @param {TransformerOptions} opts - Transformer options
   * @returns {Transformer<T>}
   */
  static create(transform, opts = {}) {
    return new Proxy(new Transformer(transform, opts), {
      apply(target, thisArg, args) {
        return target.transform(...args);
      }
    });
  }
}

export const createTransformer = Transformer.create;
