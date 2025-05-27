import type { ServiceType } from "../services/service_provider";

export type InjectKey<T> = string | ServiceType<T>;

export function getKeyName(key: InjectKey<unknown>): string {
    if (typeof key === "string") {
        return key;
    }

    return key.$injectKey;
}
