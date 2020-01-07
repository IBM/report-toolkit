import {EMPTY, from, of, throwError} from 'rxjs';
import sinon from 'sinon';

const identity = value => value;

sinon.addBehavior('returnsObservableOf', (fake, ...value) => {
  fake.returns(of(...value));
});

sinon.addBehavior('returnsObservableFrom', (fake, value = []) => {
  fake.returns(from(value));
});

sinon.addBehavior('returnsObservableError', (fake, value = new Error()) => {
  fake.returns(throwError(value));
});

sinon.addBehavior('returnsEmptyObservable', fake => {
  fake.returns(EMPTY);
});

sinon.addBehavior(
  'returnsOperatorFunction',
  (fake, pipe = identity, ...morePipes) => {
    fake.returns(observable => observable.pipe(pipe, ...morePipes));
  }
);
