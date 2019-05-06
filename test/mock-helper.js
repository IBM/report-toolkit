import rewiremock, {addPlugin, overrideEntryPoint, plugins} from 'rewiremock';

overrideEntryPoint(module);

addPlugin(plugins.mockThroughByDefault);
export default rewiremock;
