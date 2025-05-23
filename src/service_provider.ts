export interface ServiceType<T> {
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    new (...args: any[]): T;

    $injectKey: string;
}

export interface IServiceProvider {
    resolve<T>(target: ServiceType<T>): T;
}

export class ServiceProvider
    extends Map<string, unknown>
    implements IServiceProvider
{
    public registerInstance<T>(target: ServiceType<T>, instance: T): void {
        const key = target.$injectKey;
        if (this.has(key)) {
            throw new Error(`Service ${key} already registered`);
        }
        this.set(key, instance);
    }

    public register<T>(target: ServiceType<T>): void {
        const key = target.$injectKey;
        if (this.has(key)) {
            throw new Error(`Service ${key} already registered`);
        }

        const ctorParamNames = getParamNames(target);

        const injections = ctorParamNames.map((name: string) =>
            this.resolveNamed(name),
        );
        const instance = new target(...injections);
        this.set(key, instance);
    }

    public resolve<T>(target: ServiceType<T>): T {
        const key = target.$injectKey;

        let instance = this.get(key);
        if (!instance) {
            const ctorParamNames = getParamNames(target);

            const injections = ctorParamNames.map((name: string) =>
                this.resolveNamed(name),
            );

            instance = new target(...injections);
            this.set(key, instance);
        }

        return instance as T;
    }

    private resolveNamed<T>(key: string): T {
        const instance = this.get(key);
        if (!instance) {
            throw new Error(`Service ${key} not registered`);
        }
        return instance as T;
    }
}

function getParamNames<T>(fn: ServiceType<T>): string[] {
    const str = fn.toString();
    const params = str.match(/constructor\s*\(([^)]*)\)/)?.[1] || "";
    return params
        .split(",")
        .map((p) => p.trim())
        .filter(Boolean);
}
