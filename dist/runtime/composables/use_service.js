import { useNuxtApp } from "nuxt/app";
export function useService(target, ...args) {
  const nuxtApp = useNuxtApp();
  const serviceOrchestrator = nuxtApp.$serviceOrchestrator;
  const serviceProvider = serviceOrchestrator.getProvider();
  return serviceProvider.resolve(target, ...args);
}
export async function useServiceAsync(target, ...args) {
  const nuxtApp = useNuxtApp();
  const serviceOrchestrator = nuxtApp.$serviceOrchestrator;
  const serviceProvider = serviceOrchestrator.getProvider();
  return serviceProvider.resolveAsync(target, ...args);
}
