import { useNuxtApp } from "nuxt/app";
import type { ServiceOrchestrator } from "../services/service_orchestrator";
import type { ServiceType } from "../services/service_provider";

export function useService<T>(target: ServiceType<T>, ...args: any[]): T {
    const nuxtApp = useNuxtApp();
    const serviceOrchestrator =
        nuxtApp.$serviceOrchestrator as ServiceOrchestrator;
    const serviceProvider = serviceOrchestrator.getProvider();

    return serviceProvider.resolve(target, ...args);
}

export async function useServiceAsync<T>(
    target: ServiceType<T>,
    ...args: any[]
): Promise<T> {
    const nuxtApp = useNuxtApp();
    const serviceOrchestrator =
        nuxtApp.$serviceOrchestrator as ServiceOrchestrator;
    const serviceProvider = serviceOrchestrator.getProvider();

    return serviceProvider.resolveAsync(target, ...args);
}
