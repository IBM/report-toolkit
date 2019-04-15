const {isObservable, of} = require('rxjs');
const {ignoreElements, catchError, toArray, first} = require('rxjs/operators');

const pify = observable => observable.pipe(toArray()).toPromise();

exports.name = 'unexpected-rxjs';
exports.version = '0.0.0';
exports.installInto = expect => {
  expect.addType({
    base: 'object',
    name: 'Observable',
    identify: isObservable
  });

  expect.addAssertion(
    '<Observable> [not] to complete',
    (expect, observable) => {
      expect.errorMode = 'bubble';
      return expect(pify(observable), '[not] to be fulfilled');
    }
  );

  expect.addAssertion(
    '<Observable> [not] to emit value <any>',
    (expect, observable, any) => {
      expect.errorMode = 'bubble';
      return expect(
        observable.pipe(first(value => expect.equal(value, any))).toPromise(),
        'to be fulfilled'
      );
    }
  );

  expect.addAssertion(
    '<Observable> [not] to emit error <any>',
    (expect, observable, any) => {
      expect.errorMode = 'bubble';
      return expect(
        observable.pipe(catchError(of)).toPromise(),
        'when fulfilled',
        '[not] to contain',
        any
      );
    }
  );

  expect.addAssertion(
    '<Observable> [not] to complete with value [exhaustively] satisfying <any>',
    (expect, observable, any) => {
      expect.errorMode = 'bubble';
      return expect(
        observable.pipe(first(value => expect.equal(value, any))).toPromise(),
        'when fulfilled',
        'to [exhausively] satisfy',
        any
      );
    }
  );

  expect.addAssertion(
    '<Observable> [not] to emit error [exhaustively] satisfying <any>',
    (expect, observable, any) => {
      expect.errorMode = 'bubble';
      return expect(
        observable
          .pipe(
            ignoreElements(),
            catchError(of),
            toArray()
          )
          .toPromise(),
        'when fulfilled',
        '[not] to have an item [exhaustively] satisfying',
        any
      );
    }
  );

  expect.addAssertion(
    '<Observable> [not] to complete with values <any+>',
    (expect, observable, ...any) => {
      expect.errorMode = 'bubble';
      return expect(
        pify(observable),
        'when fulfilled',
        '[not] to contain',
        ...any
      );
    }
  );

  expect.addAssertion(
    '<Observable> [not] to complete without (values|values)',
    (expect, observable, ...any) => {
      expect.errorMode = 'bubble';
      return expect(pify(observable), 'when fulfilled', '[not] to be empty');
    }
  );

  expect.addAssertion(
    '<Observable> [not] to complete with values [exhaustively] satisfying <any+>',
    (expect, observable, ...any) => {
      expect.errorMode = 'bubble';
      return expect(
        pify(observable),
        'when fulfilled',
        '[not] to have items [exhaustively] satisfying',
        ...any
      );
    }
  );
};
