import rewiremock, {addPlugin, overrideEntryPoint, plugins} from 'rewiremock';

import expect from 'unexpected';
import sinon from 'sinon';
import unexpectedRxJS from './unexpected-rxjs';
import unexpectedSinon from 'unexpected-sinon';

global.sinon = sinon;

global.expect = expect
  .clone()
  .use(unexpectedSinon)
  .use(unexpectedRxJS);

overrideEntryPoint(module);

addPlugin(plugins.usedByDefault);

rewiremock.forceCacheClear(true);
global.rewiremock = rewiremock;
