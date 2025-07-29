import type { ServiceType } from "../services/service_provider.js";
export type InjectKey<T> = string | ServiceType<T>;
export declare function getKeyName(key: InjectKey<unknown>): string;
