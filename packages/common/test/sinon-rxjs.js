import {EMPTY, from, of, throwError} from 'rxjs';
import sinon from 'sinon';

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
