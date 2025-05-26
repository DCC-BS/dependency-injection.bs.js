import type { ServiceType } from "../services/service_provider.js";
export declare function useService<T>(target: ServiceType<T>): T;
export declare function createService<T>(target: string, ...args: any[]): T;
export declare function createServiceAsync<T>(target: string, ...args: any[]): Promise<T>;
