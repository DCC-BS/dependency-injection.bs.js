/**
 * Class for building and validating service dependency graphs
 * Handles registration of services and their dependencies
 */
import { getKeyName, type InjectKey } from "../helpers/helpers";
import type { DependencyNode, ServiceLifetime } from "./dependency_node";
import { ServiceFactory } from "./service_factory";
import {
    type IServiceProvider,
    ServiceProvider,
    type ServiceType,
} from "./service_provider";

export interface IServiceProviderBuilder {
    /**
     * Register an instance of a service with no dependencies
     */
    registerInstance<T>(target: InjectKey<T>, instance: T): void;

    /**
     * Register a service type that will be instantiated later during building
     */
    register<T>(target: ServiceType<T>): void;

    /**
     * Register a factory function that builds a service instance
     * @param factory The factory function to create the service
     * @param inject Dependencies required by the factory
     * @param key Unique key for the service
     */
    registerFactory<T>(
        factory: (...args: any[]) => T,
        inject: InjectKey<unknown>[],
        key: InjectKey<T>,
    ): void;

    /**
     * Register an asynchronous factory function that builds a service instance
     * @param factory The factory function to create the service
     * @param inject Dependencies required by the factory
     * @param key Unique key for the service
     * */
    registerAsyncFactory<T>(
        factory: (...args: any[]) => Promise<T>,
        inject: InjectKey<unknown>[],
        key: InjectKey<T>,
    ): void;

    build(): IServiceProvider;
}

/**
 * Builder class for constructing a dependency graph of services
 * Allows for validation that all required dependencies are properly registered
 */
export class ServiceProviderBuilder implements IServiceProviderBuilder {
    /**
     * Map of service injection keys to their dependency nodes
     */
    private dependencyGraph = new Map<string, DependencyNode<unknown>>();

    /**
     * Map of service keys to instances for quick lookup
     */
    private instances = new Map<string, unknown>();

    public get registerdKeys(): string[] {
        return Array.from(this.dependencyGraph.keys());
    }

    /**
     * Register a service instance directly
     * This service is considered to have no dependencies
     * @param target The service type to register
     * @param instance The instance of the service
     */
    public registerInstance<T>(
        target: InjectKey<T>,
        instance: T,
        lifetime: ServiceLifetime = "singleton",
    ): void {
        const key = getKeyName(target);

        // Check if already registered
        if (this.instances.has(key)) {
            throw new Error(`Service ${key} already registered`);
        }

        // Create a dependency node without dependencies
        const node: DependencyNode<T> = {
            dependencies: [],
            isRegistered: false,
            isFactory: false,
            instance,
            lifetime,
        };

        // Store in both maps
        this.dependencyGraph.set(key, node);
        this.instances.set(key, instance);
    }

    /**
     * Register a service type for later instantiation
     * This extracts dependencies from constructor parameters
     * @param target The service type to register
     */
    public register<T>(
        target: ServiceType<T>,
        lifetime: ServiceLifetime = "singleton",
    ): void {
        const key = target.$injectKey;

        // Check if already registered
        if (this.dependencyGraph.has(key)) {
            throw new Error(`Service ${key} already registered`);
        }

        // Extract parameter names from constructor
        const dependencies = getParamNames(target);

        // Create dependency node
        const node: DependencyNode<T> = {
            serviceType: target,
            dependencies,
            isRegistered: false,
            isFactory: false,
            lifetime,
        };

        // Add to dependency graph
        this.dependencyGraph.set(key, node);
    }

    public registerFactory<T>(
        factory: (...args: any[]) => T,
        inject: InjectKey<unknown>[],
        key: InjectKey<T>,
        lifetime: ServiceLifetime = "singleton",
    ): void {
        const keyName = getKeyName(key);

        // Check if already registered
        if (this.dependencyGraph.has(keyName)) {
            throw new Error(`Service ${keyName} already registered`);
        }

        const factoryClass = class {
            static $injectKey = keyName;
            static $inject = inject;

            args: unknown[];

            constructor(...args: unknown[]) {
                this.args = args;
            }

            build(...args: any[]): T {
                return factory(...[...this.args, ...args]);
            }
        };

        // Create a dependency node for the factory
        const node: DependencyNode<unknown> = {
            serviceType: factoryClass,
            dependencies: getInjectKeys(inject),
            isRegistered: false,
            isFactory: true,
            lifetime: lifetime,
        };

        // Add to dependency graph
        this.dependencyGraph.set(keyName, node);
    }

