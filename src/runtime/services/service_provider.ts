import { getKeyName, type InjectKey } from "../helpers/helpers";

export interface ServiceType<T> {
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    new (...args: any[]): T;
    $injectKey: string;
    $inject: (string | ServiceType<unknown>)[];
}

export interface IServiceProvider {
    resolve<T>(target: ServiceType<T>): T;
    resolveNamed<T>(key: string): T;

    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    resolveFactory<T>(target: InjectKey<T>, ...args: any): T;

    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    resolveFactoryAsync<T>(target: InjectKey<T>, ...args: any): Promise<T>;
}

interface ServiceFactory<T> {
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    build: (...args: any[]) => T;
}

export class ServiceProvider
    extends Map<string, unknown>
    implements IServiceProvider
{
    public resolve<T>(target: ServiceType<T>): T {
        const key = target.$injectKey;

        const instance = this.get(key);
        if (!instance) {
            throw new Error(`Service ${key} not registered`);
        }

        return instance as T;
    }

    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    public resolveFactory<T>(target: InjectKey<T>, ...args: any[]): T {
        const instance = this.get(getKeyName(target)) as ServiceFactory<T>;
        return instance.build(args);
    }

    public resolveFactoryAsync<T>(
        target: InjectKey<T>,
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        ...args: any[]
    ): Promise<T> {
        const instance = this.get(getKeyName(target)) as ServiceFactory<
            Promise<T>
        >;
        if (!instance) {
            throw new Error(`Service factory ${target} not registered`);
        }

        return instance.build(args);
    }

    public resolveNamed<T>(key: string): T {
        const instance = this.get(key);
        if (!instance) {
            throw new Error(`Service ${key} not registered`);
        }
        return instance as T;
    }
}
