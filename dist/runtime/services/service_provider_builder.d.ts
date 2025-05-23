/**
 * Class for building and validating service dependency graphs
 * Handles registration of services and their dependencies
 */
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
