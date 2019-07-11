import {
  _,
  constants,
  createDebugger,
  error,
  observable,
  symbols
} from '@gnostic/common';

import {AJV} from './ajv.js';
import {createRuleConfig} from './rule-config.js';

const {WARNING} = constants;
const {
  GNOSTIC_ERR_INVALID_RULE_CONFIG,
  GNOSTIC_ERR_INVALID_RULE_DEFINITION,
  GNOSTIC_ERR_INVALID_SCHEMA,
  GnosticError
} = error;
const {
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
} = observable;
const {kRuleFilepath, kRuleId, kRuleInspect, kRuleMeta} = symbols;

const debug = createDebugger('inspector', 'rule');

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

let ajv;

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
          : originalError.toString().trim(),
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

    if (!_.isFunction(ruleDef.inspect)) {
      throw GnosticError.create(
        GNOSTIC_ERR_INVALID_RULE_DEFINITION,
        `Definition for rule ${ruleDef.id ||
          ruleDef.filepath} must export an "inspect" function`
      );
    }
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
      return _.identity;
    }

    debug(`found schema for rule ${this.id}`, schema);
    ajv = ajv || AJV();
    const validate = ajv.compile(schema);

    if (ajv.errors) {
      throw GnosticError.create(
        GNOSTIC_ERR_INVALID_SCHEMA,
        `Schema for rule ${this.id} is invalid: ${ajv.errorsText()}`
      );
    }

    validatorMap.set(this, config => {
      debug(`validating ${this.id} with config`, config);
      validate(config);
      if (validate.errors) {
        const errors = ajv.errorsText(validate.errors, {
          dataVar: 'config'
        });
        throw GnosticError.create(
          GNOSTIC_ERR_INVALID_RULE_CONFIG,
          `Invalid configuration for rule "${this.id}": ${errors}`,
          {url: this.url}
        );
      }
      return config;
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
        const errored = new Set();
        const next = async context => handler.next(context);
        const complete = async () => handler.complete();
        return concat(
          contexts.pipe(
            mergeMap(context =>
              fromAny(next(context)).pipe(
                catchError(err => {
                  errored.add(context.filepath);
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
            single(context => !errored.has(context.filepath)),
            map(v => (_.isUndefined(v) ? {filepath: '(multiple files)'} : v)),
            catchError(() => of({filepath: '(multiple files)'})),
            pluck('filepath'),
            mergeMap(filepath =>
              fromAny(complete()).pipe(
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
          message = message.toString().trim();
          return compactMessage({
            config,
            data,
            filepath,
            id: this.id,
            message,
            originalError,
            severity
          });
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
        meta: {docs: {}}
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

  /**
   * Creates a `Rule` from a user-defined (or builtin) `RuleDefinition`, which
   * is the exports of a rule definition file.
   * @param {RuleDefinition} ruleDefinition - Rule definition
   * @param {Object} [opts] - Options
   * @param {string} [opts.filepath] - Filepath to rule definition, if available
   * @param {string} [opts.id] - ID of rule definition (derived from filepath), if available
   * @returns {Rule} New rule
   */
  static create(ruleDefinition, {filepath, id} = {}) {
    return new Rule({
      ..._.pick(['inspect', 'meta'], ruleDefinition),
      filepath,
      id
    });
  }

  toRuleConfig(config) {
    return createRuleConfig(_.get(this.id, _.get('rules', config)), this);
  }
}

/**
 * Creates a `Rule` from a user-defined (or builtin) `RuleDefinition`, which
 * is the exports of a rule definition file.
 * The same `Rule` cannot be created twice from the same definition.
 * @param {RuleDefinition} ruleDefinition - Rule definition
 * @param {Object} [opts] - Options
 * @param {string} [opts.filepath] - Filepath to rule definition, if available
 * @param {string} [opts.id] - ID of rule definition (derived from filepath), if available
 * @returns {Rule} New rule
 */
export const createRule = _.memoize(Rule.create);
