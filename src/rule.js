import {
  catchError,
  concat,
  filter,
  from,
  fromAny,
  map,
  mergeMap,
  of,
  pluck,
  single,
  throwError
} from './observable';

import {WARNING} from './api';
import _ from 'lodash/fp';
import {ajv} from './ajv';
import {createDebugger} from './debug';

export const kRuleId = Symbol('ruleId');
export const kRuleMeta = Symbol('ruleMeta');
export const kRuleInspect = Symbol('ruleInspect');
export const kRuleFilepath = Symbol('ruleFilepath');

const debug = createDebugger(module);

/**
 * Removes falsy values, empty arrays and objects from a `Message`.
 * Does not remove `Error` objects (e.g., `originalError`)
 */
const compactMessage = _.omitBy(_.overEvery([_.negate(_.isError), _.isEmpty]));

/**
 * @typedef {Object} RuleDefinition
 * @property {Object} meta - (schema for `meta` prop)
 * @property {Function} inspect - Async function which receives `Context` object
 * and optional configuration
 */

/**
 * @typedef {Object} Message
 * @property {string} message - Message text
 * @property {?*} data - Optional extra data
 * @property {string} severity - Message severity
 * @property {?string} filepath - Filepath to report (if any)
 * @property {string} id - Rule ID
 */

/**
 * Map of Rules to config schema validation functions
 * @type {WeakMap<Rule,Function>}
 */
const validatorMap = new WeakMap();

/**
 * Operator that catches an Error emitted from a handler function and emits a
 * partial `Message` containing the error message, original error, and severity.
 * @todo WARNING may not be the right default.
 */
const catchHandlerError = (severity = WARNING) => observable =>
  observable.pipe(
    catchError(originalError =>
      of({
        message: _.isError(originalError)
          ? originalError.message
          : String(originalError).trim(),
        originalError,
        severity
      })
    )
  );

/**
 * A Rule which can be matched against a Context
 */
export class Rule {
  /**
   * Applies defaults, assigns some metadata.
   * @param {RuleDefinition} ruleDef
   */
  constructor(ruleDef) {
    ruleDef = Rule.applyDefaults(ruleDef);
    Object.assign(this, {
      [kRuleInspect]: ruleDef.inspect,
      [kRuleMeta]: ruleDef.meta,
      [kRuleId]: ruleDef.id,
      [kRuleFilepath]: ruleDef.filepath
    });
  }

  get id() {
    return this[kRuleId];
  }

  get description() {
    return _.get('docs.description', this.meta);
  }

  get url() {
    return _.get('docs.url', this.meta);
  }

  get schema() {
    return _.get('schema', this.meta);
  }

  get filepath() {
    return this[kRuleFilepath];
  }

  get meta() {
    return this[kRuleMeta];
  }

  /**
   * Lazily-created function which validates the schema itself when first
   * referenced, creates a config-validation function, caches it, then asserts
   * any user-supplied config is valid using said function.
   * @function
   * @param {Object} [config] - User-supplied config to validate
   * @throws If user-supplied config is invalid.
   */
  get validate() {
    if (validatorMap.has(this)) {
      debug(`returning cached validator for rule ${this.id}`);
      return validatorMap.get(this);
    }

    const schema = this.schema;

    if (!schema) {
      return _.noop;
    }

    debug(`found schema for rule ${this.id}`, schema);
    const validate = ajv.compile(schema);

    if (ajv.errors) {
      throw new Error(
        `Schema for rule ${this.id} is invalid: ${ajv.errorsText()}`
      );
    }

    validatorMap.set(this, config => {
      debug(`validating ${this.id} with config`, config);
      validate(config);
      if (ajv.errors) {
        throw new Error(`Invalid rule configuration: ${ajv.errorsText()}`);
      }
    });

    return validatorMap.get(this);
  }

  /**
   * Calls the `inspect()` function of a Rule impl, which will return one or
   * more "handler" functions. Note `inspect()` might return a `Promise` which
   * resolves to the "handler" functions.
   * @param {Object} [config] Optional rule-specific config
   * @returns {Promise<Object|Function>}
   */
  async handlers(config = {}) {
    return this[kRuleInspect].call(null, config);
  }

