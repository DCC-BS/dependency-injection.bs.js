import { getKeyName, type InjectKey } from "../helpers/helpers";
import type { IServiceFactory } from "./service_factory";

export interface ServiceType<T> {
    new (...args: never[]): T;
    $injectKey: string;
    $inject: (string | ServiceType<unknown>)[];
}

export interface IServiceProvider {
    resolve<T>(target: InjectKey<T>, ...args: unknown[]): T;
    resolveAsync<T>(target: InjectKey<T>, ...args: unknown[]): Promise<T>;
}

export class ServiceProvider
    extends Map<string, IServiceFactory<unknown>>
    implements IServiceProvider
{
    public resolve<T>(target: InjectKey<T>, ...args: unknown[]): T {
        const key = getKeyName(target);

        const factory = this.get(key) as IServiceFactory<T>;
        if (!factory) {
            throw new Error(`Service ${key} not registered`);
        }

        return factory.build(...args);
    }

    public resolveAsync<T>(
        target: InjectKey<T>,
        ...args: unknown[]
    ): Promise<T> {
        const key = getKeyName(target);

        const factory = this.get(key) as IServiceFactory<Promise<T>>;
        if (!factory) {
            throw new Error(`Service ${key} not registered`);
        }

        return factory.build(args);
    }
}
