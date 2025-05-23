import {
    type IServiceProviderBuilder,
    ServiceProviderBuilder,
} from "./service_provider_builder";
import type { IServiceProvider } from "./service_provider";

type ServiceProviderFactory = (builder: IServiceProviderBuilder) => void;

export class ServiceOrchestrator {
    private builderFactory: ServiceProviderFactory | undefined = undefined;
    private serviceProvider: IServiceProvider | undefined = undefined;

    public setup(builderFactory: ServiceProviderFactory): void {
        this.builderFactory = builderFactory;
    }

    public getProvider(): IServiceProvider {
        if (!this.serviceProvider) {
            if (!this.builderFactory) {
                throw new Error(
                    "ServiceOrchestrator is not set up. Call setup() first.",
                );
            }

            const builder = new ServiceProviderBuilder();
            this.builderFactory(builder);
            this.serviceProvider = builder.build();
        }
        return this.serviceProvider;
    }
}
