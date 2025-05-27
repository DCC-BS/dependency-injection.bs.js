/**
 * Class for building and validating service dependency graphs
 * Handles registration of services and their dependencies
 */
import { type InjectKey } from "../helpers/helpers.js";
import { type IServiceProvider, type ServiceType } from "./service_provider.js";
export interface IServiceProviderBuilder {
    /**
     * Register an instance of a service with no dependencies
     */
    registerInstance<T>(target: ServiceType<T>, instance: T): void;
    registerNamedInstance<T>(name: string, instance: T): void;
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
    registerFactory<T>(factory: (...args: any[]) => T, inject: InjectKey<unknown>[], key: InjectKey<T>): void;
    /**
     * Register an asynchronous factory function that builds a service instance
     * @param factory The factory function to create the service
     * @param inject Dependencies required by the factory
     * @param key Unique key for the service
     * */
    registerAsyncFactory<T>(factory: (...args: any[]) => Promise<T>, inject: InjectKey<unknown>[], key: InjectKey<T>): void;
    build(): IServiceProvider;
}
/**
 * Builder class for constructing a dependency graph of services
 * Allows for validation that all required dependencies are properly registered
 */
export declare class ServiceProviderBuilder implements IServiceProviderBuilder {
    /**
     * Map of service injection keys to their dependency nodes
     */
    private dependencyGraph;
    /**
     * Map of service keys to instances for quick lookup
     */
    private instances;
    get registerdKeys(): string[];
    /**
     * Register a service instance directly
     * This service is considered to have no dependencies
     * @param target The service type to register
     * @param instance The instance of the service
     */
    registerInstance<T>(target: ServiceType<T>, instance: T): void;
    registerNamedInstance<T>(name: string, instance: T): void;
    /**
     * Register a service type for later instantiation
     * This extracts dependencies from constructor parameters
     * @param target The service type to register
     */
    register<T>(target: ServiceType<T>): void;
    registerFactory<T>(factory: (...args: any[]) => T, inject: InjectKey<unknown>[], key: InjectKey<T>): void;
    registerAsyncFactory<T>(factory: (...args: any[]) => Promise<T>, inject: InjectKey<unknown>[], key: InjectKey<T>): void;
    /**
     * Get the dependency graph representation for visualization or analysis
     * @returns Simplified dependency graph showing services and their dependencies
     */
    getDependencyGraph(): Record<string, string[]>;
    /**
     * Build the service provider by validating and resolving dependencies
     * @returns Map of service keys to their instances
     * @throws Error if any dependencies are missing or circular dependencies exist
     */
    build(): IServiceProvider;
    /**
     * Check if all dependencies referenced by services are registered
     * @throws Error if any dependencies are missing
     */
    private validateDependenciesExist;
    /**
     * Detect circular dependencies in the dependency graph
     * @throws Error if circular dependencies are detected
     */
    private detectCircularDependencies;
    /**
     * Sort the services in dependency order using topological sort
     * @returns Array of service keys in dependency order
     */
    private topologicalSort;
}
