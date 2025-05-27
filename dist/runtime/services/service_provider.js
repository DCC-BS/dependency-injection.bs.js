import { getKeyName } from "../helpers/helpers.js";
export class ServiceProvider extends Map {
  resolve(target) {
    const key = target.$injectKey;
    const instance = this.get(key);
    if (!instance) {
      throw new Error(`Service ${key} not registered`);
    }
    return instance;
  }
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  resolveFactory(target, ...args) {
    const instance = this.get(getKeyName(target));
    return instance.build(args);
  }
  resolveFactoryAsync(target, ...args) {
    const instance = this.get(getKeyName(target));
    if (!instance) {
      throw new Error(`Service factory ${target} not registered`);
    }
    return instance.build(args);
  }
  resolveNamed(key) {
    const instance = this.get(key);
    if (!instance) {
      throw new Error(`Service ${key} not registered`);
    }
    return instance;
  }
}
