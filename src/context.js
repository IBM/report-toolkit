import _ from 'lodash/fp';
import {from} from './observable';
const issueQueueMap = new WeakMap();
const ruleConfigMap = new WeakMap();

export class Context {
  report(message, data) {
    const queue = issueQueueMap.get(this);
    queue.push({message, data});
    return this;
  }

  flush() {
    const queue = issueQueueMap.get(this);
    issueQueueMap.set(this, []);
    return from(queue);
  }

  static create(report, ruleConfig) {
    const context = new Context(report);
    const proxy = new Proxy(context, {
      get: (target, prop) => {
        if (_.hasIn(prop, target)) {
          return Reflect.get(target, prop);
        }
        return Reflect.get(report, prop);
      }
    });
    ruleConfigMap.set(proxy, ruleConfig);
    issueQueueMap.set(proxy, []);
    return proxy;
  }
}
