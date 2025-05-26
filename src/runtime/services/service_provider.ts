export interface ServiceType<T> {
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    new (...args: any[]): T;
    $injectKey: string;
    $inject: string[];
}

export interface IServiceProvider {
    resolve<T>(target: ServiceType<T>): T;
    resolveNamed<T>(key: string): T;
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

    public resolveNamed<T>(key: string): T {
        const instance = this.get(key);
        if (!instance) {
            throw new Error(`Service ${key} not registered`);
        }
        return instance as T;
    }
}
