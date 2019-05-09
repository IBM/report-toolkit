import rewiremock, {addPlugin, overrideEntryPoint, plugins} from 'rewiremock';

overrideEntryPoint(module);

addPlugin(plugins.mockThroughByDefault);
addPlugin(plugins.usedByDefault);
export default rewiremock;
