import {_} from '@report-toolkit/common';

const DEFAULT_TRANSFORMER_METADATA = Object.freeze({
  fields: []
});

/**
 * @typedef {{label: string, key: sring}} Field
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
 */
class Transformer extends Function {
  /**
   *
   * @param {Function} transform
   * @param {Object} [meta]
   * @param {Field[]} [meta.fields]
   */
  constructor(transform, meta = {}) {
    super();
    meta = _.defaults(DEFAULT_TRANSFORMER_METADATA, meta);
    this._transform = transform;
    this._fields = meta.fields;
  }

  static get [Symbol.species]() {
    return Function;
  }

  get fields() {
    return this._fields;
  }

  transform(...args) {
    return this._transform(...args);
  }

  static create(transform, fields) {
    return new Proxy(new Transformer(transform, fields), {
      apply(target, thisArg, args) {
        return target.transform(...args);
      }
    });
  }
}

export const createTransformer = Transformer.create;
