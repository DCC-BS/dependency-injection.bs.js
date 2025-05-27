import { getKeyName } from "../helpers/helpers.js";
export class ServiceProvider extends Map {
  resolve(target, ...args) {
    const key = getKeyName(target);
    const factory = this.get(key);
    if (!factory) {
      throw new Error(`Service ${key} not registered`);
    }
    return factory.build(args);
  }
  resolveAsync(target, ...args) {
    const key = getKeyName(target);
    const factory = this.get(key);
    if (!factory) {
      throw new Error(`Service ${key} not registered`);
    }
    return factory.build(args);
  }
}
