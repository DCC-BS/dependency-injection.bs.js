import type { ServiceType } from "../services/service_provider.js";
export declare function useService<T>(target: ServiceType<T>): T;
