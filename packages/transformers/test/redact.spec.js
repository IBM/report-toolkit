import {of} from '@report-toolkit/common/src/observable.js';

describe('@report-toolkit/transformers:redact', function() {
  let transform;
  let sandbox;
  let redactStub;

  beforeEach(function() {
    sandbox = sinon.createSandbox();
    redactStub = sandbox.stub();
    transform = proxyquire(require.resolve('../src/redact.js'), {
      '@report-toolkit/common': {
        redact: redactStub
      }
    }).transform;
  });

  afterEach(function() {
    sandbox.restore();
  });

  it('should delegate execution to common `redact()` function', async function() {
    await of({foo: 'bar'})
      .pipe(transform())
      .toPromise();
    expect(redactStub, 'was called');
  });
});