  /**
   * Given a stream of Report objects and an optional configuration, execute the
   * `inspect()` function of the rule definition, which should return a "next"
   * handler function, or an object having handler function props `next` and
   * `complete`.
   * 1. Normalize the result of the `inspect()` so we can make assumptions about
   *    the shape of the returned value.
   * 2. For each `Report` (`context`), run the `next` handler as if it returned
   *    a `Promise`. This handler is passed the `context`, and any `Error`s
   *    thrown are trapped. The handler may return a string ("message"), a
   *    partial `Message` object, `Array` thereof, or a `Promise` resolving to
   *    any of that stuff, or just `undefined` in the case of "nothing to
   *    mention"
   * 3. Return values are correlated with the filepath of the context. Note that
   *    `Report` objects may not *have* a filepath if they were not loaded from
   *    file.
   * 4. Once all `Report`s have passed through the `next` handler, call the
   *    `complete` handler.  It receives no `context`, and can be used in tandem
   *    with `next` to perform aggregation. Supports the same return values as
   *    `next`
   * 5. Finally, filter out empty/falsy partial `Message`s (e.g., those without
   *    actual `string` `message` props), and normalize the `Message` by adding
   *    relevant metadata (`Rule` ID, user-supplied config used, default
   *    severity, etc.)
   * @param {Observable<Report>} contexts - Report objects
   * @param {Object} [config] - Optional rule-specific config
   * @returns {Observable<Message>}
   */
  inspect({contexts, config = {}}) {
    return from(this.handlers(config)).pipe(
      Rule.normalizeHandler(),
      mergeMap(handler => {
        // for this handler, the set of contexts that threw an error
        // when the handler ran.
        // these errors are *not* inspection results, but rather expected
        // or uncaught exceptions (or rejections) thrown out of the handler code.
        const errored = new WeakSet();
        return concat(
          contexts.pipe(
            mergeMap(context =>
              fromAny((async context => handler.next(context))(context)).pipe(
                catchError(err => {
                  errored.add(context);
                  return throwError(err);
                }),
                catchHandlerError(),
                map(message => [message, context.filepath])
              )
            )
          ),

          // if we only have a single context *which has not errored*, use its
          // filepath, otherwise emit "(multiple files)" for the `filepath`.
          // single() returns `undefined` if all contexts have errors, and it
          // throws if multiple contexts *don't* have errors; we have to account
          // for both.
          contexts.pipe(
            single(context => !errored.has(context)),
            map(v => (_.isUndefined(v) ? {filepath: '(multiple files)'} : v)),
            catchError(() => of({filepath: '(multiple files)'})),
            pluck('filepath'),
            mergeMap(filepath =>
              fromAny((async () => handler.complete())()).pipe(
                catchHandlerError(),
                map(message => [message, filepath])
              )
            )
          )
        );
      }),
      filter(([message]) => message),
      this.normalizeMessage(config)
    );
  }

  /**
   * Operator which normalizes a `Message` and adds metadata to it.
   * @param {Object} [config] - User-supplied config, if any
   */
  normalizeMessage(config) {
    const id = this.id;
    return observable =>
      observable.pipe(
        map(([msg, filepath]) => {
          let data, severity, originalError, message;
          if (_.isObject(msg)) {
            data = msg.data;
            severity = msg.severity;
            originalError = msg.originalError;
            message = msg.message;
          } else {
            message = msg;
          }
          message = String(message).trim();
          const result = compactMessage({
            originalError,
            message,
            filepath,
            id,
            severity,
            data,
            config
          });
          return result;
        })
      );
  }

  /**
   * Applies defaults to a rule definition during `Rule` construction.
   * @param {Partial<RuleDefinition>} ruleDef - Raw rule definition
   * @returns {RuleDefinition}
   */
  static applyDefaults(ruleDef) {
    return _.defaultsDeep(
      {
        meta: {docs: {}},
        inspect: () => {
          throw new Error(
            `Rule "${ruleDef.id}" has no "inspect" implementation`
          );
        }
      },
      ruleDef
    );
  }

  /**
   * Operator.  Given a "handler" (returned by the rule definition's `inspect`
   * function), normalize it into an object (since it may be just a function)
   */
  static normalizeHandler() {
    return observable =>
      observable.pipe(
        map(handler =>
          _.isFunction(handler)
            ? {complete: _.noop, next: handler}
            : {complete: _.noop, ...handler}
        )
      );
  }
}

/**
 * Creates a `Rule` from a user-defined (or builtin) `RuleDefinition`, which
 * is the exports of a rule file.
 * The same `Rule` cannot be created twice from the same definition.
 * @param {RuleDefinition} ruleDef - Rule definition
 * @returns {Rule} New rule
 */
Rule.create = _.memoize(ruleDef => new Rule(ruleDef));
