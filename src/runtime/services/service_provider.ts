import { getKeyName, type InjectKey } from "../helpers/helpers";
import type { IServiceFactory } from "./service_factory";

export interface ServiceType<T> {
    new (...args: any[]): T;
    $injectKey: string;
    $inject: (string | ServiceType<unknown>)[];
}

export interface IServiceProvider {
    resolve<T>(target: InjectKey<T>, ...args: any[]): T;
    resolveAsync<T>(target: InjectKey<T>, ...args: any[]): Promise<T>;
}

export class ServiceProvider
    extends Map<string, IServiceFactory<unknown>>
    implements IServiceProvider
{
    public resolve<T>(target: InjectKey<T>, ...args: any[]): T {
        const key = getKeyName(target);

        const factory = this.get(key) as IServiceFactory<T>;
        if (!factory) {
            throw new Error(`Service ${key} not registered`);
        }

        return factory.build(args);
    }

    public resolveAsync<T>(target: InjectKey<T>, ...args: any[]): Promise<T> {
        const key = getKeyName(target);

        const factory = this.get(key) as IServiceFactory<Promise<T>>;
        if (!factory) {
            throw new Error(`Service ${key} not registered`);
        }

        return factory.build(args);
    }
}
