import {
  ServiceProviderBuilder
} from "./service_provider_builder.js";
export class ServiceOrchestrator {
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
