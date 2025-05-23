import { defineNuxtModule, createResolver, addImportsDir } from '@nuxt/kit';

class ServiceProvider extends Map {
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

class ServiceProviderBuilder {
  /**
   * Map of service injection keys to their dependency nodes
   */
  dependencyGraph = /* @__PURE__ */ new Map();
  /**
   * Map of service keys to instances for quick lookup
   */
  instances = /* @__PURE__ */ new Map();
  /**
   * Register a service instance directly
   * This service is considered to have no dependencies
   * @param target The service type to register
   * @param instance The instance of the service
   */
  registerInstance(target, instance) {
    const key = target.$injectKey;
    if (this.instances.has(key)) {
      throw new Error(`Service ${key} already registered`);
    }
    const node = {
      serviceType: target,
      dependencies: [],
      isRegistered: true,
      instance
    };
    this.dependencyGraph.set(key, node);
    this.instances.set(key, instance);
  }
  registerNamedInstance(name, instance) {
    if (this.instances.has(name)) {
      throw new Error(`Service ${name} already registered`);
    }
    const node = {
      dependencies: [],
      isRegistered: true,
      instance
    };
    this.dependencyGraph.set(name, node);
    this.instances.set(name, instance);
  }
  /**
   * Register a service type for later instantiation
   * This extracts dependencies from constructor parameters
   * @param target The service type to register
   */
  register(target) {
    const key = target.$injectKey;
    if (this.dependencyGraph.has(key)) {
      throw new Error(`Service ${key} already registered`);
    }
    const dependencies = getParamNames(target);
    const node = {
      serviceType: target,
      dependencies,
      isRegistered: false
    };
    this.dependencyGraph.set(key, node);
  }
  /**
   * Get the dependency graph representation for visualization or analysis
   * @returns Simplified dependency graph showing services and their dependencies
   */
  getDependencyGraph() {
    const graph = {};
    for (const [key, node] of this.dependencyGraph.entries()) {
      graph[key] = [...node.dependencies];
    }
    return graph;
  }
  /**
   * Build the service provider by validating and resolving dependencies
   * @returns Map of service keys to their instances
   * @throws Error if any dependencies are missing or circular dependencies exist
   */
  build() {
    this.validateDependenciesExist();
    this.detectCircularDependencies();
    const sortedServices = this.topologicalSort();
    const provider = new ServiceProvider();
    for (const [key, instance] of this.instances.entries()) {
      provider.set(key, instance);
    }
    for (const serviceKey of sortedServices) {
      const node = this.dependencyGraph.get(serviceKey);
      if (!node) {
        throw new Error(`Service ${serviceKey} not found in graph`);
      }
      if (node.isRegistered) {
        continue;
      }
      const dependencies = node?.dependencies.map((dep) => {
        const instance2 = provider.get(dep);
        if (!instance2) {
          throw new Error(
            `Failed to resolve dependency ${dep} for service ${serviceKey}`
          );
        }
        return instance2;
      }) || [];
      if (!node.serviceType) {
        throw new Error(
          `Service type not found for service ${serviceKey}`
        );
      }
      const instance = new node.serviceType(...dependencies);
      node.isRegistered = true;
      node.instance = instance;
      provider.set(serviceKey, instance);
    }
    return provider;
  }
  /**
   * Check if all dependencies referenced by services are registered
   * @throws Error if any dependencies are missing
   */
  validateDependenciesExist() {
    for (const [key, node] of this.dependencyGraph.entries()) {
      for (const dep of node.dependencies) {
        if (!this.dependencyGraph.has(dep)) {
          throw new Error(
            `Service ${key} depends on ${dep}, but ${dep} is not registered`
          );
        }
      }
    }
  }
  /**
   * Detect circular dependencies in the dependency graph
   * @throws Error if circular dependencies are detected
   */
  detectCircularDependencies() {
    const visited = /* @__PURE__ */ new Set();
    const visiting = /* @__PURE__ */ new Set();
    const visit = (key, path) => {
      if (visited.has(key)) {
        return;
      }
      if (visiting.has(key)) {
        path.push(key);
        throw new Error(
          `Circular dependency detected: ${path.join(" -> ")}`
        );
      }
      visiting.add(key);
      path.push(key);
      const dependencies = this.dependencyGraph.get(key)?.dependencies || [];
      for (const dep of dependencies) {
        visit(dep, [...path]);
      }
      visiting.delete(key);
      visited.add(key);
    };
    for (const key of this.dependencyGraph.keys()) {
      if (!visited.has(key)) {
        visit(key, []);
      }
    }
  }
  /**
   * Sort the services in dependency order using topological sort
   * @returns Array of service keys in dependency order
   */
  topologicalSort() {
    const result = [];
    const visited = /* @__PURE__ */ new Set();
    const visiting = /* @__PURE__ */ new Set();
    const visit = (key) => {
      if (visited.has(key)) {
        return;
      }
      if (visiting.has(key)) {
        throw new Error(
          `Unexpected circular dependency involving ${key}`
        );
      }
      visiting.add(key);
      const dependencies = this.dependencyGraph.get(key)?.dependencies || [];
      for (const dep of dependencies) {
        visit(dep);
      }
      visiting.delete(key);
      visited.add(key);
      result.push(key);
    };
    for (const key of this.dependencyGraph.keys()) {
      if (!visited.has(key)) {
        visit(key);
      }
    }
    return result;
  }
}
function getParamNames(fn) {
  const str = fn.toString();
  const params = str.match(/constructor\s*\(([^)]*)\)/)?.[1] || "";
  return params.split(",").map((p) => p.trim()).filter(Boolean).map((p) => {
    const match = p.match(
      /(?:private|public|protected)?\s*(?:readonly)?\s*(\w+)\s*:\s*(\w+)/
    );
    return match ? match[2] : p;
  });
}

class ServiceOrchestrator {
  builderFactory = void 0;
  serviceProvider = void 0;
  setup(builderFactory) {
    this.builderFactory = builderFactory;
  }
  getProvider() {
    if (!this.serviceProvider) {
      if (!this.builderFactory) {
        throw new Error(
          "ServiceOrchestrator is not set up. Call setup() first."
        );
      }
      const builder = new ServiceProviderBuilder();
      this.builderFactory(builder);
      this.serviceProvider = builder.build();
    }
    return this.serviceProvider;
  }
}

const module = defineNuxtModule({
  meta: {
    name: "dependency-injection.bs.js",
    configKey: "dependency-injection.bs.js"
  },
  // Default configuration options of the Nuxt module
  defaults: {},
  setup(_options, _nuxt) {
    const resolver = createResolver(import.meta.url);
    addImportsDir(resolver.resolve("./runtime/composables"));
  }
});

export { ServiceOrchestrator, module as default };
