import expect from 'unexpected';
import proxyquire from 'proxyquire';
import sinon from 'sinon';
import unexpectedRxJS from './unexpected-rxjs';
import unexpectedSinon from 'unexpected-sinon';

global.sinon = sinon;

global.expect = expect
  .clone()
  .use(unexpectedSinon)
  .use(unexpectedRxJS);

proxyquire.noPreserveCache();

global.proxyquire = proxyquire;
