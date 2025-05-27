import type { ServiceType } from "./service_provider.js";
export type ServiceLifetime = "singleton" | "transient";
/**
 * Represents a node in the dependency graph
 */
export interface DependencyNode<T> {
    /**
     * The service type that this node represents
     */
    serviceType?: ServiceType<T>;
    /**
     * Names of dependencies required by this service
     */
    dependencies: string[];
    /**
     * Whether the service has been instantiated and registered
     */
    isRegistered: boolean;
    isFactory: boolean;
    /**
     * The actual instance of the service (if registered)
     */
    instance?: T;
    /**
     * Optional factory function to create the service instance
     * Used for services that are built via a factory
     */
    lifetime: ServiceLifetime;
}
