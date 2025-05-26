import { useNuxtApp } from "nuxt/app";
export function useService(target) {
  const nuxtApp = useNuxtApp();
  const serviceOrchestrator = nuxtApp.$serviceOrchestrator;
  const serviceProvider = serviceOrchestrator.getProvider();
  return serviceProvider.resolve(target);
}
export function createService(target, ...args) {
  const nuxtApp = useNuxtApp();
  const serviceOrchestrator = nuxtApp.$serviceOrchestrator;
  const serviceProvider = serviceOrchestrator.getProvider();
  return serviceProvider.resolveFactory(target, args);
}
export async function createServiceAsync(target, ...args) {
  const nuxtApp = useNuxtApp();
  const serviceOrchestrator = nuxtApp.$serviceOrchestrator;
  const serviceProvider = serviceOrchestrator.getProvider();
  return serviceProvider.resolveFactoryAsync(target, args);
}
