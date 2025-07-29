export class ServiceFactory {
  constructor(key, node, injectedFactories) {
    this.key = key;
    this.node = node;
    this.injectedFactories = injectedFactories;
  }
  build(...args) {
    if (this.node.instance) {
      return this.node.instance;
    }
    if (!this.node.serviceType) {
      throw new Error(`Service type not found for service ${this.key}`);
    }
    const resovledServices = this.injectedFactories.map(
      (service) => service.build()
    );
    let instance;
    if (this.node.isFactory) {
      const factoryType = this.node.serviceType;
      const factory = new factoryType(...resovledServices);
      instance = factory.build(...args);
    } else {
      instance = new this.node.serviceType(
        ...[...resovledServices, ...args]
      );
    }
    if (this.node.lifetime === "singleton") {
      this.node.instance = instance;
    }
    return instance;
  }
}
