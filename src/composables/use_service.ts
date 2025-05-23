import type { ServiceOrchestrator } from ../service_orchestrator";
import type { ServiceType } from "../service_provider";
import { useNuxtApp } from "nuxt/app";

export function useService<T>(target: ServiceType<T>): T {
    const nuxtApp = useNuxtApp();
    const serviceOrchestrator =
        nuxtApp.$serviceOrchestrator as ServiceOrchestrator;
    const serviceProvider = serviceOrchestrator.getProvider();

    return serviceProvider.resolve(target);
}
