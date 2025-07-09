import type { ServiceType } from "../services/service_provider.js";
export declare function useService<T>(target: ServiceType<T>, ...args: any[]): T;
export declare function useServiceAsync<T>(target: ServiceType<T>, ...args: any[]): Promise<T>;
