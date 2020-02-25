/**
 * These are some globals for testing purposes.
 * AFAIK there is no way to do this with JavaScript.
 */

import sinon from 'sinon';

declare namespace NodeJS {
  interface Global {
    expect: any;
    proxyquire: any;
    sinon: any;
  }
}

declare var expect: any;
declare var proxyquire: any;
declare var sinon: sinon;
