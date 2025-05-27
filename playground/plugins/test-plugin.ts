import { defineNuxtPlugin } from "nuxt/app";
import type { AppConfig } from "nuxt/schema";
import { getServiceB, ServiceA, ServiceB, ServiceC } from "~/services/ServiceABC";

export default defineNuxtPlugin((nuxtApp) => {    
    const orchestrator = new ServiceOrchestrator();

    orchestrator.setup(async (builder) => {
        builder.register(ServiceA);

        
        builder.registerAsyncFactory(async (serviceA: ServiceA, appConfig: AppConfig) => {
            return await getServiceB(serviceA, appConfig);
        }, [ServiceA], ServiceB);

        // builder.register(ServiceC);
    });

    nuxtApp.provide("serviceOrchestrator", orchestrator);
});
