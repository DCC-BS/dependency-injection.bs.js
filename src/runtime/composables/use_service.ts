import { useNuxtApp } from "nuxt/app";
import type { ServiceOrchestrator } from "../services/service_orchestrator";
import type { ServiceType } from "../services/service_provider";
import type { InjectKey } from "../helpers/helpers";

export function useService<T>(target: ServiceType<T>): T {
    const nuxtApp = useNuxtApp();
    const serviceOrchestrator =
        nuxtApp.$serviceOrchestrator as ServiceOrchestrator;
    const serviceProvider = serviceOrchestrator.getProvider();

    return serviceProvider.resolve(target);
}

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export function createService<T>(target: InjectKey<T>, ...args: any[]): T {
    const nuxtApp = useNuxtApp();
    const serviceOrchestrator =
        nuxtApp.$serviceOrchestrator as ServiceOrchestrator;
    const serviceProvider = serviceOrchestrator.getProvider();

    return serviceProvider.resolveFromFactory(target, args);
}

export async function createServiceAsync<T>(
    target: InjectKey<T>,
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    ...args: any[]
): Promise<T> {
    const nuxtApp = useNuxtApp();
    const serviceOrchestrator =
        nuxtApp.$serviceOrchestrator as ServiceOrchestrator;
    const serviceProvider = serviceOrchestrator.getProvider();

    return serviceProvider.resolveFromFactoryAsync(target, args);
}
