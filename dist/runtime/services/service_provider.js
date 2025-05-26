export class ServiceProvider extends Map {
  resolve(target) {
    const key = target.$injectKey;
    const instance = this.get(key);
    if (!instance) {
      throw new Error(`Service ${key} not registered`);
    }
    return instance;
  }
  resolveNamed(key) {
    const instance = this.get(key);
    if (!instance) {
      throw new Error(`Service ${key} not registered`);
    }
    return instance;
  }
}
