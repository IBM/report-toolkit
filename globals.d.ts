declare namespace NodeJS {
  interface Global {
    expect: Function;
    proxyquire: Function;
    sinon: Sinon;
  }
}

declare var expect: Function;
declare var proxyquire: Function;
declare var sinon: Sinon;
