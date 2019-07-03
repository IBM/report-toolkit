import './sinon-rxjs.js';

import proxyquire from 'proxyquire';
import sinon from 'sinon';
import unexpected from 'unexpected';
import * as unexpectedRxJS from 'unexpected-rxjs';
import unexpectedSinon from 'unexpected-sinon';

global.sinon = sinon;

const expect = (global.expect = unexpected
  .clone()
  .use(unexpectedSinon)
  .use(unexpectedRxJS));

proxyquire.noPreserveCache();

global.proxyquire = proxyquire;

expect.addAssertion(
  '<function> to (throw|throw error|throw exception) with code <string>',
  (expect, subject, code) => {
    return expect(subject, 'to throw', {code});
  }
);
