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
    const instance = this.get(target);
    return instance.build(args);
  }
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  resolveFactoryAsync(target, ...args) {
    const instance = this.get(target);
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
