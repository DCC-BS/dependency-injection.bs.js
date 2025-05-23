import { addImportsDir, createResolver, defineNuxtModule } from "@nuxt/kit";

const module = defineNuxtModule({
    meta: {
        name: "dependency-injection.bs.js",
        configKey: "dependency-injection.bs.js",
    },
    // Default configuration options of the Nuxt module
    defaults: {},
    setup(_options, _nuxt) {
        const resolver = createResolver(import.meta.url);

        // Do not add the extension since the `.ts` will be transpiled to `.mjs` after `npm run prepack`

        // examples:
        addImportsDir(resolver.resolve("./runtime/composables"));
    },
});

import { ServiceOrchestrator } from "./service_orchestrator";
import type { IServiceProvider, ServiceType } from "./service_provider";
import type { IServiceProviderBuilder } from "./service_provider_builder";

export {
    module,
    ServiceOrchestrator,
    type IServiceProvider,
    type IServiceProviderBuilder,
};
