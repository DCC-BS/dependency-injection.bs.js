import * as _nuxt_schema from '@nuxt/schema';

interface ServiceType<T> {
    new (...args: any[]): T;
    $injectKey: string;
}
interface IServiceProvider {
    resolve<T>(target: ServiceType<T>): T;
    resolveNamed<T>(key: string): T;
}

/**
 * Class for building and validating service dependency graphs
 * Handles registration of services and their dependencies
 */

interface IServiceProviderBuilder {
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

type ServiceProviderFactory = (builder: IServiceProviderBuilder) => void;
declare class ServiceOrchestrator {
    private builderFactory;
    private serviceProvider;
    setup(builderFactory: ServiceProviderFactory): void;
    getProvider(): IServiceProvider;
}

declare const _default: _nuxt_schema.NuxtModule<_nuxt_schema.ModuleOptions, _nuxt_schema.ModuleOptions, false>;

export { ServiceOrchestrator, _default as default };
export type { IServiceProvider, IServiceProviderBuilder, ServiceType };
