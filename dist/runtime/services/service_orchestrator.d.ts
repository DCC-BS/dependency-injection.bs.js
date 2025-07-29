import type { IServiceProvider } from "./service_provider.js";
import { type IServiceProviderBuilder } from "./service_provider_builder.js";
type ServiceProviderFactory = (builder: IServiceProviderBuilder) => void;
export declare class ServiceOrchestrator {
    private builderFactory;
    private serviceProvider;
    setup(builderFactory: ServiceProviderFactory): void;
    getProvider(): IServiceProvider;
}
export {};
