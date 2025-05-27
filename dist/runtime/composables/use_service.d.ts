import type { ServiceType } from "../services/service_provider.js";
import type { InjectKey } from "../helpers/helpers.js";
export declare function useService<T>(target: ServiceType<T>): T;
export declare function createService<T>(target: InjectKey<T>, ...args: any[]): T;
export declare function createServiceAsync<T>(target: InjectKey<T>, ...args: any[]): Promise<T>;