    public registerAsyncFactory<T>(
        factory: (...args: any[]) => Promise<T>,
        inject: InjectKey<unknown>[],
        key: InjectKey<T>,
        lifetime: ServiceLifetime = "singleton",
    ): void {
        const keyName = getKeyName(key);

        // Check if already registered
        if (this.dependencyGraph.has(keyName)) {
            throw new Error(`Service ${key} already registered`);
        }
        const factoryClass = class {
            static $injectKey = keyName;
            static $inject = inject;
            args: unknown[];
            constructor(...args: unknown[]) {
                this.args = args;
            }

            async build(...args: any[]): Promise<T> {
                return factory(...[...this.args, ...args]);
            }
        };
        // Create a dependency node for the factory
        const node: DependencyNode<unknown> = {
            serviceType: factoryClass,
            dependencies: getInjectKeys(inject),
            isRegistered: false,
            isFactory: true,
            lifetime,
        };

        // Add to dependency graph
        this.dependencyGraph.set(keyName, node);
    }

    /**
     * Get the dependency graph representation for visualization or analysis
     * @returns Simplified dependency graph showing services and their dependencies
     */
    public getDependencyGraph(): Record<string, string[]> {
        const graph: Record<string, string[]> = {};

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
    public build(): IServiceProvider {
        // First check that all dependencies are registered as services
        this.validateDependenciesExist();

        // Then check for circular dependencies
        this.detectCircularDependencies();

        // Get a topologically sorted list of services
        const sortedServices = this.topologicalSort();

        // Build all unregistered services in dependency order
        const provider = new ServiceProvider();

        // Then instantiate remaining services in correct dependency order
        for (const serviceKey of sortedServices) {
            const node = this.dependencyGraph.get(serviceKey);

            if (!node) {
                throw new Error(`Service ${serviceKey} not found in graph`);
            }

            // Skip if already registered
            if (node.isRegistered) {
                continue;
            }

            // Resolve dependencies
            const dependencies = node?.dependencies.map((dep) => {
                const factory = provider.get(dep);

                if (!factory) {
                    throw new Error(
                        `Failed to resolve dependency ${dep} for service ${serviceKey}`,
                    );
                }

                return factory;
            });

            // Create instance
            if (!node.instance && !node.serviceType) {
                throw new Error(
                    `Service type not found for service ${serviceKey}`,
                );
            }

            const factory = new ServiceFactory(serviceKey, node, dependencies);

            // Register instance
            node.isRegistered = true;
            provider.set(serviceKey, factory);
        }

        return provider;
    }

    /**
     * Check if all dependencies referenced by services are registered
     * @throws Error if any dependencies are missing
     */
    private validateDependenciesExist(): void {
        for (const [key, node] of this.dependencyGraph.entries()) {
            for (const dep of node.dependencies) {
                if (!this.dependencyGraph.has(dep)) {
                    throw new Error(
                        `Service ${key} depends on ${dep}, but ${dep} is not registered`,
                    );
                }
            }
        }
    }

    /**
     * Detect circular dependencies in the dependency graph
     * @throws Error if circular dependencies are detected
     */
    private detectCircularDependencies(): void {
        const visited = new Set<string>();
        const visiting = new Set<string>();

        const visit = (key: string, path: string[]): void => {
            // If already processed, skip
            if (visited.has(key)) {
                return;
            }

            // If currently being visited, we found a cycle
            if (visiting.has(key)) {
                path.push(key);
                throw new Error(
                    `Circular dependency detected: ${path.join(" -> ")}`,
                );
            }

            // Mark as being visited
            visiting.add(key);
            path.push(key);

            // Visit all dependencies
            const dependencies =
                this.dependencyGraph.get(key)?.dependencies || [];
            for (const dep of dependencies) {
                visit(dep, [...path]);
            }

            // Mark as fully visited
            visiting.delete(key);
            visited.add(key);
        };

        // Visit all nodes
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
    private topologicalSort(): string[] {
        const result: string[] = [];
        const visited = new Set<string>();
        const visiting = new Set<string>();

        const visit = (key: string): void => {
            // If already processed, skip
            if (visited.has(key)) {
                return;
            }

            // If currently being visited, we have a cycle (should already be caught)
            if (visiting.has(key)) {
                throw new Error(
                    `Unexpected circular dependency involving ${key}`,
                );
            }

            // Mark as being visited
            visiting.add(key);

            // Visit all dependencies first
            const dependencies =
                this.dependencyGraph.get(key)?.dependencies || [];
            for (const dep of dependencies) {
                visit(dep);
            }

            // Mark as fully visited and add to result
            visiting.delete(key);
            visited.add(key);
            result.push(key);
        };

        // Visit all nodes
        for (const key of this.dependencyGraph.keys()) {
            if (!visited.has(key)) {
                visit(key);
            }
        }

        return result;
    }
}

/**
 * Helper function to extract parameter names from a constructor function
 * @param fn The service type constructor to parse
 * @returns Array of parameter names
 */
function getParamNames<T>(fn: ServiceType<T>): string[] {
    return getInjectKeys(fn.$inject ?? []);
}

function getInjectKeys(inject: (string | ServiceType<unknown>)[]): string[] {
    return inject.map((p) => {
        if (typeof p === "string") {
            return p;
        }

        return p.$injectKey;
    });
}
