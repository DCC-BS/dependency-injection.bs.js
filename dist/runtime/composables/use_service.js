import { useNuxtApp } from "nuxt/app";
export function useService(target) {
  const nuxtApp = useNuxtApp();
  const serviceOrchestrator = nuxtApp.$serviceOrchestrator;
  const serviceProvider = serviceOrchestrator.getProvider();
  return serviceProvider.resolve(target);
}
